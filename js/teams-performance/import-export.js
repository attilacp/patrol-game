// file name: js/teams-performance/import-export.js
// Sistema de importação, exportação e notificação

// FUNÇÃO PARA EXPORTAR PERFORMANCE PARA EXCEL/CSV
function exportPerformanceToExcel() {
    try {
        if (!window.teams || !Array.isArray(window.teams)) {
            alert('Nenhuma equipe com performance para exportar');
            return false;
        }
        
        // USAR @ COMO DELIMITADOR
        var delimiter = '@';
        var csvContent = 'Equipe@Assunto@Total Questões@Acertos@Erros@Performance(%)\n';
        
        window.teams.forEach(function(team) {
            if (team && team.performanceBySubject) {
                Object.entries(team.performanceBySubject).forEach(function([subjectKey, data]) {
                    if (data && data.totalQuestions > 0) {
                        csvContent += team.name + delimiter +
                                     (data.displayName || subjectKey) + delimiter +
                                     data.totalQuestions + delimiter +
                                     data.totalCorrect + delimiter +
                                     (data.totalQuestions - data.totalCorrect) + delimiter +
                                     data.averagePerformance + '%\n';
                    }
                });
            }
        });
        
        // Criar arquivo CSV com delimitador @
        var blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'performance_patrol_' + new Date().toISOString().split('T')[0] + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('Performance exportada para CSV com delimitador @');
        return true;
    } catch (error) {
        console.error('Erro ao exportar performance:', error);
        alert('Erro ao exportar performance: ' + error.message);
        return false;
    }
}

// FUNÇÃO PARA IMPORTAR PERFORMANCE DE ARQUIVO
function importPerformanceFromFile(file) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var csvContent = e.target.result;
                var lines = csvContent.split('\n');
                var importedData = {
                    timestamp: new Date().toISOString(),
                    version: '2.0',
                    teams: {}
                };
                
                // Pular cabeçalho
                for (var i = 1; i < lines.length; i++) {
                    var line = lines[i].trim();
                    if (!line) continue;
                    
                    // USAR @ COMO DELIMITADOR
                    var parts = line.split('@');
                    if (parts.length >= 6) {
                        var teamName = parts[0];
                        var subject = parts[1];
                        var totalQuestions = parseInt(parts[2]) || 0;
                        var correct = parseInt(parts[3]) || 0;
                        var wrong = parseInt(parts[4]) || 0;
                        var performance = parseInt(parts[5]) || 0;
                        
                        if (!importedData.teams[teamName]) {
                            importedData.teams[teamName] = {
                                name: teamName,
                                performanceBySubject: {},
                                questionsBySubject: {}
                            };
                        }
                        
                        importedData.teams[teamName].performanceBySubject[subject] = {
                            displayName: subject,
                            totalQuestions: totalQuestions,
                            totalCorrect: correct,
                            averagePerformance: performance
                        };
                    }
                }
                
                localStorage.setItem(TEAM_PERFORMANCE_KEY, JSON.stringify(importedData));
                console.log('Performance importada de arquivo CSV com delimitador @');
                
                // Recarregar performance para as equipes atuais
                if (typeof loadSavedPerformance === 'function') {
                    loadSavedPerformance();
                }
                
                resolve(importedData);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = function() {
            reject(new Error('Erro ao ler arquivo'));
        };
        reader.readAsText(file);
    });
}

