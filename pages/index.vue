<script setup lang="ts">
import TotoroApiWrapper from '~/src/wrappers/TotoroApiWrapper'

const router = useRouter()
const { data } = await useFetch<{ uuid: string; imgUrl: string }>('/api/scanQr')
const message = ref('')
const loading = ref(false)
const session = useSession()

const handleScanned = async () => {
  loading.value = true
  const scanRes = await $fetch(`/api/scanQr/${data!.value!.uuid}`)
  const code = (scanRes as { code: string; message: null } | { code: null; message: string })
    .code as string
  try {
    const loginResult = (
      await Promise.all([TotoroApiWrapper.getLesseeServer(code), TotoroApiWrapper.getAppAd(code)])
    )[0]
    if (!loginResult.token) {
      message.value = loginResult.message as string
      return
    }
    const personalInfo = await TotoroApiWrapper.login({ token: loginResult.token })
    session.value = { ...personalInfo, token: loginResult.token, code, data: null }
    const breq = {
      token: loginResult.token,
      campusId: personalInfo.campusId,
      schoolId: personalInfo.schoolId,
      stuNumber: personalInfo.stuNumber,
    }
    await TotoroApiWrapper.getAppFrontPage(breq)
    await TotoroApiWrapper.getAppSlogan(breq)
    await TotoroApiWrapper.updateAppVersion(breq)
    await TotoroApiWrapper.getAppNotice(breq)
    router.push('/scanned')
  }
  catch (e) {
    console.error(e)
    message.value = '龙猫服务器错误'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="home-page">
    <!-- Hero 区域 -->
    <div class="hero">
      <div class="hero-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" opacity="0.9"/>
        </svg>
      </div>
      <h1 class="hero-title">龙猫乐园</h1>
      <p class="hero-subtitle">阳光跑 · 自由跑 · 早操签到</p>
    </div>

    <!-- 扫码卡片 -->
    <div class="card qr-card">
      <div class="card-header">
        <span class="card-icon">📱</span>
        <span class="card-title">扫码登录</span>
      </div>
      <div class="qr-wrapper">
        <div class="qr-frame">
          <div v-if="!data" class="qr-loading">
            <div class="spinner" />
          </div>
          <img
            v-else-if="!message"
            :src="data.imgUrl"
            class="qr-img"
            referrerpolicy="no-referrer"
          >
          <div v-else class="qr-error">
            <span class="error-text">{{ message }}</span>
          </div>
        </div>
        <p class="qr-hint">请使用微信扫描上方二维码</p>
      </div>
      <button
        class="btn-primary"
        :disabled="loading || !!message"
        @click="handleScanned"
      >
        <span v-if="loading" class="btn-spinner" />
        <span v-else>已扫码，下一步</span>
        <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>

    <!-- 底部引言 -->
    <p class="quote">
      古典时代的人发现人体是权力的对象和目标。—— 米歇尔·福柯
    </p>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  animation: fade-in 0.6s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hero */
.hero {
  text-align: center;
  padding: 32px 0 8px;
}

.hero-icon {
  width: 80px;
  height: 80px;
  border-radius: 22px;
  background: linear-gradient(135deg, #007aff, #5856d6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.25);
}

.hero-title {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.hero-subtitle {
  font-size: 15px;
  color: #86868b;
  font-weight: 400;
}

/* 通用卡片 */
.card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06), 0 8px 32px rgba(0, 0, 0, 0.04);
}

.dark-mode .card {
  background: #1c1c1e;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.card-icon {
  font-size: 20px;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

/* QR 码 */
.qr-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.qr-frame {
  width: 200px;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  background: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.dark-mode .qr-frame {
  background: #2c2c2e;
  border-color: rgba(255, 255, 255, 0.06);
}

.qr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(0, 122, 255, 0.15);
  border-top-color: #007aff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.qr-error {
  padding: 16px;
  text-align: center;
}

.error-text {
  font-size: 13px;
  color: #ff3b30;
}

.qr-hint {
  font-size: 13px;
  color: #86868b;
  text-align: center;
}

/* 主按钮 */
.btn-primary {
  width: 100%;
  height: 50px;
  border-radius: 14px;
  border: none;
  background: #007aff;
  color: white;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  margin-top: 24px;
}

.btn-primary:hover:not(:disabled) {
  background: #0066d6;
  transform: scale(1.01);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 引言 */
.quote {
  font-size: 12px;
  color: #aeaeb2;
  text-align: center;
  padding: 16px 32px;
  line-height: 1.6;
}

.dark-mode .quote {
  color: #636366;
}

.dark-mode .hero-subtitle,
.dark-mode .qr-hint {
  color: #98989d;
}

.dark-mode .btn-primary {
  background: #0a84ff;
}

.dark-mode .btn-primary:hover:not(:disabled) {
  background: #409cff;
}
</style>
