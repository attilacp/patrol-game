// js/game-coordinator.js - COORDENADOR CENTRAL (SEM DUPLICAÇÕES)
console.log('🎮 game-coordinator.js carregando...');

/**
 * Este arquivo SUBSTITUI a lógica duplicada em:
 * - answerButtons.js (botão próxima)
 * - controlButtons.js (botão próxima)
 * 
 * Garante que cada ação aconteça UMA ÚNICA VEZ
 */

class GameCoordinator {
    constructor() {
        this.processing = false; // Prevenir cliques duplicados
    }

    async handleNextQuestion() {
        if (this.processing) {
            console.log('⏳ Já processando, ignorando clique...');
            return;
        }

        if (!window.roomSystem?.isMaster) {
            console.log('⏭️ Apenas mestre pode avançar');
            return;
        }

        this.processing = true;
        console.log('⏭️ Avançando para próxima pergunta...');

        try {
            // Verificar se deve rodar equipe
            if (window.nextTeamRotation === true) {
                console.log('🔄 Rodízio ativado, rodando equipe...');
                if (window.turnSystem) {
                    window.turnSystem.rotateTeam();
                }
                window.nextTeamRotation = false;
            } else {
                console.log('✅ Sem rodízio, mantendo equipe atual');
            }

            // Avançar pergunta UMA VEZ
            if (window.turnSystem?.advanceToNextQuestion) {
                await window.turnSystem.advanceToNextQuestion();
            }
        } finally {
            // Liberar após 500ms
            setTimeout(() => {
                this.processing = false;
            }, 500);
        }
    }

    setupButtonListeners() {
        console.log('🎯 Configurando listeners centralizados...');

        // Botão PRÓXIMA - UMA ÚNICA VEZ
        const nextBtn = document.getElementById('next-question-btn');
        if (nextBtn) {
            // Remover listeners antigos
            const newNextBtn = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

            // Adicionar NOVO listener
            newNextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleNextQuestion();
            });

            console.log('✅ Botão PRÓXIMA configurado (SEM duplicação)');
        }

        // Botão PÓDIO
        const podiumBtn = document.getElementById('podium-btn');
        if (podiumBtn) {
            podiumBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.showPodium) window.showPodium();
            });
        }
    }
}

// Instanciar coordenador
window.gameCoordinator = new GameCoordinator();

// Configurar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.gameCoordinator) {
            window.gameCoordinator.setupButtonListeners();
        }
    }, 2000);
});

console.log('✅ game-coordinator.js carregado');
