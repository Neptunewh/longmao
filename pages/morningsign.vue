<script setup lang="ts">
const session = useSession()
const morningSign = useMorningSign()
const router = useRouter()

const activeTab = ref('sign')
const qrCode = ref('')
const signType = ref<'1' | '2'>('2')

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
  if (!canSign.value) {
    return
  }

  // 从签到任务数据中提取 taskId/pointId（取第一个签到点）
  const firstPoint = morningSign.getTaskData.value?.signPointList?.[0]
  const taskId = firstPoint?.taskId || ''
  const pointId = firstPoint?.pointId || ''

  const success = await morningSign.submitSign({
    signType: signType.value,
    qrCode: qrCode.value,
    latitude: '31.3713',
    longitude: '119.4891',
    taskId,
    pointId,
  })

  if (success) {
    qrCode.value = ''
  }
}

const canSign = computed(() => {
  if (morningSign.getSigning.value) return false
  if (!morningSign.canSign.value) return false
  if (signType.value === '2' && !qrCode.value) return false
  return true
})

const signButtonText = computed(() => {
  if (morningSign.getSigning.value) return '签到中...'
  if (!morningSign.canSign.value) return '今日已完成签到'
  return '立即签到'
})

const signTypeItems = [
  { title: '扫码签到', value: '2' },
  { title: '位置签到', value: '1' },
]

watch(activeTab, (newTab) => {
  if (newTab === 'score') {
    morningSign.fetchScore()
  }
})
</script>

