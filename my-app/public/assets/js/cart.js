// ========================================
// CART.JS - XỬ LÝ GIỎ HÀNG
// ========================================

console.log(' Cart.js loaded!');

// ========================================
// 1. QUANTITY BUTTONS - TĂNG/GIẢM
// ========================================
const qtyPlusBtns = document.querySelectorAll('.qty-plus');
const qtyMinusBtns = document.querySelectorAll('.qty-minus');

// Tăng số lượng
qtyPlusBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const input = this.previousElementSibling;
        let value = parseInt(input.value);
        input.value = value + 1;
        
        // Cập nhật giá
        updateProductTotal(this.closest('tr'));
        updateCartSummary();
    });
});

// Giảm số lượng
qtyMinusBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const input = this.nextElementSibling;
        let value = parseInt(input.value);
        
        if (value > 1) {
            input.value = value - 1;
            
            // Cập nhật giá
            updateProductTotal(this.closest('tr'));
            updateCartSummary();
        }
    });
});

// Thay đổi trực tiếp input
const quantityInputs = document.querySelectorAll('.quantity-input');
quantityInputs.forEach(input => {
    input.addEventListener('change', function() {
        if (this.value < 1) {
            this.value = 1;
        }
        
        updateProductTotal(this.closest('tr'));
        updateCartSummary();
    });
});

// ========================================
// 2. UPDATE PRODUCT TOTAL (Thành tiền)
// ========================================
function updateProductTotal(row) {
    const input = row.querySelector('.quantity-input');
    const quantity = parseInt(input.value);
    const unitPrice = parseInt(input.getAttribute('data-price'));
    const total = quantity * unitPrice;
    
    // Cập nhật thành tiền
    const totalCell = row.querySelector('.product-total-price');
    totalCell.textContent = formatPrice(total);
}

// ========================================
// 3. UPDATE CART SUMMARY (Tổng đơn hàng)
// ========================================
function updateCartSummary() {
    let subtotal = 0;
    
    // Tính tổng
    const rows = document.querySelectorAll('#cart-items tr');
    rows.forEach(row => {
        const input = row.querySelector('.quantity-input');
        const quantity = parseInt(input.value);
        const unitPrice = parseInt(input.getAttribute('data-price'));
        subtotal += quantity * unitPrice;
    });
    
    // Cập nhật UI
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    
    // Discount (demo - có thể thêm logic voucher sau)
    const discount = 0;
    document.getElementById('discount').textContent = '-' + formatPrice(discount);
    
    // Shipping (miễn phí nếu > 500k)
    const shipping = subtotal > 500000 ? 0 : 30000;
    document.getElementById('shipping').textContent = shipping === 0 ? 'Miễn phí' : formatPrice(shipping);
    
    // Total
    const total = subtotal - discount + shipping;
    document.getElementById('total').textContent = formatPrice(total);
    
    // Cập nhật số lượng sản phẩm
    document.getElementById('cart-count').textContent = rows.length;
    
    // Cập nhật cart icon
    const cartIcon = document.querySelector('.header-cart i');
    if (cartIcon) {
        let totalItems = 0;
        rows.forEach(row => {
            const qty = parseInt(row.querySelector('.quantity-input').value);
            totalItems += qty;
        });
        cartIcon.setAttribute('number', totalItems);
    }
}

// ========================================
// 4. FORMAT PRICE - Định dạng giá VND
// ========================================
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}

// ========================================
// 5. DELETE PRODUCT FROM CART
// ========================================
const deleteBtns = document.querySelectorAll('.delete-btn');

deleteBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const productId = this.getAttribute('data-product-id');
        const row = this.closest('tr');
        const productName = row.querySelector('h3').textContent;
        
        // Xác nhận xóa
        if (confirm(`Bạn có chắc muốn xóa "${productName}" khỏi giỏ hàng?`)) {
            // Animation fade out
            row.style.opacity = '0';
            row.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                row.remove();
                updateCartSummary();
                
                // Kiểm tra giỏ hàng trống
                checkEmptyCart();
                
                console.log('Đã xóa sản phẩm:', productId);
                
                // Hiển thị thông báo
                showNotification('Đã xóa sản phẩm khỏi giỏ hàng');
            }, 300);
        }
    });
});

// ========================================
// 6. CLEAR ENTIRE CART
// ========================================
const clearCartBtn = document.querySelector('.clear-cart-btn');

if (clearCartBtn) {
    clearCartBtn.addEventListener('click', function() {
        if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
            const cartItems = document.getElementById('cart-items');
            cartItems.innerHTML = '';
            
            updateCartSummary();
            checkEmptyCart();
            
            showNotification('Đã xóa toàn bộ giỏ hàng');
        }
    });
}

// ========================================
// 7. CHECK EMPTY CART
// ========================================
function checkEmptyCart() {
    const rows = document.querySelectorAll('#cart-items tr');
    
    if (rows.length === 0) {
        const cartItems = document.getElementById('cart-items');
        cartItems.innerHTML = `
            <tr>
                <td colspan="6" class="empty-cart">
                    <div class="empty-cart-content">
                        <i class="ri-shopping-cart-line"></i>
                        <p>Giỏ hàng của bạn đang trống</p>
                        <a href="product.html" class="main-btn">Tiếp tục mua sắm</a>
                    </div>
                </td>
            </tr>
        `;
        
        // Reset cart icon
        const cartIcon = document.querySelector('.header-cart i');
        if (cartIcon) {
            cartIcon.setAttribute('number', '0');
        }
    }
}

// ========================================
// 8. CHECKOUT FORM SUBMIT
// ========================================
const checkoutForm = document.getElementById('checkout-form');

if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const city = document.getElementById('city').value;
        const district = document.getElementById('district').value;
        const ward = document.getElementById('ward').value;
        const address = document.getElementById('address').value;
        
        if (!name || !phone || !email || !city || !district || !ward || !address) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        
        // Validate phone
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(phone)) {
            alert('Số điện thoại không hợp lệ!');
            return;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Email không hợp lệ!');
            return;
        }
        
        // Lấy thông tin đơn hàng
        const orderData = {
            customer: { name, phone, email, city, district, ward, address },
            items: [],
            total: document.getElementById('total').textContent
        };
        
        // Lấy danh sách sản phẩm
        const rows = document.querySelectorAll('#cart-items tr');
        rows.forEach(row => {
            const productName = row.querySelector('h3').textContent;
            const size = row.querySelector('.product-size').textContent;
            const quantity = row.querySelector('.quantity-input').value;
            const price = row.querySelector('.product-total-price').textContent;
            
            orderData.items.push({ productName, size, quantity, price });
        });
        
        console.log('Order data:', orderData);
        
        // TODO: Gửi đơn hàng lên server
        
        // Lưu vào localStorage (demo)
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        
        // Chuyển sang trang xác nhận
        window.location.href = 'order_confirm.html';
    });
}

// ========================================
// 9. SHOW NOTIFICATION
// ========================================
function showNotification(message) {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="ri-checkbox-circle-line"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide after 3s
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ========================================
// 10. INIT - KHI LOAD TRANG
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    updateCartSummary();
    checkEmptyCart();
    
    console.log('Cart functions initialized!');
});

console.log('Cart.js loaded successfully!');

window.location.href = "order_confirm.html";

