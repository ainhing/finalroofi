# 🔐 Hệ Thống Đăng Nhập ROOFI

## ✅ Đã Hoàn Thành

### 1. **Auth Guard** - Bảo vệ Routes
- ✅ `authGuard` - Yêu cầu đăng nhập
- ✅ `customerGuard` - Chỉ cho phép customer
- ✅ `adminGuard` - Chỉ cho phép admin

### 2. **AuthService** - Quản lý Authentication
- ✅ Login với email/password
- ✅ Login với Google (Demo + Real)
- ✅ Login với Facebook (Demo + Real)
- ✅ Login với Instagram (Demo)
- ✅ Phân biệt role: Customer & Admin
- ✅ Remember me
- ✅ Auto-redirect sau login

### 3. **Trang User Profile** (`/profile`)
- ✅ Hiển thị thông tin user
- ✅ Hiển thị provider đăng nhập
- ✅ Quick links (Orders, Cart, Home)
- ✅ Bảo vệ bằng `customerGuard`

### 4. **Trang Admin Dashboard** (`/admin`)
- ✅ Giao diện admin cơ bản
- ✅ Stats dashboard
- ✅ Quick actions
- ✅ Bảo vệ bằng `adminGuard`

### 5. **Header với User Menu**
- ✅ Hiển thị avatar khi đã login
- ✅ Dropdown menu với thông tin user
- ✅ Link đến Profile/Admin Dashboard
- ✅ Nút đăng xuất
- ✅ Auto-refresh khi login/logout

### 6. **Protected Routes**
- ✅ `/profile` - Yêu cầu customer login
- ✅ `/admin` - Yêu cầu admin login
- ✅ `/buynow-checkout` - Yêu cầu login
- ✅ `/order-confirm` - Yêu cầu login

---

## 🎯 Cách Sử Dụng

### **Login cho Customer**

**Bước 1:** Đăng ký tài khoản mới
- Vào `/signup`
- Điền thông tin: Email, Password, Full Name
- Hệ thống tự động tạo tài khoản với role = `customer`

**Bước 2:** Đăng nhập
- Vào `/login`
- Nhập email và password
- Hoặc đăng nhập bằng Google/Facebook

**Bước 3:** Truy cập trang cá nhân
- Sau khi login, click vào avatar ở header
- Chọn "Thông tin tài khoản" để vào `/profile`

---

### **Login cho Admin**

**Tài khoản admin mặc định:**
```
Email: admin@roofi.com
Password: admin123
```

**Sau khi login:**
- Click vào avatar ở header
- Chọn "Admin Dashboard" để vào `/admin`

---

### **Login bằng Social (Google/Facebook)**

