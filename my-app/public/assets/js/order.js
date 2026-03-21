// ========================================
// ORDER.JS - XỬ LÝ TRANG ORDER CONFIRM & SUCCESS
// ========================================

console.log('Order.js loaded!');

// ========================================
// 1. LOAD ORDER DATA FROM LOCALSTORAGE
// ========================================
function loadOrderData() {
    const orderData = localStorage.getItem('lastOrder');
    
    if (orderData) {
        const order = JSON.parse(orderData);
        console.log('Order data loaded:', order);
        
        // Cập nhật thông tin khách hàng
        if (document.getElementById('customer-name')) {
            document.getElementById('customer-name').textContent = order.customer.name;
        }
        if (document.getElementById('customer-phone')) {
            document.getElementById('customer-phone').textContent = order.customer.phone;
        }
        if (document.getElementById('customer-email')) {
            document.getElementById('customer-email').textContent = order.customer.email;
        }
        if (document.getElementById('customer-address')) {
            const fullAddress = `${order.customer.address}, ${order.customer.ward}, ${order.customer.district}, ${order.customer.city}`;
            document.getElementById('customer-address').textContent = fullAddress;
        }
        if (document.getElementById('order-total')) {
            document.getElementById('order-total').textContent = order.total;
        }
        
        // Success page
        if (document.getElementById('success-name')) {
            document.getElementById('success-name').textContent = order.customer.name;
        }
        if (document.getElementById('success-phone')) {
            document.getElementById('success-phone').textContent = order.customer.phone;
        }
        if (document.getElementById('success-email')) {
            document.getElementById('success-email').textContent = order.customer.email;
        }
        if (document.getElementById('success-address')) {
            const fullAddress = `${order.customer.address}, ${order.customer.ward}, ${order.customer.district}, ${order.customer.city}`;
            document.getElementById('success-address').textContent = fullAddress;
        }
        if (document.getElementById('success-total')) {
            document.getElementById('success-total').textContent = order.total;
        }
        
        return order;
    } else {
        console.warn('No order data found');
        return null;
    }
}

// ========================================
// 2. GENERATE ORDER ID
// ========================================
function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `#RF${timestamp.toString().slice(-6)}${random}`;
}

// ========================================
// 3. UPDATE ORDER ID
// ========================================
function updateOrderId() {
    const orderId = generateOrderId();
    const orderIdElements = document.querySelectorAll('#order-id, .order-code strong');
    
    orderIdElements.forEach(el => {
        if (el) el.textContent = orderId;
    });
    
    // Lưu order ID vào localStorage
    const orderData = loadOrderData();
    if (orderData) {
        orderData.orderId = orderId;
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
    }
}

// ========================================
// 4. CONFIRM BUTTON - CHUYỂN SANG SUCCESS
// ========================================
const confirmBtn = document.querySelector('.confirm-btn');

if (confirmBtn) {
    confirmBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Animation
        this.innerHTML = '<i class="ri-loader-4-line"></i> Đang xử lý...';
        this.style.pointerEvents = 'none';
        
        // Giả lập xử lý đơn hàng
        setTimeout(() => {
            // Chuyển sang trang success
            window.location.href = 'order_success.html';
        }, 1500);
    });
}

// ========================================
// 5. SUCCESS ANIMATION
// ========================================
function animateSuccessCheckmark() {
    const checkmark = document.querySelector('.checkmark');
    
    if (checkmark) {
        setTimeout(() => {
            checkmark.classList.add('animate');
        }, 300);
    }
}

// ========================================
// 6. CONFETTI ANIMATION (Optional)
// ========================================
function launchConfetti() {
    // Simple confetti effect
    const colors = ['#2E7D32', '#F5F5DC', '#8D6E63'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            createConfetti(colors[Math.floor(Math.random() * colors.length)]);
        }, i * 30);
    }
}

function createConfetti(color) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.backgroundColor = color;
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
        confetti.remove();
    }, 5000);
}

// ========================================
// 7. SEND EMAIL NOTIFICATION (DEMO)
// ========================================
function sendEmailNotification(orderData) {
    // TODO: Gửi email thông báo đến khách hàng
    console.log('Sending email to:', orderData.customer.email);
    
    // Demo: Hiển thị thông báo
    console.log('📧 Email notification sent!');
}

// ========================================
// 8. CLEAR CART AFTER SUCCESS
// ========================================
function clearCart() {
    // Reset cart icon
    const cartIcon = document.querySelector('.header-cart i');
    if (cartIcon) {
        cartIcon.setAttribute('number', '0');
    }
    
    // Clear localStorage cart data (nếu có)
    // localStorage.removeItem('cart');
    
    console.log('🛒 Cart cleared!');
}

// ========================================
// 9. TRACKING STEPS ANIMATION
// ========================================
function animateTrackingSteps() {
    const steps = document.querySelectorAll('.tracking-step');
    
    steps.forEach((step, index) => {
        setTimeout(() => {
            step.style.opacity = '0';
            step.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                step.style.transition = 'all 0.5s ease';
                step.style.opacity = '1';
                step.style.transform = 'translateX(0)';
            }, 50);
        }, index * 100);
    });
}

// ========================================
// 10. PRINT ORDER (Optional)
// ========================================
function printOrder() {
    window.print();
}

// ========================================
// 11. DOWNLOAD ORDER PDF (Optional)
// ========================================
function downloadOrderPDF() {
    alert('Chức năng tải PDF đang được phát triển!');
    // TODO: Implement PDF generation
}

// ========================================
// 12. INIT - KHI LOAD TRANG
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Load order data
    const orderData = loadOrderData();
    
    // Update order ID
    updateOrderId();
    
    // Check which page we're on
    const isSuccessPage = window.location.pathname.includes('order_success');
    const isConfirmPage = window.location.pathname.includes('order_confirm');
    
    if (isSuccessPage) {
        // Success page animations
        animateSuccessCheckmark();
        clearCart();
        
        // Launch confetti after 500ms
        setTimeout(() => {
            launchConfetti();
        }, 500);
        
        // Animate tracking steps
        setTimeout(() => {
            animateTrackingSteps();
        }, 800);
        
        // Send email notification
        if (orderData) {
            sendEmailNotification(orderData);
        }
    }
    
    if (isConfirmPage) {
        console.log('📋 Order Confirm page loaded');
    }
    
    console.log('Order page initialized!');
});

// ========================================
// 13. HANDLE BACK NAVIGATION
// ========================================
window.addEventListener('pageshow', function(event) {
    // Nếu user bấm back từ success page
    if (event.persisted) {
        console.log('Page restored from cache');
    }
});

console.log(' Order.js loaded successfully!');