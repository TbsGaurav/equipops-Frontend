import CryptoJS from 'crypto-js';

export function encryptData(data, secretKey) {
    const plainText = typeof data === 'object' ? JSON.stringify(data) : String(data);

    const secret_key = CryptoJS.enc.Hex.parse(secretKey);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(plainText, secret_key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    const encryptedData = {
        iv: iv.toString(CryptoJS.enc.Base64),
        value: encrypted.ciphertext.toString(CryptoJS.enc.Base64)
    };

    return btoa(JSON.stringify(encryptedData));
}

export function decryptData(encryptedPayload, secretKey) {
    try {
        // 1. Decode outer Base64 → JSON
        const decodedJson = JSON.parse(atob(encryptedPayload));

        const ivBase64 = decodedJson.iv;
        const cipherBase64 = decodedJson.value;

        // 2. Convert iv and ciphertext back to WordArray
        const iv = CryptoJS.enc.Base64.parse(ivBase64);
        const ciphertext = CryptoJS.enc.Base64.parse(cipherBase64);

        // 3. Parse secret key (hex string)
        const secret_key = CryptoJS.enc.Hex.parse(secretKey);

        // 4. Decrypt
        const decrypted = CryptoJS.AES.decrypt({ ciphertext }, secret_key, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        // 5. Convert decrypted WordArray → UTF-8
        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

        // 6. Try to JSON.parse if it's JSON, otherwise return as is
        try {
            return JSON.parse(decryptedText);
        } catch {
            return decryptedText;
        }
    } catch (err) {
        console.error('Decrypt error:', err);
        throw new Error('Failed to decrypt. Possibly wrong key, corrupted payload, or wrong algorithm.');
    }
}
