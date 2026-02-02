// file name: js/answers/skip.js (ATUALIZADO PARA MÚLTIPLOS COMENTÁRIOS)
function skipQuestion(){
    if(!confirm('⚠️ Pular esta questão?\n\nNão contará para pontuação.')) return;
    
    // CORREÇÃO: Garantir que os botões sejam desabilitados
    disableAllButtons();
    
    console.log('⏭️ Pulando:', window.currentQuestionIndex);
    const answerElement = document.getElementById('correct-answer');
    if(answerElement){
        answerElement.textContent = '⏭️ Questão pulada...';
        answerElement.className = 'correct-answer';
    }
    
    // CORREÇÃO: Mostrar múltiplos comentários se existirem
    const commentary = document.getElementById('commentary');
    if(commentary){
        const currentQuestion = window.questions[window.currentQuestionIndex];
        if(currentQuestion){
            let allComments = '';
            
            // Comentário principal
            if(currentQuestion.comentario){
                allComments += currentQuestion.comentario;
            }
            
            // Comentário2
            if(currentQuestion.comentario2){
                if(allComments) allComments += '<br><br>';
                allComments += currentQuestion.comentario2;
            }
            
            // Comentário3
            if(currentQuestion.comentario3){
                if(allComments) allComments += '<br><br>';
                allComments += currentQuestion.comentario3;
            }
            
            commentary.innerHTML = allComments;
            commentary.classList.add('active');
        }
    }
    
    // CORREÇÃO: Mostrar botão de Continuar imediatamente
    showSkipContinueButton();
    
    // CORREÇÃO: Não rodar equipe ao pular
    window.nextTeamRotation = false;
    window.consecutiveCorrect = 0;
}

function disableAllButtons(){
    ['certo-btn', 'errado-btn', 'skip-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.disabled = true;
    });
}

// CORREÇÃO: Nova função para mostrar botão Continuar após pular
function showSkipContinueButton(){
    const nextBtn = document.getElementById('next-question-btn');
    const podiumBtn = document.getElementById('podium-btn');
    
    if(nextBtn){
        nextBtn.textContent = '⏭️ Continuar';
        nextBtn.style.display = 'inline-block';
        nextBtn.disabled = false;
        
        // CORREÇÃO: Adicionar event listener se não existir
        if(!nextBtn._skipListenerAdded){
            const originalOnclick = nextBtn.onclick;
            nextBtn.onclick = function(e){
                e.preventDefault();
                e.stopPropagation();
                console.log('⏭️ Continuando após pular...');
                window.nextQuestion && window.nextQuestion();
            };
            nextBtn._skipListenerAdded = true;
        }
    }
    
    if(podiumBtn) podiumBtn.style.display = 'none';
}

window.skipQuestion = skipQuestion;
window.disableAllButtons = disableAllButtons;
window.showSkipContinueButton = showSkipContinueButton;