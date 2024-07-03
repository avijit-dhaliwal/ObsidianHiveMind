import { App, PluginSettingTab, Setting } from 'obsidian';
import HiveMindPlugin from '../main';
import { generatePeerId, generateEncryptionKey } from '../utils/NetworkUtils';

export class SettingsTab extends PluginSettingTab {
    plugin: HiveMindPlugin;

    constructor(app: App, plugin: HiveMindPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Peer ID')
            .setDesc('Your unique peer identifier')
            .addText(text => text
                .setPlaceholder('Enter peer ID')
                .setValue(this.plugin.settings.peerId)
                .onChange(async (value) => {
                    this.plugin.settings.peerId = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Generate Peer ID')
            .setDesc('Generate a new random peer ID')
            .addButton(button => button
                .setButtonText('Generate')
                .onClick(async () => {
                    const newPeerId = generatePeerId();
                    this.plugin.settings.peerId = newPeerId;
                    await this.plugin.saveSettings();
                    this.display();
                }));

        new Setting(containerEl)
            .setName('Shared Folders')
            .setDesc('Folders to share with trusted peers')
            .addTextArea(text => text
                .setPlaceholder('Enter folder paths, one per line')
                .setValue(this.plugin.settings.sharedFolders.join('\n'))
                .onChange(async (value) => {
                    this.plugin.settings.sharedFolders = value.split('\n').filter(folder => folder.trim() !== '');
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Trusted Peers')
            .setDesc('Peer IDs of trusted collaborators')
            .addTextArea(text => text
                .setPlaceholder('Enter peer IDs, one per line')
                .setValue(this.plugin.settings.trustedPeers.join('\n'))
                .onChange(async (value) => {
                    this.plugin.settings.trustedPeers = value.split('\n').filter(peer => peer.trim() !== '');
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Encryption Key')
            .setDesc('Key used for encrypting shared notes')
            .addText(text => text
                .setPlaceholder('Enter encryption key')
                .setValue(this.plugin.settings.encryptionKey)
                .onChange(async (value) => {
                    this.plugin.settings.encryptionKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Generate Encryption Key')
            .setDesc('Generate a new random encryption key')
            .addButton(button => button
                .setButtonText('Generate')
                .onClick(async () => {
                    const newKey = generateEncryptionKey();
                    this.plugin.settings.encryptionKey = newKey;
                    await this.plugin.saveSettings();
                    this.display();
                }));
    }
}