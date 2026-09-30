# 晴雨表 1.2.1 运行、H5 与接口说明

## 打开 H5 / 本地运行

- 手机或电脑浏览器打开：https://chuanxituzhu-lab.github.io/sayelf-qingyubiao/
- 手机上可在浏览器菜单选择「添加到主屏幕」。页面仍使用原单文件 HTML5 应用，不需要安装前端构建工具。
- 离线使用：从 README 的最新版 Release 下载 ZIP，解压后打开 `templates/山野精灵.晴雨表.html`。定位、天气数据仍需要网络；本地分享会正常保留品牌和“生成我的晴雨表”入口，但二维码需要配置可访问的 HTTPS 根地址。

GitHub Pages 托管静态 H5、订阅页和图片，不提供 Node API 或奖励台账。启用在线邀请奖励和 AI 天气 API，需在自己的 HTTPS 主机运行：

```powershell
node server/server.cjs
```

Node.js 22+，无需 `npm install`。正式部署要将 HTTPS 域名反向代理至服务端口，并设置与网页同源的 `PUBLIC_URL`、私有台账的 `DATA_DIR`。API天气工具需另设 `API_TOKEN`，参见 `api/README.md`。切勿把私有台账或 Token 放进静态站点。

## 微信订阅联系方式

订阅页显示并可复制微信号 `chat-tea`，同时展示用户提交的扫码二维码。主应用「订阅」入口可打开授权页或直接查看二维码。月费 ¥5 / 年费 ¥12 与人工付款后粘贴 ECDSA 授权码流程保留；未接自动支付。签名私钥不入库。

## 分享与邀请规则（沿用1.1.0）

- 分享免费；分享图保留轻量 SAYELF 品牌和“生成我的晴雨表”二维码入口。
- 同款链接传递所选年月/视图及不透明邀请码，不携带分享者地点或天气记录。
- 新用户首次成功同步天气并生成晴雨表后，邀请双方各获 7 天 Pro；按北京时间自然月，每人通过邀请最多累计30天。达到上限不影响对方按自身额度领奖。

## API 数据边界

AI 工具契约在 `api/openapi.yaml`，说明与部署步骤见 `api/README.md`。节气和农历查询使用公开日历计算；天气接口只接受显式经纬度，发送至 Open-Meteo 并返回指定日期的逐小时降水和云量，不读取浏览器记录、邀请身份或奖励台账，也不写入服务数据库。调用 AI 后，该 AI 服务会收到调用方提交的经纬度和天气结果。

## 回滚

代码/静态页可回滚到 `v1.1.0`。若已经发放邀请权益，回滚不会撤销已发天数；Node 服务私有 `DATA_DIR` 应独立备份。

## 验证

```powershell
node --test server/rewards.test.cjs server/plugins/ai-api.test.cjs
```
`README.md` 的 H5 链接与 Release 下载地址在成功发布后生效。静态页部署不代表已部署 Node 奖励/API 服务。
