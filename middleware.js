// EdgeOne Pages 中间件 - CDN 反向代理
// 文件路径: middleware.js
// 通过 rewrite 到绝对路径，走 EdgeOne CDN 回源通道
// CDN 层面透传，天然支持 WebSocket 长连接 + 流媒体 + 大文件
// 不受 Cloud Function 120s 超时限制

// ==================== 配置区 ====================

// 伪装域名列表 - 在此填写你的节点域名
const PROXY_TARGETS = [
  'ikefon-hugood.hf.space',
];

// ==================== 核心逻辑 ====================

function getRandomTarget(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function middleware(context) {
  const { request, rewrite } = context;
  const url = new URL(request.url);

  // 重写到目标域名，保留原始路径和查询参数
  const target = getRandomTarget(PROXY_TARGETS);
  const targetUrl = `https://${target}${url.pathname}${url.search}`;

  return rewrite(targetUrl);
}

// 匹配所有路由
export const config = {
  matcher: ['/:path*'],
};
