# P&ID Master UAE

An intelligent Piping and Instrumentation Diagram (P&ID) digitization and analysis tool tailored for UAE industrial standards (ADNOC/ADPP).

## Features

- **AI-Powered Analysis**: Uses Google Gemini 1.5 Pro/Flash to identify valves, instruments, equipment, and piping components.
- **UAE Compliance**: Checks components against specific UAE environmental and maintenance standards.
- **Interactive Dashboard**: View original diagrams with overlay markers for identified components.
- **Status Management**: Track operational status (Operational, Maintenance Required, Critical Repair).
- **Postgres Integration**: Simulates syncing data to a corporate database.
- **PDF Support**: Automatically converts and processes PDF drawings.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS
- **AI**: Google Gemini API (`@google/genai`)
- **PDF Processing**: PDF.js
- **Icons**: Custom SVG components

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file and add your Google Gemini API key:
   ```
   API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   npm start
   ```

## Usage

1. **Login**: Use the demo credentials (`admin` / `password123`).
2. **Upload**: Select a P&ID image or PDF file.
3. **Analyze**: Wait for the AI to process the diagram.
4. **Review**: Inspect the interactive map and update component statuses in the table.
