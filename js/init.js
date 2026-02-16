// js/main/init.js - VERSÃO TOLERANTE
console.log('🚀 main/init.js carregando...');

function initializeSystem() {
    console.log('🔧 Inicializando sistema...');
    
    // Verificar funções disponíveis
    console.log('📋 Funções disponíveis no momento:');
    console.log('- initConfigScreen:', typeof initializeConfigScreen);
    console.log('- initConfigEvents:', typeof initializeConfigEventListeners);
    console.log('- initGameEvents:', typeof initializeGameEventListeners);
    console.log('- startGame:', typeof startGame);
    
    // 1. Configuração básica
    if (typeof initializeConfigScreen === 'function') {
        initializeConfigScreen();
    }
    
    if (typeof initializeConfigEventListeners === 'function') {
        initializeConfigEventListeners();
    }
    
    // 2. Game events - pode não estar disponível ainda
    if (typeof initializeGameEventListeners === 'function') {
        initializeGameEventListeners();
    } else {
        console.log('⏳ Aguardando gameEvents.js carregar...');
        setTimeout(() => {
            if (typeof initializeGameEventListeners === 'function') {
                initializeGameEventListeners();
                console.log('✅ Game events inicializado com retardo');
            }
        }, 1000);
    }
    
    // 3. Sistema de notas
    if (typeof loadNotesSystem === 'function') {
        loadNotesSystem();
    }
    
    // 4. Verificar início
    if (typeof checkStartGame === 'function') {
        setTimeout(checkStartGame, 500);
    }
    
    console.log('✅ Inicialização iniciada');
}

// Esperar um pouco antes de inicializar
setTimeout(initializeSystem, 300);

console.log('✅ init.js pronto - aguardando inicialização');