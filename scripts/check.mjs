// 核对：正文与品牌色在各个面上的对比度（WCAG ≥ 4.5，焦点环与控件线 ≥ 3）；
// 组件样式里不写裸色值（颜色只来自令牌）；间距只用 vincent-ux 的刻度。
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = JSON.parse(readFileSync(join(ROOT, 'tokens/src/shirley.tokens.json'), 'utf8'))
const errors = []

const rgb = (s) => {
  s = s.trim()
  let m
  if ((m = /^#([0-9a-f]{6})$/i.exec(s))) return [1, 3, 5].map(i => parseInt(m[1].slice(i - 1, i + 1), 16)).concat(1)
  if ((m = /^rgba?\(([^)]+)\)$/.exec(s))) { const p = m[1].split(',').map(Number); return [p[0], p[1], p[2], p[3] ?? 1] }
  throw new Error('不认识的颜色 ' + s)
}
const blend = (fg, bg) => fg.map((c, i) => i < 3 ? Math.round(c * fg[3] + bg[i] * (1 - fg[3])) : 1)
const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
const c = (k, mode) => rgb(src.color[k][mode])
const verify = (label, fg, bg, min) => { const r = contrast(fg, bg); if (r < min) errors.push(`对比度 ${label} = ${r.toFixed(2)}，需 ≥ ${min}`) }

for (const mode of ['light', 'dark']) {
  const surfaces = ['canvas', 'shell', 'card', 'card-hover', 'inset', 'overlay', 'overlay-strong']
  for (const s of surfaces) for (const under of ['canvas', 'card']) {
    const bg = blend(c(`--vx-surface-${s}`, mode), c(`--vx-surface-${under}`, mode))
    for (const k of ['primary', 'secondary', 'tertiary']) verify(`${mode} text-${k} / ${s}`, c(`--vx-text-${k}`, mode), bg, 4.5)
    for (const k of ['accent', 'warning', 'critical']) verify(`${mode} brand-${k} / ${s}`, c(`--vx-brand-${k}`, mode), bg, 4.5)
    for (const k of ['positive', 'negative']) verify(`${mode} data-${k} / ${s}`, c(`--vx-data-${k}`, mode), bg, 4.5)
    verify(`${mode} focus / ${s}`, c('--vx-focus-ring', mode), bg, 3)
    verify(`${mode} control / ${s}`, c('--vx-line-control', mode), bg, 3)
  }
  for (const s of ['shell', 'card']) verify(`${mode} text-muted / ${s}`, c('--vx-text-muted', mode), c(`--vx-surface-${s}`, mode), 4.5)
  for (const tone of ['accent', 'warning', 'critical']) verify(`${mode} ${tone} / soft`, c(`--vx-brand-${tone}`, mode), blend(c(`--vx-brand-${tone}-soft`, mode), c('--vx-surface-card', mode)), 4.5)
  for (const stop of ['base', 'top']) verify(`${mode} 主按钮 ${stop}`, c('--vx-text-on-strong', mode), c(`--vx-ink-${stop}`, mode), 4.5)
  verify(`${mode} 强调按钮`, c('--vx-text-on-accent', mode), c('--vx-brand-accent', mode), 4.5)
  verify(`${mode} 红色计数`, c('--vx-text-on-critical', mode), c('--vx-brand-critical', mode), 4.5)
}

// 组件样式：不写裸色；间距只用刻度
const scale = new Set([0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 40, 48, 56, 72, 96])
const dir = join(ROOT, 'components/css')
for (const f of readdirSync(dir).filter(f => f.endsWith('.css'))) {
  readFileSync(join(dir, f), 'utf8').split('\n').forEach((l, i) => {
    const at = `components/css/${f}:${i + 1}`
    if (/^\s*\/\*|url\(/.test(l)) return
    if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(l)) errors.push(`${at} 裸色值，改用令牌：${l.trim()}`)
    for (const m of l.matchAll(/(?:margin|padding|gap|inset|top|left|right|bottom)[a-z-]*:\s*([^;]+);/g))
      for (const px of m[1].matchAll(/(-?\d+(?:\.\d+)?)px/g)) if (!scale.has(Math.abs(Number(px[1])))) errors.push(`${at} 间距 ${px[0]} 不在刻度里`)
  })
}
if (errors.length) { console.error(errors.map(e => '✗ ' + e).join('\n')); console.error(`\n${errors.length} 个问题`); process.exit(1) }
console.log('✓ 通过')
