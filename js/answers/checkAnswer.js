// file name: answers/checkAnswer.js (COMPLETO CORRIGIDO)
function checkAnswer(answer) {
    console.log('Verificando:', answer);
    
    // VERIFICAR SE JÁ TEM VENCEDOR OU SE A PERGUNTA JÁ FOI RESPONDIDA
    if (window.winnerTeam || window.currentQuestionAnswered) {
        console.log('Pergunta já respondida ou já temos vencedor, ignorando resposta');
        return;
    }
    
    if (!window.gameStarted || window.winnerTeam || (window.bombQuestionSystem && window.bombQuestionSystem.isBombActive)) return;
    
    var question = window.questions[window.currentQuestionIndex];
    if (!question) return;
    
    // MARCAR QUE A PERGUNTA FOI RESPONDIDA
    window.currentQuestionAnswered = true;
    
    // DESABILITAR BOTÕES DE RESPOSTA
    disableAnswerButtons();
    
    var correctAnswerElement = document.getElementById('correct-answer');
    var commentaryElement = document.getElementById('commentary');
    
    var gabaritoOriginal = question.gabarito || '';
    console.log('Gabarito original:', gabaritoOriginal);
    
    var gabaritoNormalizado = '';
    if (typeof gabaritoOriginal === 'string') {
        var gabUpper = gabaritoOriginal.toUpperCase().trim();
        if (gabUpper.includes('C') || gabUpper.includes('CERTO') || gabUpper.includes('✅') || gabaritoOriginal.includes('V')) {
            gabaritoNormalizado = 'CERTO';
        } else if (gabUpper.includes('E') || gabUpper.includes('ERRADO') || gabaritoOriginal.includes('❌') || gabaritoOriginal.includes('F')) {
            gabaritoNormalizado = 'ERRADO';
        } else {
            gabaritoNormalizado = gabUpper;
        }
    }
    
    console.log('Gabarito normalizado:', gabaritoNormalizado);
    console.log('Resposta do jogador:', answer);
    
    // COMPARAÇÃO CORRETA ENTRE RESPOSTAS
    var respostaCorreta = false;
    
    if (gabaritoNormalizado === 'CERTO' && answer === 'CERTO') {
        respostaCorreta = true;
    } else if (gabaritoNormalizado === 'ERRADO' && answer === 'ERRADO') {
        respostaCorreta = true;
    }
    // Se for outro tipo de gabarito, comparar strings exatas
    else if (answer === gabaritoNormalizado) {
        respostaCorreta = true;
    }
    
    console.log('Resposta está correta?', respostaCorreta);
    
    if (commentaryElement) {
        commentaryElement.textContent = question.comentario || '';
        commentaryElement.classList.add('active');
    }
    
    if (correctAnswerElement) {
        if (respostaCorreta) {
            correctAnswerElement.textContent = '✅ ACERTOU - GABARITO: ' + gabaritoNormalizado;
            correctAnswerElement.className = 'correct-answer';
        } else {
            correctAnswerElement.textContent = '❌ ERROU - GABARITO: ' + gabaritoNormalizado;
            correctAnswerElement.className = 'wrong-answer';
        }
    }
    
    // DISPARAR EVENTO DE PERFORMANCE
    if (window.teams && window.teams[window.currentTeamIndex]) {
        var team = window.teams[window.currentTeamIndex];
        var performanceEvent = new CustomEvent('answerGiven', {
            detail: {
                team: team,
                question: question,
                isCorrect: respostaCorreta
            }
        });
        document.dispatchEvent(performanceEvent);
    }
    
    if (respostaCorreta) {
        console.log('Resposta CORRETA!');
        if (window.handleCorrectAnswer) {
            window.handleCorrectAnswer();
        }
    } else {
        console.log('Resposta ERRADA!');
        if (window.handleWrongAnswer) {
            window.handleWrongAnswer();
        }
    }
    
    showCorrectButton();
}

// ADICIONAR FUNÇÃO disableAnswerButtons SE NÃO EXISTIR
if (typeof disableAnswerButtons === 'undefined') {
    function disableAnswerButtons() {
        ['certo-btn', 'errado-btn', 'skip-btn'].forEach(function(id) {
            var btn = document.getElementById(id);
            if (btn) btn.disabled = true;
        });
        
        // DESABILITAR TECLADO TAMBÉM
        window.keyboardEnabled = false;
        console.log('Teclado desabilitado após resposta');
    }
    window.disableAnswerButtons = disableAnswerButtons;
}

// ADICIONAR FUNÇÃO showCorrectButton SE NÃO EXISTIR
if (typeof showCorrectButton === 'undefined') {
    function showCorrectButton() {
        var nextBtn = document.getElementById('next-question-btn');
        var podiumBtn = document.getElementById('podium-btn');
        
        // Se não houver PB pendente, mostrar botão normal
        if (!window.pendingBombQuestion) {
            if (window.winnerTeam) {
                if (nextBtn) nextBtn.style.display = 'none';
                if (podiumBtn) {
                    podiumBtn.style.display = 'inline-block';
                    podiumBtn.textContent = 'Ir para Pódio';
                }
            } else {
                if (podiumBtn) podiumBtn.style.display = 'none';
                if (nextBtn) {
                    nextBtn.style.display = 'inline-block';
                    nextBtn.textContent = '⏭️ PRÓXIMA';
                }
            }
        }
        // Se houver PB pendente, o botão será configurado em handleCorrectAnswer
    }
    window.showCorrectButton = showCorrectButton;
}

// Função para habilitar teclado quando nova pergunta for exibida
function enableKeyboard() {
    window.keyboardEnabled = true;
    console.log('Teclado habilitado para nova pergunta');
}

// Função para resetar quando nova pergunta é exibida
function resetAnswerProcessedFlag() {
    window.currentQuestionAnswered = false;
    window.keyboardEnabled = true;
    console.log('Resposta resetada, teclado habilitado');
}

window.checkAnswer = checkAnswer;
window.disableAnswerButtons = disableAnswerButtons;
window.showCorrectButton = showCorrectButton;
window.enableKeyboard = enableKeyboard;
window.resetAnswerProcessedFlag = resetAnswerProcessedFlag;