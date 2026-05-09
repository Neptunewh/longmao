import type BasicRequest from './BasicRequest'

export default interface MorningSignRequest extends BasicRequest {
  signType: string
  qrCode: string
  baseStation: string
  mac: string
  phoneInfo: string
  version: string
  appVersion: string
  sensorString: string
  headImage: string
  latitude: string
  longitude: string
  taskId: string
  pointId: string
}
