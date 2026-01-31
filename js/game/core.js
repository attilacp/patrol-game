// file name: game/core.js
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

function showQuestion() {
    console.log('🎯 Mostrando pergunta:', window.currentQuestionIndex + 1, 'de', window.questions.length);
    
    // RESETAR FLAGS DE RESPOSTA
    window.currentQuestionAnswered = false;
    window.keyboardEnabled = true;
    window.currentQuestionProcessed = false;
    window.resetAnswerProcessedFlag?.();
    
    // VERIFICAR SE HÁ PB PENDENTE - SE SIM, ATIVAR
    if (window.pendingBombQuestion && window.bombQuestionSystem) {
        console.log('PB pendente detectada, ativando...');
        window.pendingBombQuestion = false;
        
        // Tentar ativar PB
        if (window.bombQuestionSystem.activateBombQuestion()) {
            console.log('PB ativada após pendência');
            return;
        } else {
            console.log('❌ Falha ao ativar PB pendente - continuando jogo normal');
            // Continuar com pergunta normal
            window.pendingBombQuestion = false;
            window.resetPendingBombButton?.();
        }
    }
    
    // VERIFICAR SE JÁ TEM VENCEDOR
    if (window.winnerTeam) {
        console.log('🏆 Já temos um vencedor, ignorando PB');
        
        if (window.nextTeamRotation && window.gameStarted) {
            rotateTeam();
            window.nextTeamRotation = false;
        }
        
        if (window.currentQuestionIndex < window.questions.length) {
            displayCurrentQuestion();
        } else {
            endGame();
        }
        return;
    }
    
    // APLICAR RODÍZIO SE MARCADO
    if (window.nextTeamRotation && window.gameStarted) {
        console.log('🔄 Aplicando rodízio marcado...');
        rotateTeam();
        window.nextTeamRotation = false;
    }
    
    if (window.currentQuestionIndex < window.questions.length) {
        displayCurrentQuestion();
    } else {
        endGame();
    }
}

function displayCurrentQuestion() {
    const question = window.questions[window.currentQuestionIndex];
    
    document.getElementById('question-text').textContent = question.enunciado || 'Pergunta sem enunciado';
    document.getElementById('commentary').textContent = question.comentario || '';
    document.getElementById('correct-answer').textContent = '';
    
    document.getElementById('question-number').textContent = window.currentQuestionIndex + 1;
    document.getElementById('total-questions').textContent = window.questions.length;
    
    if (window.teams?.[window.currentTeamIndex]) {
        const currentTeam = window.teams[window.currentTeamIndex];
        document.getElementById('team-turn').textContent = '🎯 ' + currentTeam.name + ' - DE PLANTÃO';
        document.getElementById('team-turn').className = 'team-turn ' + currentTeam.turnColorClass;
    }
    
    enableAnswerButtons();
    window.updateTeamsDisplay?.();
}

function nextQuestion() {
    window.currentQuestionIndex++;
    showQuestion();
}

function rotateTeam() {
    window.currentTeamIndex = (window.currentTeamIndex + 1) % window.teams.length;
    window.consecutiveCorrect = 0;
}

function enableAnswerButtons() {
    ['certo-btn', 'errado-btn', 'skip-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = false;
    });
    
    const nextBtn = document.getElementById('next-question-btn');
    const podiumBtn = document.getElementById('podium-btn');
    if (nextBtn) nextBtn.style.display = 'none';
    if (podiumBtn) podiumBtn.style.display = window.winnerTeam ? 'block' : 'none';
}

function endGame() {
    document.getElementById('question-text').textContent = '🏆 Fim do jogo!';
    document.getElementById('team-turn').textContent = '🎊 JOGO FINALIZADO';
    
    ['certo-btn', 'errado-btn', 'skip-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = true;
    });
    
    const podiumBtn = document.getElementById('podium-btn');
    if (podiumBtn) podiumBtn.style.display = 'block';
    
    window.updateTeamsDisplay?.();
}

window.showQuestion = showQuestion;
window.nextQuestion = nextQuestion;
window.rotateTeam = rotateTeam;
window.enableAnswerButtons = enableAnswerButtons;