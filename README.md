# EdgeOne Pages 反向代理

基于 EdgeOne Pages Cloud Functions (Node.js) 实现的反向代理，**专为代理大文件/流媒体优化**。

## 为什么用 Cloud Functions 而不是 Edge Functions？

| 特性 | Edge Functions | Cloud Functions (本项目) |
|------|---------------|------------------------|
| 请求 body 大小 | 1 MB | **6 MB** |
| 最大执行时长 | 200ms CPU | **120s** |
| 代码包大小 | 5 MB | **128 MB** |
| 流式传输 | 有限 | **完整支持** |

## 部署步骤

1. Fork 或克隆本仓库
2. 登录 [EdgeOne Pages 控制台](https://console.tencentcloud.com/edgeone/pages)
3. 导入该 Git 仓库
4. 修改 `cloud-functions/[[default]].js` 中的 `PROXY_TARGETS` 数组，填入你的节点域名
5. 平台自动构建部署，部署完成后即可通过分配的域名访问

## 配置说明

编辑 `cloud-functions/[[default]].js`：

```javascript
// 目标域名列表（随机负载均衡）
const PROXY_TARGETS = [
  'node1.example.com',
  'node2.example.com',
  'node3.example.com',
];

// 流式传输开关（大文件/流媒体必须开启）
const ENABLE_STREAMING = true;
```

## 文件结构

```
├── cloud-functions/
│   └── [[default]].js        # Cloud Function (Node.js) - 通配所有路径的反代逻辑
├── edgeone.json              # 部署地域配置
├── package.json
└── README.md
```

## 工作原理

1. `[[default]].js` 是多级通配路由，匹配 `/api/` 下的所有路径
2. 从 `PROXY_TARGETS` 列表中随机选择一个目标域名
3. 保留原始请求的 method、headers、body
4. 开启流式传输时，响应 body 以 Stream 方式直接透传，不缓冲整个文件
5. 自动添加 `X-Forwarded-Host`、`X-Real-IP` 等标准代理头
6. 支持 CORS 跨域访问

## 访问示例

假设部署域名为 `proxy.example.com`，目标域名为 `target.com`：

```
https://proxy.example.com/video.mp4  →  https://target.com/video.mp4
https://proxy.example.com/stream     →  https://target.com/stream
https://proxy.example.com/           →  https://target.com/
```

## 本地调试

```bash
# 安装 EdgeOne CLI
npm install -g edgeone

# 启动本地开发服务
edgeone pages dev
```

## 注意事项

- Cloud Functions 请求 body 限制 6MB，如需代理更大的上传请求需拆分
- 最大执行时长 120 秒，超长流媒体可能需要客户端重连
- 流式传输模式下内存占用极低，适合代理大文件
- 地域配置可在 `edgeone.json` 中调整，默认广州+新加坡
