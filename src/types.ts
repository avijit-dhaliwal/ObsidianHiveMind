export interface HiveMindSettings {
    peerId: string;
    sharedFolders: string[];
    trustedPeers: string[];
    encryptionKey: string;
    sharedNotes: string[]; // Array of specific note paths to share
}

export interface SyncedNote {
    path: string;
    content: string;
    lastModified: number;
}

export interface PeerMessage {
    type: 'SYNC_REQUEST' | 'SYNC_RESPONSE' | 'NOTE_UPDATE';
    data: any;
}