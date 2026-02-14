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
        console.log('👑 Mestre processando resposta do jogador automaticamente...');
        console.log('📊 Dados da resposta:', {
            teamId: answerData.teamId,
            teamName: answerData.teamName,
            playerName: answerData.playerName,
            answer: answerData.answer
        });
        
        // PROCESSAR RESPOSTA AUTOMATICAMENTE
        if (!window.questions || !window.questions[window.currentQuestionIndex]) {
            console.error('❌ Nenhuma pergunta disponível');
            return;
        }
        
        const question = window.questions[window.currentQuestionIndex];
        const gabarito = question?.gabarito ? question.gabarito.trim().toUpperCase() : '';
        const normalizedGabarito = this.normalizeAnswer(gabarito);
        const normalizedUserAnswer = this.normalizeAnswer(answerData.answer);
        
        const isCorrect = normalizedUserAnswer === normalizedGabarito;
        let points = isCorrect ? 1 : 0;
        
        console.log(`🎯 Resposta: ${answerData.answer} | Gabarito: ${gabarito} | ${isCorrect ? 'CORRETO ✅' : 'ERRADO ❌'}`);
        
        // Atualizar pontuação da equipe
        if (window.teams && answerData.teamId >= 0 && window.teams[answerData.teamId]) {
            const team = window.teams[answerData.teamId];
            const oldScore = team.score || 0;
            team.score += points;
            
            console.log(`📊 ${team.name}: ${oldScore} → ${team.score} pontos (+${points})`);
            console.log(`📈 Consecutivos ANTES: ${window.consecutiveCorrect || 0}`);
            
            // VERIFICAR SE ATINGIU 15 PONTOS
            if (team.score >= 15) {
                console.log(`🏆 ${team.name} atingiu 15 pontos - FIM DE JOGO!`);
                window.winnerTeam = team;
                
                if (window.updateTeamsDisplay) {
                    window.updateTeamsDisplay();
                }
                
                // Atualizar no Firebase
                this.updateTeamScore(answerData.teamId, team.score);
                
                // SALVAR VENCEDOR NO FIREBASE
                if (this.currentRoom) {
                    firebase.database()
                        .ref(`rooms/${this.currentRoom}/winner`)
                        .set({
                            teamName: team.name,
                            teamId: answerData.teamId,
                            score: team.score,
                            timestamp: Date.now()
                        })
                        .then(() => console.log('🏆 Vencedor salvo no Firebase'))
                        .catch(err => console.error('❌ Erro ao salvar vencedor:', err));
                }
                
                // Mostrar mensagem de vitória
                if (typeof showWinnerMessage === 'function') {
                    showWinnerMessage();
                }
                
                return;
            }
            
            // REGRA DO RODÍZIO
            if (!isCorrect) {
                console.log(`❌ ${team.name} errou - RODANDO EQUIPE!`);
                window.consecutiveCorrect = 0;
                window.nextTeamRotation = true;
                
                // Salvar flag no Firebase
                if (this.currentRoom) {
                    firebase.database()
                        .ref(`rooms/${this.currentRoom}/nextTeamRotation`)
                        .set(true)
                        .then(() => console.log('💾 Flag de rodízio salva'))
                        .catch(err => console.error('❌ Erro ao salvar flag:', err));
                }
            } else {
                window.consecutiveCorrect = (window.consecutiveCorrect || 0) + 1;
                console.log(`✅ ${team.name} acertou! Consecutivos DEPOIS: ${window.consecutiveCorrect}`);
                
                if (window.consecutiveCorrect >= 5) {
                    console.log(`🏆 ${team.name} com 5 acertos consecutivos - RODANDO EQUIPE!`);
                    window.nextTeamRotation = true;
                    window.consecutiveCorrect = 0;
                    
                    // Salvar flag no Firebase
                    if (this.currentRoom) {
                        firebase.database()
                            .ref(`rooms/${this.currentRoom}/nextTeamRotation`)
                            .set(true)
                            .then(() => console.log('💾 Flag de rodízio salva (5 consecutivas)'))
                            .catch(err => console.error('❌ Erro ao salvar flag:', err));
                    }
                }
            }
            
            if (window.updateTeamsDisplay) {
                window.updateTeamsDisplay();
            }
            
            // Atualizar no Firebase
            this.updateTeamScore(answerData.teamId, team.score);
        } else {
            console.error('❌ Equipe não encontrada!', {
                teamId: answerData.teamId,
                teamsLength: window.teams?.length,
                teams: window.teams?.map(t => ({ id: t.id, name: t.name }))
            });
        }
        
        // Transmitir resultado para todos
        this.broadcastAnswerResult(isCorrect, points, question, answerData);
        
        this.showNotification(`${answerData.playerName} ${isCorrect ? 'acertou' : 'errou'}!`, isCorrect ? 'success' : 'error');
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

// SALVAR EQUIPES NO FIREBASE
RoomSystem.prototype.updateTeamScore = function(teamId, newScore) {
    if (!this.currentRoom || !window.teams) return;
    
    const team = window.teams[teamId];
    if (!team) return;
    
    console.log(`💾 Salvando equipe ${team.name} no Firebase...`);
    
    // Salvar equipe completa no Firebase
    firebase.database()
        .ref(`rooms/${this.currentRoom}/gameData/teams/${teamId}`)
        .set({
            id: team.id,
            name: team.name,
            score: newScore,
            questionsAnswered: team.questionsAnswered || 0,
            questionsCorrect: team.questionsCorrect || 0,
            questionsWrong: team.questionsWrong || 0,
            colorClass: team.colorClass || '',
            turnColorClass: team.turnColorClass || '',
            assignedPlayers: team.assignedPlayers || []
        })
        .then(() => console.log(`✅ Equipe ${team.name} salva no Firebase`))
        .catch(err => console.error('❌ Erro ao salvar equipe:', err));
};

console.log('✅ room-answer-sync.js carregado');