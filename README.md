# 短链接生成器

一个基于 Node.js 和 Express 的短链接生成器，支持链接缩短、点击统计和管理功能。

## 功能特性

- 🔗 **URL 缩短**: 将长网址转换为简短易分享的链接
- 📊 **点击统计**: 实时跟踪每个短链接的点击次数
- 🎨 **现代界面**: 响应式设计，支持移动端访问
- 🗄️ **数据持久化**: 使用 MongoDB 存储链接数据
- 📋 **一键复制**: 快速复制生成的短链接
- 🗑️ **链接管理**: 支持删除不需要的短链接
- ⚡ **快速重定向**: 高效的链接重定向服务

## 技术栈

- **后端**: Node.js, Express.js
- **数据库**: MongoDB
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **UI 框架**: Bootstrap 5
- **图标**: Font Awesome

## 安装和运行

### 前置要求

- Node.js (v14 或更高版本)
- MongoDB (本地安装或云服务)

### 安装步骤

1. 克隆项目到本地：

```bash
git clone <repository-url>
cd shortlink
```

2. 安装依赖：

```bash
npm install
```

3. 配置环境变量（可选）：
   创建 `.env` 文件或修改 `config.js` 文件：

```javascript
PORT=3000
MONGODB_URI=mongodb://localhost:27017/shortlink
BASE_URL=http://localhost:3000
```

4. 启动 MongoDB 服务：

```bash
# 如果使用本地 MongoDB
mongod
```

5. 启动应用：

```bash
# 生产环境
npm start

# 开发环境（需要安装 nodemon）
npm run dev
```

6. 访问应用：
   打开浏览器访问 `http://localhost:3000`

## API 接口

### 创建短链接

```http
POST /api/url/shorten
Content-Type: application/json

{
  "originalUrl": "https://example.com/very/long/url"
}
```

### 获取所有链接

```http
GET /api/url
```

### 获取特定链接信息

```http
GET /api/url/:code
```

### 删除链接

```http
DELETE /api/url/:code
```

### 访问短链接（重定向）

```http
GET /:code
```

## 项目结构

```
shortlink/
├── models/
│   └── Url.js              # MongoDB 数据模型
├── routes/
│   └── url.js              # API 路由
├── public/
│   ├── index.html          # 前端页面
│   └── script.js           # 前端 JavaScript
├── config.js               # 配置文件
├── server.js               # 服务器入口文件
├── package.json            # 项目依赖
└── README.md              # 项目说明
```

## 数据模型

每个短链接包含以下字段：

- `originalUrl`: 原始长网址
- `shortUrl`: 生成的短链接
- `urlCode`: 短链接代码
- `clicks`: 点击次数
- `createdAt`: 创建时间
- `lastAccessed`: 最后访问时间

## 部署说明

### 本地部署

按照上述安装步骤即可在本地运行。

### 云服务部署

1. 选择云服务提供商（如 Heroku、Vercel、Railway 等）
2. 配置环境变量
3. 连接云数据库（如 MongoDB Atlas）
4. 部署应用

### Docker 部署

可以创建 Dockerfile 进行容器化部署：

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 作者

Your Name - [your.email@example.com](mailto:your.email@example.com)

## 致谢

- [Express.js](https://expressjs.com/) - Web 框架
- [MongoDB](https://www.mongodb.com/) - 数据库
- [Bootstrap](https://getbootstrap.com/) - UI 框架
- [Font Awesome](https://fontawesome.com/) - 图标库
