// js/game/multiplayer.js
class MultiplayerGame {
    constructor(roomSystem) {
        this.roomSystem = roomSystem;
        this.setupActionListeners();
    }
    
    setupActionListeners() {
        // Ouvir ações de outros jogadores
        firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/actions').on('child_added', (snapshot) => {
            const action = snapshot.val();
            this.handleAction(action);
        });
        
        // Configurar botões para enviar ações
        document.getElementById('certo-btn').addEventListener('click', () => {
            this.roomSystem.sendAction('answer', { correct: true });
        });
        
        document.getElementById('errado-btn').addEventListener('click', () => {
            this.roomSystem.sendAction('answer', { correct: false });
        });
        
        document.getElementById('skip-btn').addEventListener('click', () => {
            this.roomSystem.sendAction('skip', {});
        });
    }
    
    handleAction(action) {
        console.log('🎮 Ação recebida:', action);
        
        // Não processar própria ação
        if (action.playerId === this.roomSystem.playerId) return;
        
        switch (action.action) {
            case 'answer':
                // Atualizar pontuação do jogador
                this.updatePlayerScore(action.playerId, action.data.correct);
                break;
            case 'skip':
                // Avançar pergunta (se mestre)
                if (this.roomSystem.isMaster) {
                    window.nextQuestion();
                }
                break;
        }
    }
    
    updatePlayerScore(playerId, isCorrect) {
        // Atualizar pontuação no Firebase
        const scoreChange = isCorrect ? 10 : -5;
        firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/scores/' + playerId).transaction((current) => {
            return (current || 0) + scoreChange;
        });
    }
}