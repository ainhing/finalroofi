# 🔐 HƯỚNG DẪN SETUP GOOGLE OAUTH LOGIN

## 📋 BƯỚC 1: Tạo Google OAuth Credentials

### 1.1 Truy cập Google Cloud Console
1. Mở: https://console.cloud.google.com
2. Đăng nhập bằng tài khoản Google của bạn
3. Nếu chưa có dự án, click **"Tạo dự án"**

### 1.2 Tạo dự án mới (nếu cần)
- **Tên dự án**: ROOFI (hoặc tên khác)
- Click **"Tạo"**
- Chờ dự án được tạo (mất vài giây)

### 1.3 Cấu hình OAuth Consent Screen
1. Ở sidebar trái, chọn: **APIs & Services** → **OAuth consent screen**
2. Chọn **User type**: `External`
3. Click **"Tạo"**

**Điền thông tin:**
- **App name**: ROOFI Website
- **User support email**: your-email@gmail.com
- **Developer contact info**: your-email@gmail.com
- Click **"Lưu và tiếp tục"**

**Scopes:**
- Click **"Thêm hoặc xóa scopes"**
- Tìm và chọn:
  - `userinfo.email`
  - `userinfo.profile`
- Click **"Cập nhật"** → **"Lưu và tiếp tục"**

**Test users:**
- Thêm email của bạn (optional, để test)
- Click **"Lưu và tiếp tục"**

---

## 🔑 BƯỚC 2: Tạo OAuth Client ID

1. Ở sidebar, chọn: **APIs & Services** → **Credentials**
2. Click **"Tạo Credentials"** → **"OAuth Client ID"**
3. Chọn **Application type**: `Web application`
4. Tên: `ROOFI Web Client`

**Authorized JavaScript origins:**
```
http://localhost:4200
http://localhost:3000
https://yourdomain.com
```

**Authorized redirect URIs:**
```
http://localhost:4200
http://localhost:4200/login
https://yourdomain.com
https://yourdomain.com/login
```

5. Click **"Tạo"**
6. Copy **Client ID** (sẽ dùng sau)

---

## 💻 BƯỚC 3: Cấu hình trong Angular

### 3.1 Mở file login.ts
Tìm dòng này ở đầu file:
```typescript
googleClientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
```

### 3.2 Thay đổi Client ID
Thay `YOUR_GOOGLE_CLIENT_ID` bằng Client ID bạn vừa copy:
```typescript
googleClientId = '1234567890-abcdefghijklmnop.apps.googleusercontent.com';
```

---

## 🧪 BƯỚC 4: Test Google Login

### 4.1 Start development server
```bash
ng serve --open
```

### 4.2 Test đăng nhập Google
1. Mở: http://localhost:4200/login
2. Click button **"Đăng nhập với Google"**
3. Sẽ hiển thị popup Google Sign-In
4. Chọn tài khoản Google để đăng nhập
5. Sẽ tự động tạo tài khoản customer mới và redirect về homepage

### 4.3 Kiểm tra Console
Mở F12 → Console, bạn sẽ thấy log:
```
[GoogleAuth] ✅ Google Sign-In initialized
[GoogleAuth] Decoded token: {email: "...", name: "...", picture: "..."}
[GoogleAuth] ✅ Login success: ...
```

---

## 🔄 FLOW đăng nhập Google

```
1. User click "Đăng nhập với Google"
   ↓
2. Google Identity Services SDK hiển thị popup
   ↓
3. User chọn account Google & grant permissions
   ↓
4. Google trả về JWT token
   ↓
5. Angular decode token để lấy: email, name, picture
   ↓
6. Gọi AuthService.socialLogin()
   ↓
7. Nếu email chưa tồn tại → Tạo tài khoản customer mới
   Nếu email tồn tại → Cập nhật provider
   ↓
8. Lưu vào localStorage & Cart Service
   ↓
9. Redirect về homepage
```

---

## ✅ CÁC TÍNH NĂNG ĐÃ IMPLEMENT

- ✅ Load Google Identity Services SDK
- ✅ Initialize Google Sign-In với Client ID
- ✅ Decode JWT token từ Google
- ✅ Tự động đăng nhập / đăng ký
- ✅ Lưu user info vào localStorage
- ✅ Load giỏ hàng của user
- ✅ Proper error handling
- ✅ Console logging để debug

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Google is not defined"
→ Đảm bảo Google SDK script đã load thành công
→ Check Network tab xem có lỗi khi load từ Google

### Lỗi: "Invalid Client ID"
→ Kiểm tra Client ID nhập có đúng không
→ Đảm bảo domain trong Authorized origins khớp với localhost/domain thực

### Không có popup Google Sign-In
→ Kiểm tra browser console có error không
→ Thử disable popup blocker
→ Kiểm tra OAuth Consent Screen đã setup đúng không

### User không tự động đăng nhập sau khi chọn Google account
→ Kiểm tra callback function có trigger không
→ Mở DevTools → Console xem có error không

---

## 📚 TÀI LIỆU THAM KHẢO

- **Google Identity Services**: https://developers.google.com/identity/gsi/web
- **Google Cloud Console**: https://console.cloud.google.com
- **OAuth 2.0 Scopes**: https://developers.google.com/identity/protocols/oauth2/scopes

---

## 💡 MẸO THÊM

### Nếu dùng Production domain
Cập nhật `login.ts`:
```typescript
googleClientId = 'YOUR_PRODUCTION_CLIENT_ID.apps.googleusercontent.com';
```

### Nếu muốn hiển thị avatar Google
Token có chứa `picture` field:
```typescript
const picture = payload.picture; // URL ảnh đại diện
```

### Nếu muốn auto-login khi user quay lại
Thêm logic kiểm tra loginKey ở `ngOnInit()`

---

**Chúc bạn setup thành công! 🎉**

Nếu có vấn đề, check console (F12) để xem error messages.
