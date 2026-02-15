// js/main/game-start-firebase.js - Salvamento no Firebase
console.log('🚀 game-start-firebase.js carregando...');

async function saveGameToFirebase(gameData) {
    console.log('💾 SALVANDO NO FIREBASE - Sala:', gameData.roomCode);
    
    const roomRef = firebase.database().ref('rooms/' + gameData.roomCode);
    
    // 1. Status
    await roomRef.child('status').set('playing');
    console.log('✅ Status: playing');
    
    // 2. Perguntas
    console.log('💾 Salvando perguntas (com recorrência):', gameData.questions.length);
    await roomRef.child('gameData/questions').set(gameData.questions);
    
    // 3. Equipes
    console.log('💾 Salvando equipes:', gameData.teams.length);
    await roomRef.child('gameData/teams').set(gameData.teams);
    
    // 4. Dados de recorrência
    if (gameData.hasRecurrence) {
        const recurrenceData = {
            enabled: true,
            originalCount: gameData.originalCount,
            totalWithRecurrence: gameData.questions.length,
            questionSourceMap: gameData.questionSourceMap
        };
        await roomRef.child('gameData/recurrence').set(recurrenceData);
        console.log('✅ Metadados de recorrência salvos');
    }
    
    // 5. Ordem das perguntas
    let orderData = {
        type: gameData.questionOrder,
        timestamp: Date.now()
    };
    
    if (gameData.questionOrder === 'ALEATÓRIA') {
        const randomizedIndices = gameData.questions.map((_, index) => index);
        for (let i = randomizedIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [randomizedIndices[i], randomizedIndices[j]] = [randomizedIndices[j], randomizedIndices[i]];
        }
        orderData.indices = randomizedIndices;
        
        const reorderedQuestions = randomizedIndices.map(i => gameData.questions[i]);
        await roomRef.child('gameData/questions').set(reorderedQuestions);
        console.log('✅ Ordem aleatória aplicada');
    }
    
    await roomRef.child('gameData/questionOrder').set(orderData);
    console.log('✅ Ordem salva no Firebase');
    
    // 6. Estado inicial do jogo
    const gameState = {
        currentQuestionIndex: 0,
        gameStarted: true,
        timestamp: Date.now()
    };
    
    await roomRef.child('gameState').set(gameState);
    console.log('✅ Estado do jogo salvo');
    
    // 7. Verificação final
    try {
        console.log('🔍 VERIFICAÇÃO FINAL:');
        const firebaseQuestions = (await roomRef.child('gameData/questions').once('value')).val();
        const firebaseTeams = (await roomRef.child('gameData/teams').once('value')).val();
        
        console.log('- Perguntas no Firebase:', firebaseQuestions?.length || 0);
        console.log('- Equipes no Firebase:', firebaseTeams?.length || 0);
        
        // Verificação segura da primeira pergunta
        if (firebaseQuestions && firebaseQuestions[0]) {
            try {
                const firstQ = firebaseQuestions[0].enunciado || firebaseQuestions[0].pergunta || '';
                const preview = typeof firstQ === 'string' ? firstQ.substring(0, 50) + '...' : 'Pergunta sem texto';
                console.log('- Primeira pergunta no Firebase:', preview);
            } catch (e) {
                console.log('- Primeira pergunta salva com sucesso');
            }
        }
    } catch (error) {
        console.error('❌ Erro na verificação:', error);
    }
    
    return true;
}

// Exportar
window.saveGameToFirebase = saveGameToFirebase;

console.log('✅ game-start-firebase.js carregado');