// MOSTRAR NOTIFICAÇÃO PARA SALVAR PERFORMANCE
function showSavePerformanceNotification() {
    console.log('Mostrando notificação para salvar performance...');
    
    // Criar overlay
    var overlay = document.createElement('div');
    overlay.id = 'performance-save-notification';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    // Criar conteúdo da notificação
    var notification = document.createElement('div');
    notification.style.cssText = `
        background: linear-gradient(145deg, #ffffff, #f8f9fa);
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        border: 3px solid #003366;
        max-width: 500px;
        text-align: center;
        animation: slideIn 0.5s ease;
    `;
    
    notification.innerHTML = `
        <h3 style="color: #003366; margin-bottom: 15px; font-size: 1.5em;">💾 SALVAR PERFORMANCE</h3>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.5;">
            Os dados de performance desta partida foram registrados apenas no navegador.<br>
            <strong>Recomendamos exportar o arquivo de performance</strong> para não perder os dados.
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 15px;">
            <button id="export-performance-btn" style="
                background: linear-gradient(145deg, #28a745, #218838);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                font-size: 1em;
                border: 2px solid #1e7e34;
            ">
                📥 Exportar Agora
            </button>
            <button id="skip-export-btn" style="
                background: linear-gradient(145deg, #6c757d, #5a6268);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                font-size: 1em;
                border: 2px solid #545b62;
            ">
                Pular
            </button>
        </div>
        <p style="color: #999; font-size: 0.9em; margin-top: 15px;">
            Os dados ficarão salvos neste navegador até limpar o cache.
        </p>
    `;
    
    overlay.appendChild(notification);
    document.body.appendChild(overlay);
    
    // Adicionar event listeners - CORREÇÃO: Usar onclick diretamente
    setTimeout(function() {
        var exportBtn = document.getElementById('export-performance-btn');
        var skipBtn = document.getElementById('skip-export-btn');
        
        if (exportBtn) {
            exportBtn.onclick = function() {
                console.log('📥 Botão Exportar clicado na notificação');
                if (typeof exportPerformanceToExcel === 'function') {
                    var success = exportPerformanceToExcel();
                    if (success) {
                        // Remover overlay após exportar
                        var overlayToRemove = document.getElementById('performance-save-notification');
                        if (overlayToRemove) {
                            overlayToRemove.remove();
                        }
                        console.log('✅ Performance exportada da notificação');
                    } else {
                        console.log('❌ Falha ao exportar performance');
                    }
                } else {
                    console.error('❌ Função exportPerformanceToExcel não disponível');
                }
            };
        }
        
        if (skipBtn) {
            skipBtn.onclick = function() {
                console.log('⏭️ Botão Pular clicado na notificação');
                var overlayToRemove = document.getElementById('performance-save-notification');
                if (overlayToRemove) {
                    overlayToRemove.remove();
                }
                console.log('✅ Notificação fechada');
            };
        }
        
        console.log('✅ Event listeners dos botões da notificação configurados');
    }, 100);
}

// TRIGGER PARA IMPORTAR PERFORMANCE
function triggerPerformanceImport() {
    var importInput = document.getElementById('import-performance-file');
    if (importInput) {
        importInput.click();
    } else {
        console.error('Elemento de importação não encontrado');
    }
}

// NOTIFICAR SALVAMENTO NO PÓDIO
function notifyPerformanceSaveOnPodium() {
    console.log('Verificando se precisa mostrar notificação de performance no pódio...');
    
    // Verificar se há dados de performance para salvar
    var hasPerformanceData = false;
    if (window.teams && Array.isArray(window.teams)) {
        window.teams.forEach(function(team) {
            if (team && team.performanceBySubject && Object.keys(team.performanceBySubject).length > 0) {
                hasPerformanceData = true;
            }
        });
    }
    
    if (hasPerformanceData) {
        // Mostrar notificação após um breve delay para não atrapalhar o pódio
        setTimeout(function() {
            showSavePerformanceNotification();
        }, 2000); // 2 segundos após mostrar o pódio
    } else {
        console.log('Nenhum dado de performance para salvar, notificação não necessária');
    }
}

// Exportar funções de importação/exportação
window.exportPerformanceToExcel = exportPerformanceToExcel;
window.importPerformanceFromFile = importPerformanceFromFile;
window.showSavePerformanceNotification = showSavePerformanceNotification;
window.triggerPerformanceImport = triggerPerformanceImport;
window.notifyPerformanceSaveOnPodium = notifyPerformanceSaveOnPodium;