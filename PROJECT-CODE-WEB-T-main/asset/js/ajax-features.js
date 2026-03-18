// ========================================
// AJAX-FEATURES.JS - TÍNH NĂNG AJAX & TIMER
// ========================================

console.log('AJAX Features loaded!');

// ========================================
// 1. COUNTDOWN TIMER CHO HOT OFFERS
// ========================================
class CountdownTimer {
    constructor(endTime, elementId) {
        this.endTime = new Date(endTime).getTime();
        this.element = document.getElementById(elementId);
        this.interval = null;
    }
    
    start() {
        this.update();
        this.interval = setInterval(() => this.update(), 1000);
    }
    
    update() {
        const now = new Date().getTime();
        const distance = this.endTime - now;
        
        if (distance < 0) {
            clearInterval(this.interval);
            this.element.innerHTML = '<span class="expired">🔥 Đã hết hạn!</span>';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        this.element.innerHTML = `
            <div class="countdown-display">
                <div class="countdown-unit">
                    <span class="countdown-number">${this.pad(days)}</span>
                    <span class="countdown-label">Ngày</span>
                </div>
                <div class="countdown-separator">:</div>
                <div class="countdown-unit">
                    <span class="countdown-number">${this.pad(hours)}</span>
                    <span class="countdown-label">Giờ</span>
                </div>
                <div class="countdown-separator">:</div>
                <div class="countdown-unit">
                    <span class="countdown-number">${this.pad(minutes)}</span>
                    <span class="countdown-label">Phút</span>
                </div>
                <div class="countdown-separator">:</div>
                <div class="countdown-unit">
                    <span class="countdown-number">${this.pad(seconds)}</span>
                    <span class="countdown-label">Giây</span>
                </div>
            </div>
        `;
    }
    
    pad(num) {
        return num < 10 ? '0' + num : num;
    }
    
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

// Khởi tạo countdown timers cho trang Hot Offers
document.addEventListener('DOMContentLoaded', function() {
    const dealTimers = document.querySelectorAll('.deal-timer[data-end-time]');
    
    dealTimers.forEach(timer => {
        const endTime = timer.getAttribute('data-end-time');
        const timerId = timer.id;
        
        if (endTime && timerId) {
            const countdown = new CountdownTimer(endTime, timerId);
            countdown.start();
        }
    });
});

// ========================================
// 2. LIVE SEARCH VỚI AJAX
// ========================================
class LiveSearch {
    constructor() {
        this.searchInput = document.querySelector('.header-search input');
        this.searchResults = this.createResultsContainer();
        this.debounceTimer = null;
        this.minChars = 2;
        
        if (this.searchInput) {
            this.init();
        }
    }
    
    createResultsContainer() {
        const container = document.createElement('div');
        container.className = 'search-results-dropdown';
        container.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 2px solid var(--eco-green);
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 400px;
            overflow-y: auto;
            display: none;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        if (this.searchInput) {
            this.searchInput.parentElement.style.position = 'relative';
            this.searchInput.parentElement.appendChild(container);
        }
        
        return container;
    }
    
    init() {
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            
            const query = e.target.value.trim();
            
            if (query.length < this.minChars) {
                this.hideResults();
                return;
            }
            
            // Debounce 300ms
            this.debounceTimer = setTimeout(() => {
                this.search(query);
            }, 300);
        });
        
        // Đóng khi click ra ngoài
        document.addEventListener('click', (e) => {
            if (!this.searchInput.parentElement.contains(e.target)) {
                this.hideResults();
            }
        });
    }
    
    async search(query) {
        this.showLoading();
        
        try {
            // DEMO: Giả lập AJAX call
            // Trong thực tế: const response = await fetch(`/api/search?q=${query}`);
            
            setTimeout(() => {
                const results = this.mockSearchResults(query);
                this.displayResults(results, query);
            }, 500);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError();
        }
    }
    
