# Cloudflare Workers 短链接生成器部署指南

## 快速部署步骤

### 1. 准备工作

确保你有：

- Cloudflare 账户（免费即可）
- Node.js v16+
- Git

### 2. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 3. 登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器让你登录 Cloudflare 账户。

### 4. 克隆并初始化项目

```bash
git clone <your-repo-url>
cd shortlink
npm install
```

### 5. 创建 KV 存储命名空间

```bash
# 创建生产环境 KV 命名空间
wrangler kv:namespace create "URL_STORAGE"

# 创建预览环境 KV 命名空间
wrangler kv:namespace create "URL_STORAGE" --preview
```

命令执行后会显示类似以下内容：

```
🌀 Creating namespace with title "shortlink-cloudflare-URL_STORAGE"
✅ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "URL_STORAGE", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
```

### 6. 更新配置文件

将上一步得到的 ID 更新到 `wrangler.toml` 文件中：

```toml
name = "shortlink-cloudflare"
main = "src/index.js"
compatibility_date = "2023-10-01"

[vars]
BASE_URL = "https://shortlink-cloudflare.your-subdomain.workers.dev"

[[kv_namespaces]]
binding = "URL_STORAGE"
id = "你的生产环境KV命名空间ID"
preview_id = "你的预览环境KV命名空间ID"
```

### 7. 本地测试

```bash
npm run dev
```

访问 `http://localhost:8787` 测试功能是否正常。

### 8. 部署到 Cloudflare

```bash
npm run deploy
```

部署成功后，你会看到类似以下输出：

```
✅ Successfully published your Worker to
   https://shortlink-cloudflare.your-subdomain.workers.dev
```

## 自定义域名配置

### 方法一：通过 Cloudflare 控制台

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com)
2. 选择你的域名
3. 进入 "Workers Routes" 或 "Workers"
4. 添加自定义路由，例如：`short.yourdomain.com/*`
5. 关联到你的 Worker

### 方法二：通过 wrangler.toml 配置

```toml
[env.production]
routes = [
  { pattern = "short.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

然后重新部署：

```bash
npm run deploy
```

## 环境配置

### 生产环境变量

在 `wrangler.toml` 中配置：

```toml
[vars]
BASE_URL = "https://short.yourdomain.com"
```

### 多环境部署

可以配置不同的环境：

```toml
[env.staging]
vars = { BASE_URL = "https://staging-short.yourdomain.com" }

[env.production]
vars = { BASE_URL = "https://short.yourdomain.com" }
routes = [
  { pattern = "short.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

部署到特定环境：

```bash
wrangler deploy --env staging
wrangler deploy --env production
```

## 监控和维护

### 查看实时日志

```bash
npm run tail
```

### 查看 KV 存储内容

```bash
# 列出所有键
wrangler kv:key list --binding=URL_STORAGE

# 查看特定键的值
wrangler kv:key get --binding=URL_STORAGE "code:abc123"

# 删除特定键
wrangler kv:key delete --binding=URL_STORAGE "code:abc123"
```

### 性能监控

在 Cloudflare 控制台中可以查看：

- 请求数量和频率
- 响应时间
- 错误率
- CPU 使用时间

## 成本估算

### Cloudflare Workers 免费套餐

- 每天 100,000 次请求
- 每次请求最多 10ms CPU 时间
- 完全免费

### 付费套餐（$5/月）

- 每月 10,000,000 次请求
- 每次请求最多 50ms CPU 时间
- 超出部分 $0.50/百万次请求

### KV 存储费用

- 前 1GB 存储免费
- 每月前 100,000 次读取操作免费
- 每月前 1,000 次写入操作免费

对于大多数个人和小型项目，完全可以在免费套餐内运行。

## 故障排除

### 常见错误及解决方案

1. **"binding is not defined" 错误**

   - 检查 KV 命名空间是否正确配置
   - 确保 `wrangler.toml` 中的 binding 名称正确

2. **CORS 错误**

   - 检查代码中的 CORS 头设置
   - 确保所有 API 响应都包含正确的 CORS 头

3. **部署失败**

   - 检查 `wrangler.toml` 配置语法
   - 确保已正确登录 Cloudflare 账户
   - 检查账户权限

4. **KV 写入失败**
   - 检查 KV 命名空间权限
   - 确保没有超出 KV 存储限制

### 调试技巧

1. **本地调试模式**：

```bash
wrangler dev --local
```

2. **查看详细错误信息**：

```bash
wrangler tail --format=pretty
```

3. **测试 KV 连接**：
   在 Worker 中添加测试代码：

```javascript
// 测试 KV 存储
await env.URL_STORAGE.put("test", "hello world");
const value = await env.URL_STORAGE.get("test");
console.log("KV test:", value);
```

## 备份和迁移

### 备份 KV 数据

```bash
# 导出所有键值对
wrangler kv:key list --binding=URL_STORAGE > kv-backup.json

# 批量导出数据（需要编写脚本）
```

### 迁移到新的 Worker

1. 创建新的 KV 命名空间
2. 导出旧数据
3. 导入到新命名空间
4. 更新 Worker 配置

## 安全建议

1. **API 限流**：考虑添加请求频率限制
2. **输入验证**：严格验证输入的 URL 格式
3. **恶意链接检测**：集成 URL 安全检查服务
4. **访问日志**：记录重要操作的日志

## 扩展功能实现

### 添加访问统计

可以扩展 KV 存储结构来记录更详细的统计信息：

```javascript
// 记录访问详情
const accessLog = {
  timestamp: new Date().toISOString(),
  userAgent: request.headers.get("User-Agent"),
  ip: request.headers.get("CF-Connecting-IP"),
  country: request.cf?.country,
};

// 存储到 KV
await env.URL_STORAGE.put(
  `access:${code}:${Date.now()}`,
  JSON.stringify(accessLog)
);
```

### 添加缓存策略

```javascript
// 设置缓存头
return new Response(HTML_CONTENT, {
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=3600", // 缓存1小时
    ...corsHeaders,
  },
});
```

这个部署指南应该能帮助你顺利将短链接生成器部署到 Cloudflare Workers 平台上。
