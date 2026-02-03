import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PidComponent, ComponentStatus } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Piping and Instrumentation Diagram (P&ID) analyzer for UAE industrial sectors (ADNOC/ADPP standards).

**CRITICAL MISSION:**
Your goal is to digitize the ENTIRE diagram. You must identify EVERY single component, no matter how small. 
A typical P&ID contains 20-100 items. If you only find 5-10, you have FAILED.

**DETECTION CHECKLIST:**
1. **Valves**: Gate, Globe, Ball, Check, Butterfly, Safety Relief (PSV), Control Valves (CV). Look for every valve symbol on every line.
2. **Instruments**: All bubbles (Circles with letters). PI (Pressure Indicator), TI, TT, PT, LT, LG, FT, FIC, PIC.
3. **Equipment**: Pumps (P-...), Vessels (V-...), Tanks (T-...), Heat Exchangers (E-...).
4. **Piping Components**: Flanges, Reducers, Spectacle Blinds, Strainers.
5. **Line Numbers**: If a line number is distinct, treat it as a component if relevant for maintenance.

**DATA EXTRACTION RULES:**
- **ID**: OCR the text tag exactly (e.g., "HV-101", "P-1002A"). If the text is rotated or vertically oriented, read it carefully. If no tag exists, create a descriptive ID (e.g., "VALVE-LINE-01").
- **Coordinates**: X/Y percentages (0-100) where (0,0) is Top-Left and (100,100) is Bottom-Right. Be precise.
- **UAE Standards**: Add a relevant maintenance note for the UAE climate (high heat/humidity/sand/salinity).

Output must be a JSON array.
`;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const parseResponse = (response: any): PidComponent[] => {
    let jsonString = response.text || "[]";
    
    // SANITIZATION: Remove Markdown code blocks if the model adds them
    jsonString = jsonString.replace(/^```json\s*/, "").replace(/```$/, "").trim();

    // Fallback: Sometimes strict schema might fail to enforce non-markdown text, so we clean again if needed
    if (jsonString.startsWith('```')) {
         jsonString = jsonString.split('\n').slice(1, -1).join('\n');
    }

    try {
      const rawComponents = JSON.parse(jsonString) as Partial<PidComponent>[];
      
      // Hydrate with defaults and strictly validate coordinates
      return rawComponents.map(c => ({
        id: c.id || `UNK-${Math.random().toString(36).substr(2, 4)}`,
        type: c.type || 'Unknown Component',
        label: c.label || '',
        description: c.description || '',
        // Ensure coordinates are numbers and within bounds
        coordinates: {
            x: typeof c.coordinates?.x === 'number' ? Math.max(0, Math.min(100, c.coordinates.x)) : 50,
            y: typeof c.coordinates?.y === 'number' ? Math.max(0, Math.min(100, c.coordinates.y)) : 50
        },
        initialStatus: c.initialStatus || ComponentStatus.UNKNOWN,
        currentStatus: c.initialStatus || ComponentStatus.UNKNOWN,
        uaeStandardNote: c.uaeStandardNote || 'No specific note.',
      })) as PidComponent[];

    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.log("Raw Text:", jsonString);
      throw new Error("Failed to parse AI response. The P&ID might be too complex or the result was malformed.");
    }
};

const callModelWithRetry = async (modelName: string, contents: any, config: any, retries = 3) => {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempting analysis with model: ${modelName} (Attempt ${i + 1}/${retries})`);
            return await ai.models.generateContent({
                model: modelName,
                contents,
                config
            });
        } catch (e: any) {
            lastError = e;
            // Check for 429 (Too Many Requests / Quota Exceeded) or 503 (Service Unavailable)
            const isTransientError = e.status === 429 || e.code === 429 || (e.message && e.message.includes('429')) || e.status === 503;
            
            if (isTransientError && i < retries - 1) {
                const waitTime = Math.pow(2, i) * 1500 + Math.random() * 1000;
                console.warn(`Error ${e.status || 'unknown'} on ${modelName}. Retrying in ${Math.round(waitTime)}ms...`);
                await delay(waitTime);
                continue;
            }
            throw e;
        }
    }
    throw lastError;
};

export const analyzePidImage = async (base64Image: string, mimeType: string): Promise<PidComponent[]> => {
  const contents = {
    parts: [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      },
      {
        text: "Scan this P&ID image pixel-by-pixel. List EVERY component found. Do not summarize. I expect a complete inventory of Valves, Instruments, and Equipment with precise coordinates."
      }
    ]
  };

  const config = {
    thinkingConfig: { thinkingBudget: 512 }, // Keeping the optimized budget
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0, 
    seed: 42,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING },
          label: { type: Type.STRING },
          description: { type: Type.STRING },
          coordinates: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER, description: "X percentage 0-100 from left" },
              y: { type: Type.NUMBER, description: "Y percentage 0-100 from top" }
            },
            required: ["x", "y"]
          },
          initialStatus: { 
            type: Type.STRING, 
            enum: [
              ComponentStatus.OPERATIONAL, 
              ComponentStatus.MAINTENANCE_REQUIRED, 
              ComponentStatus.CRITICAL_REPAIR,
              ComponentStatus.UNKNOWN
            ] 
          },
          uaeStandardNote: { type: Type.STRING, description: "Compliance note based on UAE standards" }
        },
        required: ["id", "type", "coordinates", "initialStatus", "uaeStandardNote"]
      }
    }
  };

  try {
    // Strategy: Try the Pro model first for best results.
    // If it fails with a quota error (429), fallback to the Flash model which has higher limits.
    try {
        const response = await callModelWithRetry('gemini-3-pro-preview', contents, config);
        return parseResponse(response);
    } catch (error: any) {
        const isQuotaError = error.status === 429 || error.code === 429 || (error.message && error.message.includes('429'));
        
        if (isQuotaError) {
            console.warn("Primary model (gemini-3-pro-preview) quota exhausted. Falling back to gemini-3-flash-preview.");
            // Flash is faster and has higher rate limits
            const response = await callModelWithRetry('gemini-3-flash-preview', contents, config);
            return parseResponse(response);
        }
        
        throw error;
    }
  } catch (error) {
    console.error("Gemini Analysis Failed after retries and fallback:", error);
    throw error;
  }
};