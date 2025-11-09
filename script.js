document.addEventListener('DOMContentLoaded', () => {

    // Elementos do Jogo
    const gridContainer = document.getElementById('game-grid');
    const promptDisplay = document.getElementById('prompt-display');

    // Elementos do Placar
    const currentScoreEl = document.getElementById('current-score');
    const bestScoreEl = document.getElementById('best-score');
    
    let currentScore = 0;
    let bestScore = 0;

    // Elementos de Áudio
    const hoverSound = document.getElementById('hover-sound'); // Este é o "molde"
    const clickCorrectSound = document.getElementById('click-correct-sound');
    const clickIncorrectSound = document.getElementById('click-incorrect-sound');

    
    // === MUDANÇA IMPORTANTE AQUI ===
    // Agora, em vez de tocar o som original, tocamos um clone dele.
    // Isso permite que vários sons de hover se sobreponham.
    function playHoverSound() {
        const clone = hoverSound.cloneNode(true); // Clona o elemento de áudio
        clone.play().catch(e => console.log("Erro ao tocar hover sound:", e));
    }
    // ================================

    // As funções de clique permanecem as mesmas (reiniciar é bom para cliques)
    function playCorrectSound() {
        clickCorrectSound.currentTime = 0;
        clickCorrectSound.play().catch(e => console.log("Erro ao tocar correct sound:", e));
    }

    function playIncorrectSound() {
        clickIncorrectSound.currentTime = 0;
        clickIncorrectSound.play().catch(e => console.log("Erro ao tocar incorrect sound:", e));
    }

    let currentRow;
    let currentCol;
    let canClick = true; 

    const TOTAL_GAME_ROWS = 5; 
    const TOTAL_GAME_COLS = 6; 
    const ROW_1_COLS = 4;      
    const ROW_3_COLS = 12;     

    // --- 0. Função para Carregar o Recorde ---
    function loadBestScore() {
        bestScore = localStorage.getItem('estanteBestScore') || 0;
        bestScoreEl.textContent = bestScore;
    }

    // --- 1. Função para Criar o Grid (Ouvintes de 'mouseover') ---
    // (Esta função não muda, ela já chama playHoverSound da forma correta)
    function createGrid() {
        gridContainer.innerHTML = ''; 

        for (let r = TOTAL_GAME_ROWS; r >= 1; r--) { 
            const rowDiv = document.createElement('div');
            
            if (r === 1) { 
                rowDiv.classList.add('grid-row', 'grid-row-1'); 
                for (let c = 1; c <= ROW_1_COLS; c++) { 
                    const cell = document.createElement('div');
                    cell.classList.add('cell');
                    cell.dataset.row = r; 
                    cell.dataset.col = c; 
                    cell.addEventListener('mouseover', playHoverSound); 
                    rowDiv.appendChild(cell);
                }

            } else if (r === 3) { 
                rowDiv.classList.add('grid-row'); 
                for (let c = 1; c <= TOTAL_GAME_COLS; c++) { 
                    const cellWrapper = document.createElement('div');
                    cellWrapper.classList.add('cell-wrapper');
                    const topCell = document.createElement('div');
                    topCell.classList.add('sub-cell', 'sub-cell-top');
                    topCell.dataset.row = 3; 
                    topCell.dataset.col = (c - 1) * 2 + 1; 
                    topCell.addEventListener('mouseover', playHoverSound); 
                    const bottomCell = document.createElement('div');
                    bottomCell.classList.add('sub-cell', 'sub-cell-bottom');
                    bottomCell.dataset.row = 3; 
                    bottomCell.dataset.col = (c - 1) * 2 + 2; 
                    bottomCell.addEventListener('mouseover', playHoverSound); 

                    cellWrapper.appendChild(topCell);
                    cellWrapper.appendChild(bottomCell);
                    rowDiv.appendChild(cellWrapper);
                }

            } else { 
                rowDiv.classList.add('grid-row'); 
                for (let c = 1; c <= TOTAL_GAME_COLS; c++) { 
                    const cell = document.createElement('div');
                    cell.classList.add('cell');
                    cell.dataset.row = r; 
                    cell.dataset.col = c; 
                    cell.addEventListener('mouseover', playHoverSound); 
                    rowDiv.appendChild(cell);
                }
            }
            gridContainer.appendChild(rowDiv);
        }
        gridContainer.addEventListener('click', handleGridClick, true);
    }

    // --- 2. Função para Gerar um Novo Desafio ---
    function generateNewPrompt() {
        const randomRow = Math.floor(Math.random() * TOTAL_GAME_ROWS) + 1; 
        let randomCol;

        if (randomRow === 1) {
            randomCol = Math.floor(Math.random() * ROW_1_COLS) + 1;
        } else if (randomRow === 3) {
            randomCol = Math.floor(Math.random() * ROW_3_COLS) + 1;
        } else {
            randomCol = Math.floor(Math.random() * TOTAL_GAME_COLS) + 1;
        }

        currentRow = randomRow;
        currentCol = randomCol;

        promptDisplay.textContent = `${currentRow} - ${currentCol}`; 
        canClick = true; 
    }

    // --- 3. Função de Clique (Nenhuma mudança aqui) ---
    function handleGridClick(event) {
        if (!canClick) return;

        const clickedElement = event.target;

        if (clickedElement.classList.contains('cell') || clickedElement.classList.contains('sub-cell')) {
            const clickedRow = parseInt(clickedElement.dataset.row);
            const clickedCol = parseInt(clickedElement.dataset.col);

            canClick = false; 

            if (clickedRow === currentRow && clickedCol === currentCol) {
                // --- ACERTOU ---
                playCorrectSound(); 
                currentScore++; 
                currentScoreEl.textContent = currentScore;

                if (currentScore > bestScore) {
                    bestScore = currentScore;
                    bestScoreEl.textContent = bestScore;
                    localStorage.setItem('estanteBestScore', bestScore);
                }

                clickedElement.classList.add('correct');
                setTimeout(() => {
                    clickedElement.classList.remove('correct');
                    generateNewPrompt(); 
                }, 700); 

            } else {
                // --- ERROU ---
                playIncorrectSound(); 
                currentScore = 0; 
                currentScoreEl.textContent = currentScore;

                clickedElement.classList.add('incorrect');
                const correctCell = findCorrectCellElement(currentRow, currentCol);
                if (correctCell) {
                    correctCell.classList.add('correct');
                }
                setTimeout(() => {
                    clickedElement.classList.remove('incorrect');
                    if (correctCell) {
                        correctCell.classList.remove('correct');
                    }
                    canClick = true; 
                }, 1000); 
            }
        }
    }

    function findCorrectCellElement(row, col) {
        let selector = `[data-row="${row}"][data-col="${col}"]`;
        return gridContainer.querySelector(selector);
    }

    // --- Inicia o Jogo ---
    loadBestScore();  
    createGrid();     
    generateNewPrompt(); 
});