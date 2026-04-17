// EdgeOne Pages Cloud Function (Node.js) - 反向代理
// 文件路径: cloud-functions/[[default]].js
// [[default]] 是多级通配路由，匹配所有路径请求
// 使用 Cloud Functions (Node.js) 而非 Edge Functions：
//   - 请求 body 6MB（vs Edge 1MB）
//   - 执行时长 120s（vs Edge 200ms CPU）
//   - 代码包 128MB（vs Edge 5MB）
//   - 适合大文件/流媒体代理

// ==================== 配置区 ====================

// 伪装域名列表 - 在此填写你的节点域名
const PROXY_TARGETS = [
  'your-space.domain',
];

// 是否开启流式传输（流媒体/大文件必须开启）
const ENABLE_STREAMING = true;

// ==================== 核心逻辑 ====================

function getRandomTarget(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export default async function onRequest(context) {
  try {
    const { request } = context;
    const url = new URL(request.url);

    // 将请求转发到随机选择的目标域名
    url.protocol = 'https:';
    url.hostname = getRandomTarget(PROXY_TARGETS);

    // 构建转发请求头
    const headers = new Headers(request.headers);
    headers.set('Host', url.hostname);
    headers.set('X-Forwarded-Host', request.headers.get('Host') || url.hostname);
    headers.set('X-Forwarded-Proto', 'https');
    headers.set('X-Real-IP', context.clientIp || '');

    // 创建转发请求
    const init = {
      method: request.method,
      headers: headers,
      redirect: 'follow',
    };

    // 对于有 body 的请求（POST/PUT/PATCH），转发 body
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      init.body = request.body;
      init.duplex = 'half';
    }

    // 发起请求
    const response = await fetch(url.toString(), init);

    // 流式传输：直接透传响应流，不缓冲整个 body
    if (ENABLE_STREAMING && response.body) {
      const responseHeaders = new Headers(response.headers);
      responseHeaders.delete('transfer-encoding');
      responseHeaders.set('Access-Control-Allow-Origin', '*');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

    // 非流式：缓冲完整响应后返回
    const body = await response.arrayBuffer();
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Proxy Error',
      message: err.message,
    }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