<template>
  <div v-if="!isSessionValid" class="text-center pa-4">
    <VAlert type="warning">
      请先扫码登录
    </VAlert>
    <VBtn color="primary" class="mt-4" @click="navigateTo('/')">
      返回首页
    </VBtn>
  </div>

  <template v-else>
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center gap-2">
        <VIcon icon="mdi-alarm-check" />
        早操签到
      </VCardTitle>
      <VCardSubtitle>
        {{ session?.schoolName }} - {{ session?.stuName }}
      </VCardSubtitle>
    </VCard>

    <VTabs v-model="activeTab" grow>
      <VTab value="sign">
        <VIcon start icon="mdi-check-circle" />
        签到
      </VTab>
      <VTab value="score">
        <VIcon start icon="mdi-chart-bar" />
        成绩
      </VTab>
    </VTabs>

    <VWindow v-model="activeTab" class="mt-4">
      <VWindowItem value="sign">
        <div v-if="morningSign.getLoading.value" class="d-flex justify-center pa-8">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <template v-else-if="morningSign.getTaskData.value">
          <VCard class="mb-4">
            <VCardText>
              <div class="d-flex flex-column gap-3">
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">今日需签到</span>
                  <span class="font-weight-bold">{{ morningSign.getTaskData.value.dayNeedSignCount }} 次</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">已完成</span>
                  <span class="font-weight-bold">{{ morningSign.getTaskData.value.dayCompSignCount }} 次</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">剩余</span>
                  <VChip
                    :color="morningSign.remainingSigns.value > 0 ? 'warning' : 'success'"
                    size="small"
                  >
                    {{ morningSign.remainingSigns.value }} 次
                  </VChip>
                </div>
                <div v-if="morningSign.getTaskData.value.minTimeInterval" class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">最小间隔</span>
                  <span>{{ morningSign.getTaskData.value.minTimeInterval }} 分钟</span>
                </div>
                <div v-if="morningSign.getTaskData.value.signStartTime" class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">签到时间</span>
                  <span>{{ morningSign.getTaskData.value.signStartTime }} - {{ morningSign.getTaskData.value.signEndTime }}</span>
                </div>
              </div>
            </VCardText>
          </VCard>

          <VAlert
            v-if="morningSign.getError.value"
            type="error"
            closable
            class="mb-4"
            @click:close="morningSign.clearError()"
          >
            {{ morningSign.getError.value }}
          </VAlert>

          <VAlert
            v-if="morningSign.getSuccess.value"
            type="success"
            closable
            class="mb-4"
            @click:close="morningSign.clearSuccess()"
          >
            {{ morningSign.getSuccessMessage.value }}
          </VAlert>

          <VCard v-if="morningSign.canSign.value">
            <VCardTitle>签到操作</VCardTitle>
            <VCardText>
              <div class="d-flex flex-column gap-4">
                <VSelect
                  v-model="signType"
                  :items="signTypeItems"
                  item-title="title"
                  item-value="value"
                  label="签到方式"
                  variant="outlined"
                />

                <VTextField
                  v-if="signType === '2'"
                  v-model="qrCode"
                  label="二维码内容"
                  placeholder="请输入二维码内容或扫描二维码"
                  variant="outlined"
                  prepend-inner-icon="mdi-qrcode"
                  :rules="[v => !!v || '请输入二维码内容']"
                />

                <VBtn
                  color="primary"
                  size="large"
                  :disabled="!canSign"
                  :loading="morningSign.getSigning.value"
                  @click="handleSign"
                >
                  {{ signButtonText }}
                </VBtn>
              </div>
            </VCardText>
          </VCard>

          <VAlert
            v-else
            type="success"
            variant="tonal"
            class="mt-4"
          >
            <template #prepend>
              <VIcon icon="mdi-check-circle" />
            </template>
            今日签到任务已完成
          </VAlert>
        </template>

        <VAlert
          v-else
          type="info"
          variant="tonal"
          class="mt-4"
        >
          暂无签到任务
        </VAlert>
      </VWindowItem>

      <VWindowItem value="score">
        <div v-if="morningSign.getLoading.value" class="d-flex justify-center pa-8">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <template v-else-if="morningSign.getScoreData.value">
          <VCard class="mb-4">
            <VCardTitle>签到统计</VCardTitle>
            <VCardText>
              <div class="d-flex flex-column gap-3">
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">总签到次数</span>
                  <span class="font-weight-bold">{{ morningSign.getScoreData.value.totalSignCount }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">已完成</span>
                  <span class="font-weight-bold text-success">{{ morningSign.getScoreData.value.completedSignCount }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">缺签</span>
                  <span class="font-weight-bold text-error">{{ morningSign.getScoreData.value.missedSignCount }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">签到率</span>
                  <VChip
                    :color="parseFloat(morningSign.getScoreData.value.signRate) >= 80 ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ morningSign.getScoreData.value.signRate }}%
                  </VChip>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">成绩</span>
                  <span class="font-weight-bold text-primary">{{ morningSign.getScoreData.value.score }}</span>
                </div>
              </div>
            </VCardText>
          </VCard>

          <VCard v-if="morningSign.getScoreData.value.signList?.length > 0">
            <VCardTitle>签到记录</VCardTitle>
            <VDataTable
              :items="morningSign.getScoreData.value.signList"
              :headers="[
                { title: '日期', key: 'signDate', align: 'start' },
                { title: '时间', key: 'signTime', align: 'start' },
                { title: '类型', key: 'signType', align: 'start' },
                { title: '状态', key: 'signStatus', align: 'center' },
                { title: '成绩', key: 'score', align: 'end' },
              ]"
              density="compact"
            >
              <template #item.signType="{ item }">
                <VChip size="small" color="info">
                  {{ item.signType === '1' ? '位置签到' : '扫码签到' }}
                </VChip>
              </template>
              <template #item.signStatus="{ item }">
                <VChip
                  size="small"
                  :color="item.signStatus === '1' ? 'success' : 'error'"
                >
                  {{ item.signStatus === '1' ? '成功' : '失败' }}
                </VChip>
              </template>
            </VDataTable>
          </VCard>
        </template>

        <VAlert
          v-else
          type="info"
          variant="tonal"
          class="mt-4"
        >
          暂无签到成绩数据
        </VAlert>
      </VWindowItem>
    </VWindow>
  </template>
</template>
