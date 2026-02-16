function showPodium() {
    // SALVAR PERFORMANCE ANTES DE MOSTRAR O PÓDIO
    if (typeof window.savePerformanceToStorage === 'function') {
        var saved = window.savePerformanceToStorage();
        console.log('Performance salva antes do pódio:', saved ? '✅' : '❌');
    }
    
    const sortedTeams = [...window.teams].sort((a, b) => b.score - a.score);
    const top3 = sortedTeams.slice(0, 3);
    
    const podiumContainer = document.getElementById('podium-container');
    podiumContainer.innerHTML = '';
    
    top3.forEach((team, index) => {
        const podiumPlace = document.createElement('div');
        let podiumClass = 'podium-place ';
        if (index === 0) podiumClass += 'podium-1st';
        else if (index === 1) podiumClass += 'podium-2nd';
        else podiumClass += 'podium-3rd';
        podiumPlace.className = podiumClass;
        
        const badge = document.createElement('div');
        badge.className = 'podium-badge';
        badge.textContent = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
        
        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'podium-avatar';
        
        const simpleAvatar = document.createElement('div');
        simpleAvatar.className = 'simple-team-avatar';
        simpleAvatar.style.width = '120px';
        simpleAvatar.style.height = '120px';
        simpleAvatar.style.borderRadius = '50%';
        simpleAvatar.style.backgroundColor = index === 0 ? '#FFD700' : 
                                          index === 1 ? '#C0C0C0' : '#CD7F32';
        simpleAvatar.style.display = 'flex';
        simpleAvatar.style.alignItems = 'center';
        simpleAvatar.style.justifyContent = 'center';
        simpleAvatar.style.fontSize = '3.5em';
        simpleAvatar.style.fontWeight = 'bold';
        simpleAvatar.style.color = '#003366';
        simpleAvatar.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        simpleAvatar.style.border = '4px solid #003366';
        simpleAvatar.textContent = team.name.charAt(0).toUpperCase();
        
        avatarContainer.appendChild(simpleAvatar);
        
        const name = document.createElement('div');
        name.className = 'podium-name';
        name.textContent = team.name;
        
        const score = document.createElement('div');
        score.className = 'podium-score';
        score.textContent = 'Pontuação: ' + team.score;
        
        const players = document.createElement('div');
        players.className = 'podium-players';
        players.textContent = team.players.join(', ') || 'Sem jogadores registrados';
        
        podiumPlace.appendChild(badge);
        podiumPlace.appendChild(avatarContainer);
        podiumPlace.appendChild(name);
        podiumPlace.appendChild(score);
        podiumPlace.appendChild(players);
        
        podiumContainer.appendChild(podiumPlace);
    });
    
    // CORREÇÃO: Remover botões existentes antes de criar novos
    const existingButtonContainer = document.querySelector('.podium-buttons-container');
    if (existingButtonContainer) {
        existingButtonContainer.remove();
    }
    
    // Criar container de botões (SEM BOTÃO DE RANKING)
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'podium-buttons-container';
    buttonContainer.style.marginTop = '30px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.gap = '20px';
    buttonContainer.style.alignItems = 'center';
    buttonContainer.style.maxWidth = '400px';
    buttonContainer.style.margin = '0 auto';
    
    // CONTAINER DE CHECKBOXES (Primeira Linha)
    const checkboxesContainer = document.createElement('div');
    checkboxesContainer.className = 'podium-checkboxes-container';
    checkboxesContainer.style.display = 'flex';
    checkboxesContainer.style.gap = '15px';
    checkboxesContainer.style.marginBottom = '15px';
    checkboxesContainer.style.justifyContent = 'center';
    checkboxesContainer.style.alignItems = 'center';
    
    // Primeiro Checkbox: Exportar Performance
    const perfCheckboxContainer = document.createElement('div');
    perfCheckboxContainer.style.display = 'flex';
    perfCheckboxContainer.style.alignItems = 'center';
    perfCheckboxContainer.style.gap = '8px';
    
    const perfCheckbox = document.createElement('input');
    perfCheckbox.type = 'checkbox';
    perfCheckbox.id = 'podium-export-perf';
    perfCheckbox.checked = true;
    perfCheckbox.style.width = '18px';
    perfCheckbox.style.height = '18px';
    perfCheckbox.style.cursor = 'pointer';
    
    const perfLabel = document.createElement('label');
    perfLabel.htmlFor = 'podium-export-perf';
    perfLabel.textContent = 'Exportar Performance';
    perfLabel.style.color = '#003366';
    perfLabel.style.fontWeight = 'bold';
    perfLabel.style.cursor = 'pointer';
    
    perfCheckboxContainer.appendChild(perfCheckbox);
    perfCheckboxContainer.appendChild(perfLabel);
    
    // Segundo Checkbox: Exportar Notas
    const notesCheckboxContainer = document.createElement('div');
    notesCheckboxContainer.style.display = 'flex';
    notesCheckboxContainer.style.alignItems = 'center';
    notesCheckboxContainer.style.gap = '8px';
    
    const notesCheckbox = document.createElement('input');
    notesCheckbox.type = 'checkbox';
    notesCheckbox.id = 'podium-export-notes';
    notesCheckbox.checked = true;
    notesCheckbox.style.width = '18px';
    notesCheckbox.style.height = '18px';
    notesCheckbox.style.cursor = 'pointer';
    
    const notesLabel = document.createElement('label');
    notesLabel.htmlFor = 'podium-export-notes';
    notesLabel.textContent = 'Exportar Notas';
    notesLabel.style.color = '#003366';
    notesLabel.style.fontWeight = 'bold';
    notesLabel.style.cursor = 'pointer';
    
    notesCheckboxContainer.appendChild(notesCheckbox);
    notesCheckboxContainer.appendChild(notesLabel);
    
    // Botão Exportar Selecionados
    const exportSelectedBtn = document.createElement('button');
    exportSelectedBtn.className = 'podium-export-btn';
    exportSelectedBtn.innerHTML = '📥 Exportar Selecionados';
    exportSelectedBtn.style.cssText = `
        background: linear-gradient(145deg, #28a745, #218838) !important;
        border-color: #1e7e34 !important;
        color: #FFF !important;
        padding: 16px 32px !important;
        font-size: 16px !important;
        font-weight: 700 !important;
        margin: 5px !important;
        display: inline-block !important;
        text-align: center !important;
        min-width: 250px;
    `;
    exportSelectedBtn.onclick = function() {
        console.log('📥 Botão Exportar Selecionados clicado no pódio');
        
        let exportedSomething = false;
        
        // Exportar Performance se marcado
        if (perfCheckbox.checked && typeof exportPerformanceToExcel === 'function') {
            const success = exportPerformanceToExcel();
            if (success) {
                console.log('✅ Performance exportada com sucesso!');
                exportedSomething = true;
            }
        }
        
        // Exportar Notas se marcado
        if (notesCheckbox.checked && window.notesSystem && 
            typeof window.notesSystem.exportAllNotes === 'function') {
            window.notesSystem.exportAllNotes();
            console.log('✅ Notas exportadas com sucesso!');
            exportedSomething = true;
        }
        
        if (!exportedSomething) {
            alert('❌ Selecione pelo menos uma opção para exportar!');
        }
    };
    
    checkboxesContainer.appendChild(perfCheckboxContainer);
    checkboxesContainer.appendChild(notesCheckboxContainer);
    
    // Adicionar checkboxes ao container
    buttonContainer.appendChild(checkboxesContainer);
    buttonContainer.appendChild(exportSelectedBtn);
    
    // Botão Configurações (Abaixo)
    const configButton = document.createElement('button');
    configButton.className = 'podium-config-btn';
    configButton.innerHTML = '⚙️ Configurações';
    configButton.onclick = function() {
        document.getElementById('podium-screen').classList.remove('active');
        document.getElementById('config-screen').classList.add('active');
    };
    
    buttonContainer.appendChild(configButton);
    
    // Adicionar container ao podium-screen
    const podiumScreen = document.querySelector('.podium-screen');
    podiumScreen.appendChild(buttonContainer);
    
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('podium-screen').classList.add('active');
}