    mockSearchResults(query) {
        // DEMO: Dữ liệu giả lập
        const products = [
            { id: 1, name: 'Áo Voan Thêu Hoa EcoSoft', price: '560,000đ', image: 'asset/images/hobo/hobo_aokieu/Hobo_Aokieu1/Hobo_Aokieu1.1.jpg', category: 'Hobo - Áo' },
            { id: 2, name: 'Áo Ren EcoLace Satin', price: '520,000đ', image: 'asset/images/hobo/hobo_aokieu/Hobo_Aokieu2/Hobo_Aokieu2.1.jpg', category: 'Hobo - Áo' },
            { id: 3, name: 'Quần Linen Dáng Suông', price: '480,000đ', image: 'asset/images/hobo/hobo_quan/Hobo_Quan1/Hobo_Quan1.1.jpg', category: 'Hobo - Quần' }
        ];
        
        return products.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    showLoading() {
        this.searchResults.innerHTML = `
            <div class="search-loading" style="padding: 20px; text-align: center; color: var(--eco-green);">
                <i class="ri-loader-4-line" style="font-size: 24px; animation: spin 1s linear infinite;"></i>
                <p style="margin-top: 10px;">Đang tìm kiếm...</p>
            </div>
        `;
        this.searchResults.style.display = 'block';
    }
    
    displayResults(results, query) {
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-no-results" style="padding: 30px; text-align: center;">
                    <i class="ri-search-line" style="font-size: 48px; color: #ccc;"></i>
                    <p style="margin-top: 10px; color: #666;">Không tìm thấy sản phẩm "${query}"</p>
                </div>
            `;
            this.searchResults.style.display = 'block';
            return;
        }
        
        let html = '<div class="search-results-list" style="padding: 10px 0;">';
        
        results.forEach(product => {
            html += `
                <a href="product-detail.html?id=${product.id}" class="search-result-item" style="
                    display: flex;
                    align-items: center;
                    padding: 12px 15px;
                    border-bottom: 1px solid #f0f0f0;
                    transition: background 0.2s;
                    text-decoration: none;
                    color: inherit;
                ">
                    <img src="${product.image}" alt="${product.name}" style="
                        width: 60px;
                        height: 60px;
                        object-fit: cover;
                        border-radius: 8px;
                        margin-right: 15px;
                    ">
                    <div style="flex: 1;">
                        <h4 style="
                            font-size: 14px;
                            font-weight: 600;
                            margin-bottom: 5px;
                            color: #333;
                        ">${this.highlightQuery(product.name, query)}</h4>
                        <p style="
                            font-size: 12px;
                            color: #888;
                            margin-bottom: 5px;
                        ">${product.category}</p>
                        <p style="
                            font-size: 14px;
                            font-weight: 600;
                            color: var(--eco-green);
                        ">${product.price}</p>
                    </div>
                    <i class="ri-arrow-right-s-line" style="font-size: 20px; color: #ccc;"></i>
                </a>
            `;
        });
        
        html += `
            <a href="product.html?search=${query}" class="search-view-all" style="
                display: block;
                padding: 15px;
                text-align: center;
                color: var(--eco-green);
                font-weight: 600;
                border-top: 2px solid #f0f0f0;
                text-decoration: none;
            ">
                Xem tất cả kết quả (${results.length})
                <i class="ri-arrow-right-line"></i>
            </a>
        `;
        
        html += '</div>';
        
        this.searchResults.innerHTML = html;
        this.searchResults.style.display = 'block';
        
        // Add hover effect
        const items = this.searchResults.querySelectorAll('.search-result-item');
        items.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.background = '#f9f9f9';
            });
            item.addEventListener('mouseleave', function() {
                this.style.background = 'transparent';
            });
        });
    }
    
    highlightQuery(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark style="background: #fff3cd; padding: 2px 4px; border-radius: 3px;">$1</mark>');
    }
    
    showError() {
        this.searchResults.innerHTML = `
            <div class="search-error" style="padding: 20px; text-align: center; color: #d32f2f;">
                <i class="ri-error-warning-line" style="font-size: 24px;"></i>
                <p style="margin-top: 10px;">Có lỗi xảy ra. Vui lòng thử lại!</p>
            </div>
        `;
        this.searchResults.style.display = 'block';
    }
    
    hideResults() {
        this.searchResults.style.display = 'none';
    }
}

// Khởi tạo Live Search
const liveSearch = new LiveSearch();

// ========================================
// 3. MINI CART DROPDOWN VỚI AJAX
// ========================================
class MiniCart {
    constructor() {
        this.cartIcon = document.querySelector('.header-cart');
        this.dropdown = this.createDropdown();
        this.init();
    }
    
    createDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'mini-cart-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            width: 350px;
            background: white;
            border: 2px solid var(--eco-green);
            border-radius: 8px;
            margin-top: 10px;
            display: none;
            z-index: 1000;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        `;
        
        if (this.cartIcon) {
            this.cartIcon.style.position = 'relative';
            this.cartIcon.appendChild(dropdown);
        }
        
        return dropdown;
    }
    
    init() {
        if (!this.cartIcon) return;
        
        // Show dropdown on hover
        this.cartIcon.addEventListener('mouseenter', () => {
            this.loadCart();
        });
        
        this.cartIcon.addEventListener('mouseleave', (e) => {
            // Giữ dropdown mở khi hover vào dropdown
            if (!this.dropdown.contains(e.relatedTarget)) {
                setTimeout(() => {
                    if (!this.dropdown.matches(':hover')) {
                        this.hideDropdown();
                    }
                }, 200);
            }
        });
        
        this.dropdown.addEventListener('mouseleave', () => {
            this.hideDropdown();
        });
    }
    
    async loadCart() {
        this.showLoading();
        
        try {
            // DEMO: Giả lập AJAX call
            setTimeout(() => {
                const cartItems = this.mockCartData();
                this.displayCart(cartItems);
            }, 300);
            
        } catch (error) {
            console.error('Load cart error:', error);
        }
    }
    
    mockCartData() {
        // DEMO: Dữ liệu giả lập
        return [
            {
                id: 1,
                name: 'Áo Voan Thêu Hoa',
                size: 'M',
                price: 560000,
                quantity: 1,
                image: 'asset/images/hobo/hobo_aokieu/Hobo_Aokieu1/Hobo_Aokieu1.1.jpg'
            },
            {
                id: 2,
                name: 'Quần Linen Dáng Suông',
                size: 'L',
                price: 480000,
                quantity: 2,
                image: 'asset/images/hobo/hobo_quan/Hobo_Quan1/Hobo_Quan1.1.jpg'
            }
        ];
    }
    
    showLoading() {
        this.dropdown.innerHTML = `
            <div style="padding: 30px; text-align: center;">
                <i class="ri-loader-4-line" style="font-size: 32px; color: var(--eco-green); animation: spin 1s linear infinite;"></i>
            </div>
        `;
        this.dropdown.style.display = 'block';
    }
    
    displayCart(items) {
        if (items.length === 0) {
            this.dropdown.innerHTML = `
                <div style="padding: 40px 20px; text-align: center;">
                    <i class="ri-shopping-cart-line" style="font-size: 48px; color: #ccc;"></i>
                    <p style="margin-top: 15px; color: #666;">Giỏ hàng trống</p>
                    <a href="product.html" class="main-btn" style="
                        display: inline-block;
                        margin-top: 15px;
                        padding: 8px 20px;
                        font-size: 14px;
                    ">Mua sắm ngay</a>
                </div>
            `;
            this.dropdown.style.display = 'block';
            return;
        }
        
        let total = 0;
        let html = `
            <div class="mini-cart-header" style="
                padding: 15px;
                border-bottom: 2px solid #f0f0f0;
                font-weight: 600;
                color: var(--eco-green);
            ">
                <i class="ri-shopping-cart-fill"></i> Giỏ hàng (${items.length} sản phẩm)
            </div>
            <div class="mini-cart-items" style="
                max-height: 300px;
                overflow-y: auto;
                padding: 10px;
            ">
        `;
        
        items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            html += `
                <div class="mini-cart-item" style="
                    display: flex;
                    gap: 12px;
                    padding: 10px;
                    border-bottom: 1px solid #f0f0f0;
                ">
                    <img src="${item.image}" alt="${item.name}" style="
                        width: 60px;
                        height: 60px;
                        object-fit: cover;
                        border-radius: 8px;
                    ">
                    <div style="flex: 1;">
                        <h4 style="
                            font-size: 13px;
                            font-weight: 600;
                            margin-bottom: 5px;
                        ">${item.name}</h4>
                        <p style="
                            font-size: 12px;
                            color: #888;
                            margin-bottom: 5px;
                        ">Size: ${item.size} | SL: ${item.quantity}</p>
                        <p style="
                            font-size: 14px;
                            font-weight: 600;
                            color: var(--eco-green);
                        ">${this.formatPrice(itemTotal)}</p>
                    </div>
                    <button class="mini-cart-remove" data-id="${item.id}" style="
                        background: none;
                        border: none;
                        color: #999;
                        cursor: pointer;
                        font-size: 18px;
                        padding: 5px;
                    ">
                        <i class="ri-close-line"></i>
                    </button>
                </div>
            `;
        });
        
