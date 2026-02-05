// js/turn-system/turn-results.js - GERENCIAMENTO DE RESULTADOS
console.log('🔄 turn-system/turn-results.js carregando...');

TurnSystem.prototype.broadcastAnswerResult = function(isCorrect, points, answerData) {
    const resultData = {
        questionIndex: window.currentQuestionIndex,
        isCorrect: isCorrect,
        points: points,
        teamId: answerData.teamId,
        teamName: answerData.teamName,
        playerName: answerData.playerName,
        correctAnswer: window.questions[window.currentQuestionIndex]?.gabarito,
        timestamp: Date.now()
    };
    
    firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/answerResult')
        .set(resultData);
    
    console.log('📤 Resultado transmitido');
};

TurnSystem.prototype.handleAnswerResult = function(resultData) {
    console.log('📥 Resultado recebido:', resultData);
    this.showResult(resultData);
    
    if (this.roomSystem.isMaster) {
        setTimeout(() => this.advanceToNextQuestion(), 3000);
    }
};

TurnSystem.prototype.showResult = function(resultData) {
    const questionText = document.getElementById('question-text');
    if (!questionText) return;
    
    const resultHtml = `
        <div style="background: ${resultData.isCorrect ? '#d4edda' : '#f8d7da'}; 
                    padding: 15px; border-radius: 10px; margin-bottom: 20px;
                    border: 2px solid ${resultData.isCorrect ? '#28a745' : '#dc3545'};">
            <h3 style="color: ${resultData.isCorrect ? '#155724' : '#721c24'}; margin: 0 0 10px 0;">
                ${resultData.isCorrect ? '✅ CORRETO!' : '❌ ERRADO!'}
            </h3>
            <p style="margin: 5px 0;">
                <strong>${resultData.playerName}</strong> da equipe <strong>${resultData.teamName}</strong>
                ${resultData.isCorrect ? 'acertou' : 'errou'}!
            </p>
            <p style="margin: 5px 0;">Pontos: ${resultData.points > 0 ? '+' : ''}${resultData.points}</p>
            <p style="margin: 5px 0; font-weight: bold;">
                Resposta correta: ${resultData.correctAnswer || 'Não informada'}
            </p>
        </div>
    `;
    
    questionText.innerHTML = resultHtml + (questionText.innerHTML || '');
};

TurnSystem.prototype.advanceToNextQuestion = function() {
    window.currentQuestionIndex++;
    this.broadcastQuestionChange();
    
    if (!this.currentTurn?.isCorrect) {
        setTimeout(() => this.rotateTeam(), 1000);
    }
};

TurnSystem.prototype.broadcastQuestionChange = function() {
    if (!this.roomSystem.isMaster) return;
    
    const questionData = {
        index: window.currentQuestionIndex,
        total: window.questions.length,
        timestamp: Date.now()
    };
    
    firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentQuestion')
        .set(questionData);
    
    console.log('📤 Nova pergunta transmitida:', window.currentQuestionIndex + 1);
};

TurnSystem.prototype.updateTeamScore = function(teamIndex, score) {
    firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/gameData/teams/' + teamIndex + '/score')
        .set(score);
};

console.log('✅ turn-system/turn-results.js carregado');