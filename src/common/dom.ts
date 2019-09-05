Object.assign(document.body.style, { margin: 0 })

document.body.innerHTML =
  '<div style="width:100vw;height:100vh;background-color:white"></div>'
const c = document.body.firstElementChild as HTMLDivElement

export const fullscreen = () => c.requestFullscreen()

export const render = (content: string) => (c.innerHTML = content)
