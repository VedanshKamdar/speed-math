import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import opentype from 'opentype.js'

// Load DejaVu Serif Bold — has a clean, recognisable π glyph
const fontBuffer = readFileSync('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf')
const font = opentype.parse(fontBuffer.buffer)

const SIZE = 512
const FONT_SIZE = 340
const CX = SIZE / 2
const CY = SIZE / 2 + 60  // shift down slightly to visually centre π

// Get the π glyph path centred in the viewBox
const path = font.getPath('π', 0, 0, FONT_SIZE)
const bb = path.getBoundingBox()
const glyphW = bb.x2 - bb.x1
const glyphH = bb.y2 - bb.y1
const dx = CX - bb.x1 - glyphW / 2
const dy = CY - bb.y1 - glyphH / 2
const d = font.getPath('π', dx, dy, FONT_SIZE).toPathData(2)

// The π crossbar sits at roughly the top 28% of the glyph height
// We'll paint the glyph twice: full cream, then a cyan rect over the crossbar
const barY = dy + bb.y1 + glyphH * 0.05
const barH = glyphH * 0.22
const barX = dx + bb.x1 - 6
const barW = glyphW + 12

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#1a1e3a"/>
      <stop offset="100%" stop-color="#0d0f1a"/>
    </radialGradient>
    <clipPath id="pi-clip">
      <path d="${d}"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>

  <!-- π glyph in cream -->
  <path d="${d}" fill="#efeae0"/>

  <!-- Cyan crossbar — clipped to the π shape so it only colours the bar -->
  <rect
    x="${barX.toFixed(1)}" y="${barY.toFixed(1)}"
    width="${barW.toFixed(1)}" height="${barH.toFixed(1)}"
    fill="#6dd6e8"
    clip-path="url(#pi-clip)"
  />
</svg>`

const sizes = [
  { file: 'public/icons/icon-192.png', size: 192 },
  { file: 'public/icons/icon-512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
]

for (const { file, size } of sizes) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(file)
  console.log(`✓ ${file}`)
}

writeFileSync('public/icon.svg', svg)
console.log('✓ public/icon.svg')
