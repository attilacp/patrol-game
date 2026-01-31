// file name: utils.js
function shuffleArray(a){if(!a||!Array.isArray(a))return a;for(let e=a.length-1;e>0;e--){const r=Math.floor(Math.random()*(e+1));[a[e],a[r]]=[a[r],a[e]]}return a}

function checkStartGame(){
    const teamInputs=document.querySelectorAll(".team-input");
    let hasValidTeams=false;
    teamInputs.forEach(input=>{
        const nameInput=input.querySelector('input[type="text"]');
        if(nameInput?.value.trim())hasValidTeams=true;
    });
    
    let hasValidQuestions=false,totalQuestions=0;
    if(window.subjects){
        Object.values(window.subjects).forEach(subject=>{
            if(subject.enabled&&subject.questions.length>0){
                hasValidQuestions=true;
                totalQuestions+=subject.questions.length;
            }
        });
    }
    
    const teamError=document.getElementById("team-error");
    const fileError=document.getElementById("file-error");
    const startBtn=document.getElementById("start-game-btn");
    
    if(teamError)teamError.style.display=hasValidTeams?"none":"block";
    if(fileError)fileError.style.display=hasValidQuestions?"none":"block";
    if(startBtn)startBtn.disabled=!(hasValidTeams&&hasValidQuestions);
    
    const totalQuestionsEl=document.getElementById("total-questions");
    if(totalQuestionsEl)totalQuestionsEl.textContent=totalQuestions;
}

function resetPendingBombButton() {
    const nextBtn = document.getElementById('next-question-btn');
    if (nextBtn) {
        // Se o botão está mostrando PB, resetar para normal
        if (nextBtn.textContent.includes('💣') || nextBtn.textContent.includes('BOMBA')) {
            nextBtn.textContent = '⏭️ PRÓXIMA';
            const newNextBtn = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
            
            document.getElementById('next-question-btn').onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão Próxima clicado (resetado de PB)');
                window.nextQuestion?.();
            };
            console.log('✅ Botão de PB pendente resetado');
        }
    }
}

function initializeQuestionText(){
    const a=document.getElementById("question-text");
    a&&(a.textContent="Aguardando carregamento das perguntas...");
}

function getRandomTeamColor(a){
    return window.teamColorSchemes[a%window.teamColorSchemes.length];
}

function clearAllSubjects(){
    window.subjects={};
    updateSubjectsList&&updateSubjectsList();
    updateTotalQuestionsCount&&updateTotalQuestionsCount();
    checkStartGame&&checkStartGame();
}

function toggleAllSubjects(a){
    window.subjects&&Object.values(window.subjects).forEach(e=>{e.enabled=a});
    updateSubjectsList&&updateSubjectsList();
    updateTotalQuestionsCount&&updateTotalQuestionsCount();
    checkStartGame&&checkStartGame();
}

function padZero(a,e=2){
    let r=a+"";
    for(;r.length<e;)r="0"+r;
    return r;
}

function capitalize(a){
    return a.charAt(0).toUpperCase()+a.slice(1).toLowerCase();
}

function isValidEmail(a){
    return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a);
}

function debounce(a,e){
    let r;
    return(...t)=>{
        clearTimeout(r);
        r=setTimeout(()=>a(...t),e);
    };
}

function deepClone(a){
    return JSON.parse(JSON.stringify(a));
}

function calculatePercentage(a,e){
    return 0===e?0:Math.round(a/e*100);
}

function generateId(){
    return Date.now().toString(36)+Math.random().toString(36).substr(2);
}

window.shuffleArray=shuffleArray;
window.checkStartGame=checkStartGame;
window.resetPendingBombButton=resetPendingBombButton;
window.initializeQuestionText=initializeQuestionText;
window.getRandomTeamColor=getRandomTeamColor;
window.clearAllSubjects=clearAllSubjects;
window.toggleAllSubjects=toggleAllSubjects;
window.padZero=padZero;
window.capitalize=capitalize;
window.isValidEmail=isValidEmail;
window.debounce=debounce;
window.deepClone=deepClone;
window.calculatePercentage=calculatePercentage;
window.generateId=generateId;

document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(initializeQuestionText,500);
});