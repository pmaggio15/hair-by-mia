// Utility function to check if mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Accessibility: Announce to screen readers
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Gallery Carousel Class
class Carousel {
    constructor(containerSelector, trackId, controlsSelector, indicatorsSelector, options = {}) {
        // Handle both element and string selector
        this.container = typeof containerSelector === 'string' 
            ? document.getElementById(containerSelector) 
            : containerSelector;
        this.track = document.getElementById(trackId);
        this.items = this.track ? Array.from(this.track.children) : [];
        this.currentIndex = 0;
        this.intervalId = null;
        this.autoplayInterval = options.autoplayInterval || 4000;
        this.itemType = options.itemType || 'item';
        
        if (!this.container || !this.track || this.items.length === 0) {
            console.warn('Carousel initialization failed - missing elements');
            return;
        }
        
        // Get indicators
        const indicatorsContainer = this.container.querySelector(indicatorsSelector);
        if (indicatorsContainer) {
            this.indicators = Array.from(indicatorsContainer.querySelectorAll('button[role="tab"]'));
        }
        
        this.init();
    }
    
    init() {
        // Set up indicator listeners
        if (this.indicators) {
            this.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => this.goToSlide(index));
                indicator.addEventListener('keydown', (e) => this.handleIndicatorKeydown(e, index));
            });
        }
        
        // Keyboard navigation
        this.track.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Pause on hover/focus
        this.container.addEventListener('mouseenter', () => this.pause());
        this.container.addEventListener('mouseleave', () => this.play());
        this.container.addEventListener('focusin', () => this.pause());
        this.container.addEventListener('focusout', () => this.play());
        
        // Start autoplay
        this.play();
        
        // Update on resize
        window.addEventListener('resize', () => this.updateSlide());
    }
    
    handleKeydown(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.prev();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.next();
        } else if (e.key === 'Home') {
            e.preventDefault();
            this.goToSlide(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            this.goToSlide(this.items.length - 1);
        }
    }
    
    handleIndicatorKeydown(e, index) {
        let newIndex = index;
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            newIndex = index > 0 ? index - 1 : this.indicators.length - 1;
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            newIndex = index < this.indicators.length - 1 ? index + 1 : 0;
        } else if (e.key === 'Home') {
            e.preventDefault();
            newIndex = 0;
        } else if (e.key === 'End') {
            e.preventDefault();
            newIndex = this.indicators.length - 1;
        }
        
        if (newIndex !== index) {
            this.goToSlide(newIndex);
            this.indicators[newIndex].focus();
        }
    }
    
    updateSlide() {
        if (isMobile()) {
            const itemWidth = this.items[0].offsetWidth;
            const translateX = -(this.currentIndex * itemWidth);
            this.track.style.transform = `translateX(${translateX}px)`;
        } else {
            const itemWidth = this.items[0].offsetWidth;
            const gap = 48; // 3rem
            const visibleItems = 3;
            const maxIndex = this.items.length - visibleItems;
            
            if (this.currentIndex > maxIndex) {
                this.currentIndex = maxIndex;
            }
            
            const translateX = -(this.currentIndex * (itemWidth + gap));
            this.track.style.transform = `translateX(${translateX}px)`;
        }
        
        // Update ARIA labels
        this.updateARIA();
        
        // Announce to screen reader
        announceToScreenReader(`Showing ${this.itemType} ${this.currentIndex + 1} of ${this.items.length}`);
    }
    
    updateARIA() {
        // Update indicators
        if (this.indicators) {
            this.indicators.forEach((indicator, index) => {
                indicator.setAttribute('aria-selected', index === this.currentIndex ? 'true' : 'false');
                indicator.setAttribute('tabindex', index === this.currentIndex ? '0' : '-1');
            });
        }
        
        // Update items
        this.items.forEach((item, index) => {
            if (isMobile()) {
                item.setAttribute('aria-hidden', index !== this.currentIndex ? 'true' : 'false');
            } else {
                const visibleItems = 3;
                const isVisible = index >= this.currentIndex && index < this.currentIndex + visibleItems;
                item.setAttribute('aria-hidden', !isVisible ? 'true' : 'false');
            }
        });
    }
    
    next() {
        if (isMobile()) {
            this.currentIndex++;
            if (this.currentIndex >= this.items.length) {
                this.currentIndex = 0;
            }
        } else {
            const visibleItems = 3;
            const maxIndex = this.items.length - visibleItems;
            this.currentIndex++;
            if (this.currentIndex > maxIndex) {
                this.currentIndex = 0;
            }
        }
        this.updateSlide();
    }
    
    prev() {
        if (isMobile()) {
            this.currentIndex--;
            if (this.currentIndex < 0) {
                this.currentIndex = this.items.length - 1;
            }
        } else {
            const visibleItems = 3;
            const maxIndex = this.items.length - visibleItems;
            this.currentIndex--;
            if (this.currentIndex < 0) {
                this.currentIndex = maxIndex;
            }
        }
        this.updateSlide();
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlide();
        this.resetAutoplay();
    }
    
    play() {
        if (this.intervalId) return;
        this.intervalId = setInterval(() => this.next(), this.autoplayInterval);
    }
    
    pause() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    resetAutoplay() {
        this.pause();
        this.play();
    }
}

