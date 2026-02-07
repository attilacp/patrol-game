// js/turn-system/turn-answers.js - PONTUAÇÃO E RODÍZIO CORRIGIDOS
console.log('🔄 turn-system/turn-answers.js carregando...');

TurnSystem.prototype.normalizeAnswer = function(answer) {
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
        const team = window.teams[window.currentTeamIndex];
        team.score += points;
        
        // REGRA DO RODÍZIO: SE ERROU, RODAR EQUIPE
        if (!isCorrect) {
            console.log(`❌ ${team.name} errou - RODANDO EQUIPE!`);
            window.consecutiveCorrect = 0;
            window.nextTeamRotation = true; // Marcar para rodar na próxima pergunta
            
            // Notificar sobre rodízio
            this.showNotification(`❌ ${team.name} errou - Próxima equipe na próxima pergunta!`, 'warning');
        } else {
            // Se acertou, incrementar consecutivos
            window.consecutiveCorrect = (window.consecutiveCorrect || 0) + 1;
            console.log(`✅ ${team.name} acertou! Consecutivos: ${window.consecutiveCorrect}`);
            
            // Verificar se atingiu 5 acertos consecutivos para rodar equipe
            if (window.consecutiveCorrect >= 5) {
                console.log(`🏆 ${team.name} com 5 acertos consecutivos - RODANDO EQUIPE!`);
                window.nextTeamRotation = true;
                window.consecutiveCorrect = 0;
                this.showNotification(`🏆 ${team.name} com 5 acertos - Próxima equipe na próxima pergunta!`, 'success');
            }
        }
        
        if (window.updateTeamsDisplay) {
            window.updateTeamsDisplay();
        }
        
        // Atualizar no Firebase
        this.updateTeamScore(window.currentTeamIndex, team.score);
    }
    
    // Mostrar resultado
    this.showAnswerResult(isCorrect, points, 'MESTRE');
    
    // SINCRONIZAR COM TODOS OS JOGADORES
    this.broadcastAnswerResult(isCorrect, points, {
        teamId: window.currentTeamIndex,
        teamName: window.teams?.[window.currentTeamIndex]?.name || 'Equipe',
        playerName: 'Mestre'
    });
    
    console.log(`👑 Mestre ${isCorrect ? 'ACERTOU' : 'ERROU'}! (${points} pts)`);
};

// FUNÇÃO ATUALIZADA: Mostrar resultado e SINCRONIZAR
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
    
    // SINCRONIZAR ESTADO DOS BOTÕES COM TODOS
    if (this.roomSystem && this.roomSystem.isMaster) {
        if (this.roomSystem.broadcastButtonsState) {
            this.roomSystem.broadcastButtonsState({
                certo: false,
                errado: false,
                skip: false,
                next: true,
                podium: false
            });
        }
    }
};

// ATUALIZAR advanceToNextQuestion para aplicar rodízio
TurnSystem.prototype.advanceToNextQuestion = function() {
    console.log('🔄 Mestre avançando para próxima pergunta...');
    
    // APLICAR RODÍZIO SE MARCADO
    if (window.nextTeamRotation && window.teams && window.teams.length > 1) {
        console.log('🔄 Aplicando rodízio de equipe...');
        this.rotateTeam();
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

TurnSystem.prototype.broadcastAnswerResult = function(isCorrect, points, answerData) {
    if (!this.roomSystem.isMaster || !this.roomSystem.currentRoom) return;
    
    const question = window.questions[window.currentQuestionIndex];
    let allComments = '';
    if (question) {
        if (question.comentario) allComments += question.comentario;
        if (question.comentario2) allComments += (allComments ? '<br><br>' : '') + question.comentario2;
        if (question.comentario3) allComments += (allComments ? '<br><br>' : '') + question.comentario3;
    }
    
    const resultData = {
        questionIndex: window.currentQuestionIndex,
        isCorrect: isCorrect,
        points: points,
        teamId: answerData.teamId,
        teamName: answerData.teamName,
        playerName: answerData.playerName,
        correctAnswer: question?.gabarito || 'Não informado',
        comments: allComments, // INCLUIR COMENTÁRIOS
        timestamp: Date.now()
    };
    
    firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/answerResult')
        .set(resultData);
    
    console.log('📤 Resultado transmitido com comentários');
};

console.log('✅ turn-system/turn-answers.js carregado');