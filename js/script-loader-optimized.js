// js/script-loader-optimized.js - Sistema de carregamento otimizado
console.log('📦 Script Loader Otimizado iniciando...');

class OptimizedScriptLoader {
    constructor() {
        this.loaded = new Set();
        this.errors = [];
        this.groups = [
            {
                name: 'Externos',
                scripts: [
                    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
                    'https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js',
                    'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth-compat.js',
                    'https://www.gstatic.com/firebasejs/10.11.0/firebase-database-compat.js'
                ]
            },
            {
                name: 'Core',
                scripts: [
                    'js/firebase-config.js',
                    'js/auth.js',
                    'js/utils.js',
                    'js/teams.js'
                ]
            },
            {
                name: 'Salas',
                scripts: [
                    'js/rooms/core.js',
                    'js/rooms/room-manager-core.js',
                    'js/rooms/room-manager-utils.js',
                    'js/rooms/room-ui.js',
                    'js/rooms/room-handlers.js',
                    'js/rooms/room-data.js',
                    'js/rooms/room-teams.js',
                    'js/rooms/actions.js',
                    'js/rooms/master-controls.js',
                    'js/rooms/room-answers-core.js',
                    'js/rooms/room-master-answers.js',
                    'js/rooms/room-answer-sync.js',
                    'js/rooms/room-answer-control.js',
                    'js/rooms/sync-game.js',
                    'js/rooms/init.js'
                ]
            },
            {
                name: 'Jogo',
                scripts: [
                    'js/teams-performance/core.js',
                    'js/teams-performance/tracking.js',
                    'js/teams-performance/import-export.js',
                    'js/teams-performance/display.js',
                    'js/teams-performance/init.js',
                    'js/answers/question-display.js',
                    'js/answers/question-flow.js',
                    'js/answers/game-state.js',
                    'js/answers/response-handler.js',
                    'js/answers/checkAnswer.js',
                    'js/answers/correct.js',
                    'js/answers/wrong.js',
                    'js/answers/skip.js',
                    'js/answers/winner.js',
                    'js/game/podium.js',
                    'js/game/notes.js'
                ]
            },
            {
                name: 'Especiais',
                scripts: [
                    'js/bombQuestion/penaltyModal.js',
                    'js/bombQuestion/fileLoader.js',
                    'js/bombQuestion/ui-manager.js',
                    'js/bombQuestion/selector.js',
                    'js/bombQuestion/game-manager.js',
                    'js/bombQuestion/core-base.js',
                    'js/bombQuestion/config.js',
                    'js/bombQuestion/main.js',
                    'js/fileUpload/main.js',
                    'js/fileUpload/core.js',
                    'js/fileUpload/subjects.js',
                    'js/fileUpload/status.js'
                ]
            },
            {
                name: 'Turnos',
                scripts: [
                    'js/turn-system/turn-class.js',
                    'js/turn-system/turn-listeners.js',
                    'js/turn-system/turn-teams.js',
                    'js/turn-system/turn-interface.js',
                    'js/turn-system/turn-notifications.js',
                    'js/turn-system/turn-results.js',
                    'js/turn-system/turn-start.js'
                ]
            },
            {
                name: 'Eventos',
                scripts: [
                    'js/gameEvents/main.js',
                    'js/gameEvents/core.js',
                    'js/gameEvents/answerButtons.js',
                    'js/gameEvents/controlButtons.js',
                    'js/gameEvents/teamTurn.js',
                    'js/gameEvents/keyboard.js'
                ]
            },
            {
                name: 'Inicialização',
                scripts: [
                    'js/main/buttonTester.js',
                    'js/main/notesLoader.js',
                    'js/main/configEvents.js',
                    'js/main/configScreen.js',
                    'js/main/game-start-helpers.js',
                    'js/main/game-start-firebase.js',
                    'js/main/game-start-core.js',
                    'js/main/init.js',
                    'js/checkStartGame.js',
                    'js/game/multiplayer.js'
                ]
            }
        ];
    }

    async load(src, retries = 2) {
        if (this.loaded.has(src)) return true;
        
        for (let i = 0; i <= retries; i++) {
            try {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.async = false;
                    script.onload = () => {
                        this.loaded.add(src);
                        resolve();
                    };
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
                return true;
            } catch (err) {
                if (i === retries) {
                    this.errors.push({ src, error: err.message });
                    return false;
                }
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
            }
        }
    }

    async loadGroup(group) {
        const results = await Promise.allSettled(
            group.scripts.map(src => this.load(src, src.startsWith('js/') ? 2 : 0))
        );
        
        const success = results.filter(r => r.status === 'fulfilled' && r.value).length;
        console.log(`✅ ${group.name}: ${success}/${group.scripts.length}`);
        
        return { name: group.name, success, total: group.scripts.length };
    }

    async loadAll() {
        const start = Date.now();
        const results = [];
        
        for (const group of this.groups) {
            results.push(await this.loadGroup(group));
        }
        
        const total = results.reduce((sum, r) => sum + r.total, 0);
        const success = results.reduce((sum, r) => sum + r.success, 0);
        const duration = Date.now() - start;
        
        console.log(`📦 Carregamento completo: ${success}/${total} em ${duration}ms`);
        
        if (this.errors.length > 0) {
            console.warn('⚠️ Erros:', this.errors);
        }
        
        document.dispatchEvent(new CustomEvent('scriptsLoaded', {
            detail: { success, total, duration, errors: this.errors }
        }));
        
        return { success, total, duration, functional: success >= total * 0.9 };
    }

    verify() {
        const checks = [
            { name: 'firebase', test: () => typeof firebase !== 'undefined' },
            { name: 'auth', test: () => window.auth !== undefined },
            { name: 'db', test: () => window.db !== undefined },
            { name: 'roomSystem', test: () => window.roomSystem !== undefined },
            { name: 'teams', test: () => typeof window.updateTeamsDisplay === 'function' },
            { name: 'showQuestion', test: () => typeof window.showQuestion === 'function' },
            { name: 'checkAnswer', test: () => typeof window.checkAnswer === 'function' }
        ];

        const results = checks.map(c => ({
            name: c.name,
            passed: c.test(),
        }));

        const passed = results.filter(r => r.passed).length;
        console.log(`🔍 Verificação: ${passed}/${checks.length}`);
        
        results.forEach(r => {
            console.log(`${r.passed ? '✅' : '❌'} ${r.name}`);
        });

        return { passed, total: checks.length, functional: passed >= checks.length };
    }
}

// Inicialização automática
window.scriptLoader = new OptimizedScriptLoader();

console.log('✅ Script Loader Otimizado carregado');
