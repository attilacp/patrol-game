ARQUIVO: config.js
LOCALIZAÇÃO: js/config.js
===============================================

// PATROL - Configuração Firebase
console.log('🔥 Config carregando...');

const CONFIG = {
    firebase: {
        apiKey: "AIzaSyAW2k1dGsT1a23_9BTHnMM6UV5mo85GfoI",
        authDomain: "patrol-6cfc0.firebaseapp.com",
        projectId: "patrol-6cfc0",
        storageBucket: "patrol-6cfc0.firebasestorage.app",
        messagingSenderId: "79534174974",
        appId: "1:79534174974:web:78ad46f7b8f4e71c0d6baf",
        measurementId: "G-CFGFH5EPB2"
    },
    
    game: {
        maxTeams: 10,
        minTeams: 1,
        winningScore: 15,
        consecutiveForRotation: 5,
        consecutiveForBomb: 3,
        defaultRecurrence: 'alta' // baixa, media, alta
    },
    
    teams: {
        defaultNames: ["ALFA", "BRAVO", "CHARLIE", "DELTA", "ECHO", "FOXTROT", "GOLF", "HOTEL", "INDIA", "JULIETT"],
        colors: [
            {name: 'Vermelho', bg: 'team-bg-1', turn: 'team-color-1'},
            {name: 'Verde', bg: 'team-bg-2', turn: 'team-color-2'},
            {name: 'Amarelo', bg: 'team-bg-3', turn: 'team-color-3'},
            {name: 'Azul', bg: 'team-bg-4', turn: 'team-color-4'},
            {name: 'Rosa', bg: 'team-bg-5', turn: 'team-color-5'},
            {name: 'Ciano', bg: 'team-bg-6', turn: 'team-color-6'},
            {name: 'Roxo', bg: 'team-bg-7', turn: 'team-color-7'},
            {name: 'Laranja', bg: 'team-bg-8', turn: 'team-color-8'},
            {name: 'Vermelho Escuro', bg: 'team-bg-9', turn: 'team-color-9'},
            {name: 'Verde Escuro', bg: 'team-bg-10', turn: 'team-color-10'}
        ]
    }
};

// Inicializar Firebase
function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK não carregado');
        return false;
    }
    
    if (firebase.apps && firebase.apps.length > 0) {
        console.log('✅ Firebase já inicializado');
        return true;
    }
    
    try {
        firebase.initializeApp(CONFIG.firebase);
        window.auth = firebase.auth();
        window.db = firebase.database();
        
        console.log('✅ Firebase inicializado');
        document.dispatchEvent(new Event('firebaseReady'));
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
        return false;
    }
}

// Auto-inicializar
setTimeout(() => {
    if (typeof firebase !== 'undefined') {
        initFirebase();
    } else {
        console.warn('⏳ Aguardando Firebase SDK...');
        const check = setInterval(() => {
            if (typeof firebase !== 'undefined') {
                clearInterval(check);
                initFirebase();
            }
        }, 100);
        setTimeout(() => clearInterval(check), 5000);
    }
}, 100);

window.CONFIG = CONFIG;
window.initFirebase = initFirebase;

console.log('✅ Config carregado');