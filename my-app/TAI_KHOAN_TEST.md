# 🔑 TÀI KHOẢN TEST - ROOFI WEBSITE

## 📋 DANH SÁCH TÀI KHOẢN SẴN SÀNG DÙNG

### 🔴 TÀI KHOẢN ADMIN

```
📧 Email: admin@roofi.com
🔒 Password: admin123
👤 Họ tên: Administrator
🎭 Role: Admin
```

**Quyền truy cập:**
- ✅ Truy cập Admin Dashboard tại `/admin`
- ✅ Xem tất cả chức năng quản trị
- ✅ Có thể truy cập mọi trang

---

### 🟢 TÀI KHOẢN KHÁCH HÀNG (CUSTOMER)

#### **Tài khoản 1: Nguyễn Văn A**
```
📧 Email: khach1@test.com
🔒 Password: 123456
👤 Họ tên: Nguyễn Văn A
🎭 Role: Customer
```

#### **Tài khoản 2: Trần Thị B**
```
📧 Email: khach2@test.com
🔒 Password: 123456
👤 Họ tên: Trần Thị B
🎭 Role: Customer
```

#### **Tài khoản 3: Lê Minh C**
```
📧 Email: khach3@test.com
🔒 Password: 123456
👤 Họ tên: Lê Minh C
🎭 Role: Customer
```

#### **Tài khoản 4: Customer Demo**
```
📧 Email: customer@gmail.com
🔒 Password: customer123
👤 Họ tên: Customer Demo
🎭 Role: Customer
```

**Quyền truy cập:**
- ✅ Truy cập trang cá nhân tại `/profile`
- ✅ Xem đơn hàng, giỏ hàng
- ✅ Mua sắm, thanh toán
- ❌ KHÔNG thể vào Admin Dashboard

---

## 🚀 CÁCH SỬ DỤNG

### **Bước 1: Mở trang login**
Truy cập: http://localhost:4200/login

### **Bước 2: Chọn tài khoản muốn test**
Copy/paste email và password từ danh sách trên

### **Bước 3: Đăng nhập**
Click nút "Đăng nhập"

### **Bước 4: Kiểm tra**
- Với **Admin**: Tự động chuyển đến `/admin`
- Với **Customer**: Chuyển về trang chủ `/`
- Click vào **avatar** ở header để xem menu user

---

## 🎯 TEST SCENARIOS

### **Test 1: Login Admin**
1. Dùng: `admin@roofi.com` / `admin123`
2. Kiểm tra redirect đến `/admin`
3. Xem Admin Dashboard
4. Click avatar → Thấy menu admin

### **Test 2: Login Customer**
1. Dùng: `khach1@test.com` / `123456`
2. Kiểm tra redirect về trang chủ
3. Click avatar → Chọn "Thông tin tài khoản"
4. Xem profile tại `/profile`

### **Test 3: Phân quyền**
1. Login với customer
2. Thử vào `/admin` → Bị chặn, redirect về `/`
3. Logout
4. Login với admin
5. Vào `/admin` → OK
6. Vào `/profile` → OK (admin có full quyền)

### **Test 4: Protected Routes**
1. Logout (hoặc chưa login)
2. Thử vào `/profile` → Redirect `/login`
3. Thử vào `/admin` → Redirect `/login`
4. Thử vào `/buynow-checkout` → Redirect `/login`

---

## 💡 MẸO HAY

### **Xem tất cả tài khoản trong hệ thống**
Mở Developer Console (F12) và gõ:
```javascript
JSON.parse(localStorage.getItem('APP_USERS'))
```

### **Xem ai đang đăng nhập**
```javascript
JSON.parse(localStorage.getItem('APP_LOGIN'))
```

### **Đăng xuất nhanh**
```javascript
localStorage.removeItem('APP_LOGIN')
location.reload()
```

### **Reset toàn bộ (xóa hết accounts)**
```javascript
localStorage.clear()
location.reload()
```

Sau khi reload, hệ thống sẽ tự động tạo lại 5 tài khoản mặc định!

---

## 📝 COPY NHANH

### Admin:
```
admin@roofi.com
admin123
```

### Customer nhanh nhất:
```
khach1@test.com
123456
```

### Customer khác:
```
customer@gmail.com
customer123
```

---

## ⚡ QUICK START

**Cách nhanh nhất để test:**

1. Mở http://localhost:4200/login
2. Nhập: `khach1@test.com`
3. Nhập: `123456`
4. Click "Đăng nhập"
5. Done! ✨

**Test Admin:**
1. Logout (click avatar → Đăng xuất)
2. Login lại với: `admin@roofi.com` / `admin123`
3. Tự động vào Admin Dashboard

---

## 🎉 CHÚC BẠN TEST VUI VẺ!

Nếu có lỗi hoặc cần hỗ trợ, vui lòng báo lại.
