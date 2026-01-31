// js/bombQuestion/ui-manager.js (COMPLETO CORRIGIDO)
class BombUIManager {
    constructor(bombSystem) {
        this.bombSystem = bombSystem;
        this.selectedItem = null;
        this.clickHandler = null;
        this.isProcessing = false;
        this.colors = ["#4FC3F7", "#81C784", "#FF8A65", "#BA68C8", "#FFF176", "#4DB6AC", "#7986CB", "#FFB74D", "#A1887F", "#90A4AE"];
        this.borderColors = ["#0288D1", "#388E3C", "#D84315", "#7B1FA2", "#F9A825", "#00897B", "#3949AB", "#EF6C00", "#5D4037", "#455A64"];
    }

    displayBombQuestion() {
        if (!this.bombSystem.currentBombQuestion) return;
        
        const questionArea = document.getElementById('question-text');
        const answerButtons = document.querySelector('.answer-buttons');
        if (!questionArea || !answerButtons) return;
        
        this.saveNormalState(questionArea, answerButtons);
        this.hideNormalElements();
        
        questionArea.innerHTML = this.createBombHTML();
        answerButtons.innerHTML = this.createBombButtons();
        
        this.setupBombButtons();
        this.setupDragAndDrop();
        this.clearAllColors(); // SEM CORES INICIAIS
        console.log('💣 PB exibida - SEM CORES (aguardando conferência)');
    }

    saveNormalState(questionArea, answerButtons) {
        this.bombSystem.normalState = {
            questionText: questionArea.innerHTML,
            answerButtons: answerButtons.innerHTML
        };
    }

    hideNormalElements() {
        ['correct-answer', 'commentary'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
    }

    createBombHTML() {
        const bomb = this.bombSystem.currentBombQuestion;
        if (bomb.items.length < 2) return '<div class="error">❌ Não há pares suficientes</div>';
        
        const questionsHTML = bomb.items.map((item, index) => `
            <div class="question-item" data-index="${index}" data-original-answer="${item.resposta.trim()}" data-correct-answer="${item.resposta.trim()}">
                <span class="question-number">${index + 1}.&nbsp;&nbsp;</span>
                <span class="question-text">${item.pergunta}</span>
            </div>`).join('');
        
        const shuffledAnswers = this.shuffleArray([...bomb.items]);
        const answersHTML = shuffledAnswers.map((item, index) => {
            const letter = String.fromCharCode(65 + index);
            return `
                <div class="answer-item clickable" data-index="${index}" 
                     data-correct-answer="${item.resposta}" 
                     data-id="item-${index}"
                     data-original-index="${bomb.items.findIndex(q => q.resposta.trim() === item.resposta.trim())}">
                    <div class="answer-icon">🖱️</div>
                    <span class="answer-letter">${letter}.&nbsp;&nbsp;</span>
                    <span class="answer-text">${item.resposta}</span>
                </div>`;
        }).join('');
        
        return `
            <div class="bomb-question-container-new">
                <div class="bomb-header">
                    <div class="bomb-title">💣 PERGUNTA BOMBA</div>
                    <div class="bomb-instructions">Clique nas respostas para organizá-las na ordem correta</div>
                </div>
                <div class="bomb-layout">
                    <div class="questions-panel">
                        <div class="panel-title">PERGUNTAS</div>
                        <div class="questions-container">${questionsHTML}</div>
                    </div>
                    <div class="answers-panel">
                        <div class="panel-title">RESPOSTAS</div>
                        <div class="answers-container" id="answers-sortable-list">${answersHTML}</div>
                    </div>
                </div>
            </div>`;
    }

    createBombButtons() {
        return `
            <button id="check-bomb-answers" class="answer-btn certo-btn">✅ Conferir Respostas</button>
            <button id="skip-bomb" class="skip-btn">⏭️ Pular Pergunta Bomba</button>`;
    }

    setupBombButtons() {
        this.setupButton('check-bomb-answers', () => this.bombSystem.checkBombAnswers());
        this.setupButton('skip-bomb', () => {
            if (confirm('Pular a Pergunta Bomba?')) this.bombSystem.skipBombQuestion();
        });
    }

    setupButton(id, handler) {
        const btn = document.getElementById(id);
        if (btn) {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            document.getElementById(id).onclick = e => {
                e.preventDefault?.();
                e.stopPropagation?.();
                setTimeout(handler, 50);
            };
        }
    }

    setupDragAndDrop() {
        setTimeout(() => this.initClickSystem(), 100);
    }
    
    initClickSystem() {
        const container = document.getElementById('answers-sortable-list');
        if (!container) return;
        
        const items = container.querySelectorAll('.answer-item');
        items.forEach((item, index) => {
            item.classList.add('clickable');
            item.style.cursor = 'pointer';
            item.dataset.index = index;
            if (!item.dataset.id) {
                item.dataset.id = `item-${Date.now()}-${index}`;
            }
            
            // SE JÁ TEM CORES, REAPLICAR
            if (item.dataset.assignedBg && item.dataset.assignedBorder) {
                item.style.cssText += `
                    background-color: ${item.dataset.assignedBg} !important;
                    border-left: 5px solid ${item.dataset.assignedBorder} !important;
                `;
            }
        });
        
        this.clickHandler = (e) => this.handleClick(e);
        container.addEventListener('click', this.clickHandler);
        
        // REINSTAURAR CORES SE NECESSÁRIO
        this.reinstateColorsAfterInteraction();
    }
    
    handleClick(event) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        let target = event.target;
        while (target && !target.classList.contains('answer-item')) {
            target = target.parentElement;
            if (!target || target === document.body) {
                this.isProcessing = false;
                return;
            }
        }
        
        if (!target || !target.classList.contains('answer-item')) {
            this.isProcessing = false;
            return;
        }
        
        event.preventDefault();
        event.stopPropagation();
        
        if (!this.selectedItem) {
            this.selectItem(target);
        } else if (this.selectedItem === target) {
            this.deselectItem();
        } else {
            this.swapItems(this.selectedItem, target);
        }
        
        setTimeout(() => { this.isProcessing = false; }, 50);
    }
    
