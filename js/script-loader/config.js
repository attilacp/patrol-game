// js/script-loader/config.js - Configuração dos grupos de scripts
console.log('⚙️ script-loader/config.js carregando...');

const SCRIPT_GROUPS = [
    {
        name: 'Bibliotecas Externas',
        priority: 1,
        scripts: [
            'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
            'https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth-compat.js',
            'https://www.gstatic.com/firebasejs/10.11.0/firebase-database-compat.js'
        ]
    },
    {
        name: 'Configuração Básica',
        priority: 2,
        scripts: [
            'js/firebase-config.js'
        ]
    },
    {
        name: 'Autenticação',
        priority: 3,
        scripts: [
            'js/auth.js'
        ]
    },
    {
        name: 'Sistema de Salas',
        priority: 4,
        scripts: [
            'js/rooms/core.js',
            'js/rooms/room-manager-core.js',
            'js/rooms/room-manager-utils.js',
            'js/rooms/room-manager.js',
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
        name: 'Núcleo do Jogo',
        priority: 5,
        scripts: [
            'js/utils.js',
            'js/teams.js',
            'js/external.js',
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
        name: 'Sistemas Especiais',
        priority: 6,
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
        name: 'Sistema de Turnos',
        priority: 7,
        scripts: [
            'js/turn-system/turn-class.js',
            'js/turn-system/turn-listeners.js',
            'js/turn-system/turn-teams.js',
            'js/turn-system/turn-interface.js',
            'js/turn-system/turn-notifications.js',
            'js/turn-system/turn-start.js'
        ]
    },
    {
        name: 'Eventos do Jogo',
        priority: 8,
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
        name: 'Inicialização Principal',
        priority: 9,
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
            'js/game/multiplayer.js',
            'js/debug.js'
        ]
    }
];

// Ordenar grupos por prioridade (opcional)
const SORTED_SCRIPT_GROUPS = [...SCRIPT_GROUPS].sort((a, b) => a.priority - b.priority);

// Calcular estatísticas
const SCRIPT_STATS = {
    totalGroups: SCRIPT_GROUPS.length,
    totalScripts: SCRIPT_GROUPS.reduce((sum, group) => sum + group.scripts.length, 0),
    localScripts: SCRIPT_GROUPS.flatMap(g => g.scripts).filter(s => s.startsWith('js/')).length,
    externalScripts: SCRIPT_GROUPS.flatMap(g => g.scripts).filter(s => s.startsWith('http')).length
};

// Exportar
window.SCRIPT_GROUPS = SCRIPT_GROUPS;
window.SORTED_SCRIPT_GROUPS = SORTED_SCRIPT_GROUPS;
window.SCRIPT_STATS = SCRIPT_STATS;

console.log('✅ script-loader/config.js carregado');