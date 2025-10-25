/**
 * English Language Pack
 */
export default {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    clear: 'Clear',
    upload: 'Upload',
    add: 'Add',
    remove: 'Remove',
    reset: 'Reset'
  },
  
  app: {
    title: 'Image Batch Stitcher',
    toggleSidebar: 'Toggle Sidebar'
  },
  
  sidebar: {
    tabs: {
      layout: 'Layout',
      image: 'Images',
      text: 'Text',
      background: 'Background',
      settings: 'Settings'
    },
    
    layout: {
      title: 'Layout',
      layoutParams: 'Layout Parameters',
      spacing: 'Spacing',
      padding: 'Padding',
      radius: 'Radius',
      selectLayout: 'Select Layout'
    },
    
    image: {
      title: 'Upload Images',
      upload: 'Upload Images',
      clickOrDrag: 'Click or drag images here',
      releaseToUpload: 'Release to upload',
      supportedFormats: 'Supports JPG, PNG, GIF, etc.',
      uploaded: '{count} images uploaded',
      clear: 'Clear',
      noImages: 'No images uploaded yet'
    },
    
    text: {
      title: 'Add Text',
      content: 'Text Content',
      placeholder: 'Enter text to add to canvas...',
      fontSize: 'Font Size',
      fontFamily: 'Font Family',
      customFont: 'Custom Font',
      customFontPlaceholder: 'Enter font name (e.g., Noto Sans)',
      color: 'Text Color',
      addButton: 'Add Text',
      added: '{count} texts added',
      clear: 'Clear'
    },
    
    background: {
      title: 'Background Settings',
      solidColor: 'Solid',
      image: 'Image',
      bgColor: 'Background Color',
      bgOpacity: 'Background Opacity',
      quickPresets: 'Quick Presets',
      pureWhite: 'Pure White',
      lightGray: 'Light Gray',
      transparent: 'Transparent',
      dark: 'Dark',
      clickOrDragImage: 'Click or drag image',
      releaseToUpload: 'Release to upload',
      supportedImageFormats: 'Supports JPG, PNG, GIF',
      bgImage: 'Background Image',
      opacity: 'Opacity',
      blur: 'Blur',
      brightness: 'Brightness',
      contrast: 'Contrast'
    },
    
    settings: {
      title: 'Settings',
      opacitySection: 'Opacity',
      globalOpacity: 'Global Opacity',
      imageOpacity: 'Image Opacity',
      resetAll: 'Reset All Settings'
    }
  },
  
  canvas: {
    canvasSize: 'Canvas Size',
    customWidth: 'Width',
    customHeight: 'Height',
    zoom: 'Zoom',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    fitToView: 'Fit to View',
    autoFit: 'Auto Fit',
    resetZoom: 'Reset Zoom',
    undo: 'Undo',
    redo: 'Redo',
    export: 'Export Image',
    noImages: 'Please upload images first',
    canvasNotInitialized: 'Canvas not initialized',
    exportSuccess: 'Export successful',
    preset1080x1080: '1080 × 1080 (Square)',
    preset1080x1920: '1080 × 1920 (Portrait)',
    preset1920x1080: '1920 × 1080 (Landscape)',
    presetCustom: 'Custom'
  },
  
  shortcuts: {
    title: 'Keyboard Shortcuts',
    help: 'Help',
    commonOps: 'Common Operations',
    undo: 'Undo',
    redo: 'Redo',
    export: 'Export Image',
    deleteSelected: 'Delete Selected',
    viewControl: 'View Control',
    toggleSidebar: 'Toggle Sidebar',
    zoomControl: 'Zoom Control',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    resetZoom: 'Reset Zoom',
    showHelp: 'Show/Hide Help'
  },
  
  toast: {
    // Image related
    pleaseSelectImage: 'Please select image files',
    filteredNonImages: 'Filtered out {count} non-image files',
    uploadSuccess: 'Successfully uploaded {count} images',
    uploadError: 'Some images failed to load, please retry',
    imageRemoved: 'Image removed',
    allImagesCleared: 'All images cleared',
    
    // Text related
    pleaseInputText: 'Please enter text content',
    textAdded: 'Text added',
    textRemoved: 'Text removed',
    allTextsCleared: 'All texts cleared',
    fontNotAvailable: 'Font "{font}" is not available on your system. Please check the font name or install it',
    fontApplied: 'Font applied',
    pleaseApplyFontFirst: 'Please apply the custom font first or clear the font input',
    invalidFontCantAdd: 'Font "{font}" is not available, cannot add text. Font input cleared, please use default font or select another',
    
    // Background related
    bgImageUploaded: 'Background image uploaded',
    bgImageReadError: 'Image read failed',
    bgImageProcessError: 'Image processing failed, please retry',
    bgImageCleared: 'Background image cleared',
    
    // System operations
    undone: 'Undone',
    redone: 'Redone',
    allReset: 'All settings reset'
  },
  
  confirm: {
    clearAllImages: 'Are you sure you want to clear all images?',
    clearAllTexts: 'Are you sure you want to clear all texts?',
    resetAll: 'Are you sure you want to reset all settings? This will clear all content.'
  },
  
  language: {
    name: 'English',
    switch: 'Switch Language'
  }
}

