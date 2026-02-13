// js/rooms/room-master-answers.js - Respostas do mestre
console.log('👑 room-master-answers.js carregando...');

RoomSystem.prototype.processMasterAnswer = function(answer) {
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
        
        // VERIFICAR SE ATINGIU 15 PONTOS (FIM DE JOGO)
        if (team.score >= 15) {
            console.log(`🏆 ${team.name} atingiu 15 pontos - FIM DE JOGO!`);
            window.winnerTeam = team;
            
            if (window.updateTeamsDisplay) {
                window.updateTeamsDisplay();
            }
            
            // Atualizar no Firebase ANTES de mostrar vitória
            this.updateTeamScore(window.currentTeamIndex, team.score);
            
            // Mostrar mensagem de vitória
            if (typeof showWinnerMessage === 'function') {
                showWinnerMessage();
            }
            
            return; // Parar processamento
        }
        
        // REGRA DO RODÍZIO: SE ERROU, RODAR EQUIPE
        if (!isCorrect) {
            console.log(`❌ ${team.name} errou - RODANDO EQUIPE!`);
            window.consecutiveCorrect = 0;
            window.nextTeamRotation = true;
            
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
    
    // Mostrar resultado localmente
    this.showMasterAnswerResult(isCorrect, points, question);
    
    // SINCRONIZAR COM TODOS OS JOGADORES
    this.broadcastAnswerResult(isCorrect, points, question, {
        teamId: window.currentTeamIndex,
        teamName: window.teams?.[window.currentTeamIndex]?.name || 'Equipe',
        playerName: 'Mestre'
    });
    
    console.log(`👑 Mestre ${isCorrect ? 'ACERTOU' : 'ERROU'}! (${points} pts)`);
};

RoomSystem.prototype.showMasterAnswerResult = function(isCorrect, points, question) {
    // Limpar resultado anterior
    const commentaryElement = document.getElementById('commentary');
    const correctAnswerElement = document.getElementById('correct-answer');
    
    if (correctAnswerElement) {
        correctAnswerElement.textContent = isCorrect ? '✅ ACERTOU' : '❌ ERROU';
        correctAnswerElement.className = isCorrect ? 'correct-answer' : 'wrong-answer';
    }
    
    // Mostrar comentários
    if (commentaryElement && question) {
        let allComments = '';
        
        if (question.comentario) allComments += question.comentario;
        if (question.comentario2) allComments += (allComments ? '<br><br>' : '') + question.comentario2;
        if (question.comentario3) allComments += (allComments ? '<br><br>' : '') + question.comentario3;
        
        commentaryElement.innerHTML = allComments;
        commentaryElement.classList.add('active');
    }
    
    // Mostrar botão de continuar
    const nextBtn = document.getElementById('next-question-btn');
    if (nextBtn) {
        nextBtn.style.display = 'inline-block';
        nextBtn.textContent = '⏭️ Continuar';
    }
    
    // Desabilitar botões de resposta
    this.disableAnswerButtons();
};

RoomSystem.prototype.disableAnswerButtons = function() {
    const certoBtn = document.getElementById('certo-btn');
    const erradoBtn = document.getElementById('errado-btn');
    const skipBtn = document.getElementById('skip-btn');
    
    if (certoBtn) certoBtn.disabled = true;
    if (erradoBtn) erradoBtn.disabled = true;
    if (skipBtn) skipBtn.disabled = true;
};

console.log('✅ room-master-answers.js carregado');