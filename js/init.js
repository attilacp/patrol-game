ARQUIVO: init.js
LOCALIZAÇÃO: js/init.js
===============================================

// PATROL - Inicialização
console.log('🚀 Init carregando...');

class PatrolApp {
    constructor() {
        this.initAttempts = 0;
        this.maxAttempts = 20;
        this.systems = [];
    }
    
    async init() {
        console.log('🚀 Inicializando PATROL...');
        
        // Aguardar Firebase
        if (!firebase?.auth) {
            this.initAttempts++;
            
            if (this.initAttempts >= this.maxAttempts) {
                console.error('❌ Firebase não carregou');
                this.showError('Firebase não carregou. Recarregue a página.');
                return;
            }
            
            console.log(`⏳ Aguardando Firebase... (${this.initAttempts}/${this.maxAttempts})`);
            setTimeout(() => this.init(), 500);
            return;
        }
        
        console.log('✅ Firebase disponível');
        
        // Aguardar templates
        await this.waitForTemplates();
        
        // Inicializar sistemas
        this.initializeSystems();
        
        console.log('✅ PATROL inicializado!');
        document.dispatchEvent(new Event('patrolReady'));
    }
    
    waitForTemplates() {
        return new Promise((resolve) => {
            if (document.getElementById('login-screen')) {
                console.log('✅ Templates já carregados');
                resolve();
            } else {
                document.addEventListener('templatesLoaded', () => {
                    console.log('✅ Templates carregados');
                    resolve();
                });
                
                // Timeout de segurança
                setTimeout(() => {
                    console.log('⏰ Timeout de templates');
                    resolve();
                }, 3000);
            }
        });
    }
    
    initializeSystems() {
        console.log('🔧 Inicializando sistemas...');
        
        // GameSystem
        if (window.GameSystem) {
            window.GameSystem.init();
            this.systems.push('GameSystem');
        }
        
        console.log(`✅ ${this.systems.length} sistemas inicializados:`, this.systems.join(', '));
    }
    
    showError(message) {
        const container = document.getElementById('main-container');
        if (container) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #dc3545; background: white; border-radius: 10px; margin: 50px auto; max-width: 600px;">
                    <h1>❌ Erro na Inicialização</h1>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-top: 20px;
                        font-size: 1.1em;
                    ">
                        🔄 Tentar Novamente
                    </button>
                </div>
            `;
        }
    }
    
    checkStatus() {
        console.log('🔍 Status do PATROL:');
        console.log('- Firebase:', typeof firebase !== 'undefined' ? '✅' : '❌');
        console.log('- Auth:', window.authSystem ? '✅' : '❌');
        console.log('- RoomSystem:', window.roomSystem ? '✅' : '❌');
        console.log('- TeamSystem:', window.TeamSystem ? '✅' : '❌');
        console.log('- QuestionSystem:', window.QuestionSystem ? '✅' : '❌');
        console.log('- GameSystem:', window.GameSystem ? '✅' : '❌');
        console.log('- EventSystem:', window.EventSystem ? '✅' : '❌');
    }
}

// Criar instância global
window.patrolApp = new PatrolApp();

// Iniciar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.patrolApp.init();
    });
} else {
    window.patrolApp.init();
}

// Comando de debug no console
window.patrolStatus = () => window.patrolApp.checkStatus();

console.log('✅ Init carregado');
console.log('💡 Use patrolStatus() no console para verificar status');