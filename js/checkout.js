// Checkout Management - Handles order processing and WhatsApp integration
class CheckoutManager {
    constructor(app) {
        this.app = app;
        this.whatsappNumber = "6289603659756";
        this.businessInfo = {
            name: "Dmaz Alyxers Premium",
            address: "Digital Store Indonesia",
            email: "admin@dmazalyxers.com",
            website: "https://dmazalyxers.com"
        };
        this.orderCounter = this.getOrderCounter();
    }

    // Process direct order from modal
    processDirect(productId) {
        try {
            const modal = this.app.DOMElements.modals.add;
            const product = this.app.products.getProductById(productId);
            
            if (!product) {
                this.app.ui.showError('Produk tidak ditemukan.');
                return false;
            }

            // Get form data
            const orderData = this.getModalOrderData(modal, product);
            
            // Validate order
            const validation = this.validateDirectOrder(orderData);
            if (!validation.isValid) {
                this.app.ui.showError(validation.errors[0]);
                return false;
            }

            // Generate order
            const order = this.generateOrder([orderData], true);
            
            // Send to WhatsApp
            this.sendToWhatsApp(order);
            
            // Close modal
            this.app.ui.closeModal(modal);
            
            // Show success
            this.app.ui.showSuccess('Pesanan dikirim ke WhatsApp. Silakan lanjutkan pembayaran dengan admin.');
            
            // Track order
            this.trackOrder(order);
            
            return true;
        } catch (error) {
            this.app.utils.handleError(error, 'Checkout.processDirect');
            return false;
        }
    }

    // Process cart checkout
    processCart() {
        try {
            const state = this.app.getState();
            
            if (state.cart.length === 0) {
                this.app.ui.showError('Keranjang kosong. Tambahkan produk terlebih dahulu.');
                return false;
            }

            // Validate cart
            const validation = this.app.cart.validateCart();
            if (!validation.isValid) {
                this.app.ui.showError(validation.errors[0]);
                return false;
            }

            // Convert cart items to order items
            const orderItems = state.cart.map(item => ({
                productId: item.productId,
                name: item.name,
                variant: item.variant,
                price: item.price,
                quantity: item.quantity,
                notes: item.notes || '',
                couponUsed: item.couponUsed || null
            }));

            // Generate order
            const order = this.generateOrder(orderItems, false);
            
            // Send to WhatsApp
            this.sendToWhatsApp(order);
            
            // Clear cart after successful order
            this.app.cart.clear();
            
            // Close cart modal if open
            this.app.ui.closeModal(this.app.DOMElements.modals.cart);
            
            // Show success
            this.app.ui.showSuccess('Pesanan dikirim ke WhatsApp. Silakan lanjutkan pembayaran dengan admin.');
            
            // Track order
            this.trackOrder(order);
            
            return true;
        } catch (error) {
            this.app.utils.handleError(error, 'Checkout.processCart');
            return false;
        }
    }

    // Get order data from modal
    getModalOrderData(modal, product) {
        const variantSelect = modal.querySelector('#modalVariantSelect');
        const quantityInput = modal.querySelector('#modalQuantity');
        const notesInput = modal.querySelector('#modalNotes');
        
        const selectedOption = variantSelect.options[variantSelect.selectedIndex];
        const variantName = selectedOption.dataset.name;
        const price = parseFloat(modal.dataset.currentPrice);
        const quantity = parseInt(quantityInput.value);
        const notes = notesInput.value.trim();
        const couponUsed = modal.dataset.couponApplied !== 'false' ? modal.dataset.couponApplied : null;

        return {
            productId: product.id,
            name: product.title,
            variant: variantName,
            price: price,
            quantity: quantity,
            notes: notes,
            couponUsed: couponUsed
        };
    }

