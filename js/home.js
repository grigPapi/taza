/**
 * home.js - Скрипты для главной страницы
 */

document.addEventListener('DOMContentLoaded', function() {
    // Загрузка курсов
    loadFeaturedCourses();
    loadAllCourses();
    setupTestimonialsSlider();
    setupScrollAnimations();
    setupTopics();
});

/**
 * Загружает рекомендуемые курсы
 */
async function loadFeaturedCourses() {
    const featuredCoursesContainer = document.getElementById('featured-courses-container');
    if (!featuredCoursesContainer) return;
    
    try {
        // Загружаем список всех курсов
        const response = await fetch('/data/courses.json');
        if (!response.ok) throw new Error('Ошибка загрузки списка курсов');
        
        const courses = await response.json();
        
        // Выбираем два рекомендуемых курса
        const featuredCourses = courses.filter(course => 
            course.id === 'sys-admin' || course.id === 'hacking'
        );
        
        if (featuredCourses.length === 0) {
            featuredCoursesContainer.innerHTML = '<div class="empty-state">Нет рекомендуемых курсов.</div>';
            return;
        }
        
        // Очистка контейнера
        featuredCoursesContainer.innerHTML = '';
        
        // Добавляем карточки рекомендуемых курсов
        featuredCourses.forEach((course, index) => {
            const badge = course.id === 'sys-admin' ? 'Популярный' : 'Новинка';
            
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card featured';
            courseCard.innerHTML = `
                <div class="course-badge">${badge}</div>
                <div class="course-image">
                    <span class="course-icon">${course.icon}</span>
                </div>
                <div class="course-content">
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <div class="course-meta">
                        <div class="meta-item">
                            <span class="meta-icon">📚</span>
                            <span>${course.lessons} уроков</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-icon">🏆</span>
                            <span>${course.certification}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-icon">⏱️</span>
                            <span>${course.duration}+ минут</span>
                        </div>
                    </div>
                    <a href="/courses/${course.id}/index.html" class="btn btn-outline">Подробнее</a>
                </div>
            `;
            featuredCoursesContainer.appendChild(courseCard);
            
            // Добавляем анимацию с задержкой
            setTimeout(() => {
                courseCard.classList.add('animated');
            }, 300 + index * 150);
        });
    } catch (error) {
        console.error('Ошибка при загрузке рекомендуемых курсов:', error);
        featuredCoursesContainer.innerHTML = '<div class="error-state">Ошибка загрузки рекомендуемых курсов. Пожалуйста, попробуйте позже.</div>';
    }
}

/**
 * Загружает все курсы
 */
async function loadAllCourses() {
    const allCoursesContainer = document.getElementById('all-courses-container');
    if (!allCoursesContainer) return;
    
    try {
        // Загружаем список всех курсов
        const response = await fetch('/data/courses.json');
        if (!response.ok) throw new Error('Ошибка загрузки списка курсов');
        
        const courses = await response.json();
        
        if (courses.length === 0) {
            allCoursesContainer.innerHTML = '<div class="empty-state">Нет доступных курсов.</div>';
            return;
        }
        
        // Очистка контейнера
        allCoursesContainer.innerHTML = '';
        
        // Добавляем карточки всех курсов
        courses.forEach((course, index) => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.innerHTML = `
                <div class="course-image">
                    <span class="course-icon">${course.icon}</span>
                </div>
                <div class="course-content">
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <div class="course-meta">
                        <span>${course.lessons} уроков</span>
                        <span>${course.certification}</span>
                    </div>
                    <a href="/courses/${course.id}/index.html" class="btn btn-sm">Перейти к курсу</a>
                </div>
            `;
            allCoursesContainer.appendChild(courseCard);
            
            // Добавляем анимацию с задержкой
            setTimeout(() => {
                courseCard.classList.add('animated');
            }, 100 + index * 50); // Разные задержки для красивого эффекта
        });
    } catch (error) {
        console.error('Ошибка при загрузке курсов:', error);
        allCoursesContainer.innerHTML = '<div class="error-state">Ошибка загрузки курсов. Пожалуйста, попробуйте позже.</div>';
    }
}

/**
 * Настраивает слайдер отзывов
 */
