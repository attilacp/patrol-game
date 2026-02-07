// js/rooms/room-answers-core.js - Núcleo do sistema de respostas
console.log('🎯 room-answers-core.js carregando...');

RoomSystem.prototype.normalizeAnswer = function(answer) {
    if (!answer) return '';
    
    const normalized = answer.toString().trim().toUpperCase();
    
    if (normalized.includes('C') || normalized.includes('CERTO') || normalized.includes('✅') || normalized.includes('V')) {
        return 'CERTO';
    }
    
    if (normalized.includes('E') || normalized.includes('ERRADO') || normalized.includes('❌') || normalized.includes('F')) {
        return 'ERRADO';
    }
    
    return normalized;
};

RoomSystem.prototype.canPlayerAnswer = function() {
    // MESTRE SEMPRE PODE RESPONDER
    if (this.isMaster) {
        return true;
    }
    
    // JOGADORES NORMAIS: verificar equipe de plantão
    if (!this.currentTurn || !this.playerTeamId) {
        console.log('❌ Jogador não pode responder (sem turno ou equipe):', {
            currentTurn: this.currentTurn,
            playerTeamId: this.playerTeamId
        });
        return false;
    }
    
    const canAnswer = this.playerTeamId === this.currentTurn.teamId;
    
    if (!canAnswer) {
        console.log('❌ Jogador não está na equipe de plantão:', {
            equipeJogador: this.playerTeamId,
            equipePlantao: this.currentTurn.teamId,
            nomeJogador: this.playerTeam?.name,
            nomePlantao: this.currentTurn.teamName
        });
    } else {
        console.log('✅ Jogador PODE responder!', {
            equipe: this.playerTeam?.name,
            jogador: this.playerName
        });
    }
    
    return canAnswer;
};

RoomSystem.prototype.submitPlayerAnswer = function(answer) {
    console.log('📤 Jogador enviando resposta:', answer);
    
    if (!this.canPlayerAnswer()) {
        this.showNotification('⏳ Aguarde sua equipe estar de plantão!', 'warning');
        return;
    }
    
    if (!this.currentRoom) return;
    
    const answerData = {
        teamId: this.playerTeamId,
        teamName: this.playerTeam?.name || 'Equipe desconhecida',
        playerId: this.playerId,
        playerName: this.playerName,
        answer: answer,
        timestamp: Date.now(),
        questionIndex: window.currentQuestionIndex
    };
    
    firebase.database().ref('rooms/' + this.currentRoom + '/playerAnswers')
        .push(answerData);
    
    console.log('📤 Resposta enviada ao mestre:', answer);
    this.showNotification('📤 Resposta enviada ao mestre!', 'success');
};

console.log('✅ room-answers-core.js carregado');