/**
 * 应用主Store
 * 
 * 使用Pinia管理应用全局状态，替代demo中的全局state对象
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  type LayoutConfig,
  type ImageElement,
  type TextElement,
  type CanvasState,
  type CanvasSize,
  type BackgroundConfig,
  type BackgroundImageEffects,
  type OpacityConfig,
  createLayoutConfig,
  getLayoutById,
  DEFAULT_BACKGROUND_CONFIG,
  DEFAULT_BACKGROUND_IMAGE_EFFECTS,
  DEFAULT_OPACITY_CONFIG
} from '@/core/models'
import { 
  LongImageLayoutGenerator,
  type LongImageDirection 
} from '@/layout/LongImageLayoutGenerator'
import { 
  CanvasSizeCalculator,
  type SizeCalculationMode 
} from '@/core/canvas/CanvasSizeCalculator'
import {
  getPresetById
} from '@/core/presets/LongImagePresets'
import { createHistoryManager } from '@/history/HistoryManager'
import { toast } from '@/composables/useToast'
import { i18n, saveLocale } from '@/i18n'
import type { Locale } from '@/locales'

/**
 * 应用Store
 */
export const useAppStore = defineStore('app', () => {
  // ============================================================================
  // 状态定义
  // ============================================================================
  
  /** 当前语言 */
  const locale = ref<Locale>(i18n.global.locale.value as Locale)
  
  /** 布局类型 */
  const layoutType = ref<string>('grid-2x1-h')
  
  /** 图片间距 */
  const spacing = ref(10)
  
  /** 边距 */
  const padding = ref(0)
  
  /** 圆角 */
  const radius = ref(0)
  
  /** 背景类型 */
  const bgType = ref<'color' | 'image'>(DEFAULT_BACKGROUND_CONFIG.type)
  
  /** 背景颜色 */
  const bgColor = ref(DEFAULT_BACKGROUND_CONFIG.color)
  
  /** 背景透明度 */
  const bgOpacity = ref(DEFAULT_BACKGROUND_CONFIG.opacity)
  
  /** 背景图片 URL */
  const bgImageUrl = ref<string | undefined>(undefined)
  
  /** 背景图片效果 */
  const bgImageEffects = ref<BackgroundImageEffects>({ ...DEFAULT_BACKGROUND_IMAGE_EFFECTS })
  
  /** 全局透明度 */
  const globalOpacity = ref(DEFAULT_OPACITY_CONFIG.global)
  
  /** 图片透明度 */
  const imageOpacity = ref(DEFAULT_OPACITY_CONFIG.image)
  
  /** 画布宽度 */
  const canvasWidth = ref(800)
  
  /** 画布高度 */
  const canvasHeight = ref(800)
  
  /** 图片列表 */
  const images = ref<ImageElement[]>([])
  
  /** 文字列表 */
  const texts = ref<TextElement[]>([])
  
  /** 导出格式 */
  const exportFormat = ref<'png' | 'jpeg' | 'webp'>('png')
  
  /** 画布缩放比例（1 = 100%） */
  const canvasScale = ref(1)
  
  /** 是否自动适配画布缩放 */
  const autoFit = ref(true)
  
  // ============================================================================
  // 历史管理器
  // ============================================================================
  
  /** 历史管理器实例 */
  const historyManager = createHistoryManager()
  
  // ============================================================================
  // 长图模式状态
  // ============================================================================
  
  /** 是否启用长图模式 */
  const longImageMode = ref(false)
  
  /** 长图方向 */
  const longImageDirection = ref<LongImageDirection>('vertical')
  
  /** 画布尺寸计算模式 */
  const sizeCalculationMode = ref<SizeCalculationMode>('preset')
  
  /** 固定宽度（竖向长图） */
  const fixedWidth = ref(1080)
  
  /** 固定高度（横向长图） */
  const fixedHeight = ref(1080)
  
  // ============================================================================
  // 计算属性
  // ============================================================================
  
  /** 布局配置 */
  const layoutConfig = computed<LayoutConfig>(() => {
    // 长图模式：动态生成布局
    if (longImageMode.value) {
      const validImages = images.value.filter(img => img && img !== null)
      // 没有图片时至少生成1个单元格，让用户看到布局变化
      const imageCount = Math.max(validImages.length, 1)
      const template = LongImageLayoutGenerator.generate({
        imageCount: imageCount,
        direction: longImageDirection.value,
        seamless: spacing.value === 0
      })
      
      return {
        type: template.id,
        cells: template.cells,
        spacing: spacing.value,
        padding: padding.value,
        radius: radius.value
      }
    }
    
    // 普通模式：使用预设布局
    return createLayoutConfig(
      layoutType.value,
      spacing.value,
      padding.value,
      radius.value
    )
  })
  
  /** 画布尺寸 */
  const canvasSize = computed<CanvasSize>(() => ({
    width: canvasWidth.value,
    height: canvasHeight.value
  }))
  
  /** 背景配置 */
  const backgroundConfig = computed<BackgroundConfig>(() => ({
    type: bgType.value,
    color: bgColor.value,
    opacity: bgOpacity.value,
    image: bgImageUrl.value ? {
      url: bgImageUrl.value,
      effects: { ...bgImageEffects.value }
    } : undefined
  }))
  
  /** 透明度配置 */
  const opacityConfig = computed<OpacityConfig>(() => ({
    global: globalOpacity.value,
    image: imageOpacity.value
  }))
  
  /** 当前画布状态（用于历史记录） */
  const currentState = computed<CanvasState>(() => ({
    layout: layoutConfig.value,
    images: images.value,
    texts: texts.value,
    canvasSize: canvasSize.value,
    background: backgroundConfig.value,
    opacity: opacityConfig.value,
    timestamp: Date.now()
  }))
  
  /** 布局单元格数量 */
  const layoutCellCount = computed(() => {
    const template = getLayoutById(layoutType.value)
    return template ? template.cells.length : 0
  })
  
  /** 是否有图片 */
  const hasImages = computed(() => images.value.length > 0)
  
  /** 是否有文字 */
  const hasTexts = computed(() => texts.value.length > 0)
  
  /** 画布缩放百分比 */
  const canvasScalePercent = computed(() => Math.round(canvasScale.value * 100))
  
  /** 是否可以撤销 */
  const canUndo = computed(() => historyManager.canUndo)
  
  /** 是否可以重做 */
  const canRedo = computed(() => historyManager.canRedo)
  
  // ============================================================================
  // 布局操作
  // ============================================================================
  
  /**
   * 设置布局类型
   */
  function setLayoutType(type: string) {
    layoutType.value = type
  }
  
  /**
   * 设置间距
   */
  function setSpacing(value: number) {
    spacing.value = Math.max(0, Math.min(50, value))
  }
  
  /**
   * 设置边距
   */
  function setPadding(value: number) {
    padding.value = Math.max(0, Math.min(100, value))
  }
  
  /**
   * 设置圆角
   */
  function setRadius(value: number) {
    radius.value = Math.max(0, Math.min(50, value))
  }
  
  // ============================================================================
  // 画布操作
  // ============================================================================
  
  /**
   * 设置画布尺寸
   */
  function setCanvasSize(width: number, height: number) {
    canvasWidth.value = Math.max(100, width)
    canvasHeight.value = Math.max(100, height)
  }
  
  /**
   * 使用预设尺寸
   */
  function usePresetSize(preset: string) {
    const [w, h] = preset.split('x').map(Number)
    setCanvasSize(w, h)
  }
  
  // ============================================================================
  // 背景操作
  // ============================================================================
  
  /**
   * 设置背景类型
   */
  function setBgType(type: 'color' | 'image') {
    bgType.value = type
  }
  
  /**
   * 设置背景颜色
   */
  function setBgColor(color: string) {
    bgColor.value = color
  }
  
  /**
   * 设置背景透明度
   */
  function setBgOpacity(value: number) {
    bgOpacity.value = Math.max(0, Math.min(100, value))
  }
  
  /**
   * 设置背景图片
   */
  function setBgImage(url: string) {
    bgImageUrl.value = url
    // 自动切换到图片模式
    bgType.value = 'image'
  }
  
  /**
   * 清除背景图片
   */
  function clearBgImage() {
    bgImageUrl.value = undefined
    // 切换回纯色模式
    bgType.value = 'color'
  }
  
  /**
   * 设置背景图片透明度
   */
  function setBgImageOpacity(value: number) {
    bgImageEffects.value.opacity = Math.max(0, Math.min(100, value))
  }
  
  /**
   * 设置背景图片模糊
   */
  function setBgImageBlur(value: number) {
    bgImageEffects.value.blur = Math.max(0, Math.min(20, value))
  }
  
  /**
   * 设置背景图片亮度
   */
  function setBgImageBrightness(value: number) {
    bgImageEffects.value.brightness = Math.max(0, Math.min(200, value))
  }
  
  /**
   * 设置背景图片对比度
   */
  function setBgImageContrast(value: number) {
    bgImageEffects.value.contrast = Math.max(0, Math.min(200, value))
  }
  
  // ============================================================================
  // 透明度操作
  // ============================================================================
  
  /**
   * 设置全局透明度
   */
  function setGlobalOpacity(value: number) {
    globalOpacity.value = Math.max(0, Math.min(100, value))
  }
  
  /**
   * 设置图片透明度
   */
  function setImageOpacity(value: number) {
    imageOpacity.value = Math.max(0, Math.min(100, value))
  }
  
  // ============================================================================
  // 导出配置
  // ============================================================================
  
  /**
   * 设置导出格式
   */
  function setExportFormat(format: 'png' | 'jpeg' | 'webp') {
    exportFormat.value = format
  }
  
  /**
   * 设置画布缩放比例
   */
  function setCanvasScale(scale: number) {
    canvasScale.value = Math.max(0.1, Math.min(2, scale))
  }
  
  /**
   * 放大画布（+10%）
   */
  function zoomIn() {
    autoFit.value = false
    const newScale = Math.min(2, canvasScale.value + 0.1)
    setCanvasScale(newScale)
  }
  
  /**
   * 缩小画布（-10%）
   */
  function zoomOut() {
    autoFit.value = false
    const newScale = Math.max(0.1, canvasScale.value - 0.1)
    setCanvasScale(newScale)
  }
  
  /**
   * 重置缩放到100%
   */
  function resetZoom() {
    autoFit.value = false
    setCanvasScale(1)
  }
  
  /**
   * 适应窗口（触发自动计算）
   */
  function fitToView() {
    autoFit.value = true
    // calculateScale 会在 CanvasRenderer 组件中自动触发
  }
  
  /**
   * 切换自动适配模式
   */
  function toggleAutoFit() {
    autoFit.value = !autoFit.value
  }
  
  // ============================================================================
  // 语言切换
  // ============================================================================
  
  /**
   * 设置语言
   */
  function setLocale(newLocale: Locale) {
    locale.value = newLocale
    i18n.global.locale.value = newLocale
    saveLocale(newLocale)
  }
  
  // ============================================================================
  // 长图模式操作
  // ============================================================================
  
  /**
   * 启用/禁用长图模式
   */
  function toggleLongImageMode(enabled?: boolean) {
    longImageMode.value = enabled !== undefined ? enabled : !longImageMode.value
    
    // 启用长图模式时，自动设置为自动尺寸模式
    if (longImageMode.value) {
      sizeCalculationMode.value = 'auto'
      updateCanvasSizeForLongImage()
    }
  }
  
  /**
   * 设置长图方向
   */
  function setLongImageDirection(direction: LongImageDirection) {
    longImageDirection.value = direction
    
    // 更新画布尺寸
    if (longImageMode.value) {
      updateCanvasSizeForLongImage()
    }
  }
  
  /**
   * 设置尺寸计算模式
   */
  function setSizeCalculationMode(mode: SizeCalculationMode) {
    sizeCalculationMode.value = mode
    
    // 更新画布尺寸
    if (longImageMode.value && mode !== 'preset') {
      updateCanvasSizeForLongImage()
    }
  }
  
  /**
   * 设置固定宽度
   */
  function setFixedWidth(width: number) {
    fixedWidth.value = Math.max(100, Math.min(4096, width))
    
    // 更新画布尺寸
    if (longImageMode.value && sizeCalculationMode.value === 'fixed-width') {
      updateCanvasSizeForLongImage()
    }
  }
  
  /**
   * 设置固定高度
   */
  function setFixedHeight(height: number) {
    fixedHeight.value = Math.max(100, Math.min(4096, height))
    
    // 更新画布尺寸
    if (longImageMode.value && sizeCalculationMode.value === 'fixed-height') {
      updateCanvasSizeForLongImage()
    }
  }
  
  /**
   * 更新长图模式下的画布尺寸
   */
  function updateCanvasSizeForLongImage() {
    if (!longImageMode.value) return
    
    const validImages = images.value.filter(img => img && img !== null)
    if (validImages.length === 0) return
    
    // 根据计算模式更新画布尺寸
    if (sizeCalculationMode.value === 'preset') {
      // 预设模式不自动计算
      return
    }
    
    const newSize = CanvasSizeCalculator.calculate(validImages, {
      mode: sizeCalculationMode.value,
      direction: longImageDirection.value,
      fixedWidth: fixedWidth.value,
      fixedHeight: fixedHeight.value,
      spacing: spacing.value,
      padding: padding.value
    })
    
    setCanvasSize(newSize.width, newSize.height)
  }
  
  /**
   * 快速启用竖向长图模式
   */
  function enableVerticalLongImage() {
    longImageMode.value = true
    longImageDirection.value = 'vertical'
    sizeCalculationMode.value = 'fixed-width'
    fixedWidth.value = 1080
    spacing.value = 0
    updateCanvasSizeForLongImage()
  }
  
  /**
   * 快速启用横向长图模式
   */
  function enableHorizontalLongImage() {
    longImageMode.value = true
    longImageDirection.value = 'horizontal'
    sizeCalculationMode.value = 'fixed-height'
    fixedHeight.value = 1080
    spacing.value = 0
    updateCanvasSizeForLongImage()
  }
  
  /**
   * 应用场景预设
   */
  function applyPreset(presetId: string) {
    const preset = getPresetById(presetId)
    if (!preset) {
      console.warn(`预设不存在: ${presetId}`)
      return
    }
    
    // 启用长图模式
    longImageMode.value = true
    
    // 应用预设配置
    longImageDirection.value = preset.direction
    sizeCalculationMode.value = preset.sizeMode
    spacing.value = preset.spacing
    padding.value = preset.padding
    radius.value = preset.radius
    
    // 应用固定宽度/高度
    if (preset.fixedWidth) {
      fixedWidth.value = preset.fixedWidth
    }
    if (preset.fixedHeight) {
      fixedHeight.value = preset.fixedHeight
    }
    
    // 应用背景颜色
    if (preset.bgColor) {
      bgColor.value = preset.bgColor
    }
    
    // 应用推荐尺寸（如果有）
    if (preset.recommendedSize && preset.sizeMode === 'preset') {
      setCanvasSize(preset.recommendedSize.width, preset.recommendedSize.height)
    } else {
      // 自动计算尺寸
      updateCanvasSizeForLongImage()
    }
  }
  
  // ============================================================================
  // 图片操作
  // ============================================================================
  
  /**
   * 添加图片
   */
  function addImage(image: ImageElement) {
    images.value.push(image)
  }
  
  /**
   * 添加多张图片
   */
  function addImages(newImages: ImageElement[]) {
    images.value.push(...newImages)
  }
  
  /**
   * 在指定位置插入图片
   * 修复：确保在空数组或索引超出范围时正确插入到目标位置
   * 
   * 关键修复：不清理undefined，保持稀疏数组结构，确保位置映射正确
   */
  function insertImagesAt(index: number, newImages: ImageElement[]) {
    // 扩展数组到目标索引（使用null占位，保持位置映射）
    while (images.value.length <= index) {
      images.value.push(null as any)
    }
    
    // 在目标位置设置图片
    newImages.forEach((img, offset) => {
      const targetIndex = index + offset
      img.index = targetIndex
      
      // 如果目标位置为空（null/undefined），直接设置
      if (!images.value[targetIndex]) {
        images.value[targetIndex] = img
      } else {
        // 目标位置已有图片，插入到该位置
        images.value.splice(targetIndex, 0, img)
        // 重新索引所有后续图片
        for (let i = targetIndex; i < images.value.length; i++) {
          if (images.value[i] && images.value[i] !== null) {
            images.value[i].index = i
          }
        }
      }
    })
  }
  
  /**
   * 删除图片
   */
  function removeImage(id: string) {
    const index = images.value.findIndex(img => img && img !== null && img.id === id)
    if (index !== -1) {
      // 设置为null而不是删除，保持位置映射
      images.value[index] = null as any
    }
  }
  
  /**
   * 清空所有图片
   */
  function clearImages() {
    images.value = []
  }
  
  /**
   * 重新排序图片
   */
  function reorderImages(newOrder: ImageElement[]) {
    images.value = newOrder.map((img, index) => ({
      ...img,
      index
    }))
  }
  
  /**
   * 交换两个位置的图片
   */
  function swapImages(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    if (fromIndex < 0 || toIndex < 0) return
    if (fromIndex >= images.value.length || toIndex >= images.value.length) return
    
    const fromImage = images.value[fromIndex]
    const toImage = images.value[toIndex]
    
    // 交换位置
    images.value[fromIndex] = toImage
    images.value[toIndex] = fromImage
    
    // 更新索引
    if (fromImage && fromImage !== null) {
      fromImage.index = toIndex
    }
    if (toImage && toImage !== null) {
      toImage.index = fromIndex
    }
  }
  
  /**
   * 移动图片到新位置（目标位置为空）
   */
  function moveImage(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    if (fromIndex < 0 || toIndex < 0) return
    
    const image = images.value[fromIndex]
    if (!image || image === null) return
    
    // 确保数组足够大
    while (images.value.length <= toIndex) {
      images.value.push(null as any)
    }
    
    // 移动图片
    images.value[fromIndex] = null as any
    images.value[toIndex] = image
    
    // 更新索引
    image.index = toIndex
  }
  
  /**
   * 水平翻转图片
   */
  function flipImageHorizontal(id: string) {
    const image = images.value.find(img => img && img !== null && img.id === id)
    if (image) {
      image.transform.flipH = !image.transform.flipH
    }
  }
  
  /**
   * 垂直翻转图片
   */
  function flipImageVertical(id: string) {
    const image = images.value.find(img => img && img !== null && img.id === id)
    if (image) {
      image.transform.flipV = !image.transform.flipV
    }
  }
  
  /**
   * 旋转图片（顺时针90度）
   */
  function rotateImage(id: string) {
    const image = images.value.find(img => img && img !== null && img.id === id)
    if (image) {
      image.transform.rotation = ((image.transform.rotation + 90) % 360) as 0 | 90 | 180 | 270
    }
  }
  
  // ============================================================================
  // 文字操作
  // ============================================================================
  
  /**
   * 添加文字
   */
  function addText(text: TextElement) {
    texts.value.push(text)
  }
  
  /**
   * 更新文字
   */
  function updateText(id: string, updates: Partial<TextElement>) {
    const index = texts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      texts.value[index] = {
        ...texts.value[index],
        ...updates
      }
    }
  }
  
  /**
   * 删除文字
   */
  function removeText(id: string) {
    const index = texts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      texts.value.splice(index, 1)
    }
  }
  
  /**
   * 清空所有文字
   */
  function clearTexts() {
    texts.value = []
  }
  
  /**
   * 选中文字
   */
  function selectText(id: string) {
    texts.value.forEach(t => {
      t.selected = t.id === id
    })
  }
  
  /**
   * 取消选中所有文字
   */
  function deselectAllTexts() {
    texts.value.forEach(t => {
      t.selected = false
    })
  }
  
  // ============================================================================
  // 状态管理
  // ============================================================================
  
  /**
   * 重置为初始状态
   */
  function reset() {
    layoutType.value = 'grid-2x1-h'
    spacing.value = 10
    padding.value = 0
    radius.value = 0
    bgType.value = 'color'
    bgColor.value = '#ffffff'
    bgOpacity.value = 100
    bgImageUrl.value = undefined
    bgImageEffects.value = { ...DEFAULT_BACKGROUND_IMAGE_EFFECTS }
    globalOpacity.value = 100
    imageOpacity.value = 100
    canvasWidth.value = 800
    canvasHeight.value = 800
    images.value = []
    texts.value = []
  }
  
  /**
   * 从状态快照恢复（用于撤销/重做）
   */
  function restoreState(state: CanvasState) {
    layoutType.value = state.layout.type
    spacing.value = state.layout.spacing
    padding.value = state.layout.padding
    radius.value = state.layout.radius
    bgType.value = state.background.type
    bgColor.value = state.background.color
    bgOpacity.value = state.background.opacity
    bgImageUrl.value = state.background.image?.url
    bgImageEffects.value = state.background.image?.effects 
      ? { ...state.background.image.effects } 
      : { ...DEFAULT_BACKGROUND_IMAGE_EFFECTS }
    globalOpacity.value = state.opacity.global
    imageOpacity.value = state.opacity.image
    canvasWidth.value = state.canvasSize.width
    canvasHeight.value = state.canvasSize.height
    images.value = [...state.images]
    texts.value = [...state.texts]
  }
  
  /**
   * 撤销
   */
  function undo() {
    const state = historyManager.undo()
    if (state) {
      restoreState(state)
      toast.info('已撤销')
    }
  }
  
  /**
   * 重做
   */
  function redo() {
    const state = historyManager.redo()
    if (state) {
      restoreState(state)
      toast.info('已重做')
    }
  }
  
  // ============================================================================
  // 监听器
  // ============================================================================
  
  /**
   * 监听图片变化，在长图模式下自动更新画布尺寸
   */
  watch(
    () => images.value.length,
    () => {
      if (longImageMode.value && sizeCalculationMode.value !== 'preset') {
        updateCanvasSizeForLongImage()
      }
    }
  )
  
  /**
   * 监听状态变化，记录历史
   */
  watch(
    currentState,
    (newState) => {
      historyManager.push(newState)
    },
    { deep: true }
  )
  
  // 记录初始状态
  historyManager.push(currentState.value)
  
  // ============================================================================
  // 返回Store API
  // ============================================================================
  
  return {
    // 状态
    locale,
    layoutType,
    spacing,
    padding,
    radius,
    bgType,
    bgColor,
    bgOpacity,
    bgImageUrl,
    bgImageEffects,
    globalOpacity,
    imageOpacity,
    canvasWidth,
    canvasHeight,
    images,
    texts,
    exportFormat,
    canvasScale,
    autoFit,
    longImageMode,
    longImageDirection,
    sizeCalculationMode,
    fixedWidth,
    fixedHeight,
    
    // 计算属性
    layoutConfig,
    canvasSize,
    backgroundConfig,
    opacityConfig,
    currentState,
    layoutCellCount,
    hasImages,
    hasTexts,
    canvasScalePercent,
    canUndo,
    canRedo,
    
    // 方法
    setLocale,
    setLayoutType,
    setSpacing,
    setPadding,
    setRadius,
    setCanvasSize,
    usePresetSize,
    setBgType,
    setBgColor,
    setBgOpacity,
    setBgImage,
    clearBgImage,
    setBgImageOpacity,
    setBgImageBlur,
    setBgImageBrightness,
    setBgImageContrast,
    setGlobalOpacity,
    setImageOpacity,
    setExportFormat,
    setCanvasScale,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToView,
    toggleAutoFit,
    toggleLongImageMode,
    setLongImageDirection,
    setSizeCalculationMode,
    setFixedWidth,
    setFixedHeight,
    updateCanvasSizeForLongImage,
    enableVerticalLongImage,
    enableHorizontalLongImage,
    applyPreset,
    addImage,
    addImages,
    insertImagesAt,
    removeImage,
    clearImages,
    reorderImages,
    swapImages,
    moveImage,
    flipImageHorizontal,
    flipImageVertical,
    rotateImage,
    addText,
    updateText,
    removeText,
    clearTexts,
    selectText,
    deselectAllTexts,
    reset,
    restoreState,
    undo,
    redo
  }
})

