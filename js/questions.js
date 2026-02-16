//ARQUIVO: questions.js
//LOCALIZAÇÃO: js/questions.js
//===============================================

// PATROL - Sistema de Perguntas
console.log('📚 Questions carregando...');

const QuestionSystem = {
    subjects: {},
    questions: [],
    currentQuestionIndex: 0,
    
    init() {
        this.setupEventListeners();
        console.log('✅ Questions inicializado');
    },
    
    setupEventListeners() {
        // Upload de arquivo
        document.getElementById('excel-file')?.addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });
        
        // Controles de assuntos
        window.selectAllSubjects = () => this.toggleAllSubjects(true);
        window.deselectAllSubjects = () => this.toggleAllSubjects(false);
        window.clearSubjects = () => this.clearAllSubjects();
    },
    
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        console.log('📁 Processando arquivo:', file.name);
        
        const statusEl = document.getElementById('file-status');
        if (statusEl) statusEl.textContent = `⏳ Processando ${file.name}...`;
        
        try {
            // Verificar se XLSX está disponível
            if (typeof XLSX === 'undefined') {
                throw new Error('Biblioteca XLSX não carregada');
            }
            
            const data = await this.readFile(file);
            const workbook = XLSX.read(data, { type: 'binary' });
            
            this.subjects = {};
            
            // Processar cada aba
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                if (jsonData.length > 1) {
                    const subject = this.processSheet(jsonData, sheetName);
                    if (subject && subject.questions.length > 0) {
                        this.subjects[subject.name] = subject;
                    }
                }
            });
            
            const totalQuestions = Object.values(this.subjects).reduce((sum, s) => sum + s.questions.length, 0);
            
            if (statusEl) {
                statusEl.textContent = `✅ ${totalQuestions} perguntas carregadas de ${Object.keys(this.subjects).length} assuntos`;
            }
            
            this.updateSubjectsList();
            this.checkStartConditions();
            
            console.log('✅ Arquivo processado:', totalQuestions, 'perguntas');
            
        } catch (error) {
            console.error('❌ Erro ao processar arquivo:', error);
            if (statusEl) {
                statusEl.textContent = `❌ Erro: ${error.message}`;
            }
        }
    },
    
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsBinaryString(file);
        });
    },
    
    processSheet(data, sheetName) {
        const header = data[0];
        
        // Ler metadados (A1, B1, C1, D1)
        const subjectName = header[0] || sheetName;
        const recurrence = header[1] || 'alta';
        
        const questions = [];
        
        // Processar linhas (a partir da linha 2)
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            
            // Pular linhas vazias
            if (!row || !row[0]) continue;
            
            const question = {
                enunciado: row[0] || '',
                gabarito: row[1] || '',
                comentario: row[2] || '',
                comentario2: row[3] || '',
                comentario3: row[4] || '',
                assunto: subjectName,
                assuntoInfo: `📚 ${subjectName}`
            };
            
            if (question.enunciado) {
                questions.push(question);
            }
        }
        
        return {
            name: subjectName,
            recurrence: recurrence.toLowerCase(),
            enabled: true,
            questions: questions
        };
    },
    
    updateSubjectsList() {
        const container = document.getElementById('subjects-container');
        if (!container) return;
        
        const subjectsList = Object.values(this.subjects);
        
        if (subjectsList.length === 0) {
            container.innerHTML = '<div class="no-subjects">Nenhum assunto carregado</div>';
            return;
        }
        
        container.innerHTML = '';
        
        subjectsList.forEach(subject => {
            const item = document.createElement('div');
            item.className = 'subject-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'subject-checkbox';
            checkbox.checked = subject.enabled;
            checkbox.onchange = () => {
                subject.enabled = checkbox.checked;
                this.checkStartConditions();
            };
            
            const label = document.createElement('div');
            label.className = 'subject-label';
            label.innerHTML = `
                <strong>${subject.name}</strong>
                <span>(${subject.questions.length} perguntas)</span>
            `;
            
            // Seletor de recorrência
            const recurrenceSelect = document.createElement('select');
            recurrenceSelect.className = 'recurrence-select';
            recurrenceSelect.innerHTML = `
                <option value="baixa" ${subject.recurrence === 'baixa' ? 'selected' : ''}>Baixa</option>
                <option value="media" ${subject.recurrence === 'media' ? 'selected' : ''}>Média</option>
                <option value="alta" ${subject.recurrence === 'alta' ? 'selected' : ''}>Alta</option>
            `;
            recurrenceSelect.onchange = () => {
                subject.recurrence = recurrenceSelect.value;
                this.checkStartConditions();
            };
            
            item.appendChild(checkbox);
            item.appendChild(label);
            item.appendChild(recurrenceSelect);
            container.appendChild(item);
        });
    },
    
    toggleAllSubjects(enabled) {
        Object.values(this.subjects).forEach(subject => {
            subject.enabled = enabled;
        });
        this.updateSubjectsList();
        this.checkStartConditions();
    },
    
    clearAllSubjects() {
        if (confirm('🗑️ Limpar todos os assuntos?')) {
            this.subjects = {};
            this.updateSubjectsList();
            this.checkStartConditions();
            
            const fileInput = document.getElementById('excel-file');
            if (fileInput) fileInput.value = '';
            
            const statusEl = document.getElementById('file-status');
            if (statusEl) statusEl.textContent = '📁 Nenhum arquivo selecionado';
        }
    },
    
    collectQuestions() {
        this.questions = [];
        
        Object.values(this.subjects).forEach(subject => {
            if (subject.enabled && subject.questions.length > 0) {
                const questionsWithRecurrence = Utils.applyRecurrence(
                    subject.questions, 
                    subject.recurrence
                );
                
                questionsWithRecurrence.forEach((q, index) => {
                    const questionCopy = {...q};
                    questionCopy.originalSubject = subject.name;
                    questionCopy.recurrenceCopy = index + 1;
                    questionCopy.uniqueId = `${subject.name}_${index}`;
                    this.questions.push(questionCopy);
                });
            }
        });
        
        // Embaralhar se necessário
        const randomOrder = document.getElementById('random-order')?.checked;
        if (randomOrder) {
            this.questions = Utils.shuffle(this.questions);
        }
        
        console.log(`📚 ${this.questions.length} perguntas coletadas (com recorrência)`);
        return this.questions;
    },
    
    checkStartConditions() {
        let hasQuestions = false;
        let totalQuestions = 0;
        
        Object.values(this.subjects).forEach(subject => {
            if (subject.enabled && subject.questions.length > 0) {
                hasQuestions = true;
                totalQuestions += subject.questions.length;
            }
        });
        
        const fileError = document.getElementById('file-error');
        if (fileError) {
            fileError.style.display = hasQuestions ? 'none' : 'block';
        }
        
        const totalEl = document.getElementById('total-questions');
        if (totalEl) totalEl.textContent = totalQuestions;
        
        // Verificar condições gerais
        const hasTeams = window.TeamSystem?.checkStartConditions();
        const canStart = hasTeams && hasQuestions;
        
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.disabled = !canStart;
            startBtn.className = canStart ? 'start-game-btn enabled' : 'start-game-btn disabled';
        }
        
        return hasQuestions;
    }
};

// Tornar acessível globalmente
window.QuestionSystem = QuestionSystem;

// Inicializar quando templates estiverem prontos
document.addEventListener('templatesLoaded', () => {
    QuestionSystem.init();
});

console.log('✅ Questions carregado');