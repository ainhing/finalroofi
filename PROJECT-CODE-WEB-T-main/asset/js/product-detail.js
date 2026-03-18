// ========================================
// PRODUCT-DETAIL.JS - XỬ LÝ TRANG CHI TIẾT SẢN PHẨM
// ========================================

console.log('Product Detail JS loaded!');

// ========================================
// 1. SIZE SELECTION
// ========================================
const sizeBtns = document.querySelectorAll('.size-btn');

sizeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active từ tất cả
        sizeBtns.forEach(b => b.classList.remove('active'));
        
        // Add active cho button được click
        this.classList.add('active');
        
        console.log('Selected size:', this.textContent);
    });
});

// ========================================
// 2. THUMBNAIL IMAGE CLICK
// ========================================
const thumbnailImages = document.querySelectorAll('.product-images-items img');
const mainImage = document.querySelector('.main-image');

thumbnailImages.forEach(img => {
    img.addEventListener('click', function() {
        // Remove active từ tất cả
        thumbnailImages.forEach(i => i.classList.remove('active'));
        
        // Add active cho ảnh được click
        this.classList.add('active');
        
        // Đổi ảnh chính
        if (mainImage) {
            mainImage.src = this.src;
            
            // Animation khi đổi ảnh
            mainImage.style.opacity = '0';
            setTimeout(() => {
                mainImage.style.opacity = '1';
            }, 100);
        }
    });
});

// ========================================
// 3. QUANTITY INPUT - TĂNG/GIẢM
// ========================================
const quantityInput = document.querySelector('.quantity-input');
const increaseBtn = document.querySelector('.ri-add-line');
const decreaseBtn = document.querySelector('.ri-subtract-line');

if (quantityInput && increaseBtn && decreaseBtn) {
    increaseBtn.addEventListener('click', function() {
        let currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
    });
    
    decreaseBtn.addEventListener('click', function() {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });
    
    // Không cho nhập số âm hoặc 0
    quantityInput.addEventListener('change', function() {
        if (this.value < 1) {
            this.value = 1;
        }
    });
}

// ========================================
// 4. ADD TO CART BUTTON
// ========================================
const addToCartBtn = document.querySelector('.add-to-cart-btn');

if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function() {
        // Lấy thông tin sản phẩm
        const productName = document.getElementById('detail-product-name').textContent;
        const quantity = parseInt(quantityInput.value);
        const selectedSize = document.querySelector('.size-btn.active').textContent;
        const price = document.getElementById('detail-price').textContent;
        
        // TODO: Lưu vào localStorage hoặc gửi lên server
        const product = {
            name: productName,
            quantity: quantity,
            size: selectedSize,
            price: price
        };
        
        console.log('Added to cart:', product);
        
        // Cập nhật số lượng cart icon
        const cartIcon = document.querySelector('.header-cart i');
        let currentNumber = parseInt(cartIcon.getAttribute('number')) || 0;
        cartIcon.setAttribute('number', currentNumber + quantity);
        
        // Hiển thị thông báo
        alert(`Đã thêm ${quantity}x ${productName} (Size ${selectedSize}) vào giỏ hàng!`);
        
        // Animation cho button
        this.innerHTML = '<i class="ri-checkbox-circle-line"></i> Đã thêm!';
        this.style.backgroundColor = '#4caf50';
        
        setTimeout(() => {
            this.innerHTML = '<i class="ri-shopping-cart-line"></i> Thêm vào giỏ hàng';
            this.style.backgroundColor = '';
        }, 2000);
    });
}

// ========================================
// 5. BUY NOW BUTTON
// ========================================
const buyNowBtn = document.querySelector('.buy-now-btn');

if (buyNowBtn) {
    buyNowBtn.addEventListener('click', function() {
        // Lấy thông tin sản phẩm
        const productName = document.getElementById('detail-product-name').textContent;
        const quantity = parseInt(quantityInput.value);
        const selectedSize = document.querySelector('.size-btn.active').textContent;
        
        console.log('Buy now:', { productName, quantity, selectedSize });
        
        // TODO: Lưu vào localStorage và chuyển sang trang cart
        alert(`Mua ngay ${quantity}x ${productName} (Size ${selectedSize})`);
        
        // Chuyển sang trang giỏ hàng
        window.location.href = 'cart.html';
    });
}

