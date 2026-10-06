# 自托管 Node 服务 / Self-hosted Node service

这份服务是完整 H5 的可选后端。它负责同源会话、邀请码绑定、天气同步资格、一次性奖励结算和本地账本；静态页面、GitHub Pages 和离线 H5 不会运行这些 API。

## 启动

Node.js 22 或更高版本，无需安装 npm 依赖：

```powershell
node server/server.cjs
```

正式部署时，把 HTTPS 域名反向代理到服务监听端口，并设置：

```powershell
$env:PUBLIC_URL = 'https://your-weather.example'
$env:DATA_DIR = 'D:\private-data\qingyubiao'
node server/server.cjs
```

`DATA_DIR` 必须位于静态站点目录之外，并限制为服务进程可读写。账本文件是 `ledger.json`；不要把它提交到 Git、上传到静态站点或放进公开压缩包。天气 AI 接口另需 `API_TOKEN` 时，只通过运行环境注入，不能写入 HTML、README、日志或提交记录。

## 自动奖励口径

奖励以服务端可核验事件为准：好友必须通过同款邀请码进入，在同一匿名会话中成功同步天气并完成首次晴雨表生成。安装、打开、点击、转发、失败同步和重复生成不会单独产生奖励。

一次有效新用户事件按“分 = 天”结算：

| 收益方 | 自动入账 |
| --- | ---: |
| 新用户 | 7 分，即 7 天 Pro |
| 直接邀请者 | 7 分，即 7 天 Pro |
| 直接邀请者的上游 | 3 分，即 3 天 Pro；仅此一级 |

每个账号按北京时间自然月最多入账 30 天。上游奖励不会继续传给更上游的三级关系。重复请求由首次生成状态和事件账本幂等保护。直接邀请者累计 100 位有效新用户后，服务端自动设置永久 Pro；该权益绑定匿名会话 Cookie，浏览器清除 Cookie 后可能无法恢复。

## 检查与边界

```powershell
node --test server/rewards.test.cjs server/plugins/ai-api.test.cjs
```

只把 `server/server.cjs` 作为应用后端挂到自己的 HTTPS 域名；不要把私有账本、API Token 或本地天气记录外发。GitHub Pages 只适合托管经过审核的静态 H5。
