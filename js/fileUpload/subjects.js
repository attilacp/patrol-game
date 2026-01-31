// file name: js/fileUpload/subjects.js
console.log('📁 fileUpload/subjects.js carregando...');

// Atualizar lista de assuntos na UI
function updateSubjectsList() {
    const container = document.getElementById('subjects-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!window.subjects || Object.keys(window.subjects).length === 0) {
        container.innerHTML = '<div class="no-subjects">Nenhum assunto carregado</div>';
        return;
    }
    
    Object.values(window.subjects).forEach(subject => {
        const subjectItem = document.createElement('div');
        subjectItem.className = 'subject-item';
        
        // Exibir apenas B1, C1, D1 (sem rótulos B1, C1, D1)
        let assuntosHTML = '';
        const assuntosArray = [];
        if (subject.cellB1) assuntosArray.push(subject.cellB1);
        if (subject.cellC1) assuntosArray.push(subject.cellC1);
        if (subject.cellD1) assuntosArray.push(subject.cellD1);
        
        if (assuntosArray.length > 0) {
            assuntosHTML = '<div class="subject-multiple-assuntos">';
            assuntosArray.forEach(assunto => {
                if (assunto) {
                    assuntosHTML += '<div class="assunto-item">' + assunto + '</div>';
                }
            });
            assuntosHTML += '</div>';
        }
        
        subjectItem.innerHTML = `
            <label class="subject-checkbox">
                <input type="checkbox" ${subject.enabled ? 'checked' : ''} 
                       onchange="toggleSubject('${subject.name}', this.checked)">
                <span class="checkmark"></span>
            </label>
            <div class="subject-info">
                <div class="subject-name">${subject.name}</div>
                <div class="subject-details">
                    ${subject.questions.length} perguntas • ${subject.fileName}
                </div>
                ${assuntosHTML}
            </div>
            <div class="recurrence-controls">
                <label>Recorrência:</label>
                <select class="recurrence-select" onchange="updateRecurrence('${subject.name}', this.value)">
                    <option value="baixa" ${subject.recurrence === 'baixa' ? 'selected' : ''}>Baixa</option>
                    <option value="media" ${subject.recurrence === 'media' ? 'selected' : ''}>Média</option>
                    <option value="alta" ${subject.recurrence === 'alta' ? 'selected' : ''}>Alta</option>
                </select>
            </div>
            <button class="remove-subject" onclick="removeSubject('${subject.name}')">🗑️</button>
        `;
        container.appendChild(subjectItem);
    });
}

// Atualizar recorrência de um assunto
function updateRecurrence(subjectName, recurrence) {
    if (window.subjects && window.subjects[subjectName]) {
        window.subjects[subjectName].recurrence = recurrence;
    }
}

// Alternar seleção de assunto
function toggleSubject(subjectName, enabled) {
    if (window.subjects && window.subjects[subjectName]) {
        window.subjects[subjectName].enabled = enabled;
        if (typeof updateTotalQuestionsCount === 'function') {
            updateTotalQuestionsCount();
        }
        if (typeof checkStartGame === 'function') checkStartGame();
    }
}

// Remover assunto
function removeSubject(subjectName) {
    if (window.subjects && window.subjects[subjectName]) {
        delete window.subjects[subjectName];
        if (typeof updateSubjectsList === 'function') {
            updateSubjectsList();
        }
        if (typeof updateTotalQuestionsCount === 'function') {
            updateTotalQuestionsCount();
        }
        if (typeof checkStartGame === 'function') checkStartGame();
    }
}

// Atualizar contador total de perguntas
function updateTotalQuestionsCount() {
    let totalQuestions = 0;
    if (window.subjects) {
        Object.values(window.subjects).forEach(subject => {
            if (subject.enabled) {
                totalQuestions += subject.questions.length;
            }
        });
    }
    
    const totalQuestionsElement = document.getElementById('total-questions');
    if (totalQuestionsElement) {
        totalQuestionsElement.textContent = totalQuestions;
    }
}

// Limpar todos os assuntos
function clearAllSubjects() {
    window.subjects = {};
    if (typeof updateSubjectsList === 'function') {
        updateSubjectsList();
    }
    if (typeof updateTotalQuestionsCount === 'function') {
        updateTotalQuestionsCount();
    }
    if (typeof checkStartGame === 'function') {
        checkStartGame();
    }
}

// Alternar todos os assuntos
function toggleAllSubjects(enabled) {
    if (window.subjects) {
        Object.values(window.subjects).forEach(subject => {
            subject.enabled = enabled;
        });
        if (typeof updateSubjectsList === 'function') {
            updateSubjectsList();
        }
        if (typeof updateTotalQuestionsCount === 'function') {
            updateTotalQuestionsCount();
        }
        if (typeof checkStartGame === 'function') {
            checkStartGame();
        }
    }
}

// Exportar funções
if (typeof window !== 'undefined') {
    window.updateSubjectsList = updateSubjectsList;
    window.updateRecurrence = updateRecurrence;
    window.toggleSubject = toggleSubject;
    window.removeSubject = removeSubject;
    window.updateTotalQuestionsCount = updateTotalQuestionsCount;
    window.clearAllSubjects = clearAllSubjects;
    window.toggleAllSubjects = toggleAllSubjects;
    
    console.log('✅ fileUpload/subjects.js exportado');
}