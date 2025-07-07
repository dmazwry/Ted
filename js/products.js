// Product Management
class ProductManager {
    constructor(app) {
        this.app = app;
        this.products = [];
    }

    // Load products data
    async loadProducts() {
        try {
            this.products = await this.fetchProducts();
            this.app.updateState({ products: this.products });
            return this.products;
        } catch (error) {
            console.error('Error loading products:', error);
            throw error;
        }
    }

    // Fetch products (simulated API call)
    async fetchProducts() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return [
            { 
                id: 1, 
                name: "YOUTUBE", 
                title: "Youtube Premium", 
                stock: "99+", 
                rating: "4.9", 
                category: "app", 
                dateAdded: '2025-01-15', 
                imageColor: 'FF0000',
                description: "Nikmati jutaan video tanpa iklan, putar di latar belakang, dan akses YouTube Music Premium. Pengalaman menonton dan mendengarkan musik tanpa gangguan dengan kualitas premium.",
                testimonials: [
                    { name: 'Rina W.', text: "Akunnya aman, bisa dipakai sekeluarga. Nonton jadi nyaman tanpa iklan sama sekali. Recommended banget!" },
                    { name: 'Gatot H.', text: "Mantap, bisa download video buat ditonton offline. Berguna banget pas lagi di luar. Pelayanan juga cepat." }
                ],
                variants: [
                    { name: "1 Bulan", price: 12000 }, 
                    { name: "4 Bulan", price: 40000 }, 
                    { name: "1 Tahun (Family Head)", price: 150000 }
                ], 
                isBestSeller: true,
                deal: { originalPrice: 15000, label: 'Promo Terbatas!', endDate: '2025-02-15T23:59:59' }
            },
            { 
                id: 2, 
                name: "SPOTIFY", 
                title: "Spotify Premium", 
                stock: "50+", 
                rating: "5.0", 
                category: "app", 
                dateAdded: '2025-01-10', 
                imageColor: '1DB954',
                description: "Dengarkan musik favoritmu tanpa batas. Lewati lagu sepuasnya, nikmati kualitas audio terbaik, dan download musik untuk didengarkan offline. Akses jutaan lagu dari seluruh dunia.",
                testimonials: [
                    { name: 'Ahmad Fauzi', text: "Prosesnya cepet banget, gak sampai 5 menit akun udah aktif. Recommended seller! Musik berkualitas tinggi." },
                    { name: 'Dewi L.', text: "Playlist-nya jadi asik, bisa skip lagu sesuka hati. Wajib punya buat yang suka musik. Fitur Discovery juga keren." }
                ],
                variants: [
                    { name: "1 Bulan", price: 16500 }, 
                    { name: "3 Bulan", price: 45000 }
                ]
            },
            { 
                id: 3, 
                name: "CANVA", 
                title: "Canva Pro", 
                stock: "80+", 
                rating: "5.0", 
                category: "app", 
                dateAdded: '2025-01-05', 
                imageColor: '8d39ec',
                description: "Akses semua fitur premium Canva untuk membuat desain profesional dengan mudah. Jutaan template, foto, dan font siap pakai. Cocok untuk content creator, bisnis, dan pelajar.",
                testimonials: [
                    { name: 'Budi Santoso', text: "Udah dua kali beli akun Canva di sini, garansinya beneran full setahun. Mantap! Template-nya lengkap banget." },
                    { name: 'Cindy A.', text: "Desain buat tugas jadi cepet banget pake Canva Pro dari sini. Harganya juga cocok buat kantong mahasiswa." }
                ],
                variants: [
                    { name: "1 Bulan", price: 25000 }, 
                    { name: "1 Tahun", price: 150000 }
                ], 
                isBestSeller: true 
            },
            { 
                id: 4, 
                name: "NETFLIX", 
                title: "Netflix Premium UHD", 
                stock: "99+", 
                rating: "4.7", 
                category: "app", 
                dateAdded: '2025-01-12', 
                imageColor: 'E50914',
                description: "Streaming ribuan film dan serial TV populer dengan kualitas terbaik hingga Ultra HD (4K). Buat profil pribadimu dan nikmati tontonan di semua perangkat. Konten original Netflix eksklusif.",
                testimonials: [
                    { name: 'Ivan T.', text: "Kualitas UHD-nya jernih banget, nonton di TV jadi seru. Gak pernah ada masalah sama akunnya. Konten original keren!" },
                    { name: 'Sari M.', text: "Adminnya fast response, kalau ada kendala langsung dibantu. Top! Koleksi film dan serial lengkap." }
                ],
                variants: [
                    { name: "Sharing 1 Profile", price: 35750 }, 
                    { name: "Private 1 Bulan", price: 120000 }
                ]
            },
            { 
                id: 5, 
                name: "DISCORD", 
                title: "Discord Nitro", 
                stock: "30+", 
                rating: "4.8", 
                category: "app", 
                dateAdded: '2025-01-18', 
                imageColor: '5865F2',
                description: "Tingkatkan pengalaman server Discord-mu dengan Nitro. Dapatkan emoji kustom di mana saja, upload file lebih besar, dan streaming dengan kualitas HD. Fitur premium untuk komunitas gaming.",
                testimonials: [
                    { name: 'Fighter77', text: "Akhirnya bisa pamer emoji custom di server lain. Streaming ke teman juga jadi lancar jaya. Worth it banget!" }
                ],
                variants: [
                    { name: "Nitro Basic (1 Bulan)", price: 45000 }, 
                    { name: "Nitro Boost (1 Bulan)", price: 99000 }
                ], 
                isNew: true 
            },
            { 
                id: 6, 
                name: "VPN", 
                title: "VPN Premium", 
                stock: "99+", 
                rating: "4.9", 
                category: "app", 
                dateAdded: '2025-01-02', 
                imageColor: '3B82F6',
                description: "Amankan koneksi internetmu dan akses konten dari seluruh dunia. Dengan server premium acak, privasimu lebih terjamin dan koneksi lebih cepat. Bypass geo-blocking.",
                testimonials: [
                    { name: 'User_Anonim', text: "VPN-nya kenceng, buat streaming atau main game lancar. Harganya juga murah banget untuk setahun. Privacy terjaga!" }
                ],
                variants: [
                    { name: "1 Bulan (Random)", price: 30000 }, 
                    { name: "1 Tahun (Random)", price: 250000 }
                ]
            },
            { 
                id: 7, 
                name: "MICROSOFT", 
                title: "Microsoft 365", 
                stock: "50+", 
                rating: "4.9", 
                category: "app", 
                dateAdded: '2024-12-20', 
                imageColor: 'F25022',
                description: "Dapatkan akses ke aplikasi Office premium (Word, Excel, PowerPoint) dan penyimpanan cloud OneDrive sebesar 1TB. Cocok untuk produktivitas kerja dan kuliah. Lisensi asli.",
                testimonials: [
                    { name: 'Hendra K.', text: "Penyimpanan 1TB-nya berguna banget buat backup data. Lisensi original, jadi aman buat kerjaan. Sync di semua device." }
                ],
                variants: [
                    { name: "Family Plan (1 Tahun)", price: 90000 }
                ]
            },
            { 
                id: 8, 
                name: "ADOBE", 
                title: "Adobe Creative Cloud", 
                stock: "10+", 
                rating: "4.8", 
                category: "app", 
                dateAdded: '2025-01-20', 
                imageColor: 'FF0000',
                description: "Buka potensimu dengan akses ke semua aplikasi Adobe Creative Cloud. Mulai dari Photoshop, Illustrator, Premiere Pro, dan masih banyak lagi. Untuk content creator profesional.",
                testimonials: [
                    { name: 'CreativeGal', text: "Buat desainer atau editor, ini deal terbaik. Bisa akses semua aplikasi Adobe dengan harga miring. Kualitas professional." }
                ],
                variants: [
                    { name: "All Apps (1 Bulan)", price: 180000 }
                ], 
                isNew: true 
            },
            { 
                id: 9, 
                name: "MLBB", 
                title: "MLBB Diamonds", 
                stock: "99+", 
                rating: "5.0", 
                category: "game", 
                dateAdded: '2025-01-17', 
                imageColor: '3170a7',
                description: "Top up Diamond Mobile Legends dengan cepat dan aman. Proses instan via ID, tidak perlu login. Jadilah yang terkuat di Land of Dawn! Semua skin hero tersedia.",
                testimonials: [
                    { name: 'Siti Nurhaliza', text: "Diamond langsung masuk, ga pake lama. Harganya paling murah di antara yang lain. Bisa beli skin epic!" },
                    { name: 'ProPlayer123', text: "Udah sering top up di sini, selalu amanah dan prosesnya kilat. Trusted seller untuk MLBB." }
                ],
                variants: [
                    { name: "86 Diamonds", price: 25000 }, 
                    { name: "172 Diamonds", price: 50000 }, 
                    { name: "514 Diamonds", price: 135000 }
                ], 
                isBestSeller: true 
            },
            { 
                id: 10, 
                name: "FREE FIRE", 
                title: "FF Diamonds", 
                stock: "99+", 
                rating: "4.9", 
                category: "game", 
                dateAdded: '2025-01-08', 
                imageColor: 'ff6900',
                description: "Isi ulang Diamond Free Fire secara instan dan murah. Cukup masukkan ID game-mu dan nikmati item-item keren di dalam game. Cocok untuk Booyah squad goals.",
                testimonials: [
                    { name: 'BocilEpep', text: "Beli diamond di sini lebih untung daripada di game langsung. Prosesnya juga gak ribet. Bisa beli bundle keren!" }
                ],
                variants: [
                    { name: "140 Diamonds", price: 20000 }, 
                    { name: "355 Diamonds", price: 50000 }, 
                    { name: "720 Diamonds", price: 95000 }
                ]
            },
            { 
                id: 11, 
                name: "GENSHIN", 
                title: "Genshin Impact Crystals", 
                stock: "99+", 
                rating: "5.0", 
                category: "game", 
                dateAdded: '2025-01-14', 
                imageColor: 'f2e2d3',
                description: "Dapatkan Genesis Crystals dan Blessing of the Welkin Moon untuk Gacha karakter dan senjata impianmu. Transaksi aman dan terpercaya. Wujudkan tim impianmu!",
                testimonials: [
                    { name: 'Traveler99', text: "Welkin bulanan di sini paling murah. Adminnya juga ramah banget. Pasti langganan di sini. Gacha jadi pity!" }
                ],
                variants: [
                    { name: "Blessing of the Welkin", price: 75000 }, 
                    { name: "300 + 30 GC", price: 79000 }
                ]
            },
            { 
                id: 12, 
                name: "VALORANT", 
                title: "Valorant Points", 
                stock: "99+", 
                rating: "4.9", 
                category: "game", 
                dateAdded: '2025-01-16', 
                imageColor: 'FD4556',
                description: "Beli Valorant Points untuk mendapatkan skin senjata keren dan Battle Pass terbaru. Proses cepat, legal, dan anti-ban. Skin premium untuk domination!",
                testimonials: [
                    { name: 'JettMain', text: "Points langsung terisi, bisa langsung beli skin incaran. Thanks min! Skin Phantom jadi makin keren." }
                ],
                variants: [
                    { name: "300 Points", price: 32000 }, 
                    { name: "625 Points", price: 60000 }
                ], 
                isNew: true 
            },
            { 
                id: 13, 
                name: "DISNEY+", 
                title: "Disney+ Hotstar", 
                stock: "99+", 
                rating: "4.8", 
                category: "streaming", 
                dateAdded: '2024-12-15', 
                imageColor: '020e46',
                description: "Tonton semua film dan serial dari Disney, Pixar, Marvel, Star Wars, dan National Geographic dalam satu aplikasi. Pilihan tontonan keluarga terbaik dengan kualitas HD.",
                testimonials: [
                    { name: 'MarvelFan', text: "Langganan setahun lebih hemat, bisa nonton Marvel sepuasnya. Akunnya lancar jaya. Konten anak-anak juga banyak." }
                ],
                variants: [
                    { name: "1 Bulan", price: 25000 }, 
                    { name: "1 Tahun", price: 150000 }
                ]
            },
            { 
                id: 14, 
                name: "HBO GO", 
                title: "HBO GO", 
                stock: "50+", 
                rating: "4.7", 
                category: "streaming", 
                dateAdded: '2024-12-10', 
                imageColor: 'a303fa',
                description: "Nikmati serial TV pemenang penghargaan seperti Game of Thrones dan House of the Dragon, serta film-film blockbuster dari Warner Bros. Kualitas cinematic experience.",
                testimonials: [
                    { name: 'DragonLover', text: "Akhirnya bisa nonton House of the Dragon legal tanpa buffering. Mantap! Kualitas gambar jernih banget." }
                ],
                variants: [
                    { name: "1 Bulan", price: 30000 }
                ]
            },
            { 
                id: 15, 
                name: "VIU", 
                title: "Viu Premium", 
                stock: "99+", 
                rating: "4.9", 
                category: "streaming", 
                dateAdded: '2025-01-21', 
                imageColor: 'f9b800',
                description: "Platform streaming terbaik untuk para pecinta drama Korea, variety show, dan konten Asia lainnya. Selalu update dengan episode terbaru. Subtitle Indonesia tersedia.",
                testimonials: [
                    { name: 'DrakorMania', text: "Nonton drakor jadi lancar tanpa iklan. Pilihan dramanya juga lengkap banget. Update episode cepat!" }
                ],
                variants: [
                    { name: "1 Bulan", price: 20000 }
                ], 
                isNew: true 
            },
            { 
                id: 16, 
                name: "CHATGPT", 
                title: "ChatGPT Plus", 
                stock: "40+", 
                rating: "5.0", 
                category: "app", 
                dateAdded: '2025-01-22', 
                imageColor: '74AA9C',
                description: "Akses model bahasa tercanggih GPT-4, respon lebih cepat, dan akses prioritas ke fitur-fitur baru. Tingkatkan produktivitas dan kreativitas Anda. AI assistant terbaik!",
                testimonials: [
                    { name: 'StartupGuy', text: "Game changer buat kerjaan. Bisa bantu coding, nulis email, sampai bikin ide konten. Worth it! Produktivitas naik 300%." }
                ],
                variants: [
                    { name: "1 Bulan", price: 175000 }
                ], 
                isNew: true, 
                isBestSeller: true,
                deal: { originalPrice: 200000, label: 'Super Deal!', endDate: '2025-02-15T23:59:59' }
            },
            { 
                id: 17, 
                name: "CAPCUT", 
                title: "CapCut Pro", 
                stock: "99+", 
                rating: "4.8", 
                category: "app", 
                dateAdded: '2025-01-21', 
                imageColor: '000000',
                description: "Buka semua fitur editing video premium di CapCut. Hapus watermark, akses efek dan transisi eksklusif, dan ekspor video dengan kualitas lebih tinggi. Perfect untuk content creator.",
                testimonials: [
                    { name: 'KontenKreator', text: "Editing di HP jadi selevel pro. Banyak banget aset premium yang kepake. Video jadi viral!" }
                ],
                variants: [
                    { name: "1 Bulan", price: 35000 }, 
                    { name: "1 Tahun", price: 250000 }
                ]
            },
            { 
                id: 18, 
                name: "GETCONTACT", 
                title: "GetContact Premium", 
                stock: "99+", 
                rating: "4.7", 
                category: "utility", 
                dateAdded: '2025-01-03', 
                imageColor: '2196F3',
                description: "Lihat siapa yang memberi tag pada nomormu dan tingkatkan privasimu. Hilangkan batasan pencarian dan lihat statistik profilmu. Keamanan komunikasi maksimal.",
                testimonials: [
                    { name: 'KepoinMantan', text: "Langsung bisa liat siapa aja yang namain nomorku aneh-aneh. Seru! Bisa blokir spam call juga." }
                ],
                variants: [
                    { name: "1 Bulan", price: 28000 }
                ]
            },
            { 
                id: 19, 
                name: "ZOOM", 
                title: "Zoom Pro", 
                stock: "20+", 
                rating: "4.9", 
                category: "utility", 
                dateAdded: '2025-01-01', 
                imageColor: '2D8CFF',
                description: "Meeting tanpa batas waktu hingga 100 partisipan. Fitur co-host, polling, dan laporan meeting. Ideal untuk kebutuhan bisnis dan pendidikan. Kualitas video HD.",
                testimonials: [
                    { name: 'DosenOnline', text: "Sangat membantu buat ngajar, gak perlu khawatir keputus setelah 40 menit. Fitur recording juga mantap." }
                ],
                variants: [
                    { name: "1 Bulan", price: 150000 }
                ]
            },
            { 
                id: 20, 
                name: "WINK", 
                title: "Wink Premium", 
                stock: "50+", 
                rating: "4.8", 
                category: "app", 
                dateAdded: '2025-01-23', 
                imageColor: 'FFC0CB',
                description: "Retouch video dan foto dengan fitur AI canggih. Hapus kerutan, perbaiki kualitas video, dan gunakan filter-filter premium untuk hasil yang memukau. Beauty camera terbaik!",
                testimonials: [
                    { name: 'Selebgram wannabe', text: "Bikin muka auto glowing di video. Fitur AI-nya canggih banget. Hasil natural gak lebay." }
                ],
                variants: [
                    { name: "1 Bulan", price: 40000 }
                ], 
                isNew: true 
            }
        ];
    }

    // Get product by ID
    getProductById(id) {
        return this.products.find(product => product.id === parseInt(id));
    }

    // Get products by category
    getProductsByCategory(category) {
        if (category === 'Semua') return this.products;
        return this.products.filter(product => product.category.toLowerCase() === category.toLowerCase());
    }

    // Search products
    searchProducts(query) {
        if (!query) return this.products;
        const searchTerm = query.toLowerCase();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.title.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    // Get featured products
    getFeaturedProducts() {
        return this.products.filter(product => product.isBestSeller || product.isNew);
    }

    // Get deal products
    getDealProducts() {
        return this.products.filter(product => product.deal);
    }

    // Get all categories
    getCategories() {
        const categories = [...new Set(this.products.map(p => p.category))].sort();
        return ['Semua', ...categories];
    }

    // Sort products
    sortProducts(products, sortBy) {
        const sorted = [...products];
        
        switch (sortBy) {
            case 'price-asc':
                return sorted.sort((a, b) => a.variants[0].price - b.variants[0].price);
            case 'price-desc':
                return sorted.sort((a, b) => b.variants[0].price - a.variants[0].price);
            case 'rating-desc':
                return sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
            case 'best-seller':
                return sorted.sort((a, b) => (b.isBestSeller || false) - (a.isBestSeller || false));
            case 'newest':
                return sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            default:
                return sorted;
        }
    }

    // Filter products
    filterProducts(filters) {
        let filtered = this.products;

        // Filter by category
        if (filters.category && filters.category !== 'Semua') {
            filtered = this.getProductsByCategory(filters.category);
        }

        // Filter by search
        if (filters.search) {
            filtered = this.searchProducts(filters.search);
        }

        // Sort products
        if (filters.sort) {
            filtered = this.sortProducts(filtered, filters.sort);
        }

        return filtered;
    }

    // Get product statistics
    getProductStats() {
        return {
            total: this.products.length,
            categories: this.getCategories().length - 1, // Exclude 'Semua'
            bestSellers: this.products.filter(p => p.isBestSeller).length,
            newProducts: this.products.filter(p => p.isNew).length,
            deals: this.products.filter(p => p.deal).length,
            averageRating: (this.products.reduce((sum, p) => sum + parseFloat(p.rating), 0) / this.products.length).toFixed(1)
        };
    }

    // Get random testimonials
    getRandomTestimonials(count = 3) {
        const allTestimonials = this.products
            .flatMap(p => p.testimonials.map(t => ({ ...t, product: p.title })))
            .sort(() => 0.5 - Math.random())
            .slice(0, count);
        
        return allTestimonials;
    }

    // Get product suggestions for search
    getProductSuggestions() {
        return this.products.map(p => ({
            id: p.id,
            name: p.name,
            title: p.title,
            category: p.category
        }));
    }

    // Check if product is on sale
    isOnSale(productId) {
        const product = this.getProductById(productId);
        return product && product.deal && new Date(product.deal.endDate) > new Date();
    }

    // Get sale price
    getSalePrice(productId) {
        const product = this.getProductById(productId);
        if (this.isOnSale(productId)) {
            return product.variants[0].price;
        }
        return null;
    }

    // Get original price (before sale)
    getOriginalPrice(productId) {
        const product = this.getProductById(productId);
        if (product && product.deal) {
            return product.deal.originalPrice;
        }
        return product ? product.variants[0].price : 0;
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductManager;
}