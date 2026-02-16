// file name: js/gameEvents/core.js
console.log('🎮 gameEvents/core.js carregando...');

function cleanupExistingEventListeners() {
    console.log('🧹 Limpando event listeners existentes...');
    
    const buttons = ['certo-btn', 'errado-btn', 'skip-btn', 'next-question-btn', 'back-to-config', 'podium-btn', 'open-notes-btn'];
    
    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        }
    });
    
    console.log('✅ Event listeners limpos');
}

// Exportar
if (typeof window !== 'undefined') {
    window.cleanupExistingEventListeners = cleanupExistingEventListeners;
    console.log('✅ gameEvents/core.js exportado');
}