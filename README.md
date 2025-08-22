# YouTube Ad Accelerator — Chrome Extension

![Extension Logo](./icons/icon128.png)

A lightweight Chrome extension that **automatically skips/mutes/accelerates skippable YouTube ads** and now optionally integrates with SponsorBlock to skip community-submitted sponsor segments. This README reflects the updated master branch (UI improvements, SponsorBlock integration, code optimizations and more).

---

## Table of Contents

- [What’s new (quick)](#whats-new-quick)
- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Options & customization](#options--customization)
- [Privacy & permissions](#privacy--permissions)
- [Development & contributing](#development--contributing)
- [Troubleshooting](#troubleshooting)
- [Changelog (high level)](#changelog-high-level)
- [Credits & links](#credits--links)
- [License & contact](#license--contact)

---

## What’s new (quick)

- Refreshed popup/options UI with clearer toggles, tooltips, and toast confirmation system.
- **SponsorBlock** integration (optional) — skip sponsor/intros/outros segments using the SponsorBlock public API.
- Several code optimizations: lower CPU usage, smarter ad detection, debounced observers, and reduced polling.
- More flexible per-site/whitelist controls and granular skip settings.

---

## Overview

YouTube Ad Accelerator does **not** block ads at the network level. Instead it automates actions in the YouTube player to make ad-watching less disruptive:

- Clicks the **Skip Ad** button the moment it becomes available.
- Mutes ads automatically (optional).
- Temporarily increases playback rate for ad videos (optional).
- Optionally queries SponsorBlock to skip community-submitted sponsor segments and other categories.

This makes the viewing experience faster without interfering with YouTube’s ad delivery.

---

## Features

- Auto-detects skippable YouTube ads and presses **Skip**.
- Auto-mute while an ad plays (configurable).
- Temporary ad acceleration (choose playback speed for ad segments).
- **SponsorBlock integration** — skip sponsor/intros/outros/highlight segments reported by the community (configurable categories).
- Popup UI to toggle behavior per-tab or globally.
- Whitelist/blacklist support (disable the extension on selected channels/sites).
- Lightweight background processing with optimized ad detection (reduced CPU and memory footprint).
- Toast notifications in the popup (no intrusive `alert()` popups).

---

## Installation

### From source (developer / manual)

1. Clone the repo:

```bash
git clone https://github.com/Vatsalya-singhi/yt-ad-accelerator.git
cd yt-ad-accelerator
```

2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** → select the repository root (the folder that contains `manifest.json`).
5. Pin the extension to your toolbar if you like.

> There is no required build step — the extension runs as-is (load unpacked).

---

## Usage

1. Open any YouTube video page.
2. Open the extension popup (click the toolbar icon) to see current status and quick toggles.
3. The extension will:
   - Click the **Skip Ad** button when available.
   - Mute and/or accelerate ad playback while the ad is active (if enabled).
   - If SponsorBlock integration is enabled, fetch segments for the currently playing video and jump over / skip sponsor segments automatically.
4. Use the popup to temporarily disable on the current site or change options.

---

## Options & customization

Open the popup → click the **Settings / Options** link.

Common options:

- **Enable/Disable extension** (global)
- **Mute ads** — mute while an ad plays
- **Ad playback rate** — choose a temporary speed applied during ads (e.g., 1.5×, 2×)
- **Auto-skip enabled** — toggle automatic Skip Ad clicks
- **SponsorBlock integration** — enable/disable SponsorBlock lookups
  - Select categories to skip (sponsor, intro, outro, interaction reminder, etc.)
  - Option to only **jump-to-end** or **play at accelerated speed** for sponsor segments
- **Whitelist / Blacklist** — add domains or channel IDs where extension should be inactive/active
- **Keyboard shortcuts** — (if implemented in your browser) you can map quick toggles (see `chrome://extensions/shortcuts`)

> Settings are persisted per-user and reflected in the popup UI with in-context help and toast confirmations.

---

## Privacy & permissions

**Minimal permissions** are requested so the extension can operate:

- `tabs` / `activeTab` — detect YouTube pages and apply actions
- `storage` — save user preferences (local)
- `scripting` / `contentScripts` — inject small scripts that interact with YouTube’s player DOM

**No tracking, no analytics** (unless you add them in a fork). The extension does not send personally identifiable data elsewhere other than requests to SponsorBlock API if that feature is enabled.

---

## Development & contributing

Contributions welcome! Ways to help:

- File issues for bugs or feature requests.
- Submit pull requests:
  - Fork → create a feature branch → open PR with clear description and testing steps.
- Improve tests, add CI linting, or optimize ad detection logic.

Developer notes:

- The repo is small and uses vanilla JS/HTML/CSS — check `manifest.json` and `src/` to find content/background/popup scripts.
- SponsorBlock related changes should follow SponsorBlock attribution & API policies.

---

## Troubleshooting

**Extension doesn’t skip ads**

- Confirm extension is enabled and allowed on youtube.com.
- Try refreshing the YouTube tab.
- Open popup and check whether Auto-skip / SponsorBlock toggles are on.

**SponsorBlock segments not applied**

- SponsorBlock data is community-contributed — not all videos have segments.
- Check network / console for SponsorBlock API errors; the public API endpoint is `https://sponsor.ajay.app/`.

**High CPU usage**

- Make sure your Chrome is up-to-date.
- The latest master contains optimizations to reduce polling and CPU use — pull latest changes and reload the unpacked extension.

---

## Changelog — master (high-level)

- **UI refresh:** cleaner popup layout, tooltips, toast notifications.
- **SponsorBlock integration:** optional skip of community-submitted segments.
- **Performance:** debounced observers, less aggressive polling, memory cleanup.
- **UX:** per-site toggles, whitelist/blacklist, better feedback messages.
- **Code quality:** refactor and simplification of core ad-detection logic.

For a complete commit-by-commit log, see the repository commits on the `master` branch.

---

## Credits & links

- SponsorBlock — community-driven segment database & API. See official docs for details.
- Project repository: `https://github.com/Vatsalya-singhi/yt-ad-accelerator`

---

## License & contact

This project is licensed under the **Educational Use Only License** (see `LICENSE`).

For questions / collaboration: **vatsalya.singhi@gmail.com**

