import * as crypto from 'crypto';

export function generatePeerId(): string {
    return crypto.randomBytes(16).toString('hex');
}

export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
}