// Calendar Class
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.monthYearElement = document.getElementById('monthYear');
        this.calendarDaysElement = document.getElementById('calendarDays');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        
        if (!this.monthYearElement || !this.calendarDaysElement) return;
        
        this.init();
    }
    
    init() {
        this.prevMonthBtn.addEventListener('click', () => this.previousMonth());
        this.nextMonthBtn.addEventListener('click', () => this.nextMonth());
        
        // Keyboard navigation
        this.prevMonthBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.previousMonth();
            }
        });
        
        this.nextMonthBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.nextMonth();
            }
        });
        
        this.render();
    }
    
    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        this.monthYearElement.textContent = `${months[month]} ${year}`;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        this.calendarDaysElement.innerHTML = '';
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            emptyDay.setAttribute('role', 'gridcell');
            emptyDay.setAttribute('aria-hidden', 'true');
            this.calendarDaysElement.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            dayElement.setAttribute('role', 'gridcell');
            dayElement.setAttribute('tabindex', '0');
            
            const currentDayDate = new Date(year, month, day);
            const dateString = `${months[month]} ${day}, ${year}`;
            dayElement.setAttribute('aria-label', dateString);
            
            // Highlight today
            if (year === today.getFullYear() && 
                month === today.getMonth() && 
                day === today.getDate()) {
                dayElement.classList.add('today');
                dayElement.setAttribute('aria-current', 'date');
            }
            
            // Mark past days
            if (currentDayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                dayElement.classList.add('past');
                dayElement.setAttribute('aria-disabled', 'true');
                dayElement.removeAttribute('tabindex');
            }
            
            // Mark weekends
            const dayOfWeek = new Date(year, month, day).getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                dayElement.classList.add('weekend');
            }
            
            // Add click handler for available days
            if (!dayElement.classList.contains('past')) {
                dayElement.addEventListener('click', () => this.selectDate(day, month, year));
                dayElement.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.selectDate(day, month, year);
                    }
                });
            }
            
            this.calendarDaysElement.appendChild(dayElement);
        }
        
        // Announce month change to screen readers
        announceToScreenReader(`Calendar showing ${months[month]} ${year}`);
    }
    
    selectDate(day, month, year) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        announceToScreenReader(`Selected ${months[month]} ${day}, ${year}. Please use the booking link to complete your appointment.`);
        
        // Could integrate with booking system here
        window.open('https://mia-cano-appointment-scheduling.square.site', '_blank');
    }
    
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    }
    
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    }
}

