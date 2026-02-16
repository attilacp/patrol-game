ARQUIVO: events.js
LOCALIZAÇÃO: js/events.js
===============================================

// PATROL - Sistema de Eventos
console.log('⚡ Events carregando...');

const EventSystem = {
    init() {
        this.setupGameButtons();
        this.setupKeyboardShortcuts();
        this.setupPodiumButtons();
        console.log('✅ Events inicializado');
    },
    
    setupGameButtons() {
        // Botão Iniciar Jogo
        document.getElementById('start-game-btn')?.addEventListener('click', async () => {
            console.log('🎮 Iniciando jogo...');
            
            if (window.roomSystem && window.roomSystem.isMaster) {
                // Modo multiplayer - iniciar para todos
                await window.roomSystem.startGameForAll();
            } else {
                // Modo offline
                this.startOfflineGame();
            }
        });
        
        // Botão CERTO
        document.getElementById('certo-btn')?.addEventListener('click', () => {
            console.log('✅ Botão CERTO clicado');
            window.GameSystem.checkAnswer('CERTO');
        });
        
        // Botão ERRADO
        document.getElementById('errado-btn')?.addEventListener('click', () => {
            console.log('❌ Botão ERRADO clicado');
            window.GameSystem.checkAnswer('ERRADO');
        });
        
        // Botão Pular
        document.getElementById('skip-btn')?.addEventListener('click', () => {
            console.log('⏭️ Botão PULAR clicado');
            window.GameSystem.skipQuestion();
        });
        
        // Botão Próxima
        document.getElementById('next-btn')?.addEventListener('click', () => {
            console.log('⏭️ Botão PRÓXIMA clicado');
            window.GameSystem.nextQuestion();
        });
        
        // Botão Pódio
        document.getElementById('podium-btn')?.addEventListener('click', () => {
            console.log('🏆 Botão PÓDIO clicado');
            window.GameSystem.showPodium();
        });
        
        // Clique no turno da equipe para rotacionar
        document.getElementById('team-turn')?.addEventListener('click', () => {
            if (confirm('🔄 Deseja rotacionar para a próxima equipe?')) {
                window.TeamSystem.rotateTeam();
            }
        });
    },
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignorar se estiver digitando
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
        // Reiniciar
        document.getElementById('restart-btn')?.addEventListener('click', () => {
            if (confirm('🔄 Iniciar nova partida?')) {
                window.location.reload();
            }
        });
        
        // Configurações
        document.getElementById('config-btn')?.addEventListener('click', () => {
            Utils.showScreen('config-screen');
        });
    },
    
    startOfflineGame() {
        console.log('🎮 Iniciando jogo offline...');
        
        // Coletar dados
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
        
        // Ir para tela de jogo
        Utils.showScreen('game-screen');
        
        setTimeout(() => {
            window.GameSystem.start();
        }, 500);
    }
};

// Tornar acessível globalmente
window.EventSystem = EventSystem;

// Inicializar quando templates estiverem prontos
document.addEventListener('templatesLoaded', () => {
    setTimeout(() => {
        EventSystem.init();
    }, 500);
});

console.log('✅ Events carregado');