// Cart Management - Handles shopping cart functionality
class CartManager {
    constructor(app) {
        this.app = app;
        this.storageKey = 'dmazAlyxersCart';
        this.discountCodes = {
            'DMAZALYXERS10': { rate: 0.10, description: '10% discount untuk semua produk' },
            'DMAZYT1B': { rate: 0, description: 'YouTube Premium seharga Rp1.000', productSpecific: 1 },
            'NEWYEAR2025': { rate: 0.15, description: '15% discount tahun baru', minAmount: 50000 }
        };
    }

    // Add item to cart
    add(item, startElement = null) {
        try {
            const state = this.app.getState();
            const existingItemIndex = state.cart.findIndex(i => 
                i.productId === item.productId && 
                i.variant === item.variant && 
                i.notes === item.notes &&
                i.couponUsed === item.couponUsed
            );

            if (existingItemIndex !== -1) {
                // Update existing item quantity
                const updatedCart = [...state.cart];
                updatedCart[existingItemIndex].quantity += item.quantity;
                this.app.updateState({ cart: updatedCart });
                this.app.ui.showSuccess(`Jumlah "${item.name}" diperbarui menjadi ${updatedCart[existingItemIndex].quantity}.`);
            } else {
                // Add new item
                const newCart = [...state.cart, {
                    ...item,
                    id: this.generateCartItemId(),
                    addedAt: new Date().toISOString()
                }];
                this.app.updateState({ cart: newCart });
                this.app.ui.showSuccess(`"${item.name}" ditambahkan ke keranjang.`);
            }

            // Animate to cart
            if (startElement) {
                this.app.ui.flyToCartAnimation(startElement);
            }

            this.save();
            this.app.ui.updateCartBadge();
            
            return true;
        } catch (error) {
            this.app.utils.handleError(error, 'Cart.add');
            return false;
        }
    }

    // Remove item from cart
    remove(itemId) {
        try {
            const state = this.app.getState();
            const itemIndex = state.cart.findIndex(item => item.id === itemId);
            
            if (itemIndex === -1) {
                this.app.ui.showError('Item tidak ditemukan di keranjang.');
                return false;
            }

            const removedItem = state.cart[itemIndex];
            const newCart = state.cart.filter(item => item.id !== itemId);
            
            this.app.updateState({ cart: newCart });
            this.save();
            this.app.ui.updateCartBadge();
            this.app.ui.showSuccess(`"${removedItem.name}" dihapus dari keranjang.`);
            
            return true;
        } catch (error) {
            this.app.utils.handleError(error, 'Cart.remove');
            return false;
        }
    }

    // Update item quantity
    updateQuantity(itemId, newQuantity) {
        try {
            if (newQuantity < 1) {
                return this.remove(itemId);
            }

            const state = this.app.getState();
            const updatedCart = state.cart.map(item => 
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            );
            
            this.app.updateState({ cart: updatedCart });
            this.save();
            this.app.ui.updateCartBadge();
            
            return true;
        } catch (error) {
            this.app.utils.handleError(error, 'Cart.updateQuantity');
            return false;
        }
    }

    // Clear entire cart
    clear() {
        try {
            this.app.updateState({ 
                cart: [],
                discount: { code: null, rate: 0, description: '' }
            });
            this.save();
            this.app.ui.updateCartBadge();
            this.app.ui.showSuccess('Keranjang berhasil dikosongkan.');
            
            return true;
        } catch (error) {
            this.app.utils.handleError(error, 'Cart.clear');
            return false;
        }
    }

    // Apply discount/coupon
    applyCoupon(code) {
        try {
            const normalizedCode = code.toUpperCase().trim();
            const discount = this.discountCodes[normalizedCode];
            
            if (!discount) {
                this.app.ui.showError('Kode kupon tidak valid atau sudah expired.');
                return false;
            }

            const state = this.app.getState();
            const subtotal = this.getSubtotal();

            // Check minimum amount requirement
            if (discount.minAmount && subtotal < discount.minAmount) {
                this.app.ui.showError(`Minimum belanja ${this.app.utils.formatPrice(discount.minAmount)} untuk menggunakan kupon ini.`);
                return false;
            }

            // Check product-specific coupon
            if (discount.productSpecific) {
                const hasProduct = state.cart.some(item => item.productId === discount.productSpecific);
                if (!hasProduct) {
                    this.app.ui.showError('Kupon ini hanya berlaku untuk produk tertentu yang tidak ada di keranjang Anda.');
                    return false;
                }
            }

            this.app.updateState({
                discount: {
                    code: normalizedCode,
                    rate: discount.rate,
                    description: discount.description
                }
            });

            this.save();
            this.app.ui.showSuccess(`Kupon "${normalizedCode}" berhasil diterapkan! ${discount.description}`);
            
            return true;
        } catch (error) {
            this.app.utils.handleError(error, 'Cart.applyCoupon');
            return false;
        }
    }

