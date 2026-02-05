// js/main/game-start-firebase.js - SALVAR NO FIREBASE
console.log('🚀 game-start-firebase.js carregando...');

async function saveGameToFirebase() {
    try {
        const roomCode = window.roomSystem.currentRoom;
        console.log('💾 SALVANDO NO FIREBASE - Sala:', roomCode);
        
        const roomRef = firebase.database().ref('rooms/' + roomCode);
        
        // Status
        await roomRef.child('status').set('playing');
        console.log('✅ Status: playing');
        
        // SALVAR PERGUNTAS COM RECORRÊNCIA
        console.log('💾 Salvando perguntas (com recorrência):', window.questions.length);
        await roomRef.child('gameData/questions').set(window.questions);
        
        // SALVAR EQUIPES
        console.log('💾 Salvando equipes:', window.teams.length);
        await roomRef.child('gameData/teams').set(window.teams);
        
        // SALVAR METADADOS DE RECORRÊNCIA
        const recurrenceInfo = {};
        if (window.subjects) {
            Object.values(window.subjects).forEach(subject => {
                if (subject.enabled) {
                    recurrenceInfo[subject.name] = {
                        recurrence: subject.recurrence,
                        originalCount: subject.questions.length,
                        finalCount: subject.recurrence === 'baixa' ? subject.questions.length :
                                   subject.recurrence === 'media' ? subject.questions.length * 2 :
                                   subject.questions.length * 3
                    };
                }
            });
        }
        
        await roomRef.child('gameData/recurrenceInfo').set(recurrenceInfo);
        console.log('✅ Metadados de recorrência salvos');
        
        // ORDEM
        const randomOrderCheckbox = document.getElementById('random-order');
        const isRandomOrder = randomOrderCheckbox?.checked || false;
        
        const orderData = {
            teams: window.teams.map(t => t.id),
            questions: window.questions.map((q, i) => i),
            isRandom: isRandomOrder,
            timestamp: Date.now()
        };
        
        if (isRandomOrder && typeof shuffleArray === 'function') {
            const shuffledQuestions = [...window.questions];
            shuffleArray(shuffledQuestions);
            orderData.questions = shuffledQuestions.map((q, i) => i);
            window.questions = shuffledQuestions;
            
            const shuffledTeams = [...window.teams];
            shuffleArray(shuffledTeams);
            orderData.teams = shuffledTeams.map(t => t.id);
            window.teams = shuffledTeams;
            
            console.log('✅ Ordem aleatória aplicada');
        }
        
        await roomRef.child('gameData/order').set(orderData);
        console.log('✅ Ordem salva no Firebase');
        
        // ESTADO DO JOGO
        const gameState = {
            startedAt: Date.now(),
            currentQuestionIndex: 0,
            currentTeamIndex: 0,
            mestre: window.roomSystem.playerName,
            roomCode: roomCode,
            totalQuestions: window.questions.length,
            totalTeams: window.teams.length,
            recurrenceApplied: true
        };
        await roomRef.child('gameState').set(gameState);
        console.log('✅ Estado do jogo salvo');
        
        // VERIFICAÇÃO
        setTimeout(async () => {
            try {
                const verifyQuestions = await roomRef.child('gameData/questions').once('value');
                const verifyTeams = await roomRef.child('gameData/teams').once('value');
                
                console.log('🔍 VERIFICAÇÃO FINAL:');
                console.log('- Perguntas no Firebase:', verifyQuestions.exists() ? verifyQuestions.val().length : 'NÃO');
                console.log('- Equipes no Firebase:', verifyTeams.exists() ? verifyTeams.val().length : 'NÃO');
                
                if (verifyQuestions.exists()) {
                    const firebaseQuestions = verifyQuestions.val();
                    console.log('- Primeira pergunta no Firebase:', firebaseQuestions[0]?.enunciado?.substring(0, 50) + '...');
                }
            } catch (verifyError) {
                console.error('❌ Erro na verificação:', verifyError);
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ ERRO Firebase:', error);
        alert('❌ Erro ao salvar: ' + error.message);
        throw error;
    }
}

window.saveGameToFirebase = saveGameToFirebase;
console.log('✅ game-start-firebase.js carregado');