        html += `
            </div>
            <div class="mini-cart-footer" style="
                padding: 15px;
                border-top: 2px solid #f0f0f0;
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                    font-size: 16px;
                    font-weight: 600;
                ">
                    <span>Tổng cộng:</span>
                    <span style="color: var(--eco-green);">${this.formatPrice(total)}</span>
                </div>
                <a href="cart.html" class="main-btn" style="
                    display: block;
                    text-align: center;
                    padding: 12px;
                    width: 100%;
                ">
                    <i class="ri-shopping-cart-line"></i> Xem giỏ hàng
                </a>
            </div>
        `;
        
        this.dropdown.innerHTML = html;
        this.dropdown.style.display = 'block';
        
        // Add remove functionality
        const removeButtons = this.dropdown.querySelectorAll('.mini-cart-remove');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.getAttribute('data-id');
                this.removeItem(itemId);
            });
        });
    }
    
    async removeItem(itemId) {
        try {
            // DEMO: Giả lập AJAX remove
            console.log('Removing item:', itemId);
            
            // Reload cart
            setTimeout(() => {
                this.loadCart();
            }, 200);
            
        } catch (error) {
            console.error('Remove item error:', error);
        }
    }
    
    formatPrice(price) {
        return price.toLocaleString('vi-VN') + 'đ';
    }
    
    hideDropdown() {
        this.dropdown.style.display = 'none';
    }
}

