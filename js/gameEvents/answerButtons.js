// js/gameEvents/answerButtons.js - VERSÃO COMPLETA COM MESTRE DIRETO
console.log('🎮 gameEvents/answerButtons.js carregando...');

function setupAnswerButtonEvents() {
    console.log('🎮 Configurando botões de resposta...');
    
    setupAnswerButtons();
    setupSkipButton();
    setupNextButton();
    setupPodiumButton();
    
    console.log('✅ Todos os botões configurados');
}

function setupAnswerButtons() {
    console.log('🔘 Configurando botões CERTO/ERRADO...');
    
    const certoBtn = document.getElementById('certo-btn');
    const erradoBtn = document.getElementById('errado-btn');
    
    if (certoBtn) {
        certoBtn.replaceWith(certoBtn.cloneNode(true));
        const newCertoBtn = document.getElementById('certo-btn');
        
        newCertoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('✅ Botão CERTO clicado - EVENT LISTENER ATIVO');
            
            // PRIORIDADE 1: MESTRE RESPONDE DIRETAMENTE
            if (window.roomSystem && window.roomSystem.isMaster) {
                console.log('👑 Mestre clicou em CERTO');
                if (window.turnSystem && window.turnSystem.submitAnswer) {
                    window.turnSystem.submitAnswer('CERTO');
                    return;
                }
            }
            
            // PRIORIDADE 2: Sistema de turnos para jogadores
            if (window.turnSystem) {
                console.log('🎯 Usando sistema de turnos...');
                window.turnSystem.submitAnswer('CERTO');
                return;
            }
            
            // PRIORIDADE 3: Sistema antigo com verificação de mestre
            if (window.checkAnswer && window.roomSystem) {
                if (window.roomSystem.isMaster || !window.turnSystem) {
                    window.checkAnswer('CERTO');
                    return;
                }
            }
            
            // PRIORIDADE 4: Sistema antigo sem verificação
            if (window.checkAnswer) {
                window.checkAnswer('CERTO');
                return;
            }
            
            console.error('❌ Nenhum sistema de resposta disponível');
            alert('Sistema de resposta não disponível. Recarregue a página.');
        });
        
        console.log('✅ Botão CERTO configurado');
    } else {
        console.error('❌ Botão CERTO não encontrado');
    }
    
    if (erradoBtn) {
        erradoBtn.replaceWith(erradoBtn.cloneNode(true));
        const newErradoBtn = document.getElementById('errado-btn');
        
        newErradoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('❌ Botão ERRADO clicado - EVENT LISTENER ATIVO');
            
            // PRIORIDADE 1: MESTRE RESPONDE DIRETAMENTE
            if (window.roomSystem && window.roomSystem.isMaster) {
                console.log('👑 Mestre clicou em ERRADO');
                if (window.turnSystem && window.turnSystem.submitAnswer) {
                    window.turnSystem.submitAnswer('ERRADO');
                    return;
                }
            }
            
            // PRIORIDADE 2: Sistema de turnos para jogadores
            if (window.turnSystem) {
                console.log('🎯 Usando sistema de turnos...');
                window.turnSystem.submitAnswer('ERRADO');
                return;
            }
            
            // PRIORIDADE 3: Sistema antigo com verificação de mestre
            if (window.checkAnswer && window.roomSystem) {
                if (window.roomSystem.isMaster || !window.turnSystem) {
                    window.checkAnswer('ERRADO');
                    return;
                }
            }
            
            // PRIORIDADE 4: Sistema antigo sem verificação
            if (window.checkAnswer) {
                window.checkAnswer('ERRADO');
                return;
            }
            
            console.error('❌ Nenhum sistema de resposta disponível');
            alert('Sistema de resposta não disponível. Recarregue a página.');
        });
        
        console.log('✅ Botão ERRADO configurado');
    } else {
        console.error('❌ Botão ERRADO não encontrado');
    }
}

