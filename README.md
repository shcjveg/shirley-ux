# shirley-ux

素略 UGC 的视觉皮肤层。它不是一套独立的设计系统：结构、组件、交互、无障碍规则全部沿用 [vincent-ux](https://github.com/shcjveg/vincent-ux)，这里只放 vincent-ux 之上的**视觉覆盖**与素略特有的少量样式。凡是这里没写的，一律以 vincent-ux 为准。

来源：UX 设计师的交互演示 V3（2026-10-31）。其中好的结构性想法（导览锚点、警示语气、图标含义）已经收进 vincent-ux；与 vincent-ux 的刻度不兼容的部分（字号、圆角、精确品牌色、控件质感）留在这里。

## 内容

- `tokens/src/shirley.tokens.json` → `tokens/dist/tokens.css`：覆盖 vincent-ux 同名变量。冷灰纸面 + 墨色文字 + 深绿强调（取自应用图标 `#245F4A`）；字号 11 / 12 / 14 / 16 / 18 / 24 / 30 / 40；圆角 6 / 12 / 16；控件 32 / 36 / 44；浅色与暗色两套。额外变量：`--vx-font-family-serif`（页头宋体）、`--vx-text-on-accent`（绿色主按钮上的字）、`--vx-shadow-lift`（卡片的远投影）。
- `components/css/`：按部位分文件的视觉覆盖——文字层级与页头（`typography`）、顶部页签条与品牌标识（`shell`）、卡片（`card`）、表格与筛选（`table`）、控件（`controls`）、标签（`tag`）、列表（`list`）、浮层与导览（`overlay`）、空态（`empty`）、动效与触摸（`motion`）。只用选择器覆盖，不新增组件结构。
- `styles.css`：入口，按上面的顺序引入。

不收的：V3 的左侧栏外壳（素略工作台嵌在 GrowX 里，保持顶部页签）、业务视图样式（属于产品的 `app.css`）、独立的新手指引与命令面板（用 vincent-ux 的 `Guide`）。

## 接入

```html
<link rel="stylesheet" href="vincent-ux/styles.css">
<link rel="stylesheet" href="app.css">
<link rel="stylesheet" href="shirley/styles.css">
```

加载顺序：vincent-ux → 产品 app.css → shirley。品牌标识用 `.vx-brand-mark`（图标 + 两个字）放进 `Tabs` 的 `leading`。

```bash
npm run build          # 令牌源 → tokens/dist/tokens.css
npm run check          # 对比度（正文与品牌色 ≥ 4.5，焦点环与控件线 ≥ 3）、组件样式不写裸色、间距只用刻度
npm run sync -- <目录> [--dry-run] [--overwrite]   # 复制到使用方的 vendor/shirley/
```

## 与 V3 的差异（有意为之）

- 第三级文字与控件描边比 V3 深一档：V3 的 `#7d8493` / `#cfd2d8` 达不到 4.5 / 3 的对比度。
- 没有 `--vx-text-on-accent` 以外的新语义：警示色（黄）已进 vincent-ux，这里只给色值。
- 滚动条沿用 vincent-ux 的标准属性写法，不用 `::-webkit-scrollbar`。
