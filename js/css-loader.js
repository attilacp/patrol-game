// js/css-loader.js
console.log('🎨 css-loader.js carregando...');

const CSS_FILES = [
    'css/base.css',
    'css/buttons.css',
    'css/forms.css',
    'css/cards.css',
    'css/modal.css',
    'css/podium.css',
    'css/bomb-question.css',
    'css/performance.css',
    'css/lobby.css',
    'css/game.css',
    'css/responsive.css'
];

function loadCSSFiles() {
    console.log('🎨 Carregando arquivos CSS...');
    
    let loadedCount = 0;
    const totalFiles = CSS_FILES.length;
    
    CSS_FILES.forEach(cssFile => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssFile;
        link.onload = () => {
            loadedCount++;
            console.log(`✅ CSS carregado: ${cssFile} (${loadedCount}/${totalFiles})`);
            
            if (loadedCount === totalFiles) {
                console.log('🎨 Todos os arquivos CSS carregados!');
                document.dispatchEvent(new Event('cssLoaded'));
            }
        };
        link.onerror = () => {
            console.error(`❌ Erro ao carregar CSS: ${cssFile}`);
            loadedCount++;
            
            if (loadedCount === totalFiles) {
                console.log('🎨 Todos os arquivos CSS processados (com possíveis erros)');
                document.dispatchEvent(new Event('cssLoaded'));
            }
        };
        
        document.head.appendChild(link);
    });
}

// Exportar
window.loadCSSFiles = loadCSSFiles;
window.CSS_FILES = CSS_FILES;

console.log('✅ css-loader.js carregado');