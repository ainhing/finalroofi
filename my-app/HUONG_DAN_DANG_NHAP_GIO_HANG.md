# ✅ HƯỚNG DẪN SỬ DỤNG HỆ THỐNG LOGIN & GIỎ HÀNG

## 🔐 TÀI KHOẢN TEST CẮT DẪN

### **Admin:**
```
Email: admin@roofi.com
Password: admin123
```

### **Customer (Chọn một):**
```
Email: khach1@test.com
Password: 123456
```

```
Email: customer@gmail.com
Password: customer123
```

---

## 🛒 TÍNH NĂNG GIỎ HÀNG RIÊNG (MỚI)

### **✅ Đã Cập Nhật:**
- ✓ **Mỗi user có giỏ hàng riêng** - Dữ liệu được lưu với key là email của user
- ✓ **Khi login** - Tự động tải giỏ hàng của user đó
- ✓ **Khi logout** - Giỏ hàng được xóa toàn bộ
- ✓ **Khi login lại** - Giỏ hàng của user đó hiển thị lại như cũ

### **Ví dụ:**

#### Tình huống 1:
1. Login với `khach1@test.com`
2. Thêm 3 sản phẩm vào giỏ → Giỏ có 3 sản phẩm
3. Logout
4. Login lại với `khach1@test.com` → **Giỏ vẫn có 3 sản phẩm cũ** ✓

#### Tình huống 2:
1. Login với `khach1@test.com` → Giỏ có 3 sản phẩm
2. Logout
3. Login với `customer@gmail.com` → **Giỏ trống mới (của user này)** ✓

#### Tình huống 3:
1. Login với `khach2@test.com`
2. Thêm 5 sản phẩm
3. Logout → **Giỏ hàng xóa toàn bộ**
4. Login lại → **Giỏ vẫn có 5 sản phẩm cũ** ✓

---

## 🔧 CÁCH KIỂM TRA

### **Check giỏ hàng từng user:**
```javascript
// Mở F12 Console
// Giỏ của khach1@test.com
localStorage.getItem('APP_CART_khach1@test.com')

// Giỏ của customer@gmail.com
localStorage.getItem('APP_CART_customer@gmail.com')

// Giỏ guest (chưa login)
localStorage.getItem('APP_CART_GUEST')
```

### **Check user hiện tại:**
```javascript
JSON.parse(localStorage.getItem('APP_LOGIN'))
```

---

## ⚠️ LỖI EMAIL KHÔNG ĐÚNG

**Nếu bạn thấy "Email hoặc mật khẩu không đúng":**

### **Nguyên nhân:**
- Email bạn nhập không khớp với tài khoản mà tôi tạo

### **Giải Pháp:**
1. **Copy chính xác email từ danh sách:**
   - `admin@roofi.com` (KHÔNG phải `admin@roft.com`)
   - `khach1@test.com` (KHÔNG phải `khach1@zat.com`)
   
2. **Hoặc dùng email này (dễ nhớ hơn):**
   ```
   Email: customer@gmail.com
   Password: customer123
   ```

3. **Check lại:**
   - Không có dấu cách trước/sau email
   - Viết đúng chính tả
   - Chữ thường (không có chữ hoa)

---

## 📋 DANH SÁCH ĐẦY ĐỦ

| Email | Password | Role | Ghi chú |
|-------|----------|------|---------|
| admin@roofi.com | admin123 | Admin | Quản trị viên |
| khach1@test.com | 123456 | Customer | Nguyễn Văn A |
| khach2@test.com | 123456 | Customer | Trần Thị B |
| khach3@test.com | 123456 | Customer | Lê Minh C |
| customer@gmail.com | customer123 | Customer | Demo |

---

## 🎯 TEST GIỎ HÀNG

### **Test 1: Giỏ riêng theo user**
1. Login: `khach1@test.com`
2. Thêm 3 sản phẩm → Kiểm tra số lượng ở icon giỏ
3. Logout
4. Login: `customer@gmail.com` 
5. **Giỏ phải trống** ✓
6. Login lại: `khach1@test.com`
7. **Giỏ phải có 3 sản phẩm** ✓

### **Test 2: Xóa giỏ khi logout**
1. Login + Thêm sản phẩm
2. Logout
3. Giỏ hàng xóa trống
4. Không login → Giỏ vẫn trống

### **Test 3: Guest cart (chưa login)**
1. Không login
2. Thêm sản phẩm vào giỏ
3. Lưu trong `APP_CART_GUEST`
4. Login → Chuyển sang giỏ của user
5. Logout → Quay về guest cart

---

## 💡 MẸO

### **Reset toàn bộ:**
```javascript
localStorage.clear()
location.reload()
```

### **Xem tất cả dữ liệu:**
```javascript
// Tất cả giỏ hàng của mỗi user
Object.keys(localStorage).filter(k => k.startsWith('APP_CART'))

// Tất cả users
JSON.parse(localStorage.getItem('APP_USERS'))
```

---

## ✨ CHÚC BẠN TEST VUI VẺ!

Nếu vẫn có lỗi, hãy:
1. Refresh page (Ctrl+F5)
2. Xóa localStorage: `localStorage.clear()`
3. Reload lại website

