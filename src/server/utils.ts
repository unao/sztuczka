import * as os from 'os'

export const customStartWith = /^(192\.168)|(10\.)/
export const localIP = (
  startWith = customStartWith,
  interfaces = os.networkInterfaces()
) =>
  Object.keys(interfaces)
    .map(name => interfaces[name])
    .map(face =>
      face.find(a => a.family === 'IPv4' && startWith.test(a.address))
    )
    .filter(Boolean)
    .map(a => (a as os.NetworkInterfaceInfoIPv4).address)[0] as
    | string
    | undefined
