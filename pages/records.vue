<template>
  <div class="records-page">
    <div class="page-header">
      <h1 class="page-title">跑步记录</h1>
      <p class="page-subtitle">查看你的运动历史</p>
    </div>
    <FreeRunRecords />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: '跑步记录'
})

onMounted(() => {
  const session = useSession()
  if (!session.value?.token) {
    navigateTo('/')
  }
})
</script>

<style scoped>
.records-page {
  animation: fade-in 0.4s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 15px;
  color: #86868b;
}

.dark-mode .page-subtitle {
  color: #98989d;
}
</style>
