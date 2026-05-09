import type BaseResponse from './BaseResponse'

export default interface MorningSignResponse extends BaseResponse {
  data: MorningSignData | null
}

export interface MorningSignData {
  signId: string
  signTime: string
  signType: string
  signStatus: string
  signLocation: string
  signAddress: string
  message: string
}
