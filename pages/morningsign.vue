<script setup lang="ts">
const session = useSession()
const morningSign = useMorningSign()

const isSessionValid = computed(() => {
  return session.value && session.value.token
})

onMounted(async () => {
  if (!isSessionValid.value) {
    navigateTo('/')
    return
  }
  await morningSign.fetchTask()
})

const handleSign = async () => {
  if (!canSign.value) return
  await morningSign.performSign()
}

const canSign = computed(() => {
  if (morningSign.getSigning.value) return false
  return morningSign.canSign.value
})

const activeTab = ref('sign')

watch(activeTab, (newTab) => {
  if (newTab === 'score') {
    morningSign.fetchScore()
  }
})
</script>

<template>
  <!-- 未登录 -->
  <div v-if="!isSessionValid" class="empty-state">
    <div class="empty-icon">🔐</div>
    <p class="empty-text">请先扫码登录</p>
    <button class="btn-secondary" @click="navigateTo('/')">返回首页</button>
  </div>

  <!-- 主内容 -->
  <div v-else class="sign-page">
    <!-- 用户信息 -->
    <div class="user-header">
      <div class="user-greeting">
        <span class="greeting-icon">🌅</span>
        <div>
          <div class="greeting-text">早安，{{ session?.stuName }}</div>
          <div class="greeting-sub">{{ session?.schoolName }}</div>
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="segment-control">
      <button
        class="segment-btn"
        :class="{ active: activeTab === 'sign' }"
        @click="activeTab = 'sign'"
      >
        签到
      </button>
      <button
        class="segment-btn"
        :class="{ active: activeTab === 'score' }"
        @click="activeTab = 'score'"
      >
        成绩
      </button>
    </div>

    <!-- 签到 Tab -->
    <template v-if="activeTab === 'sign'">
      <!-- 加载中 -->
      <div v-if="morningSign.getLoading.value" class="loading-state">
        <div class="spinner" />
      </div>

      <template v-else>
        <!-- 错误提示 -->
        <div v-if="morningSign.getError.value" class="toast toast-error" @click="morningSign.clearError()">
          <span>{{ morningSign.getError.value }}</span>
          <span class="toast-close">×</span>
        </div>

        <!-- 成功提示 -->
        <div v-if="morningSign.getSuccess.value" class="toast toast-success" @click="morningSign.clearSuccess()">
          <span>{{ morningSign.getSuccessMessage.value }}</span>
          <span class="toast-close">×</span>
        </div>

        <!-- 有任务数据 -->
        <template v-if="morningSign.getTaskData.value">
          <!-- 任务统计卡片 -->
          <div class="card stats-card">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ morningSign.getTaskData.value.dayNeedSignCount }}</div>
                <div class="stat-label">今日需签到</div>
              </div>
              <div class="stat-divider" />
              <div class="stat-item">
                <div class="stat-value">{{ morningSign.getTaskData.value.dayCompSignCount }}</div>
                <div class="stat-label">已完成</div>
              </div>
              <div class="stat-divider" />
              <div class="stat-item">
                <div class="stat-value" :class="{ 'text-success': morningSign.remainingSigns.value === 0 }">
                  {{ morningSign.remainingSigns.value }}
                </div>
                <div class="stat-label">剩余</div>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{
                  width: `${(parseInt(morningSign.getTaskData.value.dayCompSignCount) / parseInt(morningSign.getTaskData.value.dayNeedSignCount)) * 100}%`
                }"
              />
            </div>

            <!-- 额外信息 -->
            <div class="task-meta">
              <div v-if="morningSign.getTaskData.value.signStartTime" class="meta-item">
                <span class="meta-icon">⏰</span>
                <span>{{ morningSign.getTaskData.value.signStartTime }} - {{ morningSign.getTaskData.value.signEndTime }}</span>
              </div>
              <div v-if="morningSign.getTaskData.value.minTimeInterval" class="meta-item">
                <span class="meta-icon">⏱️</span>
                <span>间隔 {{ morningSign.getTaskData.value.minTimeInterval }} 分钟</span>
              </div>
            </div>
          </div>

          <!-- 签到按钮 -->
          <div v-if="morningSign.canSign.value" class="card sign-action-card">
            <button
              class="btn-sign"
              :disabled="!canSign"
              @click="handleSign"
            >
              <span v-if="morningSign.getSigning.value" class="btn-spinner" />
              <template v-else>
                <span class="btn-sign-icon">📍</span>
                <span class="btn-sign-text">立即签到</span>
              </template>
            </button>
            <p class="sign-hint">签到点：天目湖东操场</p>
          </div>

          <!-- 已完成 -->
          <div v-else class="card done-card">
            <div class="done-icon">✅</div>
            <div class="done-text">今日签到任务已完成</div>
          </div>
        </template>

        <!-- 无任务 -->
        <div v-else-if="!morningSign.getError.value" class="card empty-card">
          <div class="empty-icon">📭</div>
          <div class="empty-text">暂无签到任务</div>
          <div class="empty-hint">可能不在签到时间段</div>
        </div>
      </template>
    </template>

    <!-- 成绩 Tab -->
    <template v-if="activeTab === 'score'">
      <div v-if="morningSign.getScoreData.value" class="card">
        <div class="card-header">
          <span class="card-title">签到成绩</span>
        </div>
        <div class="score-list">
          <div class="score-item">
            <span class="score-label">总签到次数</span>
            <span class="score-value">{{ morningSign.getScoreData.value.totalSignCount }}</span>
          </div>
          <div class="score-item">
            <span class="score-label">有效次数</span>
            <span class="score-value">{{ morningSign.getScoreData.value.validSignCount }}</span>
          </div>
          <div class="score-item">
            <span class="score-label">得分</span>
            <span class="score-value text-primary">{{ morningSign.getScoreData.value.score }}</span>
          </div>
        </div>
      </div>
      <div v-else class="card empty-card">
        <div class="empty-icon">📊</div>
        <div class="empty-text">暂无成绩数据</div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.sign-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fade-in 0.4s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 用户头部 */
