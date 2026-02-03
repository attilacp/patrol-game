// js/gameEvents/answerButtons.js - VERSÃO COMPLETA
console.log('🎮 gameEvents/answerButtons.js carregando...');

function setupAnswerButtonEvents() {
    console.log('🎮 Configurando botões de resposta...');
    
    // 1. BOTÕES CERTO/ERRADO
    setupAnswerButtons();
    
    // 2. BOTÃO PULAR
    setupSkipButton();
    
    // 3. BOTÃO PRÓXIMA PERGUNTA
    setupNextButton();
    
    // 4. BOTÃO RODÍZIO (APENAS MESTRE)
    setupRotateButton();
    
    // 5. BOTÃO PÓDIO
    setupPodiumButton();
    
    console.log('✅ Todos os botões configurados');
}

function setupAnswerButtons() {
    console.log('🔘 Configurando botões CERTO/ERRADO...');
    
    const certoBtn = document.getElementById('certo-btn');
    const erradoBtn = document.getElementById('errado-btn');
    
    if (certoBtn) {
        // Remover event listeners antigos
        certoBtn.replaceWith(certoBtn.cloneNode(true));
        const newCertoBtn = document.getElementById('certo-btn');
        
        newCertoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('✅ Botão CERTO clicado - EVENT LISTENER ATIVO');
            
            // PRIORIDADE 1: Sistema de turnos
            if (window.turnSystem) {
                console.log('🎯 Usando sistema de turnos...');
                window.turnSystem.submitAnswer('CERTO');
                return;
            }
            
            // PRIORIDADE 2: Sistema antigo com verificação de mestre
            if (window.checkAnswer && window.roomSystem) {
                // Se for mestre ou não houver sistema de turnos, usar sistema antigo
                if (window.roomSystem.isMaster || !window.turnSystem) {
                    window.checkAnswer('CERTO');
                    return;
                }
            }
            
            // PRIORIDADE 3: Sistema antigo sem verificação
            if (window.checkAnswer) {
                window.checkAnswer('CERTO');
                return;
            }
            
            // FALLBACK
            console.error('❌ Nenhum sistema de resposta disponível');
            alert('Sistema de resposta não disponível. Recarregue a página.');
        });
        
        console.log('✅ Botão CERTO configurado');
    } else {
        console.error('❌ Botão CERTO não encontrado');
    }
    
    if (erradoBtn) {
        // Remover event listeners antigos
        erradoBtn.replaceWith(erradoBtn.cloneNode(true));
        const newErradoBtn = document.getElementById('errado-btn');
        
        newErradoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('❌ Botão ERRADO clicado - EVENT LISTENER ATIVO');
            
            // PRIORIDADE 1: Sistema de turnos
            if (window.turnSystem) {
                console.log('🎯 Usando sistema de turnos...');
                window.turnSystem.submitAnswer('ERRADO');
                return;
            }
            
            // PRIORIDADE 2: Sistema antigo com verificação de mestre
            if (window.checkAnswer && window.roomSystem) {
                if (window.roomSystem.isMaster || !window.turnSystem) {
                    window.checkAnswer('ERRADO');
                    return;
                }
            }
            
            // PRIORIDADE 3: Sistema antigo sem verificação
            if (window.checkAnswer) {
                window.checkAnswer('ERRADO');
                return;
            }
            
            // FALLBACK
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
        // Remover event listeners antigos
        skipBtn.replaceWith(skipBtn.cloneNode(true));
        const newSkipBtn = document.getElementById('skip-btn');
        
        newSkipBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('⏭️ Botão PULAR clicado');
            
            // Se for mestre, pular
            if (window.roomSystem && window.roomSystem.isMaster) {
                if (window.skipQuestion) {
                    window.skipQuestion();
                } else if (window.nextQuestion) {
                    window.nextQuestion();
                }
            } else {
                console.log('⏭️ Jogador não pode pular - apenas mestre');
                // Jogador pode pedir para pular (opcional)
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
    
    const nextBtn = document.getElementById('next-question-btn');
    if (nextBtn) {
        // Remover event listeners antigos
        nextBtn.replaceWith(nextBtn.cloneNode(true));
        const newNextBtn = document.getElementById('next-question-btn');
        
        newNextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('⏭️ Botão Próxima Pergunta clicado');
            
            // Apenas mestre pode avançar
            if (window.roomSystem && window.roomSystem.isMaster) {
                if (window.nextQuestion) {
                    window.nextQuestion();
                }
                
                // Se tiver sistema de turnos, usar ele
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

function setupRotateButton() {
    console.log('🔄 Configurando botão RODÍZIO...');
    
    // Remover botão anterior se existir
    const oldRotateBtn = document.getElementById('rotate-team-btn');
    if (oldRotateBtn) oldRotateBtn.remove();
    
    // Criar novo botão
    const rotateBtn = document.createElement('button');
    rotateBtn.id = 'rotate-team-btn';
    rotateBtn.className = 'rotate-btn';
    rotateBtn.innerHTML = '🔄 Rodízio';
    rotateBtn.style.cssText = `
        background: linear-gradient(145deg, #6f42c1, #5a32a3);
        color: white;
        border: 2px solid #4a2384;
        padding: 8px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        font-size: 14px;
        display: none;
        margin-left: 10px;
        transition: all 0.3s;
    `;
    
    rotateBtn.onmouseenter = function() {
        rotateBtn.style.transform = 'translateY(-2px)';
        rotateBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    };
    
    rotateBtn.onmouseleave = function() {
        rotateBtn.style.transform = 'translateY(0)';
        rotateBtn.style.boxShadow = 'none';
    };
    
    rotateBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔄 Botão Rodízio clicado');
        
        // Apenas mestre pode rodar equipe
        if (window.roomSystem && window.roomSystem.isMaster) {
            // PRIORIDADE: Sistema de turnos
            if (window.turnSystem) {
                window.turnSystem.rotateTeam();
                return;
            }
            
            // Fallback: sistema antigo
            if (window.rotateTeam) {
                window.rotateTeam();
                return;
            }
            
            // Fallback manual
            if (window.teams && window.teams.length > 1) {
                const nextIndex = (window.currentTeamIndex + 1) % window.teams.length;
                window.currentTeamIndex = nextIndex;
                console.log('🔄 Equipe manualmente rotacionada para:', window.teams[nextIndex].name);
                
                if (window.updateTeamsDisplay) {
                    window.updateTeamsDisplay();
                }
                
                if (window.showQuestion) {
                    window.showQuestion();
                }
            }
        } else {
            console.log('🔄 Apenas o mestre pode rodar equipes');
            alert('⏳ Aguarde o mestre rodar a equipe');
        }
    };
    
    // Adicionar ao cabeçalho da pergunta
    const questionHeader = document.querySelector('.question-header-buttons');
    if (questionHeader) {
        questionHeader.appendChild(rotateBtn);
        
        // Mostrar apenas para mestre
        if (window.roomSystem && window.roomSystem.isMaster) {
            rotateBtn.style.display = 'block';
            console.log('👑 Botão Rodízio visível para mestre');
        } else {
            console.log('👤 Botão Rodízio oculto para jogador');
        }
    } else {
        console.error('❌ Cabeçalho da pergunta não encontrado');
    }
    
    console.log('✅ Botão RODÍZIO configurado');
}

function setupPodiumButton() {
    console.log('🏆 Configurando botão PÓDIO...');
    
    const podiumBtn = document.getElementById('podium-btn');
    if (podiumBtn) {
        // Remover event listeners antigos
        podiumBtn.replaceWith(podiumBtn.cloneNode(true));
        const newPodiumBtn = document.getElementById('podium-btn');
        
        newPodiumBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🏆 Botão Pódio clicado');
            
            // Ir para tela de pódio
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

// Configurar atalhos de teclado
function setupKeyboardShortcuts() {
    console.log('⌨️ Configurando atalhos de teclado...');
    
    document.addEventListener('keydown', function(e) {
        if (!window.keyboardEnabled) return;
        
        // Evitar atalhos em campos de entrada
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
                
            case 'R':
                if (window.roomSystem?.isMaster) {
                    document.getElementById('rotate-team-btn')?.click();
                }
                break;
        }
    });
    
    console.log('✅ Atalhos de teclado configurados');
}

// Exportar funções
if (typeof window !== 'undefined') {
    window.setupAnswerButtonEvents = setupAnswerButtonEvents;
    window.setupAnswerButtons = setupAnswerButtons;
    window.setupSkipButton = setupSkipButton;
    window.setupNextButton = setupNextButton;
    window.setupRotateButton = setupRotateButton;
    window.setupPodiumButton = setupPodiumButton;
    window.setupKeyboardShortcuts = setupKeyboardShortcuts;
    
    console.log('✅ answerButtons.js exportado');
}