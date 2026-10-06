# 自托管 Node 服务

`server/server.cjs` 为完整晴雨表 H5 提供同源 API。它是可选的：离线 H5 和 GitHub Pages 仍能查看、记录、导出和分享，但没有服务端账本就不会兑现邀请奖励。

## 运行

Node.js 22+，无需 `npm install`：

```powershell
node server/server.cjs
```

生产环境应使用 HTTPS 反向代理，并设置浏览器实际访问的同源地址：

```powershell
$env:PUBLIC_URL = 'https://your-weather.example'
$env:DATA_DIR = 'D:\private-data\qingyubiao'
node server/server.cjs
```

默认监听 `127.0.0.1:8000`。`DATA_DIR` 必须在静态站点根目录之外并保持私有；账本为 `ledger.json`。不要提交、公开或备份到公开对象存储。需要 AI 天气接口时，另用运行环境注入 `API_TOKEN`，不要写入代码或网页。

## 奖励规则

服务端只在好友通过邀请码首次成功同步天气并生成晴雨表时结算，安装、点击、单纯转发、失败同步和重复生成不计分。每分按一天计：新用户 7 分，直接邀请者 7 分；若直接邀请者有上游邀请者，上游额外 3 分，且不再向三级上游发放。每个账号按北京时间自然月最多 30 天。直接邀请者累计 100 位有效新用户后，自动获得永久 Pro。

验证：

```powershell
node --test server/rewards.test.cjs server/plugins/ai-api.test.cjs
```