    selectItem(item) {
        this.deselectAll();
        item.style.backgroundColor = '#cce5ff';
        item.style.borderColor = '#007bff';
        item.style.boxShadow = '0 0 10px rgba(0,123,255,0.5)';
        this.selectedItem = item;
    }
    
    deselectItem() {
        if (this.selectedItem) {
            // RESTAURAR COR ORIGINAL SE EXISTIR
            if (this.selectedItem.dataset.assignedBg && this.selectedItem.dataset.assignedBorder) {
                this.selectedItem.style.cssText += `
                    background-color: ${this.selectedItem.dataset.assignedBg} !important;
                    border-left: 5px solid ${this.selectedItem.dataset.assignedBorder} !important;
                `;
            } else {
                this.selectedItem.style.backgroundColor = '#f8f9fa';
                this.selectedItem.style.borderColor = '#dee2e6';
            }
            this.selectedItem.style.boxShadow = '';
            this.selectedItem = null;
        }
    }
    
    deselectAll() {
        document.querySelectorAll('.answer-item').forEach(item => {
            if (item.dataset.assignedBg && item.dataset.assignedBorder) {
                item.style.cssText += `
                    background-color: ${item.dataset.assignedBg} !important;
                    border-left: 5px solid ${item.dataset.assignedBorder} !important;
                    box-shadow: none !important;
                `;
            } else {
                item.style.backgroundColor = '#f8f9fa';
                item.style.borderColor = '#dee2e6';
                item.style.boxShadow = '';
            }
        });
        this.selectedItem = null;
    }
    
    swapItems(itemA, itemB) {
        const container = document.getElementById('answers-sortable-list');
        if (!container) return;
        
        // SALVAR DADOS ANTES DE TROCAR
        const dataA = {
            html: itemA.outerHTML,
            dataset: { ...itemA.dataset },
            style: itemA.style.cssText,
            classes: Array.from(itemA.classList)
        };
        
        const dataB = {
            html: itemB.outerHTML,
            dataset: { ...itemB.dataset },
            style: itemB.style.cssText,
            classes: Array.from(itemB.classList)
        };
        
        // CRIAR NOVOS ELEMENTOS COM DADOS PRESERVADOS
        const tempDiv = document.createElement('div');
        
        // ELEMENTO A (com dados do B)
        tempDiv.innerHTML = dataB.html;
        const newItemA = tempDiv.firstElementChild;
        Object.assign(newItemA.dataset, dataB.dataset);
        newItemA.style.cssText = dataB.style;
        dataB.classes.forEach(cls => newItemA.classList.add(cls));
        
        // ELEMENTO B (com dados do A)
        tempDiv.innerHTML = dataA.html;
        const newItemB = tempDiv.firstElementChild;
        Object.assign(newItemB.dataset, dataA.dataset);
        newItemB.style.cssText = dataA.style;
        dataA.classes.forEach(cls => newItemB.classList.add(cls));
        
        // SUBSTITUIR ELEMENTOS
        container.insertBefore(newItemA, itemA);
        container.removeChild(itemA);
        container.insertBefore(newItemB, itemB);
        container.removeChild(itemB);
        
        // REAPLICAR CORES APÓS TROCA
        setTimeout(() => {
            if (newItemA.dataset.assignedBg && newItemA.dataset.assignedBorder) {
                newItemA.style.cssText += `
                    background-color: ${newItemA.dataset.assignedBg} !important;
                    border-left: 5px solid ${newItemA.dataset.assignedBorder} !important;
                `;
            }
            
            if (newItemB.dataset.assignedBg && newItemB.dataset.assignedBorder) {
                newItemB.style.cssText += `
                    background-color: ${newItemB.dataset.assignedBg} !important;
                    border-left: 5px solid ${newItemB.dataset.assignedBorder} !important;
                `;
            }
            
            this.initClickSystem();
            this.deselectAll();
        }, 50);
    }
    
