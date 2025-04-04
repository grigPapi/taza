/**
 * lesson.js - Скрипты для страниц уроков
 */

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация функционала урока
    setupLessonNavigation();
    setupCodeBlocks();
    setupQuiz();
    setupCommentForm();
    calculateReadingTime();
    setupInteractiveElements();
});

/**
 * Настраивает навигацию между уроками
 */
async function setupLessonNavigation() {
    const prevButton = document.getElementById('prev-lesson');
    const nextButton = document.getElementById('next-lesson');
    
    if (!prevButton || !nextButton) return;
    
    const courseId = document.querySelector('meta[name="page-course-id"]')?.getAttribute('content');
    const currentLessonId = document.querySelector('meta[name="page-lesson-id"]')?.getAttribute('content');
    
    if (!courseId || !currentLessonId) {
        // Скрываем кнопки навигации, если нет информации о курсе или уроке
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        return;
    }
    
    try {
        // Загрузка JSON файла со списком уроков курса
        const response = await fetch(`/courses/${courseId}/lessons.json`);
        if (!response.ok) throw new Error('Ошибка загрузки списка уроков');
        
        const lessons = await response.json();
        
        // Находим индекс текущего урока
        const currentIndex = lessons.findIndex(lesson => lesson.id === currentLessonId);
        
        if (currentIndex === -1) {
            throw new Error('Текущий урок не найден в списке');
        }
        
        // Настраиваем кнопку предыдущего урока
        if (currentIndex > 0) {
            const prevLesson = lessons[currentIndex - 1];
            prevButton.href = prevLesson.url;
            prevButton.innerHTML = `<i>←</i> ${prevLesson.title}`;
        } else {
            prevButton.style.display = 'none';
        }
        
        // Настраиваем кнопку следующего урока
        if (currentIndex < lessons.length - 1) {
            const nextLesson = lessons[currentIndex + 1];
            nextButton.href = nextLesson.url;
            nextButton.innerHTML = `${nextLesson.title} <i>→</i>`;
        } else {
            nextButton.style.display = 'none';
        }
        
        // Сохраняем прогресс в localStorage
        saveProgress(courseId, currentLessonId, currentIndex, lessons.length);
        
    } catch (error) {
        console.error('Ошибка при настройке навигации урока:', error);
        // Скрываем кнопки навигации при ошибке
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
    }
}

/**
 * Сохраняет прогресс прохождения курса в localStorage
 */
function saveProgress(courseId, lessonId, currentIndex, totalLessons) {
    const progressKey = `course_progress_${courseId}`;
    
    // Получаем текущий прогресс или создаем новый
    let progress = JSON.parse(localStorage.getItem(progressKey) || '{"completedLessons":[]}');
    
    // Добавляем текущий урок в список завершенных, если его там еще нет
    if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
    }
    
    // Обновляем информацию о последнем просмотренном уроке
    progress.lastLessonId = lessonId;
    
    // Рассчитываем процент прохождения
    progress.progressPercentage = Math.round((progress.completedLessons.length / totalLessons) * 100);
    
    // Сохраняем обновленный прогресс
    localStorage.setItem(progressKey, JSON.stringify(progress));
}

/**
 * Добавляет функционал для блоков кода
 */
function setupCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.code-block pre');
    
    codeBlocks.forEach(block => {
        // Добавляем кнопку копирования для блоков кода
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = 'Копировать';
        copyButton.addEventListener('click', () => {
            const code = block.textContent;
            navigator.clipboard.writeText(code).then(() => {
                copyButton.innerHTML = 'Скопировано!';
                setTimeout(() => {
                    copyButton.innerHTML = 'Копировать';
                }, 2000);
            }).catch(err => {
                console.error('Ошибка при копировании: ', err);
                copyButton.innerHTML = 'Ошибка';
                setTimeout(() => {
                    copyButton.innerHTML = 'Копировать';
                }, 2000);
            });
        });
        
        // Добавляем обертку для блока кода и кнопки
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        block.parentNode.insertBefore(wrapper, block);
        wrapper.appendChild(block);
        wrapper.appendChild(copyButton);
        
        // Добавляем стили для оформления
        const style = document.createElement('style');
        style.textContent = `
            .code-block-wrapper {
                position: relative;
                margin: 1.5rem 0;
            }
            
            .copy-button {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: var(--secondary-color);
                color: white;
                border: none;
                border-radius: 4px;
                padding: 5px 10px;
                font-size: 0.8rem;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.3s;
            }
            
            .copy-button:hover {
                opacity: 1;
            }
            
            .code-block pre {
                padding-top: 40px;
            }
        `;
        document.head.appendChild(style);
    });
}

/**
 * Настраивает функционал викторины
 */
