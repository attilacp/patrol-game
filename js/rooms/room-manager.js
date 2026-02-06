// js/rooms/room-manager.js - VERSÃO SIMPLIFICADA
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
    
    // Dados iniciais da sala
    const roomData = {
        code: roomCode,
        created: Date.now(),
        master: { 
            uid: user.uid, 
            name: this.playerName, 
            email: user.email 
        },
        status: 'lobby',
        gameState: null,
        gameData: { 
            questions: [], 
            teams: [] 
        },
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
                avatar: '👑'
            }
        }
    };
    
    try {
        const roomRef = firebase.database().ref('rooms/' + roomCode);
        await roomRef.set(roomData);
        
        console.log('✅ Sala criada:', roomCode);
        
        // Mostrar código
        const roomInfo = document.getElementById('room-info');
        const roomCodeSpan = document.getElementById('current-room-code');
        
        if (roomInfo) roomInfo.style.display = 'block';
        if (roomCodeSpan) roomCodeSpan.textContent = roomCode;
        
        // Botão copiar
        this.addCopyButtonToRoomCode(roomCode);
        
        // Configurar listeners
        if (this.setupRoomListeners) {
            this.setupRoomListeners();
        }
        
        // REMOVIDO: Alerta duplicado - o sistema de auth já mostra
        return roomCode;
        
    } catch (error) {
        console.error('❌ Erro ao criar sala:', error);
        alert('Erro: ' + error.message);
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
    
    // Limpar estado anterior
    this.cleanup();
    this.currentRoom = roomCode.toUpperCase();
    this.isMaster = isMaster;
    
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        const snapshot = await roomRef.once('value');
        
        if (!snapshot.exists()) {
            alert('❌ Sala não encontrada.');
            this.currentRoom = null;
            return false;
        }
        
        const roomData = snapshot.val();
        
        // Verificar se jogo já começou
        if (roomData.status === 'playing' && !isMaster) {
            if (confirm('⚠️ O jogo já começou. Deseja entrar como espectador?')) {
                // Permitir entrar como espectador
            } else {
                this.currentRoom = null;
                return false;
            }
        }
        
        // Adicionar jogador
        const playerData = {
            uid: this.playerId,
            name: this.playerName,
            email: user ? user.email : null,
            isMaster: isMaster,
            isReady: false,
            score: 0,
            connected: true,
            joinedAt: Date.now(),
            avatar: isMaster ? '👑' : '👤'
        };
        
        await roomRef.child('players/' + this.playerId).set(playerData);
        console.log('✅ Jogador adicionado à sala');
        
        // Configurar listeners
        if (this.setupRoomListeners) {
            this.setupRoomListeners();
        }
        
        // REMOVIDO: Alerta duplicado - auth.js já mostra
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao entrar:', error);
        alert('Erro: ' + error.message);
        return false;
    }
};