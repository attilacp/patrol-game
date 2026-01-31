// js/bombQuestion/game-manager.js (COMPLETO CORRIGIDO)
class BombGameManager {
    constructor(bombSystem) {
        this.bombSystem = bombSystem;
        this.savedColors = null;
        this.colors = ["#4FC3F7", "#81C784", "#FF8A65", "#BA68C8", "#FFF176", "#4DB6AC", "#7986CB", "#FFB74D", "#A1887F", "#90A4AE"];
        this.borderColors = ["#0288D1", "#388E3C", "#D84315", "#7B1FA2", "#F9A825", "#00897B", "#3949AB", "#EF6C00", "#5D4037", "#455A64"];
    }

    skipBombQuestion() {
        this.cleanupColorProtection();
        this.bombSystem.finishBombQuestion(false);
    }

    async finishBombQuestion(success) {
        this.cleanupColorProtection();
        
        if (success && !this.bombSystem.penaltyApplied) {
            await this.handleSuccessfulBomb();
        } else {
            this.continueToNextQuestion();
        }
    }

    async handleSuccessfulBomb() {
        const penalizingTeam = window.teams[window.currentTeamIndex];
        
        if (penalizingTeam && window.teams.length > 1) {
            try {
                this.saveCurrentColors();
                const toPenalize = await this.bombSystem.penaltyModal.showPenaltyModal(penalizingTeam);
                
                if (toPenalize) {
                    this.bombSystem.penaltyApplied = true;
                    this.restoreColorsAfterPenalty();
                    this.showCorrectPBAnswers();
                    return;
                }
                this.restoreColorsAfterPenalty();
            } catch (e) {
                console.error('Erro no modal de penalidade:', e);
            }
        }
        this.showCorrectPBAnswers();
    }

    checkBombAnswers() {
        if (!this.bombSystem.currentBombQuestion) return;
        
        const answersList = document.getElementById("answers-sortable-list");
        if (!answersList) return;
        
        const answerItems = Array.from(answersList.querySelectorAll(".answer-item"));
        const totalPairs = this.bombSystem.currentBombQuestion.items.length;
        
        this.analyzeDuplicateAnswers();
        this.bombSystem.clearHighlightedAnswers();
        
        // 1. PRIMEIRO VERIFICAR RESPOSTAS
        const result = this.checkEachPosition(answerItems, totalPairs);
        
        // 2. APLICAR CORES DOS PARES
        if (this.bombSystem.uiManager && this.bombSystem.uiManager.applyPairColors) {
            this.bombSystem.uiManager.applyPairColors();
        } else {
            this.applyPairColors(answerItems);
        }
        
        // 3. APLICAR ANIMAÇÕES DE CORRETO/INCORRETO (SEM SOBRESCREVER CORES)
        this.applyCorrectIncorrectAnimations(answerItems, result);
        
        result.correct === totalPairs ? this.showSuccessContinueButton() : this.showErrorContinueButton();
    }

    analyzeDuplicateAnswers() {
        const counts = {};
        this.bombSystem.currentBombQuestion.items.forEach(item => {
            const resposta = item.resposta.trim();
            counts[resposta] = (counts[resposta] || 0) + 1;
        });
        
        const duplicates = Object.entries(counts).filter(([resposta, count]) => count > 1);
        duplicates.length > 0 && console.log(`📝 ${duplicates.length} resposta(s) duplicada(s):`);
    }

    checkEachPosition(answerItems, totalPairs) {
        let correctCount = 0;
        for (let i = 0; i < totalPairs; i++) {
            const answerItem = answerItems[i];
            const userAnswer = answerItem.getAttribute("data-correct-answer").trim();
            const correctAnswer = this.bombSystem.currentBombQuestion.items[i].resposta.trim();
            const isCorrect = userAnswer === correctAnswer;
            
            if (isCorrect) {
                correctCount++;
            }
        }
        return {correct: correctCount, total: totalPairs};
    }

