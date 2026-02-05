// js/turn-system/turn-answers.js - PONTUAÇÃO CORRIGIDA
console.log('🔄 turn-system/turn-answers.js carregando...');

TurnSystem.prototype.submitAnswer = function(answer) {
    console.log('📤 Tentando enviar resposta:', answer);
    
    // SE FOR MESTRE, PROCESSAR DIRETAMENTE
    if (this.roomSystem.isMaster) {
        console.log('👑 Mestre respondendo diretamente...');
        this.processMasterAnswer(answer);
        return;
    }
    
    // JOGADOR NORMAL: Verificar se pode responder
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
    
    // PONTUAÇÃO FIXA: 1 ponto por acerto, 0 por erro
    let points = isCorrect ? 1 : 0;
    
    // Atualizar pontuação da equipe atual
    if (window.teams && window.teams[window.currentTeamIndex]) {
        window.teams[window.currentTeamIndex].score += points;
        
        if (window.updateTeamsDisplay) {
            window.updateTeamsDisplay();
        }
        
        // Atualizar no Firebase
        this.updateTeamScore(window.currentTeamIndex, window.teams[window.currentTeamIndex].score);
    }
    
    // Mostrar resultado (sem tempo, com botão de continuar)
    this.showAnswerResult(isCorrect, points, 'MESTRE');
    
    console.log(`👑 Mestre ${isCorrect ? 'ACERTOU' : 'ERROU'}! (${points} pts)`);
};

// FUNÇÃO ATUALIZADA: Mostrar resultado sem timer, com comentários no lugar certo
TurnSystem.prototype.showAnswerResult = function(isCorrect, points, playerName) {
    // Limpar resultado anterior
    const commentaryElement = document.getElementById('commentary');
    const correctAnswerElement = document.getElementById('correct-answer');
    
    if (correctAnswerElement) {
        correctAnswerElement.textContent = isCorrect ? '✅ ACERTOU' : '❌ ERROU';
        correctAnswerElement.className = isCorrect ? 'correct-answer' : 'wrong-answer';
    }
    
    // Mostrar comentários no local correto
    if (commentaryElement && window.questions && window.questions[window.currentQuestionIndex]) {
        const question = window.questions[window.currentQuestionIndex];
        let allComments = '';
        
        if (question.comentario) allComments += question.comentario;
        if (question.comentario2) allComments += (allComments ? '<br><br>' : '') + question.comentario2;
        if (question.comentario3) allComments += (allComments ? '<br><br>' : '') + question.comentario3;
        
        commentaryElement.innerHTML = allComments;
        commentaryElement.classList.add('active');
    }
    
    // Mostrar botão de continuar (sem timer automático)
    const nextBtn = document.getElementById('next-question-btn');
    if (nextBtn) {
        nextBtn.style.display = 'inline-block';
        nextBtn.textContent = '⏭️ Continuar';
    }
    
    // Desabilitar botões de resposta
    const certoBtn = document.getElementById('certo-btn');
    const erradoBtn = document.getElementById('errado-btn');
    const skipBtn = document.getElementById('skip-btn');
    
    if (certoBtn) certoBtn.disabled = true;
    if (erradoBtn) erradoBtn.disabled = true;
    if (skipBtn) skipBtn.disabled = true;
};