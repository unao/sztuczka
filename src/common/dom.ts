import { Observable, Observer } from 'rxjs'
import { loadFont } from './load-font'

Object.assign(document.body.style, { margin: 0, overflow: 'hidden' })

document.body.innerHTML = '<div style="background-color:white"></div>'
const c = document.body.firstElementChild as HTMLDivElement
window.onbeforeunload = () => window.scrollTo(0, 0)
loadFont()

export const fullscreen = () => c.requestFullscreen()

export const render = (content: string) => (c.innerHTML = content)

let pattern: number[] = []
for (let i = 0; i < 30; i++) {
  pattern.push(1000)
  pattern.push(1000)
}

export const playAudio = (name: string, vibrate = true) =>
  Observable.create((obs: Observer<any>) => {
    const el = document.createElement('audio')
    el.src = name.startsWith('https') ? name : `/assets/${name}`
    document.body.appendChild(el)
    el.play().catch(e => {
      obs.error(e)
    })
    el.onended = () => obs.complete()
    obs.next(el)
    vibrate && navigator.vibrate(pattern)
    return () => {
      vibrate && navigator.vibrate(0)
      el.pause()
      el.remove()
    }
  })
