// js/turn-system/turn-answers.js - MANIPULAÇÃO DE RESPOSTAS
console.log('🔄 turn-system/turn-answers.js carregando...');

TurnSystem.prototype.submitAnswer = function(answer) {
    console.log('📤 Tentando enviar resposta:', answer);
    
    if (!this.canPlayerAnswer()) {
        this.showNotification('⏳ Aguarde sua equipe estar de plantão!', 'warning');
        return;
    }
    
    if (!this.roomSystem.currentRoom) return;
    
    const answerData = {
        teamId: this.playerTeamId,
        teamName: this.playerTeam?.name || 'Equipe desconhecida',
        playerId: this.roomSystem.playerId,
        playerName: this.roomSystem.playerName,
        answer: answer,
        timestamp: Date.now(),
        questionIndex: window.currentQuestionIndex
    };
    
    firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/teamAnswers')
        .push(answerData);
    
    console.log('📤 Resposta enviada:', answer);
    this.showNotification('📤 Resposta enviada ao mestre!', 'success');
};

TurnSystem.prototype.handleTeamAnswer = function(answerData) {
    if (!this.roomSystem.isMaster) return;
    
    console.log('📥 Resposta recebida:', answerData);
    
    if (this.currentTurn &&
        this.currentTurn.teamId === answerData.teamId &&
        this.currentTurn.questionIndex === answerData.questionIndex &&
        !this.currentTurn.answered) {
        
        firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentTurn')
            .update({ answered: true });
        
        this.processAnswer(answerData);
    }
};

TurnSystem.prototype.processAnswer = function(answerData) {
    const question = window.questions[window.currentQuestionIndex];
    const gabarito = question?.gabarito ? question.gabarito.trim().toUpperCase() : '';
    const normalizedGabarito = this.normalizeAnswer(gabarito);
    const normalizedUserAnswer = this.normalizeAnswer(answerData.answer);
    
    const isCorrect = normalizedUserAnswer === normalizedGabarito;
    let points = 0;
    
    if (isCorrect) {
        window.consecutiveCorrect = (window.consecutiveCorrect || 0) + 1;
        points = 10 + (window.consecutiveCorrect * 2);
    } else {
        window.consecutiveCorrect = 0;
        points = -5;
    }
    
    const teamIndex = window.teams.findIndex(t => t.id === answerData.teamId);
    if (teamIndex !== -1) {
        window.teams[teamIndex].score += points;
        if (window.updateTeamsDisplay) window.updateTeamsDisplay();
        this.updateTeamScore(teamIndex, window.teams[teamIndex].score);
    }
    
    this.broadcastAnswerResult(isCorrect, points, answerData);
    console.log(`✅ Resposta processada: ${isCorrect ? 'CORRETO' : 'ERRADO'} (${points} pts)`);
};

TurnSystem.prototype.normalizeAnswer = function(answer) {
    if (!answer) return '';
    return answer.toString().trim().toUpperCase()
        .replace(/^CERTO$/i, 'C')
        .replace(/^ERRADO$/i, 'E')
        .replace(/^CERTA$/i, 'C')
        .replace(/^ERRADA$/i, 'E')
        .replace(/^C$/i, 'C')
        .replace(/^E$/i, 'E');
};

console.log('✅ turn-system/turn-answers.js carregado');