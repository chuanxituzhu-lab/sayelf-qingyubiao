# 山野精灵.晴雨表（sayelf-qingyubiao）

> 把每天的降水，画成一本可以翻的日历。

单文件 HTML5 应用保留原有天气日历主链，并加入 SAYELF 品牌、免费分享、做同款邀请、二十四节气和折叠农历。手机可直接打开在线 H5；在线邀请奖励与 AI 天气接口由可选 Node.js 服务承载。

![SAYELF 山野精灵图标](assets/sayelf-logo.jpg)

更新细节、H5 / API 运行方式、奖励规则和数据边界见 [RUN-1.2.md](RUN-1.2.md)。

[⬇️ 下载最新版（自动跟随最新 Release）](https://github.com/chuanxituzhu-lab/sayelf-qingyubiao/releases/latest/download/sayelf-qingyubiao-latest.zip)　·　[📱 在线打开 H5](https://chuanxituzhu-lab.github.io/sayelf-qingyubiao/)

## 它能做什么

| 功能 | 说明 |
|---|---|
| 🗓️ 逐日天气图案 | 12 月 × 31 日矩阵，按 **GB/T 28592-2012 降水量等级**的国标符号着色；年度 / 月度 / 上下午三种视图 |
| 📍 全国定位 | 浏览器定位 / IP 定位自动落到区县，数据按地点隔离存放，切换城市不串记录 |
| 🔮 未来三天预报 | 虚线显示，到点自动被逐时实测覆盖，每次打开 / 每 30 分钟重取近 7 天 |
| 🦺 场景决策 | 按行业阈值把降水翻译成 **可作业 / 有条件 / 建议停**（内置建筑施工 / 农业种植 / 户外物流），本月因雨损失半天数一目了然 |
| 🖨️ 导出打印 | PNG / PDF（A4 可直接打印），屏幕所见即所得 |
| 📱 一键分享 | 生成微信 / 朋友圈 / 抖音 / 视频号 / 小红书推荐尺寸长图 + 文案 |
| ✍️ 官方校订 | 可填入中国气象局 / 地方气象台通报值，填入后优先显示 |
| 🔐 授权订阅 | 15 天免费试用；分享永久免费；专业导出与场景决策可购买 Pro |

## 快速开始

1. 手机上直接打开 [在线 H5](https://chuanxituzhu-lab.github.io/sayelf-qingyubiao/)；需要离线使用时下载最新版压缩包并解压；
2. 双击用 Chrome / Edge 打开，允许定位（或点「重新定位」）；
3. 完成 —— 数据保存在你自己的浏览器里（localStorage），天气服务需要网络；双向邀请奖励使用自有在线服务。

> 手机上可用浏览器打开 H5，再选择「添加到主屏幕」。H5 沿用单文件 HTML5 主链，天气与分享可用；跨设备邀请奖励和 AI 天气接口需另行运行 Node 服务。

## 作为 WorkBuddy 技能安装

本仓库同时是一份 **WorkBuddy 技能包**（`SKILL.md` + `references/` + `templates/`），三种安装方式：

**方式一 · 技能市场（推荐）**
在 WorkBuddy 技能市场搜索「山野精灵」或 `sayelf-qingyubiao` 直接安装（开放平台审核上架后可用）。

**方式二 · 从 GitHub 本地安装**
把本仓库克隆到 WorkBuddy 用户技能目录，重启 WorkBuddy 即生效：

```bash
# Windows（PowerShell）
git clone https://github.com/chuanxituzhu-lab/sayelf-qingyubiao.git "$env:USERPROFILE\.workbuddy\skills\sayelf-qingyubiao"

# macOS / Linux
git clone https://github.com/chuanxituzhu-lab/sayelf-qingyubiao.git ~/.workbuddy/skills/sayelf-qingyubiao
```

**方式三 · 免安装直用**
下载 [`templates/山野精灵.晴雨表.html`](templates/山野精灵.晴雨表.html) 双击打开，功能完整。

安装后对 WorkBuddy 说「打开晴雨表」「帮施工项目部定制停工阈值」即可由 AI 代为操作与定制。

## B 端定制

场景阈值表（`SCENES`）按客户作业规程逐条定制——建筑项目部、农场、物流车队各有自己的停工线。定制方法、损失台账（对账 / 保险佐证）口径见 [references/customization.md](references/customization.md)。

## 订阅与授权

应用自带 15 天全功能试用；到期后查看、记录、导出自己的数据**永久免费**，分享永久免费；原¥12/年、¥5/月授权方式保留，仅专业导出 / 打印 / 场景决策等高级权益按原规则授权。

- 订阅页：[`pay/山野精灵.晴雨表_订阅与授权.html`](pay/山野精灵.晴雨表_订阅与授权.html) —— 价格、微信号 `chat-tea`、扫码加好友、授权流程与 FAQ 一页说明，可离线打开；不提供公开收款码，付款通过加好友后一对一转账或 [爱发电](https://afdian.com/) 完成；
- 授权码为 ECDSA P-256 签名、可绑定设备，由作者签发（私钥不入库）。

## AI 工具接口

`api/openapi.yaml` 提供 provider-neutral 的 OpenAPI 3.1.1 契约，包含农历/节气查询和带 Token 的逐小时天气预览，可导入支持 OpenAPI 工具调用的 AI 平台。运行方式、授权边界与数据说明见 [api/README.md](api/README.md)。静态 H5 不托管 Node API；天气工具接口需部署在自有 HTTPS 服务上。

## 数据来源与免责

- 天气底本：Open-Meteo 数值再分析（ECMWF / ICON），**非官方发布值**，仅供记录与决策参考；
- 官方通报值请用「上下午分段」视图的校订功能手工填入；
- 你的数据只存在本地浏览器，清缓存会丢失，请定期用「导出 → 数据 JSON」备份。

## License

见 [LICENSE](LICENSE)。应用 © 山野精灵 SAYELF。

## 1.2.0 更新

- 提供 [稳定的最新版压缩包下载](https://github.com/chuanxituzhu-lab/sayelf-qingyubiao/releases/latest/download/sayelf-qingyubiao-latest.zip) 和 [在线 H5 入口](https://chuanxituzhu-lab.github.io/sayelf-qingyubiao/)。
- 使用者提交的二维码裁剪后放入订阅页，微信号统一为 `chat-tea`；主应用订阅入口可直接打开二维码。
- 新增 OpenAPI 3.1.1 接口契约：日期/节气查询公开可用；天气接口需自行配置服务端 `API_TOKEN`。
- 通过 GitHub Pages 发布静态页面；邀请奖励台账和 AI 天气服务仍由自有 Node 服务承载。
- 继承 1.1.0：免费分享与“生成我的晴雨表”同款二维码、有效邀请双方奖励、每人每月最多 30 天、24 节气及默认折叠农历。
