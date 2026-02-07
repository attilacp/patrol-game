// js/script-loader/error-handler.js - Tratamento de erros de carregamento
console.log('🚨 script-loader/error-handler.js carregando...');

class ScriptErrorHandler {
    constructor() {
        this.errors = [];
        this.setupGlobalErrorHandling();
    }
    
    setupGlobalErrorHandling() {
        // Capturar erros globais
        window.addEventListener('error', (event) => {
            this.recordError({
                type: 'global',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.toString(),
                timestamp: Date.now()
            });
        });
        
        // Capturar rejeições de promises não tratadas
        window.addEventListener('unhandledrejection', (event) => {
            this.recordError({
                type: 'promise',
                reason: event.reason?.toString(),
                timestamp: Date.now()
            });
        });
    }
    
    recordError(errorInfo) {
        // Filtrar erros de rede de scripts externos (não críticos)
        if (this.isNetworkError(errorInfo) && this.isExternalScript(errorInfo.filename)) {
            console.warn(`🌐 Erro de rede em script externo: ${errorInfo.filename}`);
            return;
        }
        
        const errorEntry = {
            id: this.generateId(),
            ...errorInfo,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errors.push(errorEntry);
        console.error(`🚨 Erro registrado [${errorEntry.id}]:`, errorEntry);
        
        // Disparar evento para notificar sobre erro
        this.dispatchErrorEvent(errorEntry);
        
        // Se for erro crítico, mostrar notificação
        if (this.isCriticalError(errorEntry)) {
            this.showErrorNotification(errorEntry);
        }
    }
    
    recordScriptLoadError(src, error) {
        this.recordError({
            type: 'scriptLoad',
            src,
            message: `Falha ao carregar script: ${src}`,
            error: error?.toString(),
            timestamp: Date.now()
        });
    }
    
    isNetworkError(errorInfo) {
        return errorInfo.message?.includes('Failed to load') || 
               errorInfo.message?.includes('NetworkError') ||
               errorInfo.reason?.includes('NetworkError');
    }
    
    isExternalScript(filename) {
        if (!filename) return false;
        return filename.startsWith('http') && 
               !filename.includes(window.location.hostname);
    }
    
    isCriticalError(errorInfo) {
        // Erros críticos: scripts essenciais, sintaxe, etc.
        const criticalMessages = [
            'firebase',
            'auth',
            'roomSystem',
            'SyntaxError',
            'ReferenceError',
            'TypeError'
        ];
        
        return criticalMessages.some(keyword => 
            errorInfo.message?.includes(keyword) || 
            errorInfo.error?.includes(keyword)
        );
    }
    
    generateId() {
        return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    dispatchErrorEvent(errorEntry) {
        document.dispatchEvent(new CustomEvent('scriptLoadError', {
            detail: errorEntry
        }));
    }
    
    showErrorNotification(errorEntry) {
        // Criar notificação não intrusiva
        const notification = document.createElement('div');
        notification.id = `error-notification-${errorEntry.id}`;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
            font-size: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideInUp 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">⚠️ Erro no carregamento</div>
            <div style="font-size: 11px; opacity: 0.9;">${errorEntry.message || 'Erro desconhecido'}</div>
            <button onclick="document.getElementById('${notification.id}').remove()" 
                    style="position: absolute; top: 5px; right: 5px; background: none; border: none; color: white; cursor: pointer; font-size: 14px;">
                ×
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover após 10 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutDown 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 10000);
    }
    
    getErrorSummary() {
        const summary = {
            totalErrors: this.errors.length,
            criticalErrors: this.errors.filter(e => this.isCriticalError(e)).length,
            networkErrors: this.errors.filter(e => this.isNetworkError(e)).length,
            scriptLoadErrors: this.errors.filter(e => e.type === 'scriptLoad').length,
            recentErrors: this.errors.slice(-5) // Últimos 5 erros
        };
        
        return summary;
    }
    
    clearErrors() {
        this.errors = [];
        console.log('🧹 Registros de erro limpos');
    }
    
    // Adicionar estilos CSS para animações
    addErrorStyles() {
        if (!document.getElementById('error-handler-styles')) {
            const style = document.createElement('style');
            style.id = 'error-handler-styles';
            style.textContent = `
                @keyframes slideInUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideOutDown {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Inicializar estilos
const errorHandler = new ScriptErrorHandler();
errorHandler.addErrorStyles();

// Exportar
window.ScriptErrorHandler = ScriptErrorHandler;
window.scriptErrorHandler = errorHandler;

console.log('✅ script-loader/error-handler.js carregado');