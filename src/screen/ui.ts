export const centerContent = (
  c: { width: number; height: number },
  wrap: HTMLElement
) => (s: { w: number; h: number }) => {
  const h = s.h - 40
  const r = h / c.height
  const w = c.width * r

  wrap.style.top = '20px'
  wrap.style.left = `${(s.w - w) / 2}px`
  wrap.style.transform = `scale(${r})`
  wrap.style.transformOrigin = `top left`
}

const trans = `opacity:1;filter:blur(0px);transition: all 0.4s ease-in-out;`

export const smsUI = (from: string, to: string, msg: string) =>
  `<div style="${trans};display:flex;flex-direction:column;align-items:center">
    <div style="display:flex;width:100%;justify-content:space-between">
      <div style="font-size:20px;
        font-weight: bold;
        background:#e5e5ea;color:black;
        border-radius:8px 8px 0 0;
        ">&nbsp;${from.toUpperCase()}&nbsp;</div>
        <div style="font-size:20px;
        font-weight: bold;
        background:#0d86fe;
        color: white;
        border-radius:8px 8px 0 0;
        ">&nbsp;${to.toUpperCase()}&nbsp;</div>
    </div>
    <div class="msg" style="font-size:32px;width:320px;
      border-radius:12px;
      padding:12px;
      background:#0d86fe;
      color: white;
      border-top: 1px solid #e5e5ea;
      margin-bottom:12px;
      ">
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

const callStart = () => `<svg pointer-events="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path fill="none" d="M0 0h24v24H0z"/>
  <path fill="white" d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
</svg>`

const callEndBtn = (id = 'call-end-btn', style = '') =>
  `<div id="${id}" style="width:42px;height:42px;
  background-color:rgb(255,20,20);
  display:flex; align-items:center;
  justify-content: center;
  margin-bottom:16px;
  border-radius:50%;${style}">
  ${callEnd()}
</div>`

export const callStartBtn = (style = '', id = 'call-start-btn') =>
  `<div id="${id}" style="width:42px;height:42px;
  background-color:rgb(20,240,20);
  display:flex; align-items:center;
  justify-content: center;
  margin-bottom:16px;
  border-radius:50%;
  ${style}">
  ${callStart()}
  </div>`

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
      <div id="call-time" style="opacity:0.8;font-size:16px;margin:24px 0">00:00</div>
      <div id="call-who" style="font-size:32px;font-weight:bold;margin-bottom:24px">MARTUŚ</div>
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

      ${callEndBtn()}
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
