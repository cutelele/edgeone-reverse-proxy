# EdgeOne Pages 反向代理

基于 EdgeOne Pages Functions (Edge Functions) 实现的轻量级反向代理。

## 原理

利用 EdgeOne Pages 的 Edge Functions 边缘函数能力，在边缘节点拦截所有请求，将请求转发到配置的目标域名，实现反向代理功能。支持多目标域名随机负载均衡。

## 部署步骤

1. Fork 或克隆本仓库
2. 登录 [EdgeOne Pages 控制台](https://console.tencentcloud.com/edgeone/pages)
3. 导入该 Git 仓库
4. 修改 `edge-functions/[[default]].js` 中的 `PROXY_TARGETS` 数组，填入你的节点域名
5. 平台自动构建部署，部署完成后即可通过分配的域名访问

## 配置说明

编辑 `edge-functions/[[default]].js`，修改目标域名列表：

```javascript
const PROXY_TARGETS = [
  'node1.example.com',
  'node2.example.com',
  'node3.example.com',
];
```

## 文件结构

```
├── edge-functions/
│   └── [[default]].js    # Edge Function - 通配所有路径的反代逻辑
├── package.json
└── README.md
```

## 本地调试

```bash
# 安装 EdgeOne CLI
npm install -g edgeone

# 启动本地开发服务
edgeone pages dev
```

## 注意事项

- Edge Functions 代码包大小限制 5MB
- 请求 body 大小限制 1MB
- 单次执行 CPU 时间限制 200ms
- 仅支持 JavaScript (ES2023+)
- 代理大文件/流媒体建议使用 Cloud Functions
