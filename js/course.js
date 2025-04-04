/**
 * course.js - Скрипты для страниц курсов
 */

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация функционала страницы курса
    setupTabs();
    loadCourseCurriculum();
    loadRelatedCourses();
    setupUserProgress();
    setupCurriculumAnimations();
});

/**
 * Настраивает переключение вкладок
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Сбрасываем активные состояния
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Устанавливаем активное состояние для выбранной вкладки
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Добавляем плавную анимацию появления содержимого
            const activePane = document.getElementById(targetTab);
            activePane.style.animation = 'fadeIn 0.3s';
            
            // Добавляем стили анимации, если их еще нет
            if (!document.getElementById('tab-animations')) {
                const style = document.createElement('style');
                style.id = 'tab-animations';
                style.textContent = `
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `;
                document.head.appendChild(style);
            }
        });
    });
}

/**
 * Загружает программу курса
 */
async function loadCourseCurriculum() {
    const courseId = document.querySelector('meta[name="page-course-id"]')?.getAttribute('content');
    if (!courseId) return;
    
    const curriculumContainer = document.querySelector('.course-curriculum');
    if (!curriculumContainer) return;
    
    try {
        // Загрузка JSON файла со списком уроков курса
        const response = await fetch(`/courses/${courseId}/lessons.json`);
        if (!response.ok) throw new Error('Ошибка загрузки списка уроков');
        
        const lessons = await response.json();
        
        // Очистка контейнера
        curriculumContainer.innerHTML = '';
        
        if (lessons.length === 0) {
            curriculumContainer.innerHTML = '<div class="empty-state">Нет уроков в этом курсе.</div>';
            return;
        }
        
        // Группируем уроки по сложности
        const groupedLessons = groupLessonsByDifficulty(lessons);
        
        // Создаем блоки с уроками для каждого уровня сложности
        Object.entries(groupedLessons).forEach(([difficulty, difficultyLessons], index) => {
            const curriculumItem = document.createElement('div');
            curriculumItem.className = 'curriculum-item';
            if (index === 0) curriculumItem.classList.add('active');
            
            // Заголовок блока
            const itemHeader = document.createElement('div');
            itemHeader.className = 'curriculum-item-header';
            
            // Получаем иконку в зависимости от сложности
            let difficultyIcon = '📚';
            if (difficulty.includes('Начальный')) difficultyIcon = '🔰';
            if (difficulty.includes('Средний')) difficultyIcon = '📊';
            if (difficulty.includes('Продвинутый')) difficultyIcon = '🔥';
            
            itemHeader.innerHTML = `
                <div class="curriculum-item-title">
                    <div class="curriculum-item-icon">${difficultyIcon}</div>
                    <div>${difficulty} (${difficultyLessons.length} ${getCorrectWordForm(difficultyLessons.length, 'урок', 'урока', 'уроков')})</div>
                </div>
                <div class="curriculum-item-meta">
                    <div>${getTotalDuration(difficultyLessons)} минут</div>
                </div>
            `;
            
            // Содержимое блока
            const itemContent = document.createElement('div');
            itemContent.className = 'curriculum-item-content';
            
            // Добавляем уроки
            difficultyLessons.forEach(lesson => {
                const lessonElement = document.createElement('div');
                lessonElement.className = 'curriculum-lesson';
                lessonElement.innerHTML = `
                    <div class="curriculum-lesson-title">
                        <div class="curriculum-lesson-icon">📝</div>
                        <a href="${lesson.url}">${lesson.title}</a>
                    </div>
                    <div class="curriculum-lesson-meta">
                        <div class="curriculum-lesson-duration">${lesson.duration} мин</div>
                        <a href="${lesson.url}" class="curriculum-lesson-preview">Просмотр</a>
                    </div>
                `;
                itemContent.appendChild(lessonElement);
            });
            
            // Собираем блок
            curriculumItem.appendChild(itemHeader);
            curriculumItem.appendChild(itemContent);
            curriculumContainer.appendChild(curriculumItem);
            
            // Настраиваем переключение состояния блока
            itemHeader.addEventListener('click', () => {
                curriculumItem.classList.toggle('active');
            });
        });
        
        // Обновляем метаданные курса
        updateCourseMetadata(lessons);
    } catch (error) {
        console.error('Ошибка при загрузке программы курса:', error);
        curriculumContainer.innerHTML = '<div class="error-state">Ошибка загрузки программы курса. Пожалуйста, попробуйте позже.</div>';
    }
}

/**
 * Группирует уроки по уровню сложности
 */
function groupLessonsByDifficulty(lessons) {
    const grouped = {};
    
    // Определяем порядок сложности для правильной сортировки
    const difficultyOrder = {
        'Начальный уровень': 1,
        'Средний уровень': 2,
        'Продвинутый уровень': 3
    };
    
    // Группируем уроки
    lessons.forEach(lesson => {
        const difficulty = lesson.difficulty || 'Без категории';
        if (!grouped[difficulty]) {
            grouped[difficulty] = [];
        }
        grouped[difficulty].push(lesson);
    });
    
    // Сортируем результат по порядку сложности
    const sortedGrouped = {};
    Object.keys(grouped)
        .sort((a, b) => (difficultyOrder[a] || 999) - (difficultyOrder[b] || 999))
        .forEach(key => {
            sortedGrouped[key] = grouped[key];
        });
    
    return sortedGrouped;
}

/**
 * Возвращает правильную форму слова в зависимости от числа
 */
function getCorrectWordForm(number, form1, form2, form5) {
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return form5;
    }
    
    if (lastDigit === 1) {
        return form1;
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
        return form2;
    }
    
    return form5;
}

/**
 * Вычисляет общую продолжительность уроков
 */
