// 令牌源 → tokens/dist/tokens.css。颜色用 light-dark()，跟随 vincent-ux 在根元素上写的 color-scheme；
// 非颜色的主题值（投影、模糊）按系统偏好与 data-theme 分别落值，写法与 vincent-ux 一致。
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = JSON.parse(readFileSync(join(ROOT, 'tokens/src/shirley.tokens.json'), 'utf8'))
const version = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version
const line = (k, v) => `  ${k}: ${v};`
const css = `/* shirley-ux v${version} · tokens/dist/tokens.css（覆盖 vincent-ux 同名变量，在 vincent-ux 之后加载） */

:root {
${Object.entries(src.scale).map(([k, v]) => line(k, v)).join('\n')}
${Object.entries(src.color).map(([k, v]) => line(k, `light-dark(${v.light}, ${v.dark})`)).join('\n')}
${Object.entries(src.themed).map(([k, v]) => line(k, v.light)).join('\n')}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${Object.entries(src.themed).map(([k, v]) => '  ' + line(k, v.dark)).join('\n')}
  }
}

:root[data-theme='dark'] {
${Object.entries(src.themed).map(([k, v]) => line(k, v.dark)).join('\n')}
}
`
mkdirSync(join(ROOT, 'tokens/dist'), { recursive: true })
writeFileSync(join(ROOT, 'tokens/dist/tokens.css'), css)
console.log(`✓ ${Object.keys(src.scale).length + Object.keys(src.color).length + Object.keys(src.themed).length} 个变量 → tokens/dist/tokens.css`)
