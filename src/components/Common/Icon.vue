<template>
  <svg
    :class="['icon', sizeClass]"
    :style="{ color: color }"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <component :is="iconComponent" />
  </svg>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'

/** 图标属性 */
interface Props {
  /** 图标名称 */
  name: string
  /** 尺寸 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** 颜色 */
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'currentColor'
})

/** 尺寸类名 */
const sizeClass = computed(() => `icon-${props.size}`)

/** 图标组件映射 */
const iconComponents: Record<string, any> = {
  layout: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }),
      h('line', { x1: '3', y1: '12', x2: '21', y2: '12' }),
      h('line', { x1: '12', y1: '3', x2: '12', y2: '21' })
    ])
  }),
  
  image: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
      h('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
      h('polyline', { points: '21 15 16 10 5 21' })
    ])
  }),
  
  text: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('polyline', { points: '4 7 4 4 20 4 20 7' }),
      h('line', { x1: '9', y1: '20', x2: '15', y2: '20' }),
      h('line', { x1: '12', y1: '4', x2: '12', y2: '20' })
    ])
  }),
  
  background: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' })
    ])
  }),
  
  palette: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
      h('circle', { cx: '15.5', cy: '8.5', r: '1.5' }),
      h('circle', { cx: '12', cy: '15', r: '1.5' })
    ])
  }),
  
  undo: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('polyline', { points: '1 4 1 10 7 10' }),
      h('path', { d: 'M3.51 15a9 9 0 1 0 2.13-9.36L1 10' })
    ])
  }),
  
  redo: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('polyline', { points: '23 4 23 10 17 10' }),
      h('path', { d: 'M20.49 15a9 9 0 1 1-2.12-9.36L23 10' })
    ])
  }),
  
  download: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
      h('polyline', { points: '7 10 12 15 17 10' }),
      h('line', { x1: '12', y1: '15', x2: '12', y2: '3' })
    ])
  }),
  
  'chevron-left': defineComponent({
    render: () => h('polyline', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', points: '15 18 9 12 15 6' })
  }),
  
  'chevron-right': defineComponent({
    render: () => h('polyline', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', points: '9 18 15 12 9 6' })
  }),
  
  'chevron-down': defineComponent({
    render: () => h('polyline', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', points: '6 9 12 15 18 9' })
  }),
  
  'arrow-down': defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M12 5v14m0 0l-5-5m5 5l5-5' })
    ])
  }),
  
  'arrow-right': defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M5 12h14m0 0l-5-5m5 5l-5 5' })
    ])
  }),
  
  search: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('circle', { cx: '11', cy: '11', r: '8' }),
      h('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' })
    ])
  }),
  
  'zoom-in': defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('circle', { cx: '11', cy: '11', r: '8' }),
      h('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' }),
      h('line', { x1: '11', y1: '8', x2: '11', y2: '14' }),
      h('line', { x1: '8', y1: '11', x2: '14', y2: '11' })
    ])
  }),
  
  'zoom-out': defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('circle', { cx: '11', cy: '11', r: '8' }),
      h('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' }),
      h('line', { x1: '8', y1: '11', x2: '14', y2: '11' })
    ])
  }),
  
  close: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
      h('line', { x1: '6', y1: '6', x2: '18', y2: '18' })
    ])
  }),
  
  check: defineComponent({
    render: () => h('polyline', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', points: '20 6 9 17 4 12' })
  }),
  
  'alert-circle': defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('line', { x1: '12', y1: '8', x2: '12', y2: '12' }),
      h('line', { x1: '12', y1: '16', x2: '12.01', y2: '16' })
    ])
  }),
  
  info: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('line', { x1: '12', y1: '16', x2: '12', y2: '12' }),
      h('line', { x1: '12', y1: '8', x2: '12.01', y2: '8' })
    ])
  }),
  
  upload: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
      h('polyline', { points: '17 8 12 3 7 8' }),
      h('line', { x1: '12', y1: '3', x2: '12', y2: '15' })
    ])
  }),
  
  trash: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('polyline', { points: '3 6 5 6 21 6' }),
      h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })
    ])
  }),
  
  'menu': defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('line', { x1: '3', y1: '12', x2: '21', y2: '12' }),
      h('line', { x1: '3', y1: '6', x2: '21', y2: '6' }),
      h('line', { x1: '3', y1: '18', x2: '21', y2: '18' })
    ])
  }),
  
  settings: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('circle', { cx: '12', cy: '12', r: '3' }),
      h('path', { d: 'M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24' })
    ])
  }),
  
  grid: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('rect', { x: '3', y: '3', width: '7', height: '7' }),
      h('rect', { x: '14', y: '3', width: '7', height: '7' }),
      h('rect', { x: '14', y: '14', width: '7', height: '7' }),
      h('rect', { x: '3', y: '14', width: '7', height: '7' })
    ])
  }),
  
  globe: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('line', { x1: '2', y1: '12', x2: '22', y2: '12' }),
      h('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' })
    ])
  }),
  
  eye: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
      h('circle', { cx: '12', cy: '12', r: '3' })
    ])
  }),
  
  'eye-off': defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' }),
      h('line', { x1: '1', y1: '1', x2: '23', y2: '23' })
    ])
  }),
  
  help: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
      h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
    ])
  }),
  
  'flip-horizontal': defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M12 3v18' }),
      h('path', { d: 'M8 7L4 12l4 5' }),
      h('path', { d: 'M16 7l4 5-4 5' })
    ])
  }),
  
  'flip-vertical': defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M3 12h18' }),
      h('path', { d: 'M7 8l5-4 5 4' }),
      h('path', { d: 'M7 16l5 4 5-4' })
    ])
  }),
  
  'rotate-cw': defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('polyline', { points: '23 4 23 10 17 10' }),
      h('path', { d: 'M20.49 15a9 9 0 1 1-2.12-9.36L23 10' })
    ])
  }),
  
  minus: defineComponent({
    render: () => h('line', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', x1: '5', y1: '12', x2: '19', y2: '12' })
  }),
  
  plus: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
      h('line', { x1: '5', y1: '12', x2: '19', y2: '12' })
    ])
  }),
  
  maximize: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3' })
    ])
  }),
  
  fit: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('polyline', { points: '4 14 10 14 10 20' }),
      h('polyline', { points: '20 10 14 10 14 4' }),
      h('line', { x1: '14', y1: '10', x2: '21', y2: '3' }),
      h('line', { x1: '3', y1: '21', x2: '10', y2: '14' })
    ])
  }),
  
  lock: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('rect', { x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2' }),
      h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' })
    ])
  }),
  
  unlock: defineComponent({
    render: () => h('g', { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('rect', { x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2' }),
      h('path', { d: 'M7 11V7a5 5 0 0 1 9.9-1' })
    ])
  })
}

/** 获取图标组件 */
const iconComponent = computed(() => {
  return iconComponents[props.name] || iconComponents['help']
})
</script>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  transition: var(--transition-fast);
}

.icon-xs {
  width: 12px;
  height: 12px;
}

.icon-sm {
  width: 16px;
  height: 16px;
}

.icon-md {
  width: 20px;
  height: 20px;
}

.icon-lg {
  width: 24px;
  height: 24px;
}

.icon-xl {
  width: 32px;
  height: 32px;
}
</style>

