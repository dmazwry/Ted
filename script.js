document.addEventListener('DOMContentLoaded', () => {

    const App = {
        state: {
            products: [], // Will be loaded
            cart: [],
            filter: { category: 'Semua', search: '', sort: 'default' },
            discount: { code: null, rate: 0 },
            countdownIntervals: []
        },

        DOMElements: {
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
        },

        // --- DATA SOURCE ---
        fetchProducts() {
            this.state.products = [
                { id: 1, name: "YOUTUBE", title: "Youtube Premium", stock: "99+", rating: "4.9", category: "app", dateAdded: '2025-07-01', imageColor: 'FF0000',
                    description: "Nikmati jutaan video tanpa iklan, putar di latar belakang, dan akses YouTube Music Premium. Pengalaman menonton dan mendengarkan musik tanpa gangguan.",
                    testimonials: [
                        { name: 'Rina W.', text: "Akunnya aman, bisa dipakai sekeluarga. Nonton jadi nyaman tanpa iklan sama sekali." },
                        { name: 'Gatot H.', text: "Mantap, bisa download video buat ditonton offline. Berguna banget pas lagi di luar." }
                    ],
                    variants: [{ name: "1 Bulan", price: 12000 }, { name: "4 Bulan", price: 40000 }, { name: "1 Tahun (Family Head)", price: 150000 }], 
                    isBestSeller: true,
                    deal: { originalPrice: 15000, label: 'Promo Terbatas!', endDate: '2025-07-15T23:59:59' }
                },
                { id: 2, name: "SPOTIFY", title: "Spotify Premium", stock: "50+", rating: "5.0", category: "app", dateAdded: '2025-06-25', imageColor: '1DB954',
                    description: "Dengarkan musik favoritmu tanpa batas. Lewati lagu sepuasnya, nikmati kualitas audio terbaik, dan download musik untuk didengarkan offline.",
                    testimonials: [
                        { name: 'Ahmad Fauzi', text: "Prosesnya cepet banget, gak sampai 5 menit akun udah aktif. Recommended seller!" },
                        { name: 'Dewi L.', text: "Playlist-nya jadi asik, bisa skip lagu sesuka hati. Wajib punya buat yang suka musik." }
                    ],
                    variants: [{ name: "1 Bulan", price: 16500 }, { name: "3 Bulan", price: 45000 }] },
                { id: 3, name: "CANVA", title: "Canva Pro", stock: "80+", rating: "5.0", category: "app", dateAdded: '2025-06-11', imageColor: '8d39ec',
                    description: "Akses semua fitur premium Canva untuk membuat desain profesional dengan mudah. Jutaan template, foto, dan font siap pakai.",
                    testimonials: [
                        { name: 'Budi Santoso', text: "Udah dua kali beli akun Canva di sini, garansinya beneran full setahun. Mantap!" },
                        { name: 'Cindy A.', text: "Desain buat tugas jadi cepet banget pake Canva Pro dari sini. Harganya juga cocok buat kantong mahasiswa." }
                    ],
                    variants: [{ name: "1 Bulan", price: 25000 }, { name: "1 Tahun", price: 150000 }], isBestSeller: true },
                { id: 4, name: "NETFLIX", title: "Netflix Premium UHD", stock: "99+", rating: "4.7", category: "app", dateAdded: '2025-06-30', imageColor: 'E50914',
                    description: "Streaming ribuan film dan serial TV populer dengan kualitas terbaik hingga Ultra HD (4K). Buat profil pribadimu dan nikmati tontonan di semua perangkat.",
                    testimonials: [
                        { name: 'Ivan T.', text: "Kualitas UHD-nya jernih banget, nonton di TV jadi seru. Gak pernah ada masalah sama akunnya." },
                        { name: 'Sari M.', text: "Adminnya fast response, kalau ada kendala langsung dibantu. Top!" }
                    ],
                    variants: [{ name: "Sharing 1 Profile", price: 35750 }, { name: "Private 1 Bulan", price: 120000 }] },
                { id: 5, name: "DISCORD", title: "Discord Nitro", stock: "30+", rating: "4.8", category: "app", dateAdded: '2025-07-04', imageColor: '5865F2',
                    description: "Tingkatkan pengalaman server Discord-mu dengan Nitro. Dapatkan emoji kustom di mana saja, upload file lebih besar, dan streaming dengan kualitas HD.",
                    testimonials: [{ name: 'Fighter77', text: "Akhirnya bisa pamer emoji custom di server lain. Streaming ke teman juga jadi lancar jaya." }],
                    variants: [{ name: "Nitro Basic (1 Bulan)", price: 45000 }, { name: "Nitro Boost (1 Bulan)", price: 99000 }], isNew: true },
                { id: 6, name: "VPN", title: "VPN Premium", stock: "99+", rating: "4.9", category: "app", dateAdded: '2025-06-01', imageColor: '3B82F6',
                    description: "Amankan koneksi internetmu dan akses konten dari seluruh dunia. Dengan server premium acak, privasimu lebih terjamin dan koneksi lebih cepat.",
                    testimonials: [{ name: 'User_Anonim', text: "VPN-nya kenceng, buat streaming atau main game lancar. Harganya juga murah banget untuk setahun." }],
                    variants: [{ name: "1 Bulan (Random)", price: 30000 }, { name: "1 Tahun (Random)", price: 250000 }], isNew: false },
                { id: 7, name: "MICROSOFT", title: "Microsoft 365", stock: "50+", rating: "4.9", category: "app", dateAdded: '2025-05-20', imageColor: 'F25022',
                    description: "Dapatkan akses ke aplikasi Office premium (Word, Excel, PowerPoint) dan penyimpanan cloud OneDrive sebesar 1TB. Cocok untuk produktivitas kerja dan kuliah.",
                    testimonials: [{ name: 'Hendra K.', text: "Penyimpanan 1TB-nya berguna banget buat backup data. Lisensi original, jadi aman buat kerjaan." }],
                    variants: [{ name: "Family Plan (1 Tahun)", price: 90000 }] },
                { id: 8, name: "ADOBE", title: "Adobe Creative Cloud", stock: "10+", rating: "4.8", category: "app", dateAdded: '2025-07-05', imageColor: 'FF0000',
                    description: "Buka potensimu dengan akses ke semua aplikasi Adobe Creative Cloud. Mulai dari Photoshop, Illustrator, Premiere Pro, dan masih banyak lagi.",
                    testimonials: [{ name: 'CreativeGal', text: "Buat desainer atau editor, ini deal terbaik. Bisa akses semua aplikasi Adobe dengan harga miring." }],
                    variants: [{ name: "All Apps (1 Bulan)", price: 180000 }], isNew: true },
                { id: 9, name: "MLBB", title: "MLBB Diamonds", stock: "99+", rating: "5.0", category: "game", dateAdded: '2025-07-03', imageColor: '3170a7',
                    description: "Top up Diamond Mobile Legends dengan cepat dan aman. Proses instan via ID, tidak perlu login. Jadilah yang terkuat di Land of Dawn!",
                    testimonials: [
                        { name: 'Siti Nurhaliza', text: "Diamond langsung masuk, ga pake lama. Harganya paling murah di antara yang lain." },
                        { name: 'ProPlayer123', text: "Udah sering top up di sini, selalu amanah dan prosesnya kilat." }
                    ],
                    variants: [{ name: "86 Diamonds", price: 25000 }, { name: "172 Diamonds", price: 50000 }, { name: "514 Diamonds", price: 135000 }], isBestSeller: true },
                { id: 10, name: "FREE FIRE", title: "FF Diamonds", stock: "99+", rating: "4.9", category: "game", dateAdded: '2025-06-15', imageColor: 'ff6900',
                    description: "Isi ulang Diamond Free Fire secara instan dan murah. Cukup masukkan ID game-mu dan nikmati item-item keren di dalam game.",
                    testimonials: [{ name: 'BocilEpep', text: "Beli diamond di sini lebih untung daripada di game langsung. Prosesnya juga gak ribet." }],
                    variants: [{ name: "140 Diamonds", price: 20000 }, { name: "355 Diamonds", price: 50000 }, { name: "720 Diamonds", price: 95000 }]
                },
                { id: 11, name: "GENSHIN", title: "Genshin Impact Crystals", stock: "99+", rating: "5.0", category: "game", dateAdded: '2025-06-28', imageColor: 'f2e2d3',
                    description: "Dapatkan Genesis Crystals dan Blessing of the Welkin Moon untuk Gacha karakter dan senjata impianmu. Transaksi aman dan terpercaya.",
                    testimonials: [{ name: 'Traveler99', text: "Welkin bulanan di sini paling murah. Adminnya juga ramah banget. Pasti langganan di sini." }],
                    variants: [{ name: "Blessing of the Welkin", price: 75000 }, { name: "300 + 30 GC", price: 79000 }] },
                { id: 12, name: "VALORANT", title: "Valorant Points", stock: "99+", rating: "4.9", category: "game", dateAdded: '2025-07-02', imageColor: 'FD4556',
                    description: "Beli Valorant Points untuk mendapatkan skin senjata keren dan Battle Pass terbaru. Proses cepat, legal, dan anti-ban.",
                    testimonials: [{ name: 'JettMain', text: "Points langsung terisi, bisa langsung beli skin incaran. Thanks min!" }],
                    variants: [{ name: "300 Points", price: 32000 }, { name: "625 Points", price: 60000 }], isNew: true },
                { id: 13, name: "DISNEY+", title: "Disney+ Hotstar", stock: "99+", rating: "4.8", category: "streaming", dateAdded: '2025-05-10', imageColor: '020e46',
                    description: "Tonton semua film dan serial dari Disney, Pixar, Marvel, Star Wars, dan National Geographic dalam satu aplikasi. Pilihan tontonan keluarga terbaik.",
                    testimonials: [{ name: 'MarvelFan', text: "Langganan setahun lebih hemat, bisa nonton Marvel sepuasnya. Akunnya lancar jaya." }],
                    variants: [{ name: "1 Bulan", price: 25000 }, { name: "1 Tahun", price: 150000 }] },
                { id: 14, name: "HBO GO", title: "HBO GO", stock: "50+", rating: "4.7", category: "streaming", dateAdded: '2025-04-18', imageColor: 'a303fa',
                    description: "Nikmati serial TV pemenang penghargaan seperti Game of Thrones dan House of the Dragon, serta film-film blockbuster dari Warner Bros.",
                    testimonials: [{ name: 'DragonLover', text: "Akhirnya bisa nonton House of the Dragon legal tanpa buffering. Mantap!" }],
                    variants: [{ name: "1 Bulan", price: 30000 }] },
                { id: 15, name: "VIU", title: "Viu Premium", stock: "99+", rating: "4.9", category: "streaming", dateAdded: '2025-07-06', imageColor: 'f9b800',
                    description: "Platform streaming terbaik untuk para pecinta drama Korea, variety show, dan konten Asia lainnya. Selalu update dengan episode terbaru.",
                    testimonials: [{ name: 'DrakorMania', text: "Nonton drakor jadi lancar tanpa iklan. Pilihan dramanya juga lengkap banget." }],
                    variants: [{ name: "1 Bulan", price: 20000 }], isNew: true },
                { id: 16, name: "CHATGPT", title: "ChatGPT Plus", stock: "40+", rating: "5.0", category: "app", dateAdded: '2025-07-08', imageColor: '74AA9C',
                    description: "Akses model bahasa tercanggih GPT-4, respon lebih cepat, dan akses prioritas ke fitur-fitur baru. Tingkatkan produktivitas dan kreativitas Anda.",
                    testimonials: [{ name: 'StartupGuy', text: "Game changer buat kerjaan. Bisa bantu coding, nulis email, sampai bikin ide konten. Worth it!" }],
                    variants: [{ name: "1 Bulan", price: 175000 }], isNew: true, isBestSeller: true,
                    deal: { originalPrice: 200000, label: 'Super Deal!', endDate: '2025-07-15T23:59:59' }
                },
                { id: 17, name: "CAPCUT", title: "CapCut Pro", stock: "99+", rating: "4.8", category: "app", dateAdded: '2025-07-07', imageColor: '000000',
                    description: "Buka semua fitur editing video premium di CapCut. Hapus watermark, akses efek dan transisi eksklusif, dan ekspor video dengan kualitas lebih tinggi.",
                    testimonials: [{ name: 'KontenKreator', text: "Editing di HP jadi selevel pro. Banyak banget aset premium yang kepake." }],
                    variants: [{ name: "1 Bulan", price: 35000 }, { name: "1 Tahun", price: 250000 }]
                },
                { id: 18, name: "GETCONTACT", title: "GetContact Premium", stock: "99+", rating: "4.7", category: "utility", dateAdded: '2025-06-20', imageColor: '2196F3',
                    description: "Lihat siapa yang memberi tag pada nomormu dan tingkatkan privasimu. Hilangkan batasan pencarian dan lihat statistik profilmu.",
                    testimonials: [{ name: 'KepoinMantan', text: "Langsung bisa liat siapa aja yang namain nomorku aneh-aneh. Seru!" }],
                    variants: [{ name: "1 Bulan", price: 28000 }]
                },
                { id: 19, name: "ZOOM", title: "Zoom Pro", stock: "20+", rating: "4.9", category: "utility", dateAdded: '2025-06-18', imageColor: '2D8CFF',
                    description: "Meeting tanpa batas waktu hingga 100 partisipan. Fitur co-host, polling, dan laporan meeting. Ideal untuk kebutuhan bisnis dan pendidikan.",
                    testimonials: [{ name: 'DosenOnline', text: "Sangat membantu buat ngajar, gak perlu khawatir keputus setelah 40 menit." }],
                    variants: [{ name: "1 Bulan", price: 150000 }]
                },
                { id: 20, name: "WINK", title: "Wink Premium", stock: "50+", rating: "4.8", category: "app", dateAdded: '2025-07-09', imageColor: 'FFC0CB',
                    description: "Retouch video dan foto dengan fitur AI canggih. Hapus kerutan, perbaiki kualitas video, dan gunakan filter-filter premium untuk hasil yang memukau.",
                    testimonials: [{ name: 'Selebgram wannabe', text: "Bikin muka auto glowing di video. Fitur AI-nya canggih banget." }],
                    variants: [{ name: "1 Bulan", price: 40000 }], isNew: true
                },
                { id: 21, name: "WETV", title: "WeTV VIP", stock: "99+", rating: "4.9", category: "streaming", dateAdded: '2025-05-25', imageColor: 'FF4F70',
                    description: "Nonton duluan episode terbaru drama Asia favoritmu. Streaming tanpa iklan dengan kualitas HD. Koleksi lengkap dari China, Korea, dan Thailand.",
                    testimonials: [{ name: 'CdramaLover', text: "Bisa nonton episode baru tanpa harus nunggu seminggu. Puas banget!" }],
                    variants: [{ name: "1 Bulan", price: 25000 }, { name: "3 Bulan", price: 65000 }]
                },
                { id: 22, name: "VIDIO", title: "Vidio Platinum", stock: "99+", rating: "4.8", category: "streaming", dateAdded: '2025-05-28', imageColor: '8A2BE2',
                    description: "Saksikan siaran langsung Liga Inggris, F1, dan olahraga lainnya. Nonton original series Vidio, film Hollywood, dan channel TV internasional.",
                    testimonials: [{ name: 'BolaMania', text: "Streaming bola lancar jaya, kualitas HD. Gak pernah ketinggalan match tim favorit." }],
                    variants: [{ name: "1 Bulan + Mobile", price: 49000 }, { name: "1 Tahun + Mobile", price: 299000 }]
                },
                { id: 23, name: "ALIGHT MOTION", title: "Alight Motion Pro", stock: "60+", rating: "4.9", category: "app", dateAdded: '2025-07-01', imageColor: 'DD246D',
                    description: "Aplikasi motion graphic sekelas profesional di genggamanmu. Akses semua efek, keyframe animation, dan ekspor tanpa watermark.",
                    testimonials: [{ name: 'AMVmaker', text: "Bikin jedag-jedug jadi lebih gampang dan keren. Semua efek premium kebuka." }],
                    variants: [{ name: "1 Bulan", price: 30000 }]
                },
                { id: 24, name: "GEMINI", title: "Gemini Advanced", stock: "30+", rating: "5.0", category: "app", dateAdded: '2025-07-10', imageColor: '8E77D7',
                    description: "Rasakan kekuatan model AI tercanggih dari Google. Terintegrasi di Gmail, Docs, dan lainnya untuk produktivitas super. Kapasitas konteks yang lebih besar.",
                    testimonials: [{ name: 'TechEnthusiast', text: "Model 1.5 Pro-nya luar biasa. Bisa meringkas dokumen panjang dan coding dengan akurat." }],
                    variants: [{ name: "1 Bulan (Google One AI Premium)", price: 199000 }], isNew: true
                }
            ];
        },
        
        init() {
            this.theme.apply(this.theme.load());
            this.cart.load();
            this.fetchProducts(); // Load product data
            this.ui.populateSearchDatalist();
            this.ui.renderCategories();
            this.ui.renderTestimonials();
            this.listeners.setup();
            this.ui.setupHeroSlider();

            this.DOMElements.skeletonLoader.style.display = 'grid';
            setTimeout(() => {
                this.ui.renderAll();
            }, 600);
        },
        
        helpers: {
            formatPrice: (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price),
            getImageUrl(product) {
                const bgColor = product.imageColor || 'EDF2F7';
                const textColor = this.isColorLight(bgColor) ? '2D3748' : 'FFFFFF';
                return `https://placehold.co/400x300/${bgColor}/${textColor}?text=${product.name}&font=inter`;
            },
            isColorLight(hexcolor){
                if(hexcolor.length < 6) return true;
                const r = parseInt(hexcolor.substr(0, 2), 16);
                const g = parseInt(hexcolor.substr(2, 2), 16);
                const b = parseInt(hexcolor.substr(4, 2), 16);
                const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                return (yiq >= 128);
            }
        },
        
        ui: {
            renderAll() {
                this.renderProducts();
                this.renderDealsSection();
            },

            renderProducts() {
                const { productGrid, skeletonLoader, noResultsEl } = App.DOMElements;
                productGrid.innerHTML = '';
                skeletonLoader.style.display = 'none';

                let productsToRender = App.state.products.filter(p => {
                    const { category, search } = App.state.filter;
                    const categoryMatch = category === 'Semua' || p.category.toLowerCase() === category.toLowerCase();
                    const searchMatch = search ? (p.name.toLowerCase().includes(search) || p.title.toLowerCase().includes(search)) : true;
                    return categoryMatch && searchMatch;
                });
                
                const sortMethod = App.state.filter.sort;
                if(sortMethod === 'price-asc') productsToRender.sort((a,b) => a.variants[0].price - b.variants[0].price);
                if(sortMethod === 'price-desc') productsToRender.sort((a,b) => b.variants[0].price - a.variants[0].price);
                if(sortMethod === 'rating-desc') productsToRender.sort((a,b) => parseFloat(b.rating) - parseFloat(a.rating));
                if(sortMethod === 'best-seller') productsToRender.sort((a,b) => (b.isBestSeller || false) - (a.isBestSeller || false));
                if(sortMethod === 'newest') productsToRender.sort((a,b) => new Date(b.dateAdded) - new Date(a.dateAdded));


                noResultsEl.classList.toggle('hidden', productsToRender.length > 0);
                productGrid.classList.toggle('hidden', productsToRender.length === 0);

                productsToRender.forEach((p, index) => { 
                    const card = document.createElement('div');
                    card.className = 'product-card bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-500/5 dark:shadow-black/10 flex flex-col border border-gray-200/50 dark:border-gray-700/50';
                    card.dataset.id = p.id; 
                    card.style.animationDelay = `${index * 50}ms`;
                    
                    let badgeHtml = '';
                    if(p.deal) badgeHtml = `<div class="product-badge deal">${p.deal.label}</div>`;
                    else if(p.isBestSeller) badgeHtml = '<div class="product-badge best-seller">Best Seller</div>';
                    else if (p.isNew) badgeHtml = '<div class="product-badge">New</div>';

                    card.innerHTML = `
                        ${badgeHtml}
                        <div class="relative">
                            <img src="${App.helpers.getImageUrl(p)}" alt="${p.title}" class="rounded-t-2xl w-full h-32 object-cover">
                        </div>
                        <div class="p-4 flex flex-col items-start flex-grow">
                            <h3 class="font-bold text-base text-gray-800 dark:text-gray-100 h-10">${p.title}</h3>
                            <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <i class="fas fa-star text-yellow-400 mr-1"></i><span class="font-medium">${p.rating}</span>
                                <span class="mx-1.5">&middot;</span>
                                <i class="fas fa-box-open mr-1 text-green-500"></i><span>Stok: ${p.stock}</span>
                             </div>
                        </div>
                        <div class="p-4 pt-2 mt-auto flex items-center justify-between z-10">
                            <div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">Mulai</div>
                                <div class="text-lg font-bold text-blue-600 dark:text-blue-400">${App.helpers.formatPrice(p.variants[0].price)}</div>
                            </div>
                            <button aria-label="Tambah ke keranjang ${p.title}" class="add-to-cart-btn bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg w-12 h-10 text-base font-semibold flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>`;
                    productGrid.appendChild(card);
                });
            },
            renderDealsSection() {
                const { dealsGrid, dealsSection } = App.DOMElements;
                const dealProducts = App.state.products.filter(p => p.deal);
                
                if (dealProducts.length === 0) {
                    dealsSection.style.display = 'none';
                    return;
                }

                dealsSection.style.display = 'block';
                dealsGrid.innerHTML = '';

                dealProducts.forEach(p => {
                    const dealCard = document.createElement('div');
                    dealCard.className = 'product-card bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center gap-4 p-4 border border-emerald-500/30 dark:border-emerald-500/50';
                    dealCard.dataset.id = p.id;

                    dealCard.innerHTML = `
                        <img src="${App.helpers.getImageUrl(p)}" alt="${p.title}" class="w-24 h-24 rounded-lg object-cover">
                        <div class="flex-grow">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-bold text-gray-800 dark:text-white">${p.title}</h4>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">${p.deal.label}</p>
                                </div>
                                <button aria-label="Tambah ke keranjang ${p.title}" class="add-to-cart-btn text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg w-9 h-9 flex-shrink-0 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <div class="mt-2 text-right">
                                <span class="text-sm line-through text-gray-400 dark:text-gray-500">${App.helpers.formatPrice(p.deal.originalPrice)}</span>
                                <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400">${App.helpers.formatPrice(p.variants[0].price)}</p>
                            </div>
                            <div class="deal-countdown-timer mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-end items-center gap-2" data-end-date="${p.deal.endDate}">
                                </div>
                        </div>
                    `;
                    dealsGrid.appendChild(dealCard);
                });
                this.startCountdownTimers();
            },
            startCountdownTimers() {
                App.state.countdownIntervals.forEach(interval => clearInterval(interval));
                App.state.countdownIntervals = [];

                document.querySelectorAll('.deal-countdown-timer').forEach(timerEl => {
                    const endDate = new Date(timerEl.dataset.endDate).getTime();
                    
                    const interval = setInterval(() => {
                        const now = new Date().getTime();
                        const distance = endDate - now;
                        
                        if (distance < 0) {
                            clearInterval(interval);
                            timerEl.innerHTML = '<span class="font-semibold text-red-500">Penawaran berakhir!</span>';
                            return;
                        }
                        
                        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                        
                        timerEl.innerHTML = `
                            <i class="far fa-clock"></i>
                            Berakhir dalam: 
                            <span class="font-bold text-gray-700 dark:text-gray-200">${days}h</span>
                            <span class="font-bold text-gray-700 dark:text-gray-200">${hours}j</span>
                            <span class="font-bold text-gray-700 dark:text-gray-200">${minutes}m</span>
                            <span class="font-bold text-gray-700 dark:text-gray-200">${seconds}d</span>
                        `;
                    }, 1000);
                    App.state.countdownIntervals.push(interval);
                });
            },
            renderCategories() {
                const categories = ['Semua', ...[...new Set(App.state.products.map(p => p.category))].sort()];
                App.DOMElements.categoryTabs.innerHTML = '';
                categories.forEach(category => {
                    const button = document.createElement('button');
                    const isActive = App.state.filter.category === category;
                    button.className = `category-tab-btn capitalize text-sm font-medium px-4 py-2 rounded-full transition-colors duration-300 whitespace-nowrap ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'}`;
                    button.textContent = category;
                    button.dataset.category = category;
                    App.DOMElements.categoryTabs.appendChild(button);
                });
            },
            renderTestimonials() {
                const container = App.DOMElements.testimonialContainer;
                if (!container) return;

                const allTestimonials = App.state.products
                    .flatMap(p => p.testimonials.map(t => ({...t, product: p.title })))
                    .sort(() => 0.5 - Math.random()) // Shuffle
                    .slice(0, 3); // Take 3 random ones

                container.innerHTML = allTestimonials.map(t => `
                    <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50">
                        <div class="flex items-center mb-3">
                            <div class="w-10 h-10 rounded-full mr-4 bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-blue-500">${t.name.charAt(0)}</div>
                            <div>
                                <p class="font-semibold text-gray-800 dark:text-gray-200">${t.name}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Review untuk ${t.product}</p>
                            </div>
                        </div>
                        <blockquote class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">"${t.text}"</blockquote>
                    </div>
                `).join('');
            },
            renderAddToCartModal(productData) {
                const modal = App.DOMElements.modals.add;
                const modalContent = modal.querySelector('.modal-content');
                
                modalContent.innerHTML = `
                    <div class="flex-shrink-0">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-bold text-lg text-gray-900 dark:text-white">Detail Pesanan</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${productData.title}</p>
                            </div>
                            <button aria-label="Tutup" class="close-modal-btn text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-2xl transition">&times;</button>
                        </div>
                    </div>
                    <div class="space-y-4 flex-shrink-0">
                        <div>
                            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Pilih Varian</label>
                            <select id="modalVariantSelect" class="w-full mt-1 p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                ${productData.variants.map(v => `<option value="${v.price}" data-name="${v.name}">${v.name} (${App.helpers.formatPrice(v.price)})</option>`).join('')}
                            </select>
                        </div>
                         <div class="flex justify-between items-center">
                            <div>
                                <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Jumlah</label>
                                <div class="flex items-center mt-1">
                                    <button id="decreaseQty" aria-label="Kurangi Jumlah" class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold w-9 h-9 rounded-l-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition active:scale-90">-</button>
                                    <input type="text" value="1" id="modalQuantity" aria-label="Jumlah" class="w-12 h-9 text-center border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none" readonly>
                                    <button id="increaseQty" aria-label="Tambah Jumlah" class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold w-9 h-9 rounded-r-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition active:scale-90">+</button>
                                </div>
                            </div>
                            <div class="text-right">
                                <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Harga</label>
                                <p id="modalProductPrice" class="font-bold text-xl text-blue-600 dark:text-blue-400"></p>
                            </div>
                        </div>
                        <div>
                            <label for="modalNotes" class="text-sm font-medium text-gray-600 dark:text-gray-400">Catatan (Opsional)</label>
                            <input type="text" id="modalNotes" placeholder="Misal: Email untuk Canva..." class="w-full mt-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500">
                        </div>
                        
                        <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <label for="modalCouponInput" class="text-sm font-medium text-gray-600 dark:text-gray-400">Punya Kupon?</label>
                            <div class="flex gap-2 mt-1">
                                <input type="text" id="modalCouponInput" placeholder="Masukkan Kode Kupon" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm">
                                <button id="modalApplyCouponBtn" class="bg-gray-700 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black font-bold py-2 px-4 rounded-lg transition text-sm flex-shrink-0">Apply</button>
                            </div>
                        </div>

                        <div id="tab-container">
                            <div class="border-b border-gray-200 dark:border-gray-700 flex">
                                <button type="button" class="tab-button active" data-tab="deskripsi">Deskripsi</button>
                                <button type="button" class="tab-button" data-tab="ulasan">Ulasan (${productData.testimonials.length})</button>
                            </div>
                            <div>
                                <div id="deskripsi-panel" class="tab-panel active">
                                    <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">${productData.description || 'Tidak ada deskripsi untuk produk ini.'}</p>
                                </div>
                                <div id="ulasan-panel" class="tab-panel">
                                    ${productData.testimonials && productData.testimonials.length > 0 ? `
                                        <div class="space-y-3">
                                            ${productData.testimonials.map(testimonial => `
                                                <blockquote class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic border-l-2 border-blue-300 dark:border-blue-700 pl-3">"${testimonial.text}"<span class="block not-italic text-xs text-right text-gray-500 mt-1">- ${testimonial.name}</span></blockquote>
                                            `).join('')}
                                        </div>
                                    ` : '<p class="text-sm text-gray-500 dark:text-gray-400">Belum ada ulasan untuk produk ini.</p>'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 pt-2 flex-shrink-0">
                        <button id="addToCartBtn" class="w-full bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200/70 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 font-bold py-3 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm">
                            <i class="fas fa-cart-plus mr-2"></i>Ke Keranjang
                        </button>
                        <button id="directOrderBtn" class="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm">
                            <i class="fab fa-whatsapp mr-2"></i>Order Langsung
                        </button>
                    </div>`;
                
                const updatePrice = () => {
                    const modalContent = document.querySelector('#addToCartModal .modal-content');
                    if (!modalContent) return;

                    const variantSelect = modalContent.querySelector('#modalVariantSelect');
                    const qtyInput = modalContent.querySelector('#modalQuantity');
                    const priceDisplay = modalContent.querySelector('#modalProductPrice');
                    
                    const selectedOption = variantSelect.options[variantSelect.selectedIndex];
                    const basePrice = parseFloat(selectedOption.value);
                    const quantity = parseInt(qtyInput.value);

                    // Reset coupon state on variant change
                    modal.dataset.couponApplied = 'false';
                    modal.dataset.originalPrice = basePrice;
                    modal.dataset.price = basePrice; // current price
                    
                    priceDisplay.innerHTML = App.helpers.formatPrice(basePrice * quantity);
                };

                modal.addEventListener('change', e => { if(e.target.id === 'modalVariantSelect') updatePrice() });
                modal.addEventListener('click', e => { 
                     if(e.target.id === 'decreaseQty' || e.target.id === 'increaseQty') {
                        const qtyInput = modal.querySelector('#modalQuantity');
                        let currentQty = parseInt(qtyInput.value);
                        const currentPrice = parseFloat(modal.dataset.price);
                        modal.querySelector('#modalProductPrice').textContent = App.helpers.formatPrice(currentPrice * currentQty);
                    }
                });

                const tabContainer = modalContent.querySelector('#tab-container');
                if (tabContainer) {
                    tabContainer.querySelectorAll('.tab-button').forEach(button => {
                        button.addEventListener('click', () => {
                            tabContainer.querySelector('.tab-button.active').classList.remove('active');
                            tabContainer.querySelector('.tab-panel.active').classList.remove('active');
                            button.classList.add('active');
                            tabContainer.querySelector(`#${button.dataset.tab}-panel`).classList.add('active');
                        });
                    });
                }
                modal.dataset.productId = productData.id;
                updatePrice(); // Initial price calculation
                this.openModal(modal);
            },
            renderCartView() {
                const modal = App.DOMElements.modals.cart;
                const modalContent = modal.querySelector('.modal-content');
                const subtotal = App.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const discountAmount = subtotal * App.state.discount.rate;
                const total = subtotal - discountAmount;
                
                modalContent.innerHTML = `
                    <div class="flex justify-between items-center mb-4 flex-shrink-0">
                        <h3 class="font-bold text-lg flex items-center text-gray-900 dark:text-white"><i class="fas fa-shopping-cart text-blue-500 mr-2"></i>Keranjang Anda</h3>
                        <button aria-label="Tutup" class="close-modal-btn text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-2xl transition">&times;</button>
                    </div>
                    <div class="flex-grow overflow-y-auto space-y-3 pr-1.5 -mr-1.5">
                        ${App.state.cart.length > 0 ? App.state.cart.map((item, index) => `
                            <div class="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div class="flex-grow">
                                    <p class="font-bold text-sm text-gray-800 dark:text-gray-200">${item.name}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">${item.variant} ${item.couponUsed ? `<span class='text-green-500 font-medium'>(Kupon: ${item.couponUsed})</span>` : ''}</p>
                                    ${item.notes ? `<p class="text-xs text-yellow-600 dark:text-yellow-400 mt-1 italic">Catatan: ${item.notes}</p>` : ''}
                                    <p class="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1.5">${App.helpers.formatPrice(item.price)}</p>
                                </div>
                                <div class="flex flex-col items-end gap-2">
                                    <div class="flex items-center">
                                        <input type="number" value="${item.quantity}" min="1" data-index="${index}" aria-label="Jumlah untuk ${item.name}" class="cart-qty-input w-12 text-center border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm py-1">
                                        <button data-index="${index}" aria-label="Hapus ${item.name}" class="remove-cart-item text-red-500 hover:text-red-700 transition ml-3 text-lg"><i class="fas fa-trash-alt"></i></button>
                                    </div>
                                    <p class="font-bold text-gray-800 dark:text-gray-200 text-sm">${App.helpers.formatPrice(item.price * item.quantity)}</p>
                                </div>
                            </div>
                        `).join('') : `
                            <div class="text-center py-10 flex flex-col justify-center items-center h-full">
                                <figure class="w-40 mx-auto mb-4 text-gray-300 dark:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.55 13c.75 0 1.41-.41 1.75-1.03l3.58-6.49A.996.996 0 0 0 20.01 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.24 17 6.5 17H20v-2H6.5c-.33 0-.54-.25-.4-.5l.93-1.68.94-2h7.02zM6.16 6h12.15l-2.76 5H8.53L6.16 6zM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg></figure>
                                <h3 class="font-bold text-lg text-gray-800 dark:text-gray-200">Keranjang Kosong</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Ayo, isi dengan produk favoritmu!</p>
                            </div>
                        `}
                    </div>
                    ${App.state.cart.length > 0 ? `
                    <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div class="flex gap-2 mb-3">
                            <input type="text" id="couponInput" placeholder="Masukkan Kode Kupon" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm">
                            <button id="applyCouponBtn" class="bg-gray-700 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black font-bold py-2 px-4 rounded-lg transition text-sm">Apply</button>
                        </div>
                        <div class="space-y-1 text-sm">
                            <div class="flex justify-between items-center text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>${App.helpers.formatPrice(subtotal)}</span></div>
                            ${App.state.discount.rate > 0 ? `<div class="flex justify-between items-center text-green-600 dark:text-green-400"><span>Diskon (${App.state.discount.code})</span><span>-${App.helpers.formatPrice(discountAmount)}</span></div>` : ''}
                            <div class="flex justify-between items-center font-bold text-base text-gray-900 dark:text-white pt-1 border-t border-dashed dark:border-gray-600 mt-2"><span>Total</span><span>${App.helpers.formatPrice(total)}</span></div>
                        </div>
                        <div class="text-right mt-2"><button id="clearCartBtn" class="text-xs text-red-500 hover:underline font-medium">Kosongkan Keranjang</button></div>
                        <button id="checkoutBtn" class="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95">
                            <i class="fab fa-whatsapp mr-2"></i> Checkout via WhatsApp
                        </button>
                    </div>
                    ` : ''}
                `;
                this.openModal(modal);
            },
            populateSearchDatalist() {
                const datalist = App.DOMElements.searchSuggestions;
                datalist.innerHTML = App.state.products.map(p => `<option value="${p.title}"></option>`).join('');
            },
            updateCartBadge() {
                const totalItems = App.state.cart.reduce((sum, item) => sum + item.quantity, 0);
                App.DOMElements.cartBadge.textContent = totalItems;
                App.DOMElements.cartBadge.classList.toggle('scale-0', totalItems === 0);
            },
            showToast(message, icon = 'fa-check-circle', color = 'bg-green-500') {
                const toast = document.createElement('div');
                toast.className = `toast-notification ${color} text-white text-sm font-semibold p-3 rounded-xl shadow-lg flex items-center gap-3`;
                toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
                App.DOMElements.toastContainer.appendChild(toast);
                setTimeout(() => toast.remove(), 3500);
            },
            openModal(modal) {
                modal.classList.add('active');
                document.body.classList.add('modal-open');
            },
            closeModal(modal) {
                modal.classList.remove('active');
                if (!document.querySelector('.modal.active')) document.body.classList.remove('modal-open');
            },
            flyToCartAnimation(startElement) {
                const flyingImg = document.createElement('img');
                const startRect = startElement.getBoundingClientRect();
                const cartRect = App.DOMElements.cartBadge.getBoundingClientRect();
                
                flyingImg.src = startElement.src;
                flyingImg.classList.add('fly-to-cart');
                document.body.appendChild(flyingImg);
                
                flyingImg.style.cssText = `
                    position: fixed; left: ${startRect.left}px; top: ${startRect.top}px;
                    width: ${startRect.width}px; height: ${startRect.height}px; z-index: 9999;
                    border-radius: 0.5rem; object-fit: cover;
                `;

                requestAnimationFrame(() => {
                    flyingImg.style.transform = `translate(${cartRect.left - startRect.left}px, ${cartRect.top - startRect.top}px) scale(0.2)`;
                    flyingImg.style.opacity = '0';
                });

                setTimeout(() => {
                    flyingImg.remove();
                    App.DOMElements.cartBadge.classList.add('transform', 'scale-125', 'transition-transform', 'duration-200');
                    setTimeout(() => App.DOMElements.cartBadge.classList.remove('scale-125'), 200);
                }, 800);
            },
            setupHeroSlider() {
                new Swiper('.hero-slider', {
                    loop: true,
                    autoplay: { delay: 5000, disableOnInteraction: false, },
                    pagination: { el: '.swiper-pagination', clickable: true, },
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev', },
                });
            }
        },

        cart: {
            add(item, startElement) {
                const existingItem = App.state.cart.find(i => i.id === item.id && i.notes === item.notes && i.price === item.price);
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                    App.ui.showToast(`Jumlah "${item.name}" diperbarui.`);
                } else {
                    App.state.cart.push(item);
                    App.ui.showToast(`"${item.name}" ditambahkan.`);
                }
                if (startElement) App.ui.flyToCartAnimation(startElement);
                this.save();
            },
            updateQty(index, newQty) {
                if (newQty < 1) newQty = 1;
                App.state.cart[index].quantity = newQty;
                this.save();
                App.ui.renderCartView();
            },
            remove(index) {
                const removedItem = App.state.cart.splice(index, 1);
                this.save();
                App.ui.renderCartView();
                App.ui.showToast(`"${removedItem[0].name}" dihapus.`, 'fa-trash-alt', 'bg-red-500');
            },
            clear() {
                App.state.cart = [];
                App.state.discount = { code: null, rate: 0 };
                this.save();
                App.ui.renderCartView();
                App.ui.showToast('Keranjang telah dikosongkan.', 'fa-trash', 'bg-blue-500');
            },
            applyCoupon(code) {
                 if (code.toUpperCase() === 'DMAZALYXERS10') {
                    App.state.discount = { code: code.toUpperCase(), rate: 0.10 };
                    App.ui.showToast('Kupon berhasil diterapkan!', 'fa-tags', 'bg-green-500');
                } else {
                    App.state.discount = { code: null, rate: 0 };
                    App.ui.showToast('Kupon tidak valid.', 'fa-exclamation-circle', 'bg-red-500');
                }
                App.ui.renderCartView();
            },
            applyModalCoupon() {
                const modal = App.DOMElements.modals.add;
                const code = modal.querySelector('#modalCouponInput').value.toUpperCase();
                const productId = parseInt(modal.dataset.productId);
                const qty = parseInt(modal.querySelector('#modalQuantity').value);
                const priceDisplay = modal.querySelector('#modalProductPrice');
                const originalPrice = parseFloat(modal.dataset.originalPrice);

                if (code === 'DMAZYT1B' && productId === 1) {
                    const newPrice = 1000;
                    modal.dataset.price = newPrice;
                    modal.dataset.couponApplied = code;
                    priceDisplay.innerHTML = `<span class="line-through text-gray-500 text-base mr-2">${App.helpers.formatPrice(originalPrice * qty)}</span> ${App.helpers.formatPrice(newPrice * qty)}`;
                    App.ui.showToast('Kupon YouTube Rp1rb berhasil!', 'fa-tags', 'bg-green-500');
                } else {
                    modal.dataset.price = originalPrice;
                    modal.dataset.couponApplied = 'false';
                    priceDisplay.innerHTML = App.helpers.formatPrice(originalPrice * qty);
                    App.ui.showToast('Kupon tidak valid untuk item ini.', 'fa-exclamation-circle', 'bg-red-500');
                }
            },
            save() {
                localStorage.setItem('dmazAlyxersCart', JSON.stringify(App.state.cart));
                App.ui.updateCartBadge();
            },
            load() {
                App.state.cart = JSON.parse(localStorage.getItem('dmazAlyxersCart') || '[]');
                App.ui.updateCartBadge();
            }
        },

        theme: {
            apply(theme) {
                const isDark = theme === 'dark';
                document.documentElement.classList.toggle('dark', isDark);
                App.DOMElements.themeIcons.dark.style.display = isDark ? 'inline-block' : 'none';
                App.DOMElements.themeIcons.light.style.display = isDark ? 'none' : 'inline-block';
            },
            toggle() {
                const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                localStorage.setItem('theme', newTheme);
                this.apply(newTheme);
            },
            load() {
                return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            }
        },
        
        checkout: {
            process(isDirect = false) {
                const noWhatsapp = "6289603659756";
                let pesan;
                const header = "Halo Dmaz Alyxers, saya mau order:\n====================\n\n";
                let footer = "\n====================\nMohon info untuk proses selanjutnya. Terima kasih 🙏";

                if (isDirect) {
                    const modal = App.DOMElements.modals.add;
                    const productId = parseInt(modal.dataset.productId);
                    const productData = App.state.products.find(p => p.id === productId);
                    const variantSelect = modal.querySelector('#modalVariantSelect');
                    const variantName = variantSelect.options[variantSelect.selectedIndex].dataset.name;
                    const price = parseFloat(modal.dataset.price);
                    const quantity = parseInt(modal.querySelector('#modalQuantity').value);
                    const notes = modal.querySelector('#modalNotes').value.trim();
                    const couponCode = modal.dataset.couponApplied;
                    const total = price * quantity;

                    let couponInfo = couponCode && couponCode !== 'false' ? `*Kupon Digunakan:* ${couponCode}\n` : '';

                    pesan = `${header}*Produk:* ${productData.title}\n*Varian:* ${variantName}\n*Jumlah:* ${quantity}\n${notes ? `*Catatan:* ${notes}\n` : ''}${couponInfo}*Harga:* ${App.helpers.formatPrice(total)}${footer}`;
                    App.ui.closeModal(modal);
                } else {
                    if (App.state.cart.length === 0) return;
                    
                    let cartDetails = App.state.cart.map(item => {
                        const subtotal = item.price * item.quantity;
                        let couponInfo = item.couponUsed ? ` (Kupon: ${item.couponUsed})` : '';
                        return `*Produk:* ${item.name} (${item.variant})${couponInfo}\n*Jumlah:* ${item.quantity} x ${App.helpers.formatPrice(item.price)}\n${item.notes ? `*Catatan:* ${item.notes}\n` : ''}*Subtotal:* ${App.helpers.formatPrice(subtotal)}`;
                    }).join('\n\n');
                    
                    const subtotal = App.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    const discountAmount = subtotal * App.state.discount.rate;
                    const finalTotal = subtotal - discountAmount;
                    
                    let totalSection = `\n*Subtotal:* ${App.helpers.formatPrice(subtotal)}`;
                    if(App.state.discount.rate > 0) {
                        totalSection += `\n*Diskon (${App.state.discount.code}):* -${App.helpers.formatPrice(discountAmount)}`;
                    }
                    totalSection += `\n*TOTAL PESANAN:* ${App.helpers.formatPrice(finalTotal)}`;
                    
                    pesan = `${header}${cartDetails}\n\n${totalSection}${footer}`;
                    
                    App.cart.clear();
                    App.ui.closeModal(App.DOMElements.modals.cart);
                }
                window.open(`https://wa.me/${noWhatsapp}?text=${encodeURIComponent(pesan)}`, '_blank');
            }
        },

        listeners: {
            setup() {
                document.body.addEventListener('click', this.handleBodyClick);
                App.DOMElements.searchInput.addEventListener('input', () => { App.state.filter.search = App.DOMElements.searchInput.value.toLowerCase(); App.ui.renderProducts(); });
                App.DOMElements.sortControl.addEventListener('change', () => { App.state.filter.sort = App.DOMElements.sortControl.value; App.ui.renderProducts(); });
                App.DOMElements.buttons.themeToggle.addEventListener('click', () => App.theme.toggle());
                App.DOMElements.buttons.openCart.addEventListener('click', () => App.ui.renderCartView());
                
                App.DOMElements.modals.cart.addEventListener('input', e => {
                    if (e.target.classList.contains('cart-qty-input')) {
                        App.cart.updateQty(e.target.dataset.index, parseInt(e.target.value));
                    }
                });

                window.addEventListener('scroll', () => {
                    App.DOMElements.mainHeader.classList.toggle('scrolled', window.scrollY > 50);
                });
            },
            handleBodyClick(e) {
                const target = e.target;
                
                const productCard = target.closest('.product-card');
                if (productCard && !target.closest('.add-to-cart-btn')) {
                    e.preventDefault();
                    const productData = App.state.products.find(p => p.id === parseInt(productCard.dataset.id));
                    if(productData) App.ui.renderAddToCartModal(productData);
                } else if (target.closest('.add-to-cart-btn')) {
                     const card = target.closest('.product-card');
                     const productData = App.state.products.find(p => p.id === parseInt(card.dataset.id));
                     if(productData) App.ui.renderAddToCartModal(productData);
                }
                
                const categoryBtn = target.closest('.category-tab-btn');
                if (categoryBtn) {
                    App.state.filter.category = categoryBtn.dataset.category;
                    App.ui.renderAll();
                    App.ui.renderCategories();
                }
                
                const categoryDirectLink = target.closest('.category-direct-link');
                if (categoryDirectLink) {
                    e.preventDefault();
                    const category = categoryDirectLink.dataset.category;
                    App.state.filter.category = category;
                    App.ui.renderAll();
                    App.ui.renderCategories();
                    document.getElementById('productGrid').scrollIntoView({ behavior: 'smooth' });
                }
                
                const parentModal = target.closest('.modal');
                if (parentModal) {
                    if (target.closest('.close-modal-btn') || target === parentModal) App.ui.closeModal(parentModal);
                    if (target.id === 'decreaseQty') { let qtyInput = parentModal.querySelector('#modalQuantity'); let qty = parseInt(qtyInput.value); if (qty > 1) qtyInput.value = qty - 1; }
                    if (target.id === 'increaseQty') parentModal.querySelector('#modalQuantity').value = parseInt(parentModal.querySelector('#modalQuantity').value) + 1;
                    if (target.id === 'addToCartBtn') App.listeners.handleAddToCart(target);
                    if (target.id === 'directOrderBtn') App.checkout.process(true);
                    if (target.id === 'checkoutBtn') App.checkout.process(false);
                    if (target.id === 'clearCartBtn') App.cart.clear();
                    if (target.id === 'applyCouponBtn') App.cart.applyCoupon(parentModal.querySelector('#couponInput').value);
                    if (target.id === 'modalApplyCouponBtn') App.cart.applyModalCoupon();
                    if (target.closest('.remove-cart-item')) App.cart.remove(target.closest('.remove-cart-item').dataset.index);
                }
            },
            handleAddToCart(button) {
                const modal = button.closest('.modal');
                const productId = parseInt(modal.dataset.productId);
                const productData = App.state.products.find(p => p.id === productId);
                const variantSelect = modal.querySelector('#modalVariantSelect');
                const variantName = variantSelect.options[variantSelect.selectedIndex].dataset.name;
                const price = parseFloat(modal.dataset.price);
                const quantity = parseInt(modal.querySelector('#modalQuantity').value);
                const notes = modal.querySelector('#modalNotes').value.trim();
                const couponUsed = modal.dataset.couponApplied && modal.dataset.couponApplied !== 'false' ? modal.dataset.couponApplied : null;

                const startElement = document.querySelector(`.product-card[data-id="${productId}"] img`);
                
                const newItem = { id: `${productId}-${variantName}-${price}`, name: productData.title, variant: variantName, price, quantity, notes, couponUsed };
                App.cart.add(newItem, startElement);
                App.ui.closeModal(modal);
            }
        }
    };

    App.init();
});