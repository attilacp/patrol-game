// js/turn-system/turn-start.js - INICIALIZAÇÃO CORRIGIDA
console.log('🔄 turn-system/turn-start.js carregando...');

function startTurnSystem() {
    console.log('🚀 Iniciando sistema de turnos...');
    
    if (window.roomSystem && window.TurnSystem) {
        window.turnSystem = new TurnSystem(window.roomSystem);
        window.turnSystem.setupTurnListeners();
        
        // SINCRONIZAR PERGUNTA ATUAL DO FIREBASE
        if (window.roomSystem.currentRoom && !window.roomSystem.isMaster) {
            setTimeout(() => {
                window.turnSystem.syncCurrentQuestion();
            }, 1000);
        }
        
        console.log('✅ Sistema de turnos inicializado globalmente');
    } else {
        console.log('⏳ Aguardando roomSystem carregar...');
        setTimeout(startTurnSystem, 1000);
    }
}

// Adicionar método de sincronização ao TurnSystem
TurnSystem.prototype.syncCurrentQuestion = function() {
    if (!this.roomSystem.currentRoom) return;
    
    const questionRef = firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentQuestion');
    questionRef.once('value').then(snapshot => {
        const questionData = snapshot.val();
        if (questionData) {
            console.log('🔄 Sincronizando pergunta atual do Firebase:', questionData.index + 1);
            
            window.currentQuestionIndex = questionData.index || 0;
            window.currentTeamIndex = questionData.teamIndex || 0;
            
            if (window.showQuestion) {
                window.showQuestion();
            }
            
            // Atualizar turno
            if (questionData.teamIndex !== undefined && window.teams && window.teams[questionData.teamIndex]) {
                const team = window.teams[questionData.teamIndex];
                this.setCurrentTurn(questionData.teamIndex, team.id, team.name);
            }
        }
    });
};

setTimeout(startTurnSystem, 2000);

console.log('✅ turn-system/turn-start.js carregado');