// Encryption/Decryption Functions
async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );
    
    return await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode(salt),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function encryptData(key, plaintext) {
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(plaintext)
    );
    
    const encryptedArray = new Uint8Array(encryptedContent);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);
    
    return btoa(String.fromCharCode(...combined));
}

async function decryptData(key, base64Ciphertext) {
    try {
        const encryptedData = Uint8Array.from(atob(base64Ciphertext), c => c.charCodeAt(0));
        const iv = encryptedData.slice(0, 12);
        const data = encryptedData.slice(12);
        
        const decryptedContent = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );
        
        return new TextDecoder().decode(decryptedContent);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data. The password might be incorrect.');
    }
}

// DOM Elements
const appHeader = document.getElementById('appHeader');
const appContent = document.getElementById('appContent');
const masterPasswordModal = document.getElementById('masterPasswordModal');
const masterPasswordInput = document.getElementById('masterPassword');
const confirmMasterPasswordInput = document.getElementById('confirmMasterPassword');
const submitMasterPasswordButton = document.getElementById('submitMasterPassword');
const masterPasswordError = document.getElementById('masterPasswordError');

// Initialize the application
async function initApp() {
    // Check if master password is set
    const hasMasterPassword = localStorage.getItem('hasMasterPassword') === 'true';
    
    if (!hasMasterPassword) {
        openModal(masterPasswordModal);
    } else {
        appContent.classList.remove('hidden');
    }
    
    // Initialize event listeners
    if (submitMasterPasswordButton) {
        submitMasterPasswordButton.addEventListener('click', handleMasterPasswordSubmit);
    }
    
    // Add other event listeners here
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export functions that need to be accessible from HTML
window.app = {
    showToast,
    toggleVisibility,
    copyKeyToClipboard,
    handleAddKey,
    handleClearAllKeys,
    handleExportKeys
};