    // Remove discount
    removeDiscount() {
        try {
            this.app.updateState({
                discount: { code: null, rate: 0, description: '' }
            });
            this.save();
            this.app.ui.showSuccess('Kupon berhasil dihapus.');
            
            return true;
        } catch (error) {
            this.app.utils.handleError(error, 'Cart.removeDiscount');
            return false;
        }
    }

    // Apply modal-specific coupon
    applyModalCoupon(productId, code, originalPrice) {
        try {
            const normalizedCode = code.toUpperCase().trim();
            
            // Special handling for YouTube 1K coupon
            if (normalizedCode === 'DMAZYT1B' && productId === 1) {
                return {
                    success: true,
                    newPrice: 1000,
                    message: 'Kupon YouTube Rp1.000 berhasil diterapkan!'
                };
            }

            // Check general discount codes
            const discount = this.discountCodes[normalizedCode];
            if (discount && discount.rate > 0) {
                const discountAmount = originalPrice * discount.rate;
                const newPrice = originalPrice - discountAmount;
                
                return {
                    success: true,
                    newPrice: Math.max(newPrice, 1000), // Minimum price
                    message: `Kupon "${normalizedCode}" berhasil! Hemat ${this.app.utils.formatPrice(discountAmount)}`
                };
            }

            return {
                success: false,
                message: 'Kode kupon tidak valid untuk produk ini.'
            };
        } catch (error) {
            this.app.utils.handleError(error, 'Cart.applyModalCoupon');
            return {
                success: false,
                message: 'Terjadi kesalahan saat menerapkan kupon.'
            };
        }
    }

    // Get cart statistics
    getStats() {
        const state = this.app.getState();
        const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = this.getSubtotal();
        const discountAmount = this.getDiscountAmount();
        const total = subtotal - discountAmount;

        return {
            itemCount: state.cart.length,
            totalItems,
            subtotal,
            discountAmount,
            total,
            hasDiscount: state.discount.code !== null
        };
    }