    // Validate direct order
    validateDirectOrder(orderData) {
        const errors = [];

        if (!orderData.productId || !orderData.name) {
            errors.push('Data produk tidak valid.');
        }

        if (orderData.quantity < 1) {
            errors.push('Jumlah pesanan minimal 1.');
        }

        if (orderData.price < 1000) {
            errors.push('Harga produk tidak valid.');
        }

        const total = orderData.price * orderData.quantity;
        if (total < 1000) {
            errors.push('Total pesanan minimal Rp1.000.');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Generate order object
    generateOrder(items, isDirect = false) {
        const state = this.app.getState();
        const orderId = this.generateOrderId();
        const timestamp = new Date();

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discountAmount = 0;
        let discountCode = null;

        // Apply discount for cart orders
        if (!isDirect && state.discount.code) {
            discountAmount = subtotal * (state.discount.rate || 0);
            discountCode = state.discount.code;
        }

        const total = subtotal - discountAmount;

        return {
            id: orderId,
            timestamp: timestamp.toISOString(),
            items: items,
            subtotal: subtotal,
            discountAmount: discountAmount,
            discountCode: discountCode,
            total: total,
            isDirect: isDirect,
            status: 'pending',
            whatsappSent: false
        };
    }

    // Generate WhatsApp message
    generateWhatsAppMessage(order) {
        let message = `🛒 *PESANAN BARU - ${order.id}*\n`;
        message += `📅 ${this.formatDate(order.timestamp)}\n`;
        message += `=================================\n\n`;

        // Order items
        order.items.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            message += `*${index + 1}. ${item.name}*\n`;
            message += `📦 Varian: ${item.variant}\n`;
            message += `🔢 Jumlah: ${item.quantity}\n`;
            message += `💰 Harga: ${this.app.utils.formatPrice(item.price)}\n`;
            message += `📊 Subtotal: ${this.app.utils.formatPrice(itemTotal)}\n`;
            
            if (item.notes) {
                message += `📝 Catatan: _${item.notes}_\n`;
            }
            
            if (item.couponUsed) {
                message += `🎫 Kupon: ${item.couponUsed}\n`;
            }
            
            message += `\n`;
        });

        // Order summary
        message += `---------------------------------\n`;
        message += `💵 *Subtotal:* ${this.app.utils.formatPrice(order.subtotal)}\n`;
        
        if (order.discountAmount > 0) {
            message += `🎁 *Diskon (${order.discountCode}):* -${this.app.utils.formatPrice(order.discountAmount)}\n`;
        }
        
        message += `💳 *TOTAL PEMBAYARAN:* ${this.app.utils.formatPrice(order.total)}\n`;
        message += `=================================\n\n`;

        // Instructions
        message += `📋 *LANGKAH SELANJUTNYA:*\n`;
        message += `1️⃣ Konfirmasi pesanan ini\n`;
        message += `2️⃣ Transfer sesuai total pembayaran\n`;
        message += `3️⃣ Kirim bukti transfer\n`;
        message += `4️⃣ Tunggu akun/voucher dikirim\n\n`;

        // Payment info
        message += `💳 *INFO PEMBAYARAN:*\n`;
        message += `• Metode: Transfer Bank / E-Wallet\n`;
        message += `• Detail rekening akan diberikan setelah konfirmasi\n`;
        message += `• Proses maksimal 1x24 jam\n\n`;

        message += `⚡ *Dmaz Alyxers Premium*\n`;
        message += `_Solusi Digital Terbaik & Terlengkap_\n\n`;
        message += `🙏 Terima kasih telah mempercayai kami!`;

        return message;
    }

    // Send order to WhatsApp
    sendToWhatsApp(order) {
        try {
            const message = this.generateWhatsAppMessage(order);
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;
            
            // Open WhatsApp
            window.open(whatsappUrl, '_blank');
            
            // Mark as sent
            order.whatsappSent = true;
            
            return true;
        } catch (error) {
            console.error('Failed to send WhatsApp message:', error);
            this.app.ui.showError('Gagal membuka WhatsApp. Silakan coba lagi.');
            return false;
        }
    }

    // Generate unique order ID
    generateOrderId() {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 5).replace(/:/g, '');
        const counter = String(this.orderCounter).padStart(3, '0');
        
        this.orderCounter++;
        this.saveOrderCounter();
        
