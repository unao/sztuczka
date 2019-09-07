import { actors, render } from 'common'

const scene = actors
  .filter(a => a !== 'KRYSTIAN')
  .map(
    a => `<iframe
  seamless style="border:0;width:33vw;height:49vh" src="${window.location.origin}/actor?a=${a}"></iframe>`
  )

render(
  `<div style="display:inline;width:100vw;height:100vh">${scene.join('')}</div>`
)