    // Get subtotal (before discount)
    getSubtotal() {
        const state = this.app.getState();
        return state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Get discount amount
    getDiscountAmount() {
        const state = this.app.getState();
        const subtotal = this.getSubtotal();
        return subtotal * (state.discount.rate || 0);
    }

    // Get total (after discount)
    getTotal() {
        return this.getSubtotal() - this.getDiscountAmount();
    }

    // Get cart items by category
    getItemsByCategory() {
        const state = this.app.getState();
        const categories = {};
        
        state.cart.forEach(item => {
            const product = this.app.products.getProductById(item.productId);
            const category = product ? product.category : 'unknown';
            
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(item);
        });
        
        return categories;
    }

    // Check if cart has specific product
    hasProduct(productId) {
        const state = this.app.getState();
        return state.cart.some(item => item.productId === productId);
    }

    // Get item count for specific product
    getProductQuantity(productId) {
        const state = this.app.getState();
        return state.cart
            .filter(item => item.productId === productId)
            .reduce((sum, item) => sum + item.quantity, 0);
    }

    // Validate cart before checkout
    validateCart() {
        const state = this.app.getState();
        const errors = [];

        if (state.cart.length === 0) {
            errors.push('Keranjang kosong. Tambahkan produk terlebih dahulu.');
        }

        // Check stock availability (simulated)
        state.cart.forEach(item => {
            const product = this.app.products.getProductById(item.productId);
            if (!product) {
                errors.push(`Produk "${item.name}" tidak ditemukan.`);
            }
        });

        // Check minimum order amount
        const total = this.getTotal();
        const minimumOrder = 5000;
        if (total < minimumOrder) {
            errors.push(`Minimum pembelian ${this.app.utils.formatPrice(minimumOrder)}.`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Get recommended products based on cart
    getRecommendations() {
        const state = this.app.getState();
        const cartCategories = [...new Set(state.cart.map(item => {
            const product = this.app.products.getProductById(item.productId);
            return product ? product.category : null;
        }).filter(Boolean))];

        // Get products from same categories not in cart
        const allProducts = this.app.products.products;
        const cartProductIds = state.cart.map(item => item.productId);
        
        const recommendations = allProducts
            .filter(product => 
                cartCategories.includes(product.category) && 
                !cartProductIds.includes(product.id)
            )
            .slice(0, 3);

        return recommendations;
    }

    // Generate cart summary for sharing/checkout
    generateSummary() {
        const state = this.app.getState();
        const stats = this.getStats();
        
        let summary = `🛒 Ringkasan Pesanan\n`;
        summary += `========================\n\n`;
        
        state.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            summary += `${index + 1}. ${item.name}\n`;
            summary += `   ${item.variant}\n`;
            summary += `   ${item.quantity} x ${this.app.utils.formatPrice(item.price)} = ${this.app.utils.formatPrice(itemTotal)}\n`;
            if (item.notes) {
                summary += `   Catatan: ${item.notes}\n`;
            }
            if (item.couponUsed) {
                summary += `   Kupon: ${item.couponUsed}\n`;
            }
            summary += `\n`;
        });
        
        summary += `------------------------\n`;
        summary += `Subtotal: ${this.app.utils.formatPrice(stats.subtotal)}\n`;
        
        if (stats.hasDiscount) {
            summary += `Diskon (${state.discount.code}): -${this.app.utils.formatPrice(stats.discountAmount)}\n`;
        }
        
        summary += `TOTAL: ${this.app.utils.formatPrice(stats.total)}\n`;
        summary += `========================`;
        
        return summary;
    }

    // Save cart to localStorage
    save() {
        try {
            const state = this.app.getState();
            const cartData = {
                cart: state.cart,
                discount: state.discount,
                savedAt: new Date().toISOString()
            };
            
            this.app.utils.storage.set(this.storageKey, cartData);
            return true;
        } catch (error) {
            console.error('Failed to save cart:', error);
            return false;
        }
    }

    // Load cart from localStorage
    load() {
        try {
            const cartData = this.app.utils.storage.get(this.storageKey, {
                cart: [],
                discount: { code: null, rate: 0, description: '' }
            });
            
            // Validate loaded data
            if (Array.isArray(cartData.cart)) {
                this.app.updateState({
                    cart: cartData.cart,
                    discount: cartData.discount || { code: null, rate: 0, description: '' }
                });
            }
            
            this.app.ui.updateCartBadge();
            return true;
        } catch (error) {
            console.error('Failed to load cart:', error);
            this.app.updateState({
                cart: [],
                discount: { code: null, rate: 0, description: '' }
            });
            return false;
        }
    }

    // Generate unique cart item ID
    generateCartItemId() {
        return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get cart expiry information
    getCartExpiry() {
        const state = this.app.getState();
        if (state.cart.length === 0) return null;
        
        const oldestItem = state.cart.reduce((oldest, item) => {
            const itemDate = new Date(item.addedAt || Date.now());
            const oldestDate = new Date(oldest.addedAt || Date.now());
            return itemDate < oldestDate ? item : oldest;
        });
        
        const addedDate = new Date(oldestItem.addedAt || Date.now());
        const expiryDate = new Date(addedDate.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
        const now = new Date();
        
        return {
            expiryDate,
            isExpired: now > expiryDate,
            timeLeft: expiryDate.getTime() - now.getTime()
        };
    }

    // Auto-cleanup expired items
    cleanupExpiredItems() {
        const expiry = this.getCartExpiry();
        if (expiry && expiry.isExpired) {
            this.clear();
            this.app.ui.showToast(
                'Keranjang dibersihkan karena sudah lebih dari 24 jam.',
                'fa-clock',
                'bg-orange-500'
            );
        }
    }

    // Export cart data
    exportCart() {
        const state = this.app.getState();
        const exportData = {
            cart: state.cart,
            discount: state.discount,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    // Import cart data
    importCart(cartDataString) {
        try {
            const cartData = JSON.parse(cartDataString);
            
            if (!cartData.cart || !Array.isArray(cartData.cart)) {
                throw new Error('Format data tidak valid');
            }
            
            this.app.updateState({
                cart: cartData.cart,
                discount: cartData.discount || { code: null, rate: 0, description: '' }
            });
            
            this.save();
            this.app.ui.updateCartBadge();
            this.app.ui.showSuccess('Keranjang berhasil diimpor.');
            
            return true;
        } catch (error) {
            this.app.ui.showError('Gagal mengimpor keranjang. Format data tidak valid.');
            return false;
        }
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}