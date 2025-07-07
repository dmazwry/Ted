// Main App Class - Entry point and state management
class DmazApp {
    constructor() {
        this.state = {
            products: [],
            cart: [],
            filter: { category: 'Semua', search: '', sort: 'default' },
            discount: { code: null, rate: 0 },
            countdownIntervals: []
        };

        this.DOMElements = {
            mainHeader: document.getElementById('main-header'),
            productGrid: document.getElementById('productGrid'),
            dealsSection: document.getElementById('dealsSection'),
            dealsGrid: document.getElementById('dealsGrid'),
            skeletonLoader: document.getElementById('skeleton-loader'),
            searchInput: document.getElementById('searchInput'),
            searchSuggestions: document.getElementById('product-suggestions'),
            sortControl: document.getElementById('sortControl'),
            noResultsEl: document.getElementById('no-results'),
            cartBadge: document.getElementById('cartBadge'),
            toastContainer: document.getElementById('toast-container'),
            modals: {
                add: document.getElementById('addToCartModal'),
                cart: document.getElementById('cartModal'),
            },
            buttons: {
                openCart: document.getElementById('openCartBtn'),
                themeToggle: document.getElementById('theme-toggle'),
            },
            categoryTabs: document.getElementById('categoryTabs'),
            themeIcons: {
                light: document.getElementById('theme-icon-light'),
                dark: document.getElementById('theme-icon-dark'),
            },
            testimonialContainer: document.getElementById('testimonialContainer'),
        };

        // Initialize components
        this.products = new ProductManager(this);
        this.ui = new UIManager(this);
        this.cart = new CartManager(this);
        this.theme = new ThemeManager(this);
        this.checkout = new CheckoutManager(this);
        this.listeners = new EventListeners(this);
        this.utils = new Utils(this);
    }

    // Initialize the application
    async init() {
        try {
            // Show loading state
            this.ui.showLoadingState();

            // Load saved theme and cart
            this.theme.apply(this.theme.load());
            this.cart.load();

            // Load products
            await this.products.loadProducts();

            // Initialize UI components
            this.ui.populateSearchDatalist();
            this.ui.renderCategories();
            this.ui.renderTestimonials();
            this.ui.setupHeroSlider();

            // Setup event listeners
            this.listeners.setup();

            // Show content with animation
            setTimeout(() => {
                this.ui.hideLoadingState();
                this.ui.renderAll();
                this.ui.animateElementsOnScroll();
            }, 800);

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.ui.showError('Gagal memuat aplikasi. Silakan refresh halaman.');
        }
    }

    // Get current state
    getState() {
        return this.state;
    }

    // Update state
    updateState(newState) {
        this.state = { ...this.state, ...newState };
    }

    // Clear countdown intervals
    clearCountdownIntervals() {
        this.state.countdownIntervals.forEach(interval => clearInterval(interval));
        this.state.countdownIntervals = [];
    }

    // Add countdown interval
    addCountdownInterval(interval) {
        this.state.countdownIntervals.push(interval);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.App = new DmazApp();
    window.App.init();
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DmazApp;
}