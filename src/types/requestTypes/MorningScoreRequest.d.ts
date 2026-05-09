import type BasicRequest from './BasicRequest'

export default interface MorningScoreRequest extends BasicRequest {
  baseStation: string
  mac: string
  phoneInfo: string
  version: string
  appVersion: string
  sensorString: string
}
