# Tóm Tắt Triển Khai - Authentication & Authorization

## 1. Kiểm Tra Đăng Nhập & Quyền Hạn Người Dùng

Tất cả các endpoint yêu cầu đăng nhập được bảo vệ bằng JWT token với middleware `checkLogin` hoặc `checkRoleAuthorization`.

### Các Tầng Bảo Mật:
- **Middleware checkLogin**: Kiểm tra token JWT hợp lệ
- **Middleware checkRoleAuthorization**: Kiểm tra role của user có được phép hay không

---

## 2. Quyền Hạn cho Users

| Endpoint | HTTP Method | Admin | Mod | Nghĩa |
|----------|-------------|-------|-----|-------|
| `/users` | GET | ✅ | ✅ | Lấy tất cả users |
| `/users/:id` | GET | ✅ | ✅ | Lấy user theo ID |
| `/users` | POST | ✅ | ❌ | Tạo user mới (Admin only) |
| `/users/:id` | PUT | ✅ | ❌ | Cập nhật user (Admin only) |
| `/users/:id` | DELETE | ✅ | ❌ | Xóa user (Admin only) |

**Giải thích:**
- **Admin**: Có full quyền (tất cả các thao tác)
- **Mod**: Chỉ có quyền ReadAll (xem tất cả, không được tạo/sửa/xóa)

---

## 3. Quyền Hạn cho Products

| Endpoint | HTTP Method | Yêu Cầu Đăng Nhập | Admin | Mod | User Khác | Nghĩa |
|----------|-------------|------------------|-------|-----|-----------|-------|
| `/products` | GET | ❌ | - | - | - | Xem tất cả sản phẩm (công khai) |
| `/products/:id` | GET | ❌ | - | - | - | Xem chi tiết sản phẩm (công khai) |
| `/products` | POST | ✅ | ✅ | ✅ | ❌ | Tạo sản phẩm (Admin & Mod) |
| `/products/:id` | PUT | ✅ | ✅ | ✅ | ❌ | Cập nhật sản phẩm (Admin & Mod) |
| `/products/:id` | DELETE | ✅ | ✅ | ❌ | ❌ | Xóa sản phẩm (Admin only) |

**Giải thích:**
- **GET**: Không cần đăng nhập (công khai)
- **POST, PUT**: Yêu cầu Admin hoặc Mod
- **DELETE**: Chỉ Admin có quyền

---

## 4. Chức Năng Đổi Mật Khẩu

### Endpoint: `POST /auth/change-password`

**Yêu cầu:**
- Header: `Authorization: Bearer {token}`
- Body JSON:
```json
{
  "oldPassword": "mật khẩu cũ",
  "newPassword": "mật khẩu mới"
}
```

**Kiểm tra:**
1. Kiểm tra user đã đăng nhập (token hợp lệ)
2. Kiểm tra `oldPassword` khớp với mật khẩu hiện tại
3. Kiểm tra `newPassword` khác với `oldPassword`
4. Hash mật khẩu mới và lưu vào database

**Response - Thành công:**
```json
{
  "message": "Đổi mật khẩu thành công",
  "success": true
}
```

**Response - Lỗi:**
```json
{
  "message": "Mật khẩu cũ không chính xác"
}
```

---

## 5. Các File Được Cập Nhật

### [utils/authHandler.js](utils/authHandler.js)
- Thêm middleware `checkRoleAuthorization` để kiểm tra quyền dựa trên role
- Cải tiến hàm `checkLogin` để xử lý lỗi tốt hơn
- Tích hợp populate role từ database

### [controllers/users.js](controllers/users.js)
- Thêm hàm `changePassword` để đổi mật khẩu
- Validation oldPassword bằng bcrypt.compareSync
- Hash newPassword bằng bcrypt.hashSync

### [routes/users.js](routes/users.js)
- Thêm `checkRoleAuthorization` cho tất cả endpoints
- GET endpoints: yêu cầu Admin/Mod
- POST/PUT/DELETE endpoints: yêu cầu Admin

### [routes/products.js](routes/products.js)
- GET endpoints: không yêu cầu đăng nhập (công khai)
- POST/PUT endpoints: yêu cầu Admin/Mod
- DELETE endpoint: yêu cầu Admin

### [routes/auth.js](routes/auth.js)
- Thêm endpoint `POST /auth/change-password`
- Cải tiến `/register` để hash mật khẩu
- Cải tiến response `/login` để trả về token và userId

---

## 6. Cách Sử Dụng

### Bước 1: Đăng Ký
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "username": "user123",
  "password": "password123",
  "email": "user@example.com",
  "role": "69a4f929f8d941f2dd234b88"
}
```

### Bước 2: Đăng Nhập
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "user123",
  "password": "password123"
}
```
Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Bước 3: Sử Dụng Token
```bash
GET http://localhost:3000/users
Authorization: Bearer {token}
```

### Bước 4: Đổi Mật Khẩu
```bash
POST http://localhost:3000/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

---

## 7. Lưu Ý Quan Trọng

- ✅ Tất cả mật khẩu được hash bằng bcrypt trước khi lưu
- ✅ Token JWT có thời hạn 1 giờ (3600 * 1000 ms)
- ✅ Role được populate từ database để kiểm tra quyền
- ✅ Xóa users/products thực hiện soft delete (isDeleted = true)
- ✅ Tất cả endpoints product GET không yêu cầu đăng nhập
- ✅ Lỗi authorization trả về status 403
- ✅ Validation body request được kiểm tra trước khi xử lý

---

## 8. Test Endpoints (Postman/Curl)

### Test GET Products (công khai):
```bash
curl http://localhost:3000/products
```

### Test GET Users (yêu cầu Admin/Mod):
```bash
curl -H "Authorization: Bearer {token}" http://localhost:3000/users
```

### Test DELETE Product (yêu cầu Admin):
```bash
curl -X DELETE -H "Authorization: Bearer {token}" http://localhost:3000/products/507f1f77bcf86cd799439011
```

### Test Change Password:
```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"password123","newPassword":"newpassword456"}' \
  http://localhost:3000/auth/change-password
```

---

**Hoàn thành:** ✅ Đã triển khai đầy đủ tất cả yêu cầu
