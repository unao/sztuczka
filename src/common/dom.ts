Object.assign(document.body.style, { margin: 0, overflow: 'hidden' })

document.body.innerHTML = '<div style="background-color:white"></div>'
const c = document.body.firstElementChild as HTMLDivElement

export const fullscreen = () => c.requestFullscreen()

export const render = (content: string) => (c.innerHTML = content)