.user-header {
  padding: 8px 0;
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 14px;
}

.greeting-icon {
  font-size: 36px;
}

.greeting-text {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.greeting-sub {
  font-size: 13px;
  color: #86868b;
  margin-top: 2px;
}

.dark-mode .greeting-sub {
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

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
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

.toast-success {
  background: #f0fff4;
  color: #34c759;
  border: 1px solid #d4f5dd;
}

.dark-mode .toast-error {
  background: #3a1c1c;
  border-color: #5a2a2a;
}

.dark-mode .toast-success {
  background: #1c3a1c;
  border-color: #2a5a2a;
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

/* 统计卡片 */
.stats-grid {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1d1d1f;
}

.stat-value.text-success {
  color: #34c759;
}

.dark-mode .stat-value {
  color: #f5f5f7;
}

.dark-mode .stat-value.text-success {
  color: #30d158;
}

.stat-label {
  font-size: 12px;
  color: #86868b;
  margin-top: 4px;
}

.dark-mode .stat-label {
  color: #98989d;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #e5e5ea;
}

.dark-mode .stat-divider {
  background: #38383a;
}

/* 进度条 */
.progress-bar {
  height: 6px;
  background: #f2f2f7;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 16px;
}

.dark-mode .progress-bar {
  background: #2c2c2e;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007aff, #5856d6);
  border-radius: 3px;
  transition: width 0.6s ease;
}

/* 任务信息 */
.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #86868b;
}

.dark-mode .meta-item {
  color: #98989d;
}

.meta-icon {
  font-size: 14px;
}

/* 签到按钮卡片 */
.sign-action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.btn-sign {
  width: 100%;
  height: 56px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #007aff, #5856d6);
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
}

.btn-sign:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(0, 122, 255, 0.4);
}

.btn-sign:active:not(:disabled) {
  transform: translateY(0);
}

.btn-sign:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sign-icon {
  font-size: 20px;
}

.btn-sign-text {
  letter-spacing: 0.5px;
}

.btn-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.sign-hint {
  font-size: 13px;
  color: #86868b;
}

.dark-mode .sign-hint {
  color: #98989d;
}

/* 完成卡片 */
.done-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
}

.done-icon {
  font-size: 48px;
}

.done-text {
  font-size: 17px;
  font-weight: 600;
  color: #34c759;
}

.dark-mode .done-text {
  color: #30d158;
}

/* 空状态卡片 */
.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
}

.empty-text {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
}

.dark-mode .empty-text {
  color: #f5f5f7;
}

.empty-hint {
  font-size: 13px;
  color: #86868b;
}

.dark-mode .empty-hint {
  color: #98989d;
}

/* 成绩列表 */
.card-header {
  margin-bottom: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
}

.score-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f2f2f7;
}

.dark-mode .score-item {
  border-bottom-color: #2c2c2e;
}

.score-item:last-child {
  border-bottom: none;
}

.score-label {
  font-size: 15px;
  color: #1d1d1f;
}

.dark-mode .score-label {
  color: #f5f5f7;
}

.score-value {
  font-size: 17px;
  font-weight: 600;
}

.text-primary {
  color: #007aff;
}

.dark-mode .text-primary {
  color: #0a84ff;
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

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
}
</style>
