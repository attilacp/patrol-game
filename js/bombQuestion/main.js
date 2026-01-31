// file name: bombQuestion/main.js (SIMPLIFICADO)
console.log("🚀 Inicializando sistema de PB...");

// Função simplificada para inicializar o sistema
function initializeBombQuestionSystem() {
    try {
        // Verificar classes essenciais
        const essentialClasses = ['PenaltyModal', 'BombFileLoader', 'BombQuestionSystem'];
        const missingClasses = [];
        
        essentialClasses.forEach(className => {
            if (typeof window[className] === 'undefined') {
                missingClasses.push(className);
            }
        });
        
        if (missingClasses.length > 0) {
            console.error('❌ Classes faltantes:', missingClasses);
            return createFallbackBombSystem();
        }
        
        const bombSystem = new BombQuestionSystem();
        console.log('🎉 Sistema PB modular OK');
        return bombSystem;
        
    } catch (error) {
        console.error('❌ Erro ao inicializar sistema PB:', error);
        return createFallbackBombSystem();
    }
}

function createFallbackBombSystem() {
    console.warn('⚠️ Criando sistema de fallback para PB');
    return {
        bombQuestions: {},
        currentBombQuestion: null,
        isBombActive: false,
        loadError: null,
        loadBombQuestions: function(workbook, fileName) {
            console.log('📄 Carregando (fallback):', fileName);
        },
        activateBombQuestion: function() {
            return false;
        },
        getLoadStatus: function() {
            return { loaded: false, error: 'Sistema de fallback' };
        }
    };
}

// Inicializar quando o DOM estiver pronto
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.bombQuestionSystem = initializeBombQuestionSystem();
        });
    } else {
        window.bombQuestionSystem = initializeBombQuestionSystem();
    }
}