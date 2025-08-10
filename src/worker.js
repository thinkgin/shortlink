// Cloudflare Workers 短链接生成器
// 使用 KV 存储来保存链接映射关系

// 工具函数：生成短代码
function generateShortCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 验证URL格式
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// 获取HTML页面
function getHTMLPage() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudflare 短链接生成器</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
            min-height: 100vh;
        }
        .main-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        .url-item {
            background: #f8f9fa;
            border-left: 4px solid #ff6b6b;
            transition: all 0.3s ease;
        }
        .url-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .btn-primary {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            border: none;
        }
        .btn-primary:hover {
            background: linear-gradient(45deg, #ff5252, #26c6da);
        }
        .stats-card {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
        }
        .copy-btn {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .copy-btn:hover {
            color: #ff6b6b !important;
        }
        .cloudflare-badge {
            background: linear-gradient(45deg, #f38020, #f5af19);
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-10">
                <div class="main-container p-5">
                    <div class="text-center mb-5">
                        <h1 class="display-4 mb-3">
                            <i class="fas fa-link text-primary me-3"></i>
                            短链接生成器
                            <span class="cloudflare-badge ms-2">
                                <i class="fas fa-cloud me-1"></i>Cloudflare
                            </span>
                        </h1>
                        <p class="lead text-muted">基于 Cloudflare Workers 的全球边缘计算短链接服务</p>
                    </div>

                    <!-- URL Shortener Form -->
                    <div class="card border-0 shadow-sm mb-5">
                        <div class="card-body p-4">
                            <form id="urlForm">
                                <div class="row g-3">
                                    <div class="col-md-9">
                                        <div class="input-group input-group-lg">
                                            <span class="input-group-text bg-light border-0">
                                                <i class="fas fa-globe text-primary"></i>
                                            </span>
                                            <input type="url" class="form-control border-0" id="originalUrl" 
                                                   placeholder="请输入要缩短的网址..." required>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <button type="submit" class="btn btn-primary btn-lg w-100">
                                            <i class="fas fa-magic me-2"></i>生成短链接
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Result Display -->
                    <div id="result" class="card border-0 shadow-sm mb-5" style="display: none;">
                        <div class="card-body p-4">
                            <h5 class="card-title text-success mb-3">
                                <i class="fas fa-check-circle me-2"></i>短链接生成成功！
                            </h5>
                            <div class="row">
                                <div class="col-md-6">
                                    <label class="form-label text-muted">原始网址：</label>
                                    <div class="input-group mb-3">
                                        <input type="text" class="form-control" id="originalUrlResult" readonly>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-muted">短链接：</label>
                                    <div class="input-group mb-3">
                                        <input type="text" class="form-control" id="shortUrlResult" readonly>
                                        <button class="btn btn-outline-primary copy-btn" type="button" onclick="copyToClipboard('shortUrlResult')">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- URL List -->
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-light border-0 py-3">
                            <div class="row align-items-center">
                                <div class="col">
                                    <h5 class="mb-0">
                                        <i class="fas fa-list me-2 text-primary"></i>最近生成的短链接
                                    </h5>
                                </div>
                                <div class="col-auto">
                                    <button class="btn btn-outline-primary btn-sm" onclick="loadUrls()">
                                        <i class="fas fa-refresh me-1"></i>刷新
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="card-body p-0">
                            <div id="urlList" class="p-3">
                                <div class="text-center py-5">
                                    <i class="fas fa-spinner fa-spin fa-2x text-muted mb-3"></i>
                                    <p class="text-muted">加载中...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/static/app.js"></script>
</body>
</html>`;
}

// 获取JavaScript代码
function getJavaScriptCode() {
  return `
        // DOM Elements
        const urlForm = document.getElementById('urlForm');
        const originalUrlInput = document.getElementById('originalUrl');
        const resultDiv = document.getElementById('result');
        const originalUrlResult = document.getElementById('originalUrlResult');
        const shortUrlResult = document.getElementById('shortUrlResult');
        const urlListDiv = document.getElementById('urlList');

        // Event Listeners
        urlForm.addEventListener('submit', handleSubmit);

        // Handle form submission
        async function handleSubmit(e) {
            e.preventDefault();
            
            const originalUrl = originalUrlInput.value.trim();
            
            if (!originalUrl) {
                showAlert('请输入有效的网址', 'danger');
                return;
            }

            try {
                const button = urlForm.querySelector('button');
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>生成中...';
                button.disabled = true;

                const response = await fetch('/api/shorten', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ originalUrl })
                });

                const data = await response.json();

                if (response.ok) {
                    // Show result
                    originalUrlResult.value = data.originalUrl;
                    shortUrlResult.value = data.shortUrl;
                    resultDiv.style.display = 'block';
                    
                    // Scroll to result
                    resultDiv.scrollIntoView({ behavior: 'smooth' });
                    
                    // Clear form
                    originalUrlInput.value = '';
                    
                    // Reload URL list
                    loadUrls();
                    
                    showAlert('短链接生成成功！', 'success');
                } else {
                    showAlert(data.error || '生成失败，请重试', 'danger');
                }

                // Reset button
                button.innerHTML = originalText;
                button.disabled = false;

            } catch (error) {
                console.error('Error:', error);
                showAlert('网络错误，请检查连接', 'danger');
                
                // Reset button
                const button = urlForm.querySelector('button');
                button.innerHTML = '<i class="fas fa-magic me-2"></i>生成短链接';
                button.disabled = false;
            }
        }

        // Load URLs list
        async function loadUrls() {
            try {
                const response = await fetch('/api/list');
                const data = await response.json();

                if (response.ok) {
                    displayUrls(data.urls || []);
                } else {
                    urlListDiv.innerHTML = \`
                        <div class="text-center py-5">
                            <i class="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i>
                            <p class="text-muted">加载失败，请重试</p>
                        </div>
                    \`;
                }
            } catch (error) {
                console.error('Error loading URLs:', error);
                urlListDiv.innerHTML = \`
                    <div class="text-center py-5">
                        <i class="fas fa-wifi fa-2x text-danger mb-3"></i>
                        <p class="text-muted">网络连接错误</p>
                    </div>
                \`;
            }
        }

        // Display URLs
        function displayUrls(urls) {
            if (urls.length === 0) {
                urlListDiv.innerHTML = \`
                    <div class="text-center py-5">
                        <i class="fas fa-inbox fa-2x text-muted mb-3"></i>
                        <p class="text-muted">暂无短链接记录</p>
                    </div>
                \`;
                return;
            }

            const urlsHtml = urls.map(url => {
                const createdDate = new Date(url.createdAt).toLocaleString('zh-CN');
                const lastAccessed = url.lastAccessed ? 
                    new Date(url.lastAccessed).toLocaleString('zh-CN') : '从未访问';

                return \`
                    <div class="url-item p-3 mb-3 rounded">
                        <div class="row align-items-center">
                            <div class="col-md-4">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-link text-primary me-2"></i>
                                    <div>
                                        <small class="text-muted d-block">短链接</small>
                                        <a href="\${url.shortUrl}" target="_blank" class="text-decoration-none fw-bold">
                                            \${url.shortUrl}
                                        </a>
                                        <button class="btn btn-sm btn-outline-primary ms-2 copy-btn" 
                                                onclick="copyToClipboard('\${url.shortUrl}', this)">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <small class="text-muted d-block">原始网址</small>
                                <a href="\${url.originalUrl}" target="_blank" class="text-decoration-none" 
                                   title="\${url.originalUrl}">
                                    \${url.originalUrl.length > 50 ? 
                                      url.originalUrl.substring(0, 50) + '...' : 
                                      url.originalUrl}
                                </a>
                            </div>
                            <div class="col-md-2">
                                <div class="text-center">
                                    <div class="stats-card rounded p-2">
                                        <div class="fw-bold">\${url.clicks || 0}</div>
                                        <small>点击次数</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-2">
                                <div class="text-end">
                                    <small class="text-muted d-block">创建时间</small>
                                    <small>\${createdDate}</small>
                                    <br>
                                    <small class="text-muted">最后访问: \${lastAccessed}</small>
                                    <br>
                                    <button class="btn btn-sm btn-outline-danger mt-1" 
                                            onclick="deleteUrl('\${url.code}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                \`;
            }).join('');

            urlListDiv.innerHTML = urlsHtml;
        }

        // Copy to clipboard
        async function copyToClipboard(text, button = null) {
            try {
                // If text is an element ID, get the value
                if (typeof text === 'string' && document.getElementById(text)) {
                    text = document.getElementById(text).value;
                }

                await navigator.clipboard.writeText(text);
                
                // Visual feedback
                if (button) {
                    const originalHTML = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-check text-success"></i>';
                    setTimeout(() => {
                        button.innerHTML = originalHTML;
                    }, 2000);
                }
                
                showAlert('链接已复制到剪贴板', 'success');
            } catch (err) {
                console.error('Failed to copy: ', err);
                showAlert('复制失败，请手动复制', 'warning');
            }
        }

        // Delete URL
        async function deleteUrl(code) {
            if (!confirm('确定要删除这个短链接吗？')) {
                return;
            }

            try {
                const response = await fetch('/api/delete/' + code, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    showAlert('短链接已删除', 'success');
                    loadUrls();
                } else {
                    showAlert('删除失败，请重试', 'danger');
                }
            } catch (error) {
                console.error('Error deleting URL:', error);
                showAlert('网络错误，请重试', 'danger');
            }
        }

        // Show alert
        function showAlert(message, type) {
            // Remove existing alerts
            const existingAlerts = document.querySelectorAll('.alert');
            existingAlerts.forEach(alert => alert.remove());

            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-' + type + ' alert-dismissible fade show position-fixed';
            alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 350px;';
            alertDiv.innerHTML = 
                message + 
                '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';

            document.body.appendChild(alertDiv);

            // Auto remove after 3 seconds
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 3000);
        }

        // Load URLs on page load
        document.addEventListener('DOMContentLoaded', loadUrls);
  `;
}

// 主要的请求处理函数
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 处理CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 主页
      if (path === '/') {
        return new Response(getHTMLPage(), {
          headers: { 
            'Content-Type': 'text/html; charset=utf-8',
            ...corsHeaders 
          }
        });
      }

      // 静态JavaScript文件
      if (path === '/static/app.js') {
        return new Response(getJavaScriptCode(), {
          headers: { 
            'Content-Type': 'application/javascript; charset=utf-8',
            ...corsHeaders 
          }
        });
      }

      // API: 创建短链接
      if (path === '/api/shorten' && method === 'POST') {
        const { originalUrl } = await request.json();

        if (!originalUrl || !isValidUrl(originalUrl)) {
          return new Response(
            JSON.stringify({ error: '请提供有效的URL' }),
            { 
              status: 400, 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              }
            }
          );
        }

        // 检查是否已存在
        const existingCode = await env.URL_STORAGE.get(`url:${originalUrl}`);
        if (existingCode) {
          const existingData = await env.URL_STORAGE.get(`code:${existingCode}`);
          if (existingData) {
            const data = JSON.parse(existingData);
            return new Response(
              JSON.stringify({
                originalUrl: data.originalUrl,
                shortUrl: `${url.origin}/${existingCode}`,
                code: existingCode,
                clicks: data.clicks || 0,
                createdAt: data.createdAt
              }),
              { 
                headers: { 
                  'Content-Type': 'application/json',
                  ...corsHeaders 
                }
              }
            );
          }
        }

        // 生成新的短代码
        let code;
        let attempts = 0;
        do {
          code = generateShortCode();
          attempts++;
          if (attempts > 10) {
            return new Response(
              JSON.stringify({ error: '生成短代码失败，请重试' }),
              { 
                status: 500, 
                headers: { 
                  'Content-Type': 'application/json',
                  ...corsHeaders 
                }
              }
            );
          }
        } while (await env.URL_STORAGE.get(`code:${code}`));

        const urlData = {
          originalUrl,
          code,
          clicks: 0,
          createdAt: new Date().toISOString(),
          lastAccessed: null
        };

        // 存储映射关系
        await env.URL_STORAGE.put(`code:${code}`, JSON.stringify(urlData));
        await env.URL_STORAGE.put(`url:${originalUrl}`, code);

        // 添加到列表
        const urlList = await env.URL_STORAGE.get('url_list');
        const urls = urlList ? JSON.parse(urlList) : [];
        urls.unshift(code); // 添加到开头
        
        // 只保留最新的50个
        if (urls.length > 50) {
          urls.splice(50);
        }
        
        await env.URL_STORAGE.put('url_list', JSON.stringify(urls));

        return new Response(
          JSON.stringify({
            originalUrl,
            shortUrl: `${url.origin}/${code}`,
            code,
            clicks: 0,
            createdAt: urlData.createdAt
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          }
        );
      }

      // API: 获取URL列表
      if (path === '/api/list' && method === 'GET') {
        const urlList = await env.URL_STORAGE.get('url_list');
        const codes = urlList ? JSON.parse(urlList) : [];
        
        const urls = [];
        for (const code of codes.slice(0, 20)) { // 只返回前20个
          const data = await env.URL_STORAGE.get(`code:${code}`);
          if (data) {
            const urlData = JSON.parse(data);
            urls.push({
              ...urlData,
              shortUrl: `${url.origin}/${code}`
            });
          }
        }

        return new Response(
          JSON.stringify({ urls }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          }
        );
      }

      // API: 删除URL
      if (path.startsWith('/api/delete/') && method === 'DELETE') {
        const code = path.split('/').pop();
        
        const data = await env.URL_STORAGE.get(`code:${code}`);
        if (!data) {
          return new Response(
            JSON.stringify({ error: '短链接不存在' }),
            { 
              status: 404, 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              }
            }
          );
        }

        const urlData = JSON.parse(data);
        
        // 删除映射关系
        await env.URL_STORAGE.delete(`code:${code}`);
        await env.URL_STORAGE.delete(`url:${urlData.originalUrl}`);

        // 从列表中移除
        const urlList = await env.URL_STORAGE.get('url_list');
        if (urlList) {
          const urls = JSON.parse(urlList);
          const index = urls.indexOf(code);
          if (index > -1) {
            urls.splice(index, 1);
            await env.URL_STORAGE.put('url_list', JSON.stringify(urls));
          }
        }

        return new Response(
          JSON.stringify({ message: '删除成功' }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          }
        );
      }

      // 短链接重定向
      if (path.length > 1) {
        const code = path.substring(1); // 去掉开头的 '/'
        const data = await env.URL_STORAGE.get(`code:${code}`);
        
        if (data) {
          const urlData = JSON.parse(data);
          
          // 更新点击次数和最后访问时间
          urlData.clicks = (urlData.clicks || 0) + 1;
          urlData.lastAccessed = new Date().toISOString();
          
          await env.URL_STORAGE.put(`code:${code}`, JSON.stringify(urlData));

          return Response.redirect(urlData.originalUrl, 302);
        }
      }

      // 404 页面
      return new Response('页面不存在', { 
        status: 404,
        headers: corsHeaders 
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response(
        JSON.stringify({ error: '服务器内部错误' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    }
  }
};