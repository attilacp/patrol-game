// js/turn-system/turn-start.js - INICIALIZAÇÃO
console.log('🔄 turn-system/turn-start.js carregando...');

function startTurnSystem() {
    console.log('🚀 Iniciando sistema de turnos...');
    
    if (window.roomSystem && window.TurnSystem) {
        window.turnSystem = new TurnSystem(window.roomSystem);
        window.turnSystem.setupTurnListeners();
        console.log('✅ Sistema de turnos inicializado globalmente');
    } else {
        console.log('⏳ Aguardando roomSystem carregar...');
        setTimeout(startTurnSystem, 1000);
    }
}

setTimeout(startTurnSystem, 2000);

console.log('✅ turn-system/turn-start.js carregado');