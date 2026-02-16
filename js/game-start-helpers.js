// js/main/game-start-helpers.js - FUNÇÕES AUXILIARES
console.log('🚀 game-start-helpers.js carregando...');

function applyRecurrence(questions, recurrence) {
    const multiplier = {baixa: 1, media: 2, alta: 3}[recurrence] || 3;
    const result = [];
    
    for (let i = 0; i < multiplier; i++) {
        questions.forEach(q => {
            const copy = {...q};
            copy.recurrenceCopy = i + 1;
            result.push(copy);
        });
    }
    
    console.log(`📊 Recorrência ${recurrence}: ${questions.length} → ${result.length} perguntas`);
    return result;
}

function countQuestionsWithoutRecurrence() {
    let totalQuestions = 0;
    if (window.subjects) {
        Object.values(window.subjects).forEach(subject => {
            if (subject.enabled) {
                totalQuestions += subject.questions.length;
            }
        });
    }
    return totalQuestions;
}

function updateTotalQuestionsCount() {
    let totalQuestions = countQuestionsWithoutRecurrence();
    const totalEl = document.getElementById('total-questions');
    if (totalEl) totalEl.textContent = totalQuestions;
    return totalQuestions;
}

window.applyRecurrence = applyRecurrence;
window.countQuestionsWithoutRecurrence = countQuestionsWithoutRecurrence;
window.updateTotalQuestionsCount = updateTotalQuestionsCount;

console.log('✅ game-start-helpers.js carregado');