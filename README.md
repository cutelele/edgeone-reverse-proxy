# EdgeOne Pages 反向代理（中间件方式）

基于 EdgeOne Pages 中间件的 `rewrite` 实现 CDN 级反向代理，**支持 WebSocket 长连接 + 流媒体 + 大文件**。

## 为什么用中间件 rewrite 而不是 Cloud Function fetch？

| 特性 | Cloud Function fetch | 中间件 rewrite（本项目） |
|------|---------------------|------------------------|
| WebSocket | 不支持 | **CDN 层透传** |
| 流媒体 | 有限 | **完整支持** |
| 执行时长 | 120s 超时 | **无限制（CDN 回源）** |
| 延迟 | 云端服务器中转 | **边缘节点直回源** |
| 大文件 | 受 body 限制 | **无限制** |

**原理**：中间件 `rewrite` 到绝对路径 URL 后，请求走 EdgeOne CDN 的回源通道，由边缘节点直接向目标发起请求并透传响应，不是应用层 fetch，天然支持 WebSocket 和流式传输。

## 部署步骤

1. Fork 或克隆本仓库
2. 登录 [EdgeOne Pages 控制台](https://console.tencentcloud.com/edgeone/pages)
3. 导入该 Git 仓库
4. 修改 `middleware.js` 中的 `PROXY_TARGETS` 数组，填入你的节点域名
5. 平台自动构建部署

## 配置说明

编辑 `middleware.js`：

```javascript
// 目标域名列表（随机负载均衡）
const PROXY_TARGETS = [
  'node1.example.com',
  'node2.example.com',
];
```

## 文件结构

```
├── middleware.js      # 中间件 - rewrite 到目标域名，CDN 层透传
├── edgeone.json      # 部署地域配置
├── package.json
└── README.md
```

## 本地调试

```bash
npm install -g edgeone
edgeone pages dev
```
