// PRODUCTS.JS - XỬ LÝ TRANG PRODUCTS

console.log('Products.js loaded!');

// ========================================
// 1. GET URL PARAMETERS
// ========================================
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        style: params.get('style'),
        type: params.get('type'),
        category: params.get('category')
    };
}

// ========================================
// 2. UPDATE BREADCRUMB
// ========================================
function updateBreadcrumb() {
    const params = getUrlParams();
    const breadcrumbText = document.getElementById('breadcrumb-text');
    
    if (!breadcrumbText) return;
    
    let text = 'Sản phẩm';
    
    if (params.style) {
        text = params.style.charAt(0).toUpperCase() + params.style.slice(1);
        if (params.type) {
            text += ` - ${params.type.charAt(0).toUpperCase() + params.type.slice(1)}`;
        }
    } else if (params.category) {
        const categoryNames = {
            'giay': 'Giày/Sandals',
            'khan': 'Khăn',
            'vi': 'Ví',
            'non': 'Nón',
            'phukien': 'Phụ kiện'
        };
        text = categoryNames[params.category] || params.category;
    }
    
    breadcrumbText.textContent = text;
}

// ========================================
// 3. FILTER PRODUCTS BY URL
// ========================================
function filterProductsByUrl() {
    const params = getUrlParams();
    const categories = document.querySelectorAll('.product-category');
    
    categories.forEach(category => {
        let shouldShow = false;
        
        const categoryStyle = category.getAttribute('data-category');
        const categoryType = category.getAttribute('data-type');
        
        // Nếu không có params, hiện tất cả
        if (!params.style && !params.type && !params.category) {
            shouldShow = true;
        }
        // Lọc theo style + type
        else if (params.style && params.type) {
            shouldShow = (categoryStyle === params.style && categoryType === params.type);
        }
        // Lọc chỉ theo style
        else if (params.style) {
            shouldShow = (categoryStyle === params.style);
        }
        // Lọc theo category (giày, phụ kiện...)
        else if (params.category) {
            shouldShow = (categoryStyle === params.category);
        }
        
        // Hiện/ẩn category
        if (shouldShow) {
            category.classList.remove('hidden');
        } else {
            category.classList.add('hidden');
        }
    });
}

// ========================================
// 4. FILTER BY DROPDOWN
// ========================================
const filterType = document.getElementById('filter-type');
const filterPrice = document.getElementById('filter-price');

if (filterType) {
    filterType.addEventListener('change', function() {
        const selectedType = this.value;
        const categories = document.querySelectorAll('.product-category');
        
        categories.forEach(category => {
            const categoryStyle = category.getAttribute('data-category');
            
            if (selectedType === 'all') {
                category.classList.remove('hidden');
            } else {
                if (categoryStyle === selectedType) {
                    category.classList.remove('hidden');
                } else {
                    category.classList.add('hidden');
                }
            }
        });
    });
}

// ========================================
// 5. SORT BY PRICE
// ========================================
if (filterPrice) {
    filterPrice.addEventListener('change', function() {
        const sortType = this.value;
        const categories = document.querySelectorAll('.product-category:not(.hidden)');
        
        categories.forEach(category => {
            const productsRow = category.querySelector('.products-row');
            const products = Array.from(productsRow.querySelectorAll('.product-item'));
            
            if (sortType === 'low-high') {
                // Sắp xếp từ thấp đến cao
                products.sort((a, b) => {
                    const priceA = parseInt(a.getAttribute('data-price'));
                    const priceB = parseInt(b.getAttribute('data-price'));
                    return priceA - priceB;
                });
            } else if (sortType === 'high-low') {
                // Sắp xếp từ cao đến thấp
                products.sort((a, b) => {
                    const priceA = parseInt(a.getAttribute('data-price'));
                    const priceB = parseInt(b.getAttribute('data-price'));
                    return priceB - priceA;
                });
            }
            
            // Xóa và thêm lại theo thứ tự mới
            if (sortType !== 'default') {
                productsRow.innerHTML = '';
                products.forEach(product => {
                    productsRow.appendChild(product);
                });
            }
        });
    });
}

// ========================================
// 6. FAVORITE BUTTON (Heart Icon)
// ========================================
const favoriteBtns = document.querySelectorAll('.favorite-btn');

favoriteBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.classList.toggle('active');
        
        if (this.classList.contains('active')) {
            console.log('Added to favorites');
            // TODO: Lưu vào localStorage hoặc gửi lên server
        } else {
            console.log('Removed from favorites');
        }
    });
});

// ========================================
// 7. CATEGORY SLIDER (Prev/Next)
// ========================================
const categories = document.querySelectorAll('.product-category');

categories.forEach(category => {
    const productsRow = category.querySelector('.products-row');
    const prevBtn = category.querySelector('.nav-prev');
    const nextBtn = category.querySelector('.nav-next');
    const products = category.querySelectorAll('.product-item');
    
    // Chỉ enable slider nếu có > 5 sản phẩm
    if (products.length <= 5) {
        if (prevBtn) prevBtn.classList.add('disabled');
        if (nextBtn) nextBtn.classList.add('disabled');
        return;
    }
    
    let currentIndex = 0;
    const itemsPerPage = 5;
    const maxIndex = Math.ceil(products.length / itemsPerPage) - 1;
    
    function updateSlider() {
        const translateX = -(currentIndex * 100);
        productsRow.style.transform = `translateX(${translateX}%)`;
        
        // Update button states
        if (prevBtn) {
            if (currentIndex === 0) {
                prevBtn.classList.add('disabled');
            } else {
                prevBtn.classList.remove('disabled');
            }
        }
        
        if (nextBtn) {
            if (currentIndex === maxIndex) {
                nextBtn.classList.add('disabled');
            } else {
                nextBtn.classList.remove('disabled');
            }
        }
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateSlider();
            }
        });
    }
    
    updateSlider();
});

// ========================================
// 8. HOVER EFFECT ON PRODUCT ITEM
// ========================================
const productItems = document.querySelectorAll('.product-item');

productItems.forEach(item => {
    const img = item.querySelector('.product-image img');
    
    if (img) {
        item.addEventListener('mouseenter', function() {
            img.style.transform = 'scale(1.08)';
        });
        
        item.addEventListener('mouseleave', function() {
            img.style.transform = 'scale(1)';
        });
    }
});

// ========================================
// 9. INIT - CHẠY KHI LOAD TRANG
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    updateBreadcrumb();
    filterProductsByUrl();
    
    console.log('Products page initialized!');
});

// ========================================
// 10. RESPONSIVE - ADJUST PRODUCTS PER PAGE
// ========================================
function adjustProductsPerPage() {
    const width = window.innerWidth;
    let itemsPerPage = 5;
    
    if (width <= 750) {
        itemsPerPage = 2; // Mobile: 2 cột
    } else if (width <= 1024) {
        itemsPerPage = 3; // Tablet: 3 cột
    }
    
    return itemsPerPage;
}

window.addEventListener('resize', function() {
    // Re-calculate slider khi resize
    const itemsPerPage = adjustProductsPerPage();
    console.log('Items per page:', itemsPerPage);
});