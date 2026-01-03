// Accessibility Widget JavaScript

class AccessibilityWidget {
    constructor() {
        this.button = document.getElementById('accessibility-widget-btn');
        this.panel = document.getElementById('accessibility-widget-panel');
        this.closeBtn = document.getElementById('widget-close-btn');
        this.resetBtn = document.getElementById('widget-reset-btn');
        this.options = document.querySelectorAll('.widget-option');
        this.overlay = null;
        
        this.features = {
            'bigger-text': false,
            'bigger-cursor': false,
            'tooltips': false,
            'line-height': false,
            'hide-images': false,
            'readable-fonts': false,
            'dyslexic-font': false,
            'high-contrast': false,
            'stop-animations': false
        };
        
        this.init();
        this.loadSettings();
    }
    
    init() {
        // Create overlay
        this.createOverlay();
        
        // Button click to open
        this.button.addEventListener('click', () => this.openPanel());
        
        // Close button
        this.closeBtn.addEventListener('click', () => this.closePanel());
        
        // Reset button
        this.resetBtn.addEventListener('click', () => this.resetSettings());
        
        // Options
        this.options.forEach(option => {
            option.addEventListener('click', () => this.toggleFeature(option));
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.panel.getAttribute('aria-hidden') === 'false') {
                this.closePanel();
            }
        });
        
        // Click overlay to close
        this.overlay.addEventListener('click', () => this.closePanel());
        
