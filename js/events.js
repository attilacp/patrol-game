// PATROL - Sistema de Eventos
console.log('⚡ Events carregando...');

const EventSystem = {
    init() {
        this.setupGameButtons();
        this.setupKeyboardShortcuts();
        this.setupPodiumButtons();
        this.setupNavigationButtons();
        console.log('✅ Events inicializado');
    },
    
    setupGameButtons() {
        document.getElementById('start-game-btn')?.addEventListener('click', async () => {
            console.log('🎮 Iniciando jogo...');
            
            if (window.roomSystem && window.roomSystem.isMaster) {
                await window.roomSystem.startGameForAll();
            } else {
                this.startOfflineGame();
            }
        });
        
        document.getElementById('certo-btn')?.addEventListener('click', () => {
            console.log('✅ Botão CERTO clicado');
            window.GameSystem.checkAnswer('CERTO');
        });
        
        document.getElementById('errado-btn')?.addEventListener('click', () => {
            console.log('❌ Botão ERRADO clicado');
            window.GameSystem.checkAnswer('ERRADO');
        });
        
        document.getElementById('skip-btn')?.addEventListener('click', () => {
            // Pular: Mestre OU equipe de plantão
            if (window.roomSystem) {
                // Se for mestre, sempre pode
                if (window.roomSystem.isMaster) {
                    console.log('⏭️ Botão PULAR clicado (mestre)');
                    window.GameSystem.skipQuestion();
                    return;
                }
                
                // Se não for mestre, verificar se está na equipe de plantão
                const currentTeam = window.TeamSystem.teams[window.TeamSystem.currentTeamIndex];
                const playerTeamId = window.roomSystem.playerTeamId;
                
                if (!currentTeam || playerTeamId !== currentTeam.id) {
                    Utils.notify('⛔ Apenas mestre ou equipe de plantão podem pular', 'warning');
                    return;
                }
                
                console.log('⏭️ Botão PULAR clicado (equipe de plantão)');
                window.GameSystem.skipQuestion();
            } else {
                // Modo offline
                console.log('⏭️ Botão PULAR clicado');
                window.GameSystem.skipQuestion();
            }
        });
        
        document.getElementById('next-btn')?.addEventListener('click', () => {
            // Próxima: Mestre OU equipe de plantão
            if (window.roomSystem) {
                // Se for mestre, sempre pode
                if (window.roomSystem.isMaster) {
                    console.log('⏭️ Botão PRÓXIMA clicado (mestre)');
                    window.GameSystem.nextQuestion();
                    return;
                }
                
                // Se não for mestre, verificar se está na equipe de plantão
                const currentTeam = window.TeamSystem.teams[window.TeamSystem.currentTeamIndex];
                const playerTeamId = window.roomSystem.playerTeamId;
                
                if (!currentTeam || playerTeamId !== currentTeam.id) {
                    Utils.notify('⛔ Apenas mestre ou equipe de plantão podem avançar', 'warning');
                    return;
                }
                
                console.log('⏭️ Botão PRÓXIMA clicado (equipe de plantão)');
                window.GameSystem.nextQuestion();
            } else {
                // Modo offline
                console.log('⏭️ Botão PRÓXIMA clicado');
                window.GameSystem.nextQuestion();
            }
        });
        
        document.getElementById('podium-btn')?.addEventListener('click', () => {
            console.log('🏆 Botão PÓDIO clicado');
            window.GameSystem.showPodium();
        });
        
        document.getElementById('team-turn')?.addEventListener('click', () => {
            // Rodízio: TODOS podem apertar
            if (confirm('🔄 Deseja rotacionar para a próxima equipe?')) {
                window.TeamSystem.rotateTeam();
            }
        });
    },
    
    setupNavigationButtons() {
        document.getElementById('back-to-config-btn')?.addEventListener('click', () => {
            if (confirm('⚙️ Voltar para configuração?\n\nO jogo atual será pausado.')) {
                Utils.showScreen('config-screen');
            }
        });
        
        document.getElementById('open-notes-btn')?.addEventListener('click', () => {
            Utils.notify('📝 Sistema de notas em desenvolvimento', 'info');
        });
    },
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            const key = e.key.toLowerCase();
            
            switch(key) {
                case 'c':
                    e.preventDefault();
                    document.getElementById('certo-btn')?.click();
                    break;
                    
                case 'e':
                    e.preventDefault();
                    document.getElementById('errado-btn')?.click();
                    break;
                    
                case 's':
                    e.preventDefault();
                    document.getElementById('skip-btn')?.click();
                    break;
                    
                case 'enter':
                    e.preventDefault();
                    const nextBtn = document.getElementById('next-btn');
                    const podiumBtn = document.getElementById('podium-btn');
                    
                    if (nextBtn && nextBtn.style.display !== 'none') {
                        nextBtn.click();
                    } else if (podiumBtn && podiumBtn.style.display !== 'none') {
                        podiumBtn.click();
                    }
                    break;
            }
        });
        
        console.log('⌨️ Atalhos de teclado configurados (C, E, S, Enter)');
    },
    
    setupPodiumButtons() {
        document.getElementById('restart-btn')?.addEventListener('click', () => {
            if (confirm('🔄 Iniciar nova partida?')) {
                window.location.reload();
            }
        });
        
        document.getElementById('config-btn')?.addEventListener('click', () => {
            Utils.showScreen('config-screen');
        });
    },
    
    startOfflineGame() {
        console.log('🎮 Iniciando jogo offline...');
        
        const questions = window.QuestionSystem.collectQuestions();
        const teams = window.TeamSystem.collectTeams();
        
        if (questions.length === 0) {
            Utils.notify('❌ Nenhuma pergunta carregada', 'error');
            return;
        }
        
        if (teams.length === 0) {
            Utils.notify('❌ Nenhuma equipe configurada', 'error');
            return;
        }
        
        Utils.showScreen('game-screen');
        
        setTimeout(() => {
            window.GameSystem.start();
        }, 500);
    }
};

window.EventSystem = EventSystem;

document.addEventListener('templatesLoaded', () => {
    setTimeout(() => {
        EventSystem.init();
    }, 500);
});

console.log('✅ Events carregado');
