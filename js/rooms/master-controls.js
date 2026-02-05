// js/rooms/master-controls.js - Controles do mestre
console.log('🏠 rooms/master-controls.js carregando...');

RoomSystem.prototype.startGameForAll = async function(gameData) {
    if (!this.isMaster || !this.currentRoom) {
        alert('Apenas o mestre pode iniciar o jogo');
        return false;
    }
    
    console.log('🚀 Iniciando jogo para todos os jogadores...');
    
    try {
        if (this.getPlayerCount() < 2) {
            alert('⚠️ É necessário pelo menos 2 jogadores para começar!');
            return false;
        }
        
        await firebase.database().ref('rooms/' + this.currentRoom).update({
            status: 'playing',
            gameState: gameData || {
                startedAt: Date.now(),
                currentQuestionIndex: 0,
                currentTeamIndex: 0,
                scores: {},
                totalQuestions: window.questions?.length || 0
            }
        });
        
        this.sendAction('start_game', { gameData });
        this.showNotification('🎮 O jogo começou! Boa sorte a todos!', 'success');
        
        setTimeout(() => {
            if (window.authSystem) {
                window.authSystem.showGameScreen();
            }
        }, 1500);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao iniciar jogo:', error);
        alert('Erro ao iniciar jogo: ' + error.message);
        return false;
    }
};

RoomSystem.prototype.broadcastNextQuestion = function() {
    if (!this.isMaster) return;
    
    const gameState = {
        currentQuestionIndex: window.currentQuestionIndex || 0,
        currentTeamIndex: window.currentTeamIndex || 0,
        scores: this.getCurrentScores(),
        timestamp: Date.now()
    };
    
    firebase.database().ref('rooms/' + this.currentRoom + '/gameState').set(gameState);
    
    this.sendAction('next_question', {
        questionIndex: gameState.currentQuestionIndex,
        teamIndex: gameState.currentTeamIndex
    });
    
    console.log('📤 Próxima pergunta transmitida para todos');
};

RoomSystem.prototype.broadcastAnswerResult = function(teamName, isCorrect, points) {
    if (!this.isMaster) return;
    
    this.sendAction('answer', {
        team: teamName,
        correct: isCorrect,
        points: points,
        timestamp: Date.now()
    });
    
    this.updateScoresInFirebase();
};

RoomSystem.prototype.getCurrentScores = function() {
    if (!window.teams) return {};
    
    const scores = {};
    window.teams.forEach(team => {
        scores[team.id] = team.score;
    });
    return scores;
};

RoomSystem.prototype.updateScoresInFirebase = async function() {
    if (!this.isMaster || !this.currentRoom) return;
    
    try {
        const scores = this.getCurrentScores();
        await firebase.database().ref('rooms/' + this.currentRoom + '/scores').set(scores);
        console.log('📊 Pontuações atualizadas no Firebase');
    } catch (error) {
        console.error('❌ Erro ao atualizar pontuações:', error);
    }
};

RoomSystem.prototype.kickPlayer = async function(playerId) {
    if (!this.isMaster || !this.currentRoom) {
        alert('Apenas o mestre pode remover jogadores');
        return false;
    }
    
    if (playerId === this.playerId) {
        alert('Você não pode se remover. Use "Sair da sala".');
        return false;
    }
    
    if (!confirm(`Remover jogador ${this.getPlayerNameById(playerId)}?`)) {
        return false;
    }
    
    try {
        await firebase.database().ref('rooms/' + this.currentRoom + '/players/' + playerId).remove();
        this.showNotification(`👢 Jogador removido da sala`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao remover jogador:', error);
        alert('Erro ao remover jogador: ' + error.message);
        return false;
    }
};

RoomSystem.prototype.transferMaster = async function(newMasterId) {
    if (!this.isMaster || !this.currentRoom) return false;
    
    const newMasterName = this.getPlayerNameById(newMasterId);
    if (!newMasterName) return false;
    
    if (!confirm(`Transferir controle de mestre para ${newMasterName}?`)) {
        return false;
    }
    
    try {
        await firebase.database().ref('rooms/' + this.currentRoom).update({
            master: {
                uid: newMasterId,
                name: newMasterName
            }
        });
        
        await firebase.database().ref('rooms/' + this.currentRoom + '/players/' + this.playerId).update({
            isMaster: false
        });
        
        await firebase.database().ref('rooms/' + this.currentRoom + '/players/' + newMasterId).update({
            isMaster: true
        });
        
        this.isMaster = false;
        this.showNotification(`👑 Controle transferido para ${newMasterName}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao transferir controle:', error);
        return false;
    }
};

RoomSystem.prototype.updateGameSettings = async function(settings) {
    if (!this.isMaster || !this.currentRoom) return false;
    
    try {
        await firebase.database().ref('rooms/' + this.currentRoom + '/settings').update(settings);
        this.settings = { ...this.settings, ...settings };
        console.log('⚙️ Configurações atualizadas:', settings);
        return true;
    } catch (error) {
        console.error('❌ Erro ao atualizar configurações:', error);
        return false;
    }
};

console.log('✅ rooms/master-controls.js carregado com sucesso!');