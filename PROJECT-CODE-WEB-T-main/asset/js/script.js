// SCRIPT.JS - XỬ LÝ TOÀN BỘ WEBSITE

console.log('Script.js loaded!');

// ========================================
// 0. MOBILE MENU TOGGLE - MỚI THÊM
// ========================================
const menuIcon = document.querySelector('.header-bar-icon i');
const headerNav = document.querySelector('.header-nav');

if (menuIcon) {
    menuIcon.addEventListener('click', function() {
        headerNav.classList.toggle('active');
        
        // Đổi icon
        if (headerNav.classList.contains('active')) {
            this.classList.remove('ri-menu-line');
            this.classList.add('ri-close-line');
        } else {
            this.classList.remove('ri-close-line');
            this.classList.add('ri-menu-line');
        }
    });
}

// Mobile Dropdown Click
if (window.innerWidth <= 750) {
    const hasDropdowns = document.querySelectorAll('.has-dropdown');
    hasDropdowns.forEach(item => {
        const link = item.querySelector('.main-nav-link');
        if (link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                item.classList.toggle('active');
            });
        }
    });
    
    const hasSubDropdowns = document.querySelectorAll('.has-sub-dropdown');
    hasSubDropdowns.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                item.classList.toggle('active');
            });
        }
    });
}

// ========================================
// 1. SLIDER - XỬ LÝ BANNER
// ========================================
const sliderItems = document.querySelector('.slider-items');
const sliderItem = document.querySelectorAll('.slider-item');

if (sliderItems && sliderItem.length > 0) {
    let currentIndex = 0;
    const totalSlides = sliderItem.length;
    
    // Hiển thị slide đầu tiên
    sliderItem[0].style.display = 'block';
    
    // Function chuyển slide
    function showSlide(index) {
        // Ẩn tất cả slides
        sliderItem.forEach(item => {
            item.style.display = 'none';
        });
        
        // Hiện slide hiện tại
        sliderItem[index].style.display = 'block';
    }
    
    // Next slide
    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        showSlide(currentIndex);
    }
    
    // Previous slide
    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        showSlide(currentIndex);
    }
    
    // Auto slide mỗi 3 giây
    setInterval(nextSlide, 3000);
    
    // Xử lý click arrow
    const sliderArrows = document.querySelectorAll('.slider-arrow i');
    if (sliderArrows.length >= 2) {
        sliderArrows[0].addEventListener('click', nextSlide); // Right arrow
        sliderArrows[1].addEventListener('click', prevSlide); // Left arrow
    }
}

// ========================================
// 2. PRODUCT DETAIL - THUMBNAIL IMAGES
// ========================================
const productImages = document.querySelectorAll('.product-images-items img');
const mainImage = document.querySelector('.main-image');

productImages.forEach(img => {
    img.addEventListener('click', function() {
        // Remove active class from all
        productImages.forEach(i => i.classList.remove('active'));
        
        // Add active to clicked
        this.classList.add('active');
        
        // Change main image
        if (mainImage) {
            mainImage.src = this.src;
        }
    });
});

// ========================================
// 3. QUANTITY INPUT - TĂNG/GIẢM SỐ LƯỢNG
// ========================================
const quantityInputs = document.querySelectorAll('.product-detail-right-quantity-input');

quantityInputs.forEach(quantityInput => {
    const input = quantityInput.querySelector('.quantity-input');
    const addBtn = quantityInput.querySelector('.ri-add-line');
    const subtractBtn = quantityInput.querySelector('.ri-subtract-line');
    
    if (input && addBtn && subtractBtn) {
        // Tăng số lượng
        addBtn.addEventListener('click', function() {
            let value = parseInt(input.value);
            input.value = value + 1;
        });
        
        // Giảm số lượng (min = 1)
        subtractBtn.addEventListener('click', function() {
            let value = parseInt(input.value);
            if (value > 1) {
                input.value = value - 1;
            }
        });
    }
});

// ========================================
// 4. HEADER SCROLL EFFECT
// ========================================
const header = document.getElementById('header');

if (header) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('active');
        } else {
            header.classList.remove('active');
        }
    });
}

// ========================================
// 5. SMOOTH SCROLL - ANCHOR LINKS
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Bỏ qua nếu chỉ là "#"
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            const headerHeight = document.getElementById('header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Đóng mobile menu nếu đang mở
            if (headerNav && headerNav.classList.contains('active')) {
                headerNav.classList.remove('active');
                if (menuIcon) {
                    menuIcon.classList.remove('ri-close-line');
                    menuIcon.classList.add('ri-menu-line');
                }
            }
        }
    });
});

