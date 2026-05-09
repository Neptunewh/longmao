import type BasicRequest from './BasicRequest'

export default interface MorningTaskRequest extends BasicRequest {
  baseStation: string
  mac: string
  phoneInfo: string
  version: string
  appVersion: string
  sensorString: string
}
