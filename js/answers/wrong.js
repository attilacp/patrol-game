// file name: answers/wrong.js
function handleWrongAnswer() {
    // VERIFICAR SE JÁ FOI PROCESSADO ESTA RESPOSTA
    if (window.currentQuestionProcessed) {
        console.log('Resposta já processada, ignorando...');
        return;
    }
    
    // MARCAR COMO PROCESSADO
    window.currentQuestionProcessed = true;
    
    var team = window.teams[window.currentTeamIndex];
    team.questionsAnswered = (team.questionsAnswered || 0) + 1;
    team.questionsWrong = (team.questionsWrong || 0) + 1;
    
    // ZERAR CONSECUTIVOS E MARCAR PARA RODÍZIO (erro sempre roda equipe)
    console.log(team.name + ' errou - RODANDO EQUIPE');
    window.consecutiveCorrect = 0;
    window.nextTeamRotation = true; // Rodar equipe após erro
    window.pendingBombQuestion = false; // Cancelar qualquer PB pendente
    window.resetPendingBombButton?.(); // Resetar botão de PB
    
    // Chamar função de marcação de erro
    if (typeof markWrongAnswer === 'function') {
        markWrongAnswer();
    } else {
        // Fallback se a função não existir
        var answerElement = document.getElementById('correct-answer');
        if (answerElement) {
            answerElement.className = 'wrong-answer';
        }
    }
}

function markWrongAnswer() {
    var answerElement = document.getElementById('correct-answer');
    if (answerElement) {
        answerElement.className = 'wrong-answer';
    }
}

window.handleWrongAnswer = handleWrongAnswer;
window.markWrongAnswer = markWrongAnswer;