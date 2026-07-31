/** 本地 SVG 默认头像/封面，不依赖外网图床 */

const PALETTES = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#30cfd0', '#330867']
]

function pickPalette (seed) {
  const s = String(seed || 'user')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * (i + 1)) % 9973
  return PALETTES[h % PALETTES.length]
}

function toDataUrl (svg) {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

export function generateDefaultAvatarDataUrl (name = '用') {
  const initial = (name || '用').trim().charAt(0) || '用'
  const [c1, c2] = pickPalette(name)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="256" height="256" fill="url(#g)" rx="128"/>
    <text x="128" y="148" text-anchor="middle" font-family="system-ui,sans-serif" font-size="112" font-weight="600" fill="#fff">${initial}</text>
  </svg>`
  return toDataUrl(svg)
}

export function generateDefaultCoverDataUrl (seed = 'cover') {
  const [c1, c2] = pickPalette(seed + '_cover')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="1200" height="400" fill="url(#g)"/>
    <circle cx="200" cy="320" r="180" fill="rgba(255,255,255,0.08)"/>
    <circle cx="980" cy="80" r="140" fill="rgba(255,255,255,0.06)"/>
  </svg>`
  return toDataUrl(svg)
}
