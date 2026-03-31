/* eslint-disable obsidianmd/ui/sentence-case */
import { App, PluginSettingTab, Setting } from 'obsidian';
import SyncthingNudgerPlugin from '../main';

export class SyncthingNudgerSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: SyncthingNudgerPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    const detected = this.plugin.getDetectedFolder();

    new Setting(containerEl)
      .setName('Enable plugin')
      .setDesc('Globally enable or disable all syncthing nudges.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enabled).onChange(async (value) => {
          this.plugin.settings.enabled = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Syncthing api url')
      .setDesc('Example: http://127.0.0.1:8384')
      .addText((text) =>
        text
          .setPlaceholder('http://127.0.0.1:8384')
          .setValue(this.plugin.settings.apiUrl)
          .onChange(async (value) => {
            this.plugin.settings.apiUrl = value.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Syncthing api key')
      .setDesc('Stored locally in plugin settings.')
      .addText((text) =>
        text
          .setPlaceholder('api key')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Detected folder id')
      .setDesc(detected.ok ? detected.folderId ?? 'Unknown' : detected.message)
      .addText((text) => {
        text.setValue(detected.ok ? (detected.folderId ?? '') : 'Not detected');
        text.setDisabled(true);
      });

    new Setting(containerEl)
      .setName('Detected folder path')
      .setDesc('Resolved from Syncthing config by matching this vault path.')
      .addText((text) => {
        text.setValue(detected.ok ? (detected.folderPath ?? '') : 'Not detected');
        text.setDisabled(true);
      });

    new Setting(containerEl)
      .setName('Refresh folder detection')
      .setDesc('Query Syncthing config again and rematch this vault path.')
      .addButton((button) =>
        button.setButtonText('Re-detect folder').onClick(async () => {
          await this.plugin.refreshFolderDetection(true);
          this.display();
        }),
      );

    new Setting(containerEl)
      .setName('Debounce duration (seconds)')
      .setDesc('Modify events are collapsed into one scan per file over this interval.')
      .addText((text) =>
        text
          .setPlaceholder('2')
          .setValue(String(this.plugin.settings.debounceSeconds))
          .onChange(async (value) => {
            const parsed = Number(value);
            if (Number.isFinite(parsed) && parsed >= 0.2) {
              this.plugin.settings.debounceSeconds = parsed;
              await this.plugin.saveSettings();
            }
          }),
      );

    new Setting(containerEl)
      .setName('Debug logging')
      .setDesc('Log trigger and api activity to the developer console.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.debugLogging).onChange(async (value) => {
          this.plugin.settings.debugLogging = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl).setName('Triggers').setHeading();
    this.addTriggerToggle(containerEl, 'Open file trigger', 'openFile');
    this.addTriggerToggle(containerEl, 'Modify trigger (debounced)', 'modify');
    this.addTriggerToggle(containerEl, 'Rename trigger', 'rename');
    this.addTriggerToggle(containerEl, 'Delete trigger', 'delete');

    new Setting(containerEl).setName('Diagnostics').setHeading();

    new Setting(containerEl)
      .setName('Test api')
      .setDesc('Check connectivity and authentication for the syncthing rest api.')
      .addButton((button) =>
        button.setButtonText('Test api').onClick(async () => {
          await this.plugin.runApiTest(true);
          this.display();
        }),
      );

  }

  private addTriggerToggle(
    containerEl: HTMLElement,
    name: string,
    key: 'openFile' | 'modify' | 'rename' | 'delete',
  ): void {
    new Setting(containerEl).setName(name).addToggle((toggle) =>
      toggle.setValue(this.plugin.settings.triggers[key]).onChange(async (value) => {
        this.plugin.settings.triggers[key] = value;
        await this.plugin.saveSettings();
      }),
    );
  }
}