function setupSkipButton() {
    console.log('⏭️ Configurando botão PULAR...');
    
    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) {
        skipBtn.replaceWith(skipBtn.cloneNode(true));
        const newSkipBtn = document.getElementById('skip-btn');
        
        newSkipBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('⏭️ Botão PULAR clicado');
            
            if (window.roomSystem && window.roomSystem.isMaster) {
                if (window.skipQuestion) {
                    window.skipQuestion();
                } else if (window.nextQuestion) {
                    window.nextQuestion();
                }
            } else {
                console.log('⏭️ Jogador não pode pular - apenas mestre');
                if (window.roomSystem) {
                    window.roomSystem.sendAction('skip_request', {
                        playerName: window.roomSystem.playerName
                    });
                    alert('📨 Pedido de pular enviado ao mestre');
                }
            }
        });
        
        console.log('✅ Botão PULAR configurado');
    } else {
        console.error('❌ Botão PULAR não encontrado');
    }
}

function setupNextButton() {
    console.log('➡️ Configurando botão PRÓXIMA...');
    
    // VERIFICAR SE GAME COORDINATOR JÁ ESTÁ ATIVO
    if (window.gameCoordinator) {
        console.log('🎯 GameCoordinator ativo - pulando configuração');
        console.log('✅ Botão PRÓXIMA configurado');
        return;
    }
    
    const nextBtn = document.getElementById('next-question-btn');
    if (nextBtn) {
        nextBtn.replaceWith(nextBtn.cloneNode(true));
        const newNextBtn = document.getElementById('next-question-btn');
        
        newNextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('⏭️ Botão Próxima Pergunta clicado');
            
            if (window.roomSystem && window.roomSystem.isMaster) {
                if (window.nextQuestion) {
                    window.nextQuestion();
                }
                
                if (window.turnSystem) {
                    window.turnSystem.advanceToNextQuestion();
                }
            } else {
                console.log('⏭️ Jogador não pode avançar - apenas mestre');
            }
        });
        
        console.log('✅ Botão PRÓXIMA configurado');
    } else {
        console.log('ℹ️ Botão PRÓXIMA não encontrado (pode estar oculto)');
    }
}

function setupPodiumButton() {
    console.log('🏆 Configurando botão PÓDIO...');
    
    const podiumBtn = document.getElementById('podium-btn');
    if (podiumBtn) {
        podiumBtn.replaceWith(podiumBtn.cloneNode(true));
        const newPodiumBtn = document.getElementById('podium-btn');
        
        newPodiumBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🏆 Botão Pódio clicado');
            
            if (window.authSystem && window.authSystem.showPodiumScreen) {
                window.authSystem.showPodiumScreen();
            } else if (window.showPodium) {
                window.showPodium();
            } else {
                console.error('❌ Função de pódio não disponível');
                alert('Sistema de pódio não disponível');
            }
        });
        
        console.log('✅ Botão PÓDIO configurado');
    } else {
        console.log('ℹ️ Botão PÓDIO não encontrado (pode estar oculto)');
    }
}

function setupKeyboardShortcuts() {
    console.log('⌨️ Configurando atalhos de teclado...');
    
    document.addEventListener('keydown', function(e) {
        if (!window.keyboardEnabled) return;
        
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key.toUpperCase()) {
            case 'C':
            case '1':
                document.getElementById('certo-btn')?.click();
                break;
                
            case 'E':
            case '2':
                document.getElementById('errado-btn')?.click();
                break;
                
            case ' ':
            case 'S':
                if (window.roomSystem?.isMaster) {
                    document.getElementById('skip-btn')?.click();
                }
                break;
                
            case 'N':
            case 'ENTER':
                if (window.roomSystem?.isMaster) {
                    document.getElementById('next-question-btn')?.click();
                }
                break;
        }
    });
    
    console.log('✅ Atalhos de teclado configurados');
}

if (typeof window !== 'undefined') {
    window.setupAnswerButtonEvents = setupAnswerButtonEvents;
    window.setupAnswerButtons = setupAnswerButtons;
    window.setupSkipButton = setupSkipButton;
    window.setupNextButton = setupNextButton;
    window.setupPodiumButton = setupPodiumButton;
    window.setupKeyboardShortcuts = setupKeyboardShortcuts;
    
    console.log('✅ answerButtons.js exportado');
}