// js/firebase-config.js
console.log('🔥 firebase-config.js carregando...');

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAW2k1dGsT1a23_9BTHnMM6UV5mo85GfoI",
    authDomain: "patrol-6cfc0.firebaseapp.com",
    projectId: "patrol-6cfc0",
    storageBucket: "patrol-6cfc0.firebasestorage.app",
    messagingSenderId: "79534174974",
    appId: "1:79534174974:web:78ad46f7b8f4e71c0d6baf",
    measurementId: "G-CFGFH5EPB2"
};

function initializeFirebase() {
    console.log('🔥 Inicializando Firebase...');
    
    // Verificar se Firebase já foi carregado
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK não carregado');
        return false;
    }
    
    try {
        // Inicializar Firebase
        const app = firebase.initializeApp(FIREBASE_CONFIG);
        
        // Tornar disponível globalmente
        window.firebaseApp = app;
        window.auth = firebase.auth();
        window.db = firebase.database();
        
        console.log('✅ Firebase configurado!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao configurar Firebase:', error);
        return false;
    }
}

// Exportar
window.FIREBASE_CONFIG = FIREBASE_CONFIG;
window.initializeFirebase = initializeFirebase;

console.log('✅ firebase-config.js carregado');