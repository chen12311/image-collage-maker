/**
 * 简体中文语言包
 */
export default {
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    clear: '清空',
    upload: '上传',
    add: '添加',
    remove: '删除',
    reset: '重置',
    // 通用组件
    selectPlaceholder: '请选择',
    searchPlaceholder: '搜索...',
    bgImageAlt: '背景图片'
  },
  
  app: {
    title: '图片批量拼接工具',
    toggleSidebar: '切换侧边栏'
  },
  
  sidebar: {
    tabs: {
      layout: '布局',
      image: '图片',
      text: '文字',
      background: '背景',
      settings: '设置'
    },
    
    layout: {
      title: '布局',
      layoutParams: '布局参数',
      spacing: '间距',
      padding: '边距',
      radius: '圆角',
      selectLayout: '选择布局'
    },
    
    image: {
      title: '上传图片',
      upload: '上传图片',
      clickOrDrag: '点击或拖拽图片到此处',
      releaseToUpload: '松开鼠标上传',
      supportedFormats: '支持 JPG、PNG、GIF 等格式',
      uploaded: '已上传 {count} 张',
      clear: '清空',
      noImages: '还没有上传图片'
    },
    
    text: {
      title: '添加文字',
      content: '文字内容',
      placeholder: '输入要添加到画布的文字...',
      fontSize: '字体大小',
      fontFamily: '字体',
      customFont: '自定义字体',
      customFontPlaceholder: '输入字体名称（如：思源黑体）',
      color: '文字颜色',
      addButton: '添加文字',
      added: '已添加 {count} 个',
      clear: '清空'
    },
    
    background: {
      title: '背景设置',
      solidColor: '纯色',
      image: '图片',
      bgColor: '背景颜色',
      bgOpacity: '背景透明度',
      quickPresets: '快捷预设',
      pureWhite: '纯白',
      lightGray: '浅灰',
      transparent: '透明',
      dark: '深色',
      clickOrDragImage: '点击或拖拽图片',
      releaseToUpload: '松开上传',
      supportedImageFormats: '支持 JPG、PNG、GIF',
      bgImage: '背景图片',
      opacity: '透明度',
      blur: '模糊',
      brightness: '亮度',
      contrast: '对比度'
    },
    
    settings: {
      title: '设置',
      opacitySection: '透明度',
      globalOpacity: '整体透明度',
      imageOpacity: '图片透明度',
      resetAll: '重置所有设置'
    }
  },
  
  canvas: {
    canvasSize: '画布尺寸',
    customWidth: '宽',
    customHeight: '高',
    zoom: '缩放',
    zoomIn: '放大',
    zoomOut: '缩小',
    fitToView: '适应窗口',
    autoFit: '自动适配',
    resetZoom: '重置缩放',
    undo: '撤销',
    redo: '重做',
    export: '导出图片',
    noImages: '请先上传图片',
    canvasNotInitialized: '画布未初始化',
    exportSuccess: '导出成功',
    preset1080x1080: '1080 × 1080 (正方形)',
    preset1080x1920: '1080 × 1920 (竖屏)',
    preset1920x1080: '1920 × 1080 (横屏)',
    presetCustom: '自定义',
    // 导出相关
    exportFormatLabel: '导出格式:',
    exportButton: '导出图片',
    fileNamePrefix: '拼接图片',
    exportSuccessFormat: '图片已导出为 {format} 格式！',
    exportError: '图片导出失败，请重试',
    // 拖拽上传相关
    uploadSuccess: '成功添加 {count} 张图片',
    uploadError: '部分图片加载失败，请重试',
    dragImageFiles: '请拖拽图片文件',
    // 空白位置提示
    emptySlotPosition: '位置 {position}',
    emptySlotHint: '点击上传图片'
  },
  
  interaction: {
    // 图片操作
    imageFlippedH: '图片已水平翻转',
    imageFlippedV: '图片已垂直翻转',
    imageRotated: '图片已旋转 90°',
    imageDeleted: '已删除 {fileName}',
    imagesMoved: '图片位置已交换',
    imageMoved: '图片已移动',
    // 图片控制按钮提示
    flipHorizontalTooltip: '水平翻转',
    flipVerticalTooltip: '垂直翻转',
    rotateTooltip: '旋转 90°',
    deleteTooltip: '删除图片',
    // 点击上传
    clickOrDragAdd: '点击或拖拽添加图片',
    releaseToUpload: '松开鼠标上传',
    pleaseSelectImage: '请选择图片文件',
    // 插入图片
    insertedAt: '已在位置 {position} 插入 {count} 张图片',
    addedImages: '成功上传 {count} 张图片',
    addSuccess: '成功添加 {count} 张图片',
    addError: '部分图片加载失败，请重试',
    dragImagesOnly: '请拖拽图片文件'
  },
  
  fonts: {
    // 字体选择
    detectingFonts: '检测字体中...',
    selectFont: '选择字体',
    recommended: '（推荐）',
    // 中文字体
    pingfangSC: '苹方',
    pingfangHK: '苹方 HK',
    pingfangTC: '苹方 TC',
    microsoftYahei: '微软雅黑',
    microsoftJhengHei: '微软正黑体',
    simhei: '黑体',
    simsun: '宋体',
    nsimsun: '新宋体',
    kaiti: '楷体',
    fangsong: '仿宋',
    stheiti: '华文黑体',
    stsong: '华文宋体',
    stkaiti: '华文楷体',
    // 英文无衬线字体
    arial: 'Arial',
    helvetica: 'Helvetica',
    helveticaNeue: 'Helvetica Neue',
    verdana: 'Verdana',
    tahoma: 'Tahoma',
    trebuchetMS: 'Trebuchet MS',
    segoeUI: 'Segoe UI',
    // 英文衬线字体
    timesNewRoman: 'Times New Roman',
    georgia: 'Georgia',
    palatino: 'Palatino',
    garamond: 'Garamond',
    // 等宽字体
    courierNew: 'Courier New',
    consolas: 'Consolas',
    monaco: 'Monaco',
    // 艺术/创意字体
    comicSansMS: 'Comic Sans MS',
    impact: 'Impact',
    brushScriptMT: 'Brush Script MT'
  },
  
  shortcuts: {
    title: '快捷键帮助',
    help: '帮助',
    commonOps: '常用操作',
    undo: '撤销',
    redo: '重做',
    export: '导出图片',
    deleteSelected: '删除选中',
    viewControl: '视图控制',
    toggleSidebar: '切换侧边栏',
    zoomControl: '缩放控制',
    zoomIn: '放大画布',
    zoomOut: '缩小画布',
    resetZoom: '重置缩放',
    showHelp: '显示/隐藏帮助'
  },
  
  toast: {
    // 图片相关
    pleaseSelectImage: '请选择图片文件',
    filteredNonImages: '已过滤掉 {count} 个非图片文件',
    uploadSuccess: '成功上传 {count} 张图片',
    uploadError: '部分图片加载失败，请重试',
    imageRemoved: '已删除图片',
    allImagesCleared: '已清空所有图片',
    
    // 文字相关
    pleaseInputText: '请输入文字内容',
    textAdded: '文字已添加',
    textRemoved: '已删除文字',
    allTextsCleared: '已清空所有文字',
    fontNotAvailable: '字体 "{font}" 在您的系统中不可用，请检查字体名称或安装该字体',
    fontApplied: '字体已应用',
    pleaseApplyFontFirst: '请先应用自定义字体或清空字体输入框',
    invalidFontCantAdd: '字体 "{font}" 不可用，无法添加文字。已清空字体输入框，请使用默认字体或选择其他字体',
    
    // 背景相关
    bgImageUploaded: '背景图片已上传',
    bgImageReadError: '图片读取失败',
    bgImageProcessError: '图片处理失败，请重试',
    bgImageCleared: '已清除背景图片',
    
    // 系统操作
    undone: '已撤销',
    redone: '已重做',
    allReset: '已重置所有设置'
  },
  
  confirm: {
    clearAllImages: '确定要清空所有图片吗？',
    clearAllTexts: '确定要清空所有文字吗？',
    resetAll: '确定要重置所有设置吗？这将清空所有内容。'
  },
  
  language: {
    name: '简体中文',
    switch: '切换语言'
  }
}

