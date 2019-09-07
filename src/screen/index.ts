import { connectWS } from 'common'

document.body.innerHTML = `<div style="background-color:black;width:100vw;s">
  <video autoplay loop src="/assets/eclipse.mp4" style="width:100vw;height:100vh"  />
</div>`

const vid = document.getElementsByTagName('video')[0]
vid.playbackRate = 0.07

connectWS('screen').subscribe()
