# Obsidian Hive Mind

Obsidian Hive Mind is a collaborative note-sharing and syncing plugin for Obsidian. It allows users to create a decentralized network of shared knowledge, enabling real-time collaboration on notes and knowledge graphs.

## Features

- Peer-to-peer note synchronization
- End-to-end encryption for shared notes
- Selective sharing of folders or individual notes
- Real-time updates and conflict resolution
- Secure peer authentication using public-key cryptography

## Prerequisites

- Obsidian v0.15.0 or higher
- Node.js v14 or higher
- npm v6 or higher

## Installation

1. Clone this repository to your local machine:
```bash
git clone https://github.com/avijit-dhaliwal/obsidianhivemind.git
```
2. Navigate to the plugin directory:
```bash
cd obsidianhivemind
```
3. Install dependencies:
```bash
npm install
```
4. Build the plugin:
```bash
npm run build
```
5. Copy the `main.js`, `manifest.json`, and `styles.css` files to your Obsidian vault's plugins folder:
```bash
cp main.js manifest.json styles.css /path/to/your/vault/.obsidian/plugins/obsidianhivemind/
```
6. Restart Obsidian and enable the "Hive Mind" plugin in the Community Plugins settings.

## Usage

1. Open the Hive Mind settings tab in Obsidian settings.
2. Set your Peer ID or generate a new one.
3. Add trusted peer IDs (public keys) of your collaborators.
4. Select folders or individual notes you want to share.
5. Start collaborating!

## Development

1. Clone this repo.
2. `npm install` to install dependencies
3. `npm run dev` to start compilation in watch mode.

## Security

This plugin uses peer-to-peer connections and end-to-end encryption. However, please be aware of the inherent risks in sharing data over the internet. Only connect to peers you trust and be cautious about the content you share.

## Contributing

Contributions to Obsidian Hive Mind are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)