    applyPairColors(answerItems) {
        if (!this.bombSystem.currentBombQuestion) return;
        
        const bomb = this.bombSystem.currentBombQuestion;
        const colorAssignment = {};
        let colorIndex = 0;
        
        // Atribuir cor única para cada resposta distinta
        bomb.items.forEach(item => {
            const resposta = item.resposta.trim();
            if (!colorAssignment[resposta]) {
                colorAssignment[resposta] = colorIndex % this.colors.length;
                colorIndex++;
            }
        });
        
        console.log('🎨 Atribuição de cores para pares:', colorAssignment);
        
        // Aplicar cores às PERGUNTAS
        bomb.items.forEach((item, index) => {
            const questionElement = document.querySelector(`.question-item[data-index="${index}"]`);
            if (questionElement) {
                const corIndex = colorAssignment[item.resposta.trim()];
                const bgColor = this.colors[corIndex];
                const borderColor = this.borderColors[corIndex];
                
                questionElement.style.cssText += `
                    background-color: ${bgColor} !important;
                    border-left: 5px solid ${borderColor} !important;
                `;
                questionElement.dataset.colorIndex = corIndex;
                questionElement.dataset.assignedBg = bgColor;
                questionElement.dataset.assignedBorder = borderColor;
            }
        });
        
        // Aplicar cores às RESPOSTAS
        answerItems.forEach(item => {
            const answerText = item.getAttribute('data-correct-answer').trim();
            const corIndex = colorAssignment[answerText];
            
            if (corIndex !== undefined) {
                const bgColor = this.colors[corIndex];
                const borderColor = this.borderColors[corIndex];
                
                item.style.cssText += `
                    background-color: ${bgColor} !important;
                    border-left: 5px solid ${borderColor} !important;
                `;
                item.dataset.colorIndex = corIndex;
                item.dataset.assignedBg = bgColor;
                item.dataset.assignedBorder = borderColor;
            }
        });
    }

    applyCorrectIncorrectAnimations(answerItems, result) {
        for (let i = 0; i < result.total; i++) {
            const item = answerItems[i];
            const userAnswer = item.getAttribute("data-correct-answer").trim();
            const correctAnswer = this.bombSystem.currentBombQuestion.items[i].resposta.trim();
            const isCorrect = userAnswer === correctAnswer;
            
            // APENAS ADICIONAR CLASSES PARA ANIMAÇÃO, NÃO REMOVER CORES
            if (isCorrect) {
                item.classList.add("correct");
                item.classList.remove("incorrect");
            } else {
                item.classList.add("incorrect");
                item.classList.remove("correct");
            }
        }
    }

    showSuccessContinueButton() {
        const answerButtons = document.querySelector(".answer-buttons");
        if (!answerButtons) return;
        answerButtons.innerHTML = '<button class="answer-btn certo-btn" onclick="window.bombQuestionSystem.gameManager.finishBombQuestion(true)">✅ Continuar</button>';
    }

    showErrorContinueButton() {
        const answerButtons = document.querySelector(".answer-buttons");
        if (!answerButtons) return;
        answerButtons.innerHTML = '<button class="answer-btn certo-btn" onclick="window.bombQuestionSystem.gameManager.continueAfterError()">✅ Continuar</button>';
    }

    continueAfterError() {
        this.bombSystem.showingResults = false;
        this.bombSystem.finishBombQuestion(false);
    }

    saveCurrentColors() {
        const items = document.querySelectorAll('#answers-sortable-list .answer-item');
        this.savedColors = Array.from(items).map(item => ({
            element: item,
            datasetBg: item.dataset.assignedBg,
            datasetBorder: item.dataset.assignedBorder
        }));
    }

    restoreColorsAfterPenalty() {
        if (!this.savedColors?.length) return;
        this.savedColors.forEach(data => {
            if (data.element?.parentNode) {
                if (data.datasetBg) {
                    data.element.style.cssText += `background-color: ${data.datasetBg} !important;`;
                }
                if (data.datasetBorder) {
                    data.element.style.cssText += `border-left: 5px solid ${data.datasetBorder} !important;`;
                }
                data.element.classList.add('color-protected', 'color-locked');
                data.element.dataset.colorProtected = 'true';
            }
        });
        
        // PRESERVAR CORES DAS PERGUNTAS TAMBÉM
        this.preserveQuestionColors();
    }

