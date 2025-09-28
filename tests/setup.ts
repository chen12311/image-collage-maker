/**
 * Jest测试环境配置
 */

// 配置Canvas支持
import { createCanvas } from 'canvas'

// 模拟HTMLCanvasElement
global.HTMLCanvasElement = class {
  constructor() {
    this._canvas = createCanvas(1, 1)
    this.width = 1
    this.height = 1
  }
  
  _canvas: any
  width: number
  height: number

  getContext(type: string) {
    if (type === '2d') {
      return this._canvas.getContext('2d')
    }
    return null
  }

  toDataURL() {
    return this._canvas.toDataURL()
  }

  toBlob(callback: (blob: Blob | null) => void) {
    const dataURL = this._canvas.toDataURL()
    const binary = atob(dataURL.split(',')[1])
    const array = []
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i))
    }
    const blob = new Blob([new Uint8Array(array)], { type: 'image/png' })
    callback(blob)
  }

  remove() {
    // Mock remove method
  }
}

// 模拟document.createElement for canvas
const originalCreateElement = document.createElement.bind(document)
document.createElement = function(tagName: string) {
  if (tagName === 'canvas') {
    return new global.HTMLCanvasElement() as any
  }
  return originalCreateElement(tagName)
}

// 模拟URL.createObjectURL和revokeObjectURL
global.URL = {
  ...global.URL,
  createObjectURL: jest.fn(() => 'mock-object-url'),
  revokeObjectURL: jest.fn()
}

// 模拟浏览器API
global.File = class MockFile {
  constructor(
    public bits: string[],
    public name: string,
    public options: { type?: string } = {}
  ) {
    this.size = bits.join('').length
    this.type = options.type || 'application/octet-stream'
  }
  
  size: number
  type: string
  lastModified: number = Date.now()
  
  slice(start?: number, end?: number, contentType?: string): Blob {
    return new Blob(this.bits.slice(start, end), { type: contentType || this.type })
  }
}

// 导入Canvas库的ImageData
import { ImageData } from 'canvas'

// 设置全局ImageData
global.ImageData = ImageData

// 模拟performance.memory API
Object.defineProperty(global.performance, 'memory', {
  get: () => ({
    usedJSHeapSize: 50 * 1024 * 1024,  // 50MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    jsHeapSizeLimit: 2048 * 1024 * 1024 // 2GB
  }),
  configurable: true
})
