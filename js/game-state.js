// js/answers/game-state.js - Estado do jogo
console.log('🎮 game-state.js carregando...');

// Inicializar variáveis de estado global
function initializeGameState() {
    console.log('🎮 Inicializando estado do jogo...');
    
    if (!window.questions) window.questions = [];
    if (window.currentQuestionIndex === undefined) window.currentQuestionIndex = 0;
    if (window.currentTeamIndex === undefined) window.currentTeamIndex = 0;
    if (window.gameStarted === undefined) window.gameStarted = false;
    if (window.randomOrder === undefined) window.randomOrder = false;
    if (window.consecutiveCorrect === undefined) window.consecutiveCorrect = 0;
    if (window.winnerTeam === undefined) window.winnerTeam = null;
    if (window.nextTeamRotation === undefined) window.nextTeamRotation = false;
    if (window.pendingBombQuestion === undefined) window.pendingBombQuestion = false;
    if (window.currentQuestionAnswered === undefined) window.currentQuestionAnswered = false;
    if (window.keyboardEnabled === undefined) window.keyboardEnabled = true;
    if (window.currentQuestionProcessed === undefined) window.currentQuestionProcessed = false;
    
    console.log('✅ Estado do jogo inicializado:', {
        perguntas: window.questions.length,
        indicePergunta: window.currentQuestionIndex,
        indiceEquipe: window.currentTeamIndex,
        jogoIniciado: window.gameStarted,
        vencedor: window.winnerTeam ? window.winnerTeam.name : 'nenhum',
        rodizioPendente: window.nextTeamRotation,
        pbPendente: window.pendingBombQuestion
    });
}

function resetGameState() {
    console.log('🔄 Resetando estado do jogo...');
    
    window.currentQuestionIndex = 0;
    window.currentTeamIndex = 0;
    window.gameStarted = false;
    window.consecutiveCorrect = 0;
    window.winnerTeam = null;
    window.nextTeamRotation = false;
    window.pendingBombQuestion = false;
    window.currentQuestionAnswered = false;
    window.keyboardEnabled = true;
    window.currentQuestionProcessed = false;
    
    // Resetar botão de PB pendente
    if (typeof window.resetPendingBombButton === 'function') {
        window.resetPendingBombButton();
    }
    
    console.log('✅ Estado do jogo resetado');
}

function checkForWinner() {
    if (!window.teams || window.winnerTeam) return;
    
    // Verificar se alguma equipe atingiu 15 pontos
    for (const team of window.teams) {
        if (team.score >= 15) {
            window.winnerTeam = team;
            console.log(`🏆 VENCEDOR: ${team.name} com ${team.score} pontos!`);
            
            // Disparar evento de vencedor
            document.dispatchEvent(new CustomEvent('gameWinner', {
                detail: { team }
            }));
            
            // Mostrar mensagem de vencedor
            showWinnerAnnouncement(team);
            return true;
        }
    }
    
    return false;
}

function showWinnerAnnouncement(team) {
    const questionText = document.getElementById('question-text');
    const teamTurn = document.getElementById('team-turn');
    
    if (questionText) {
        questionText.textContent = `🎉 PARABÉNS! ${team.name} venceu!`;
    }
    
    if (teamTurn) {
        teamTurn.textContent = '🏆 TEMOS UM VENCEDOR!';
        teamTurn.className = 'team-turn ' + (team.turnColorClass || 'team-color-1');
    }
    
    // Desabilitar botões de resposta
    ['certo-btn', 'errado-btn', 'skip-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = true;
    });
    
    // Mostrar botão de pódio
    const podiumBtn = document.getElementById('podium-btn');
    if (podiumBtn) {
        podiumBtn.style.display = 'inline-block';
        podiumBtn.textContent = '🏆 Ir para Pódio';
    }
    
    // Ocultar botão de próxima
    const nextBtn = document.getElementById('next-question-btn');
    if (nextBtn) nextBtn.style.display = 'none';
}

function updateConsecutiveCorrect(isCorrect) {
    if (isCorrect) {
        window.consecutiveCorrect = (window.consecutiveCorrect || 0) + 1;
        console.log(`✅ Acertos consecutivos: ${window.consecutiveCorrect}`);
        
        // Verificar se atingiu 5 para rodar equipe
        if (window.consecutiveCorrect >= 5) {
            console.log('🏆 5 acertos consecutivos - Marcando rodízio');
            window.nextTeamRotation = true;
            window.consecutiveCorrect = 0;
        }
    } else {
        window.consecutiveCorrect = 0;
        console.log('❌ Erro - Zerando acertos consecutivos');
    }
}

function markTeamRotationNeeded() {
    window.nextTeamRotation = true;
    console.log('🔄 Rodízio de equipe marcado para próxima pergunta');
}

window.initializeGameState = initializeGameState;
window.resetGameState = resetGameState;
window.checkForWinner = checkForWinner;
window.showWinnerAnnouncement = showWinnerAnnouncement;
window.updateConsecutiveCorrect = updateConsecutiveCorrect;
window.markTeamRotationNeeded = markTeamRotationNeeded;

console.log('✅ game-state.js carregado');