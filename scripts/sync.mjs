// 同步到使用方：首次复制；已有差异先报告，显式 --overwrite 才覆盖。
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const [dest, ...flags] = process.argv.slice(2)
if (!dest || dest.startsWith('--') || flags.some(f => !['--overwrite', '--dry-run'].includes(f))) {
  console.error('用法：node scripts/sync.mjs <目录> [--dry-run] [--overwrite]')
  process.exit(2)
}
const out = resolve(dest)
const plan = [
  ['LICENSE', 'LICENSE'],
  ['tokens/dist/tokens.css', 'tokens.css'],
  ...readdirSync(join(ROOT, 'components/css')).filter(f => f.endsWith('.css')).map(f => [`components/css/${f}`, `css/${f}`]),
  ['styles.css', 'styles.css'],
].map(([from, to]) => {
  let content = readFileSync(join(ROOT, from), 'utf8')
  if (from === 'styles.css') content = content.replace('./tokens/dist/tokens.css', './tokens.css').replaceAll('./components/css/', './css/')
  const path = join(out, to)
  const previous = existsSync(path) ? readFileSync(path, 'utf8') : undefined
  return { path, to, content, changed: previous !== content, conflict: previous !== undefined && previous !== content }
})
const conflicts = plan.filter(f => f.conflict)
if (conflicts.length && !flags.includes('--overwrite')) {
  console.error('已有文件与来源不同，未写入任何文件：\n' + conflicts.map(f => `  ${f.to}`).join('\n'))
  process.exit(1)
}
const changed = plan.filter(f => f.changed)
if (flags.includes('--dry-run')) console.log(changed.map(f => `${f.conflict ? '覆盖' : '新增'} ${f.to}`).join('\n') || '无需更新')
else {
  for (const file of changed) { mkdirSync(dirname(file.path), { recursive: true }); writeFileSync(file.path, file.content) }
  console.log(`shirley-ux → ${out}：${plan.length} 个文件，更新 ${changed.length} 个`)
}
