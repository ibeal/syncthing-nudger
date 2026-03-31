import { TAbstractFile, TFile } from 'obsidian';
import SyncthingNudgerPlugin from '../main';
import { registerDeleteTrigger } from '../triggers/on-delete';
import { registerModifyTrigger } from '../triggers/on-modify';
import { registerOpenTrigger } from '../triggers/on-open';
import { registerRenameTrigger } from '../triggers/on-rename';

export class TriggerManager {
  private readonly pendingModifyScans = new Map<string, number>();

  constructor(private readonly plugin: SyncthingNudgerPlugin) {}

  register(): void {
    registerOpenTrigger(this.plugin, async (file) => {
      await this.plugin.scanPath(file.path, 'open');
    });

    registerModifyTrigger(this.plugin, (file) => {
      this.scheduleModifyScan(file);
    });

    registerRenameTrigger(this.plugin, async (file, oldPath) => {
      await this.plugin.scanRename(file.path, oldPath);
    });

    registerDeleteTrigger(this.plugin, async (file) => {
      await this.plugin.scanDelete(file.path);
    });
  }

  private scheduleModifyScan(file: TFile): void {
    if (!this.plugin.settings.triggers.modify) {
      return;
    }

    const path = file.path;
    const existing = this.pendingModifyScans.get(path);
    if (existing) {
      window.clearTimeout(existing);
    }

    const timeoutMs = Math.max(0.2, this.plugin.settings.debounceSeconds) * 1000;
    const timerId = window.setTimeout(() => {
      this.pendingModifyScans.delete(path);
      void this.plugin.scanPath(path, 'modify');
    }, timeoutMs);

    this.pendingModifyScans.set(path, timerId);
  }

  clearPending(): void {
    for (const timerId of this.pendingModifyScans.values()) {
      window.clearTimeout(timerId);
    }
    this.pendingModifyScans.clear();
  }

  static asFile(file: TAbstractFile | null): TFile | null {
    return file instanceof TFile ? file : null;
  }
}
