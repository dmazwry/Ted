// UI Management - Handles all interface rendering and interactions
class UIManager {
    constructor(app) {
        this.app = app;
        this.isLoading = false;
        this.currentModal = null;
        this.searchResultsCache = new Map();
        this.renderQueue = [];
        this.animationFrame = null;
    }

    // Show loading state
    showLoadingState() {
        this.isLoading = true;
        this.app.DOMElements.skeletonLoader.style.display = 'grid';
        this.app.DOMElements.productGrid.style.display = 'none';
        this.app.DOMElements.dealsSection.style.display = 'none';
        this.app.DOMElements.noResultsEl.classList.add('hidden');
    }

    // Hide loading state
    hideLoadingState() {
        this.isLoading = false;
        this.app.DOMElements.skeletonLoader.style.display = 'none';
        this.app.DOMElements.productGrid.style.display = 'grid';
    }

    // Show error message
    showError(message) {
        this.showToast(message, 'fa-exclamation-triangle', 'bg-red-500');
    }

    // Show success message
    showSuccess(message) {
        this.showToast(message, 'fa-check-circle', 'bg-green-500');
    }

    // Show toast notification
    showToast(message, icon = 'fa-check-circle', color = 'bg-green-500') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${color} text-white text-sm font-semibold p-4 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur-lg`;
        toast.innerHTML = `
            <i class="fas ${icon} text-lg"></i>
            <span>${message}</span>
            <button class="ml-auto text-white hover:text-gray-200" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.app.DOMElements.toastContainer.appendChild(toast);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    // Render all components
    renderAll() {
        this.renderProducts();
        this.renderDealsSection();
        this.renderCategories();
        this.renderTestimonials();
        this.updateCartBadge();
    }

    // Render products with enhanced UI
    renderProducts() {
        const { productGrid, noResultsEl } = this.app.DOMElements;
        const state = this.app.getState();
        
        // Clear previous render
        productGrid.innerHTML = '';
        
        // Filter products based on current state
        let productsToRender = this.app.products.filterProducts(state.filter);
        
        // Show/hide no results
        const hasResults = productsToRender.length > 0;
        noResultsEl.classList.toggle('hidden', hasResults);
        productGrid.classList.toggle('hidden', !hasResults);
        
        if (!hasResults) {
            this.renderNoResults();
            return;
        }

        // Render products with staggered animation
        productsToRender.forEach((product, index) => {
            const card = this.createProductCard(product, index);
            productGrid.appendChild(card);
        });

        // Animate cards
        this.animateProductCards();
    }

