// js/answers/question-flow.js - Fluxo de perguntas
console.log('🔄 question-flow.js carregando...');

function advanceToNextQuestion() {
    console.log('⏭️ Avançando para próxima pergunta...');
    
    // Verificar se há vencedor
    if (window.winnerTeam) {
        console.log('🏆 Já temos vencedor, indo para pódio');
        if (window.showPodium) {
            window.showPodium();
        }
        return;
    }
    
    // Verificar bomb question pendente
    if (window.pendingBombQuestion && window.bombQuestionSystem) {
        console.log('💣 PB pendente detectada');
        activatePendingBombQuestion();
        return;
    }
    
    // Aplicar rodízio se marcado
    if (window.nextTeamRotation && window.teams && window.teams.length > 1) {
        console.log('🔄 Aplicando rodízio marcado');
        rotateTeamSequence();
        window.nextTeamRotation = false;
    }
    
    // Avançar índice da pergunta
    window.currentQuestionIndex++;
    
    // Verificar se terminou as perguntas
    if (window.currentQuestionIndex >= window.questions.length) {
        endGameSequence();
        return;
    }
    
    // Exibir próxima pergunta
    displayNextQuestion();
}

function displayNextQuestion() {
    // Resetar flags
    window.currentQuestionAnswered = false;
    window.keyboardEnabled = true;
    window.currentQuestionProcessed = false;
    
    if (typeof window.resetAnswerProcessedFlag === 'function') {
        window.resetAnswerProcessedFlag();
    }
    
    // Exibir pergunta
    if (typeof window.displayQuestionWithSubject === 'function') {
        window.displayQuestionWithSubject();
    }
    
    // Atualizar display das equipes
    if (typeof window.updateTeamsDisplay === 'function') {
        window.updateTeamsDisplay();
    }
    
    // Sincronizar com multiplayer se for mestre
    if (window.roomSystem && window.roomSystem.isMaster) {
        syncQuestionToAllPlayers();
    }
}

function rotateTeamSequence() {
    if (!window.teams || window.teams.length === 0) return;
    
    const oldTeam = window.teams[window.currentTeamIndex]?.name || 'Equipe';
    window.currentTeamIndex = (window.currentTeamIndex + 1) % window.teams.length;
    window.consecutiveCorrect = 0;
    
    const newTeam = window.teams[window.currentTeamIndex]?.name || 'Equipe';
    
    console.log(`🔄 Rodízio aplicado: ${oldTeam} → ${newTeam}`);
    
    // Notificar sistema de turnos
    if (window.turnSystem && window.turnSystem.setCurrentTurn) {
        const team = window.teams[window.currentTeamIndex];
        window.turnSystem.setCurrentTurn(window.currentTeamIndex, team.id, team.name);
    }
    
    // Notificar jogadores
    if (window.roomSystem && window.roomSystem.isMaster) {
        window.roomSystem.showNotification(`🔄 Rodízio: ${newTeam} agora está de plantão`, 'info');
    }
}

function activatePendingBombQuestion() {
    console.log('💣 Ativando PB pendente...');
    window.pendingBombQuestion = false;
    
    if (window.bombQuestionSystem && window.bombQuestionSystem.activateBombQuestion) {
        const activated = window.bombQuestionSystem.activateBombQuestion();
        if (!activated) {
            console.log('❌ Falha ao ativar PB, continuando jogo normal');
            displayNextQuestion();
        }
    } else {
        console.log('❌ Sistema PB não disponível, continuando jogo normal');
        displayNextQuestion();
    }
}

function endGameSequence() {
    console.log('🏁 Fim do jogo!');
    
    const questionText = document.getElementById('question-text');
    const teamTurn = document.getElementById('team-turn');
    
    if (questionText) {
        questionText.textContent = '🏆 Fim do jogo!';
    }
    
    if (teamTurn) {
        teamTurn.textContent = '🎊 JOGO FINALIZADO';
    }
    
    // Desabilitar botões de resposta
    disableAnswerButtonsFinal();
    
    // Mostrar botão de pódio
    showPodiumButtonFinal();
    
    // Atualizar display final
    if (typeof window.updateTeamsDisplay === 'function') {
        window.updateTeamsDisplay();
    }
}

function disableAnswerButtonsFinal() {
    ['certo-btn', 'errado-btn', 'skip-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = true;
    });
}

function showPodiumButtonFinal() {
    const podiumBtn = document.getElementById('podium-btn');
    if (podiumBtn) {
        podiumBtn.style.display = 'inline-block';
        podiumBtn.textContent = '🏆 Ver Pódio';
    }
}

function syncQuestionToAllPlayers() {
    if (window.roomSystem && window.roomSystem.isMaster) {
        if (window.roomSystem.broadcastQuestionToAll) {
            window.roomSystem.broadcastQuestionToAll();
        }
        
        if (window.roomSystem.broadcastButtonsState) {
            window.roomSystem.broadcastButtonsState({
                certo: true,
                errado: true,
                skip: true,
                next: false,
                podium: false
            });
        }
    }
}

window.advanceToNextQuestion = advanceToNextQuestion;
window.displayNextQuestion = displayNextQuestion;
window.rotateTeamSequence = rotateTeamSequence;
window.activatePendingBombQuestion = activatePendingBombQuestion;
window.endGameSequence = endGameSequence;
window.disableAnswerButtonsFinal = disableAnswerButtonsFinal;
window.showPodiumButtonFinal = showPodiumButtonFinal;
window.syncQuestionToAllPlayers = syncQuestionToAllPlayers;

console.log('✅ question-flow.js carregado');