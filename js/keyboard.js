// file name: js/gameEvents/keyboard.js
console.log('🎮 gameEvents/keyboard.js carregando...');

function setupKeyboardShortcuts() {
    console.log('⌨️ Configurando atalhos de teclado...');
    
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (window.bombQuestionSystem && window.bombQuestionSystem.isBombActive) return;
        
        const key = e.key.toLowerCase();
        
        switch(key) {
            case 'c':
                if (!window.gameStarted || window.winnerTeam || window.keyboardEnabled === false) return;
                e.preventDefault();
                console.log('⌨️ Tecla C pressionada - Resposta CERTO');
                window.checkAnswer?.('CERTO');
                break;
                
            case 'e':
                if (!window.gameStarted || window.winnerTeam || window.keyboardEnabled === false) return;
                e.preventDefault();
                console.log('⌨️ Tecla E pressionada - Resposta ERRADO');
                window.checkAnswer?.('ERRADO');
                break;
                
            case 'enter':
                e.preventDefault();
                console.log('⌨️ Enter pressionado');
                
                const nextBtn = document.getElementById('next-question-btn');
                const podiumBtn = document.getElementById('podium-btn');
                
                if (nextBtn && nextBtn.style.display !== 'none') {
                    window.nextQuestion?.();
                } else if (podiumBtn && podiumBtn.style.display !== 'none') {
                    window.showPodium?.();
                }
                break;
        }
    });
    
    console.log('✅ Atalhos de teclado configurados');
}

// Exportar
if (typeof window !== 'undefined') {
    window.setupKeyboardShortcuts = setupKeyboardShortcuts;
    console.log('✅ gameEvents/keyboard.js exportado');
}