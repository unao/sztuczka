import { Observable, Observer } from 'rxjs'

Object.assign(document.body.style, { margin: 0, overflow: 'hidden' })

document.body.innerHTML = '<div style="background-color:white"></div>'
const c = document.body.firstElementChild as HTMLDivElement

export const fullscreen = () => c.requestFullscreen()

export const render = (content: string) => (c.innerHTML = content)

export const playAudio = (name: string) =>
  Observable.create((obs: Observer<any>) => {
    const el = document.createElement('audio')
    el.src = `/assets/${name}`
    document.body.appendChild(el)
    el.play().catch(e => obs.error(e))
    el.onended = () => obs.complete()
    obs.next(el)
    return () => {
      console.log('CLEAN-UP', name)
      el.pause()
      el.remove()
    }
  })
