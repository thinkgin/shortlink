# 快速手动部署指南

## 🔧 立即修复 "Hello World" 问题

### 方法 1：通过 Cloudflare 控制台直接更新

1. **访问 Cloudflare Workers 控制台**

   - 打开 https://dash.cloudflare.com
   - 进入 "Workers & Pages"
   - 找到你的 `shortlink` Worker

2. **直接编辑代码**
   - 点击 "Edit code"
   - 删除现有的 "Hello World" 代码
   - 复制粘贴 `src/worker.js` 中的完整代码
   - 点击 "Save and deploy"

### 方法 2：使用 API Token 直接部署

1. **获取 Cloudflare API Token**

   - 访问 https://dash.cloudflare.com/profile/api-tokens
   - 创建 Workers:Edit 权限的 Token

2. **设置环境变量并部署**
   ```bash
   export CLOUDFLARE_API_TOKEN=你的API_TOKEN
   npx wrangler deploy
   ```

### 方法 3：删除并重新创建 Worker

1. **删除现有 Worker**

   - 在 Cloudflare 控制台删除 `shortlink` Worker

2. **重新部署**
   ```bash
   npx wrangler deploy
   ```

## ✅ 验证部署成功

部署成功后，访问 https://shortlink.cwwx1818.workers.dev/ 应该看到：

- 漂亮的短链接生成器界面
- Cloudflare 橙色渐变主题
- "短链接生成器" 标题
- URL 输入框和生成按钮
- 最近生成的短链接列表

如果还是显示 "Hello World"，请清除浏览器缓存后重试。
