# AI 工具接口

`openapi.yaml` 是 provider-neutral 的 OpenAPI 3.1.1 契约，可导入支持 OpenAPI Actions/Tools 的 AI 平台，也可据此生成其他语言的客户端。接口作为 `server/plugins/ai-api.cjs` 独立模块挂到现有 Node 服务上，不增加 SDK 或运行时依赖。

## 启动

日历接口可匿名访问；天气接口需要服务端配置 Bearer Token。先在安全的本地环境设置随机 `API_TOKEN`，再运行：

```powershell
$env:API_TOKEN='替换为你自行生成的长随机值'
$env:PUBLIC_URL='https://你的服务域名/'
node server/server.cjs
```

通过 HTTPS 反向代理公开 Node 服务后，将 `openapi.yaml` 中的 `servers.url` 改成服务 HTTPS 根地址，再导入 AI 工具。不要把 Token 放进 HTML、README、公开工作流、AI 提示词或浏览器代码。默认监听 `127.0.0.1`，应由反向代理转发。

## 接口

- `GET /api/v1/calendar/day?date=2026-02-17`：返回公历日期、农历日期和当日节气。
- `GET /api/v1/calendar/solar-terms?year=2026`：返回该年的24节气名称与日期。
- `POST /api/v1/weather/preview`：用 Bearer Token 请求单日逐小时降水和云量。请求体传入明确的经纬度，日期可省略（默认北京时间今天），仅支持过去7天到未来3天。

示例：

```json
{"latitude":29.53,"longitude":106.57,"date":"2026-09-30"}
```

AI 服务将看到调用者传入的经纬度及接口返回天气。该模块不读取或上传浏览器历史、邀请身份或奖励台账，不保存请求；天气坐标会发送到 Open-Meteo。公开部署前应使用可信 AI 服务、HTTPS，并按运营者的数据保留策略配置上游和代理日志。

## 独立 H5 与 API 的边界

GitHub Pages 仅托管静态 H5、分享入口与订阅页，不运行 Node API、邀请奖励台账或受 Token 保护的天气接口。需要这些在线服务时，另行在自有 HTTPS 主机运行 `server/server.cjs`；不要将私有台账放进静态站点目录。
