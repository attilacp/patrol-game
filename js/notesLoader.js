// file name: js/main/notesLoader.js
// Carregamento do sistema de notas

function loadNotesSystem() {
    console.log('📝 Carregando sistema de notas...');
    
    // Verificar se o sistema de notas já está carregado
    if (typeof window.initNotesSystem === 'function') {
        console.log('✅ Sistema de notas já carregado');
        window.initNotesSystem();
        return;
    }
    
    // Carregar script do sistema de notas
    const notesScript = document.createElement('script');
    notesScript.src = 'js/game/notes.js';
    notesScript.onload = function() {
        console.log('✅ Sistema de notas carregado com sucesso!');
        if (typeof window.initNotesSystem === 'function') {
            window.initNotesSystem();
        } else {
            console.warn('⚠️ Função initNotesSystem não encontrada após carregamento');
        }
    };
    
    notesScript.onerror = function() {
        console.error('❌ Erro ao carregar sistema de notas');
    };
    
    document.head.appendChild(notesScript);
}

// Exportar para uso global
window.loadNotesSystem = loadNotesSystem;

console.log('✅ notesLoader.js carregado com sucesso!');