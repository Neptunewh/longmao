import type BaseResponse from './BaseResponse'

export default interface MorningTaskResponse extends BaseResponse {
  data: MorningTaskData | null
}

export interface MorningTaskData {
  dayNeedSignCount: string
  dayCompSignCount: string
  minTimeInterval: string
  signType: string
  qrCode: string
  faceFlag: string
  signStartTime: string
  signEndTime: string
  signDate: string
  signStatus: string
  signList: SignRecord[]
  signPointList?: SignPoint[]
}

export interface SignRecord {
  signId: string
  signTime: string
  signType: string
  signStatus: string
  signLocation: string
  signAddress: string
}

export interface SignPoint {
  taskId: string
  pointId: string
  pointName: string
  longitude: string
  latitude: string
  qrCode: string
}