        // Trap focus in panel when open
        this.panel.addEventListener('keydown', (e) => this.trapFocus(e));
    }
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'widget-overlay';
        document.body.appendChild(this.overlay);
    }
    
    openPanel() {
        this.panel.removeAttribute('hidden');
        this.panel.setAttribute('aria-hidden', 'false');
        this.overlay.classList.add('active');
        
        // Focus first focusable element
        const firstFocusable = this.panel.querySelector('button, a');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Disable body scroll
        document.body.style.overflow = 'hidden';
        
        // Announce to screen reader
        this.announceToScreenReader('Accessibility options panel opened');
    }
    
    closePanel() {
        this.panel.setAttribute('hidden', '');
        this.panel.setAttribute('aria-hidden', 'true');
        this.overlay.classList.remove('active');
        
        // Re-enable body scroll
        document.body.style.overflow = '';
        
        // Return focus to button
        this.button.focus();
        
        // Announce to screen reader
        this.announceToScreenReader('Accessibility options panel closed');
    }
    
    trapFocus(e) {
        if (e.key !== 'Tab') return;
        
        const focusableElements = this.panel.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
        }
    }
    
    toggleFeature(option) {
        const feature = option.getAttribute('data-feature');
        const currentState = option.getAttribute('aria-pressed') === 'true';
        const newState = !currentState;
        
        // Update button state
        option.setAttribute('aria-pressed', newState);
        
        // Update internal state
        this.features[feature] = newState;
        
        // Apply or remove feature
        if (newState) {
            this.applyFeature(feature);
            this.announceToScreenReader(`${feature.replace('-', ' ')} enabled`);
        } else {
            this.removeFeature(feature);
            this.announceToScreenReader(`${feature.replace('-', ' ')} disabled`);
        }
        
        // Save settings
        this.saveSettings();
    }
    
    applyFeature(feature) {
        switch(feature) {
            case 'bigger-text':
                document.body.classList.add('bigger-text');
                break;
            case 'bigger-cursor':
                document.body.classList.add('bigger-cursor');
                break;
            case 'tooltips':
                document.body.classList.add('tooltips-enabled');
                this.initializeTooltips();
                break;
            case 'line-height':
                document.body.classList.add('line-height');
                break;
            case 'hide-images':
                document.body.classList.add('hide-images');
                break;
            case 'readable-fonts':
                document.body.classList.add('readable-fonts');
                // Remove dyslexic font if active
                this.removeFeature('dyslexic-font');
                this.features['dyslexic-font'] = false;
                this.updateButtonState('dyslexic-font', false);
                break;
            case 'dyslexic-font':
                document.body.classList.add('dyslexic-font');
                // Remove readable fonts if active
                this.removeFeature('readable-fonts');
                this.features['readable-fonts'] = false;
                this.updateButtonState('readable-fonts', false);
                break;
            case 'high-contrast':
                document.body.classList.add('high-contrast');
                break;
            case 'stop-animations':
                document.body.classList.add('stop-animations');
                break;
        }
    }
    
    removeFeature(feature) {
        switch(feature) {
            case 'bigger-text':
                document.body.classList.remove('bigger-text');
                break;
            case 'bigger-cursor':
                document.body.classList.remove('bigger-cursor');
                break;
            case 'tooltips':
                document.body.classList.remove('tooltips-enabled');
                this.destroyTooltips();
                break;
            case 'line-height':
                document.body.classList.remove('line-height');
                break;
            case 'hide-images':
                document.body.classList.remove('hide-images');
                break;
            case 'readable-fonts':
                document.body.classList.remove('readable-fonts');
                break;
            case 'dyslexic-font':
                document.body.classList.remove('dyslexic-font');
                break;
            case 'high-contrast':
                document.body.classList.remove('high-contrast');
                break;
            case 'stop-animations':
                document.body.classList.remove('stop-animations');
                break;
        }
    }
    
    updateButtonState(feature, state) {
        const button = document.querySelector(`[data-feature="${feature}"]`);
        if (button) {
            button.setAttribute('aria-pressed', state);
        }
    }
    
    resetSettings() {
        // Remove all features
        Object.keys(this.features).forEach(feature => {
            this.removeFeature(feature);
            this.features[feature] = false;
            this.updateButtonState(feature, false);
        });
        
        // Clear local storage
        localStorage.removeItem('accessibility-settings');
        
        // Announce
        this.announceToScreenReader('All accessibility settings have been reset');
    }
    
    saveSettings() {
        localStorage.setItem('accessibility-settings', JSON.stringify(this.features));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('accessibility-settings');
        if (saved) {
            const settings = JSON.parse(saved);
            Object.keys(settings).forEach(feature => {
                if (settings[feature]) {
                    this.features[feature] = true;
                    this.applyFeature(feature);
                    this.updateButtonState(feature, true);
                }
            });
        }
    }
    
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    initializeTooltips() {
        // Create tooltip element
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = 'accessibility-tooltip';
        document.body.appendChild(this.tooltipElement);
        
        // Find all elements with title attributes
        this.tooltipTargets = document.querySelectorAll('[title]');
        
        // Store original titles and add listeners
        this.tooltipTargets.forEach(element => {
            const title = element.getAttribute('title');
            element.setAttribute('data-tooltip', title);
            element.removeAttribute('title'); // Remove to prevent browser default
            
            element.addEventListener('mouseenter', (e) => this.showTooltip(e, title));
            element.addEventListener('mouseleave', () => this.hideTooltip());
            element.addEventListener('focus', (e) => this.showTooltip(e, title));
            element.addEventListener('blur', () => this.hideTooltip());
        });
    }
    
    showTooltip(event, text) {
        if (!this.tooltipElement) return;
        
        this.tooltipElement.textContent = text;
        this.tooltipElement.classList.add('visible');
        
        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        const tooltipRect = this.tooltipElement.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.bottom + 10;
        
        // Keep tooltip on screen
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        this.tooltipElement.style.left = left + 'px';
        this.tooltipElement.style.top = top + 'px';
    }
    
    hideTooltip() {
        if (this.tooltipElement) {
            this.tooltipElement.classList.remove('visible');
        }
    }
    
    destroyTooltips() {
        // Remove tooltip element
        if (this.tooltipElement) {
            this.tooltipElement.remove();
            this.tooltipElement = null;
        }
        
        // Restore original titles
        if (this.tooltipTargets) {
            this.tooltipTargets.forEach(element => {
                const tooltip = element.getAttribute('data-tooltip');
                if (tooltip) {
                    element.setAttribute('title', tooltip);
                    element.removeAttribute('data-tooltip');
                }
            });
            this.tooltipTargets = null;
        }
    }
}

// Initialize widget when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AccessibilityWidget();
    });
} else {
    new AccessibilityWidget();
}