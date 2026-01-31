// js/bombQuestion/core-base.js (COMPLETO CORRIGIDO)
class BombQuestionSystem {
    constructor() {
        this.bombQuestions = {};
        this.currentBombQuestion = null;
        this.isBombActive = false;
        this.loadError = null;
        this.penaltyResolve = null;
        this.selectedPenaltyTeam = null;
        this.normalState = null;
        this.usedQuestionIds = new Set();
        this.currentGameUsedQuestions = new Set();
        this.penaltyApplied = false;
        this.showingResults = false;
        
        this.initializeComponents();
    }

    initializeComponents() {
        console.log('💣 Inicializando componentes do sistema PB...');
        
        // Verificar se as classes estão disponíveis
        const classes = {
            'PenaltyModal': typeof PenaltyModal,
            'BombFileLoader': typeof BombFileLoader,
            'BombUIManager': typeof BombUIManager,
            'BombGameManager': typeof BombGameManager,
            'BombQuestionSelector': typeof BombQuestionSelector
        };
        
        console.log('📋 Classes disponíveis:', classes);
        
        // Verificar e instanciar cada componente
        try {
            if (typeof PenaltyModal !== 'undefined') {
                this.penaltyModal = new PenaltyModal(this);
                console.log('✅ PenaltyModal inicializado');
            } else {
                console.error('❌ PenaltyModal não definido');
            }
            
            if (typeof BombFileLoader !== 'undefined') {
                this.fileLoader = new BombFileLoader(this);
                console.log('✅ BombFileLoader inicializado');
            } else {
                console.error('❌ BombFileLoader não definido');
            }
            
            if (typeof BombUIManager !== 'undefined') {
                this.uiManager = new BombUIManager(this);
                console.log('✅ BombUIManager inicializado');
            } else {
                console.error('❌ BombUIManager não definido');
            }
            
            if (typeof BombGameManager !== 'undefined') {
                this.gameManager = new BombGameManager(this);
                console.log('✅ BombGameManager inicializado');
            } else {
                console.error('❌ BombGameManager não definido');
            }
            
            if (typeof BombQuestionSelector !== 'undefined') {
                this.questionSelector = new BombQuestionSelector(this);
                console.log('✅ BombQuestionSelector inicializado');
            } else {
                console.error('❌ BombQuestionSelector não definido');
            }
            
        } catch (error) {
            console.error('❌ Erro ao inicializar componentes:', error);
        }
        
        console.log('💣 Sistema PB inicializado (otimizado)');
    }

    loadBombQuestions(workbook, fileName) {
        if (this.fileLoader && this.fileLoader.loadBombQuestions) {
            this.fileLoader.loadBombQuestions(workbook, fileName);
        } else {
            console.error('❌ fileLoader não disponível');
            this.loadError = 'Sistema de carregamento não disponível';
        }
    }

    activateBombQuestion() {
        if (this.questionSelector && this.questionSelector.activateBombQuestion) {
            return this.questionSelector.activateBombQuestion();
        } else {
            console.error('❌ questionSelector não disponível');
            return false;
        }
    }

    checkBombAnswers() {
        if (this.gameManager && this.gameManager.checkBombAnswers) {
            this.gameManager.checkBombAnswers();
        } else {
            console.error('❌ gameManager não disponível');
        }
    }

    skipBombQuestion() {
        if (this.gameManager && this.gameManager.skipBombQuestion) {
            this.gameManager.skipBombQuestion();
        } else {
            console.error('❌ gameManager não disponível');
        }
    }

    finishBombQuestion(success) {
        if (this.gameManager && this.gameManager.finishBombQuestion) {
            this.gameManager.finishBombQuestion(success);
        } else {
            console.error('❌ gameManager não disponível');
        }
    }

    getLoadStatus() {
        if (this.questionSelector && this.questionSelector.getLoadStatus) {
            return this.questionSelector.getLoadStatus();
        } else {
            return { loaded: false, error: 'Sistema não inicializado' };
        }
    }

    resetUsedQuestions() {
        if (this.questionSelector && this.questionSelector.resetUsedQuestions) {
            return this.questionSelector.resetUsedQuestions();
        } else {
            console.error('❌ questionSelector não disponível');
            return false;
        }
    }

    getStatistics() {
        if (this.gameManager && this.gameManager.getStatistics) {
            return this.gameManager.getStatistics();
        }
        return null;
    }

    debugAvailableQuestions() {
        if (this.questionSelector && this.questionSelector.debugAvailableQuestions) {
            return this.questionSelector.debugAvailableQuestions();
        }
        return null;
    }

    clearHighlightedAnswers() {
        const items = document.querySelectorAll('.answer-item, .question-item');
        items.forEach(item => {
            item.style.backgroundColor = '';
            item.style.borderLeft = '';
            item.classList.remove('highlighted');
        });
    }

    restoreAnswerButtons() {
        ['certo-btn', 'errado-btn', 'skip-btn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = false;
        });
        
        const next = document.getElementById('next-question-btn');
        const podium = document.getElementById('podium-btn');
        if (next) next.style.display = 'none';
        if (podium) podium.style.display = window.winnerTeam ? 'block' : 'none';
    }

    verifyButtonsState() {
        ['certo-btn', 'errado-btn', 'skip-btn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn && btn.disabled) btn.disabled = false;
        });
    }

    // NOVO MÉTODO: Limpar cores da PB
    clearBombColors() {
        if (this.uiManager && this.uiManager.clearAllColors) {
            this.uiManager.clearAllColors();
        }
    }

    // NOVO MÉTODO: Aplicar cores aos pares (chamado após conferir)
    applyPairColors() {
        if (this.uiManager && this.uiManager.applyPairColors) {
            this.uiManager.applyPairColors();
        } else if (this.gameManager && this.gameManager.applyPairColors) {
            const items = document.querySelectorAll('#answers-sortable-list .answer-item');
            this.gameManager.applyPairColors(Array.from(items));
        }
    }
}

if (typeof window !== 'undefined') {
    window.BombQuestionSystem = BombQuestionSystem;
    console.log('✅ BombQuestionSystem definido globalmente');
}