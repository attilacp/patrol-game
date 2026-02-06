// js/turn-system/turn-results.js - GERENCIAMENTO DE RESULTADOS CORRIGIDO
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
    
    // ATENÇÃO: REMOVIDO o advanceToNextQuestion automático!
    // O mestre controla quando avançar via botão "Continuar"
    // Não avançar automaticamente após resultado
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

// ATENÇÃO: NÃO chamar esta função automaticamente após resposta!
// Só quando mestre clicar em "Continuar"
TurnSystem.prototype.advanceToNextQuestion = function() {
    console.log('🔄 Mestre avançando para próxima pergunta...');
    
    // Incrementar índice da pergunta
    window.currentQuestionIndex++;
    
    // NÃO RODAR EQUIPE AQUI! Só se a regra especificar:
    // 1. Após 5 acertos consecutivos (já tratado em answers/correct.js)
    // 2. Após erro (já tratado em answers/wrong.js)
    // 3. Após PB (tratado em bombQuestion)
    // 4. Manualmente (botão rodízio)
    
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

TurnSystem.prototype.broadcastQuestionChange = function() {
    if (!this.roomSystem.isMaster) return;
    
    const questionData = {
        index: window.currentQuestionIndex,
        total: window.questions.length,
        teamIndex: window.currentTeamIndex, // IMPORTANTE: Enviar equipe atual
        teamName: window.teams?.[window.currentTeamIndex]?.name || 'Equipe',
        timestamp: Date.now()
    };
    
    firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentQuestion')
        .set(questionData);
    
    // Também atualizar turno atual
    if (window.teams && window.teams[window.currentTeamIndex]) {
        this.setCurrentTurn(
            window.currentTeamIndex,
            window.teams[window.currentTeamIndex].id,
            window.teams[window.currentTeamIndex].name
        );
    }
    
    console.log('📤 Nova pergunta transmitida:', window.currentQuestionIndex + 1, 'Equipe:', window.teams?.[window.currentTeamIndex]?.name);
};

TurnSystem.prototype.updateTeamScore = function(teamIndex, score) {
    firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/gameData/teams/' + teamIndex + '/score')
        .set(score);
};

console.log('✅ turn-system/turn-results.js carregado');