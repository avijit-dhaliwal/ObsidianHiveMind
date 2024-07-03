import { Vault, TFile } from 'obsidian';
import { PeerManager } from './PeerManager';
import { Encryptor } from '../crypto/Encryptor';
import { SyncedNote } from '../types';
import { VersionControl } from '../utils/VersionControl';
import { Logger } from '../utils/Logger';
import { SyncedNote } from '../types';

export class SyncManager {
    private vault: Vault;
    private peerManager: PeerManager;
    private encryptor: Encryptor;
    private versionControl: VersionControl;

    constructor(vault: Vault, peerManager: PeerManager, encryptor: Encryptor) {
        this.vault = vault;
        this.peerManager = peerManager;
        this.encryptor = encryptor;
        this.versionControl = new VersionControl();
    }

    async syncNote(file: TFile) {
        try {
            const content = await this.vault.read(file);
            const encryptedContent = this.encryptor.encrypt(content);
            const syncedNote: SyncedNote = {
                path: file.path,
                content: encryptedContent,
                lastModified: file.stat.mtime
            };
            this.peerManager.broadcastToPeers({
                type: 'NOTE_UPDATE',
                data: syncedNote
            });
        } catch (error) {
            Logger.error(`Failed to sync note: ${file.path}`, error);
        }
    }

    async receiveNote(syncedNote: SyncedNote) {
        try {
            const decryptedContent = this.encryptor.decrypt(syncedNote.content);
            const file = this.vault.getAbstractFileByPath(syncedNote.path);
            if (file instanceof TFile) {
                if (file.stat.mtime < syncedNote.lastModified) {
                    await this.vault.modify(file, decryptedContent);
                } else if (file.stat.mtime > syncedNote.lastModified) {
                    // Local version is newer, merge changes
                    const localContent = await this.vault.read(file);
                    const mergedContent = this.mergeContents(localContent, decryptedContent);
                    await this.vault.modify(file, mergedContent);
                }
            } else {
                await this.vault.create(syncedNote.path, decryptedContent);
            }
        } catch (error) {
            Logger.error(`Failed to receive note: ${syncedNote.path}`, error);
        }
    }

    private mergeContents(localContent: string, remoteContent: string): string {
        const patch = this.versionControl.createPatch(localContent, remoteContent);
        return this.versionControl.applyPatch(localContent, patch);
    }

    requestSync() {
        this.peerManager.broadcastToPeers({
            type: 'SYNC_REQUEST',
            data: null
        });
    }

    async respondToSyncRequest(peerId: string) {
        try {
            const sharedNotes: SyncedNote[] = [];
            for (const file of this.vault.getFiles()) {
                if (this.isSharedFile(file)) {
                    const content = await this.vault.read(file);
                    const encryptedContent = this.encryptor.encrypt(content);
                    sharedNotes.push({
                        path: file.path,
                        content: encryptedContent,
                        lastModified: file.stat.mtime
                    });
                }
            }
            this.peerManager.sendToPeer(peerId, {
                type: 'SYNC_RESPONSE',
                data: sharedNotes
            });
        } catch (error) {
            Logger.error(`Failed to respond to sync request from peer: ${peerId}`, error);
        }
    }

    private isSharedFile(file: TFile): boolean {
        // Implement logic to check if file is in a shared folder or is a shared note
        return true; // Placeholder
    }
}