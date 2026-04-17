// EdgeOne Pages Edge Function - 反向代理
// 文件路径: edge-functions/[[default]].js
// [[default]] 是通配路由，匹配所有路径请求

// 伪装域名列表 - 在此填写你的节点域名
const PROXY_TARGETS = [
  'your-space.domain',
];

// 随机选择一个目标域名
function getRandomTarget(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 将请求转发到随机选择的目标域名
    url.protocol = 'https:';
    url.hostname = getRandomTarget(PROXY_TARGETS);

    // 创建新请求，保留原始请求的方法、头部和 body
    const newRequest = new Request(url, request);

    // 设置 Host 头为目标域名（某些源站会校验 Host）
    newRequest.headers.set('Host', url.hostname);

    // 添加 X-Forwarded-For 等标准代理头
    newRequest.headers.set('X-Forwarded-Host', request.headers.get('Host') || url.hostname);
    newRequest.headers.set('X-Real-IP', request.headers.get('CF-Connecting-IP') || '');

    return fetch(newRequest);
  },
};
