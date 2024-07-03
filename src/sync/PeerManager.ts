import { Plugin } from 'obsidian';
import Peer from 'peerjs';
import { PeerMessage, HiveMindSettings } from '../types';
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import { Logger } from '../utils/Logger';
import { Plugin, TFile } from 'obsidian';

export class PeerManager {
    private plugin: Plugin;
    private peer: Peer;
    private connections: Map<string, Peer.DataConnection> = new Map();
    private keyPair: nacl.BoxKeyPair;

    constructor(plugin: Plugin, peerId: string, private settings: HiveMindSettings) {
        this.plugin = plugin;
        this.peer = new Peer(peerId);
        this.keyPair = nacl.box.keyPair();
        
        this.peer.on('connection', (conn) => {
            this.handleConnection(conn);
        });

        settings.trustedPeers.forEach(peerId => {
            this.connectToPeer(peerId);
        });
    }

    startListening() {
        this.peer.on('open', (id) => {
            Logger.log('My peer ID is: ' + id);
        });
    }

    stopListening() {
        this.peer.destroy();
    }

    private async handleConnection(conn: Peer.DataConnection) {
        conn.on('open', async () => {
            if (await this.authenticatePeer(conn)) {
                this.connections.set(conn.peer, conn);
                conn.on('data', (data: PeerMessage) => {
                    this.handleMessage(conn.peer, data);
                });
            } else {
                Logger.warn(`Authentication failed for peer: ${conn.peer}`);
                conn.close();
            }
        });

        conn.on('close', () => {
            this.connections.delete(conn.peer);
        });
    }

    private async authenticatePeer(conn: Peer.DataConnection): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const challenge = nacl.randomBytes(32);
            
            conn.send({
                type: 'AUTH_CHALLENGE',
                data: util.encodeBase64(challenge)
            });

            const timeout = setTimeout(() => {
                resolve(false);
            }, 10000); // 10 seconds timeout

            conn.once('data', (response: PeerMessage) => {
                clearTimeout(timeout);
                if (response.type === 'AUTH_RESPONSE') {
                    const signature = util.decodeBase64(response.data.signature);
                    const publicKey = util.decodeBase64(response.data.publicKey);
                    
                    if (nacl.sign.detached.verify(challenge, signature, publicKey)) {
                        // Verify if the public key is in the trusted peers list
                        if (this.settings.trustedPeers.includes(util.encodeBase64(publicKey))) {
                            resolve(true);
                        } else {
                            Logger.warn(`Peer ${conn.peer} is not in the trusted peers list`);
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            });
        });
    }

    private connectToPeer(peerId: string) {
        if (!this.connections.has(peerId)) {
            const conn = this.peer.connect(peerId);
            this.handleConnection(conn);
        }
    }

    sendToPeer(peerId: string, message: PeerMessage) {
        const conn = this.connections.get(peerId);
        if (conn) {
            conn.send(message);
        } else {
            Logger.error(`No connection to peer: ${peerId}`);
        }
    }

    broadcastToPeers(message: PeerMessage) {
        this.connections.forEach(conn => {
            conn.send(message);
        });
    }

    private handleMessage(peerId: string, message: PeerMessage) {
        switch (message.type) {
            case 'SYNC_REQUEST':
                this.plugin.syncManager.respondToSyncRequest(peerId);
                break;
            case 'SYNC_RESPONSE':
                message.data.forEach((syncedNote: SyncedNote) => {
                    this.plugin.syncManager.receiveNote(syncedNote);
                });
                break;
            case 'NOTE_UPDATE':
                this.plugin.syncManager.receiveNote(message.data);
                break;
            case 'AUTH_CHALLENGE':
                this.respondToAuthChallenge(peerId, message.data);
                break;
            default:
                Logger.error('Unknown message type:', message.type);
        }
    }

    private respondToAuthChallenge(peerId: string, challengeBase64: string) {
        const challenge = util.decodeBase64(challengeBase64);
        const signature = nacl.sign.detached(challenge, this.keyPair.secretKey);
        this.sendToPeer(peerId, {
            type: 'AUTH_RESPONSE',
            data: {
                signature: util.encodeBase64(signature),
                publicKey: util.encodeBase64(this.keyPair.publicKey)
            }
        });
    }

    getPublicKey(): string {
        return util.encodeBase64(this.keyPair.publicKey);
    }
}