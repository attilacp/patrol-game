// js/rooms/room-answer-control.js - Controle de fluxo de respostas
console.log('⚙️ room-answer-control.js carregando...');

RoomSystem.prototype.advanceToNextQuestion = function() {
    console.log('🔄 Avançando para próxima pergunta...');
    
    // APLICAR RODÍZIO SE MARCADO
    if (window.nextTeamRotation && window.teams && window.teams.length > 1) {
        console.log('🔄 Aplicando rodízio de equipe...');
        this.rotateCurrentTeam();
        window.nextTeamRotation = false;
    }
    
    // Incrementar índice da pergunta
    window.currentQuestionIndex++;
    
    // Transmitir nova pergunta
    this.broadcastQuestionChange();
    
    console.log('✅ Nova pergunta:', window.currentQuestionIndex + 1);
    
    // Mostrar pergunta
    setTimeout(() => {
        if (window.showQuestion) {
            window.showQuestion();
        }
    }, 500);
};

RoomSystem.prototype.rotateCurrentTeam = function() {
    if (!window.teams || window.teams.length === 0) return;
    
    const oldTeam = window.teams[window.currentTeamIndex]?.name || 'Equipe';
    window.currentTeamIndex = (window.currentTeamIndex + 1) % window.teams.length;
    window.consecutiveCorrect = 0;
    
    const newTeam = window.teams[window.currentTeamIndex]?.name || 'Equipe';
    
    console.log(`🔄 Equipe rotacionada: ${oldTeam} → ${newTeam}`);
    
    // Notificar sobre rodízio
    this.showNotification(`🔄 Rodízio: ${oldTeam} → ${newTeam}`, 'info');
    
    // Atualizar sistema de turnos
    this.setCurrentTurn(
        window.currentTeamIndex,
        window.teams[window.currentTeamIndex].id,
        newTeam
    );
};

RoomSystem.prototype.setCurrentTurn = function(teamIndex, teamId, teamName) {
    if (!this.isMaster) return;
    
    const turnData = {
        teamIndex: teamIndex,
        teamId: teamId,
        teamName: teamName,
        questionIndex: window.currentQuestionIndex || 0,
        startTime: Date.now(),
        answered: false,
        masterId: this.playerId
    };
    
    this.currentTurn = turnData;
    
    firebase.database().ref('rooms/' + this.currentRoom + '/currentTurn')
        .set(turnData);
    
    console.log('👑 Turno definido:', teamName);
    
    // Atualizar botões de resposta
    setTimeout(() => {
        this.updateAnswerButtons();
    }, 100);
};

RoomSystem.prototype.updateAnswerButtons = function() {
    const certoBtn = document.getElementById('certo-btn');
    const erradoBtn = document.getElementById('errado-btn');
    
    if (!certoBtn || !erradoBtn) return;
    
    const canAnswer = this.canPlayerAnswer();
    
    console.log('🔍 Atualizando botões - Pode responder?', canAnswer, 'Mestre?', this.isMaster);
    
    if (canAnswer) {
        certoBtn.disabled = false;
        erradoBtn.disabled = false;
        certoBtn.style.opacity = '1';
        erradoBtn.style.opacity = '1';
        certoBtn.style.cursor = 'pointer';
        erradoBtn.style.cursor = 'pointer';
        certoBtn.title = this.isMaster ? 'Responder CERTO (C)' : 'Sua vez de responder! (C)';
        erradoBtn.title = this.isMaster ? 'Responder ERRADO (E)' : 'Sua vez de responder! (E)';
        
        // Estilos especiais para mestre
        if (this.isMaster) {
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
        certoBtn.title = this.isMaster ? 'Aguardando jogadores...' : 'Aguarde sua equipe estar de plantão';
        erradoBtn.title = this.isMaster ? 'Aguardando jogadores...' : 'Aguarde sua equipe estar de plantão';
        
        console.log('⏳ Botões DESABILITADOS');
    }
};

console.log('✅ room-answer-control.js carregado');