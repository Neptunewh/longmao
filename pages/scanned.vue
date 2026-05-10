<script setup lang="ts">
import TotoroApiWrapper from '~/src/wrappers/TotoroApiWrapper'

const sunrunPaper = useSunRunPaper()
const session = useSession()
const selectValue = ref('')
const runMode = ref<'sunshine' | 'free'>('sunshine')
const data = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const isSessionValid = computed(() => !!session.value?.token)

const breq = computed(() => ({
  token: session.value!.token,
  campusId: session.value!.campusId,
  schoolId: session.value!.schoolId,
  stuNumber: session.value!.stuNumber,
}))

onMounted(async () => {
  if (!isSessionValid.value) {
    navigateTo('/')
    return
  }
  try {
    const result = await TotoroApiWrapper.getSunRunPaper(breq.value)
    data.value = result
    if (result) sunrunPaper.value = result
  }
  catch (e) {
    console.error('Failed to load sun run paper:', e)
    error.value = '加载路线数据失败'
  }
  finally {
    loading.value = false
  }
})

const handleUpdate = (target: string) => {
  selectValue.value = target
}

const handleModeChange = (mode: 'sunshine' | 'free') => {
  runMode.value = mode
  selectValue.value = ''
}

const pickRandomRoute = () => {
  if (!data.value?.runPointList?.length) return
  const list = data.value.runPointList
  selectValue.value = list[Math.floor(Math.random() * list.length)].pointId
}
</script>

<template>
  <!-- 加载状态 -->
  <div v-if="loading" class="loading-state">
    <div class="spinner" />
  </div>

  <!-- 未登录 -->
  <div v-else-if="!isSessionValid" class="empty-state">
    <div class="empty-icon">🔐</div>
    <p class="empty-text">请先扫码登录</p>
    <button class="btn-secondary" @click="navigateTo('/')">返回首页</button>
  </div>

  <!-- 主内容 -->
  <div v-else class="scanned-page">
    <!-- 错误提示 -->
    <div v-if="error" class="toast toast-error" @click="error = null">
      <span>{{ error }}</span>
      <span class="toast-close">×</span>
    </div>

    <!-- 用户信息卡片 -->
    <div class="card user-card">
      <div class="user-avatar">
        {{ session?.stuName?.charAt(0) }}
      </div>
      <div class="user-info">
        <div class="user-name">{{ session?.stuName }}</div>
        <div class="user-detail">{{ session?.campusName }} · {{ session?.collegeName }}</div>
      </div>
    </div>

    <!-- 模式切换 -->
    <div class="segment-control">
      <button
        class="segment-btn"
        :class="{ active: runMode === 'sunshine' }"
        @click="handleModeChange('sunshine')"
      >
        ☀️ 阳光跑
      </button>
      <button
        class="segment-btn"
        :class="{ active: runMode === 'free' }"
        @click="handleModeChange('free')"
      >
        🏃 自由跑
      </button>
    </div>

    <!-- 阳光跑模式 -->
    <template v-if="runMode === 'sunshine'">
      <!-- 路线选择 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">选择路线</span>
          <button class="btn-text" @click="pickRandomRoute">🎲 随机</button>
        </div>
        <div v-if="data?.runPointList?.length" class="route-list">
          <button
            v-for="point in data.runPointList"
            :key="point.pointId"
            class="route-item"
            :class="{ active: selectValue === point.pointId }"
            @click="handleUpdate(point.pointId)"
          >
            <div class="route-info">
              <span class="route-name">{{ point.pointName }}</span>
              <span class="route-distance">{{ point.distance }}m</span>
            </div>
            <div v-if="selectValue === point.pointId" class="route-check">✓</div>
          </button>
        </div>
        <div v-else class="empty-hint">暂无可用路线</div>
      </div>

      <!-- 批量跑步 -->
      <BatchRunSetup v-if="selectValue" :select-value="selectValue" />
    </template>

    <!-- 自由跑模式 -->
    <template v-else>
      <FreeRunSetup />
    </template>
  </div>
</template>

<style scoped>
.scanned-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fade-in 0.4s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 122, 255, 0.15);
  border-top-color: #007aff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
}

.empty-icon {
  font-size: 48px;
}

.empty-text {
  font-size: 15px;
  color: #86868b;
}

/* Toast */
.toast {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  animation: slide-down 0.3s ease;
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.toast-error {
  background: #fff2f0;
  color: #ff3b30;
  border: 1px solid #ffe0db;
}

.dark-mode .toast-error {
  background: #3a1c1c;
  border-color: #5a2a2a;
}

.toast-close {
  font-size: 18px;
  opacity: 0.6;
}

/* 通用卡片 */
.card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.04);
}

.dark-mode .card {
  background: #1c1c1e;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* 用户卡片 */
.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007aff, #5856d6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.user-detail {
  font-size: 13px;
  color: #86868b;
  margin-top: 2px;
}

.dark-mode .user-detail {
  color: #98989d;
}

/* 分段控制器 */
.segment-control {
  display: flex;
  background: #f2f2f7;
  border-radius: 12px;
  padding: 3px;
  gap: 3px;
}

.dark-mode .segment-control {
  background: #2c2c2e;
}

.segment-btn {
  flex: 1;
  height: 38px;
  border: none;
  border-radius: 10px;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #86868b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.segment-btn.active {
  background: white;
  color: #1d1d1f;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.dark-mode .segment-btn.active {
  background: #3a3a3c;
  color: #f5f5f7;
}

/* 路线列表 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.1px;
}

.btn-text {
  border: none;
  background: none;
  color: #007aff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.btn-text:hover {
  background: rgba(0, 122, 255, 0.08);
}

.dark-mode .btn-text {
  color: #0a84ff;
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.route-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid #f2f2f7;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
  color: inherit;
}

.route-item:hover {
  border-color: #e0e0e0;
}

.route-item.active {
  border-color: #007aff;
  background: rgba(0, 122, 255, 0.04);
}

.dark-mode .route-item {
  border-color: #2c2c2e;
}

.dark-mode .route-item:hover {
  border-color: #3a3a3c;
}

.dark-mode .route-item.active {
  border-color: #0a84ff;
  background: rgba(10, 132, 255, 0.08);
}

.route-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.route-name {
  font-size: 15px;
  font-weight: 500;
}

.route-distance {
  font-size: 12px;
  color: #86868b;
}

.dark-mode .route-distance {
  color: #98989d;
}

.route-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #007aff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.dark-mode .route-check {
  background: #0a84ff;
}

.empty-hint {
  text-align: center;
  padding: 24px;
  font-size: 14px;
  color: #86868b;
}

.dark-mode .empty-hint {
  color: #98989d;
}

/* 按钮 */
.btn-secondary {
  height: 44px;
  padding: 0 24px;
  border-radius: 12px;
  border: 1.5px solid #e5e5ea;
  background: white;
  font-size: 15px;
  font-weight: 500;
  color: #007aff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #f5f5f7;
}

.dark-mode .btn-secondary {
  background: #2c2c2e;
  border-color: #3a3a3c;
  color: #0a84ff;
}

.dark-mode .btn-secondary:hover {
  background: #3a3a3c;
}
</style>
