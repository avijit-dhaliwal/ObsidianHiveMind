import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';
import HiveMindPlugin from '../main';
import { Logger } from '../utils/Logger';
import { HiveMindPlugin } from '../main';

export class SharedNotesView extends ItemView {
    plugin: HiveMindPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: HiveMindPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return 'shared-notes';
    }

    getDisplayText(): string {
        return 'Shared Notes';
    }

    async onOpen() {
        try {
            const container = this.containerEl.children[1];
            container.empty();
            container.createEl('h2', { text: 'Shared Notes' });

            await this.renderSharedNotes();

            // Listen for updates
            this.registerEvent(this.app.vault.on('modify', () => this.renderSharedNotes()));
            this.registerEvent(this.app.vault.on('create', () => this.renderSharedNotes()));
            this.registerEvent(this.app.vault.on('delete', () => this.renderSharedNotes()));
        } catch (error) {
            Logger.error('Failed to open SharedNotesView', error);
        }
    }

    async onClose() {
        // Nothing to clean up
    }

    private async renderSharedNotes() {
        try {
            const container = this.containerEl.children[1];
            const sharedNotesList = container.createEl('ul');
            sharedNotesList.empty();

            for (const folder of this.plugin.settings.sharedFolders) {
                const li = sharedNotesList.createEl('li');
                li.createEl('strong', { text: folder });
                const notesList = li.createEl('ul');
                
                const files = this.app.vault.getFiles().filter(file => file.path.startsWith(folder));
                for (const file of files) {
                    const noteLi = notesList.createEl('li');
                    const noteLink = noteLi.createEl('a', { text: file.name, href: file.path });
                    noteLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.openNote(file);
                    });
                }
            }

            // Render individually shared notes
            if (this.plugin.settings.sharedNotes && this.plugin.settings.sharedNotes.length > 0) {
                const individualNotesLi = sharedNotesList.createEl('li');
                individualNotesLi.createEl('strong', { text: 'Individual Shared Notes' });
                const individualNotesList = individualNotesLi.createEl('ul');

                for (const notePath of this.plugin.settings.sharedNotes) {
                    const file = this.app.vault.getAbstractFileByPath(notePath);
                    if (file instanceof TFile) {
                        const noteLi = individualNotesList.createEl('li');
                        const noteLink = noteLi.createEl('a', { text: file.name, href: file.path });
                        noteLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.openNote(file);
                        });
                    }
                }
            }
        } catch (error) {
            Logger.error('Failed to render shared notes', error);
        }
    }

    private async openNote(file: TFile) {
        try {
            await this.app.workspace.activeLeaf.openFile(file);
        } catch (error) {
            Logger.error(`Failed to open note: ${file.path}`, error);
        }
    }
}