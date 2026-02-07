// js/rooms/room-answer-sync.js - Sincronização de respostas
console.log('🔄 room-answer-sync.js carregando...');

RoomSystem.prototype.broadcastAnswerResult = function(isCorrect, points, question, answerData) {
    if (!this.isMaster || !this.currentRoom) return;
    
    let allComments = '';
    if (question) {
        if (question.comentario) allComments += question.comentario;
        if (question.comentario2) allComments += (allComments ? '<br><br>' : '') + question.comentario2;
        if (question.comentario3) allComments += (allComments ? '<br><br>' : '') + question.comentario3;
    }
    
    const resultData = {
        questionIndex: window.currentQuestionIndex,
        isCorrect: isCorrect,
        points: points,
        teamId: answerData.teamId,
        teamName: answerData.teamName,
        playerName: answerData.playerName,
        correctAnswer: question?.gabarito || 'Não informado',
        comments: allComments,
        timestamp: Date.now()
    };
    
    firebase.database().ref('rooms/' + this.currentRoom + '/answerResult')
        .set(resultData);
    
    console.log('📤 Resultado transmitido com comentários');
    
    // Sincronizar estado dos botões
    this.broadcastButtonsState({
        certo: false,
        errado: false,
        skip: false,
        next: true,
        podium: false
    });
};

RoomSystem.prototype.handlePlayerAnswer = function(answerData) {
    if (answerData.playerId === this.playerId) return;
    
    console.log('📥 Resposta de jogador recebida:', answerData.playerName, answerData.answer);
    
    if (this.isMaster) {
        this.showNotification(`${answerData.playerName} respondeu: ${answerData.answer}`, 'info');
        
        // Mestre pode processar resposta do jogador se quiser
        // (implementação futura: mestre confirma resposta do jogador)
    }
};

RoomSystem.prototype.setupAnswerListeners = function() {
    if (!this.currentRoom) return;
    
    console.log('👂 Configurando listeners de respostas...');
    
    // Ouvir respostas dos jogadores (para mestre)
    const playerAnswersRef = firebase.database().ref('rooms/' + this.currentRoom + '/playerAnswers');
    playerAnswersRef.on('child_added', (snapshot) => {
        const answerData = snapshot.val();
        if (answerData) {
            this.handlePlayerAnswer(answerData);
        }
    });
    
    // Ouvir resultados de respostas (para todos)
    const answerResultRef = firebase.database().ref('rooms/' + this.currentRoom + '/answerResult');
    answerResultRef.on('value', (snapshot) => {
        const resultData = snapshot.val();
        if (resultData) {
            this.syncAnswerResult(resultData);
        }
    });
    
    console.log('✅ Listeners de respostas configurados');
};

RoomSystem.prototype.syncAnswerResult = function(resultData) {
    console.log('📥 Sincronizando resultado de resposta:', resultData.isCorrect ? 'CORRETA' : 'ERRADA');
    
    // Mostrar se acertou ou errou
    const correctAnswer = document.getElementById('correct-answer');
    if (correctAnswer) {
        correctAnswer.textContent = resultData.isCorrect ? '✅ ACERTOU' : '❌ ERROU';
        correctAnswer.className = resultData.isCorrect ? 'correct-answer' : 'wrong-answer';
    }
    
    // Mostrar gabarito se disponível
    if (resultData.correctAnswer && correctAnswer) {
        correctAnswer.textContent += ' - GABARITO: ' + resultData.correctAnswer;
    }
    
    // MOSTRAR COMENTÁRIOS SINCRONIZADOS
    const commentary = document.getElementById('commentary');
    if (commentary && resultData.comments) {
        commentary.innerHTML = resultData.comments;
        commentary.classList.add('active');
        
        console.log('📝 Comentários sincronizados:', resultData.comments.substring(0, 50) + '...');
    }
    
    // Sincronizar botões
    this.syncButtonsState({
        certo: false,
        errado: false,
        skip: false,
        next: true,
        podium: false
    });
    
    // Informações do jogador/equipe
    if (resultData.teamName && resultData.playerName) {
        console.log(`📊 ${resultData.playerName} (${resultData.teamName}) ${resultData.isCorrect ? 'acertou' : 'errou'}`);
    }
};

console.log('✅ room-answer-sync.js carregado');