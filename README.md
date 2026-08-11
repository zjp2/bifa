# 墨笺 · Inkwell Journal

> 笔墨随心动 ❦ 纸上记光阴

一座文人手札风格的日记平台。古籍手札美学 × 富文本编辑 × 移动端友好，适合记录日常所思、读书笔记、代码片段。

---

## 设计语言

摒弃常见的紫白渐变 AI 美学，采用 **「古籍手札」** 视觉风格：

| 项 | 值 |
|---|---|
| 主色 | 宣纸米色 `#f3ead7` |
| 文字 | 墨色 `#231a12` |
| 强调 | 朱砂红 `#8a2f1f` |
| 装饰 | 鎏金 `#9a7b3a` |
| 中文字体 | 思源宋体 / 马善政 |
| 拉丁字体 | Cormorant Garamond / Spectral |
| 手写字体 | Caveat |
| 等宽字体 | JetBrains Mono |

质感细节：纸张噪点纹理、木纹书架、装饰性符号 ❦、虚线边距线、暗角光晕、段首大字下沉。

---

## 功能总览

### 1. 用户登录

- 登记式登录（姓名 / 邮箱 / 密码）
- 访客模式一键进入
- 登录态持久化（localStorage）
- 路由守卫：未登录强制跳登录页

> 当前为 Mock 模式，正式版将接入后端 + JWT。

### 2. 三层内容结构

```
书架（Bookshelf）
  └─ 书 / 日记本（Journal）
       └─ 章节（Chapter）
            └─ 日记条目（Entry）
```

- **书架页**：3D 透视书卡网格，6 种封面色可选
- **书内页**：左侧木纹目录树 + 右侧编辑器
- **章节树**：可折叠、可重命名、可删除、显示条目数
- **日记条目**：标题 / 副标题 / 日期 / 正文 / 标签

### 3. 富文本编辑

**选中即浮出的气泡工具条**（移动端友好）

| 分组 | 功能 |
|---|---|
| 字形 | 加粗 / 斜体 / 下划线 / 删除线 |
| 标记 | 金墨高亮 / 朱砂批注 / 行内代码 |
| 段落 | 小标题 / 引言 |

**底部可折叠工具条**（不需要选中也能用）

- 撤销 / 重做
- 无序列表 / 有序列表
- 分割线 / 时间戳
- 代码块插入
- 图片插入
- 语音输入
- 存稿

**其他编辑特性**
- 段首大字下沉，首字母朱砂红
- 小标题左侧朱砂竖线
- 引言使用朱砂双线 + 米色底纹
- 图片自带相纸白边 + 轻微旋转
- 标签栏（回车添加，点击删除）
- 自动保存（输入 800ms 后存稿，Ctrl/⌘+S 手动存）

### 4. 代码片段

支持两种形态，方便记录技术笔记：

- **代码块**：深色木匣质感 + 朱砂左竖线 + JetBrains Mono 等宽字体 + 右上角语言标签（金色斜体大写）
- **行内代码**：鎏金半透明背景 + 朱砂字色

插入弹窗支持：类型切换、语言标注、所见即所得预览、HTML 转义保护。

### 5. 图片

- 文件选择 → 预览 → 加图注（手写体）→ 嵌入
- 点击图片放大查看（lightbox）
- 自动加相纸白边 + 轻微旋转的胶片感

### 6. 语音输入

基于 Web Speech API（`webkitSpeechRecognition`），语言 `zh-CN`。

- **四个入口**：标题旁话筒 / 桌面工具栏 / 桌面顶栏 / 移动端底栏
- **实时反馈**：顶部朱砂红条 + 红点闪烁 + 实时显示识别文字
- **写入策略**：最终结果通过 `insertHTML/insertText` 写入，自动存稿
- **兼容提示**：不支持时 toast 提示使用 Chrome

### 7. 移动端适配

| 组件 | 桌面 | 移动端 |
|---|---|---|
| 顶部导航 | 无 | 汉堡菜单 + 标题 + 用户头像 |
| 侧栏 | 300px 固定章节树 | 隐藏，抽屉式菜单 |
| 工具栏 | 桌面底部浮条 | 可折叠底部主条 + 选中气泡 |
| 编辑器顶栏 | 右上角按钮组 | 隐藏 |
| 安全区 | - | `env(safe-area-inset-*)` 全面适配 |

