/**
 * Улучшенные стили для блоков кода и кнопки копирования
 */

// Добавляем новые стили для блоков кода и кнопки копирования
const style = document.createElement('style');
style.textContent = `
    /* Улучшенные стили для блоков кода */
    .code-block {
        position: relative;
        margin: 1.5rem 0;
        background-color: var(--code-bg);
        border-radius: var(--border-radius);
        overflow: hidden;
    }

    .code-block pre {
        padding: 1.5rem;
        padding-top: 2.5rem;
        margin: 0;
        overflow-x: auto;
        font-family: Consolas, Monaco, 'Andale Mono', monospace;
        font-size: 0.9rem;
        line-height: 1.5;
        background-color: rgba(0, 0, 0, 0.02);
        border: 1px solid var(--border-color);
    }

    /* Панель управления для блока кода */
    .code-header {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 1rem;
        background-color: rgba(0, 0, 0, 0.05);
        border-bottom: 1px solid var(--border-color);
        font-size: 0.8rem;
        color: var(--text-light);
    }

    .code-language {
        font-weight: 600;
        text-transform: uppercase;
    }

    .copy-button {
        background: none;
        border: none;
        color: var(--secondary-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.85rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        transition: var(--transition);
    }

    .copy-button:hover {
        background-color: rgba(52, 152, 219, 0.1);
    }

    .copy-button i {
        font-size: 1rem;
    }

    /* Стили для практического задания */
    .practice-section {
        background-color: rgba(46, 204, 113, 0.1);
        border-left: 4px solid var(--success-color);
        padding: 1.5rem;
        margin: 2rem 0;
        border-radius: var(--border-radius);
    }

    .practice-section h2 {
        color: var(--success-color);
        margin-top: 0;
    }

    /* Улучшение фиксированного меню */
    header {
        position: fixed;
        width: 100%;
        z-index: 1000;
    }

    body {
        padding-top: var(--header-height);
    }

    /* Иконки для кнопок в меню */
    .theme-icon, .menu-icon {
        font-size: 1.2rem;
        display: inline-block;
    }
`;
document.head.appendChild(style);

// Функция для обновления блоков кода
function enhanceCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.code-block');
    
    codeBlocks.forEach((block, index) => {
        const pre = block.querySelector('pre');
        if (!pre) return;
        
        // Создаем хедер для блока кода
        const codeHeader = document.createElement('div');
        codeHeader.className = 'code-header';
        
        // Определяем язык кода (можно расширить для определения синтаксиса)
        const language = 'cmd';
        const langSpan = document.createElement('span');
        langSpan.className = 'code-language';
        langSpan.textContent = language;
        
        // Создаем кнопку копирования
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '<i>📋</i> Копировать';
        copyButton.setAttribute('aria-label', 'Копировать код');
        copyButton.setAttribute('data-code-index', index);
        
        // Добавляем события для кнопки копирования
        copyButton.addEventListener('click', () => {
            const code = pre.textContent;
            navigator.clipboard.writeText(code).then(() => {
                copyButton.innerHTML = '<i>✓</i> Скопировано!';
                setTimeout(() => {
                    copyButton.innerHTML = '<i>📋</i> Копировать';
                }, 2000);
            }).catch(err => {
                console.error('Ошибка при копировании: ', err);
                copyButton.innerHTML = '<i>❌</i> Ошибка';
                setTimeout(() => {
                    copyButton.innerHTML = '<i>📋</i> Копировать';
                }, 2000);
            });
        });
        
        // Собираем хедер
        codeHeader.appendChild(langSpan);
        codeHeader.appendChild(copyButton);
        
        // Добавляем хедер в блок кода
        if (block.firstChild) {
            block.insertBefore(codeHeader, block.firstChild);
        } else {
            block.appendChild(codeHeader);
        }
    });
}

// Обновляем стиль практического задания
function enhancePracticeSection() {
    const practiceSection = document.getElementById('practice');
    if (practiceSection) {
        practiceSection.classList.add('practice-section');
    }
}

// Исправляем меню
function fixHeaderButtons() {
    const themeToggle = document.getElementById('theme-toggle');
    const menuToggle = document.getElementById('menu-toggle');
    
    if (themeToggle) {
        themeToggle.innerHTML = '<span class="theme-icon">🌙</span>';
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            themeToggle.innerHTML = document.body.classList.contains('dark-theme') 
                ? '<span class="theme-icon">☀️</span>' 
                : '<span class="theme-icon">🌙</span>';
        });
    }
    
    if (menuToggle) {
        menuToggle.innerHTML = '<span class="menu-icon">☰</span>';
        menuToggle.addEventListener('click', () => {
            const nav = document.querySelector('nav');
            if (nav) {
                nav.classList.toggle('active');
                menuToggle.innerHTML = nav.classList.contains('active') 
                    ? '<span class="menu-icon">✕</span>' 
                    : '<span class="menu-icon">☰</span>';
            }
        });
    }
}

// Запускаем все улучшения при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    enhanceCodeBlocks();
    enhancePracticeSection();
    fixHeaderButtons();
});