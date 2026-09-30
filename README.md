# 山野精灵.晴雨表（sayelf-qingyubiao）

> 把每天的降水，画成一本可以翻的日历。

单文件离线版双击即可使用；在线邀请版另附轻量 Node.js 服务。新版加入 SAYELF 森林精灵品牌图标、免费分享、做同款邀请、二十四节气和折叠农历。

![SAYELF 山野精灵图标](assets/sayelf-logo.jpg)

更新细节、离线/在线启动、奖励规则和数据边界见 [RUN-1.1.md](RUN-1.1.md)。

[⬇️ 下载应用（templates/山野精灵.晴雨表.html）](templates/山野精灵.晴雨表.html)

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

1. 下载 [`templates/山野精灵.晴雨表.html`](templates/山野精灵.晴雨表.html)（含日历/二维码代码，约 700KB）；
2. 双击用 Chrome / Edge 打开，允许定位（或点「重新定位」）；
3. 完成 —— 数据保存在你自己的浏览器里（localStorage），天气服务需要网络；双向邀请奖励使用自有在线服务。

> 手机上建议在线版 + 「添加到主屏幕」；跨域受限时可在文件目录执行 `python -m http.server 8000` 后访问 `http://localhost:8000/山野精灵.晴雨表.html`。

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

- 订阅页：[`pay/山野精灵.晴雨表_订阅与授权.html`](pay/山野精灵.晴雨表_订阅与授权.html) —— 价格、**加微信好友**、授权流程、FAQ 一页说明，可离线打开；不提供公开收款码，付款通过加好友后一对一转账或 [爱发电](https://afdian.com/) 完成；
- 授权码为 ECDSA P-256 签名、可绑定设备，由作者签发（私钥不入库）。

## 数据来源与免责

- 天气底本：Open-Meteo 数值再分析（ECMWF / ICON），**非官方发布值**，仅供记录与决策参考；
- 官方通报值请用「上下午分段」视图的校订功能手工填入；
- 你的数据只存在本地浏览器，清缓存会丢失，请定期用「导出 → 数据 JSON」备份。

## License

见 [LICENSE](LICENSE)。应用 © 山野精灵 SAYELF。

## 1.1.0 更新

- 品牌图标已嵌入单文件应用，并用于天气导出与分享卡片。
- 分享到期仍可用，图卡包含 SAYELF 品牌、“生成我的晴雨表”及同款二维码。
- 在线服务依据首次成功生成发放邀请双方各7天 Pro，每人按北京时间自然月最多获得30天。
- 主界面展示24节气；农历日期默认折叠。
- 在线版在项目根目录运行 `node server/server.cjs`（Node.js 22+）。离线分享需设置一个可访问的 HTTPS 地址，在线奖励需要同域部署服务。
- 包含订阅页、原微信联系方式及授权流程；未接自动支付。
- 在线版以浏览器 Cookie 识别邀请用户，不具备账号级反刷；部署说明见 RUN-1.1.md。
