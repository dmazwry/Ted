// Theme Management - Handles dark/light mode switching and preferences
class ThemeManager {
    constructor(app) {
        this.app = app;
        this.storageKey = 'dmazAlyxersTheme';
        this.themes = {
            light: {
                name: 'Light',
                icon: 'fas fa-sun',
                class: '',
                description: 'Mode terang yang nyaman untuk siang hari'
            },
            dark: {
                name: 'Dark',
                icon: 'fas fa-moon',
                class: 'dark',
                description: 'Mode gelap yang nyaman untuk malam hari'
            },
            auto: {
                name: 'Auto',
                icon: 'fas fa-adjust',
                class: 'auto',
                description: 'Mengikuti pengaturan sistem'
            }
        };
        this.currentTheme = 'auto';
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.setupMediaQueryListener();
    }

    // Apply theme to document
    apply(theme = null) {
        try {
            const targetTheme = theme || this.currentTheme;
            this.currentTheme = targetTheme;
            
            const resolvedTheme = this.resolveTheme(targetTheme);
            const themeConfig = this.themes[resolvedTheme];
            
            // Remove all theme classes
            Object.values(this.themes).forEach(t => {
                if (t.class) {
                    document.documentElement.classList.remove(t.class);
                }
            });
            
            // Apply new theme class
            if (themeConfig.class && themeConfig.class !== 'auto') {
                document.documentElement.classList.add(themeConfig.class);
            }
            
            // Update theme icons
            this.updateThemeIcons(resolvedTheme);
            
            // Update meta theme color
            this.updateMetaThemeColor(resolvedTheme);
            
            // Trigger theme change event
            this.triggerThemeChangeEvent(resolvedTheme);
            
            // Save preference
            this.save(targetTheme);
            
            return true;
        } catch (error) {
            console.error('Failed to apply theme:', error);
            return false;
        }
    }

    // Resolve auto theme to actual theme
    resolveTheme(theme) {
        if (theme === 'auto') {
            return this.getSystemPreference();
        }
        return theme;
    }

    // Get system theme preference
    getSystemPreference() {
        return this.mediaQuery.matches ? 'dark' : 'light';
    }

    // Toggle between themes
    toggle() {
        const currentResolved = this.resolveTheme(this.currentTheme);
        const nextTheme = currentResolved === 'dark' ? 'light' : 'dark';
        
        this.apply(nextTheme);
        
        // Show notification
        const themeConfig = this.themes[nextTheme];
        this.app.ui.showToast(
            `Tema beralih ke ${themeConfig.name}`,
            themeConfig.icon,
            'bg-blue-500'
        );
    }

    // Cycle through all themes (light -> dark -> auto)
    cycle() {
        const themeOrder = ['light', 'dark', 'auto'];
        const currentIndex = themeOrder.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        const nextTheme = themeOrder[nextIndex];
        
        this.apply(nextTheme);
        
        const themeConfig = this.themes[nextTheme];
        this.app.ui.showToast(
            `Tema: ${themeConfig.name} - ${themeConfig.description}`,
            themeConfig.icon,
            'bg-blue-500'
        );
    }

    // Update theme toggle icons
    updateThemeIcons(resolvedTheme) {
        const { themeIcons } = this.app.DOMElements;
        
        if (themeIcons.light && themeIcons.dark) {
            if (resolvedTheme === 'dark') {
                themeIcons.light.style.display = 'none';
                themeIcons.dark.style.display = 'inline-block';
            } else {
                themeIcons.light.style.display = 'inline-block';
                themeIcons.dark.style.display = 'none';
            }
        }
        
        // Update button tooltip
        const themeButton = this.app.DOMElements.buttons.themeToggle;
        if (themeButton) {
            const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
            const nextConfig = this.themes[nextTheme];
            themeButton.setAttribute('title', `Beralih ke mode ${nextConfig.name}`);
            themeButton.setAttribute('aria-label', `Beralih ke mode ${nextConfig.name}`);
        }
    }

    // Update meta theme color for mobile browsers
    updateMetaThemeColor(theme) {
        let themeColor = '#f9fafb'; // Light theme default
        
        if (theme === 'dark') {
            themeColor = '#0d1117'; // Dark theme default
        }
        
        // Update or create meta theme-color tag
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = themeColor;
        
        // Update status bar style for PWA
        let metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (!metaStatusBar) {
            metaStatusBar = document.createElement('meta');
            metaStatusBar.name = 'apple-mobile-web-app-status-bar-style';
            document.head.appendChild(metaStatusBar);
        }
        metaStatusBar.content = theme === 'dark' ? 'black-translucent' : 'default';
    }

    // Setup media query listener for auto theme
    setupMediaQueryListener() {
        this.mediaQuery.addEventListener('change', (e) => {
            if (this.currentTheme === 'auto') {
                this.apply('auto');
                
                const newTheme = e.matches ? 'dark' : 'light';
                this.app.ui.showToast(
                    `Tema otomatis beralih ke ${this.themes[newTheme].name}`,
                    'fas fa-adjust',
                    'bg-blue-500'
                );
            }
        });
    }