        return `DMZ${dateStr}${timeStr}${counter}`;
    }

    // Get order counter from storage
    getOrderCounter() {
        return this.app.utils.storage.get('orderCounter', 1);
    }

    // Save order counter
    saveOrderCounter() {
        this.app.utils.storage.set('orderCounter', this.orderCounter);
    }

    // Track order for analytics
    trackOrder(order) {
        try {
            const orders = this.app.utils.storage.get('orderHistory', []);
            
            // Store simplified order data
            const orderSummary = {
                id: order.id,
                timestamp: order.timestamp,
                total: order.total,
                itemCount: order.items.length,
                isDirect: order.isDirect,
                status: order.status
            };
            
            orders.unshift(orderSummary);
            
            // Keep only last 50 orders
            if (orders.length > 50) {
                orders.splice(50);
            }
            
            this.app.utils.storage.set('orderHistory', orders);
            
            // Update statistics
            this.updateOrderStats(order);
            
            return true;
        } catch (error) {
            console.error('Failed to track order:', error);
            return false;
        }
    }

    // Update order statistics
    updateOrderStats(order) {
        try {
            const stats = this.app.utils.storage.get('orderStats', {
                totalOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                popularProducts: {},
                ordersByMonth: {}
            });
            
            stats.totalOrders++;
            stats.totalRevenue += order.total;
            stats.averageOrderValue = stats.totalRevenue / stats.totalOrders;
            
            // Track popular products
            order.items.forEach(item => {
                const productKey = `${item.productId}_${item.name}`;
                stats.popularProducts[productKey] = (stats.popularProducts[productKey] || 0) + item.quantity;
            });
            
            // Track orders by month
            const monthKey = new Date(order.timestamp).toISOString().slice(0, 7);
            stats.ordersByMonth[monthKey] = (stats.ordersByMonth[monthKey] || 0) + 1;
            
            this.app.utils.storage.set('orderStats', stats);
            
            return true;
        } catch (error) {
            console.error('Failed to update order stats:', error);
            return false;
        }
    }

    // Get order history
    getOrderHistory() {
        return this.app.utils.storage.get('orderHistory', []);
    }

    // Get order statistics
    getOrderStats() {
        const stats = this.app.utils.storage.get('orderStats', {
            totalOrders: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            popularProducts: {},
            ordersByMonth: {}
        });
        
        // Get most popular product
        const popularProducts = Object.entries(stats.popularProducts);
        const mostPopular = popularProducts.length > 0 
            ? popularProducts.reduce((a, b) => a[1] > b[1] ? a : b)[0]
            : 'Tidak ada data';
        
        return {
            ...stats,
            mostPopularProduct: mostPopular.split('_')[1] || 'Tidak ada data',
            formattedRevenue: this.app.utils.formatPrice(stats.totalRevenue),
            formattedAverageOrder: this.app.utils.formatPrice(stats.averageOrderValue)
        };
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    // Generate order receipt
    generateReceipt(order) {
        let receipt = `📧 TANDA TERIMA PESANAN\n`;
        receipt += `${this.businessInfo.name}\n`;
        receipt += `${this.businessInfo.address}\n`;
        receipt += `Email: ${this.businessInfo.email}\n`;
        receipt += `Website: ${this.businessInfo.website}\n\n`;
        
        receipt += `Order ID: ${order.id}\n`;
        receipt += `Tanggal: ${this.formatDate(order.timestamp)}\n`;
        receipt += `Status: ${order.status.toUpperCase()}\n`;
        receipt += `=================================\n\n`;
        
        receipt += `DETAIL PESANAN:\n`;
        order.items.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            receipt += `${index + 1}. ${item.name}\n`;
            receipt += `   ${item.variant}\n`;
            receipt += `   ${item.quantity} x ${this.app.utils.formatPrice(item.price)} = ${this.app.utils.formatPrice(itemTotal)}\n`;
            if (item.notes) receipt += `   Catatan: ${item.notes}\n`;
            if (item.couponUsed) receipt += `   Kupon: ${item.couponUsed}\n`;
            receipt += `\n`;
        });
        
        receipt += `Subtotal: ${this.app.utils.formatPrice(order.subtotal)}\n`;
        if (order.discountAmount > 0) {
            receipt += `Diskon (${order.discountCode}): -${this.app.utils.formatPrice(order.discountAmount)}\n`;
        }
        receipt += `TOTAL: ${this.app.utils.formatPrice(order.total)}\n`;
        receipt += `=================================\n\n`;
        
        receipt += `Terima kasih telah berbelanja!\n`;
        receipt += `Untuk bantuan, hubungi WhatsApp: +${this.whatsappNumber}`;
        
        return receipt;
    }

    // Copy receipt to clipboard
    async copyReceipt(order) {
        try {
            const receipt = this.generateReceipt(order);
            const success = await this.app.utils.copyToClipboard(receipt);
            
            if (success) {
                this.app.ui.showSuccess('Tanda terima berhasil disalin ke clipboard.');
            } else {
                this.app.ui.showError('Gagal menyalin tanda terima.');
            }
            
            return success;
        } catch (error) {
            this.app.utils.handleError(error, 'Checkout.copyReceipt');
            return false;
        }
    }

    // Estimate delivery time
    getEstimatedDeliveryTime(items) {
        const processingTimes = {
            'app': 30, // 30 minutes for app subscriptions
            'game': 15, // 15 minutes for game top-ups
            'streaming': 45, // 45 minutes for streaming services
            'utility': 60 // 1 hour for utility services
        };
        
        let maxTime = 0;
        
        items.forEach(item => {
            const product = this.app.products.getProductById(item.productId);
            if (product) {
                const categoryTime = processingTimes[product.category] || 60;
                maxTime = Math.max(maxTime, categoryTime);
            }
        });
        
        return {
            minutes: maxTime,
            formatted: maxTime < 60 ? `${maxTime} menit` : `${Math.ceil(maxTime / 60)} jam`
        };
    }

    // Get payment methods
    getPaymentMethods() {
        return [
            {
                type: 'bank',
                name: 'Transfer Bank',
                methods: ['BCA', 'Mandiri', 'BRI', 'BNI'],
                processingTime: '0-30 menit',
                icon: 'fas fa-university'
            },
            {
                type: 'ewallet',
                name: 'E-Wallet',
                methods: ['Dana', 'OVO', 'GoPay', 'ShopeePay'],
                processingTime: '0-15 menit',
                icon: 'fas fa-mobile-alt'
            },
            {
                type: 'qris',
                name: 'QRIS',
                methods: ['Scan QRIS'],
                processingTime: '0-5 menit',
                icon: 'fas fa-qrcode'
            }
        ];
    }

    // Calculate order summary
    calculateOrderSummary(items, discountCode = null) {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discountAmount = 0;
        let discountDescription = '';
        
        if (discountCode && this.app.cart.discountCodes[discountCode]) {
            const discount = this.app.cart.discountCodes[discountCode];
            discountAmount = subtotal * discount.rate;
            discountDescription = discount.description;
        }
        
        const total = subtotal - discountAmount;
        const estimatedDelivery = this.getEstimatedDeliveryTime(items);
        
        return {
            subtotal,
            discountAmount,
            discountCode,
            discountDescription,
            total,
            estimatedDelivery,
            formatted: {
                subtotal: this.app.utils.formatPrice(subtotal),
                discountAmount: this.app.utils.formatPrice(discountAmount),
                total: this.app.utils.formatPrice(total)
            }
        };
    }

    // Export order data
    exportOrderData() {
        const orders = this.getOrderHistory();
        const stats = this.getOrderStats();
        
        const exportData = {
            orders,
            stats,
            exportedAt: new Date().toISOString(),
            businessInfo: this.businessInfo
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    // Clear order history
    clearOrderHistory() {
        this.app.utils.storage.remove('orderHistory');
        this.app.utils.storage.remove('orderStats');
        this.app.utils.storage.set('orderCounter', 1);
        this.orderCounter = 1;
        
        this.app.ui.showSuccess('Riwayat pesanan berhasil dihapus.');
    }

    // Validate business hours
    isBusinessHours() {
        const now = new Date();
        const hour = now.getHours();
        
        // Business hours: 08:00 - 22:00 (10 PM)
        return hour >= 8 && hour < 22;
    }

    // Get business hours message
    getBusinessHoursMessage() {
        if (this.isBusinessHours()) {
            return 'Kami sedang online! Pesanan akan diproses segera.';
        } else {
            return 'Kami sedang offline. Pesanan akan diproses pada jam kerja (08:00 - 22:00).';
        }
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CheckoutManager;
}