// js/turn-system/turn-answers.js - ATUALIZADO COM PROCESSAMENTO PARA MESTRE
console.log('🔄 turn-system/turn-answers.js carregando...');

TurnSystem.prototype.submitAnswer = function(answer) {
    console.log('📤 Tentando enviar resposta:', answer);
    
    // SE FOR MESTRE, PROCESSAR DIRETAMENTE
    if (this.roomSystem.isMaster) {
        console.log('👑 Mestre respondendo diretamente...');
        this.processMasterAnswer(answer);
        return;
    }
    
    // JOGADOR NORMAL: Enviar para o mestre
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

// NOVA FUNÇÃO: Mestre responde diretamente
TurnSystem.prototype.processMasterAnswer = function(answer) {
    console.log('👑 Mestre processando resposta:', answer);
    
    if (!window.questions || !window.questions[window.currentQuestionIndex]) {
        console.error('❌ Nenhuma pergunta disponível');
        return;
    }
    
    const question = window.questions[window.currentQuestionIndex];
    const gabarito = question?.gabarito ? question.gabarito.trim().toUpperCase() : '';
    const normalizedGabarito = this.normalizeAnswer(gabarito);
    const normalizedUserAnswer = this.normalizeAnswer(answer);
    
    const isCorrect = normalizedUserAnswer === normalizedGabarito;
    
    // Calcular pontos
    let points = 0;
    if (isCorrect) {
        window.consecutiveCorrect = (window.consecutiveCorrect || 0) + 1;
        points = 10 + (window.consecutiveCorrect * 2);
    } else {
        window.consecutiveCorrect = 0;
        points = -5;
    }
    
    // Atualizar pontuação da equipe atual (ALFA)
    if (window.teams && window.teams[window.currentTeamIndex]) {
        window.teams[window.currentTeamIndex].score += points;
        
        if (window.updateTeamsDisplay) {
            window.updateTeamsDisplay();
        }
        
        // Atualizar no Firebase
        this.updateTeamScore(window.currentTeamIndex, window.teams[window.currentTeamIndex].score);
    }
    
    // Mostrar resultado imediatamente
    this.showAnswerResult(isCorrect, points, 'MESTRE');
    
    console.log(`👑 Mestre ${isCorrect ? 'ACERTOU' : 'ERROU'}! (${points} pts)`);
    
    // Aguardar e avançar
    setTimeout(() => {
        this.advanceToNextQuestion();
    }, 3000);
};

// NOVA FUNÇÃO: Mostrar resultado da resposta
TurnSystem.prototype.showAnswerResult = function(isCorrect, points, playerName) {
    const questionText = document.getElementById('question-text');
    if (!questionText) return;
    
    const currentTeam = window.teams?.[window.currentTeamIndex];
    const teamName = currentTeam ? currentTeam.name : 'Equipe';
    
    const resultHtml = `
        <div style="background: ${isCorrect ? '#d4edda' : '#f8d7da'}; 
                    padding: 15px; border-radius: 10px; margin-bottom: 20px;
                    border: 2px solid ${isCorrect ? '#28a745' : '#dc3545'};">
            <h3 style="color: ${isCorrect ? '#155724' : '#721c24'}; margin: 0 0 10px 0;">
                ${isCorrect ? '✅ CORRETO!' : '❌ ERRADO!'}
            </h3>
            <p style="margin: 5px 0;">
                <strong>${playerName}</strong> da equipe <strong>${teamName}</strong>
                ${isCorrect ? 'acertou' : 'errou'}!
            </p>
            <p style="margin: 5px 0;">Pontos: ${points > 0 ? '+' : ''}${points}</p>
            <p style="margin: 5px 0; font-weight: bold;">
                Resposta correta: ${window.questions[window.currentQuestionIndex]?.gabarito || 'Não informada'}
            </p>
        </div>
    `;
    
    questionText.innerHTML = resultHtml + (questionText.innerHTML || '');
};

// Resto do código permanece igual...
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
        
        if (window.updateTeamsDisplay) {
            window.updateTeamsDisplay();
        }
        
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