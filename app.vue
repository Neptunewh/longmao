<script setup lang="ts">
import { useTheme } from 'vuetify'

const route = useRoute()
const theme = useTheme()
const isDark = ref(theme.global.current.value.dark)

const toggleTheme = () => {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light'
}

useHead({
  title: '龙猫乐园',
  meta: [
    { name: 'theme-color', content: isDark.value ? '#000000' : '#ffffff' },
  ],
})

const navItems = [
  { value: '/', icon: 'mdi-home-outline', activeIcon: 'mdi-home', label: '首页' },
  { value: '/scanned', icon: 'mdi-run', activeIcon: 'mdi-run', label: '跑步' },
  { value: '/morningsign', icon: 'mdi-alarm-outline', activeIcon: 'mdi-alarm-check', label: '签到' },
  { value: '/records', icon: 'mdi-format-list-bulleted', activeIcon: 'mdi-format-list-bulleted', label: '记录' },
]

const currentNav = computed({
  get: () => {
    const path = route.path
    if (path === '/') return '/'
    if (path.startsWith('/scanned') || path.startsWith('/run') || path.startsWith('/freerun')) return '/scanned'
    if (path.startsWith('/morningsign')) return '/morningsign'
    if (path.startsWith('/records')) return '/records'
    return '/'
  },
  set: (val: string) => {
    navigateTo(val)
  },
})
</script>
<script lang="ts">
window.global = window
</script>

<template>
  <VApp :class="{ 'dark-mode': isDark }">
    <!-- 顶部导航栏 - 毛玻璃效果 -->
    <header class="top-bar">
      <div class="top-bar-inner">
        <div class="top-bar-left">
          <span class="top-bar-title">龙猫乐园</span>
        </div>
        <div class="top-bar-right">
          <button class="icon-btn" @click="toggleTheme">
            <VIcon :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'" size="20" />
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <div class="page-wrapper">
        <NuxtPage />
      </div>
    </main>

    <!-- 底部导航栏 -->
    <nav class="bottom-nav">
      <div class="bottom-nav-inner">
        <button
          v-for="item in navItems"
          :key="item.value"
          class="nav-item"
          :class="{ active: currentNav === item.value }"
          @click="currentNav = item.value"
        >
          <VIcon
            :icon="currentNav === item.value ? item.activeIcon : item.icon"
            size="22"
          />
          <span class="nav-label">{{ item.label }}</span>
          <div v-if="currentNav === item.value" class="nav-indicator" />
        </button>
      </div>
    </nav>
  </VApp>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
    'Helvetica Neue', 'PingFang SC', 'Noto Sans CJK SC', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f5f5f7;
  color: #1d1d1f;
  transition: background 0.3s ease, color 0.3s ease;
}

.dark-mode body,
.v-app.dark-mode {
  background: #000000;
  color: #f5f5f7;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}
.dark-mode ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}
</style>

<style scoped>
/* 顶部导航栏 */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  background: rgba(255, 255, 255, 0.72);
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
}

.dark-mode .top-bar {
  background: rgba(28, 28, 30, 0.72);
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.top-bar-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-bar-title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.dark-mode .icon-btn {
  background: rgba(255, 255, 255, 0.08);
}

.dark-mode .icon-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* 主内容区 */
.main-content {
  padding-top: 56px;
  padding-bottom: 84px;
  min-height: 100vh;
}

.page-wrapper {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px;
}

/* 底部导航栏 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  background: rgba(255, 255, 255, 0.72);
  border-top: 0.5px solid rgba(0, 0, 0, 0.08);
}

.dark-mode .bottom-nav {
  background: rgba(28, 28, 30, 0.72);
  border-top-color: rgba(255, 255, 255, 0.08);
}

.bottom-nav-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  padding: 8px 0 env(safe-area-inset-bottom, 8px);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 0;
  border: none;
  background: transparent;
  color: #86868b;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
}

.nav-item.active {
  color: #007aff;
}

.dark-mode .nav-item.active {
  color: #0a84ff;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1px;
}

.nav-indicator {
  position: absolute;
  bottom: 2px;
  width: 20px;
  height: 3px;
  border-radius: 2px;
  background: currentColor;
  animation: indicator-in 0.25s ease;
}

@keyframes indicator-in {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 20px;
    opacity: 1;
  }
}

/* 移除 Vuetify 默认样式 */
:deep(.v-application) {
  background: transparent !important;
}

:deep(.v-main) {
  padding: 0 !important;
}
</style>
