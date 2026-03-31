import { Notice } from 'obsidian';

export class NoticeManager {
  private readonly lastShown = new Map<string, number>();

  constructor(private readonly cooldownMs = 5000) {}

  info(message: string, key = message): void {
    this.show(message, key);
  }

  error(message: string, key = message): void {
    this.show(message, key);
  }

  private show(message: string, key: string): void {
    const now = Date.now();
    const last = this.lastShown.get(key) ?? 0;
    if (now - last < this.cooldownMs) {
      return;
    }

    this.lastShown.set(key, now);
    new Notice(message);
  }
}
