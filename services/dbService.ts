import { AnalysisResult, DatabaseRecord } from '../types';
import { MOCK_DB_DELAY_MS } from '../constants';

// Simulating a Postgres Database interaction
export const saveToPostgres = async (data: AnalysisResult): Promise<DatabaseRecord> => {
  console.log("Connecting to Postgres (Mock)...");
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const record: DatabaseRecord = {
        id: crypto.randomUUID(),
        uploadDate: new Date().toISOString(),
        pidData: data,
        synced: true
      };
      
      console.log("INSERT INTO pid_records (id, data, created_at) VALUES ...", record);
      console.log("Data successfully committed to Postgres.");
      resolve(record);
    }, MOCK_DB_DELAY_MS);
  });
};