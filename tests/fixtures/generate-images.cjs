/**
 * 生成测试图片文件
 * 使用Canvas库生成简单的测试图片
 */

const fs = require('fs')
const path = require('path')
const { createCanvas } = require('canvas')

const imagesDir = path.join(__dirname, 'images')

// 确保目录存在
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

// 生成100x100 PNG图片
function generateSmallImage() {
  const canvas = createCanvas(100, 100)
  const ctx = canvas.getContext('2d')
  
  // 背景色
  ctx.fillStyle = '#4CAF50'
  ctx.fillRect(0, 0, 100, 100)
  
  // 边框
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, 96, 96)
  
  // 文字
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 20px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('100x100', 50, 50)
  
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(path.join(imagesDir, 'test-image-100x100.png'), buffer)
  console.log('✓ 已生成 test-image-100x100.png')
}

// 生成2000x2000 JPEG大图
function generateLargeImage() {
  const canvas = createCanvas(2000, 2000)
  const ctx = canvas.getContext('2d')
  
  // 渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 2000, 2000)
  gradient.addColorStop(0, '#2196F3')
  gradient.addColorStop(1, '#9C27B0')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 2000, 2000)
  
  // 网格
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 2
  for (let i = 0; i < 2000; i += 200) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 2000)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(2000, i)
    ctx.stroke()
  }
  
  // 文字
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 120px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('2000x2000', 1000, 1000)
  
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 })
  fs.writeFileSync(path.join(imagesDir, 'test-image-large.jpg'), buffer)
  console.log('✓ 已生成 test-image-large.jpg')
}

// 生成800x1200 JPEG竖图
function generatePortraitImage() {
  const canvas = createCanvas(800, 1200)
  const ctx = canvas.getContext('2d')
  
  // 背景色
  ctx.fillStyle = '#FF9800'
  ctx.fillRect(0, 0, 800, 1200)
  
  // 装饰圆圈
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`
    const x = Math.random() * 800
    const y = Math.random() * 1200
    const r = 50 + Math.random() * 100
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  
  // 文字
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 80px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('800', 400, 500)
  ctx.fillText('x', 400, 600)
  ctx.fillText('1200', 400, 700)
  
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 })
  fs.writeFileSync(path.join(imagesDir, 'test-image-portrait.jpg'), buffer)
  console.log('✓ 已生成 test-image-portrait.jpg')
}

// 执行生成
console.log('开始生成测试图片...')
generateSmallImage()
generateLargeImage()
generatePortraitImage()
console.log('\n所有测试图片生成完成！')