// Smooth scroll with offset for fixed navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Skip if it's just "#" or the skip link
        if (href === '#' || this.classList.contains('skip-link')) return;
        
        e.preventDefault();
        
        const target = document.querySelector(href);
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Set focus to target for keyboard users
            target.setAttribute('tabindex', '-1');
            target.focus();
            
            // Remove tabindex after focus
            target.addEventListener('blur', function() {
                target.removeAttribute('tabindex');
            }, { once: true });
        }
    });
});

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Mobile Menu
    new MobileMenu();
    
    // Initialize Gallery Carousel
    const gallerySection = document.querySelector('.gallery-section');
    if (gallerySection && document.getElementById('gallery-track')) {
        const galleryCarousel = new Carousel(
            gallerySection,
            'gallery-track',
            '.gallery-controls',
            '.gallery-indicators',
            { 
                autoplayInterval: 4000,
                itemType: 'gallery image'
            }
        );
    }
    
    // Initialize Testimonials Carousel
    const testimonialsSection = document.querySelector('.testimonials-section');
    if (testimonialsSection && document.getElementById('testimonials-track')) {
        const testimonialsCarousel = new Carousel(
            testimonialsSection,
            'testimonials-track',
            '.testimonials-controls',
            '.testimonials-indicators',
            { 
                autoplayInterval: 4000,
                itemType: 'testimonial'
            }
        );
    }
    
    // Initialize Calendar
    if (document.getElementById('calendarDays')) {
        const calendar = new Calendar();
    }
    
    // Trap focus in navigation menu for keyboard users
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        const firstNavItem = navMenu.querySelector('a');
        const lastNavItem = Array.from(navMenu.querySelectorAll('a')).pop();
        
        navMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstNavItem) {
                    // Allow natural tab flow
                } else if (!e.shiftKey && document.activeElement === lastNavItem) {
                    // Allow natural tab flow
                }
            }
        });
    }
    
    // Add loading complete announcement
    announceToScreenReader('Page loaded successfully. Hair by Mia salon website.');
});

// Handle window resize
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // Carousels will handle their own resize
        announceToScreenReader('Window resized');
    }, 250);
});

// Detect high contrast mode and adjust if needed
if (window.matchMedia('(prefers-contrast: high)').matches) {
    document.body.classList.add('high-contrast');
}

// Detect reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reduced-motion');
}

// Mobile Hamburger Menu
class MobileMenu {
    constructor() {
        this.hamburger = document.getElementById('hamburger-btn');
        this.mobileNav = document.getElementById('mobile-nav');
        this.menuLinks = document.querySelectorAll('.nav-menu a');
        this.mobileBookBtn = document.querySelector('.mobile-book-btn');
        this.overlay = null;
        
        if (!this.hamburger || !this.mobileNav) return;
        
        this.init();
    }
    
    init() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'menu-overlay';
        document.body.appendChild(this.overlay);
        
        // Hamburger click
        this.hamburger.addEventListener('click', () => this.toggleMenu());
        
        // Overlay click to close
        this.overlay.addEventListener('click', () => this.closeMenu());
        
        // Close menu when clicking nav links
        this.menuLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
        
        // Close menu when clicking book button
        if (this.mobileBookBtn) {
            this.mobileBookBtn.addEventListener('click', () => this.closeMenu());
        }
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.closeMenu();
            }
        });
        
        // Handle resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen()) {
                this.closeMenu();
            }
        });
    }
    
    toggleMenu() {
        if (this.isOpen()) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.mobileNav.classList.add('active');
        this.overlay.classList.add('active');
        this.hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        
        // Focus first menu item
        const firstLink = this.mobileNav.querySelector('.nav-menu a');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
        
        announceToScreenReader('Navigation menu opened');
    }
    
    closeMenu() {
        this.mobileNav.classList.remove('active');
        this.overlay.classList.remove('active');
        this.hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        
        // Return focus to hamburger
        this.hamburger.focus();
        
        announceToScreenReader('Navigation menu closed');
    }
    
    isOpen() {
        return this.mobileNav.classList.contains('active');
    }
}