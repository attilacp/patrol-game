// js/answers/response-handler.js - Manipulador de respostas
console.log('🤖 response-handler.js carregando...');

function processAnswerResponse(answerType) {
    console.log(`🤖 Processando resposta: ${answerType}`);
    
    // Verificar se já foi processado
    if (window.currentQuestionProcessed || window.winnerTeam) {
        console.log('⚠️ Resposta já processada ou já temos vencedor');
        return;
    }
    
    // Marcar como processado
    window.currentQuestionProcessed = true;
    window.currentQuestionAnswered = true;
    
    // Desabilitar botões de resposta
    disableResponseButtons();
    
    // Obter pergunta atual
    const question = window.questions[window.currentQuestionIndex];
    if (!question) {
        console.error('❌ Nenhuma pergunta disponível');
        return;
    }
    
    // Verificar resposta
    const isCorrect = checkIfAnswerIsCorrect(answerType, question.gabarito);
    
    // Atualizar pontuação da equipe
    updateTeamScore(isCorrect);
    
    // Atualizar acertos consecutivos
    if (typeof window.updateConsecutiveCorrect === 'function') {
        window.updateConsecutiveCorrect(isCorrect);
    }
    
    // Verificar se errou para marcar rodízio
    if (!isCorrect && typeof window.markTeamRotationNeeded === 'function') {
        window.markTeamRotationNeeded();
    }
    
    // Verificar se tem vencedor
    if (typeof window.checkForWinner === 'function') {
        window.checkForWinner();
    }
    
    // Mostrar resultado
    showAnswerResult(isCorrect, question);
    
    // Sincronizar com multiplayer
    syncAnswerToAllPlayers(isCorrect, question);
    
    console.log(`🤖 Resposta processada: ${isCorrect ? 'CORRETA' : 'ERRADA'}`);
}

function checkIfAnswerIsCorrect(answerType, gabarito) {
    if (!gabarito) return false;
    
    const normalizedGabarito = gabarito.toString().toUpperCase().trim();
    const normalizedAnswer = answerType.toUpperCase();
    
    // Verificar múltiplos formatos de gabarito
    if (normalizedGabarito.includes('C') || normalizedGabarito.includes('CERTO') || 
        normalizedGabarito.includes('✅') || normalizedGabarito.includes('V')) {
        return normalizedAnswer === 'CERTO';
    }
    
    if (normalizedGabarito.includes('E') || normalizedGabarito.includes('ERRADO') || 
        normalizedGabarito.includes('❌') || normalizedGabarito.includes('F')) {
        return normalizedAnswer === 'ERRADO';
    }
    
    // Fallback: comparação direta
    return normalizedAnswer === normalizedGabarito;
}

function updateTeamScore(isCorrect) {
    if (!window.teams || !window.teams[window.currentTeamIndex]) return;
    
    const team = window.teams[window.currentTeamIndex];
    
    // Atualizar estatísticas
    team.questionsAnswered = (team.questionsAnswered || 0) + 1;
    
    if (isCorrect) {
        team.score += 1; // 1 ponto por acerto
        console.log(`📈 ${team.name} acertou! Pontuação: ${team.score}`);
    } else {
        team.questionsWrong = (team.questionsWrong || 0) + 1;
        console.log(`📉 ${team.name} errou! Pontuação: ${team.score}`);
    }
    
    // Atualizar display
    if (typeof window.updateTeamsDisplay === 'function') {
        window.updateTeamsDisplay();
    }
    
    // Atualizar performance
    if (typeof window.updateTeamPerformance === 'function' && window.questions) {
        const question = window.questions[window.currentQuestionIndex];
        window.updateTeamPerformance(team, question, isCorrect);
    }
}

function disableResponseButtons() {
    ['certo-btn', 'errado-btn', 'skip-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        }
    });
    
    window.keyboardEnabled = false;
    console.log('🔒 Botões de resposta desabilitados');
}

function showAnswerResult(isCorrect, question) {
    const correctAnswerElement = document.getElementById('correct-answer');
    const commentaryElement = document.getElementById('commentary');
    
    // Mostrar se acertou/errou
    if (correctAnswerElement) {
        correctAnswerElement.textContent = isCorrect ? '✅ ACERTOU' : '❌ ERROU';
        correctAnswerElement.className = isCorrect ? 'correct-answer' : 'wrong-answer';
    }
    
    // Mostrar gabarito
    if (question.gabarito && correctAnswerElement) {
        correctAnswerElement.textContent += ' - GABARITO: ' + question.gabarito;
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
        nextBtn.textContent = window.winnerTeam ? '🏆 Ver Pódio' : '⏭️ Continuar';
    }
}

function syncAnswerToAllPlayers(isCorrect, question) {
    if (window.roomSystem && window.roomSystem.isMaster) {
        // Usar sistema de sincronização do roomSystem
        if (window.roomSystem.broadcastAnswerToAll) {
            window.roomSystem.broadcastAnswerToAll(isCorrect, question);
        }
        
        // Sincronizar estado dos botões
        if (window.roomSystem.broadcastButtonsState) {
            window.roomSystem.broadcastButtonsState({
                certo: false,
                errado: false,
                skip: false,
                next: true,
                podium: window.winnerTeam ? true : false
            });
        }
    }
}

window.processAnswerResponse = processAnswerResponse;
window.checkIfAnswerIsCorrect = checkIfAnswerIsCorrect;
window.updateTeamScore = updateTeamScore;
window.disableResponseButtons = disableResponseButtons;
window.showAnswerResult = showAnswerResult;
window.syncAnswerToAllPlayers = syncAnswerToAllPlayers;

console.log('✅ response-handler.js carregado');