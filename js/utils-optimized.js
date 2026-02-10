// js/utils-optimized.js - Utilitários otimizados
const Utils = {
    shuffle(arr) {
        if (!Array.isArray(arr)) return arr;
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    checkStartGame() {
        const teams = document.querySelectorAll('.team-input input[type="text"]');
        const hasTeams = Array.from(teams).some(t => t.value.trim());
        
        let hasQuestions = false, totalQ = 0;
        if (window.subjects) {
            Object.values(window.subjects).forEach(s => {
                if (s.enabled && s.questions.length) {
                    hasQuestions = true;
                    totalQ += s.questions.length;
                }
            });
        }
        
        const canStart = hasTeams && hasQuestions;
        
        ['team-error', 'file-error'].forEach((id, i) => {
            const el = document.getElementById(id);
            if (el) el.style.display = [hasTeams, hasQuestions][i] ? 'none' : 'block';
        });
        
        const btn = document.getElementById('start-game-btn');
        if (btn) {
            btn.disabled = !canStart;
            btn.className = canStart ? 'enabled' : 'disabled';
        }
        
        const totalEl = document.getElementById('total-questions');
        if (totalEl) totalEl.textContent = totalQ;
        
        return canStart;
    },

    resetPendingBombButton() {
        const btn = document.getElementById('next-question-btn');
        if (btn && (btn.textContent.includes('💣') || btn.textContent.includes('BOMBA'))) {
            btn.textContent = '⏭️ PRÓXIMA';
            btn.onclick = () => window.nextQuestion?.();
        }
    },

    getRandomTeamColor(idx) {
        return window.teamColorSchemes?.[idx % (window.teamColorSchemes?.length || 10)];
    },

    clearAllSubjects() {
        window.subjects = {};
        ['updateSubjectsList', 'updateTotalQuestionsCount', 'checkStartGame']
            .forEach(fn => window[fn]?.());
    },

    toggleAllSubjects(enabled) {
        if (window.subjects) {
            Object.values(window.subjects).forEach(s => s.enabled = enabled);
            ['updateSubjectsList', 'updateTotalQuestionsCount', 'checkStartGame']
                .forEach(fn => window[fn]?.());
        }
    },

    pad(n, len = 2) {
        return String(n).padStart(len, '0');
    },

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    debounce(fn, ms) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), ms);
        };
    },

    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    percentage(n, total) {
        return total === 0 ? 0 : Math.round((n / total) * 100);
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Exportar globalmente
Object.assign(window, Utils);

// Aliases para compatibilidade
window.shuffleArray = Utils.shuffle;
window.padZero = Utils.pad;
window.deepClone = Utils.clone;
window.calculatePercentage = Utils.percentage;

// Init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const qt = document.getElementById('question-text');
            if (qt) qt.textContent = 'Aguardando carregamento...';
        }, 500);
    });
}

console.log('✅ Utils otimizados carregados');
