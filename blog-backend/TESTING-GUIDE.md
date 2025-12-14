# 🚀 ArticleController - Quick Test Guide

## Swagger UI Access
Navigate to: **http://localhost:3000/api**

---

## 📋 Available Endpoints

### 1️⃣ GET /articles - Paginated Article List
**No authentication required** (public access)

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 10, max: 20)
- `isAscending` (boolean, default: false)
- `categorySlug` (string, optional) - e.g., "backend"
- `tagSlug` (string, optional) - e.g., "nestjs"
- `keyword` (string, optional) - e.g., "typescript"

**Example:**
```
GET /articles?page=1&pageSize=10&keyword=nestjs&categorySlug=backend
```

---

### 2️⃣ GET /articles/:slug - Get Single Article
**No authentication required** (public access)

**Example:**
```
GET /articles/introduction-to-nestjs
```

---

### 3️⃣ POST /articles - Create Article
**🔒 Authentication required** (AUTHOR, ADMIN, SUPERADMIN)

**Request Body Example:**
```json
{
  "title": "Getting Started with TypeORM",
  "slug": "getting-started-with-typeorm",
  "content": "<p>TypeORM is an ORM that can run in Node.js and can be used with TypeScript...</p>",
  "categoryId": "existing-category-uuid",
  "isPublished": false
}
```

---

### 4️⃣ PUT /articles/:id - Update Article
**🔒 Authentication required** (AUTHOR can update own, ADMIN can update any)

**Request Body Example:**
```json
{
  "title": "Updated Title",
  "content": "<p>Updated content...</p>",
  "isPublished": true
}
```

---

### 5️⃣ DELETE /articles/:id - Soft Delete
**🔒 Authentication required** (AUTHOR can delete own, ADMIN can delete any)

**Example:**
```
DELETE /articles/article-uuid-here
```

---

### 6️⃣ DELETE /articles/:id/hard - Hard Delete (Permanent)
**🔒 Authentication required** (ADMIN or SUPERADMIN only)

**Example:**
```
DELETE /articles/article-uuid-here/hard
```

---

## 🔐 Testing Authentication

Since JWT is not fully implemented yet, the mock guard automatically provides:
```javascript
{
  id: 'mock-user-id',
  roles: ['AUTHOR']
}
```

**To test different roles:**
1. Modify `src/common/guards/jwt-auth.guard.ts`
2. Change the `roles` array to test different permissions:
   - `['USER']` - Can only see published articles
   - `['AUTHOR']` - Can see own articles + published articles
   - `['ADMIN']` - Can see all articles
   - `['SUPERADMIN']` - Full access

---

## ✅ Expected Response Format

All endpoints return:
```json
{
  "success": boolean,
  "data": object | null,
  "errorMessage": string | null
}
```

**Success Example:**
```json
{
  "success": true,
  "data": { /* ArticleResponseDto */ },
  "errorMessage": null
}
```

**Error Example:**
```json
{
  "success": false,
  "data": null,
  "errorMessage": "Article not found or access denied"
}
```

---

## 🎯 Testing Scenarios

### Scenario 1: Public User Browsing
- GET /articles - See published articles only
- GET /articles/:slug - Access published articles

### Scenario 2: Author Creating Content
- POST /articles - Create new article
- PUT /articles/:id - Update own article
- DELETE /articles/:id - Soft delete own article

### Scenario 3: Admin Management
- GET /articles?includeDeleted=true - See all articles (Note: requires auth)
- PUT /articles/:id - Update any article
- DELETE /articles/:id/hard - Permanently delete

### Scenario 4: Search & Filter
- GET /articles?keyword=nestjs
- GET /articles?categorySlug=backend
- GET /articles?tagSlug=typescript
- GET /articles?keyword=nestjs&categorySlug=backend&pageSize=5

---

## 📊 Pagination Testing

Test large result sets:
```
GET /articles?pageSize=5&page=1
GET /articles?pageSize=5&page=2
GET /articles?pageSize=5&page=3
```

Response includes:
- `items[]` - Array of articles
- `currentPage` - Current page number
- `pageSize` - Items per page
- `totalCount` - Total articles matching filter
- `isAscending` - Sort order

---

## 🔍 Role-Based Visibility

| Role | Can See | Can Create | Can Update | Can Delete |
|------|---------|------------|------------|------------|
| USER | Published only | ❌ | ❌ | ❌ |
| AUTHOR | Own + Published | ✅ | Own articles | Own articles (soft) |
| ADMIN | All | ✅ | Any article | Any article (soft + hard) |
| SUPERADMIN | All | ✅ | Any article | Any article (soft + hard) |

---

## 🚦 Next Steps

1. **Start the server:**
   ```bash
   npm run start:dev
   ```

2. **Open Swagger UI:**
   ```
   http://localhost:3000/api
   ```

3. **Test endpoints** using the interactive Swagger interface

4. **Implement full JWT authentication** when ready

5. **Add database seed data** for realistic testing

---

## 💡 Tips

- All Swagger examples are pre-filled and ready to use
- Try different combinations of filters
- Test permission scenarios by changing mock roles
- Use Swagger's "Try it out" feature for quick testing
- Check console logs for detailed service responses
