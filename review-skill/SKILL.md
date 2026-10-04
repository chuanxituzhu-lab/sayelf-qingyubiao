---
name: sayelf-qingyubiao-review
display_name: 晴雨表
display_name_en: Weather Calendar
description: "使用天气日历查看和记录逐日降水、二十四节气及农历日期；当用户提到晴雨表、天气日历、降水记录或分享导出时调用。"
description_zh: "以日历呈现逐日降水，支持定位、二十四节气、折叠农历、本地记录和图片分享。"
description_en: "View and record daily precipitation in a calendar with 24 solar terms, collapsed lunar dates, local records, and image sharing."
category: tools
version: 1.2.7
author: 山野精灵
---

# 晴雨表

使用随技能包提供的单文件 H5 帮助用户查看、记录和分享天气日历。

## 文件

- `templates/晴雨表.html`：可在现代浏览器中直接打开的单文件 H5。

## 使用步骤

1. 用户想查看晴雨表时，说明可以打开 `templates/晴雨表.html`；首次定位时由用户决定是否允许浏览器定位。
2. 根据用户需要介绍年度、月度、上下午视图，以及逐日降水和二十四节气。
3. 农历日期默认折叠；用户需要时再展开查看，不推断或补造缺失日期。
4. 用户想分享时，使用页面的分享按钮生成晴雨表图片；如果设备不支持直接分享，按页面提示保存图片或复制摘要。
5. 解释天气与定位需要网络；浏览器记录保存在本地。数值预报和再分析数据不是气象台正式证明，不作为紧急天气预警。

## 数据边界

- 用户记录保存在浏览器本地；本技能不要求导出或上传这些记录。
- 定位和天气查询由 H5 按用户操作执行，需要网络。
- 不把数值预报描述为官方实测值；不替用户作出安全或停工决定。
