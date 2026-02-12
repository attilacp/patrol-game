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

        // Permitir mestre OU jogador da equipe de plantão
        const canAdvance = window.roomSystem?.isMaster || 
                          (window.turnSystem && window.turnSystem.canPlayerAnswer());
        
        if (!canAdvance) {
            console.log('⏭️ Apenas mestre ou equipe de plantão pode avançar');
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
        console.log('🔍 DOM atual:', document.readyState);

        // Usar MutationObserver para detectar quando botão "Próxima" aparece
        const observeNextButton = () => {
            const nextBtn = document.getElementById('next-question-btn');
            console.log('🔍 Procurando botão PRÓXIMA...', !!nextBtn);
            
            if (nextBtn && nextBtn.style.display !== 'none') {
                console.log('📍 Botão encontrado e VISÍVEL! Style:', nextBtn.style.display);
                console.log('📍 Já configurado?', nextBtn.dataset.coordinatorConfigured);
                
                // SEMPRE reconfigurar quando fica visível
                console.log('⚙️ Configurando botão PRÓXIMA...');
                
                // Remover listeners antigos clonando
                const newNextBtn = nextBtn.cloneNode(true);
                nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

                // Adicionar NOVO listener
                newNextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🎯 Botão PRÓXIMA clicado (GameCoordinator)');
                    this.handleNextQuestion();
                });

                console.log('✅ Botão PRÓXIMA configurado (listener ativo)');
            }
        };

        // Observar mudanças no DOM para detectar botão
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.id === 'next-question-btn') {
                        console.log('🔄 Botão PRÓXIMA mudou:', target.style.display);
                        observeNextButton();
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });

        console.log('👁️ MutationObserver ativo');

        // Tentar configurar imediatamente também
        observeNextButton();
        
        // Tentar novamente após 1 segundo
        setTimeout(() => {
            console.log('🔁 Tentando novamente...');
            observeNextButton();
        }, 1000);

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

// Configurar IMEDIATAMENTE
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.gameCoordinator.setupButtonListeners();
    });
} else {
    // DOM já carregado
    window.gameCoordinator.setupButtonListeners();
}

console.log('✅ game-coordinator.js carregado');