    showCorrectPBAnswers() {
        const container = document.getElementById('answers-sortable-list');
        if (!container) return;
        
        this.bombSystem.clearHighlightedAnswers();
        
        // NÃO RECRIAR ELEMENTOS - APENAS REORDENAR
        const items = Array.from(container.querySelectorAll('.answer-item'));
        const correctOrder = [...items].sort((a, b) => {
            const answerA = a.getAttribute('data-correct-answer').trim();
            const answerB = b.getAttribute('data-correct-answer').trim();
            const indexA = this.bombSystem.currentBombQuestion.items.findIndex(item => item.resposta.trim() === answerA);
            const indexB = this.bombSystem.currentBombQuestion.items.findIndex(item => item.resposta.trim() === answerB);
            return indexA - indexB;
        });
        
        // REMOVER TODOS E ADICIONAR NA ORDEM CORRETA
        items.forEach(item => item.remove());
        correctOrder.forEach((item, index) => {
            item.classList.add('correct');
            item.classList.remove('incorrect');
            
            // MANTER CORES EXISTENTES
            const bgColor = item.dataset.assignedBg || this.colors[index % this.colors.length];
            const borderColor = item.dataset.assignedBorder || this.borderColors[index % this.borderColors.length];
            
            item.style.cssText += `
                background-color: ${bgColor} !important;
                border-left: 5px solid ${borderColor} !important;
            `;
            
            container.appendChild(item);
        });
        
        // PRESERVAR CORES DAS PERGUNTAS
        this.preserveQuestionColors();
        
        this.showContinueButton();
    }

    preserveQuestionColors() {
        const bomb = this.bombSystem.currentBombQuestion;
        if (!bomb) return;
        
        const colorAssignment = {};
        let colorIndex = 0;
        
        // RECRIAR ATRIBUIÇÃO DE CORES
        bomb.items.forEach(item => {
            const resposta = item.resposta.trim();
            if (!colorAssignment[resposta]) {
                colorAssignment[resposta] = colorIndex % this.colors.length;
                colorIndex++;
            }
        });
        
        // APLICAR/MANTER CORES NAS PERGUNTAS
        bomb.items.forEach((item, index) => {
            const questionElement = document.querySelector(`.question-item[data-index="${index}"]`);
            if (questionElement) {
                const corIndex = colorAssignment[item.resposta.trim()];
                const bgColor = this.colors[corIndex];
                const borderColor = this.borderColors[corIndex];
                
                questionElement.style.cssText += `
                    background-color: ${bgColor} !important;
                    border-left: 5px solid ${borderColor} !important;
                `;
                questionElement.dataset.colorIndex = corIndex;
                questionElement.dataset.assignedBg = bgColor;
                questionElement.dataset.assignedBorder = borderColor;
            }
        });
    }

    showContinueButton() {
        const answerButtons = document.querySelector('.answer-buttons');
        if (!answerButtons) return;
        answerButtons.innerHTML = '<button class="answer-btn certo-btn">✅ Continuar</button>';
        answerButtons.querySelector('button').onclick = () => this.continueToNextQuestion();
    }

    continueToNextQuestion() {
        this.cleanupColorProtection();
        
        this.bombSystem.isBombActive = false;
        this.bombSystem.currentBombQuestion = null;
        this.bombSystem.showingResults = false;
        this.bombSystem.penaltyApplied = false;
        
        window.nextTeamRotation = true;
        window.consecutiveCorrect = 0;
        window.currentQuestionIndex++;
        
        // LIMPAR CORES DA PB ANTES DE VOLTAR
        if (this.bombSystem.uiManager && this.bombSystem.uiManager.clearAllColors) {
            this.bombSystem.uiManager.clearAllColors();
        }
        
        if (this.bombSystem.normalState) {
            const questionArea = document.getElementById('question-text');
            const answerButtons = document.querySelector('.answer-buttons');
            if (questionArea) questionArea.innerHTML = this.bombSystem.normalState.questionText;
            if (answerButtons) answerButtons.innerHTML = this.bombSystem.normalState.answerButtons;
            this.bombSystem.normalState = null;
        }
        
        if (this.bombSystem.uiManager && this.bombSystem.uiManager.showNormalQuestionElements) {
            this.bombSystem.uiManager.showNormalQuestionElements();
        }
        
        this.bombSystem.restoreAnswerButtons();
        
        setTimeout(() => {
            if (window.initializeGameEventListeners) {
                window.initializeGameEventListeners();
            }
            setTimeout(() => {
                if (window.showQuestion) {
                    window.showQuestion();
                }
            }, 100);
        }, 100);
    }

    cleanupColorProtection() {
        // Limpar qualquer proteção de cor se existir
    }
}

if (typeof window !== 'undefined') window.BombGameManager = BombGameManager;