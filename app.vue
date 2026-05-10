<script setup lang="ts">
import { useTheme } from 'vuetify'

const appConfig = useAppConfig()
const route = useRoute()
const theme = useTheme()

const isDark = ref(theme.global.current.value.dark)

const toggleTheme = () => {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light'
}

useHead({
  title: '龙猫乐园',
})

const navItems = [
  { value: '/', icon: 'mdi-home', label: '首页' },
  { value: '/scanned', icon: 'mdi-run', label: '跑步' },
  { value: '/morningsign', icon: 'mdi-alarm-check', label: '签到' },
  { value: '/records', icon: 'mdi-format-list-bulleted', label: '记录' },
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
  <VApp>
    <VAppBar
      color="primary"
      elevation="0"
      class="app-bar-blur"
    >
      <template #prepend>
        <div class="d-flex align-center ga-2 ml-1">
          <VIcon icon="mdi-paw" size="28" />
        </div>
      </template>
      <VAppBarTitle class="font-weight-bold">
        龙猫乐园
      </VAppBarTitle>
      <template #append>
        <VBtn
          icon
          variant="text"
          size="small"
          @click="toggleTheme"
        >
          <VIcon :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'" />
        </VBtn>
        <VBtn
          icon
          variant="text"
          size="small"
          href="https://github.com/BeiyanYunyi/totoro-paradise"
          rel="noreferrer noopener"
          target="_blank"
        >
          <VIcon icon="mdi-github" />
        </VBtn>
      </template>
    </VAppBar>

    <VMain>
      <div class="page-container">
        <NuxtPage />
      </div>
    </VMain>

    <VBottomNavigation
      v-model="currentNav"
      color="primary"
      grow
    >
      <VBtn v-for="item in navItems" :key="item.value" :value="item.value">
        <VIcon>{{ item.icon }}</VIcon>
        <span class="text-caption">{{ item.label }}</span>
      </VBtn>
    </VBottomNavigation>
  </VApp>
</template>

<style scoped>
.app-bar-blur {
  backdrop-filter: blur(12px);
  background-color: rgba(var(--v-theme-primary), 0.9) !important;
}

.page-container {
  padding: 16px;
  padding-bottom: 80px;
  max-width: 800px;
  margin: 0 auto;
}
</style>
