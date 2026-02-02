// js/rooms/room-manager.js - Gerenciamento de salas
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
    
    const roomData = {
        code: roomCode,
        created: Date.now(),
        master: { uid: user.uid, name: this.playerName, email: user.email },
        status: 'lobby',
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
                avatar: '👑'
            }
        },
        lastActivity: Date.now()
    };
    
    try {
        const roomRef = firebase.database().ref('rooms/' + roomCode);
        await roomRef.set(roomData);
        
        console.log('✅ Sala criada:', roomCode);
        
        // Mostrar código no lobby
        const roomInfo = document.getElementById('room-info');
        const roomCodeSpan = document.getElementById('current-room-code');
        
        if (roomInfo) roomInfo.style.display = 'block';
        if (roomCodeSpan) roomCodeSpan.textContent = roomCode;
        
        // Adicionar botão copiar
        this.addCopyButtonToRoomCode(roomCode);
        
        alert(`🎉 Sala criada!\n\nCódigo: ${roomCode}\n\nCompartilhe este código.`);
        
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
    
    this.cleanup();
    this.currentRoom = roomCode.toUpperCase();
    this.isMaster = isMaster;
    
    alert(`✅ Entrou na sala ${this.currentRoom}!\nAguardando o mestre iniciar...`);
    return true;
};

RoomSystem.prototype.addCopyButtonToRoomCode = function(roomCode) {
    const codeContainer = document.getElementById('current-room-code');
    if (!codeContainer) return;
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-code-btn';
    copyBtn.innerHTML = '📋 Copiar';
    copyBtn.onclick = (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(roomCode)
            .then(() => {
                copyBtn.innerHTML = '✅ Copiado!';
                setTimeout(() => copyBtn.innerHTML = '📋 Copiar', 2000);
            });
    };
    
    codeContainer.parentNode.appendChild(copyBtn);
};

console.log('✅ rooms/room-manager.js carregado com sucesso!');