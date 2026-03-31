import { Platform } from 'obsidian';

export function isMobileRuntime(): boolean {
  return Platform.isMobile || Platform.isMobileApp;
}
