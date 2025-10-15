/**
 * 响应式布局系统
 * 提供屏幕尺寸检测和响应式状态管理
 */

import { ref, onMounted, onUnmounted, computed } from 'vue'

/** 断点 */
export const BREAKPOINTS = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  '2xl': 1600
} as const

/** 屏幕宽度 */
const screenWidth = ref(0)

/** 屏幕高度 */
const screenHeight = ref(0)

/** 更新屏幕尺寸 */
function updateScreenSize() {
  screenWidth.value = window.innerWidth
  screenHeight.value = window.innerHeight
}

/** 是否为移动端 */
const isMobile = computed(() => screenWidth.value < BREAKPOINTS.md)

/** 是否为平板 */
const isTablet = computed(() => 
  screenWidth.value >= BREAKPOINTS.md && screenWidth.value < BREAKPOINTS.lg
)

/** 是否为桌面端 */
const isDesktop = computed(() => screenWidth.value >= BREAKPOINTS.lg)

/** 是否为小屏幕 */
const isSmallScreen = computed(() => screenWidth.value < BREAKPOINTS.lg)

/** 是否为大屏幕 */
const isLargeScreen = computed(() => screenWidth.value >= BREAKPOINTS.xl)

/**
 * useResponsive组合式函数
 */
export function useResponsive() {
  onMounted(() => {
    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize)
  })

  return {
    screenWidth,
    screenHeight,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isLargeScreen
  }
}

/**
 * 侧边栏折叠状态管理
 */
const sidebarCollapsed = ref(false)

/**
 * useSidebar组合式函数
 */
export function useSidebar() {
  const { isSmallScreen } = useResponsive()

  /** 切换侧边栏 */
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  /** 根据屏幕尺寸自动调整 */
  function autoAdjust() {
    if (isSmallScreen.value) {
      sidebarCollapsed.value = true
    }
  }

  onMounted(() => {
    autoAdjust()
  })

  return {
    sidebarCollapsed,
    toggleSidebar,
    autoAdjust
  }
}

