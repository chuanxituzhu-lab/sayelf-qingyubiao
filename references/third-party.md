# 内嵌开源库

- lunar-javascript： https://github.com/6tail/lunar-javascript ，2026-09-30读取master/lunar.js，SHA256: 9750324BFE1AA63C146F8C72B1143DF924466C11C8A5277D7D9225C541A18AAA 。MIT许可证见 lunar-LICENSE.txt。仅调用农历日期与节气接口，不展示黄历。
- qrcode-generator 1.4.4： https://github.com/kazuhikoarase/qrcode-generator ，下载自固定版本CDN，SHA256: 18AE399F81182BC9DE916E9C77B195DF20CC58D6F2D55A62B085A299F1BF1780 。MIT许可证见 qrcode-LICENSE.txt。二维码本地计算。
- 两库已内嵌HTML，运行时不从CDN加载；未加入框架依赖。lunar-javascript另有一份本地副本供AI日历接口调用，版本/哈希/许可证相同。
