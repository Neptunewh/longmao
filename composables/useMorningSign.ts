import type { MorningTaskData } from '~/src/types/responseTypes/MorningTaskResponse'
import type { MorningSignData } from '~/src/types/responseTypes/MorningSignResponse'
import type { MorningScoreData } from '~/src/types/responseTypes/MorningScoreResponse'

interface MorningSignState {
  taskData: MorningTaskData | null
  signResult: MorningSignData | null
  scoreData: MorningScoreData | null
  loading: boolean
  signing: boolean
  error: string | null
  success: boolean
  successMessage: string
}

const defaultState: MorningSignState = {
  taskData: null,
  signResult: null,
  scoreData: null,
  loading: false,
  signing: false,
  error: null,
  success: false,
  successMessage: '',
}

export const useMorningSign = () => {
  const state = useState<MorningSignState>('morningSignState', () => ({ ...defaultState }))
  const session = useSession()

  const getTaskData = computed(() => state.value.taskData)
  const getSignResult = computed(() => state.value.signResult)
  const getScoreData = computed(() => state.value.scoreData)
  const getLoading = computed(() => state.value.loading)
  const getSigning = computed(() => state.value.signing)
  const getError = computed(() => state.value.error)
  const getSuccess = computed(() => state.value.success)
  const getSuccessMessage = computed(() => state.value.successMessage)

  const canSign = computed(() => {
    if (!state.value.taskData) return false
    const { dayNeedSignCount, dayCompSignCount } = state.value.taskData
    return parseInt(dayCompSignCount) < parseInt(dayNeedSignCount)
  })

  const remainingSigns = computed(() => {
    if (!state.value.taskData) return 0
    const { dayNeedSignCount, dayCompSignCount } = state.value.taskData
    return parseInt(dayNeedSignCount) - parseInt(dayCompSignCount)
  })

  const fetchTask = async () => {
    if (!session.value?.token) {
      state.value.error = '请先登录'
      return
    }

    state.value.loading = true
    state.value.error = null

    try {
      const TotoroApiWrapper = (await import('~/src/wrappers/TotoroApiWrapper')).default
      const breq = {
        token: session.value.token,
        campusId: session.value.campusId,
        schoolId: session.value.schoolId,
        stuNumber: session.value.stuNumber,
      }

      const response = await TotoroApiWrapper.getMorningSignTask(breq)
      if (response.data) {
        state.value.taskData = response.data
      }
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : '获取签到任务失败'
      console.error('Failed to fetch morning sign task:', error)
    } finally {
      state.value.loading = false
    }
  }

  const submitSign = async (options: {
    signType: '1' | '2'
    qrCode?: string
    latitude?: string
    longitude?: string
    taskId?: string
    pointId?: string
  }) => {
    if (!session.value?.token) {
      state.value.error = '请先登录'
      return false
    }

    state.value.signing = true
    state.value.error = null
    state.value.success = false

    try {
      const TotoroApiWrapper = (await import('~/src/wrappers/TotoroApiWrapper')).default
      const breq = {
        token: session.value.token,
        campusId: session.value.campusId,
        schoolId: session.value.schoolId,
        stuNumber: session.value.stuNumber,
      }

      const response = await TotoroApiWrapper.submitMorningSign({
        signType: options.signType,
        qrCode: options.qrCode,
        latitude: options.latitude,
        longitude: options.longitude,
        taskId: options.taskId,
        pointId: options.pointId,
        breq,
      })

      if (response.data) {
        state.value.signResult = response.data
        state.value.success = true
        state.value.successMessage = '签到成功'

        await fetchTask()
        return true
      }
      return false
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : '签到失败'
      console.error('Failed to submit morning sign:', error)
      return false
    } finally {
      state.value.signing = false
    }
  }

  const fetchScore = async () => {
    if (!session.value?.token) {
      state.value.error = '请先登录'
      return
    }

    state.value.loading = true
    state.value.error = null

    try {
      const TotoroApiWrapper = (await import('~/src/wrappers/TotoroApiWrapper')).default
      const breq = {
        token: session.value.token,
        campusId: session.value.campusId,
        schoolId: session.value.schoolId,
        stuNumber: session.value.stuNumber,
      }

      const response = await TotoroApiWrapper.getMorningSignScore(breq)
      if (response.data) {
        state.value.scoreData = response.data
      }
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : '获取签到成绩失败'
      console.error('Failed to fetch morning sign score:', error)
    } finally {
      state.value.loading = false
    }
  }

  const clearError = () => {
    state.value.error = null
  }

  const clearSuccess = () => {
    state.value.success = false
    state.value.successMessage = ''
  }

  const resetState = () => {
    Object.assign(state.value, { ...defaultState })
  }

  return {
    state: readonly(state),

    getTaskData,
    getSignResult,
    getScoreData,
    getLoading,
    getSigning,
    getError,
    getSuccess,
    getSuccessMessage,
    canSign,
    remainingSigns,

    fetchTask,
    submitSign,
    fetchScore,
    clearError,
    clearSuccess,
    resetState,
  }
}

export default useMorningSign