// ========================================
// 6. CONTACT FORM SUBMIT - MỚI THÊM
// ========================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // TODO: Gửi form contact đến server
        alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong 24h.');
        this.reset();
    });
}

// ========================================
// 7. ADD TO CART - THÊM VÀO GIỎ HÀNG
// ========================================
const addToCartBtns = document.querySelectorAll('.product-detail-right-addcart .main-btn');

addToCartBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        // Lấy số lượng hiện tại trong cart
        const cartIcon = document.querySelector('.header-cart i');
        let currentNumber = parseInt(cartIcon.getAttribute('number')) || 0;
        
        // Lấy số lượng sản phẩm muốn thêm
        const quantityInput = document.querySelector('.quantity-input');
        let quantity = quantityInput ? parseInt(quantityInput.value) : 1;
        
        // Cập nhật số lượng
        cartIcon.setAttribute('number', currentNumber + quantity);
        
        // Hiển thị thông báo
        alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng! 🛒`);
    });
});

// ========================================
// 8. TOGGLE PASSWORD VISIBILITY - AUTH PAGES
// ========================================
const togglePasswordIcons = document.querySelectorAll('.toggle-password');

togglePasswordIcons.forEach(icon => {
    icon.addEventListener('click', function() {
        const input = this.previousElementSibling;
        
        if (input && input.type === 'password') {
            input.type = 'text';
            this.classList.remove('ri-eye-line');
            this.classList.add('ri-eye-off-line');
        } else if (input) {
            input.type = 'password';
            this.classList.remove('ri-eye-off-line');
            this.classList.add('ri-eye-line');
        }
    });
});

// ========================================
// 9. LOGIN FORM SUBMIT
// ========================================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.querySelector('input[name="remember"]')?.checked;
        
        // Validate
        if (!email || !password) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        
        // TODO: Gửi request đến server
        console.log('Login:', { email, password, remember });
        
        // Demo: Giả lập đăng nhập thành công
        alert('Đăng nhập thành công! ');
        
        // Lưu thông tin user (demo)
        localStorage.setItem('user', JSON.stringify({ email, loggedIn: true }));
        
        // Chuyển về trang chủ
        window.location.href = '../../index.html';
    });
}

// ========================================
// 10. SIGNUP FORM SUBMIT
// ========================================
const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const terms = document.querySelector('input[name="terms"]')?.checked;
        
        // Validate
        if (!fullname || !email || !phone || !password || !confirmPassword) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Mật khẩu không khớp!');
            return;
        }
        
        if (password.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        
        if (!terms) {
            alert('Vui lòng đồng ý với điều khoản sử dụng!');
            return;
        }
        
        // TODO: Gửi request đến server
        console.log('Signup:', { fullname, email, phone, password });
        
        // Demo: Giả lập đăng ký thành công
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        
        // Chuyển sang trang login
        window.location.href = 'login.html';
    });
}

// ========================================
// 11. FORGOT PASSWORD & OTP
// ========================================
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const verifyCodeForm = document.getElementById('verifyCodeForm');

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        
        if (!email) {
            alert('Vui lòng nhập email!');
            return;
        }
        
        // TODO: Gửi mã OTP đến email
        console.log('Send OTP to:', email);
        
        // Demo: Hiện form nhập mã OTP
        alert('Mã xác nhận đã được gửi đến email của bạn! 📧');
        forgotPasswordForm.style.display = 'none';
        verifyCodeForm.style.display = 'block';
    });
}

// OTP INPUT AUTO FOCUS
const otpInputs = document.querySelectorAll('.otp-input');

otpInputs.forEach((input, index) => {
    input.addEventListener('input', function() {
        // Chỉ cho phép nhập số
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Auto focus sang ô tiếp theo
        if (this.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });
    
    // Xử lý backspace
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && this.value === '' && index > 0) {
            otpInputs[index - 1].focus();
        }
    });
});

// VERIFY CODE FORM
if (verifyCodeForm) {
    verifyCodeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Lấy mã OTP
        let otp = '';
        otpInputs.forEach(input => {
            otp += input.value;
        });
        
        if (otp.length !== 6) {
            alert('Vui lòng nhập đầy đủ 6 số!');
            return;
        }
        
        // TODO: Verify OTP với server
        console.log('Verify OTP:', otp);
        
        // Demo: Giả lập xác nhận thành công
        alert('Xác nhận thành công! ✅');
        
        // Chuyển sang trang reset password
        window.location.href = 'reset-password.html';
    });
}

// RESEND CODE
const resendCodeBtn = document.getElementById('resendCode');

if (resendCodeBtn) {
    resendCodeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // TODO: Gửi lại mã OTP
        console.log('Resend OTP');
        
        alert('Mã xác nhận mới đã được gửi! 📧');
    });
}

// ========================================
// 12. RESET PASSWORD
// ========================================
const resetPasswordForm = document.getElementById('resetPasswordForm');

if (resetPasswordForm) {
    const newPasswordInput = document.getElementById('new-password');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password');
    
    // Password strength checker
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            const password = this.value;
            checkPasswordStrength(password);
            checkPasswordRequirements(password);
        });
    }
    
    resetPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;
        
        if (!newPassword || !confirmNewPassword) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            alert('Mật khẩu không khớp!');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        
        // TODO: Gửi mật khẩu mới đến server
        console.log('Reset password:', newPassword);
        
        // Demo: Giả lập đặt lại thành công
        alert('Đặt lại mật khẩu thành công! ✅');
        
        // Chuyển về trang login
        window.location.href = 'login.html';
    });
}

// CHECK PASSWORD STRENGTH
function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    // Remove all classes
    strengthBar.classList.remove('weak', 'medium', 'strong');
    
    if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Mật khẩu yếu';
        strengthText.style.color = '#f44336';
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
        strengthText.textContent = 'Mật khẩu trung bình';
        strengthText.style.color = '#ff9800';
    } else {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Mật khẩu mạnh';
        strengthText.style.color = '#4caf50';
    }
}

// CHECK PASSWORD REQUIREMENTS
function checkPasswordRequirements(password) {
    const reqLength = document.getElementById('req-length');
    const reqUppercase = document.getElementById('req-uppercase');
    const reqLowercase = document.getElementById('req-lowercase');
    const reqNumber = document.getElementById('req-number');
    
    if (!reqLength) return;
    
    // Length
    if (password.length >= 6) {
        reqLength.classList.add('valid');
        reqLength.querySelector('i').classList.remove('ri-close-circle-line');
        reqLength.querySelector('i').classList.add('ri-checkbox-circle-line');
    } else {
        reqLength.classList.remove('valid');
        reqLength.querySelector('i').classList.remove('ri-checkbox-circle-line');
        reqLength.querySelector('i').classList.add('ri-close-circle-line');
    }
    
    // Uppercase
    if (/[A-Z]/.test(password)) {
        reqUppercase.classList.add('valid');
        reqUppercase.querySelector('i').classList.remove('ri-close-circle-line');
        reqUppercase.querySelector('i').classList.add('ri-checkbox-circle-line');
    } else {
        reqUppercase.classList.remove('valid');
        reqUppercase.querySelector('i').classList.remove('ri-checkbox-circle-line');
        reqUppercase.querySelector('i').classList.add('ri-close-circle-line');
    }
    
    // Lowercase
    if (/[a-z]/.test(password)) {
        reqLowercase.classList.add('valid');
        reqLowercase.querySelector('i').classList.remove('ri-close-circle-line');
        reqLowercase.querySelector('i').classList.add('ri-checkbox-circle-line');
    } else {
        reqLowercase.classList.remove('valid');
        reqLowercase.querySelector('i').classList.remove('ri-checkbox-circle-line');
        reqLowercase.querySelector('i').classList.add('ri-close-circle-line');
    }
    
    // Number
    if (/[0-9]/.test(password)) {
        reqNumber.classList.add('valid');
        reqNumber.querySelector('i').classList.remove('ri-close-circle-line');
        reqNumber.querySelector('i').classList.add('ri-checkbox-circle-line');
    } else {
        reqNumber.classList.remove('valid');
        reqNumber.querySelector('i').classList.remove('ri-checkbox-circle-line');
        reqNumber.querySelector('i').classList.add('ri-close-circle-line');
    }
}

// ========================================
// 13. SOCIAL LOGIN (Demo)
// ========================================
const socialBtns = document.querySelectorAll('.social-btn');

socialBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const provider = this.classList.contains('google-btn') ? 'Google' : 
                        this.classList.contains('facebook-btn') ? 'Facebook' : 'Apple';
        
        alert(`Đăng nhập với ${provider} (Chức năng demo)`);
        console.log('Social login:', provider);
    });
});

console.log('All functions initialized!');