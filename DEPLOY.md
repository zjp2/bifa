# 墨笺 Inkwell Journal · 部署说明

> 项目形态：**纯静态单文件站点**（`index.html` = HTML + CSS + JS 全部打包），无后端、无构建步骤。
> GitHub 仓库：`https://github.com/zjp2/bifa` （main 分支）
> 服务器：腾讯云轻量应用服务器「嘿嘿」上海区，公网 IP `110.40.167.88`

---

## 目录

- [0. 三步速览（每次更新代码走这套）](#0-三步速览每次更新代码走这套)
- [1. 方式 A：服务器 git clone / pull（推荐，最省心）](#1-方式-a服务器-git-clone--pull推荐最省心)
- [2. 方式 B：直接覆盖静态文件（适合临时改一次）](#2-方式-b直接覆盖静态文件适合临时改一次)
- [3. 方式 C：腾讯云 OrcaTerm 网页终端操作（无需 SSH key）](#3-方式-c腾讯云-orcaterm-网页终端操作无需-ssh-key)
- [4. 如何确定你的部署路径](#4-如何确定你的部署路径)
- [5. 部署后验证](#5-部署后验证)
- [6. 常见问题 FAQ](#6-常见问题-faq)
- [7. 本次修复内容记录（供回溯）](#7-本次修复内容记录供回溯)

---

## 0. 三步速览（每次更新代码走这套）

假设你已经把最新代码 push 到了 GitHub `zjp2/bifa` 的 `main` 分支：

```bash
# ① 登录腾讯云控制台 → 轻量应用服务器 → 实例「嘿嘿」 → 右上角「登录」进入 OrcaTerm
# ② 在 Shell 里执行（根据你的部署路径选一种）：

# → 如果是用 git clone 的方式（推荐）：
cd /var/www/bifa              # 或你的实际项目目录
git pull origin main

# → 如果是直接放在 Nginx 根目录的：
cp /usr/share/nginx/html/index.html /usr/share/nginx/html/index.html.bak.$(date +%Y%m%d%H%M)
curl -L -o /usr/share/nginx/html/index.html https://raw.githubusercontent.com/zjp2/bifa/main/index.html

# ③ 浏览器强制刷新访问 http://110.40.167.88/ （Ctrl+Shift+R / ⌘⇧R），看到「墨笺 · Inkwell Journal」即可
```

**纯静态站点不需要重启 Nginx**，文件一覆盖就生效，剩下只是浏览器缓存问题。

---

## 1. 方式 A：服务器 git clone / pull（推荐，最省心）

适合后续会不断迭代代码的情况。第一次这样初始化：

```bash
# 进入你放网站的根目录（根据实际情况换路径）
cd /var/www
# 或者 cd /home/lighthouse
# 或者 cd /usr/share/nginx/html/..

# 从 GitHub clone（公网访问 GitHub 无需鉴权，因为仓库是 Public）
git clone https://github.com/zjp2/bifa.git

# 之后每次更新，一行命令搞定：
cd /var/www/bifa
git pull origin main
```

然后把 Nginx 的 `root` 指到 `/var/www/bifa`（看第 4 节如何检查和修改）。

### 1.1 如果服务器首次没装 git

```bash
# Ubuntu / Debian（腾讯云轻量默认一般就是这个）
apt update && apt install -y git curl

# CentOS
yum install -y git curl
```

---

## 2. 方式 B：直接覆盖静态文件（适合临时改一次）

不想管 git，直接把最新 index.html 覆盖到服务器。用 `curl` 从 GitHub 原始链接拉：

```bash
# 先备份当前版本（好习惯，出问题一键回滚）
BAK=/usr/share/nginx/html/index.html.bak.$(date +%Y%m%d%H%M)
cp /usr/share/nginx/html/index.html $BAK
echo "备份到: $BAK"

# 拉取最新版并覆盖
curl -L -o /usr/share/nginx/html/index.html \
  https://raw.githubusercontent.com/zjp2/bifa/main/index.html

# 检查文件大小（应该在 100KB 左右）
ls -lh /usr/share/nginx/html/index.html
```

回滚（如果新版本出问题）：

```bash
cp $BAK /usr/share/nginx/html/index.html
# 或者用具体文件名：cp index.html.bak.2026xxxxxxx index.html
```

---

## 3. 方式 C：腾讯云 OrcaTerm 网页终端操作（无需 SSH key）

**如果你本地连不上 SSH（22 端口外网被安全组禁了），走这个：**

1. 打开 [腾讯云轻量服务器控制台](https://console.cloud.tencent.com/lighthouse/instance/index?rid=4)（上海区）
2. 找到实例 **「嘿嘿」**（IP `110.40.167.88`，状态：运行中）
3. 点卡片右上角 **「登录」** 按钮 → 自动弹出 **OrcaTerm 网页终端**（无需输入密码，腾讯云内网免密登录，一般是 `root` 或 `lighthouse` 用户）
4. 在 Web Shell 里执行方式 A 或 B 的命令，完全一样

### 3.1 用 OrcaTerm 上传本地文件（兜底方案）

如果 GitHub 连不上，想直接上传本地 `/workspace/index.html`：

- 打开腾讯云实例详情 → 左侧 **「文件管理」** 标签 → 开启 **「云端文件管理器」**（需要先设置密码/密钥，如果没开过）
- 进入 `/usr/share/nginx/html/` 或 `/var/www/html/`，直接点 **上传** 按钮，把本地 `index.html` 拖进去覆盖即可
- 这个方式最直观，完全不需要敲命令

---

## 4. 如何确定你的部署路径

站点部署路径五花八门，第一次先跑这几条命令把它找出来：

```bash
# ① 找所有 index.html 位置（最常用）
find / -name "index.html" 2>/dev/null | grep -v "node_modules\|proc\|sys"

# ② 看 Nginx 配置里写的 root 在哪里（最准确）
nginx -T 2>/dev/null | grep -E "server_name|root |listen " | grep -v "#"
# 或者直接读默认配置
cat /etc/nginx/nginx.conf 2>/dev/null | head -80
ls /etc/nginx/sites-enabled/ 2>/dev/null && cat /etc/nginx/sites-enabled/* 2>/dev/null

# ③ 看 Nginx / Apache 进程是否在跑
ps aux | grep -E "nginx|apache|httpd" | grep -v grep

# ④ 如果有域名绑定（也能直接通过 server_name 反查）
ls /etc/nginx/conf.d/*.conf 2>/dev/null -la
```

### 常见部署路径对照表

| 场景 | 路径 |
|---|---|
| Nginx 默认 Ubuntu | `/usr/share/nginx/html/` |
| Nginx 自定义站点 | `/var/www/html/` 或 `/var/www/bifa/` |
| Apache 默认 | `/var/www/html/` |
| 个人用户目录 | `/home/lighthouse/bifa/` |
| 自建数据盘 | `/data/www/bifa/` 或 `/mnt/data/...` |
| 宝塔面板 | `/www/wwwroot/你的域名/` |

找到之后，后面每次部署把命令里的路径替换掉就行，**写在下面这一行，下次不用再找：**

> 🔒 **我的部署路径：** `____________`（首次部署成功后在此处填上，如 `/usr/share/nginx/html/`）

---

## 5. 部署后验证

### 5.1 服务器本地验证

```bash
# 看返回的内容头是不是墨笺
curl -s http://127.0.0.1/ | head -10
# 应该看到类似：<!DOCTYPE html><html lang="zh-CN"><head><title>墨笺 · Inkwell Journal</title>

# 检查文件头
head -2 /your/path/index.html
```

### 5.2 外网访问验证

浏览器打开：**`http://110.40.167.88/`**（如果绑定了域名就用域名）

**强制刷新**：Ctrl+Shift+R（Windows）/ ⌘⇧R（Mac），忽略缓存看新版本。

快速功能检查清单：

- [ ] 顶部标题显示「墨笺 · Inkwell Journal」
- [ ] 登录页「访客模式」按钮可点击进入书架
- [ ] 桌面端：笔记内容区域比例协调（不再"四不像"）
- [ ] 移动端：窗口变窄时出现底部快捷栏和顶部汉堡菜单
- [ ] 语音：点击话筒开始录音，再点一次停止，不会弹出"语音出错"
- [ ] 撕页（删除一篇日记）：不再出现 Minified React error #185 红底错误条

### 5.3 CDN 缓存刷新

如果前面还套了腾讯云 CDN / EdgeOne，部署后记得**手动刷新缓存**：

- CDN 控制台 → 缓存刷新 → 提交刷新：`https://你的域名/index.html`（单个 URL 刷新）
- 否则用户浏览器可能看到的是 CDN 边缘节点缓存的旧版

---

## 6. 常见问题 FAQ

**Q1：更新完浏览器看到的还是旧版本？**
> 1. 先强制刷新（Ctrl+Shift+R）清本地缓存
> 2. 如果前面有 CDN / EdgeOne，去控制台刷新该 URL 缓存
> 3. 服务器本地 `curl http://127.0.0.1/ | head` 看是不是已经是新版本，排除"没部署成功"的可能

**Q2：GitHub raw 连不上（curl 报错 timeout/403）？**
> 1. 换成 jsDelivr CDN 镜像：`curl -L -o index.html https://cdn.jsdelivr.net/gh/zjp2/bifa@main/index.html`
> 2. 或者用腾讯云文件管理直接上传本地 `index.html` 文件

**Q3：端口 80 访问不到？**
> 1. 腾讯云轻量控制台 → 实例详情 → 「防火墙」标签 → 确保 **TCP 80 端口** 已开（默认一般是开的）
> 2. 服务器本地检查 Nginx 是否在跑：`systemctl status nginx`，没跑就 `systemctl start nginx`，开机自启：`systemctl enable nginx`

**Q4：想绑定自己的域名？**
> 1. 域名 DNS 解析：`A 记录 @ / www → 110.40.167.88`
> 2. 腾讯云轻量实例详情 → 「域名与 DNS」或直接在 Nginx 里配置 `server_name yourdomain.com;`
> 3. HTTPS：免费证书用 Let's Encrypt，`apt install certbot python3-certbot-nginx && certbot --nginx` 全自动

**Q5：外网 SSH 22 端口连不上？**
> 这是正常的安全组策略。两个解法：
> - 解法 1（推荐）：腾讯云控制台实例点「登录」用 **OrcaTerm**，内网免密走 WebSocket，不用开 22
> - 解法 2：轻量控制台 → 防火墙 → 新建规则开放 TCP 22 端口（来源限制自己的公网 IP 更安全）

---

## 7. 本次修复内容记录（供回溯）

本次部署更新的 commit：

```
Fix responsive layout + voice stop + tear page React error
```

涉及 3 个修复：

| # | 问题 | 修复方式 |
|---|---|---|
| 1 | PC 端笔记内容区域太窄、整体像"四不像"；移动端也不兼容 | 调整 CSS `@media` 断点，桌面端放宽编辑区比例，移动端引入顶部导航 + 可折叠底部快捷条 |
| 2 | 开启语音后无法停止，后续弹出"语音出错" | 新增 `voiceIsStopping` 状态锁，停止时 `rec.abort() + rec.stop()` 双调用并带 500ms 防抖重置 |
| 3 | 撕页（删除日记）后出现 Minified React error #185（最大更新深度超限） | 所有关键状态变更（renderEditor/删除/存稿）加 `isRendering` 标志，避免渲染期间触发再次 setState 形成死循环 |

如果部署后有问题，可以直接回滚到上一次 `index.html.bak.*` 备份文件（见方式 B 的回滚命令）。
