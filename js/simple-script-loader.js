// js/simple-script-loader.js (alternativa)
console.log('📦 simple-script-loader.js carregando...');

const SCRIPT_BUNDLES = {
    'externals': [
        'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
        'https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth-compat.js',
        'https://www.gstatic.com/firebasejs/10.11.0/firebase-database-compat.js'
    ],
    'core': [
        'js/firebase-config.js',
        'js/auth.js',
        'js/utils.js',
        'js/teams.js'
    ],
    'rooms': [
        'js/rooms/core.js',
        'js/rooms/room-manager-core.js',
        'js/rooms/room-ui.js',
        'js/rooms/room-handlers.js'
    ],
    'answers': [
        'js/answers/question-display.js',
        'js/answers/question-flow.js',
        'js/answers/game-state.js',
        'js/answers/response-handler.js',
        'js/answers/checkAnswer.js'
    ],
    'game': [
        'js/game/podium.js',
        'js/game/notes.js',
        'js/main/init.js',
        'js/checkStartGame.js'
    ]
};

async function loadBundles() {
    console.log('📦 Carregando bundles...');
    
    const bundles = ['externals', 'core', 'rooms', 'answers', 'game'];
    
    for (const bundleName of bundles) {
        console.log(`📦 Bundle: ${bundleName}`);
        
        const promises = SCRIPT_BUNDLES[bundleName].map(src => 
            loadScript(src).catch(error => {
                console.warn(`⚠️ Erro em ${src}:`, error.message);
                return null; // Continuar mesmo com erro
            })
        );
        
        await Promise.all(promises);
        console.log(`✅ Bundle ${bundleName} carregado`);
    }
    
    console.log('📦 Todos os bundles carregados!');
    document.dispatchEvent(new Event('scriptsLoaded'));
}

window.loadBundles = loadBundles;
window.SCRIPT_BUNDLES = SCRIPT_BUNDLES;

console.log('✅ simple-script-loader.js carregado');