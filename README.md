# 小工具集

一组纯本地运行的 Windows 桌面工具，官方站点与下载入口。

**站点**：<https://luck-l6.github.io/toolbox/>

## 收录的工具

| 工具 | 一句话 | 版本 | 状态 |
|---|---|---|---|
| [Snapshot](https://luck-l6.github.io/toolbox/snapshot.html) | 热键一按 → 框选 → 两笔标注 → 回车，截图直接进剪贴板和截图库 | v1.0.0 | 可用 |
| [VideoTodo](https://luck-l6.github.io/toolbox/videotodo.html) | 一边看视频一边把时间点钉住，点条目跳回原处 | v1.0.0 | 可用 |
| [DeskDock](https://github.com/luck-l6/DeskDock) | 桌面和开始菜单的应用收进一条底部 Dock，不动任何文件 | v1.2.1 | 可用 |

## 三条不变的原则

- **纯本地**：不联网、不上传、不含任何网络请求代码
- **热键优先**：所有操作都能不开主窗口完成
- **用完即走**：绿色单文件，不写注册表，删了就当没装过

## 站点说明

纯静态站点，无后端、无框架、无构建步骤：

```
index.html        工具箱目录（搜索 + 分类筛选，数据来自 assets/tools.js）
snapshot.html     工具详情页
videotodo.html    工具详情页
deskdock.html     工具详情页
feedback.html     反馈表单
assets/
  style.css       全站样式
  app.js          目录渲染、搜索筛选、动效
  tools.js        工具清单（加工具只需在这里加一条）
  feedback.js     反馈提交
```

添加新工具：在 `assets/tools.js` 的数组里加一条，再复制一个详情页改内容即可，首页索引与卡片网格会自动更新。

## 反馈

站点内 → [反馈页](https://luck-l6.github.io/toolbox/feedback.html)：可报告 Bug、提功能建议、提新工具想法。

## 下载

所有 exe 通过 GitHub Releases 分发，不走第三方网盘：

- Snapshot / VideoTodo：本仓库 [Releases](../../releases)
- DeskDock：独立仓库 [luck-l6/DeskDock](https://github.com/luck-l6/DeskDock/releases)

未做代码签名，首次运行 Windows 可能提示"未知发布者"，点「更多信息 → 仍要运行」即可。
