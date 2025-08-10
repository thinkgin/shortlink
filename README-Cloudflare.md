# Cloudflare 短链接生成器

一个基于 Cloudflare Workers 的短链接生成器，利用边缘计算提供全球快速访问，使用 KV 存储保存链接映射关系。

## 功能特性

- 🔗 **URL 缩短**: 将长网址转换为简短易分享的链接
- 📊 **点击统计**: 实时跟踪每个短链接的点击次数
- 🎨 **现代界面**: 响应式设计，支持移动端访问
- 🌍 **全球部署**: 基于 Cloudflare 边缘网络，全球访问速度快
- 💾 **KV 存储**: 使用 Cloudflare KV 存储链接数据，无需数据库
- 📋 **一键复制**: 快速复制生成的短链接
- 🗑️ **链接管理**: 支持删除不需要的短链接
- ⚡ **快速重定向**: 基于边缘计算的高效链接重定向
- 🚀 **无服务器**: 完全无服务器架构，自动扩展

## 技术栈

- **运行时**: Cloudflare Workers (V8 JavaScript)
- **存储**: Cloudflare KV
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **UI 框架**: Bootstrap 5
- **图标**: Font Awesome
- **部署**: Wrangler CLI

## 安装和部署

### 前置要求

- Node.js (v16 或更高版本)
- Cloudflare 账户
- Wrangler CLI

### 部署步骤

1. **安装 Wrangler CLI**:

```bash
npm install -g wrangler
```

2. **登录 Cloudflare**:

```bash
wrangler login
```

3. **克隆项目**:

```bash
git clone <repository-url>
cd shortlink
```

4. **安装依赖**:

```bash
npm install
```

5. **创建 KV 命名空间**:

```bash
# 创建生产环境 KV 命名空间
wrangler kv:namespace create "URL_STORAGE"

# 创建预览环境 KV 命名空间（用于开发测试）
wrangler kv:namespace create "URL_STORAGE" --preview
```

6. **更新 wrangler.toml 配置**:
   将步骤 5 中生成的 KV 命名空间 ID 更新到 `wrangler.toml` 文件中：

```toml
[[kv_namespaces]]
binding = "URL_STORAGE"
id = "your-kv-namespace-id"        # 替换为实际的 KV 命名空间 ID
preview_id = "your-preview-kv-id"  # 替换为预览环境的 KV 命名空间 ID
```

7. **本地开发测试**:

```bash
npm run dev
```

访问 `http://localhost:8787` 进行本地测试

8. **部署到 Cloudflare**:

```bash
npm run deploy
```

9. **配置自定义域名**（可选）:
   在 Cloudflare 控制台中配置自定义域名，或在 `wrangler.toml` 中添加路由配置。

## 项目结构

```
shortlink/
├── src/
│   └── index.js           # 主要的 Worker 脚本
├── wrangler.toml          # Cloudflare Workers 配置
├── package.json           # 项目依赖
├── README-Cloudflare.md   # Cloudflare 版本说明
└── .gitignore            # Git 忽略文件
```

## API 接口

### 创建短链接

```http
POST /api/shorten
Content-Type: application/json

{
  "originalUrl": "https://example.com/very/long/url"
}
```

**响应**:

```json
{
  "originalUrl": "https://example.com/very/long/url",
  "shortUrl": "https://your-domain.com/abc123",
  "code": "abc123",
  "clicks": 0,
  "createdAt": "2023-10-01T12:00:00.000Z"
}
```

### 获取链接列表

```http
GET /api/list
```

**响应**:

```json
{
  "urls": [
    {
      "originalUrl": "https://example.com",
      "shortUrl": "https://your-domain.com/abc123",
      "code": "abc123",
      "clicks": 5,
      "createdAt": "2023-10-01T12:00:00.000Z",
      "lastAccessed": "2023-10-01T15:30:00.000Z"
    }
  ]
}
```

### 删除短链接

```http
DELETE /api/delete/:code
```

### 访问短链接（重定向）

```http
GET /:code
```

自动重定向到原始 URL 并增加点击计数

## 数据存储结构

### KV 存储键值对

1. **代码到 URL 映射**: `code:{shortCode}`

```json
{
  "originalUrl": "https://example.com",
  "code": "abc123",
  "clicks": 5,
  "createdAt": "2023-10-01T12:00:00.000Z",
  "lastAccessed": "2023-10-01T15:30:00.000Z"
}
```

2. **URL 到代码映射**: `url:{originalUrl}`

```
abc123
```

3. **URL 列表**: `url_list`

```json
["abc123", "def456", "ghi789"]
```

## 优势特点

### 🌍 全球边缘部署

- 基于 Cloudflare 的全球边缘网络
- 用户访问就近的边缘节点，响应速度快
- 自动 DDoS 防护和 SSL 加密

### 💰 成本效益

- 每月 100,000 次免费请求
- 按使用量计费，无固定服务器成本
- KV 存储前 1GB 免费

### 🔧 维护简单

- 无需管理服务器或数据库
- 自动扩展，无需容量规划
- 内置监控和日志

### ⚡ 性能优异

- 冷启动时间极短（< 5ms）
- 边缘计算，延迟最小化
- 支持高并发访问

## 配置选项

### 环境变量

在 `wrangler.toml` 的 `[vars]` 部分配置：

```toml
[vars]
BASE_URL = "https://your-custom-domain.com"  # 自定义域名
```

### 自定义域名

```toml
[env.production]
routes = [
  { pattern = "short.example.com/*", zone_name = "example.com" }
]
```

## 监控和日志

### 查看实时日志

```bash
npm run tail
```

### Cloudflare 控制台

- 访问 [Cloudflare Workers 控制台](https://dash.cloudflare.com)
- 查看请求统计、错误日志和性能指标

## 故障排除

### 常见问题

1. **KV 命名空间未配置**

   - 确保已创建 KV 命名空间并正确配置 ID

2. **CORS 错误**

   - 检查 CORS 头配置是否正确

3. **部署失败**
   - 检查 `wrangler.toml` 配置
   - 确保已登录 Cloudflare 账户

### 调试技巧

1. **本地调试**:

```bash
wrangler dev --local
```

2. **查看 KV 存储内容**:

```bash
wrangler kv:key list --binding=URL_STORAGE
wrangler kv:key get --binding=URL_STORAGE "code:abc123"
```

## 扩展功能

可以考虑添加的功能：

- 🔐 **访问密码**: 为敏感链接添加密码保护
- 📅 **过期时间**: 设置链接自动过期
- 📈 **详细统计**: 访问来源、时间分布等
- 🎨 **自定义短码**: 允许用户自定义短链接
- 📧 **批量生成**: 支持批量创建短链接
- 🔍 **搜索功能**: 在链接列表中搜索

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/) - 边缘计算平台
- [Cloudflare KV](https://developers.cloudflare.com/workers/runtime-apis/kv/) - 键值存储
- [Bootstrap](https://getbootstrap.com/) - UI 框架
- [Font Awesome](https://fontawesome.com/) - 图标库
