#!/usr/bin/env node
/**
 * Generate PWA icons from SVG
 * Run: node generate-icons.js
 */

const fs = require('fs')
const path = require('path')

// Simple 1x1 pixel PNG generator (for placeholder)
// In production, you'd want to use a proper image generation library

const createPNG = (width, height, color = [59, 130, 246]) => {
  // Minimal PNG structure
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8 // bit depth
  ihdrData[9] = 2 // color type (RGB)
  ihdrData[10] = 0 // compression
  ihdrData[11] = 0 // filter
  ihdrData[12] = 0 // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdrData)
  
  // IDAT chunk (simple colored image)
  const rawData = []
  for (let y = 0; y < height; y++) {
    rawData.push(0) // filter byte
    for (let x = 0; x < width; x++) {
      rawData.push(color[0], color[1], color[2])
    }
  }
  
  const zlib = require('zlib')
  const compressed = zlib.deflateSync(Buffer.from(rawData))
  const idatChunk = createChunk('IDAT', compressed)
  
  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0))
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

const createChunk = (type, data) => {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  
  const typeBuffer = Buffer.from(type)
  const crcData = Buffer.concat([typeBuffer, data])
  
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcData), 0)
  
  return Buffer.concat([length, typeBuffer, data, crc])
}

const crc32 = (data) => {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

// Generate icons
const publicDir = path.join(__dirname, 'public')

const sizes = [192, 512]
sizes.forEach(size => {
  const png = createPNG(size, size)
  const filePath = path.join(publicDir, `icon-${size}.png`)
  fs.writeFileSync(filePath, png)
  console.log(`Created: ${filePath}`)
})

// Create maskable icon (with padding)
const maskable512 = createPNG(512, 512)
const maskablePath = path.join(publicDir, 'icon-maskable-512.png')
fs.writeFileSync(maskablePath, maskable512)
console.log(`Created: ${maskablePath}`)

console.log('PWA icons generated successfully!')
console.log('Note: For production, use proper icon design with your logo.')
