import { Plugin, TFile } from 'obsidian';
import { PeerManager } from './sync/PeerManager';
import { SyncManager } from './sync/SyncManager';
import { SettingsTab } from './ui/SettingsTab';
import { SharedNotesView } from './ui/SharedNotesView';
import { HiveMindSettings } from './types';
import { Encryptor } from './crypto/Encryptor';

export interface HiveMindPlugin extends Plugin {
    settings: HiveMindSettings;
    peerManager: PeerManager;
    syncManager: SyncManager;
}

const DEFAULT_SETTINGS: HiveMindSettings = {
    peerId: '',
    sharedFolders: [],
    trustedPeers: [],
    encryptionKey: '',
    sharedNotes: [],
};

export default class HiveMind extends Plugin implements HiveMindPlugin {
    settings: HiveMindSettings;
    peerManager: PeerManager;
    syncManager: SyncManager;
    encryptor: Encryptor;

    async onload() {
        await this.loadSettings();

        this.encryptor = new Encryptor(this.settings.encryptionKey);
        this.peerManager = new PeerManager(this, this.settings.peerId, this.settings);
        this.syncManager = new SyncManager(this.app.vault, this.peerManager, this.encryptor);

        this.addSettingTab(new SettingsTab(this.app, this));
        this.registerView('shared-notes', (leaf) => new SharedNotesView(leaf, this));

        this.addRibbonIcon('share', 'Hive Mind', () => {
            this.activateView();
        });

        this.registerEvent(
            this.app.vault.on('modify', (file: TFile) => {
                if (this.isFileShared(file)) {
                    this.syncManager.syncNote(file);
                }
            })
        );

        this.peerManager.startListening();
    }

    async onunload() {
        this.peerManager.stopListening();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async activateView() {
        const { workspace } = this.app;
        workspace.detachLeavesOfType('shared-notes');
        await workspace.getRightLeaf(false).setViewState({
            type: 'shared-notes',
            active: true,
        });
        workspace.revealLeaf(workspace.getLeavesOfType('shared-notes')[0]);
    }

    isFileShared(file: TFile): boolean {
        return this.settings.sharedFolders.some(folder => file.path.startsWith(folder)) ||
               this.settings.sharedNotes.includes(file.path);
    }
}