// Khởi tạo Mini Cart
const miniCart = new MiniCart();

// ========================================
// 4. NEWSLETTER SUBSCRIPTION AJAX
// ========================================
class Newsletter {
    constructor() {
        this.form = document.getElementById('newsletterForm');
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = this.form.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!this.validateEmail(email)) {
                this.showMessage('Email không hợp lệ!', 'error');
                return;
            }
            
            this.showLoading();
            
            try {
                // DEMO: Giả lập AJAX call
                await this.subscribe(email);
                
                this.showMessage('Đăng ký thành công! Cảm ơn bạn đã quan tâm.', 'success');
                emailInput.value = '';
                
            } catch (error) {
                this.showMessage('Có lỗi xảy ra. Vui lòng thử lại!', 'error');
                console.error('Newsletter error:', error);
            }
        });
    }
    
    async subscribe(email) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Newsletter subscribed:', email);
                // Trong thực tế: await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) })
                resolve();
            }, 1000);
        });
    }
    
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    showLoading() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ri-loader-4-line" style="animation: spin 1s linear infinite;"></i> Đang xử lý...';
    }
    
    showMessage(message, type) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Đăng ký';
        
        // Show toast notification
        const toast = document.createElement('div');
        toast.className = `newsletter-toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : '#f44336'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Khởi tạo Newsletter
const newsletter = new Newsletter();

// ========================================
// 5. PRODUCT QUICK VIEW MODAL
// ========================================
class QuickView {
    constructor() {
        this.modal = this.createModal();
        this.init();
    }
    
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="quick-view-overlay"></div>
            <div class="quick-view-content">
                <button class="quick-view-close">
                    <i class="ri-close-line"></i>
                </button>
                <div class="quick-view-body"></div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: none;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(modal);
        return modal;
    }
    
    init() {
        // Add quick view buttons to products
        const productItems = document.querySelectorAll('.product-item, .hot-product-item');
        
        productItems.forEach(item => {
            const quickViewBtn = document.createElement('button');
            quickViewBtn.className = 'quick-view-btn';
            quickViewBtn.innerHTML = '<i class="ri-eye-line"></i> Xem nhanh';
            quickViewBtn.style.cssText = `
                position: absolute;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--eco-green);
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 6px;
                font-size: 13px;
                cursor: pointer;
                opacity: 0;
                transition: all 0.3s;
                z-index: 10;
            `;
            
            const imgContainer = item.querySelector('.product-image');
            if (imgContainer) {
                imgContainer.style.position = 'relative';
                imgContainer.appendChild(quickViewBtn);
            }
            
            // Show button on hover
            item.addEventListener('mouseenter', () => {
                quickViewBtn.style.opacity = '1';
            });
            
            item.addEventListener('mouseleave', () => {
                quickViewBtn.style.opacity = '0';
            });
            
            // Open modal on click
            quickViewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.open(item);
            });
        });
        
        // Close modal
        const closeBtn = this.modal.querySelector('.quick-view-close');
        const overlay = this.modal.querySelector('.quick-view-overlay');
        
        closeBtn.addEventListener('click', () => this.close());
        overlay.addEventListener('click', () => this.close());
    }
    
    open(productItem) {
        const productData = this.extractProductData(productItem);
        this.renderContent(productData);
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    extractProductData(item) {
        return {
            name: item.querySelector('h3, p a')?.textContent || 'Sản phẩm',
            price: item.querySelector('.price-current, .product-item-price')?.textContent || '0đ',
            image: item.querySelector('img')?.src || '',
            material: item.querySelector('.product-material')?.textContent || '100% Organic Cotton'
        };
    }
    
    renderContent(data) {
        const content = this.modal.querySelector('.quick-view-body');
        
        content.innerHTML = `
            <div class="quick-view-grid" style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                max-width: 800px;
                background: white;
                padding: 30px;
                border-radius: 12px;
            ">
                <div class="quick-view-image">
                    <img src="${data.image}" alt="${data.name}" style="
                        width: 100%;
                        border-radius: 8px;
                        object-fit: cover;
                    ">
                </div>
                <div class="quick-view-info">
                    <h2 style="
                        font-family: var(--heading-font);
                        color: var(--eco-green);
                        margin-bottom: 15px;
                    ">${data.name}</h2>
                    <p style="
                        font-size: 12px;
                        color: var(--eco-green);
                        margin-bottom: 10px;
                    ">${data.material}</p>
                    <p style="
                        font-size: 24px;
                        font-weight: 700;
                        color: #333;
                        margin-bottom: 20px;
                    ">${data.price}</p>
                    
                    <div class="quick-view-sizes" style="margin-bottom: 20px;">
                        <p style="font-weight: 600; margin-bottom: 10px;">Chọn size:</p>
                        <div style="display: flex; gap: 10px;">
                            ${['S', 'M', 'L', 'XL'].map(size => `
                                <button class="size-btn" style="
                                    width: 45px;
                                    height: 45px;
                                    border: 2px solid var(--light-gray);
                                    background: white;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-weight: 600;
                                    transition: all 0.3s;
                                " onclick="this.style.background='var(--eco-green)'; this.style.color='white';">${size}</button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="quick-view-quantity" style="margin-bottom: 20px;">
                        <p style="font-weight: 600; margin-bottom: 10px;">Số lượng:</p>
                        <div class="product-detail-right-quantity-input" style="
                            display: inline-flex;
                            align-items: center;
                            border: 1px solid #ccc;
                            border-radius: 8px;
                            overflow: hidden;
                        ">
                            <i class="ri-subtract-line" style="padding: 8px 12px; cursor: pointer;"></i>
                            <input type="number" value="1" min="1" style="
                                width: 50px;
                                text-align: center;
                                border: none;
                                font-weight: 600;
                            ">
                            <i class="ri-add-line" style="padding: 8px 12px; cursor: pointer;"></i>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button class="main-btn" style="
                            flex: 1;
                            padding: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                        ">
                            <i class="ri-shopping-cart-line"></i> Thêm vào giỏ
                        </button>
                        <a href="product-detail.html" class="main-btn" style="
                            padding: 12px 20px;
                            background: var(--earth-brown);
                        ">
                            Chi tiết
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // Add quantity controls
        const qtyInput = content.querySelector('input[type="number"]');
        const minusBtn = content.querySelector('.ri-subtract-line');
        const plusBtn = content.querySelector('.ri-add-line');
        
        minusBtn.addEventListener('click', () => {
            if (qtyInput.value > 1) qtyInput.value--;
        });
        
        plusBtn.addEventListener('click', () => {
            qtyInput.value++;
        });
    }
}

// Khởi tạo Quick View
const quickView = new QuickView();

// RecentlyViewed feature removed as per request (kept intentionally blank)

// ========================================
// 7. LIVE CHAT SUPPORT (Simple Version)
// ========================================
class LiveChat {
    constructor() {
        this.chatButton = this.createChatButton();
        this.chatBox = this.createChatBox();
        this.isOpen = false;
        this.init();
    }
    
    createChatButton() {
        const button = document.createElement('button');
        button.className = 'live-chat-button';
        button.innerHTML = '<i class="ri-customer-service-2-fill"></i>';
        button.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--eco-green);
            color: white;
            border: none;
            font-size: 28px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9998;
            transition: all 0.3s;
        `;
        
        document.body.appendChild(button);
        return button;
    }
    
    createChatBox() {
        const box = document.createElement('div');
        box.className = 'live-chat-box';
        box.innerHTML = `
            <div class="chat-header" style="
                background: var(--eco-green);
                color: white;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 12px 12px 0 0;
            ">
                <div>
                    <h3 style="font-size: 16px; margin-bottom: 3px;">ROOFI Support</h3>
                    <p style="font-size: 12px; opacity: 0.9;">Online - Phản hồi ngay</p>
                </div>
                <button class="chat-close" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                ">
                    <i class="ri-close-line"></i>
                </button>
            </div>
            <div class="chat-messages" style="
                height: 300px;
                overflow-y: auto;
                padding: 15px;
                background: #f9f9f9;
            ">
                <div class="chat-message bot-message" style="
                    margin-bottom: 15px;
                    display: flex;
                    gap: 10px;
                ">
                    <div class="message-avatar" style="
                        width: 35px;
                        height: 35px;
                        border-radius: 50%;
                        background: var(--eco-green);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 18px;
                        flex-shrink: 0;
                    ">
                        <i class="ri-customer-service-line"></i>
                    </div>
                    <div class="message-content" style="
                        background: white;
                        padding: 10px 15px;
                        border-radius: 12px;
                        max-width: 70%;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    ">
                        <p style="font-size: 14px; line-height: 1.5;">
                            Xin chào! 👋 Chúng tôi có thể giúp gì cho bạn?
                        </p>
                        <span style="font-size: 11px; color: #888;">Vừa xong</span>
                    </div>
                </div>
            </div>
            <div class="chat-input-area" style="
                padding: 15px;
                background: white;
                border-top: 1px solid #eee;
                border-radius: 0 0 12px 12px;
            ">
                <div style="display: flex; gap: 10px;">
                    <input type="text" placeholder="Nhập tin nhắn..." style="
                        flex: 1;
                        padding: 10px 15px;
                        border: 1px solid #ddd;
                        border-radius: 20px;
                        outline: none;
                        font-size: 14px;
                    ">
                    <button class="chat-send" style="
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: var(--eco-green);
                        color: white;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                    ">
                        <i class="ri-send-plane-fill"></i>
                    </button>
                </div>
                <div class="quick-replies" style="
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                    flex-wrap: wrap;
                ">
                    <button class="quick-reply-btn" data-message="Tôi muốn tư vấn sản phẩm">
                        Tư vấn sản phẩm
                    </button>
                    <button class="quick-reply-btn" data-message="Kiểm tra đơn hàng">
                        Kiểm tra đơn hàng
                    </button>
                    <button class="quick-reply-btn" data-message="Chính sách đổi trả">
                        Chính sách đổi trả
                    </button>
                </div>
            </div>
        `;
        
        box.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            width: 350px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            z-index: 9998;
            display: none;
        `;
        
        document.body.appendChild(box);
        return box;
    }
    
    init() {
        // Toggle chat box
        this.chatButton.addEventListener('click', () => {
            this.toggle();
        });
        
        // Close button
        const closeBtn = this.chatBox.querySelector('.chat-close');
        closeBtn.addEventListener('click', () => {
            this.close();
        });
        
        // Send message
        const sendBtn = this.chatBox.querySelector('.chat-send');
        const input = this.chatBox.querySelector('input[type="text"]');
        
        sendBtn.addEventListener('click', () => {
            this.sendMessage(input.value);
            input.value = '';
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage(input.value);
                input.value = '';
            }
        });
        
        // Quick replies
        const quickReplyBtns = this.chatBox.querySelectorAll('.quick-reply-btn');
        quickReplyBtns.forEach(btn => {
            btn.style.cssText = `
                padding: 6px 12px;
                border: 1px solid var(--eco-green);
                background: white;
                color: var(--eco-green);
                border-radius: 15px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s;
            `;
            
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-message');
                this.sendMessage(message);
            });
            
            btn.addEventListener('mouseenter', function() {
                this.style.background = 'var(--eco-green)';
                this.style.color = 'white';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.background = 'white';
                this.style.color = 'var(--eco-green)';
            });
        });
        
        // Hover effect on button
        this.chatButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        this.chatButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.chatBox.style.display = 'block';
        this.chatButton.innerHTML = '<i class="ri-close-line"></i>';
        this.isOpen = true;
    }
    
    close() {
        this.chatBox.style.display = 'none';
        this.chatButton.innerHTML = '<i class="ri-customer-service-2-fill"></i>';
        this.isOpen = false;
    }
    
    sendMessage(text) {
        if (!text.trim()) return;
        
        const messagesContainer = this.chatBox.querySelector('.chat-messages');
        
        // User message
        const userMsg = document.createElement('div');
        userMsg.style.cssText = `
            margin-bottom: 15px;
            display: flex;
            justify-content: flex-end;
        `;
        userMsg.innerHTML = `
            <div style="
                background: var(--eco-green);
                color: white;
                padding: 10px 15px;
                border-radius: 12px;
                max-width: 70%;
            ">
                <p style="font-size: 14px; line-height: 1.5;">${text}</p>
                <span style="font-size: 11px; opacity: 0.8;">Vừa xong</span>
            </div>
        `;
        
        messagesContainer.appendChild(userMsg);
        
        // Auto scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Simulate bot response
        setTimeout(() => {
            this.addBotMessage('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong giây lát. 😊');
        }, 1000);
    }
    
    addBotMessage(text) {
        const messagesContainer = this.chatBox.querySelector('.chat-messages');
        
        const botMsg = document.createElement('div');
        botMsg.style.cssText = `
            margin-bottom: 15px;
            display: flex;
            gap: 10px;
        `;
        botMsg.innerHTML = `
            <div style="
                width: 35px;
                height: 35px;
                border-radius: 50%;
                background: var(--eco-green);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
                flex-shrink: 0;
            ">
                <i class="ri-customer-service-line"></i>
            </div>
            <div style="
                background: white;
                padding: 10px 15px;
                border-radius: 12px;
                max-width: 70%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            ">
                <p style="font-size: 14px; line-height: 1.5;">${text}</p>
                <span style="font-size: 11px; color: #888;">Vừa xong</span>
            </div>
        `;
        
        messagesContainer.appendChild(botMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Khởi tạo Live Chat
const liveChat = new LiveChat();

// ========================================
// 8. ADD CSS ANIMATIONS
// ========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .countdown-display {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: center;
    }
    
    .countdown-unit {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: var(--beige);
        padding: 10px 15px;
        border-radius: 8px;
        min-width: 60px;
    }
    
    .countdown-number {
        font-size: 24px;
        font-weight: 700;
        color: var(--eco-green);
        line-height: 1;
    }
    
    .countdown-label {
        font-size: 11px;
        color: #666;
        margin-top: 5px;
        text-transform: uppercase;
    }
    
    .countdown-separator {
        font-size: 24px;
        font-weight: 700;
        color: var(--eco-green);
    }
    
    .expired {
        color: #d32f2f;
        font-weight: 600;
        font-size: 16px;
    }
    
    @media (max-width: 750px) {
        .countdown-unit {
            padding: 8px 10px;
            min-width: 50px;
        }
        
        .countdown-number {
            font-size: 20px;
        }
        
        .countdown-label {
            font-size: 10px;
        }
        
        .live-chat-box {
            width: calc(100% - 20px) !important;
            right: 10px !important;
            bottom: 90px !important;
        }
        
        .quick-view-grid {
            grid-template-columns: 1fr !important;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// 9. NOTIFICATION SYSTEM
// ========================================
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
    }
    
    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
        return container;
    }
    
    show(message, type = 'info', duration = 3000) {
        const icons = {
            success: 'ri-checkbox-circle-fill',
            error: 'ri-close-circle-fill',
            warning: 'ri-error-warning-fill',
            info: 'ri-information-fill'
        };
        
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="${icons[type]}" style="font-size: 20px;"></i>
            <span>${message}</span>
            <button style="
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 0;
                margin-left: auto;
            ">
                <i class="ri-close-line" style="font-size: 18px;"></i>
            </button>
        `;
        
        notification.style.cssText = `
            background: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        
        this.container.appendChild(notification);
        
        // Close button
        const closeBtn = notification.querySelector('button');
        closeBtn.addEventListener('click', () => {
            this.remove(notification);
        });
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }
    }
    
    remove(notification) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// Khởi tạo Notification System
window.notify = new NotificationSystem();

// ProductComparison feature removed as per request

console.log('All AJAX features initialized successfully!');