function setupTestimonialsSlider() {
    const testimonials = document.querySelectorAll('.testimonial');
    if (testimonials.length <= 1) return;
    
    let currentIndex = 0;
    
    // Показываем только первый отзыв (остальные скрыты с помощью CSS)
    testimonials[0].classList.add('active');
    testimonials[0].classList.add('animated');
    
    // Функция для переключения отзывов
    function showNextTestimonial() {
        testimonials[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % testimonials.length;
        testimonials[currentIndex].classList.add('active');
        testimonials[currentIndex].classList.add('animated');
    }
    
    // Автоматическое переключение отзывов
    setInterval(showNextTestimonial, 5000);
    
    // Добавляем кнопки навигации
    const testimonialsContainer = testimonials[0].parentElement;
    
    const sliderControls = document.createElement('div');
    sliderControls.className = 'testimonial-controls';
    
    // Добавляем точки для индикации слайдов
    const sliderDots = document.createElement('div');
    sliderDots.className = 'testimonial-dots';
    
    testimonials.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'testimonial-dot';
        if (index === 0) dot.classList.add('active');
        
        dot.addEventListener('click', () => {
            testimonials[currentIndex].classList.remove('active');
            currentIndex = index;
            testimonials[currentIndex].classList.add('active');
            testimonials[currentIndex].classList.add('animated');
            
            // Обновляем активную точку
            document.querySelectorAll('.testimonial-dot').forEach((d, i) => {
                d.classList.toggle('active', i === index);
            });
        });
        
        sliderDots.appendChild(dot);
    });
    
    sliderControls.appendChild(sliderDots);
    testimonialsContainer.appendChild(sliderControls);
    
    // Добавляем стили для элементов управления
    const style = document.createElement('style');
    style.textContent = `
        .testimonial-controls {
            display: flex;
            justify-content: center;
            margin-top: 1rem;
        }
        
        .testimonial-dots {
            display: flex;
            gap: 0.5rem;
        }
        
        .testimonial-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: var(--border-color);
            cursor: pointer;
            transition: var(--transition);
        }
        
        .testimonial-dot.active {
            background-color: var(--secondary-color);
            transform: scale(1.2);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Настраивает анимации элементов при прокрутке
 */
function setupScrollAnimations() {
    const animationElements = document.querySelectorAll('.section-header, .about-content, .about-stats, .cta-content');
    
    // Функция для проверки видимости элемента в окне просмотра
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.9 &&
            rect.bottom >= 0
        );
    }
    
    // Функция для анимации элементов при прокрутке
    function animateOnScroll() {
        animationElements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('animated');
            }
        });
    }
    
    // Запускаем анимацию при прокрутке
    window.addEventListener('scroll', animateOnScroll);
    
    // Запускаем анимацию при загрузке страницы
    animateOnScroll();
    
    // Анимация героя при загрузке
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        heroContent.style.transition = 'opacity 1s ease, transform 1s ease';
        
        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 200);
    }
}

/**
 * Настраивает интерактивность тем на главной странице
 */
function setupTopics() {
    const topicHeaders = document.querySelectorAll('.topic-header');
    
    topicHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const topicContent = header.nextElementSibling;
            const isActive = topicContent.classList.contains('active');
            
            // Закрываем все открытые темы
            document.querySelectorAll('.topic-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Обновляем иконки во всех заголовках
            document.querySelectorAll('.topic-toggle').forEach(toggle => {
                toggle.textContent = '+';
            });
            
            // Открываем/закрываем текущую тему
            if (!isActive) {
                topicContent.classList.add('active');
                header.querySelector('.topic-toggle').textContent = '−';
                
                // Анимируем уроки при открытии
                const lessons = topicContent.querySelectorAll('.lesson-item');
                lessons.forEach((lesson, index) => {
                    lesson.style.opacity = '0';
                    lesson.style.transform = 'translateX(-10px)';
                    lesson.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    lesson.style.transitionDelay = `${index * 50}ms`;
                    
                    setTimeout(() => {
                        lesson.style.opacity = '1';
                        lesson.style.transform = 'translateX(0)';
                    }, 50);
                });
            }
        });
    });
    
    // Настраиваем кнопку прокрутки наверх
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}