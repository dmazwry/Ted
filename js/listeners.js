// Event Listeners Management - Handles all user interactions and events
class EventListeners {
    constructor(app) {
        this.app = app;
        this.debounceTimers = new Map();
        this.touchStartY = 0;
        this.isScrolling = false;
    }

    // Setup all event listeners
    setup() {
        this.setupDocumentListeners();
        this.setupHeaderListeners();
        this.setupProductListeners();
        this.setupModalListeners();
        this.setupCartListeners();
        this.setupSearchListeners();
        this.setupKeyboardShortcuts();
        this.setupScrollListeners();
        this.setupTouchListeners();
        this.setupVisibilityListeners();
        this.setupErrorHandlers();
    }

    // Setup document-level listeners
    setupDocumentListeners() {
        // Main click handler with event delegation
        document.body.addEventListener('click', this.handleBodyClick.bind(this));
        
        // Form submission prevention
        document.addEventListener('submit', (e) => {
            e.preventDefault();
        });
        
        // Context menu handling for better UX
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.product-card img') || e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
            }
        });
        
        // Prevent drag on images
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        });
        
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.app.ui.renderAll();
            }, 500);
        });
    }

    // Setup header-related listeners
    setupHeaderListeners() {
        // Theme toggle
        this.app.DOMElements.buttons.themeToggle?.addEventListener('click', () => {
            this.app.theme.toggle();
        });
        
        // Cart button
        this.app.DOMElements.buttons.openCart?.addEventListener('click', () => {
            this.renderCartModal();
        });
        
        // Sort control
        this.app.DOMElements.sortControl?.addEventListener('change', (e) => {
            const state = this.app.getState();
            this.app.updateState({
                filter: { ...state.filter, sort: e.target.value }
            });
            this.app.ui.renderProducts();
        });
    }

    // Setup product-related listeners
    setupProductListeners() {
        // Category tabs delegation is handled in handleBodyClick
        
        // Product grid click handling is handled in handleBodyClick
        
        // Auto-refresh products every 5 minutes
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.app.ui.startCountdownTimers();
            }
        }, 5 * 60 * 1000);
    }

    // Setup modal-related listeners
    setupModalListeners() {
        // Modal backdrop clicks
        Object.values(this.app.DOMElements.modals).forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.app.ui.closeModal(modal);
                }
            });
        });
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.app.ui.closeModal(activeModal);
                }
            }
        });
        
        // Modal quantity controls
        this.setupModalQuantityControls();
        
        // Modal variant selection
        this.setupModalVariantControls();
        
        // Modal coupon application
        this.setupModalCouponControls();
    }

    // Setup modal quantity controls
    setupModalQuantityControls() {
        const addModal = this.app.DOMElements.modals.add;
        
        addModal.addEventListener('click', (e) => {
            if (e.target.id === 'decreaseQty') {
                const qtyInput = addModal.querySelector('#modalQuantity');
                const currentQty = parseInt(qtyInput.value);
                if (currentQty > 1) {
                    qtyInput.value = currentQty - 1;
                    this.updateModalTotal();
                }
            }
            
            if (e.target.id === 'increaseQty') {
                const qtyInput = addModal.querySelector('#modalQuantity');
                qtyInput.value = parseInt(qtyInput.value) + 1;
                this.updateModalTotal();
            }
        });
        
        // Direct quantity input
        addModal.addEventListener('input', (e) => {
            if (e.target.id === 'modalQuantity') {
                let value = parseInt(e.target.value) || 1;
                if (value < 1) value = 1;
                if (value > 99) value = 99;
                e.target.value = value;
                this.updateModalTotal();
            }
        });
    }

    // Setup modal variant controls
    setupModalVariantControls() {
        const addModal = this.app.DOMElements.modals.add;
        
        addModal.addEventListener('change', (e) => {
            if (e.target.id === 'modalVariantSelect') {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const price = parseFloat(selectedOption.value);
                
                // Reset coupon when variant changes
                addModal.dataset.originalPrice = price;
                addModal.dataset.currentPrice = price;
                addModal.dataset.couponApplied = 'false';
                
                this.updateModalTotal();
            }
        });
    }

    // Setup modal coupon controls
    setupModalCouponControls() {
        const addModal = this.app.DOMElements.modals.add;
        
        addModal.addEventListener('click', (e) => {
            if (e.target.id === 'modalApplyCouponBtn') {
                this.handleModalCouponApplication();
            }
        });
        
        // Enter key on coupon input
        addModal.addEventListener('keydown', (e) => {
            if (e.target.id === 'modalCouponInput' && e.key === 'Enter') {
                e.preventDefault();
                this.handleModalCouponApplication();
            }
        });
    }

    // Handle modal coupon application
    handleModalCouponApplication() {
        const modal = this.app.DOMElements.modals.add;
        const couponInput = modal.querySelector('#modalCouponInput');
        const code = couponInput.value.trim();
        
        if (!code) {
            this.app.ui.showError('Masukkan kode kupon terlebih dahulu.');
            return;
        }
        
        const productId = parseInt(modal.dataset.productId);
        const originalPrice = parseFloat(modal.dataset.originalPrice);
        
        const result = this.app.cart.applyModalCoupon(productId, code, originalPrice);
        
        if (result.success) {
            modal.dataset.currentPrice = result.newPrice;
            modal.dataset.couponApplied = code;
            this.app.ui.showSuccess(result.message);
            couponInput.value = '';
        } else {
            this.app.ui.showError(result.message);
        }
        
        this.updateModalTotal();
    }

    // Update modal total price
    updateModalTotal() {
        const modal = this.app.DOMElements.modals.add;
        const totalPriceEl = modal.querySelector('#modalTotalPrice');
        const quantityInput = modal.querySelector('#modalQuantity');
        
        if (!totalPriceEl || !quantityInput) return;
        
        const price = parseFloat(modal.dataset.currentPrice);
        const quantity = parseInt(quantityInput.value);
        const total = price * quantity;
        
        totalPriceEl.textContent = this.app.utils.formatPrice(total);
    }

    // Setup cart-related listeners
    setupCartListeners() {
        const cartModal = this.app.DOMElements.modals.cart;
        
        // Cart quantity updates
        cartModal.addEventListener('input', (e) => {
            if (e.target.classList.contains('cart-qty-input')) {
                const itemId = e.target.dataset.itemId;
                const newQuantity = parseInt(e.target.value) || 1;
                
                this.debounce('updateCartQty', () => {
                    this.app.cart.updateQuantity(itemId, newQuantity);
                    this.renderCartModal();
                }, 500);
            }
        });
        
        // Remove item buttons
        cartModal.addEventListener('click', (e) => {
            if (e.target.closest('.remove-cart-item')) {
                const itemId = e.target.closest('.remove-cart-item').dataset.itemId;
                this.app.cart.remove(itemId);
                this.renderCartModal();
            }
        });
    }

    // Setup search-related listeners
    setupSearchListeners() {
        const searchInput = this.app.DOMElements.searchInput;
        
        if (searchInput) {
            // Real-time search with debouncing
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                
                this.debounce('search', () => {
                    const state = this.app.getState();
                    this.app.updateState({
                        filter: { ...state.filter, search: query }
                    });
                    this.app.ui.renderProducts();
                }, 300);
            });
            
            // Clear search on escape
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.target.value = '';
                    const state = this.app.getState();
                    this.app.updateState({
                        filter: { ...state.filter, search: '' }
                    });
                    this.app.ui.renderProducts();
                }
            });
            
            // Focus management
            searchInput.addEventListener('focus', () => {
                searchInput.parentElement.classList.add('focused');
            });
            
            searchInput.addEventListener('blur', () => {
                searchInput.parentElement.classList.remove('focused');
            });
        }
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Search shortcut (Ctrl/Cmd + K)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.app.DOMElements.searchInput?.focus();
            }
            
            // Cart shortcut (Ctrl/Cmd + Shift + C)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.renderCartModal();
            }
            
            // Category shortcuts (1-5)
            if (['1', '2', '3', '4', '5'].includes(e.key)) {
                const categories = this.app.products.getCategories();
                const categoryIndex = parseInt(e.key) - 1;
                
                if (categories[categoryIndex]) {
                    const state = this.app.getState();
                    this.app.updateState({
                        filter: { ...state.filter, category: categories[categoryIndex] }
                    });
                    this.app.ui.renderAll();
                    this.app.ui.renderCategories();
                }
            }
        });
    }

    // Setup scroll-related listeners
    setupScrollListeners() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // Handle scroll events
    handleScroll() {
        const scrollTop = window.pageYOffset;
        const header = this.app.DOMElements.mainHeader;
        
        // Header scroll effect
        if (header) {
            header.classList.toggle('scrolled', scrollTop > 50);
        }
        
        // Show/hide scroll to top button
        this.toggleScrollToTopButton(scrollTop > 300);
        
        // Infinite scroll for products (if needed)
        this.handleInfiniteScroll();
    }

    // Toggle scroll to top button
    toggleScrollToTopButton(show) {
        let scrollBtn = document.getElementById('scrollToTop');
        
        if (show && !scrollBtn) {
            scrollBtn = document.createElement('button');
            scrollBtn.id = 'scrollToTop';
            scrollBtn.className = 'fixed bottom-24 right-4 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 z-20 flex items-center justify-center';
            scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            scrollBtn.setAttribute('aria-label', 'Scroll to top');
            
            scrollBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            document.body.appendChild(scrollBtn);
        } else if (!show && scrollBtn) {
            scrollBtn.remove();
        }
    }

    // Handle infinite scroll
    handleInfiniteScroll() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // If user scrolled to bottom 200px
        if (scrollTop + windowHeight >= documentHeight - 200) {
            // Could implement loading more products here if needed
        }
    }

    // Setup touch-related listeners for mobile
    setupTouchListeners() {
        // Swipe gestures for navigation
        document.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (Math.abs(e.touches[0].clientY - this.touchStartY) > 50) {
                this.isScrolling = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            this.isScrolling = false;
        }, { passive: true });
        
        // Pull to refresh
        this.setupPullToRefresh();
    }

    // Setup pull to refresh
    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = false;
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (window.scrollY === 0) {
                currentY = e.touches[0].clientY;
                const pullDistance = currentY - startY;
                
                if (pullDistance > 50 && !isPulling) {
                    isPulling = true;
                    this.showPullToRefreshIndicator();
                }
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (isPulling) {
                this.handlePullToRefresh();
                isPulling = false;
            }
        }, { passive: true });
    }

    // Show pull to refresh indicator
    showPullToRefreshIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'pullToRefresh';
        indicator.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm z-50';
        indicator.innerHTML = '<i class="fas fa-sync-alt animate-spin mr-2"></i>Tarik untuk refresh';
        
        document.body.appendChild(indicator);
        
        setTimeout(() => indicator.remove(), 1000);
    }

    // Handle pull to refresh
    handlePullToRefresh() {
        this.app.ui.showToast('Memperbarui data...', 'fa-sync-alt', 'bg-blue-500');
        
        // Simulate refresh
        setTimeout(() => {
            this.app.ui.renderAll();
            this.app.ui.showSuccess('Data berhasil diperbarui!');
        }, 1000);
    }

    // Setup visibility change listeners
    setupVisibilityListeners() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Resume timers and refresh data
                this.app.ui.startCountdownTimers();
                
                // Check for cart expiry
                this.app.cart.cleanupExpiredItems();
            }
        });
        
        // Page unload cleanup
        window.addEventListener('beforeunload', () => {
            this.app.clearCountdownIntervals();
        });
    }

    // Setup error handlers
    setupErrorHandlers() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.app.ui.showError('Terjadi kesalahan. Silakan refresh halaman.');
        });
        
        // Unhandled promise rejection
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.app.ui.showError('Terjadi kesalahan jaringan. Silakan coba lagi.');
        });
    }

    // Main body click handler with event delegation
    handleBodyClick(e) {
        const target = e.target;
        
        // Product card clicks
        const productCard = target.closest('.product-card');
        if (productCard && !target.closest('.add-to-cart-btn')) {
            const productId = parseInt(productCard.dataset.id);
            const product = this.app.products.getProductById(productId);
            if (product) {
                this.app.ui.renderProductModal(product);
            }
        }
        
        // Add to cart button clicks
        if (target.closest('.add-to-cart-btn')) {
            const productCard = target.closest('.product-card');
            if (productCard) {
                const productId = parseInt(productCard.dataset.id);
                const product = this.app.products.getProductById(productId);
                if (product) {
                    this.app.ui.renderProductModal(product);
                }
            }
        }
        
        // Category tab clicks
        const categoryBtn = target.closest('.category-tab-btn');
        if (categoryBtn) {
            const category = categoryBtn.dataset.category;
            const state = this.app.getState();
            this.app.updateState({
                filter: { ...state.filter, category }
            });
            this.app.ui.renderAll();
            this.app.ui.renderCategories();
        }
        
        // Category direct link clicks
        const categoryDirectLink = target.closest('.category-direct-link');
        if (categoryDirectLink) {
            e.preventDefault();
            const category = categoryDirectLink.dataset.category;
            const state = this.app.getState();
            this.app.updateState({
                filter: { ...state.filter, category }
            });
            this.app.ui.renderAll();
            this.app.ui.renderCategories();
            this.app.utils.scrollToElement('#productGrid', 100);
        }
        
        // Modal button clicks
        this.handleModalButtons(target);
        
        // Close modal clicks
        if (target.closest('.close-modal-btn')) {
            const modal = target.closest('.modal');
            this.app.ui.closeModal(modal);
        }
    }

    // Handle modal button clicks
    handleModalButtons(target) {
        const modal = target.closest('.modal');
        if (!modal) return;
        
        // Add to cart from modal
        if (target.id === 'addToCartBtn') {
            this.handleAddToCartFromModal(modal);
        }
        
        // Direct order from modal
        if (target.id === 'directOrderBtn') {
            const productId = parseInt(modal.dataset.productId);
            this.app.checkout.processDirect(productId);
        }
        
        // Checkout from cart
        if (target.id === 'checkoutBtn') {
            this.app.checkout.processCart();
        }
        
        // Clear cart
        if (target.id === 'clearCartBtn') {
            if (confirm('Yakin ingin mengosongkan keranjang?')) {
                this.app.cart.clear();
                this.renderCartModal();
            }
        }
        
        // Apply coupon in cart
        if (target.id === 'applyCouponBtn') {
            const couponInput = modal.querySelector('#couponInput');
            const code = couponInput.value.trim();
            if (code) {
                this.app.cart.applyCoupon(code);
                this.renderCartModal();
                couponInput.value = '';
            }
        }
    }

    // Handle add to cart from modal
    handleAddToCartFromModal(modal) {
        const productId = parseInt(modal.dataset.productId);
        const product = this.app.products.getProductById(productId);
        
        if (!product) return;
        
        const variantSelect = modal.querySelector('#modalVariantSelect');
        const quantityInput = modal.querySelector('#modalQuantity');
        const notesInput = modal.querySelector('#modalNotes');
        
        const selectedOption = variantSelect.options[variantSelect.selectedIndex];
        const variantName = selectedOption.dataset.name;
        const price = parseFloat(modal.dataset.currentPrice);
        const quantity = parseInt(quantityInput.value);
        const notes = notesInput?.value.trim() || '';
        const couponUsed = modal.dataset.couponApplied !== 'false' ? modal.dataset.couponApplied : null;
        
        const cartItem = {
            productId: product.id,
            name: product.title,
            variant: variantName,
            price: price,
            quantity: quantity,
            notes: notes,
            couponUsed: couponUsed
        };
        
        const startElement = document.querySelector(`.product-card[data-id="${productId}"] img`);
        this.app.cart.add(cartItem, startElement);
        this.app.ui.closeModal(modal);
    }

    // Render cart modal
    renderCartModal() {
        const modal = this.app.DOMElements.modals.cart;
        const modalContent = modal.querySelector('.modal-content');
        const state = this.app.getState();
        const stats = this.app.cart.getStats();
        
        modalContent.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <i class="fas fa-shopping-cart text-blue-500 mr-2"></i>
                    Keranjang (${stats.totalItems})
                </h3>
                <button class="close-modal-btn text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="flex-grow overflow-y-auto mb-6 space-y-3">
                ${state.cart.length > 0 ? this.renderCartItems(state.cart) : this.renderEmptyCart()}
            </div>
            
            ${state.cart.length > 0 ? this.renderCartSummary(stats, state.discount) : ''}
        `;
        
        this.app.ui.openModal(modal);
    }

    // Render cart items
    renderCartItems(cartItems) {
        return cartItems.map((item, index) => {
            const itemTotal = item.price * item.quantity;
            
            return `
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div class="flex items-start gap-3">
                        <div class="flex-grow">
                            <h4 class="font-bold text-gray-900 dark:text-white">${item.name}</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${item.variant}</p>
                            ${item.notes ? `<p class="text-xs text-yellow-600 dark:text-yellow-400 mt-1 italic">Catatan: ${item.notes}</p>` : ''}
                            ${item.couponUsed ? `<p class="text-xs text-green-600 dark:text-green-400 mt-1">Kupon: ${item.couponUsed}</p>` : ''}
                            <p class="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">${this.app.utils.formatPrice(itemTotal)}</p>
                        </div>
                        <div class="flex flex-col items-end gap-2">
                            <div class="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    value="${item.quantity}" 
                                    min="1" 
                                    max="99"
                                    class="cart-qty-input w-16 text-center border border-gray-300 dark:border-gray-600 rounded-lg py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    data-item-id="${item.id}"
                                >
                                <button 
                                    class="remove-cart-item text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    data-item-id="${item.id}"
                                    aria-label="Hapus ${item.name}"
                                >
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${this.app.utils.formatPrice(item.price)} each</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render empty cart
    renderEmptyCart() {
        return `
            <div class="text-center py-12">
                <div class="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-full h-full">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H15M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.01" />
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Keranjang Kosong</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">Ayo, isi dengan produk favoritmu!</p>
                <button 
                    class="btn-primary px-6 py-3 rounded-xl close-modal-btn"
                >
                    <i class="fas fa-shopping-bag mr-2"></i>
                    Mulai Belanja
                </button>
            </div>
        `;
    }

    // Render cart summary
    renderCartSummary(stats, discount) {
        return `
            <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div class="mb-4">
                    <div class="flex gap-2">
                        <input 
                            type="text" 
                            id="couponInput" 
                            placeholder="Masukkan kode kupon"
                            class="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                        <button id="applyCouponBtn" class="btn-primary px-6 py-3 rounded-xl">
                            Terapkan
                        </button>
                    </div>
                </div>
                
                <div class="space-y-2 mb-4">
                    <div class="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Subtotal (${stats.totalItems} item)</span>
                        <span>${this.app.utils.formatPrice(stats.subtotal)}</span>
                    </div>
                    ${stats.hasDiscount ? `
                        <div class="flex justify-between text-green-600 dark:text-green-400">
                            <span>Diskon (${discount.code})</span>
                            <span>-${this.app.utils.formatPrice(stats.discountAmount)}</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span>Total</span>
                        <span>${this.app.utils.formatPrice(stats.total)}</span>
                    </div>
                </div>
                
                <div class="flex gap-3">
                    <button id="clearCartBtn" class="text-red-500 hover:text-red-700 text-sm font-medium">
                        <i class="fas fa-trash mr-1"></i>
                        Kosongkan
                    </button>
                    <button id="checkoutBtn" class="flex-1 btn-secondary py-4 rounded-xl">
                        <i class="fab fa-whatsapp mr-2"></i>
                        Checkout via WhatsApp
                    </button>
                </div>
            </div>
        `;
    }

    // Debounce utility
    debounce(key, func, delay) {
        clearTimeout(this.debounceTimers.get(key));
        this.debounceTimers.set(key, setTimeout(func, delay));
    }

    // Cleanup
    destroy() {
        // Clear all debounce timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
        
        // Remove scroll to top button if exists
        const scrollBtn = document.getElementById('scrollToTop');
        if (scrollBtn) scrollBtn.remove();
        
        // Clear intervals
        this.app.clearCountdownIntervals();
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventListeners;
}