// ========================================
// 6. GET PRODUCT INFO FROM URL (Optional)
// ========================================
function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Nếu có ID trong URL, load thông tin sản phẩm
const productId = getProductIdFromUrl();
if (productId) {
    console.log('Product ID:', productId);
    // TODO: Load product data from database/API based on ID
    // loadProductData(productId);
}

// ========================================
// 7. IMAGE ZOOM ON HOVER (Advanced)
// ========================================
if (mainImage) {
    mainImage.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        
        this.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        this.style.transform = 'scale(1.5)';
    });
    
    mainImage.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}

// ========================================
// 8. SCROLL TO PRODUCT DESCRIPTION
// ========================================
function scrollToDescription() {
    const descriptionSection = document.querySelector('.product-detail-content');
    if (descriptionSection) {
        descriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ========================================
// 9. PRODUCT DATA (DEMO - Sau này lấy từ database)
// ========================================
const productsData = {
    'hobo-ao1': {
        name: 'Áo Voan Thêu Hoa EcoSoft',
        price: '560,000',
        oldPrice: '720,000',
        category: 'Hobo - Áo',
        material: '100% Organic Cotton',
        images: [
            'asset/images/hobo/hobo_aokieu/Hobo_Aokieu1/Hobo_Aokieu1.1.jpg',
            'asset/images/hobo/hobo_aokieu/Hobo_Aokieu1/Hobo_Aokieu1.2.jpg',
            'asset/images/hobo/hobo_aokieu/Hobo_Aokieu1/Hobo_Aokieu1.3.jpg',
            'asset/images/hobo/hobo_aokieu/Hobo_Aokieu1/Hobo_Aokieu1.4.jpg',
            'asset/images/hobo/hobo_aokieu/Hobo_Aokieu1/Hobo_Aokieu1.5.jpg'
        ],
        features: [
            'Chất liệu Voan EcoSoft mềm mại, thoáng khí',
            'Họa tiết thêu hoa nổi thủ công',
            'Phong cách Hobo Romantic',
            'Quy trình nhuộm thân thiện môi trường',
            'Phù hợp dạo phố, café, chụp ảnh',
            'Sản xuất tại Việt Nam',
            'Người mẫu: 1m68 – 50kg, mặc size M'
        ],
        description: 'Áo Kiểu Voan Thêu Hoa EcoSoft được làm từ chất liệu voan tái chế EcoSoft – mềm mại, thoáng khí và thân thiện với làn da...'
    },
    'hobo-quan1': {
        name: 'Áo Ren EcoLace Satin',
        price: '520,000',
        oldPrice: '650,000',
        category: 'Hobo - Áo',
        // ... thêm data khác
    }
    // Thêm sản phẩm khác...
};

// Function load product data (Optional - để sau này dùng)
function loadProductData(id) {
    const product = productsData[id];
    
    if (product) {
        document.getElementById('detail-product-name').textContent = product.name;
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('detail-price').innerHTML = `${product.price}<sup>đ</sup>`;
        document.getElementById('detail-old-price').innerHTML = `<span>${product.oldPrice}<sup>đ</sup></span>`;
        
        // Update images
        if (product.images && product.images.length > 0) {
            mainImage.src = product.images[0];
            
            // Update thumbnails
            const thumbnailContainer = document.querySelector('.product-images-items');
            thumbnailContainer.innerHTML = '';
            
            product.images.forEach((img, index) => {
                const imgElement = document.createElement('img');
                imgElement.src = img;
                imgElement.alt = `Ảnh ${index + 1}`;
                if (index === 0) imgElement.classList.add('active');
                thumbnailContainer.appendChild(imgElement);
            });
        }
        
        console.log('Product data loaded:', product);
    } else {
        console.warn('Product not found!');
    }
}

console.log('Product Detail functions initialized!');
