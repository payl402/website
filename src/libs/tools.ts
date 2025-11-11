// --- Utility function: SHA-256 Hashing ---
/**
 * Calculates the SHA-256 hash of the given message and returns a hexadecimal string.
 * @param message The string to hash.
 * @returns The hexadecimal representation of the SHA-256 hash.
 */
export async function Sha256Hash(message: string): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        // Return empty string or throw error in non-browser environment or if crypto.subtle is unsupported
        console.error("Crypto API not available for SHA-256 hashing.");
        return '';
    }
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        // Use native crypto API to compute the hash
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        
        // Convert ArrayBuffer to hexadecimal string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } catch (e) {
        console.error("Error computing SHA-256 hash:", e);
        return '';
    }
}