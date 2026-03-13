import { appendFile, mkdir } from 'fs/promises';
import path from 'path';

type Provider = 'gemini' | 'openai';

interface ApiRequestLogEntry {
  provider: Provider;
  model: string;
  sessionId: number | null;
  userId: number;
  payload: unknown;
}

const LOG_FILE_PATH = path.join(process.cwd(), 'logs', 'api-requests.log');

export async function logDevApiRequest(entry: ApiRequestLogEntry) {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    await mkdir(path.dirname(LOG_FILE_PATH), { recursive: true });
    const logLine = JSON.stringify({
      timestamp: new Date().toISOString(),
      ...entry,
    });

    await appendFile(LOG_FILE_PATH, `${logLine}\n`, 'utf8');
  } catch (error) {
    console.error('Failed to write API request log:', error);
  }
}
