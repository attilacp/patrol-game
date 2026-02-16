ARQUIVO: utils.js
LOCALIZAÇÃO: js/utils.js
===============================================

// PATROL - Utilit ários Consolidados
console.log('🔧 Utils carregando...');

const Utils = {
    // Embaralhar array
    shuffle(arr) {
        if (!Array.isArray(arr)) return arr;
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    },

    // Validações
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Gerar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Capitalizar string
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    // Preencher com zeros
    pad(n, len = 2) {
        return String(n).padStart(len, '0');
    },

    // Calcular porcentagem
    percentage(n, total) {
        return total === 0 ? 0 : Math.round((n / total) * 100);
    },

    // Clone profundo
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Debounce
    debounce(fn, ms) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), ms);
        };
    },

    // Normalizar resposta (CERTO/ERRADO)
    normalizeAnswer(answer) {
        if (!answer) return '';
        const normalized = answer.toString().trim().toUpperCase();
        
        if (normalized.includes('C') || normalized.includes('CERTO') || 
            normalized.includes('✅') || normalized.includes('V')) {
            return 'CERTO';
        }
        
        if (normalized.includes('E') || normalized.includes('ERRADO') || 
            normalized.includes('❌') || normalized.includes('F')) {
            return 'ERRADO';
        }
        
        return normalized;
    },

    // Aplicar recorrência em perguntas
    applyRecurrence(questions, level) {
        const multiplier = {baixa: 1, media: 2, alta: 3}[level] || 3;
        const result = [];
        
        for (let i = 0; i < multiplier; i++) {
            questions.forEach(q => {
                const copy = {...q};
                copy.recurrenceCopy = i + 1;
                result.push(copy);
            });
        }
        
        console.log(`📊 Recorrência ${level}: ${questions.length} → ${result.length}`);
        return result;
    },

    // Mostrar notificação
    notify(message, type = 'info') {
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => {
            if (n.textContent === message) return;
        });
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#007bff'};
            color: ${type === 'warning' ? '#000' : 'white'};
            padding: 15px 20px; border-radius: 5px;
            z-index: 9999; box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
            max-width: 300px; word-wrap: break-word;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    },

    // Mostrar erro de autenticação
    getAuthErrorMessage(code) {
        const errors = {
            'auth/email-already-in-use': 'Email já cadastrado',
            'auth/invalid-email': 'Email inválido',
            'auth/user-not-found': 'Usuário não encontrado',
            'auth/wrong-password': 'Senha incorreta',
            'auth/weak-password': 'Senha muito fraca'
        };
        return errors[code] || 'Erro ao autenticar';
    },

    // Esconder todas as telas
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    },

    // Mostrar tela específica
    showScreen(screenId) {
        this.hideAllScreens();
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
    }
};

// Exportar globalmente
Object.assign(window, Utils);
window.Utils = Utils;

console.log('✅ Utils carregado');