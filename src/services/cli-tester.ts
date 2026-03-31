import { ScanResult } from '../types';

export async function testSyncthingCli(cliPath: string): Promise<ScanResult> {
  const trimmed = cliPath.trim();
  if (!trimmed) {
    return { ok: false, status: 0, message: 'Missing CLI path.' };
  }

  return {
    ok: false,
    status: 0,
    message:
      'CLI test is not available in this runtime. Use API test instead, or run the CLI manually in a shell.',
  };
}
