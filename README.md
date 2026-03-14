# Stream Deck VPN Toggle

A Stream Deck plugin for macOS that toggles VPN connections with a single key press. The key icon reflects the current connection state (connected/disconnected) in real time.

## Features

- Toggle any macOS VPN connection on/off via `scutil --nc`
- Live status icon: green shield (connected) / grey shield with red slash (disconnected)
- Polls VPN status every 5 seconds to stay in sync with external changes
- Configurable connection name per key via the Property Inspector

## Requirements

- macOS 12+
- Stream Deck 6.4+
- Node.js 20+ (for development)

## Installation (Development)

```bash
npm install
npm run build
npm run link
```

Then restart the Stream Deck app. The **VPN Toggle** action will appear in the action list.

## Usage

1. Drag the **VPN Toggle** action onto a key
2. In the Property Inspector (bottom panel), enter the VPN connection name
3. Press the key to toggle the VPN on/off

To find your connection name, run in Terminal:

```bash
scutil --nc list
```

The name is the quoted string in the output, e.g. `VPN` or `One-Click VPN (Unifi Identity)`.

## Development

```bash
npm run watch    # rebuild on source changes (hot-reloads in Stream Deck)
npm run build    # one-time build
```

## Packaging

```bash
npm run pack     # creates a .streamDeckPlugin installer file
```

## Project Structure

```
├── src/
│   ├── plugin.ts                  # Entry point
│   └── actions/
│       └── vpn-toggle.ts          # Action logic (toggle, status polling)
├── com.jochenissing.vpn-toggle.sdPlugin/
│   ├── manifest.json              # Plugin manifest
│   ├── bin/                       # Compiled JS (generated)
│   ├── imgs/                      # Key and plugin icons
│   └── ui/
│       └── property-inspector.html
├── rollup.config.mjs
├── tsconfig.json
└── package.json
```

## License

MIT
