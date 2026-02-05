// js/turn-system/turn-interface.js - INTERFACE DO USUÁRIO
console.log('🔄 turn-system/turn-interface.js carregando...');

TurnSystem.prototype.handleTurnChange = function(turnData) {
    console.log('📥 Turno recebido:', turnData.teamName, 'Pergunta:', turnData.questionIndex + 1);
    
    this.currentTurn = turnData;
    window.currentTeamIndex = turnData.teamIndex;
    window.currentQuestionIndex = turnData.questionIndex;
    
    this.updateTurnUI();
    this.updateAnswerButtons();
};

TurnSystem.prototype.updateTurnUI = function() {
    setTimeout(() => {
        const teamTurnElement = document.getElementById('team-turn');
        if (teamTurnElement && this.currentTurn) {
            teamTurnElement.textContent = `🎯 ${this.currentTurn.teamName} - DE PLANTÃO`;
            
            const currentTeam = window.teams?.[window.currentTeamIndex];
            if (currentTeam && currentTeam.turnColorClass) {
                teamTurnElement.className = 'team-turn ' + currentTeam.turnColorClass;
            }
        }
        
        const questionNumber = document.getElementById('question-number');
        if (questionNumber) questionNumber.textContent = (window.currentQuestionIndex + 1) || 1;
        
        if (window.showQuestion && window.questions[window.currentQuestionIndex]) {
            window.showQuestion();
        }
        
        if (window.updateTeamsDisplay) window.updateTeamsDisplay();
    }, 300);
};

TurnSystem.prototype.updateAnswerButtons = function() {
    const certoBtn = document.getElementById('certo-btn');
    const erradoBtn = document.getElementById('errado-btn');
    
    if (!certoBtn || !erradoBtn) return;
    
    const canAnswer = this.canPlayerAnswer();
    
    if (canAnswer) {
        certoBtn.disabled = false;
        erradoBtn.disabled = false;
        certoBtn.style.opacity = '1';
        erradoBtn.style.opacity = '1';
        certoBtn.style.cursor = 'pointer';
        erradoBtn.style.cursor = 'pointer';
        certoBtn.title = 'Sua vez de responder! (C)';
        erradoBtn.title = 'Sua vez de responder! (E)';
    } else {
        certoBtn.disabled = true;
        erradoBtn.disabled = true;
        certoBtn.style.opacity = '0.5';
        erradoBtn.style.opacity = '0.5';
        certoBtn.style.cursor = 'not-allowed';
        erradoBtn.style.cursor = 'not-allowed';
        certoBtn.title = 'Aguarde sua equipe estar de plantão';
        erradoBtn.title = 'Aguarde sua equipe estar de plantão';
    }
};

TurnSystem.prototype.handleQuestionChange = function(questionData) {
    console.log('📥 Nova pergunta recebida:', questionData.index + 1);
    window.currentQuestionIndex = questionData.index;
    this.updateTurnUI();
};

console.log('✅ turn-system/turn-interface.js carregado');