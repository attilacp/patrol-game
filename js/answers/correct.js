// file name: answers/correct.js - VERSÃO ATUALIZADA
function handleCorrectAnswer() {
    if (window.currentQuestionProcessed || window.winnerTeam) return;
    window.currentQuestionProcessed = true;
    
    var team = window.teams[window.currentTeamIndex];
    team.questionsAnswered = (team.questionsAnswered || 0) + 1;
    team.score += 1; // APENAS 1 PONTO
    window.consecutiveCorrect++;
    
    console.log(team.name + ' acertou! Score: ' + team.score + ', Consecutivos: ' + window.consecutiveCorrect);
    
    if (team.score >= 15) {
        window.winnerTeam = team;
        showWinnerMessage();
        return;
    }
    
    var config = window.bombQuestionConfig?.getConfig() || {consecutiveToActivate: 3, enabled: true};
    
    // REGRA 1: SE ATINGIU 5 ACERTOS CONSECUTIVOS, RODAR EQUIPE
    if (window.consecutiveCorrect >= 5) {
        console.log('🏆 5 acertos consecutivos - RODANDO EQUIPE');
        window.nextTeamRotation = true; // Marcar para rodar na próxima pergunta
        window.consecutiveCorrect = 0; // Zerar contador
        
        // SALVAR FLAG NO FIREBASE
        if (window.roomSystem && window.roomSystem.currentRoom) {
            firebase.database()
                .ref(`rooms/${window.roomSystem.currentRoom}/nextTeamRotation`)
                .set(true)
                .then(() => console.log('💾 Flag de rodízio salva no Firebase'))
                .catch(err => console.error('❌ Erro ao salvar flag:', err));
        }
    }
    
    // VERIFICAR SE DEVE ATIVAR PB (3 acertos) - MAS SÓ SE HOUVER PB DISPONÍVEL
    if (config.enabled && window.consecutiveCorrect >= config.consecutiveToActivate) {
        
        // VERIFICAR SE HÁ PB DISPONÍVEL
        const hasPB = window.bombQuestionSystem && 
                     window.bombQuestionSystem.getLoadStatus && 
                     window.bombQuestionSystem.getLoadStatus().loaded;
        
        if (hasPB) {
            console.log(`🎯 ${config.consecutiveToActivate} acertos consecutivos - PREPARANDO PB...`);
            
            // Marcar que há PB pendente
            window.pendingBombQuestion = true;
            
            // Mostrar botão especial para ir para PB
            const nextBtn = document.getElementById('next-question-btn');
            if (nextBtn) {
                nextBtn.textContent = '💣 IR PARA PERGUNTA BOMBA';
                nextBtn.style.display = 'inline-block';
                nextBtn.disabled = false;
                
                // Substituir botão para evitar duplicação
                const newNextBtn = nextBtn.cloneNode(true);
                nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
                
                document.getElementById('next-question-btn').onclick = function(e) {
                    e.preventDefault?.();
                    e.stopPropagation?.();
                    console.log('Indo para PB...');
                    
                    // Resetar flags antes de ir para PB
                    window.nextTeamRotation = false;
                    window.consecutiveCorrect = 0;
                    window.pendingBombQuestion = false;
                    
                    // Avançar para próxima pergunta (que será a PB)
                    window.currentQuestionIndex++;
                    
                    // Forçar ativação da PB na próxima pergunta
                    setTimeout(() => {
                        if (window.bombQuestionSystem && window.bombQuestionSystem.activateBombQuestion) {
                            const activated = window.bombQuestionSystem.activateBombQuestion();
                            if (!activated) {
                                console.log('❌ Falha ao ativar PB, continuando jogo normal');
                                window.showQuestion?.();
                            }
                        } else {
                            console.log('❌ Sistema PB não disponível, continuando jogo normal');
                            window.showQuestion?.();
                        }
                    }, 100);
                };
            }
        } else {
            console.log(`🎯 ${config.consecutiveToActivate} acertos consecutivos, mas NÃO há PB disponível`);
            // Não fazer nada - o jogo continua normal
        }
    }
    
    console.log('✅ Acerto processado. Consecutivos:', window.consecutiveCorrect);
}

window.handleCorrectAnswer = handleCorrectAnswer;