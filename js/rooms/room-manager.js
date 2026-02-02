[file name]: rooms/room-manager.js
[file content begin]
// js/rooms/room-manager.js - Gerenciamento de salas (criar/entrar/sair)
console.log('🏠 rooms/room-manager.js carregando...');

RoomSystem.prototype.createRoom = async function() {
    console.log('🏁 Criando nova sala...');
    
    const user = firebase.auth().currentUser;
    
    if (!user) {
        alert('Você precisa estar logado para criar uma sala');
        return null;
    }
    
    const roomCode = this.generateRoomCode();
    this.currentRoom = roomCode;
    this.isMaster = true;
    
    // Dados da sala
    const roomData = {
        code: roomCode,
        created: Date.now(),
        master: {
            uid: user.uid,
            name: this.playerName,
            email: user.email
        },
        status: 'lobby', // lobby, config, playing, finished
        gameState: null,
        settings: this.settings,
        players: {
            [this.playerId]: {
                uid: this.playerId,
                name: this.playerName,
                email: user.email,
                isMaster: true,
                isReady: false,
                score: 0,
                connected: true,
                joinedAt: Date.now(),
                avatar: this.getPlayerAvatar()
            }
        },
        lastActivity: Date.now()
    };
    
    try {
        const roomRef = firebase.database().ref('rooms/' + roomCode);
        await roomRef.set(roomData);
        
        console.log('✅ Sala criada:', roomCode);
        console.log('📊 Dados da sala:', roomData);
        
        // Mostrar código para o mestre
        this.showRoomInfo(roomCode);
        
        // Ouvir mudanças na sala
        this.setupRoomListeners();
        
        // Atualizar UI
        this.updateRoomUI(roomData);
        
        alert(`🎉 Sala criada!\n\nCódigo: ${roomCode}\n\nCompartilhe este código com os jogadores.`);
        
        return roomCode;
        
    } catch (error) {
        console.error('❌ Erro ao criar sala:', error);
        alert('Erro ao criar sala: ' + error.message);
        this.currentRoom = null;
        this.isMaster = false;
        return null;
    }
};

RoomSystem.prototype.joinRoom = async function(roomCode, isMaster = false) {
    console.log('🔑 Entrando na sala:', roomCode);
    
    const user = firebase.auth().currentUser;
    if (!user && !isMaster) {
        alert('Você precisa estar logado para entrar em uma sala');
        return false;
    }
    
    // Limpar qualquer sala anterior
    this.cleanup();
    
    this.currentRoom = roomCode.toUpperCase();
    this.isMaster = isMaster;
    
    try {
        // Verificar se sala existe
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        const snapshot = await roomRef.once('value');
        
        if (!snapshot.exists()) {
            alert('❌ Sala não encontrada. Verifique o código.');
            this.currentRoom = null;
            return false;
        }
        
        const roomData = snapshot.val();
        
        // Verificar se sala está cheia
        const playerCount = Object.keys(roomData.players || {}).length;
        if (playerCount >= (roomData.settings?.maxPlayers || this.settings.maxPlayers)) {
            alert('❌ Sala cheia! Máximo de jogadores atingido.');
            this.currentRoom = null;
            return false;
        }
        
        // Verificar se jogo já começou
        if (roomData.status === 'playing' && !isMaster) {
            alert('⚠️ O jogo já começou nesta sala. Não é possível entrar.');
            this.currentRoom = null;
            return false;
        }
        
        // Adicionar jogador à sala
        const playerData = {
            uid: this.playerId,
            name: this.playerName,
            email: user ? user.email : null,
            isMaster: isMaster,
            isReady: false,
            score: 0,
            connected: true,
            joinedAt: Date.now(),
            avatar: this.getPlayerAvatar()
        };
        
        await roomRef.child('players/' + this.playerId).set(playerData);
        
        console.log('✅ Jogador entrou na sala:', this.currentRoom);
        
        // Atualizar última atividade
        await roomRef.child('lastActivity').set(Date.now());
        
        // Mostrar informações da sala
        if (!isMaster) {
            this.showRoomInfo(this.currentRoom);
            alert(`✅ Entrou na sala ${this.currentRoom}!\nAguardando o mestre iniciar...`);
        }
        
        // Ouvir mudanças na sala
        this.setupRoomListeners();
        
        // Atualizar UI
        this.updateRoomUI(roomData);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao entrar na sala:', error);
        alert('Erro ao entrar na sala: ' + error.message);
        this.currentRoom = null;
        this.isMaster = false;
        return false;
    }
};

RoomSystem.prototype.leaveRoom = async function() {
    if (!this.currentRoom) return;
    
    console.log('🚪 Saindo da sala:', this.currentRoom);
    
    try {
        // Remover jogador da sala
        const playerRef = firebase.database().ref('rooms/' + this.currentRoom + '/players/' + this.playerId);
        await playerRef.remove();
        
        console.log('✅ Jogador removido da sala');
        
        // Se for mestre e não houver mais jogadores, deletar sala
        if (this.isMaster) {
            await this.checkAndDeleteEmptyRoom();
        }
        
        // Limpar localmente
        this.cleanup();
        
        // Voltar para lobby
        if (window.authSystem) {
            window.authSystem.showLobbyScreen();
        }
        
        this.showNotification('👋 Você saiu da sala');
        
    } catch (error) {
        console.error('❌ Erro ao sair da sala:', error);
        alert('Erro ao sair da sala: ' + error.message);
    }
};

RoomSystem.prototype.checkAndDeleteEmptyRoom = async function() {
    if (!this.currentRoom) return;
    
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom + '/players');
        const snapshot = await roomRef.once('value');
        
        if (!snapshot.exists() || Object.keys(snapshot.val() || {}).length === 0) {
            // Sala vazia, deletar
            await firebase.database().ref('rooms/' + this.currentRoom).remove();
            console.log('🗑️ Sala vazia deletada');
        }
    } catch (error) {
        console.error('Erro ao verificar sala vazia:', error);
    }
};

RoomSystem.prototype.getPlayerAvatar = function() {
    const avatars = ['👤', '👨', '👩', '🧑', '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🎓'];
    return avatars[Math.floor(Math.random() * avatars.length)];
};

console.log('✅ rooms/room-manager.js carregado com sucesso!');
[file content end]