function setupQuiz() {
    const quizForms = document.querySelectorAll('.quiz-section');
    
    quizForms.forEach(form => {
        const submitButton = form.querySelector('.quiz-submit');
        if (!submitButton) return;
        
        submitButton.addEventListener('click', () => {
            // Проверяем ответы
            const questions = form.querySelectorAll('.quiz-question');
            let correctCount = 0;
            let totalQuestions = questions.length;
            
            questions.forEach(question => {
                const selectedOption = question.querySelector('input[type="radio"]:checked');
                
                // Удаляем предыдущие результаты
                const previousResult = question.querySelector('.quiz-result');
                if (previousResult) {
                    previousResult.remove();
                }
                
                // Если выбран ответ
                if (selectedOption) {
                    // В реальном приложении здесь будет проверка на правильность ответа
                    // Для демонстрации просто показываем результат
                    
                    // Создаем элемент результата
                    const resultDiv = document.createElement('div');
                    resultDiv.className = 'quiz-result';
                    
                    // Для демонстрации считаем правильным ответ "b"
                    if (selectedOption.value === 'b') {
                        resultDiv.innerHTML = '✅ Правильно!';
                        resultDiv.style.color = 'var(--success-color)';
                        correctCount++;
                    } else {
                        resultDiv.innerHTML = '❌ Неправильно. Правильный ответ: вариант 2.';
                        resultDiv.style.color = 'var(--danger-color)';
                    }
                    
                    // Добавляем результат после вариантов ответа
                    question.appendChild(resultDiv);
                }
            });
            
            // Показываем общий результат
            const existingSummary = form.querySelector('.quiz-summary');
            if (existingSummary) {
                existingSummary.remove();
            }
            
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'quiz-summary';
            summaryDiv.innerHTML = `<h4>Результат: ${correctCount} из ${totalQuestions}</h4>`;
            summaryDiv.style.marginTop = '1.5rem';
            summaryDiv.style.padding = '1rem';
            summaryDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            summaryDiv.style.borderRadius = 'var(--border-radius)';
            
            form.appendChild(summaryDiv);
        });
    });
}

/**
 * Настраивает форму комментариев
 */
function setupCommentForm() {
    const commentForm = document.querySelector('.comment-form');
    
    if (!commentForm) return;
    
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const textarea = commentForm.querySelector('textarea');
        const commentText = textarea.value.trim();
        
        if (commentText) {
            // Создаем новый комментарий
            const commentsList = document.querySelector('.comment-list');
            
            const newComment = document.createElement('li');
            newComment.className = 'comment-item';
            
            // Генерируем случайные инициалы для аватара
            const initials = 'АП'; // В реальном приложении это были бы инициалы пользователя
            
            newComment.innerHTML = `
                <div class="comment-header">
                    <div class="comment-avatar">${initials}</div>
                    <div class="comment-info">
                        <span class="comment-author">Анонимный пользователь</span>
                        <span class="comment-date">${new Date().toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="comment-body">
                    <p>${commentText}</p>
                </div>
                <div class="comment-actions">
                    <a href="#" class="comment-reply">Ответить</a>
                    <a href="#" class="comment-like">Нравится</a>
                </div>
            `;
            
            // Добавляем комментарий в начало списка
            commentsList.insertBefore(newComment, commentsList.firstChild);
            
            // Очищаем поле ввода
            textarea.value = '';
            
            // Добавляем анимацию для нового комментария
            newComment.style.animation = 'fadeIn 0.5s';
            
            // Добавляем стили анимации
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        } else {
            alert('Пожалуйста, введите текст комментария');
        }
    });
}

/**
 * Расчет времени чтения
 */
function calculateReadingTime() {
    const content = document.querySelector('.lesson-content');
    if (!content) return;
    
    // Получаем весь текст из контента урока
    const text = content.textContent || '';
    
    // Считаем количество слов (приблизительно)
    const wordCount = text.split(/\s+/).length;
    
    // Вычисляем время чтения (среднее количество слов в минуту - около 200)
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    
    // Обновляем метатег и отображаемое время чтения
    const readingTimeMeta = document.querySelector('meta[name="page-reading-time"]');
    if (readingTimeMeta) {
        readingTimeMeta.setAttribute('content', readingTimeMinutes.toString());
    }
    
    const readingTimeElement = document.querySelector('[data-variable="reading-time"]');
    if (readingTimeElement) {
        readingTimeElement.textContent = readingTimeMinutes.toString();
    }
}

/**
 * Обеспечивает работу интерактивных элементов в уроке
 */
function setupInteractiveElements() {
    // Обработка изображений (прикрепление лайтбокса)
    setupImageZoom();
    
    // Обработка ссылок внутри страницы для плавной прокрутки
    setupSmoothScrolling();
}

/**
 * Добавляет функциональность увеличения изображений
 */
function setupImageZoom() {
    const contentImages = document.querySelectorAll('.lesson-content img');
    contentImages.forEach(img => {
        img.addEventListener('click', () => {
            // Простая реализация лайтбокса
            const overlay = document.createElement('div');
            overlay.className = 'image-overlay';
            
            const imgClone = document.createElement('img');
            imgClone.src = img.src;
            
            overlay.appendChild(imgClone);
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', () => {
                overlay.remove();
            });
            
            // Стили для оверлея
            const style = document.createElement('style');
            style.textContent = `
                .image-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    cursor: pointer;
                }
                
                .image-overlay img {
                    max-width: 90%;
                    max-height: 90%;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                }
            `;
            document.head.appendChild(style);
        });
        
        // Добавляем стиль курсора при наведении
        img.style.cursor = 'pointer';
    });
}

/**
 * Настраивает плавную прокрутку к якорям
 */
function setupSmoothScrolling() {
    // Получаем все ссылки на странице
    const links = document.querySelectorAll('a[href^="#"]');
    
    // Добавляем обработчик для каждой ссылки
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Получаем ID элемента, к которому нужно прокрутить
            const targetId = this.getAttribute('href').slice(1);
            
            // Проверяем, существует ли элемент с таким ID
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Предотвращаем стандартное поведение ссылки
                e.preventDefault();
                
                // Выполняем плавную прокрутку
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Обновляем URL без перезагрузки страницы
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });
}