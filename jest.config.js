export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts'],
  
  // 转换配置 - 新的ts-jest配置方式
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true
    }],
    '^.+\\.vue$': '@vue/vue3-jest'
  },
  
  // Vue 全局配置
  globals: {
    'vue-jest': {
      tsConfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }
  },
  
  // 测试文件匹配模式
  testMatch: [
    '**/tests/unit/**/*.test.ts',
    '**/tests/integration/**/*.test.ts',
    '**/tests/unit/components/**/*.test.ts'
  ],
  
  // 模块路径映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/core/(.*)$': '<rootDir>/src/core/$1',
    '^vue-i18n$': '<rootDir>/tests/__mocks__/vue-i18n.ts'
  },
  
  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'js', 'json', 'vue'],
  
  // 覆盖率配置 - 专注核心算法
  collectCoverageFrom: [
    'src/core/**/*.ts',
    'src/layout/**/*.ts',
    'src/store/**/*.ts',
    'src/history/**/*.ts',
    'src/rendering/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  
  // 覆盖率阈值 - Linus标准：实用不完美
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 80,
      statements: 80
    }
  },
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // 忽略文件
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ]
}
