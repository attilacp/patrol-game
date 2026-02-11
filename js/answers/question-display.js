// js/answers/question-display.js - CORRIGIDO
console.log('📝 question-display.js carregando...');

function showQuestion() {
    if (window.currentQuestionIndex >= window.questions.length) {
        endGame();
        return;
    }
    
    const question = window.questions[window.currentQuestionIndex];
    const questionText = document.getElementById('question-text');
    
    if (!questionText) return;
    
    let questionHTML = '';
    if (question.assuntoInfo) {
        questionHTML = '<div class="assunto-container">' +
            '<div class="assunto-icon">📚</div>' +
            '<div class="assunto-text">' + question.assuntoInfo + '</div>' +
        '</div>' +
        '<div class="pergunta-texto">' +
            (question.enunciado || 'Pergunta sem enunciado') +
        '</div>';
    } else {
        questionHTML = '<div class="pergunta-texto">' + 
            (question.enunciado || 'Pergunta sem enunciado') + 
        '</div>';
    }
    
    questionText.innerHTML = questionHTML;
    
    clearPreviousAnswer();
    updateQuestionCounters();
    updateCurrentTeamDisplay();
    enableQuestionControls();
    
    console.log('✅ Pergunta ' + (window.currentQuestionIndex + 1) + ' exibida');
}

function displayQuestionWithSubject() {
    showQuestion();
}

function clearPreviousAnswer() {
    const commentary = document.getElementById('commentary');
    const correctAnswer = document.getElementById('correct-answer');
    
    if (commentary) {
        commentary.textContent = '';
        commentary.innerHTML = '';
        commentary.classList.remove('active');
    }
    
    if (correctAnswer) {
        correctAnswer.textContent = '';
        correctAnswer.className = 'correct-answer';
    }
}

function updateQuestionCounters() {
    const questionNumber = document.getElementById('question-number');
    const totalQuestions = document.getElementById('total-questions');
    
    if (questionNumber) {
        questionNumber.textContent = window.currentQuestionIndex + 1;
    }
    
    if (totalQuestions) {
        totalQuestions.textContent = window.questions.length;
    }
}

function updateCurrentTeamDisplay() {
    const teamTurn = document.getElementById('team-turn');
    
    if (window.teams && window.teams[window.currentTeamIndex]) {
        const team = window.teams[window.currentTeamIndex];
        
        if (teamTurn) {
            teamTurn.textContent = '🎯 ' + team.name + ' - DE PLANTÃO';
            teamTurn.className = 'team-turn ' + team.turnColorClass;
        }
        
        console.log('👥 Equipe atual: ' + team.name);
    }
}

function enableQuestionControls() {
    const certoBtn = document.getElementById('certo-btn');
    const erradoBtn = document.getElementById('errado-btn');
    const skipBtn = document.getElementById('skip-btn');
    
    if (certoBtn) certoBtn.disabled = false;
    if (erradoBtn) erradoBtn.disabled = false;
    if (skipBtn && window.roomSystem?.isMaster) skipBtn.disabled = false;
    
    const nextBtn = document.getElementById('next-question-btn');
    const podiumBtn = document.getElementById('podium-btn');
    
    if (nextBtn) nextBtn.style.display = 'none';
    if (podiumBtn) podiumBtn.style.display = 'none';
    
    window.keyboardEnabled = true;
    console.log('⌨️ Teclado habilitado');
}

window.showQuestion = showQuestion;
window.displayQuestionWithSubject = displayQuestionWithSubject;
window.clearPreviousAnswer = clearPreviousAnswer;
window.updateQuestionCounters = updateQuestionCounters;
window.updateCurrentTeamDisplay = updateCurrentTeamDisplay;
window.enableQuestionControls = enableQuestionControls;

console.log('✅ question-display.js carregado');
