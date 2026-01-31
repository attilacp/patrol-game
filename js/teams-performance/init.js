// file name: teams-performance/init.js
function initTeamPerformanceSystem() {
    console.log('Inicializando sistema de performance...');
    
    try {
        if (typeof addPerformanceCSS === 'function') {
            addPerformanceCSS();
        }
        
        if (typeof initializeTeamPerformanceTracking === 'function') {
            initializeTeamPerformanceTracking();
        }
        
        // Adicionar event listener para respostas
        document.addEventListener('answerGiven', function(e) {
            if (e.detail && e.detail.team && e.detail.question && e.detail.isCorrect !== undefined) {
                if (typeof updateTeamPerformance === 'function') {
                    updateTeamPerformance(e.detail.team, e.detail.question, e.detail.isCorrect);
                }
                
                setTimeout(() => {
                    if (typeof window.updateTeamsDisplay === 'function') {
                        window.updateTeamsDisplay();
                    }
                }, 100);
            }
        });
        
        window.performanceSystemInitialized = true;
        console.log('✅ Sistema de performance inicializado');
        
        setTimeout(() => {
            if (typeof window.updateTeamsDisplay === 'function') {
                window.updateTeamsDisplay();
            }
        }, 200);
        
    } catch (error) {
        console.error('Erro ao inicializar sistema de performance:', error);
    }
}

// Exportar
window.initTeamPerformanceSystem = initTeamPerformanceSystem;