**移动端三套交互**
1. **选中气泡**：选中文本即浮出格式工具
2. **底部主条**：5 按钮（篇章 / 格式 / 语音 / 插图 / 存稿）
3. **浮出抽屉**：点"格式"或"篇章"扩展，互斥显示，点外部收起

### 8. 数据持久化

```js
inkwell_user_v3  // { name, email, guest, loginAt }
inkwell_data_v3  // { journals[], current*, collapsedChapters }
```

首次加载为空时自动播种示例数据（2 本书 + 4 篇日记）。

---

## 技术栈

### 原型版（单文件演示）

| 层 | 技术 |
|---|---|
| 框架 | 原生 HTML + CSS + JS（单文件） |
| 富文本 | `document.execCommand` |
| 语音 | Web Speech API |
| 存储 | localStorage |
| 字体 | Google Fonts |

### 正式版（开发中）

| 层 | 技术 |
|---|---|
| 前端框架 | React 19 + Vite + TypeScript |
| 富文本 | Tiptap |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS + CSS 变量 |
| 后端 | NestJS + Prisma |
| 数据库 | SQLite（开发）/ PostgreSQL（生产） |
| 鉴权 | JWT + bcrypt |
| 代码质量 | ESLint / OxLint + Prettier |

---

## 数据结构

```typescript
interface Journal {
  id: string;
  name: string;
  desc: string;
  color: string;          // 封面色
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  name: string;
  entries: Entry[];
}

interface Entry {
  id: string;
  title: string;
  subtitle: string;
  date: number;           // timestamp
  content: string;        // 富文本 HTML
  tags: string[];
}

interface User {
  name: string;
  email: string;
  guest: boolean;
  loginAt: number;
}
```

---

## 数据库设计（正式版）

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(50)  NOT NULL,
  email       VARCHAR(120) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,  -- bcrypt 哈希
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE journals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  color       VARCHAR(20) DEFAULT '#8a2f1f',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chapters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id  UUID REFERENCES journals(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  sort_order  INT DEFAULT 0
);

CREATE TABLE entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id  UUID REFERENCES chapters(id) ON DELETE CASCADE,
  title       VARCHAR(200),
  subtitle    VARCHAR(200),
  content     TEXT,
  tags        JSONB DEFAULT '[]'::jsonb,
  entry_date  DATE DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 原型版（纯前端）

无需构建，直接在浏览器中打开根目录 `index.html` 即可体验。

### 正式版（React + NestJS）

项目采用前后端分离架构，需分别启动后端和前端服务。

**1. 启动后端**

```bash
cd backend

# 安装依赖
npm install

# 初始化数据库（开发环境使用 SQLite，无需额外安装数据库）
npx prisma migrate dev --name init

# （可选）填充示例数据
npm run db:seed

# 启动开发服务器（默认端口 3000）
npm run start:dev
```

后端启动后访问：http://localhost:3000

**2. 启动前端**

新开一个终端窗口：

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器（默认端口 5173）
npm run dev
```

前端启动后访问：http://localhost:5173

**3. 常用命令**

```bash
# 后端
cd backend
npm run build          # 构建生产版本
npm run start:prod     # 运行生产版本
npm run lint           # 代码检查

# 前端
cd frontend
npm run build          # 构建生产版本
npm run preview        # 预览生产构建
npm run lint           # 代码检查
```

---

## 安全要点（正式版务必做）

1. 密码必须 `bcrypt.hash(password, 10)` 加盐哈希
2. JWT 密钥用环境变量，不要硬编码
3. 全站 HTTPS（Nginx + Let's Encrypt）
4. 用户隔离：每个查询都要 `WHERE owner_id = req.userId`
5. 用 Prisma 参数化查询，防 SQL 注入
6. 登录接口加 rate-limit，防暴力破解
7. CORS 只允许自己的前端域名

---

## 后续规划

- [ ] 全文搜索
- [ ] 日记导出（Markdown / PDF）
- [ ] 代码块语法高亮（highlight.js）
- [ ] 拖拽排序（章节、条目）
- [x] 多端同步（后端已接入，服务端存储，天然支持多端）
- [ ] 离线支持（PWA + Service Worker）
- [ ] 主题切换（夜读模式）
- [ ] 数据统计（写作字数热力图）
