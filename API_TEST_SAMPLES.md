# API Test Samples (Postman)

## Files to import

- Collection: `postman/RBAC_API_Test.postman_collection.json`
- Environment: `postman/Local_API.postman_environment.json`

## Import into Postman

1. Open Postman.
2. Click `Import`.
3. Import 2 files above.
4. Select environment `Local API`.

## Variables you must set first

In environment `Local API`, set:
- `baseUrl` = `http://localhost:3000`
- `adminRoleId`
- `modRoleId`
- `userRoleId`

Note:
- `adminRoleId/modRoleId/userRoleId` are MongoDB `_id` of roles.
- If your DB already has roles, copy IDs into environment.

## Run order

1. Folder `Auth`
2. Folder `Roles RBAC`
3. Folder `Users RBAC`
4. Folder `Products RBAC`
5. Folder `Change Password`

## What is automated

- `Login Admin/Mod/User` automatically save token to:
  - `adminToken`
  - `modToken`
  - `userToken`
- `POST /products as mod` automatically saves `productId`.

## Expected permission results

- `roles`
  - Admin: GET/POST/PUT/DELETE allowed
  - Mod: GET allowed, POST/PUT/DELETE denied (403)
- `users`
  - Admin: full allowed
  - Mod: read only (GET) allowed, write denied (403)
- `products`
  - GET public: no token needed
  - POST/PUT: admin + mod allowed
  - DELETE: admin only
- `change-password`
  - Requires token + `oldPassword` + `newPassword`

## Quick troubleshooting

- `403 ban chua dang nhap`: token missing/expired.
- `403 ban khong co quyen truy cap`: role does not match endpoint permission.
- `400`: bad request body or validation error.
