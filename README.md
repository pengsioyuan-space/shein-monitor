
# 📦 Order Dashboard (Vercel + Backend)

## 1️⃣ 推送 GitHub

```bash
git init
git add .
git commit -m "init dashboard"
git branch -M main
git remote add origin https://github.com/你的仓库.git
git push -u origin main
```

---

## 2️⃣ Vercel 部署

### 方式 A（推荐：前端）
1. 进入 https://vercel.com
2. Import GitHub repo
3. Framework: Other
4. Root: /frontend
5. Deploy

---

## 3️⃣ 后端（Django）

本项目后端需单独部署：

推荐：
- Render
- Railway
- VPS

---

## 4️⃣ API必须提供

- GET /api/dashboard
- GET /api/orders?date=&shop=
- GET /api/export?date=&shop=

---

## 5️⃣ 核心功能

- 按天筛选订单
- 按店铺筛选订单
- 运营勾选
- 导出Excel
