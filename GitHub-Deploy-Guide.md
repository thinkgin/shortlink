# GitHub 自动部署到 Cloudflare Workers 指南

## 🚀 通过 GitHub Actions 自动部署

### 第一步：获取 Cloudflare API Token 和 Account ID

#### 1. 获取 API Token
1. 访问 [Cloudflare API Tokens 页面](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 "Create Token"
3. 选择 "Workers:Edit" 模板
4. 配置权限：
   - Account: `Include - Your Account`
   - Zone Resources: `Include - All zones`
   - Account Resources: `Include - All accounts`
5. 点击 "Continue to summary"
6. 点击 "Create Token"
7. **复制生成的 Token**（只会显示一次）

#### 2. 获取 Account ID
1. 在 Cloudflare 控制台右侧边栏可以看到 "Account ID"
2. 或者访问 [Cloudflare 控制台](https://dash.cloudflare.com/)
3. 在右侧边栏找到并复制 "Account ID"

### 第二步：在 GitHub 中设置 Secrets

1. 打开你的 GitHub 仓库
2. 点击 "Settings" 标签页
3. 在左侧菜单中选择 "Secrets and variables" → "Actions"
4. 点击 "New repository secret"
5. 添加以下两个 secrets：

   **Secret 1:**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: 你在第一步获取的 API Token

   **Secret 2:**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: 你的 Cloudflare Account ID

### 第三步：推送代码到 GitHub

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: Cloudflare Workers 短链接生成器"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 推送到 GitHub
git push -u origin main
```

### 第四步：自动部署

一旦你推送代码到 `main` 分支，GitHub Actions 会自动：

1. 检出代码
2. 安装 Node.js 和依赖
3. 部署到 Cloudflare Workers

你可以在 GitHub 仓库的 "Actions" 标签页查看部署进度和日志。

## 📋 部署流程说明

### 触发条件
- 推送代码到 `main` 或 `master` 分支
- 创建 Pull Request 到 `main` 或 `master` 分支

### 部署步骤
1. **Checkout**: 获取最新代码
2. **Setup Node.js**: 安装 Node.js 18
3. **Install dependencies**: 安装项目依赖
4. **Deploy**: 使用 Wrangler 部署到 Cloudflare Workers

### 部署后访问
部署成功后，你的短链接服务将在以下地址可用：
```
https://shortlink-cloudflare.你的子域名.workers.dev
```

## 🔧 自定义配置

### 修改 Worker 名称
在 `wrangler.toml` 文件中修改：
```toml
name = "你的自定义名称"
```

### 添加自定义域名
在 `wrangler.toml` 文件中添加：
```toml
[env.production]
routes = [
  { pattern = "short.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

### 环境变量配置
在 `wrangler.toml` 文件中修改：
```toml
[vars]
BASE_URL = "https://your-custom-domain.com"
```

## 🐛 故障排除

### 常见问题

1. **部署失败：API Token 无效**
   - 检查 GitHub Secrets 中的 `CLOUDFLARE_API_TOKEN` 是否正确
   - 确保 API Token 有足够的权限

2. **部署失败：Account ID 无效**
   - 检查 GitHub Secrets 中的 `CLOUDFLARE_ACCOUNT_ID` 是否正确

3. **KV 命名空间错误**
   - 确保在 Cloudflare 控制台中创建了 KV 命名空间
   - 检查 `wrangler.toml` 中的 KV 命名空间 ID 是否正确

4. **部署成功但显示 Hello World**
   - 检查 `wrangler.toml` 中的 `main` 字段是否指向正确的文件
   - 确保 `src/worker.js` 文件存在且内容正确

### 查看部署日志
1. 在 GitHub 仓库中点击 "Actions" 标签页
2. 选择最新的部署任务
3. 点击 "Deploy" 作业查看详细日志

### 手动触发部署
如果需要手动触发部署：
1. 在 GitHub 仓库的 "Actions" 标签页
2. 选择 "Deploy to Cloudflare Workers" 工作流
3. 点击 "Run workflow"

## 🎯 最佳实践

### 分支策略
- 使用 `main` 分支作为生产环境
- 使用 `develop` 分支进行开发
- 通过 Pull Request 合并代码

### 版本管理
- 为每个发布创建 Git 标签
- 在 commit 信息中描述清楚改动

### 安全考虑
- 定期轮换 API Token
- 不要在代码中硬编码敏感信息
- 使用 GitHub Secrets 管理所有密钥

## 📈 监控和维护

### Cloudflare 控制台
- 访问 [Cloudflare Workers 控制台](https://dash.cloudflare.com)
- 查看请求统计、错误日志和性能指标

### GitHub Actions 监控
- 设置 GitHub 通知以接收部署状态
- 定期检查部署日志确保没有警告或错误

这样设置后，每次你推送代码到 GitHub，都会自动部署到 Cloudflare Workers，非常方便！