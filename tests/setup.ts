/**
 * Jest测试环境设置
 */

// 设置测试超时时间
jest.setTimeout(10000)

// Mock Vue for component tests
if (typeof global.Vue === 'undefined') {
  global.Vue = {} as any
}

// Mock浏览器API
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock Image
global.Image = class Image {
  width = 0
  height = 0
  src = ''
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  
  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }
} as any

// Mock Canvas API
HTMLCanvasElement.prototype.getContext = jest.fn(function(this: HTMLCanvasElement) {
  return {
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    transform: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    quadraticCurveTo: jest.fn(),
    bezierCurveTo: jest.fn(),
    arc: jest.fn(),
    arcTo: jest.fn(),
    ellipse: jest.fn(),
    rect: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    clip: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    setLineDash: jest.fn(),
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    canvas: this  // 使用实际的canvas对象而不是硬编码的尺寸
  }
}) as any

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

// Mock FileReader for ImageElement tests
global.FileReader = class FileReader {
  result: string | ArrayBuffer | null = null
  error: any = null
  readyState = 0
  onload: ((event: ProgressEvent) => void) | null = null
  onerror: ((event: ProgressEvent) => void) | null = null
  
  readAsDataURL(blob: Blob) {
    setTimeout(() => {
      this.result = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      if (this.onload) {
        this.onload({ target: this } as any)
      }
    }, 0)
  }
  
  abort() {}
  readAsArrayBuffer() {}
  readAsBinaryString() {}
  readAsText() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true }
} as any

// Mock File for ImageElement tests
if (typeof File === 'undefined') {
  global.File = class File {
    name: string
    size: number
    type: string
    lastModified: number
    
    constructor(bits: any[], name: string, options?: { type?: string }) {
      this.name = name
      this.size = bits.reduce((acc, bit) => acc + (bit.length || 0), 0)
      this.type = options?.type || ''
      this.lastModified = Date.now()
    }
  } as any
}

// 添加全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