    // Trigger theme change event
    triggerThemeChangeEvent(theme) {
        const event = new CustomEvent('themechange', {
            detail: {
                theme,
                previousTheme: this.previousTheme,
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
        this.previousTheme = theme;
    }

    // Get current theme info
    getCurrentTheme() {
        const resolved = this.resolveTheme(this.currentTheme);
        return {
            current: this.currentTheme,
            resolved,
            config: this.themes[resolved],
            isAuto: this.currentTheme === 'auto',
            isSystemDark: this.getSystemPreference() === 'dark'
        };
    }

    // Get all available themes
    getAvailableThemes() {
        return Object.entries(this.themes).map(([key, config]) => ({
            key,
            ...config,
            isCurrent: key === this.currentTheme,
            isResolved: key === this.resolveTheme(this.currentTheme)
        }));
    }

    // Check if dark mode is active
    isDarkMode() {
        return this.resolveTheme(this.currentTheme) === 'dark';
    }

    // Check if light mode is active
    isLightMode() {
        return this.resolveTheme(this.currentTheme) === 'light';
    }

    // Check if auto mode is enabled
    isAutoMode() {
        return this.currentTheme === 'auto';
    }

    // Schedule theme change (e.g., for automatic day/night switching)
    scheduleThemeChange(hour, theme) {
        const now = new Date();
        const scheduled = new Date();
        scheduled.setHours(hour, 0, 0, 0);
        
        // If the time has passed today, schedule for tomorrow
        if (scheduled <= now) {
            scheduled.setDate(scheduled.getDate() + 1);
        }
        
        const timeout = scheduled.getTime() - now.getTime();
        
        setTimeout(() => {
            this.apply(theme);
            this.app.ui.showToast(
                `Tema otomatis beralih ke ${this.themes[theme].name}`,
                this.themes[theme].icon,
                'bg-blue-500'
            );
            
            // Schedule next change
            this.scheduleThemeChange(hour, theme);
        }, timeout);
        
        return scheduled;
    }

    // Get theme statistics
    getThemeStats() {
        const usage = this.app.utils.storage.get('themeUsage', {});
        const currentTheme = this.resolveTheme(this.currentTheme);
        
        return {
            currentTheme,
            totalSwitches: usage.totalSwitches || 0,
            mostUsed: usage.mostUsed || 'light',
            usageByTheme: usage.byTheme || { light: 0, dark: 0 },
            lastChanged: usage.lastChanged || null
        };
    }

    // Track theme usage
    trackUsage(theme) {
        const usage = this.app.utils.storage.get('themeUsage', {
            totalSwitches: 0,
            byTheme: { light: 0, dark: 0 },
            mostUsed: 'light',
            lastChanged: null
        });
        
        usage.totalSwitches++;
        usage.byTheme[theme] = (usage.byTheme[theme] || 0) + 1;
        usage.lastChanged = new Date().toISOString();
        
        // Update most used
        usage.mostUsed = Object.entries(usage.byTheme)
            .reduce((a, b) => usage.byTheme[a[0]] > usage.byTheme[b[0]] ? a : b)[0];
        
        this.app.utils.storage.set('themeUsage', usage);
    }

    // Apply theme with transition
    applyWithTransition(theme, duration = 300) {
        // Add transition class
        document.documentElement.style.transition = `background-color ${duration}ms ease, color ${duration}ms ease`;
        
        // Apply theme
        this.apply(theme);
        
        // Remove transition after animation
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, duration);
    }

    // Get theme-appropriate colors
    getThemeColors(theme = null) {
        const targetTheme = this.resolveTheme(theme || this.currentTheme);
        
        const colors = {
            light: {
                primary: '#3b82f6',
                background: '#f9fafb',
                surface: '#ffffff',
                text: '#1f2937',
                textMuted: '#6b7280',
                border: '#e5e7eb'
            },
            dark: {
                primary: '#60a5fa',
                background: '#0d1117',
                surface: '#1f2937',
                text: '#f9fafb',
                textMuted: '#9ca3af',
                border: '#374151'
            }
        };
        
        return colors[targetTheme];
    }

    // Save theme preference
    save(theme = null) {
        try {
            const themeToSave = theme || this.currentTheme;
            this.app.utils.storage.set(this.storageKey, {
                theme: themeToSave,
                savedAt: new Date().toISOString()
            });
            
            // Track usage
            this.trackUsage(this.resolveTheme(themeToSave));
            
            return true;
        } catch (error) {
            console.error('Failed to save theme:', error);
            return false;
        }
    }

    // Load theme preference
    load() {
        try {
            const saved = this.app.utils.storage.get(this.storageKey);
            
            if (saved && saved.theme) {
                return saved.theme;
            }
            
            // Default to system preference
            return 'auto';
        } catch (error) {
            console.error('Failed to load theme:', error);
            return 'auto';
        }
    }

    // Reset theme to default
    reset() {
        this.apply('auto');
        this.app.utils.storage.remove(this.storageKey);
        this.app.ui.showToast(
            'Tema direset ke pengaturan sistem',
            'fas fa-refresh',
            'bg-blue-500'
        );
    }

    // Export theme settings
    exportSettings() {
        const settings = {
            currentTheme: this.currentTheme,
            themeStats: this.getThemeStats(),
            exportedAt: new Date().toISOString()
        };
        
        return JSON.stringify(settings, null, 2);
    }

    // Import theme settings
    importSettings(settingsString) {
        try {
            const settings = JSON.parse(settingsString);
            
            if (settings.currentTheme && this.themes[settings.currentTheme]) {
                this.apply(settings.currentTheme);
                this.app.ui.showSuccess('Pengaturan tema berhasil diimpor.');
                return true;
            } else {
                throw new Error('Invalid theme settings');
            }
        } catch (error) {
            this.app.ui.showError('Gagal mengimpor pengaturan tema.');
            return false;
        }
    }

    // Initialize theme system
    init() {
        const savedTheme = this.load();
        this.apply(savedTheme);
        
        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Log initialization
        console.log('Theme system initialized:', this.getCurrentTheme());
    }

    // Setup keyboard shortcuts for theme switching
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + T for theme toggle
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggle();
            }
            
            // Ctrl/Cmd + Shift + A for auto theme
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.apply('auto');
                this.app.ui.showToast(
                    'Tema beralih ke mode otomatis',
                    'fas fa-adjust',
                    'bg-blue-500'
                );
            }
        });
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}