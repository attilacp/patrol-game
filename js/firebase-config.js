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
    
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK não carregado');
        return false;
    }
    
    // Verificar se já foi inicializado
    if (firebase.apps && firebase.apps.length > 0) {
        console.log('✅ Firebase já estava inicializado');
        window.firebaseApp = firebase.apps[0];
        window.auth = firebase.auth();
        window.db = firebase.database();
        return true;
    }
    
    try {
        const app = firebase.initializeApp(FIREBASE_CONFIG);
        window.firebaseApp = app;
        window.auth = firebase.auth();
        window.db = firebase.database();
        
        console.log('✅ Firebase configurado!');
        
        // Disparar evento para avisar que está pronto
        document.dispatchEvent(new Event('firebaseReady'));
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao configurar Firebase:', error);
        return false;
    }
}

// Exportar
window.FIREBASE_CONFIG = FIREBASE_CONFIG;
window.initializeFirebase = initializeFirebase;

// AUTO-INICIALIZAR quando o script carregar
// Esperar um pouco para garantir que Firebase SDK foi carregado
setTimeout(() => {
    if (typeof firebase !== 'undefined') {
        initializeFirebase();
    } else {
        console.warn('⏳ Aguardando Firebase SDK...');
        // Tentar novamente
        const checkInterval = setInterval(() => {
            if (typeof firebase !== 'undefined') {
                clearInterval(checkInterval);
                initializeFirebase();
            }
        }, 100);
        
        // Timeout de segurança (5 segundos)
        setTimeout(() => clearInterval(checkInterval), 5000);
    }
}, 100);

console.log('✅ firebase-config.js carregado');