    // Create enhanced product card
    createProductCard(product, index) {
        const card = document.createElement('div');
        card.className = 'product-card will-change-transform animate-on-scroll';
        card.dataset.id = product.id;
        card.style.animationDelay = `${index * 50}ms`;
        
        // Generate badges
        const badges = this.generateProductBadges(product);
        
        // Generate rating stars
        const stars = this.generateStars(product.rating);
        
        // Calculate discount if applicable
        const discount = this.calculateDiscount(product);
        
        card.innerHTML = `
            ${badges}
            <div class="relative overflow-hidden rounded-t-xl group">
                <img 
                    src="${this.app.utils.getImageUrl(product)}" 
                    alt="${product.title}" 
                    class="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                ${discount ? `<div class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">-${discount}%</div>` : ''}
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <div class="flex-grow">
                    <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">${product.title}</h3>
                    <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div class="flex items-center gap-1">
                            ${stars}
                            <span class="font-semibold">${product.rating}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <i class="fas fa-box text-green-500"></i>
                            <span>${product.stock}</span>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">${product.description}</p>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex flex-col">
                        <span class="text-xs text-gray-500 dark:text-gray-400">Mulai dari</span>
                        <div class="flex items-center gap-2">
                            ${product.deal ? `<span class="text-sm line-through text-gray-400">${this.app.utils.formatPrice(product.deal.originalPrice)}</span>` : ''}
                            <span class="text-xl font-bold text-blue-600 dark:text-blue-400">${this.app.utils.formatPrice(product.variants[0].price)}</span>
                        </div>
                    </div>
                    <button 
                        class="add-to-cart-btn btn-primary"
                        aria-label="Tambah ${product.title} ke keranjang"
                        data-product-id="${product.id}"
                    >
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;

        // Add ripple effect on click
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-cart-btn')) {
                this.app.utils.createRippleEffect(card, e);
            }
        });

        return card;
    }

    // Generate product badges
    generateProductBadges(product) {
        const badges = [];
        
        if (product.deal) {
            badges.push(`<div class="product-badge deal">${product.deal.label}</div>`);
        } else if (product.isBestSeller) {
            badges.push('<div class="product-badge best-seller">Best Seller</div>');
        } else if (product.isNew) {
            badges.push('<div class="product-badge new">New</div>');
        }
        
        return badges.join('');
    }

    // Generate star rating
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const stars = [];
        
        for (let i = 0; i < fullStars; i++) {
            stars.push('<i class="fas fa-star text-yellow-400"></i>');
        }
        
        if (hasHalfStar) {
            stars.push('<i class="fas fa-star-half-alt text-yellow-400"></i>');
        }
        
        return stars.join('');
    }

    // Calculate discount percentage
    calculateDiscount(product) {
        if (!product.deal) return null;
        return Math.round(((product.deal.originalPrice - product.variants[0].price) / product.deal.originalPrice) * 100);
    }

    // Animate product cards
    animateProductCards() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 50);
        });
    }

    // Render no results state
    renderNoResults() {
        const { noResultsEl } = this.app.DOMElements;
        noResultsEl.innerHTML = `
            <div class="text-center py-16">
                <div class="w-32 h-32 mx-auto mb-6 opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-full h-full text-gray-400">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Oops! Produk tidak ditemukan</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">Coba gunakan kata kunci lain atau ubah filter pencarian.</p>
                <button 
                    class="btn-primary px-6 py-3 rounded-xl"
                    onclick="document.getElementById('searchInput').value = ''; App.updateState({filter: {...App.getState().filter, search: ''}}); App.ui.renderAll();"
                >
                    <i class="fas fa-refresh mr-2"></i>
                    Reset Pencarian
                </button>
            </div>
        `;
    }

    // Render deals section
    renderDealsSection() {
        const { dealsGrid, dealsSection } = this.app.DOMElements;
        const dealProducts = this.app.products.getDealProducts();
        
        if (dealProducts.length === 0) {
            dealsSection.style.display = 'none';
            return;
        }

        dealsSection.style.display = 'block';
        dealsGrid.innerHTML = '';

        dealProducts.forEach((product, index) => {
            const dealCard = this.createDealCard(product, index);
            dealsGrid.appendChild(dealCard);
        });

        this.startCountdownTimers();
    }

    // Create deal card
    createDealCard(product, index) {
        const card = document.createElement('div');
        card.className = 'product-card border-2 border-green-200 dark:border-green-800 animate-on-scroll';
        card.dataset.id = product.id;
        card.style.animationDelay = `${index * 100}ms`;
        
        const discount = this.calculateDiscount(product);
        
        card.innerHTML = `
            <div class="flex items-center gap-4 p-4">
                <div class="relative">
                    <img 
                        src="${this.app.utils.getImageUrl(product)}" 
                        alt="${product.title}" 
                        class="w-20 h-20 rounded-xl object-cover"
                        loading="lazy"
                    >
                    <div class="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">-${discount}%</div>
                </div>
                <div class="flex-grow">
                    <h4 class="font-bold text-lg text-gray-900 dark:text-white mb-1">${product.title}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${product.deal.label}</p>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-sm line-through text-gray-400">${this.app.utils.formatPrice(product.deal.originalPrice)}</span>
                            <span class="text-xl font-bold text-green-600 dark:text-green-400">${this.app.utils.formatPrice(product.variants[0].price)}</span>
                        </div>
                        <button 
                            class="add-to-cart-btn btn-secondary text-sm px-4 py-2"
                            data-product-id="${product.id}"
                        >
                            <i class="fas fa-plus mr-1"></i>
                            Ambil
                        </button>
                    </div>
                    <div class="deal-countdown-timer mt-2 text-xs text-gray-500 dark:text-gray-400" data-end-date="${product.deal.endDate}">
                        <i class="far fa-clock mr-1"></i>
                        <span class="countdown-text">Memuat...</span>
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    // Start countdown timers
    startCountdownTimers() {
        this.app.clearCountdownIntervals();
        
        document.querySelectorAll('.deal-countdown-timer').forEach(timerEl => {
            const endDate = new Date(timerEl.dataset.endDate).getTime();
            const textEl = timerEl.querySelector('.countdown-text');
            
            const updateTimer = () => {
                const timeDiff = this.app.utils.getTimeDifference(timerEl.dataset.endDate);
                
                if (!timeDiff) {
                    textEl.innerHTML = '<span class="font-bold text-red-500">Penawaran berakhir!</span>';
                    return;
                }
                
                textEl.innerHTML = `
                    Berakhir dalam: 
                    <span class="font-bold text-orange-600 dark:text-orange-400">${timeDiff.days}h ${timeDiff.hours}j ${timeDiff.minutes}m ${timeDiff.seconds}d</span>
                `;
            };
            
            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            this.app.addCountdownInterval(interval);
        });
    }

    // Render categories
    renderCategories() {
        const categories = this.app.products.getCategories();
        const { categoryTabs } = this.app.DOMElements;
        const currentCategory = this.app.getState().filter.category;
        
        categoryTabs.innerHTML = '';
        
        categories.forEach((category, index) => {
            const button = document.createElement('button');
            const isActive = currentCategory === category;
            
            button.className = `category-tab-btn ${isActive ? 'active' : ''}`;
            button.textContent = category;
            button.dataset.category = category;
            button.style.animationDelay = `${index * 50}ms`;
            
            // Add category icon
            const icon = this.getCategoryIcon(category);
            if (icon) {
                button.innerHTML = `<i class="${icon} mr-2"></i>${category}`;
            }
            
            categoryTabs.appendChild(button);
        });
    }

    // Get category icon
    getCategoryIcon(category) {
        const icons = {
            'Semua': 'fas fa-th-large',
            'app': 'fas fa-mobile-alt',
            'game': 'fas fa-gamepad',
            'streaming': 'fas fa-play-circle',
            'utility': 'fas fa-tools'
        };
        return icons[category] || 'fas fa-tag';
    }

    // Render testimonials
    renderTestimonials() {
        const container = this.app.DOMElements.testimonialContainer;
        if (!container) return;

        const testimonials = this.app.products.getRandomTestimonials(3);
        
        container.innerHTML = testimonials.map((testimonial, index) => `
            <div class="testimonial-card p-6 animate-on-scroll" style="animation-delay: ${index * 100}ms;">
                <div class="flex items-start gap-4 mb-4">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        ${testimonial.name.charAt(0)}
                    </div>
                    <div class="flex-grow">
                        <h4 class="font-bold text-gray-900 dark:text-white">${testimonial.name}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${testimonial.product}</p>
                    </div>
                    <div class="text-yellow-400">
                        ${this.generateStars(5)}
                    </div>
                </div>
                <blockquote class="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    "${testimonial.text}"
                </blockquote>
            </div>
        `).join('');
    }

    // Setup hero slider
    setupHeroSlider() {
        const heroSlider = new Swiper('.hero-slider', {
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            on: {
                slideChange: function() {
                    // Add entrance animation to slide content
                    const activeSlide = this.slides[this.activeIndex];
                    const content = activeSlide.querySelector('.slide-content');
                    if (content) {
                        content.style.animation = 'slideInUp 0.8s ease-out';
                    }
                }
            }
        });
    }

    // Populate search datalist
    populateSearchDatalist() {
        const datalist = this.app.DOMElements.searchSuggestions;
        const suggestions = this.app.products.getProductSuggestions();
        
        datalist.innerHTML = suggestions.map(s => 
            `<option value="${s.title}" data-category="${s.category}">${s.title}</option>`
        ).join('');
    }

    // Update cart badge
    updateCartBadge() {
        const state = this.app.getState();
        const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        this.app.DOMElements.cartBadge.textContent = totalItems;
        this.app.DOMElements.cartBadge.classList.toggle('scale-0', totalItems === 0);
        
        // Add pulse animation when updated
        if (totalItems > 0) {
            this.app.DOMElements.cartBadge.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                this.app.DOMElements.cartBadge.style.animation = '';
            }, 500);
        }
    }

    // Modal management
    openModal(modal) {
        if (this.currentModal) {
            this.closeModal(this.currentModal);
        }
        
        this.currentModal = modal;
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Focus management
        const firstFocusable = modal.querySelector('button, input, select, textarea');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            this.currentModal = null;
        }
        
        if (!document.querySelector('.modal.active')) {
            document.body.classList.remove('modal-open');
        }
    }

    // Animate elements on scroll
    animateElementsOnScroll() {
        this.app.utils.animateOnScroll();
    }

    // Fly to cart animation
    flyToCartAnimation(startElement) {
        if (!startElement) return;
        
        const flyingEl = startElement.cloneNode(true);
        const startRect = startElement.getBoundingClientRect();
        const cartRect = this.app.DOMElements.cartBadge.getBoundingClientRect();
        
        flyingEl.className = 'fixed top-0 left-0 w-16 h-16 rounded-lg object-cover pointer-events-none z-50 transition-all duration-700 ease-out';
        flyingEl.style.transform = `translate(${startRect.left}px, ${startRect.top}px)`;
        
        document.body.appendChild(flyingEl);
        
        requestAnimationFrame(() => {
            flyingEl.style.transform = `translate(${cartRect.left - 8}px, ${cartRect.top - 8}px) scale(0.2)`;
            flyingEl.style.opacity = '0';
        });
        
        setTimeout(() => {
            flyingEl.remove();
            this.updateCartBadge();
        }, 700);
    }

    // Enhanced search with real-time results
    handleSearch(query) {
        const state = this.app.getState();
        
        // Use debounced search for better performance
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.app.updateState({
                filter: { ...state.filter, search: query.toLowerCase() }
            });
            this.renderProducts();
        }, 300);
    }

    // Render product modal
    renderProductModal(product) {
        const modal = this.app.DOMElements.modals.add;
        const modalContent = modal.querySelector('.modal-content');
        
        modalContent.innerHTML = `
            <div class="relative">
                <button class="close-modal-btn absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="mb-6">
                    <img 
                        src="${this.app.utils.getImageUrl(product)}" 
                        alt="${product.title}" 
                        class="w-full h-48 object-cover rounded-xl mb-4"
                        loading="lazy"
                    >
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${product.title}</h2>
                    <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div class="flex items-center gap-1">
                            ${this.generateStars(product.rating)}
                            <span class="font-semibold">${product.rating}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <i class="fas fa-box text-green-500"></i>
                            <span>Stok: ${product.stock}</span>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pilih Varian
                        </label>
                        <select id="modalVariantSelect" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                            ${product.variants.map(v => `
                                <option value="${v.price}" data-name="${v.name}">
                                    ${v.name} - ${this.app.utils.formatPrice(v.price)}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Jumlah
                            </label>
                            <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                                <button id="decreaseQty" class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="text" id="modalQuantity" value="1" class="w-full text-center border-0 focus:ring-0 bg-transparent" readonly>
                                <button id="increaseQty" class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Total Harga
                            </label>
                            <div id="modalTotalPrice" class="text-2xl font-bold text-blue-600 dark:text-blue-400 py-3">
                                ${this.app.utils.formatPrice(product.variants[0].price)}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Catatan (Opsional)
                        </label>
                        <textarea 
                            id="modalNotes" 
                            rows="3" 
                            placeholder="Tambahkan catatan untuk pesanan Anda..."
                            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                        ></textarea>
                    </div>

                    <div class="border-t pt-4">
                        <div class="flex gap-2 mb-4">
                            <input 
                                type="text" 
                                id="modalCouponInput" 
                                placeholder="Masukkan kode kupon"
                                class="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                            <button id="modalApplyCouponBtn" class="btn-primary px-6 py-3 rounded-xl">
                                Terapkan
                            </button>
                        </div>
                    </div>

                    <div class="border-t pt-4">
                        <div class="flex gap-3">
                            <button id="addToCartBtn" class="flex-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold py-4 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                                <i class="fas fa-cart-plus mr-2"></i>
                                Tambah ke Keranjang
                            </button>
                            <button id="directOrderBtn" class="flex-1 btn-secondary py-4 rounded-xl">
                                <i class="fab fa-whatsapp mr-2"></i>
                                Pesan Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Store product data
        modal.dataset.productId = product.id;
        modal.dataset.originalPrice = product.variants[0].price;
        modal.dataset.currentPrice = product.variants[0].price;
        modal.dataset.couponApplied = 'false';

        this.setupModalEvents(modal);
        this.openModal(modal);
    }

    // Setup modal events
    setupModalEvents(modal) {
        const variantSelect = modal.querySelector('#modalVariantSelect');
        const quantityInput = modal.querySelector('#modalQuantity');
        const totalPriceEl = modal.querySelector('#modalTotalPrice');

        const updateTotal = () => {
            const price = parseFloat(modal.dataset.currentPrice);
            const quantity = parseInt(quantityInput.value);
            const total = price * quantity;
            totalPriceEl.textContent = this.app.utils.formatPrice(total);
        };

        variantSelect.addEventListener('change', () => {
            const selectedOption = variantSelect.options[variantSelect.selectedIndex];
            const price = parseFloat(selectedOption.value);
            modal.dataset.originalPrice = price;
            modal.dataset.currentPrice = price;
            modal.dataset.couponApplied = 'false';
            updateTotal();
        });

        updateTotal();
    }

    // Get device specific styles
    getDeviceStyles() {
        const deviceType = this.app.utils.getDeviceType();
        
        return {
            mobile: {
                cardColumns: 'grid-cols-1',
                padding: 'p-3',
                fontSize: 'text-sm'
            },
            tablet: {
                cardColumns: 'grid-cols-2',
                padding: 'p-4',
                fontSize: 'text-base'
            },
            desktop: {
                cardColumns: 'grid-cols-3',
                padding: 'p-6',
                fontSize: 'text-base'
            }
        }[deviceType];
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}