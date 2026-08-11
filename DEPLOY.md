# 墨笺 Inkwell Journal · 部署指南

> 全栈应用：React + Vite 前端 + NestJS 后端 + SQLite 数据库
> 服务器：腾讯云轻量应用服务器「嘿嘿」，公网 IP `110.40.167.88`
> 环境：**宝塔面板**（BT Panel）+ Nginx
> 项目目录：`/www/wwwroot/inkwell/`
> 仓库：`https://github.com/zjp2/bifa`（服务器端通过 ghproxy.net 镜像访问）

---

## 架构概览

```
用户浏览器
    │
    ▼
┌──────────────────┐
│  宝塔 Nginx (80)   │  ← /www/server/nginx/conf/nginx.conf
│  ┌──────────────┐ │     站点配置: /www/server/panel/vhost/nginx/inkwell.conf
│  │  前端静态文件 │ │  ← /www/wwwroot/inkwell/frontend/dist/
│  └──────────────┘ │
│  ┌──────────────┐ │  /api/* 反代
│  │ NestJS:3001  │ │  ← PM2 进程 inkwell-backend
│  └──────────────┘ │
│  ┌──────────────┐ │
│  │  prod.db     │ │  ← SQLite 数据库
│  └──────────────┘ │
└──────────────────┘
```

---

## 0. 首次部署（从零开始）

> ⚠️ 本服务器已预配宝塔面板 + Nginx，通常这步已经完成，直接跳到第 1 节「日常更新」。

### 0.1 环境信息速查

| 项目 | 路径/命令 |
|------|-----------|
| 项目根目录 | `/www/wwwroot/inkwell/` |
| 前端根目录 | `/www/wwwroot/inkwell/frontend/dist` |
| 后端目录 | `/www/wwwroot/inkwell/backend` |
| Nginx 主配置 | `/www/server/nginx/conf/nginx.conf` |
| 站点配置 | `/www/server/panel/vhost/nginx/inkwell.conf` |
| 后端数据库 | `/www/wwwroot/inkwell/backend/prod.db` |
| PM2 进程名 | `inkwell-backend` |
| 后端端口 | `3001` |
| Nginx 反代规则 | `/api/*` → `localhost:3001` |

### 0.2 安装依赖 + 首次构建

```bash
# 后端
cd /www/wwwroot/inkwell/backend
npm install

# 数据库（首次部署：用 db push 直接建表，不用 migrate deploy）
rm -f prod.db
npx prisma db push

# 配置环境变量
cat > .env << 'EOF'
DATABASE_URL="file:./prod.db"
JWT_SECRET="随机长字符串"
NODE_ENV="production"
EOF

# 生成 JWT_SECRET：node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 构建后端
npm run build
pm2 start dist/main.js --name inkwell-backend
pm2 save
pm2 startup systemd  # 按提示复制命令执行

# 前端
cd /www/wwwroot/inkwell/frontend
npm install
npm run build
# 产物在 /www/wwwroot/inkwell/frontend/dist/
```

### 0.3 验证 Nginx 站点配置

```bash
# 查看当前配置
cat /www/server/panel/vhost/nginx/inkwell.conf

# 测试 + 重载
nginx -t && nginx -s reload
```

站点配置应当包含：
```nginx
server {
    listen 80;
    server_name _;
    root /www/wwwroot/inkwell/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 1. 日常更新（代码更新后）

```bash
# ① 进入项目目录
cd /www/wwwroot/inkwell

# ② 拉取最新代码（如果遇到 package-lock.json 冲突）
git checkout -- backend/package-lock.json   # 丢弃本地修改
git pull origin main

# ③ 构建后端
cd /www/wwwroot/inkwell/backend
npm run build
pm2 delete inkwell-backend
pm2 start dist/main.js --name inkwell-backend
pm2 save

# ④ 构建前端
cd /www/wwwroot/inkwell/frontend
npm run build

# ⑤ 重载 Nginx
nginx -s reload

# ⑥ 浏览器强制刷新：Ctrl+Shift+R
```

---

## 2. 数据库相关操作

### 首次部署 / 重建数据库

```bash
cd /www/wwwroot/inkwell/backend
rm -f prod.db
npx prisma db push
```

### 后续迁移（如 schema 有变更）

```bash
cd /www/wwwroot/inkwell/backend

# 如果是全新迁移文件（之前没跑过 migrate）
npx prisma migrate resolve --applied <migration_name>  # 基准化

# 然后正常部署
npx prisma migrate deploy
```

### 数据备份

```bash
# 手动备份
cp /www/wwwroot/inkwell/backend/prod.db /www/wwwroot/inkwell/backend/prod.db.bak.$(date +%Y%m%d)

# 自动备份（crontab）
crontab -e
# 每天凌晨 3 点
0 3 * * * cp /www/wwwroot/inkwell/backend/prod.db /www/wwwroot/inkwell/backend/prod.db.bak.$(date +\%Y\%m\%d)
```

---

## 3. 验证清单

部署完成后依次检查：

- [ ] `pm2 status` 显示 `inkwell-backend` 为 **online**
- [ ] `curl -s http://localhost:3001/auth/me` 返回 JSON（401 正常）
- [ ] `curl -s http://127.0.0.1/ | head -3` 返回包含「墨笺」的 HTML
- [ ] `curl -s http://127.0.0.1/api/auth/me` 返回 JSON（Nginx 反代正常）
- [ ] 外网访问 `http://110.40.167.88/` 看到登录页
- [ ] 注册 → 登录 → 创建日记本 → 写日记 → 全流程
- [ ] 手机访问 `http://110.40.167.88/` 移动端布局正常

---

## 4. 常见问题

**Q：`git pull` 报 `package-lock.json` 冲突？**
> ```
> git checkout -- backend/package-lock.json
> git pull origin main
> ```

**Q：`npx prisma migrate deploy` 报 P3005（数据库非空）？**
> 首次部署用 `npx prisma db push` 代替 `migrate deploy`。如果想保留旧数据，用 `npx prisma migrate resolve --applied <migration_name>` 基准化。

**Q：PM2 报 `Script already launched`？**
> ```
> pm2 delete inkwell-backend
> pm2 start dist/main.js --name inkwell-backend
> ```

**Q：502 Bad Gateway？**
> 后端没启动。`pm2 status` 检查，`pm2 logs inkwell-backend` 看报错。

**Q：前端能开但接口全是 404？**
> Nginx 反代没生效。检查 `cat /www/server/panel/vhost/nginx/inkwell.conf`，确认 `proxy_pass http://localhost:3001/` 存在，然后 `nginx -t && nginx -s reload`。

**Q：登录接口报 CORS 错误？**
> 生产环境 Nginx 反代后不会有 CORS 问题。直接访问 3001 端口才会遇到。

**Q：外网访问不到？**
> 腾讯云控制台 → 轻量实例 → 防火墙 → 确保 TCP 80 已开放。

**Q：浏览器看到的还是旧版本？**
> 1. 强制刷新（Ctrl+Shift+R）
> 2. 确认 `dist/` 是最新构建产物（`ls -la dist/index.html`）
> 3. 如果用了 CDN/EdgeOne，需手动刷新缓存

---

## 5. 回滚

```bash
cd /www/wwwroot/inkwell

# 回到上一个稳定版本
git checkout <稳定commit>

# 重建
cd frontend && npm run build
cd ../backend && npm run build
pm2 delete inkwell-backend
pm2 start dist/main.js --name inkwell-backend
nginx -s reload

# 数据库回滚
cp prod.db.bak.20260810 prod.db
```
