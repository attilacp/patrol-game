// js/turn-system/turn-interface.js - ATUALIZADO COM FUNÇÕES FALTANDO
console.log('🔄 turn-system/turn-interface.js carregando...');

TurnSystem.prototype.handleTurnChange = function(turnData) {
    console.log('📥 Turno recebido:', turnData.teamName, 'Pergunta:', turnData.questionIndex + 1);
    
    this.currentTurn = turnData;
    window.currentTeamIndex = turnData.teamIndex;
    window.currentQuestionIndex = turnData.questionIndex;
    
    this.updateTurnUI();
    this.updateAnswerButtons();
};

// FUNÇÃO FALTANDO ADICIONADA
TurnSystem.prototype.updateTurnUI = function() {
    const teamTurnElement = document.getElementById('team-turn');
    if (!teamTurnElement) return;
    
    const currentTeam = window.teams?.[window.currentTeamIndex];
    if (currentTeam) {
        teamTurnElement.textContent = `🎯 ${currentTeam.name} - DE PLANTÃO`;
        teamTurnElement.className = 'team-turn ' + currentTeam.turnColorClass;
        console.log('🔄 Turno atualizado na UI:', currentTeam.name);
    }
};

TurnSystem.prototype.updateAnswerButtons = function() {
    const certoBtn = document.getElementById('certo-btn');
    const erradoBtn = document.getElementById('errado-btn');
    
    if (!certoBtn || !erradoBtn) return;
    
    const canAnswer = this.canPlayerAnswer();
    
    console.log('🔍 Atualizando botões - Pode responder?', canAnswer, 'Mestre?', this.roomSystem.isMaster);
    
    if (canAnswer) {
        certoBtn.disabled = false;
        erradoBtn.disabled = false;
        certoBtn.style.opacity = '1';
        erradoBtn.style.opacity = '1';
        certoBtn.style.cursor = 'pointer';
        erradoBtn.style.cursor = 'pointer';
        certoBtn.title = this.roomSystem.isMaster ? 'Responder CERTO (C)' : 'Sua vez de responder! (C)';
        erradoBtn.title = this.roomSystem.isMaster ? 'Responder ERRADO (E)' : 'Sua vez de responder! (E)';
        
        // Estilos especiais para mestre
        if (this.roomSystem.isMaster) {
            certoBtn.style.background = '#28a745';
            erradoBtn.style.background = '#dc3545';
            certoBtn.style.border = '3px solid #155724';
            erradoBtn.style.border = '3px solid #721c24';
        }
        
        console.log('✅ Botões HABILITADOS');
    } else {
        certoBtn.disabled = true;
        erradoBtn.disabled = true;
        certoBtn.style.opacity = '0.5';
        erradoBtn.style.opacity = '0.5';
        certoBtn.style.cursor = 'not-allowed';
        erradoBtn.style.cursor = 'not-allowed';
        certoBtn.title = this.roomSystem.isMaster ? 'Aguardando jogadores...' : 'Aguarde sua equipe estar de plantão';
        erradoBtn.title = this.roomSystem.isMaster ? 'Aguardando jogadores...' : 'Aguarde sua equipe estar de plantão';
        
        console.log('⏳ Botões DESABILITADOS');
    }
};

console.log('✅ turn-system/turn-interface.js carregado');