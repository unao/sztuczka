import { Actor } from 'common'

const m = '16px'
export const pos: {
  [K in Actor]: Partial<{ [K in 'left' | 'right' | 'top' | 'bottom']: string }>
} = {
  ANIELA: {
    top: m,
    right: m
  },
  CZAREK: {
    top: `33vh`,
    right: m
  },
  ROBERT: {
    bottom: m,
    right: m
  },
  EWA: {
    bottom: m,
    left: `33vw`
  },
  KAROLINA: {
    bottom: m,
    left: m
  },
  LEON: {
    top: `33vh`,
    left: m
  },
  KRYSTIAN: {
    top: m,
    left: m
  }
}

const toPos = (a: Actor) => `position:absolute;
  ${Object.keys(pos[a])
    .map(k => `${k}:${pos[a][k as 'left']}`)
    .join(';')}`

const trans = `opacity:1;filter:blur(0px);transition: all 0.4s ease-in-out;`

export const smsUI = (who: string, msg: string, actor: Actor) =>
  `<div style="max-width:30vw;max-height:30vh;color:white;
  ${trans}
  ${toPos(actor)}">
    <b style="font-size:42px">${who.toUpperCase()}</b>
    <div style="font-size:48px;max-width:320px;
      border-radius:16px;
      background:black;padding:32px;
      border:2px solid white">
      ${msg}
    </div>
  </div>`

export type PhoneUI = ReturnType<typeof initPhoneUI>

const iconColor = 'white'
const iconActiveColor = 'rgba(20,255,20,0.87)'

const mic = () => `<svg xmlns="http://www.w3.org/2000/svg"
 width="24" height="24" viewBox="0 0 24 24">
 <path d="M0 0h24v24H0zm0 0h24v24H0z" fill="none"/>
 <path fill="${iconColor}" d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
</svg>`

const dial = () => `<svg xmlns="http://www.w3.org/2000/svg"
width="24" height="24" viewBox="0 0 24 24">
<path d="M0 0h24v24H0z" fill="none"/>
<path fill="${iconColor}" d="M12 19c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 1c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12-8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-6 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
</svg>`

const speaker = () => `<svg xmlns="http://www.w3.org/2000/svg"
width="42" height="42" viewBox="0 0 24 24">
<path id="speaker" fill="${iconColor}" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
<path d="M0 0h24v24H0z" fill="none"/>
</svg>`

const callEnd = () => `<svg xmlns="http://www.w3.org/2000/svg"
  width="24" height="24" viewBox="0 0 24 24">
  <path d="M0 0h24v24H0z" fill="none"/>
  <path fill="white" d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
</svg>`

export const initPhoneUI = (root: HTMLElement) => {
  root.insertAdjacentHTML(
    'beforeend',
    `<div id="phone-wrap"
    style="width:234px;height:477px;
      opacity:0;
      transition: opacity 0.4s ease-in-out;
      z-index:6;
      position:absolute;
      background-image:url('/assets/img/phone.png');
      background-size:cover;
    ">
    <div id="phone-content"
      style="position:absolute;left:9px;top:49px;
        width:215px;height:382px;
        display:flex;flex-direction:column;
        align-items:center;
        color:rgba(255,255,255,0.87);
        padding:16px;
        box-sizing:border-box;
        background-color:black"
    >
      <div id="call-time" style="opacity:0.8;font-size:10px;margin:24px 0">00:00</div>
      <div id="call-who" style="font-weight:bold;margin-bottom:24px">MARTUŚ</div>
      <div style="width:84px;height:84px;
        background-color:gray;
        display:flex; align-items:center;
        justify-content: center;
        overflow:hidden;
        border-radius:50%;border:1px solid black">
        <video src="/assets/eclipse.mp4" style="height:122px"></video>
      </div>
      <div style="flex:1;display:flex;
        flex-direction:row;
        align-self:stretch;
        justify-content:space-between;
        align-items:center">
        ${mic()}
        ${speaker()}
        ${dial()}
      </div>

      <div style="width:42px;height:42px;
        background-color:rgba(255,20,20,0.9);
        display:flex; align-items:center;
        justify-content: center;
        margin-bottom:16px;
        border-radius:50%">
        ${callEnd()}
      </div>
    </div>
  </div>`
  )

  const wrap = document.getElementById('phone-wrap')!
  // const content = document.getElementById('phone-content')!
  const _time = document.getElementById('call-time')!
  const _who = document.getElementById('call-who')!
  const _speaker = (document.getElementById(
    'speaker'
  )! as any) as SVGPathElement

  return {
    width: 234,
    height: 477,
    wrap,
    start: (who: string) => {
      wrap.style.opacity = '1'
      _speaker.setAttribute('fill', iconColor)
      _who.innerText = who
      _time.innerText = '00:00'
    },
    updateTime: (time: string) => (_time.innerText = time),
    loud: () => _speaker.setAttribute('fill', iconActiveColor),
    end: () => (wrap.style.opacity = '0')
  }
}
