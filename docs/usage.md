# 使用

- 颜色只用变量；需要新语义先看 vincent-ux 有没有（accent / warning / critical 三档语气都有了）。
- 页头：`h1` 自动用宋体；一页只有一个主按钮（`vx-btn--primary`），导出、标为已读之类是次按钮；都用中号。
- 列表首列：标题 `.vx-cell-title` 15px 加粗，下面一行 `.vx-meta` 12px 第三级色。
- 时间档的三色：今日新增 = accent，1 天未处理 = warning，2 天以上 = critical；标签用 `.vx-tag--*`，文字用 `.vx-text-*`。
- 改视觉先改这里再 `npm run sync -- <目录> --overwrite`，不要手改使用方 `vendor/shirley/`。
