// js/game/notes.js - Sistema de Notas Expandido
console.log('📝 notes.js carregando...');

if (!window.NotesSystem) {
    window.NotesSystem = class {
        constructor() {
            this.fileName = 'patrol-notes.json';
            this.localKey = 'game-notes';
            this.autoSave = true;
            this.currentTab = 'assunto1';
            this.tabCounter = 1;
            this.init();
        }

        init() {
            this.setupEventListeners();
            this.createTabs();
            this.loadNotes();
        }

        setupEventListeners() {
            document.addEventListener('click', e => {
                const target = e.target;
                
                if (target.id === 'open-notes-btn' || target.id === 'open-notes-config') {
                    this.openNotes();
                } else if (target.classList.contains('close-modal')) {
                    this.closeNotes();
                } else if (target.id === 'save-notes') {
                    e.preventDefault();
                    this.saveNotes(true);
                } else if (target.id === 'export-notes') {
                    e.preventDefault();
                    this.exportNotes();
                } else if (target.id === 'import-notes') {
                    e.preventDefault();
                    document.getElementById('import-notes-file').click();
                } else if (target.id === 'clear-notes') {
                    e.preventDefault();
                    this.clearCurrentTab();
                } else if (target.classList.contains('add-tab-btn')) {
                    this.addNewTab();
                } else if (target.classList.contains('remove-tab')) {
                    e.stopPropagation();
                    this.removeTab(target.dataset.tab);
                } else if (target.classList.contains('rename-tab')) {
                    e.stopPropagation();
                    this.renameTab(target.dataset.tab);
                } else if (target.classList.contains('notes-tab') && !target.classList.contains('add-tab-btn')) {
                    this.switchTab(target.dataset.tab);
                } else if (target.classList.contains('tab-name')) {
                    const tab = target.closest('.notes-tab');
                    if (tab && !tab.classList.contains('add-tab-btn')) {
                        this.switchTab(tab.dataset.tab);
                    }
                }
            });

            const modal = document.getElementById('notes-modal');
            if (modal) {
                modal.addEventListener('click', e => {
                    if (e.target.id === 'notes-modal') {
                        this.closeNotes();
                    }
                });
            }

            const importFile = document.getElementById('import-notes-file');
            if (importFile) {
                importFile.addEventListener('change', e => this.importNotes(e));
            }

            document.addEventListener('input', e => {
                if (e.target.classList.contains('notes-textarea') && this.autoSave) {
                    this.saveNotes(false);
                }
            });
        }

        createTabs() {
            const tabsContainer = document.getElementById('notes-tabs');
            const contentContainer = document.getElementById('notes-content');
            
            if (!tabsContainer || !contentContainer) return;

            tabsContainer.innerHTML = '';
            contentContainer.innerHTML = '';

            ['assunto1', 'assunto2', 'assunto3'].forEach((id, i) => {
                this.createTabElement(id, `Assunto ${i + 1}`);
            });

            const addBtn = document.createElement('button');
            addBtn.className = 'notes-tab add-tab-btn';
            addBtn.innerHTML = '+';
            addBtn.title = 'Adicionar nova aba';
            tabsContainer.appendChild(addBtn);

            this.tabCounter = 4;
            this.switchTab('assunto1');
        }

        createTabElement(id, name) {
            const tabsContainer = document.getElementById('notes-tabs');
            const contentContainer = document.getElementById('notes-content');
            
            if (!tabsContainer || !contentContainer) return;

            const tab = document.createElement('button');
            tab.className = 'notes-tab';
            tab.dataset.tab = id;
            tab.innerHTML = `
                <span class="tab-name">${name}</span>
                <span class="rename-tab" data-tab="${id}" title="Renomear">✏️</span>
                <span class="remove-tab" data-tab="${id}" title="Remover">×</span>
            `;

            const addBtn = tabsContainer.querySelector('.add-tab-btn');
            if (addBtn) {
                tabsContainer.insertBefore(tab, addBtn);
            } else {
                tabsContainer.appendChild(tab);
            }

            const content = document.createElement('div');
            content.className = 'notes-tab-content';
            content.id = `tab-${id}`;
            content.innerHTML = `
                <textarea class="notes-textarea" 
                          placeholder="Digite sobre ${name}..." 
                          data-tab="${id}"></textarea>
            `;
            contentContainer.appendChild(content);
        }

        switchTab(tabId) {
            document.querySelectorAll('.notes-tab, .notes-tab-content').forEach(el => {
                el.classList.remove('active');
            });

            const tab = document.querySelector(`.notes-tab[data-tab="${tabId}"]`);
            const content = document.getElementById(`tab-${tabId}`);

            if (tab && content) {
                tab.classList.add('active');
                content.classList.add('active');
                this.currentTab = tabId;
                
                setTimeout(() => {
                    const textarea = content.querySelector('.notes-textarea');
                    if (textarea) textarea.focus();
                }, 50);
            }
        }

        addNewTab() {
            const tabId = `assunto${this.tabCounter}`;
            const tabName = `Assunto ${this.tabCounter}`;
            this.createTabElement(tabId, tabName);
            this.switchTab(tabId);
            this.tabCounter++;
        }

        removeTab(tabId) {
            const tabs = document.querySelectorAll('.notes-tab:not(.add-tab-btn)');
            if (tabs.length <= 1) {
                alert('❌ Mantenha pelo menos uma aba!');
                return;
            }

            const name = this.getTabName(tabId);
            if (!confirm(`⚠️ Remover "${name}"?`)) return;

            const tab = document.querySelector(`.notes-tab[data-tab="${tabId}"]`);
            const content = document.getElementById(`tab-${tabId}`);
            
            if (tab) tab.remove();
            if (content) content.remove();

            const firstTab = document.querySelector('.notes-tab:not(.add-tab-btn)');
            if (firstTab) {
                this.switchTab(firstTab.dataset.tab);
            }

            this.saveNotes(false);
        }

        renameTab(tabId) {
            const oldName = this.getTabName(tabId);
            const newName = prompt('Novo nome:', oldName);
            
            if (!newName || !newName.trim() || newName === oldName) return;

            const tabName = document.querySelector(`.notes-tab[data-tab="${tabId}"] .tab-name`);
            const placeholder = document.querySelector(`#tab-${tabId} .notes-textarea`);
            
            if (tabName) tabName.textContent = newName.trim();
            if (placeholder) placeholder.placeholder = `Digite sobre ${newName.trim()}...`;
            
            this.saveNotes(false);
            alert('✅ Nome atualizado!');
        }

        getTabName(tabId) {
            const tabName = document.querySelector(`.notes-tab[data-tab="${tabId}"] .tab-name`);
            return tabName?.textContent || `Assunto ${tabId.replace('assunto', '')}`;
        }

        openNotes() {
            const modal = document.getElementById('notes-modal');
            if (modal) {
                modal.style.display = 'block';
                setTimeout(() => this.switchTab(this.currentTab), 100);
            }
        }

        closeNotes() {
            this.saveNotes(false);
            const modal = document.getElementById('notes-modal');
            if (modal) modal.style.display = 'none';
        }

        loadNotes() {
            const saved = localStorage.getItem(this.localKey);
            if (!saved) return;

            try {
                const data = JSON.parse(saved);
                Object.keys(data).forEach(key => {
                    if (key.endsWith('_name')) {
                        const tabId = key.replace('_name', '');
                        const tabName = document.querySelector(`.notes-tab[data-tab="${tabId}"] .tab-name`);
                        if (tabName) tabName.textContent = data[key];
                    } else {
                        const textarea = document.querySelector(`#tab-${key} .notes-textarea`);
                        if (textarea) textarea.value = data[key];
                    }
                });
            } catch (e) {
                console.error('Erro ao carregar notas:', e);
            }
        }

        saveNotes(showAlert = false) {
            const data = {};

            document.querySelectorAll('.notes-textarea').forEach(textarea => {
                if (textarea.dataset.tab) {
                    data[textarea.dataset.tab] = textarea.value;
                }
            });

            document.querySelectorAll('.notes-tab:not(.add-tab-btn)').forEach(tab => {
                const tabId = tab.dataset.tab;
                const tabName = tab.querySelector('.tab-name');
                if (tabName) {
                    data[`${tabId}_name`] = tabName.textContent;
                }
            });

            localStorage.setItem(this.localKey, JSON.stringify(data));
            if (showAlert) alert('✅ Notas salvas!');
        }

        exportNotes() {
            const data = {};

            document.querySelectorAll('.notes-textarea').forEach(textarea => {
                if (textarea.dataset.tab) {
                    data[textarea.dataset.tab] = textarea.value;
                }
            });

            document.querySelectorAll('.notes-tab:not(.add-tab-btn)').forEach(tab => {
                const tabId = tab.dataset.tab;
                const tabName = tab.querySelector('.tab-name');
                if (tabName) {
                    data[`${tabId}_name`] = tabName.textContent;
                }
            });

            const hasContent = Object.values(data)
                .filter(v => typeof v === 'string' && !v.endsWith('_name'))
                .some(v => v.trim());

            if (!hasContent) {
                alert('❌ Nenhuma nota para exportar!');
                return;
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.fileName;
            a.click();
            URL.revokeObjectURL(url);
            alert('✅ Notas exportadas!');
        }

        importNotes(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    Object.keys(data).forEach(key => {
                        if (key.endsWith('_name')) {
                            const tabId = key.replace('_name', '');
                            const tabName = document.querySelector(`.notes-tab[data-tab="${tabId}"] .tab-name`);
                            if (tabName) tabName.textContent = data[key];
                        } else {
                            const textarea = document.querySelector(`#tab-${key} .notes-textarea`);
                            if (textarea) textarea.value = data[key];
                        }
                    });

                    this.saveNotes(false);
                    alert('✅ Notas importadas!');
                } catch (err) {
                    alert('❌ Arquivo inválido!');
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }

        clearCurrentTab() {
            const textarea = document.querySelector(`#tab-${this.currentTab} .notes-textarea`);
            if (!textarea) return;

            if (confirm('⚠️ Limpar notas desta aba?')) {
                textarea.value = '';
                this.saveNotes(false);
                alert('✅ Notas limpas!');
            }
        }
    };
}

// Inicializar sistema
if (!window.notesSystem && window.NotesSystem) {
    window.notesSystem = new window.NotesSystem();
}

if (!window.notesInitialized) {
    window.notesInitialized = true;
    
    window.initNotesSystem = () => {
        if (window.NotesSystem && !window.notesSystem) {
            window.notesSystem = new window.NotesSystem();
        }
    };

    window.openNotes = () => {
        if (window.notesSystem) {
            window.notesSystem.openNotes();
        }
    };

    document.addEventListener('DOMContentLoaded', window.initNotesSystem);
}

console.log('✅ notes.js carregado');
