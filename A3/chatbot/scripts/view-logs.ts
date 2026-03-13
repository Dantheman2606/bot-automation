import { readFileSync, existsSync } from 'fs';
import path from 'path';

type Provider = 'openai' | 'gemini';

interface LogEntry {
  timestamp: string;
  provider: Provider;
  model: string;
  sessionId: number | null;
  userId: number;
  payload: {
    model?: string;
    message?: string;
    history?: unknown[];
    messages?: Array<{ role: string; content: string }>;
    [key: string]: unknown;
  };
}

interface CliOptions {
  filePath: string;
  provider?: Provider;
  model?: string;
  sessionId?: number;
  limit: number;
  pretty: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    filePath: path.join(process.cwd(), 'logs', 'api-requests.log'),
    limit: 30,
    pretty: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--file' && argv[i + 1]) {
      options.filePath = path.resolve(process.cwd(), argv[i + 1]);
      i += 1;
      continue;
    }

    if (arg === '--provider' && argv[i + 1]) {
      const value = argv[i + 1] as Provider;
      if (value === 'openai' || value === 'gemini') {
        options.provider = value;
      }
      i += 1;
      continue;
    }

    if (arg === '--model' && argv[i + 1]) {
      options.model = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--session' && argv[i + 1]) {
      const parsed = Number(argv[i + 1]);
      if (!Number.isNaN(parsed)) {
        options.sessionId = parsed;
      }
      i += 1;
      continue;
    }

    if (arg === '--limit' && argv[i + 1]) {
      const parsed = Number(argv[i + 1]);
      if (!Number.isNaN(parsed) && parsed > 0) {
        options.limit = parsed;
      }
      i += 1;
      continue;
    }

    if (arg === '--pretty') {
      options.pretty = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: npm run logs:view -- [options]

Options:
  --file <path>         Read a specific JSONL log file
  --provider <name>     Filter provider: openai | gemini
  --model <name>        Filter exact model id
  --session <id>        Filter session id
  --limit <n>           Show last n matching entries (default: 30)
  --pretty              Print full request payload in formatted JSON
  --help, -h            Show this help

Examples:
  npm run logs:view
  npm run logs:view -- --provider openai --limit 10
  npm run logs:view -- --session 10 --pretty
`);
}

function readJsonLines(filePath: string): LogEntry[] {
  if (!existsSync(filePath)) {
    throw new Error(`Log file not found: ${filePath}`);
  }

  const raw = readFileSync(filePath, 'utf8');
  const lines = raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const entries: LogEntry[] = [];
  for (const [index, line] of lines.entries()) {
    try {
      entries.push(JSON.parse(line) as LogEntry);
    } catch {
      console.warn(`Skipping invalid JSON at line ${index + 1}`);
    }
  }

  return entries;
}

function applyFilters(entries: LogEntry[], options: CliOptions): LogEntry[] {
  return entries.filter(entry => {
    if (options.provider && entry.provider !== options.provider) return false;
    if (options.model && entry.model !== options.model) return false;
    if (options.sessionId !== undefined && entry.sessionId !== options.sessionId) return false;
    return true;
  });
}

function printSummary(entries: LogEntry[]) {
  const rows = entries.map(entry => ({
    timestamp: entry.timestamp,
    provider: entry.provider,
    model: entry.model,
    sessionId: entry.sessionId,
    userId: entry.userId,
    messageCount: Array.isArray(entry.payload?.messages)
      ? entry.payload.messages.length
      : Array.isArray(entry.payload?.history)
      ? entry.payload.history.length + (entry.payload?.message ? 1 : 0)
      : 0,
  }));

  console.table(rows);
}

function printPretty(entries: LogEntry[]) {
  for (const entry of entries) {
    console.log('='.repeat(88));
    console.log(`${entry.timestamp} | ${entry.provider} | ${entry.model} | session=${entry.sessionId}`);
    console.log('-'.repeat(88));
    console.log(JSON.stringify(entry.payload, null, 2));
  }
  if (entries.length > 0) {
    console.log('='.repeat(88));
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const entries = readJsonLines(options.filePath);
  const filtered = applyFilters(entries, options);
  const limited = filtered.slice(-options.limit);

  if (limited.length === 0) {
    console.log('No matching log entries found.');
    return;
  }

  console.log(`Loaded ${entries.length} entries, showing ${limited.length} after filters.`);

  if (options.pretty) {
    printPretty(limited);
  } else {
    printSummary(limited);
  }
}

main();