#### **Google Login (Thực tế)**
1. Lấy Google Client ID từ [Google Cloud Console](https://console.cloud.google.com/)
2. Mở file `src/app/auth/login/login.ts`
3. Thay thế:
```typescript
client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
```

#### **Facebook Login (Thực tế)**
1. Tạo Facebook App tại [Facebook Developers](https://developers.facebook.com/)
2. Mở file `src/app/auth/login/login.ts`
3. Thay thế:
```typescript
appId: 'YOUR_FACEBOOK_APP_ID'
```

#### **Demo Mode**
- Nếu chưa có API keys, hệ thống sẽ tự động chạy ở **Demo Mode**
- Click vào nút Google/Facebook/Instagram sẽ tạo tài khoản demo

---

## 🔒 Bảo Mật

### **Protected Routes**
```typescript
// Customer only
{ path: 'profile', component: UserProfile, canActivate: [customerGuard] }

// Admin only
{ path: 'admin', component: AdminDashboard, canActivate: [adminGuard] }
```

### **Check Login Status**
```typescript
// Trong component
if (this.authService.isLoggedIn()) {
  const user = this.authService.getCurrentUser();
  
  if (this.authService.isAdmin()) {
    // Admin logic
  }
  
  if (this.authService.isCustomer()) {
    // Customer logic
  }
}
```

---

## 📊 Data Structure

### **User Object**
```typescript
{
  email: string,
  password: string,
  fullname?: string,
  role: 'customer' | 'admin',
  provider: 'email' | 'google' | 'facebook' | 'instagram',
  createdAt: Date
}
```

### **Login Session (localStorage)**
```typescript
{
  email: string,
  role: string,
  fullname: string,
  provider: string
}
```

---

## 🎨 UI Components

### **Login Page** (`/login`)
- Email/Password form
- Remember me checkbox
- Social login buttons (Google, Facebook, Instagram)
- Link đến Forgot Password & Signup
- Validation & error messages

### **User Profile** (`/profile`)
- Avatar & user info
- Email, role, provider
- Quick links
- Edit info & change password buttons

### **Admin Dashboard** (`/admin`)
- Stats cards (Users, Orders, Revenue, Products)
- Admin info section
- Quick action buttons
- Coming soon notice

### **Header User Menu**
- Avatar với dropdown
- User info display
- Links: Profile/Admin, Orders, Cart
- Logout button

---

## 🚀 Next Steps (Nếu muốn mở rộng)

### **Backend Integration**
```typescript
// Thay vì localStorage, gọi API:
login(email: string, password: string): Observable<LoginResponse> {
  return this.http.post<LoginResponse>('/api/auth/login', { email, password });
}
```

### **JWT Token**
```typescript
// Lưu token thay vì full user data
localStorage.setItem('token', response.token);

// Add interceptor để attach token vào headers
```

### **User Management (Admin)**
- List all users
- Edit/Delete users
- Change user roles
- View user activity

### **Social Login (Full OAuth)**
- Implement proper OAuth flow
- Handle refresh tokens
- Store access tokens securely

---

## 📝 Testing

### **Test Customer Login**
1. Tạo tài khoản mới tại `/signup`
2. Login tại `/login`
3. Verify redirect về trang chủ
4. Check header hiển thị avatar
5. Click avatar → Check dropdown menu
6. Truy cập `/profile` → Verify info hiển thị đúng
7. Logout → Verify redirect và menu biến mất

### **Test Admin Login**
1. Login với `admin@roofi.com` / `admin123`
2. Verify redirect đến `/admin`
3. Check admin dashboard hiển thị
4. Verify không thể access `/profile`
5. Check header menu có link "Admin Dashboard"

### **Test Protected Routes**
1. Logout
2. Thử truy cập `/profile` → Redirect về `/login`
3. Thử truy cập `/admin` → Redirect về `/login`
4. Login rồi truy cập lại → Verify được phép vào

### **Test Social Login**
1. Click "Đăng nhập với Google"
2. Verify popup/redirect (nếu có API keys)
3. Verify tạo tài khoản mới với provider = 'google'
4. Verify login thành công

---

## 🐛 Troubleshooting

### **Lỗi: "Cannot find module '@angular-devkit/architect'"**
✅ **Đã fix:** Tạo lại `package.json` và install dependencies

### **Lỗi: Guard không hoạt động**
- Check import guards trong routing
- Verify AuthService.isLoggedIn() return đúng
- Check localStorage có dữ liệu login

### **Lỗi: Header không update sau login**
- Check router.events subscription trong Header
- Verify checkLoginStatus() được gọi
- Force detect changes nếu cần

### **Social Login không hoạt động**
- Check console có load script không
- Verify API keys đúng
- Kiểm tra domain được whitelist

---

## ✨ Tính Năng Đặc Biệt

1. **Auto-redirect**: Sau login, redirect về trang user đang cố truy cập
2. **Role-based routing**: Admin → `/admin`, Customer → `/` hoặc trang trước đó
3. **Demo mode**: Social login hoạt động ngay cả không có API keys
4. **Remember me**: Lưu session dài hơn
5. **Validation**: Email format, required fields
6. **User feedback**: Toast notifications cho mọi action

---

## 📧 Contact

Nếu cần hỗ trợ hoặc có câu hỏi, vui lòng liên hệ dev team.

**Happy Coding! 🚀**
