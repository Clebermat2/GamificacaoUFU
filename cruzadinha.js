class CrosswordGame {
    constructor() {
        this.gridSize = 15;
        this.currentCell = null;
        this.currentWord = null;
        this.currentDirection = 'horizontal';
        this.completedWords = new Set();
        
        // Definição das palavras e suas posições (CORRIGIDO)
        this.words = {
            1: { // PLANEJAMENTO (horizontal)
                word: 'PLANEJAMENTO',
                startRow: 9, // Posição corrigida
                startCol: 3, // Posição corrigida
                direction: 'horizontal',
                clue: 'Uma das quatro funções básicas da administração (PODC) que é essencial para usar bem os recursos do PDDE e que não funciona sem relatórios de contabilidade.'
            },
            2: { // TRANSPARÊNCIA (horizontal)
                word: 'TRANSPARENCIA',
                startRow: 2, // Posição corrigida
                startCol: 0, // Posição corrigida
                direction: 'horizontal',
                clue: 'Um dever e compromisso na gestão pública que faz com que a comunidade escolar e a sociedade confiem no uso correto do dinheiro público.'
            },
            3: { // QUALIDADE (horizontal)
                word: 'QUALIDADE',
                startRow: 10, // Posição corrigida
                startCol: 0, // Posição corrigida
                direction: 'horizontal',
                clue: 'Um dos objetivos principais que a boa gestão dos recursos do PDDE busca alcançar para melhorar o ensino e o ambiente escolar.'
            },
            4: { // RECURSOS (vertical)
                word: 'RECURSOS',
                startRow: 2, // Posição corrigida
                startCol: 1, // Posição corrigida
                direction: 'vertical',
                clue: 'O que o PDDE fornece às escolas públicas para melhorar a estrutura, comprar materiais e desenvolver projetos. Isso permite que as escolas atendam suas necessidades rapidamente e de forma eficiente.'
            },
            5: { // PRIORIDADE (vertical)
                word: 'PRIORIDADE',
                startRow: 2, // Posição corrigida
                startCol: 5, // Posição corrigida
                direction: 'vertical',
                clue: 'O "Rol de ___________" é um documento obrigatório para gastar e prestar contas do PDDE. Ferramentas como a Matriz de Eisenhower ajudam o gestor a decidir quais tarefas devem ser feitas primeiro, como na organização do uso desses fundos.'
            }
        };
        
        this.grid = this.createEmptyGrid();
        this.setupWordPositions();
        this.init();
    }
    
    createEmptyGrid() {
        return Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
    }
    
    setupWordPositions() {
        // Marca as posições das palavras no grid
        Object.keys(this.words).forEach(wordId => {
            const wordData = this.words[wordId];
            const { word, startRow, startCol, direction } = wordData;
            
            for (let i = 0; i < word.length; i++) {
                const row = direction === 'horizontal' ? startRow : startRow + i;
                const col = direction === 'horizontal' ? startCol + i : startCol;
                
                if (row < this.gridSize && col < this.gridSize) {
                    if (!this.grid[row][col]) {
                        this.grid[row][col] = {
                            letter: word[i],
                            words: [wordId],
                            isStart: i === 0,
                            number: i === 0 ? wordId : null
                        };
                    } else {
                        // Célula compartilhada entre palavras
                        this.grid[row][col].words.push(wordId);
                    }
                }
            }
        });
    }
    
    init() {
        this.createGrid();
        this.setupEventListeners();
        this.setupAccessibilityControls();
        this.updateProgress();
    }
    
    createGrid() {
        const gridContainer = document.getElementById('crossword-grid');
        gridContainer.innerHTML = '';
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.grid[row][col]) {
                    const cellData = this.grid[row][col];
                    
                    // Adiciona número se for início de palavra
                    if (cellData.number) {
                        const numberSpan = document.createElement('span');
                        numberSpan.className = 'cell-number';
                        numberSpan.textContent = cellData.number;
                        cell.appendChild(numberSpan);
                    }
                    
                    // Adiciona input para a letra
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.setAttribute('aria-label', `Célula linha ${row + 1}, coluna ${col + 1}`);
                    
                    cell.appendChild(input);
                    cell.classList.add('active');
                } else {
                    cell.classList.add('blocked');
                }
                
                gridContainer.appendChild(cell);
            }
        }
    }
    
    setupEventListeners() {
        const grid = document.getElementById('crossword-grid');
        
        // Event delegation para inputs
        grid.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT') {
                this.handleInput(e);
            }
        });
        
        grid.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT') {
                this.handleCellClick(e);
            }
        });
        
        grid.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') {
                this.handleKeyDown(e);
            }
        });
        
        // Event listeners para as dicas
        document.querySelectorAll('.clue-item').forEach(item => {
            item.addEventListener('click', () => {
                this.highlightWord(item.dataset.word);
            });
        });
    }
    
    handleInput(e) {
        const input = e.target;
        const cell = input.parentElement;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Converte para maiúscula
        input.value = input.value.toUpperCase();
        
        // Verifica se a letra está correta
        const cellData = this.grid[row][col];
        if (cellData && input.value === cellData.letter) {
            cell.classList.add('filled');
            this.checkWordCompletion(cellData.words);
        } else {
            cell.classList.remove('filled');
        }
        
        // Move para a próxima célula
        if (input.value) {
            this.moveToNextCell(row, col);
        }
        
        this.updateProgress();
    }
    
    handleCellClick(e) {
        const input = e.target;
        const cell = input.parentElement;
        this.setCurrentCell(cell);
    }
    
    handleKeyDown(e) {
        const input = e.target;
        const cell = input.parentElement;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.moveTo(row - 1, col);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.moveTo(row + 1, col);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.moveTo(row, col - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.moveTo(row, col + 1);
                break;
            case 'Backspace':
                if (!input.value) {
                    this.moveToPreviousCell(row, col);
                }
                break;
        }
    }
    
    setCurrentCell(cell) {
        // Remove destaque anterior
        document.querySelectorAll('.cell.current').forEach(c => {
            c.classList.remove('current');
        });
        
        cell.classList.add('current');
        this.currentCell = cell;
        
        const input = cell.querySelector('input');
        if (input) {
            input.focus();
        }
    }
    
    moveTo(row, col) {
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell && cell.classList.contains('active')) {
                this.setCurrentCell(cell);
            }
        }
    }
    
    moveToNextCell(row, col) {
        // Lógica para mover para a próxima célula baseada na direção atual
        if (this.currentDirection === 'horizontal') {
            this.moveTo(row, col + 1);
        } else {
            this.moveTo(row + 1, col);
        }
    }
    
    moveToPreviousCell(row, col) {
        // Lógica para mover para a célula anterior
        if (this.currentDirection === 'horizontal') {
            this.moveTo(row, col - 1);
        } else {
            this.moveTo(row - 1, col);
        }
    }
    
    highlightWord(wordId) {
        // Remove destaques anteriores
        document.querySelectorAll('.clue-item.active').forEach(item => {
            item.classList.remove('active');
        });
        
        // Destaca a dica atual
        document.querySelector(`[data-word="${wordId}"]`).classList.add('active');
        
        // Destaca as células da palavra
        const wordData = this.words[wordId];
        const { startRow, startCol, direction, word } = wordData;
        
        for (let i = 0; i < word.length; i++) {
            const row = direction === 'horizontal' ? startRow : startRow + i;
            const col = direction === 'horizontal' ? startCol + i : startCol;
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            
            if (cell) {
                cell.classList.add('highlighted');
            }
        }
        
        // Remove destaque após 3 segundos
        setTimeout(() => {
            document.querySelectorAll('.cell.highlighted').forEach(cell => {
                cell.classList.remove('highlighted');
            });
        }, 3000);
        
        // Foca na primeira célula da palavra
        this.moveTo(startRow, startCol);
        this.currentDirection = direction;
    }
    
    checkWordCompletion(wordIds) {
        wordIds.forEach(wordId => {
            if (this.completedWords.has(wordId)) return;
            
            const wordData = this.words[wordId];
            const { word, startRow, startCol, direction } = wordData;
            let isComplete = true;
            
            for (let i = 0; i < word.length; i++) {
                const row = direction === 'horizontal' ? startRow : startRow + i;
                const col = direction === 'horizontal' ? startCol + i : startCol;
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const input = cell?.querySelector('input');
                
                if (!input || input.value !== word[i]) {
                    isComplete = false;
                    break;
                }
            }
            
            if (isComplete) {
                this.markWordAsCompleted(wordId);
            }
        });
    }
    
    markWordAsCompleted(wordId) {
        this.completedWords.add(wordId);
        
        const wordData = this.words[wordId];
        const { word, startRow, startCol, direction } = wordData;
        
        // Marca as células como completadas
        for (let i = 0; i < word.length; i++) {
            const row = direction === 'horizontal' ? startRow : startRow + i;
            const col = direction === 'horizontal' ? startCol + i : startCol;
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            
            if (cell) {
                cell.classList.add('completed');
                const input = cell.querySelector('input');
                if (input) {
                    input.disabled = true;
                }
            }
        }
        
        // Marca a dica como completada
        const clueItem = document.querySelector(`[data-word="${wordId}"]`);
        if (clueItem) {
            clueItem.classList.add('completed');
        }
        
        // Animação de conclusão
        this.animateWordCompletion(wordId);
        
        // Verifica se o jogo foi completado
        if (this.completedWords.size === Object.keys(this.words).length) {
            this.gameCompleted();
        }
    }
    
    animateWordCompletion(wordId) {
        const wordData = this.words[wordId];
        const { word, startRow, startCol, direction } = wordData;
        
        for (let i = 0; i < word.length; i++) {
            const row = direction === 'horizontal' ? startRow : startRow + i;
            const col = direction === 'horizontal' ? startCol + i : startCol;
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            
            if (cell) {
                setTimeout(() => {
                    cell.classList.add('word-completed');
                    setTimeout(() => {
                        cell.classList.remove('word-completed');
                    }, 500);
                }, i * 100);
            }
        }
    }
    
    updateProgress() {
        const totalCells = Object.values(this.words).reduce((sum, word) => sum + word.word.length, 0);
        const filledCells = document.querySelectorAll('.cell.filled').length;
        const progress = (filledCells / totalCells) * 100;
        
        document.getElementById('progress-fill').style.width = `${progress}%`;
        
        if (this.completedWords.size === Object.keys(this.words).length) {
            document.getElementById('status-text').textContent = 'Parabéns! Você completou a cruzadinha!';
        } else {
            document.getElementById('status-text').textContent = 
                `Progresso: ${this.completedWords.size}/${Object.keys(this.words).length} palavras completadas`;
        }
    }
    
    gameCompleted() {
        setTimeout(() => {
            alert('Parabéns! Você completou a cruzadinha sobre gestão escolar e PDDE!');
        }, 1000);
    }
    
    setupAccessibilityControls() {
        // Controle de fonte
        document.getElementById('increase-font').addEventListener('click', () => {
            this.adjustFontSize(2);
        });
        
        document.getElementById('decrease-font').addEventListener('click', () => {
            this.adjustFontSize(-2);
        });
        
        // Controle de tamanho da grade
        document.getElementById('increase-grid').addEventListener('click', () => {
            this.adjustGridSize(5);
        });
        
        document.getElementById('decrease-grid').addEventListener('click', () => {
            this.adjustGridSize(-5);
        });
        
        // Controle de contraste
        document.getElementById('toggle-contrast').addEventListener('click', () => {
            this.toggleHighContrast();
        });
    }
    
    adjustFontSize(change) {
        const root = document.documentElement;
        const currentSize = parseInt(getComputedStyle(root).getPropertyValue('--font-size-base'));
        const newSize = Math.max(12, Math.min(24, currentSize + change));
        
        root.style.setProperty('--font-size-base', `${newSize}px`);
        root.style.setProperty('--font-size-grid', `${newSize + 2}px`);
    }
    
    adjustGridSize(change) {
        const root = document.documentElement;
        const currentSize = parseInt(getComputedStyle(root).getPropertyValue('--cell-size'));
        const newSize = Math.max(25, Math.min(60, currentSize + change));
        
        root.style.setProperty('--cell-size', `${newSize}px`);
    }
    
    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
    }
}

// Inicializa o jogo quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    new CrosswordGame();
});

// Adiciona suporte para navegação por teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        // Permite navegação normal por Tab
        return;
    }
    
    // Atalhos de teclado para acessibilidade
    if (e.ctrlKey) {
        switch (e.key) {
            case '+':
            case '=':
                e.preventDefault();
                document.getElementById('increase-font').click();
                break;
            case '-':
                e.preventDefault();
                document.getElementById('decrease-font').click();
                break;
            case 'h':
                e.preventDefault();
                document.getElementById('toggle-contrast').click();
                break;
        }
    }
});
