// js/debug.js - Sistema de DEBUG
console.log('=== DEBUG DE CARREGAMENTO ===');

window.addEventListener('load', function() {
    console.log('Verificando funções críticas:');
    console.log('- initializeGameEventListeners:', typeof initializeGameEventListeners);
    console.log('- startGame:', typeof startGame);
    console.log('- checkStartGame:', typeof checkStartGame);
    console.log('- handleFileUpload:', typeof handleFileUpload);
    
    setTimeout(function() {
        var startBtn = document.getElementById('start-game-btn');
        var fileInput = document.getElementById('excel-file');
        
        if (fileInput && typeof handleFileUpload === 'function' && !fileInput.onchange) {
            fileInput.addEventListener('change', handleFileUpload);
            console.log('✅ Event listener do arquivo conectado');
        }
        
        console.log('=== FIM DEBUG ===');
    }, 1000);
});