    cleanup() {
        const container = document.getElementById('answers-sortable-list');
        if (container && this.clickHandler) {
            container.removeEventListener('click', this.clickHandler);
        }
        this.selectedItem = null;
        this.isProcessing = false;
    }

    clearAllColors() {
        // Remover cores de perguntas
        document.querySelectorAll('.question-item').forEach(item => {
            item.style.backgroundColor = '#f8f9fa';
            item.style.borderLeft = '5px solid #dee2e6';
            delete item.dataset.assignedBg;
            delete item.dataset.assignedBorder;
            delete item.dataset.colorIndex;
            item.classList.remove('color-protected', 'color-locked');
        });
        
        // Remover cores de respostas  
        document.querySelectorAll('.answer-item').forEach(item => {
            item.style.backgroundColor = '#f8f9fa';
            item.style.borderLeft = '3px solid #dee2e6';
            delete item.dataset.assignedBg;
            delete item.dataset.assignedBorder;
            delete item.dataset.colorIndex;
            item.classList.remove('color-protected', 'color-locked', 'correct', 'incorrect');
        });
    }

    reinstateColorsAfterInteraction() {
        console.log('🔁 Reinstaurando cores após interação...');
        
        // RESTAURAR CORES DAS PERGUNTAS
        document.querySelectorAll('.question-item').forEach(item => {
            if (item.dataset.assignedBg && item.dataset.assignedBorder) {
                item.style.cssText += `
                    background-color: ${item.dataset.assignedBg} !important;
                    border-left: 5px solid ${item.dataset.assignedBorder} !important;
                `;
            }
        });
        
        // RESTAURAR CORES DAS RESPOSTAS
        document.querySelectorAll('.answer-item').forEach(item => {
            if (item.dataset.assignedBg && item.dataset.assignedBorder) {
                item.style.cssText += `
                    background-color: ${item.dataset.assignedBg} !important;
                    border-left: 5px solid ${item.dataset.assignedBorder} !important;
                `;
            }
        });
    }

    getColorAssignment(bomb) {
        const colorAssignment = {};
        let currentColorIndex = 0;
        
        bomb.items.forEach((item, index) => {
            const resposta = item.resposta.trim();
            if (!colorAssignment[resposta]) {
                colorAssignment[resposta] = currentColorIndex % this.colors.length;
                currentColorIndex++;
            }
        });
        
        return colorAssignment;
    }

    applyPairColors() {
        if (!this.bombSystem.currentBombQuestion) return;
        
        const bomb = this.bombSystem.currentBombQuestion;
        const colorAssignment = this.getColorAssignment(bomb);
        
        console.log('🎨 Aplicando cores aos pares...');
        console.log('📊 Atribuição de cores:', colorAssignment);
        
        // Aplicar cores às PERGUNTAS
        bomb.items.forEach((item, index) => {
            const questionElement = document.querySelector(`.question-item[data-index="${index}"]`);
            if (questionElement) {
                const colorIndex = colorAssignment[item.resposta.trim()];
                const bgColor = this.colors[colorIndex];
                const borderColor = this.borderColors[colorIndex];
                
                // GARANTIR !important NO ESTILO INLINE
                questionElement.style.cssText += `
                    background-color: ${bgColor} !important;
                    border-left: 5px solid ${borderColor} !important;
                `;
                questionElement.dataset.colorIndex = colorIndex;
                questionElement.dataset.assignedBg = bgColor;
                questionElement.dataset.assignedBorder = borderColor;
                
                console.log(`📝 Pergunta ${index+1}: cor ${colorIndex} (${bgColor})`);
            }
        });
        
        // Aplicar cores às RESPOSTAS
        const answerItems = document.querySelectorAll('.answer-item');
        answerItems.forEach(item => {
            const answerText = item.getAttribute('data-correct-answer').trim();
            const colorIndex = colorAssignment[answerText];
            
            if (colorIndex !== undefined) {
                const bgColor = this.colors[colorIndex];
                const borderColor = this.borderColors[colorIndex];
                
                // GARANTIR !important E REMOVER CLASSES CONFLITANTES
                item.classList.remove('correct', 'incorrect'); // Remover classes que dão cor fixa
                item.style.cssText += `
                    background-color: ${bgColor} !important;
                    border-left: 5px solid ${borderColor} !important;
                `;
                item.dataset.colorIndex = colorIndex;
                item.dataset.assignedBg = bgColor;
                item.dataset.assignedBorder = borderColor;
                
                console.log(`📝 Resposta "${answerText.substring(0,20)}...": cor ${colorIndex} (${bgColor})`);
            }
        });
        
        console.log('✅ Cores aplicadas - cada par tem cor única');
    }

    preserveQuestionColors() {
        const bomb = this.bombSystem.currentBombQuestion;
        if (!bomb) return;
        
        const colorAssignment = this.getColorAssignment(bomb);
        
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

    showNormalQuestionElements() {
        ['correct-answer', 'commentary'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = '';
        });
    }

    shuffleArray(array) {
        return [...array].sort(() => Math.random() - 0.5);
    }
}

if (typeof window !== 'undefined') window.BombUIManager = BombUIManager;