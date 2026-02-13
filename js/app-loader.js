// js/app-loader.js - Carregador principal da aplicação
console.log('🚀 app-loader.js iniciando...');

async function initializeApp() {
    console.log('🚀 Inicializando aplicação PATROL...');
    
    try {
        // 1. Primeiro carregar CSS (paralelo)
        console.log('🎨 Etapa 1: Carregando CSS...');
        if (typeof loadCSSFiles === 'function') {
            loadCSSFiles();
        } else {
            // Fallback: carregar CSS loader dinamicamente
            await loadScript('js/css-loader.js');
            loadCSSFiles();
        }
        
        // 2. Carregar templates (paralelo com CSS)
        console.log('📄 Etapa 2: Carregando templates...');
        if (typeof loadAllTemplates === 'function') {
            loadAllTemplates();
        } else {
            await loadScript('js/templates.js');
            loadAllTemplates();
        }
        
        // 2.5. Aguardar templates estarem no DOM
        console.log('⏳ Aguardando templates...');
        await new Promise(resolve => {
            if (document.getElementById('login-screen')) {
                console.log('✅ Templates já carregados');
                resolve();
            } else {
                document.addEventListener('allTemplatesLoaded', () => {
                    console.log('✅ Templates carregados via evento');
                    resolve();
                });
                // Timeout de segurança
                setTimeout(() => {
                    console.log('⚠️ Timeout de templates atingido');
                    resolve();
                }, 2000);
            }
        });
        
        // 3. Esperar CSS carregar antes de scripts
        await new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                document.addEventListener('cssLoaded', resolve);
                // Timeout de segurança
                setTimeout(resolve, 5000);
            }
        });
        
        // 4. Carregar scripts na ordem correta
        console.log('📦 Etapa 3: Carregando scripts...');
        if (typeof loadScriptsSequentially === 'function') {
            await loadScriptsSequentially();
        } else {
            await loadScript('js/script-loader.js');
            await loadScriptsSequentially();
        }
        
        // 5. Inicializar Firebase
        console.log('🔥 Etapa 4: Inicializando Firebase...');
        if (typeof initializeFirebase === 'function') {
            const firebaseInitialized = initializeFirebase();
            if (!firebaseInitialized) {
                console.warn('⚠️ Firebase não inicializado, tentando novamente...');
                await loadScript('js/firebase-config.js');
                initializeFirebase();
            }
        } else {
            await loadScript('js/firebase-config.js');
            initializeFirebase();
        }
        
        // 6. Aguardar tudo estar pronto
        await new Promise(resolve => {
            document.addEventListener('scriptsLoaded', resolve);
            // Timeout de segurança
            setTimeout(resolve, 3000);
        });
        
        console.log('✅ Aplicação PATROL inicializada com sucesso!');
        document.dispatchEvent(new Event('appInitialized'));
        
    } catch (error) {
        console.error('❌ Erro crítico na inicialização:', error);
        showErrorScreen(error);
    }
}

// Função auxiliar para carregar scripts dinamicamente
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Tela de erro fallback
function showErrorScreen(error) {
    const container = document.getElementById('main-container');
    if (container) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #dc3545;">
                <h1>❌ Erro na Inicialização</h1>
                <p>Ocorreu um erro ao carregar o jogo PATROL.</p>
                <p><strong>Detalhes:</strong> ${error.message}</p>
                <button onclick="location.reload()" style="
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 20px;
                ">
                    🔄 Tentar Novamente
                </button>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    Se o problema persistir, verifique sua conexão com a internet.
                </p>
            </div>
        `;
    }
}

// Iniciar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

console.log('✅ app-loader.js carregado');