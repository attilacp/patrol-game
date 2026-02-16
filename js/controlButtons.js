// file name: js/gameEvents/controlButtons.js
console.log('🎮 gameEvents/controlButtons.js carregando...');

function setupControlButtonEvents() {
    console.log('⚙️ Configurando eventos dos botões de controle...');
    
    // Botão Próxima Pergunta
    const nextQuestionBtn = document.getElementById('next-question-btn');
    if (nextQuestionBtn) {
        // VERIFICAR SE GAME COORDINATOR JÁ ESTÁ ATIVO
        if (window.gameCoordinator) {
            console.log('🎯 GameCoordinator ativo - pulando configuração');
            console.log('✅ Event listener do botão Próxima Pergunta configurado');
            return;
        }
        
        nextQuestionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('⏭️ Botão Próxima Pergunta clicado');
            
            if (window.roomSystem && window.roomSystem.isMaster) {
                console.log('👑 Mestre avançando pergunta...');
                
                // 1. Verificar se precisa rodar equipe (apenas se marcado por regras específicas)
                const shouldRotate = window.nextTeamRotation === true;
                
                if (shouldRotate) {
                    console.log('🔄 Rodando equipe (regra ativada)...');
                    if (window.turnSystem && window.turnSystem.rotateTeam) {
                        window.turnSystem.rotateTeam();
                    } else if (window.rotateTeam) {
                        window.rotateTeam();
                    }
                    window.nextTeamRotation = false; // Resetar flag
                } else {
                    console.log('✅ Mantendo mesma equipe (sem rodízio)');
                }
                
                // 2. Avançar para próxima pergunta
                if (window.turnSystem && window.turnSystem.advanceToNextQuestion) {
                    window.turnSystem.advanceToNextQuestion();
                } else if (window.nextQuestion) {
                    window.nextQuestion();
                } else {
                    console.error('❌ Nenhum sistema para avançar pergunta');
                }
                
            } else {
                console.log('⏳ Apenas o mestre pode avançar pergunta');
            }
        });
        console.log('✅ Event listener do botão Próxima Pergunta configurado');
    }
    
    // Botão Configurações
    const backToConfigBtn = document.getElementById('back-to-config');
    if (backToConfigBtn) {
        backToConfigBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('⚙️ Botão Config clicado');
            if (window.handleBackToConfig) {
                window.handleBackToConfig();
            } else {
                console.error('❌ Função handleBackToConfig não disponível');
            }
        });
        console.log('✅ Event listener do botão Config configurado');
    }
    
    // Botão Pódio
    const podiumBtn = document.getElementById('podium-btn');
    if (podiumBtn) {
        podiumBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🏆 Botão Pódio clicado');
            if (window.showPodium) {
                window.showPodium();
            } else if (window.goToPodium) {
                window.goToPodium();
            } else {
                console.error('❌ Função de pódio não disponível');
            }
        });
        console.log('✅ Event listener do botão Pódio configurado');
    }
    
    // Botão Notas (na tela do jogo)
    const openNotesGameBtn = document.getElementById('open-notes-btn');
    if (openNotesGameBtn) {
        openNotesGameBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📝 Botão Notas clicado (jogo)');
            if (window.openNotes) {
                window.openNotes();
            } else {
                console.error('❌ Função openNotes não disponível');
            }
        });
        console.log('✅ Event listener do botão Notas (jogo) configurado');
    }
}

// Exportar
if (typeof window !== 'undefined') {
    window.setupControlButtonEvents = setupControlButtonEvents;
    console.log('✅ gameEvents/controlButtons.js exportado');
}