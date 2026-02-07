// js/script-loader/progress-manager.js - Gerenciamento de progresso visual
console.log('📊 script-loader/progress-manager.js carregando...');

class ProgressManager {
    constructor() {
        this.progressElement = null;
        this.progressTextElement = null;
        this.createProgressElement();
    }
    
    createProgressElement() {
        // Verificar se já existe
        if (document.getElementById('script-loader-progress')) {
            this.progressElement = document.getElementById('script-loader-progress');
            this.progressTextElement = document.getElementById('script-loader-progress-text');
            return;
        }
        
        const container = document.createElement('div');
        container.id = 'script-loader-progress-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: rgba(0,0,0,0.1);
            z-index: 9999;
            display: none;
        `;
        
        const progressBar = document.createElement('div');
        progressBar.id = 'script-loader-progress';
        progressBar.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, #007bff, #00bcd4);
            width: 0%;
            transition: width 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,123,255,0.3);
        `;
        
        const progressText = document.createElement('div');
        progressText.id = 'script-loader-progress-text';
        progressText.style.cssText = `
            position: absolute;
            top: 8px;
            right: 20px;
            color: #007bff;
            font-size: 12px;
            font-weight: bold;
            font-family: monospace;
        `;
        
        container.appendChild(progressBar);
        container.appendChild(progressText);
        document.body.appendChild(container);
        
        this.progressElement = progressBar;
        this.progressTextElement = progressText;
    }
    
    show() {
        const container = document.getElementById('script-loader-progress-container');
        if (container) {
            container.style.display = 'block';
            container.style.animation = 'fadeIn 0.3s ease';
        }
    }
    
    hide() {
        const container = document.getElementById('script-loader-progress-container');
        if (container) {
            container.style.opacity = '0';
            setTimeout(() => {
                container.style.display = 'none';
                container.style.opacity = '1';
            }, 500);
        }
    }
    
    updateProgress(loaded, total, currentGroup = '', groupCount = 0) {
        if (!this.progressElement || !this.progressTextElement) return;
        
        const percentage = Math.round((loaded / total) * 100);
        
        // Atualizar barra de progresso
        this.progressElement.style.width = `${percentage}%`;
        
        // Atualizar texto
        let text = `Carregando: ${percentage}%`;
        if (currentGroup) {
            text += ` | ${currentGroup}`;
        }
        if (groupCount > 0) {
            const currentGroupNum = Math.min(Math.ceil(loaded / (total / groupCount)), groupCount);
            text += ` (${currentGroupNum}/${groupCount})`;
        }
        
        this.progressTextElement.textContent = text;
        
        // Mudar cor conforme progresso
        if (percentage < 30) {
            this.progressElement.style.background = 'linear-gradient(90deg, #dc3545, #fd7e14)';
        } else if (percentage < 70) {
            this.progressElement.style.background = 'linear-gradient(90deg, #ffc107, #fd7e14)';
        } else if (percentage < 90) {
            this.progressElement.style.background = 'linear-gradient(90deg, #28a745, #20c997)';
        } else {
            this.progressElement.style.background = 'linear-gradient(90deg, #007bff, #00bcd4)';
        }
        
        // Disparar evento
        document.dispatchEvent(new CustomEvent('loaderProgress', {
            detail: { loaded, total, percentage, currentGroup }
        }));
    }
    
    updateGroupProgress(groupIndex, totalGroups, groupName) {
        const groupPercentage = Math.round((groupIndex / totalGroups) * 100);
        this.updateProgress(groupIndex, totalGroups, groupName, totalGroups);
        
        // Efeito visual ao completar um grupo
        if (this.progressElement) {
            this.progressElement.style.boxShadow = '0 2px 8px rgba(0,123,255,0.5)';
            setTimeout(() => {
                this.progressElement.style.boxShadow = '0 2px 4px rgba(0,123,255,0.3)';
            }, 300);
        }
    }
    
    showCompletionMessage(success, total, duration) {
        const successRate = Math.round((success / total) * 100);
        const message = `✅ ${success}/${total} scripts carregados (${successRate}%) em ${duration}ms`;
        
        console.log(message);
        
        // Mostrar notificação visual temporária
        this.showToast(message, successRate >= 90 ? 'success' : 'warning');
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#007bff'};
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Adicionar estilos CSS para animações
const progressStyles = document.createElement('style');
progressStyles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(progressStyles);

// Exportar
window.ProgressManager = ProgressManager;

console.log('✅ script-loader/progress-manager.js carregado');