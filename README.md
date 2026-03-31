# Syncthing Trigger (Obsidian plugin)

Syncthing Trigger is a lightweight Obsidian plugin that **nudges your local Syncthing instance** to scan targeted paths at natural editing boundaries.

It focuses on one job:
- trigger narrow Syncthing scans (file/folder hints), especially after debounced edits,
- without handling conflict resolution, merges, or Syncthing daemon management.

## Why this plugin exists

Syncthing can feel slightly delayed when notes change rapidly. This plugin improves responsiveness by requesting targeted scans when it is most useful:
- file open,
- debounced file modify,
- rename,
- delete,
- and manual command triggers.

## Features

- Desktop-first integration with local Syncthing REST API.
- Automatic Syncthing folder ID detection from the current vault path via Syncthing config.
- Debounced modify trigger (core behavior).
- Rename and delete scan hints (old/new and parent contexts).
- Optional open-file trigger.
- Settings UI for API URL, API key, detected folder diagnostics, trigger toggles, debounce seconds, debug logging, and optional CLI path.
- Diagnostic actions and commands:
  - **Scan current file**
  - **Scan current folder**
  - **Test Syncthing API connection**
  - **Test Syncthing CLI connection**
- Graceful mobile behavior:
  - plugin loads,
  - shows unsupported notice,
  - performs no operational triggers/commands.

## Setup

1. Install and run Syncthing locally.
2. Install this plugin in your vault.
3. Open **Settings → Community plugins → Syncthing Trigger**.
4. Configure:
   - Syncthing API URL (default `http://127.0.0.1:8384`)
   - Syncthing API key
   - Debounce duration
   - Trigger toggles
5. Click **Test API** to verify connectivity and folder auto-detection.

## Folder auto-detection model

The plugin resolves folder ID using Syncthing config:
1. Read the vault absolute path from the desktop file-system adapter.
2. Query Syncthing `/rest/config` for configured folders.
3. Match vault path against Syncthing folder paths (normalized path comparison).
4. Use the matched folder ID for all scan requests.

If detection fails, settings and API diagnostics show actionable errors (unreachable/auth/no-match/ambiguous/path unavailable).

## Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Test:

```bash
npm run test
```

## Manual install for testing

Copy the following files to:

`<Vault>/.obsidian/plugins/syncthing-nudger/`

- `manifest.json`
- `main.js`
- `styles.css` (if used)

Reload Obsidian and enable the plugin in **Settings → Community plugins**.

## Notes

- This plugin does **not** replace Syncthing.
- This plugin does **not** implement merge/conflict resolution.
- This plugin does **not** modify note contents.

## Release

Tag-based GitHub Actions release is configured. On a version tag (`0.1.0`, no `v` prefix), CI builds, lints, tests, and publishes release assets:

- `manifest.json`
- `main.js`
- `styles.css`
- `versions.json`