function getTotalDuration(lessons) {
    return lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
}

/**
 * Обновляет метаданные курса на основе списка уроков
 */
function updateCourseMetadata(lessons) {
    // Обновляем количество уроков
    const lessonsCountElement = document.getElementById('lessons-count');
    if (lessonsCountElement) {
        lessonsCountElement.textContent = lessons.length;
    }
    
    // Рассчитываем общую продолжительность курса
    const totalDuration = getTotalDuration(lessons);
    const totalDurationElement = document.getElementById('total-duration');
    if (totalDurationElement) {
        totalDurationElement.textContent = totalDuration;
    }
}

/**
 * Загружает похожие курсы
 */
async function loadRelatedCourses() {
    const courseId = document.querySelector('meta[name="page-course-id"]')?.getAttribute('content');
    if (!courseId) return;
    
    const relatedCoursesContainer = document.querySelector('.related-courses-grid');
    if (!relatedCoursesContainer) return;
    
    try {
        // Загружаем список всех курсов
        const response = await fetch('/data/courses.json');
        if (!response.ok) throw new Error('Ошибка загрузки списка курсов');
        
        const courses = await response.json();
        
        // Фильтруем курсы, исключая текущий
        const relatedCourses = courses
            .filter(course => course.id !== courseId)
            .slice(0, 3); // Берем только первые 3 курса
        
        // Очистка контейнера
        relatedCoursesContainer.innerHTML = '';
        
        if (relatedCourses.length === 0) {
            relatedCoursesContainer.innerHTML = '<div class="empty-state">Нет похожих курсов.</div>';
            return;
        }
        
        // Добавляем карточки похожих курсов
        relatedCourses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'related-course-card';
            courseCard.innerHTML = `
                <div class="related-course-image">${course.icon || '📚'}</div>
                <div class="related-course-content">
                    <div class="related-course-title">
                        <a href="/courses/${course.id}/index.html">${course.title}</a>
                    </div>
                    <div class="related-course-meta">
                        <div>${course.lessons} уроков</div>
                        <div>${course.difficulty}</div>
                    </div>
                </div>
            `;
            relatedCoursesContainer.appendChild(courseCard);
        });
    } catch (error) {
        console.error('Ошибка при загрузке похожих курсов:', error);
        relatedCoursesContainer.innerHTML = '<div class="error-state">Ошибка загрузки рекомендаций. Пожалуйста, попробуйте позже.</div>';
    }
}

/**
 * Настраивает отображение прогресса пользователя
 */
function setupUserProgress() {
    const courseId = document.querySelector('meta[name="page-course-id"]')?.getAttribute('content');
    if (!courseId) return;
    
    // Загружаем прогресс пользователя из localStorage
    const userProgressKey = `course_progress_${courseId}`;
    let userProgress = JSON.parse(localStorage.getItem(userProgressKey) || '{"completedLessons":[],"lastLessonId":"","progressPercentage":0}');
    
    // Отображаем прогресс
    const progressBar = document.querySelector('.progress-card .progress-bar-fill');
    const progressText = document.querySelector('.progress-card .progress-text');
    const lastLessonLink = document.querySelector('.progress-card .last-lesson');
    
    if (progressBar && progressText) {
        progressBar.style.width = `${userProgress.progressPercentage}%`;
        progressText.textContent = `${userProgress.progressPercentage}% завершено`;
    }
    
    // Настраиваем ссылку на последний урок
    if (lastLessonLink) {
        if (userProgress.lastLessonId) {
            // Загружаем список уроков, чтобы найти URL последнего урока
            fetch(`/courses/${courseId}/lessons.json`)
                .then(response => response.json())
                .then(lessons => {
                    const lastLesson = lessons.find(lesson => lesson.id === userProgress.lastLessonId);
                    if (lastLesson) {
                        lastLessonLink.href = lastLesson.url;
                        lastLessonLink.textContent = 'Продолжить обучение';
                    } else {
                        // Если урок не найден, устанавливаем ссылку на первый урок
                        if (lessons.length > 0) {
                            lastLessonLink.href = lessons[0].url;
                            lastLessonLink.textContent = 'Начать обучение';
                        }
                    }
                })
                .catch(error => {
                    console.error('Ошибка при загрузке списка уроков:', error);
                    lastLessonLink.textContent = 'Просмотреть уроки';
                    lastLessonLink.href = '#content';
                });
        } else {
            // Если нет последнего урока, устанавливаем ссылку на содержание курса
            lastLessonLink.textContent = 'Начать обучение';
            lastLessonLink.href = '#content';
        }
    }
}

/**
 * Добавляет анимацию для элементов программы курса
 */
function setupCurriculumAnimations() {
    // Добавляем анимацию появления для элементов программы курса
    document.querySelectorAll('.curriculum-item').forEach((item, index) => {
        // Задержка для каждого элемента
        const delay = index * 100;
        
        // Применяем анимацию с задержкой
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            // Небольшая задержка для включения анимации
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 50);
        }, delay);
    });
    
    // Анимация для уроков при открытии раздела
    document.querySelectorAll('.curriculum-item-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const lessons = content.querySelectorAll('.curriculum-lesson');
            
            // Если раздел открыт (будет активен после клика)
            if (!header.parentElement.classList.contains('active')) {
                // Анимируем появление уроков
                lessons.forEach((lesson, index) => {
                    lesson.style.opacity = '0';
                    lesson.style.transform = 'translateX(-10px)';
                    lesson.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    lesson.style.transitionDelay = `${index * 50}ms`;
                    
                    // Запускаем анимацию с небольшой задержкой
                    setTimeout(() => {
                        lesson.style.opacity = '1';
                        lesson.style.transform = 'translateX(0)';
                    }, 50);
                });
            }
        });
    });
}