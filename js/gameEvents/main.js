// js/gameEvents/main.js - VERSÃO CORRIGIDA (sem import dinâmico)
console.log('🎮 gameEvents/main.js carregando...');

// Carregar todos os módulos de gameEvents de forma síncrona
// (os scripts já serão carregados na ordem pelo HTML)

// Inicializar variáveis de controle do teclado
if (window.keyboardEnabled === undefined) {
    window.keyboardEnabled = true;
    window.currentQuestionAnswered = false;
    window.currentQuestionProcessed = false;
}

// VARIÁVEL PARA CONTROLAR CLIQUE NO TEAM TURN
window.teamTurnClickInProgress = false;

// Função principal para inicializar todos os event listeners
function initializeGameEventListeners() {
    console.log('🎮 Inicializando event listeners do jogo...');
    
    // Verificar se todas as funções estão disponíveis
    if (typeof cleanupExistingEventListeners !== 'function') {
        console.error('❌ cleanupExistingEventListeners não disponível');
        return;
    }
    
    cleanupExistingEventListeners();
    
    // Carregar módulos específicos
    if (typeof setupAnswerButtonEvents === 'function') {
        setupAnswerButtonEvents();
    } else {
        console.error('❌ setupAnswerButtonEvents não disponível');
    }
    
    if (typeof setupControlButtonEvents === 'function') {
        setupControlButtonEvents();
    } else {
        console.error('❌ setupControlButtonEvents não disponível');
    }
    
    if (typeof setupTeamTurnClickEvent === 'function') {
        setupTeamTurnClickEvent();
    } else {
        console.error('❌ setupTeamTurnClickEvent não disponível');
    }
    
    if (typeof setupKeyboardShortcuts === 'function') {
        setupKeyboardShortcuts();
    } else {
        console.error('❌ setupKeyboardShortcuts não disponível');
    }
    
    console.log('✅ Event listeners do jogo inicializados');
}

// Função para voltar para configurações
function handleBackToConfig() {
    console.log('↩️ Voltando para tela de configuração...');
    
    if (window.bombQuestionSystem?.isBombActive) {
        window.bombQuestionSystem.finishBombQuestion(false);
    }
    
    // Resetar jogo
    window.gameStarted = false;
    window.currentQuestionIndex = 0;
    window.currentTeamIndex = 0;
    window.consecutiveCorrect = 0;
    window.winnerTeam = null;
    window.nextTeamRotation = false;
    window.pendingBombQuestion = false;
    window.resetPendingBombButton?.();
    
    // Mudar telas
    document.getElementById('game-screen')?.classList.remove('active');
    document.getElementById('config-screen')?.classList.add('active');
    
    console.log('✅ Retornado para tela de configuração');
}

// Exportar funções principais
if (typeof window !== 'undefined') {
    window.initializeGameEventListeners = initializeGameEventListeners;
    window.handleBackToConfig = handleBackToConfig;
    
    console.log('✅ gameEvents/main.js exportado');
}