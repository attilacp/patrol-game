// js/bombQuestion/selector.js (CORRIGIDO)
class BombQuestionSelector {
    constructor(bombSystem) {
        this.bombSystem = bombSystem;
        this.lastUsedQuestions = new Set();
        this.usedInSession = new Set();
        this.currentGameUsedQuestions = new Set();
    }

    activateBombQuestion() {
        if (window.winnerTeam) return false;
        
        const config = window.bombQuestionConfig?.getConfig() || {enabled: true, maxPairs: 3};
        if (!config.enabled || !Object.keys(this.bombSystem.bombQuestions).length) return false;
        
        const availableTables = this.getAvailableTables();
        
        if (!availableTables.length) {
            this.resetSessionUsed();
            return this.activateReusedTable();
        }
        
        const selectedTable = this.selectRandomTable(availableTables);
        return this.prepareAndActivateTable(selectedTable, config.maxPairs);
    }

    getAvailableTables() {
        const tables = [];
        Object.values(this.bombSystem.bombQuestions).forEach(subject => {
            subject.questions.forEach(table => {
                if (!this.usedInSession.has(table.id) && !this.currentGameUsedQuestions.has(table.id)) {
                    tables.push({
                        ...table,
                        subjectName: subject.name,
                        assunto: subject.assunto,
                        porcentagem: subject.porcentagem
                    });
                }
            });
        });
        return tables;
    }

    selectRandomTable(tables) {
        return tables[Math.floor(Math.random() * tables.length)];
    }

    prepareAndActivateTable(table, maxPairs) {
        console.log(`🎲 Tabela: ${table.sheetName} - ${table.items.length} pares`);
        
        const limitedTable = table.items.length > maxPairs ? 
            this.limitTableToRandomPairs(table, maxPairs) : table;
        
        this.markTableAsUsed(limitedTable.id);
        
        this.bombSystem.currentBombQuestion = {
            ...limitedTable,
            userAnswers: [],
            selectedAt: new Date().toISOString(),
            maxPairsApplied: maxPairs
        };
        
        this.bombSystem.isBombActive = true;
        
        // CORREÇÃO: Mudar de displayManager para uiManager
        if (this.bombSystem.uiManager && this.bombSystem.uiManager.displayBombQuestion) {
            this.bombSystem.uiManager.displayBombQuestion();
        } else {
            console.error('❌ uiManager não disponível para exibir PB');
            return false;
        }
        
        return true;
    }

    limitTableToRandomPairs(table, maxPairs) {
        const shuffled = [...table.items].sort(() => Math.random() - 0.5);
        const randomItems = shuffled.slice(0, maxPairs);
        
        return {
            ...table,
            items: randomItems,
            totalPairs: randomItems.length,
            selectedPairs: randomItems.length,
            id: `${table.id}_random_${Date.now()}`,
            isLimited: true
        };
    }

    activateReusedTable() {
        const config = window.bombQuestionConfig?.getConfig() || {maxPairs: 3};
        const allTables = this.getAllTables();
        
        if (!allTables.length) return false;
        
        const availableTables = allTables.filter(table => 
            !this.usedInSession.has(table.id) && !this.currentGameUsedQuestions.has(table.id)
        );
        
        const selectedTable = availableTables.length ? 
            this.selectRandomTable(availableTables) : 
            this.selectRandomTable(allTables);
        
        const finalTable = selectedTable.items.length > config.maxPairs ? 
            this.limitTableToRandomPairs(selectedTable, config.maxPairs) : selectedTable;
        
        this.markTableAsUsed(finalTable.id);
        
        this.bombSystem.currentBombQuestion = {
            ...finalTable,
            userAnswers: [],
            selectedAt: new Date().toISOString(),
            reused: availableTables.length === 0,
            maxPairsApplied: config.maxPairs
        };
        
        this.bombSystem.isBombActive = true;
        
        // CORREÇÃO: Mudar de displayManager para uiManager
        if (this.bombSystem.uiManager && this.bombSystem.uiManager.displayBombQuestion) {
            this.bombSystem.uiManager.displayBombQuestion();
        } else {
            console.error('❌ uiManager não disponível para exibir PB');
            return false;
        }
        
        return true;
    }

    getAllTables() {
        const tables = [];
        Object.values(this.bombSystem.bombQuestions).forEach(subject => {
            tables.push(...subject.questions);
        });
        return tables;
    }

    markTableAsUsed(tableId) {
        this.usedInSession.add(tableId);
        this.currentGameUsedQuestions.add(tableId);
        this.lastUsedQuestions.add(tableId);
        
        if (this.lastUsedQuestions.size > 5) {
            this.lastUsedQuestions.delete([...this.lastUsedQuestions][0]);
        }
    }

    resetSessionUsed() {
        this.usedInSession.clear();
    }

    resetUsedQuestions() {
        this.currentGameUsedQuestions.clear();
        this.lastUsedQuestions.clear();
        this.usedInSession.clear();
        return true;
    }

    getLoadStatus() {
        const totalTables = Object.values(this.bombSystem.bombQuestions)
            .reduce((sum, subject) => sum + subject.questions.length, 0);
        
        const config = window.bombQuestionConfig?.getConfig() || {maxPairs: 3};
        const allPairs = Object.values(this.bombSystem.bombQuestions)
            .flatMap(subject => subject.questions.map(table => table.items.length));
        const averagePairs = allPairs.length ? 
            Math.round(allPairs.reduce((a, b) => a + b) / allPairs.length) : 0;
        
        return {
            loaded: totalTables > 0,
            subjects: Object.keys(this.bombSystem.bombQuestions).length,
            totalTables,
            usedTables: this.usedInSession.size,
            availableTables: totalTables - this.usedInSession.size,
            totalPairs: allPairs.reduce((a, b) => a + b, 0),
            averagePairsPerTable: averagePairs,
            maxPairs: config.maxPairs,
            sessionUsed: this.usedInSession.size,
            gameUsed: this.currentGameUsedQuestions.size
        };
    }
}

if (typeof window !== 'undefined') window.BombQuestionSelector = BombQuestionSelector;