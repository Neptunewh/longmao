import type BaseResponse from './BaseResponse'

export default interface MorningScoreResponse extends BaseResponse {
  data: MorningScoreData | null
}

export interface MorningScoreData {
  totalSignCount: string
  completedSignCount: string
  missedSignCount: string
  signRate: string
  score: string
  signList: SignScoreRecord[]
}

export interface SignScoreRecord {
  signId: string
  signDate: string
  signTime: string
  signType: string
  signStatus: string
  score: string
}
