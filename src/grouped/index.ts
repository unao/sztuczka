import { actors, render } from 'common'

const scene = actors
  .filter(a => a !== 'EWA')
  .map(
    a => `<iframe frameBorder="0"
  seamless="seamless" style="width:33vw;height:48vh" src="${window.location.origin}/actor?a=${a}"></iframe>`
  )

render(
  `<div style="display:inline;width:100vw;height:100vh">${scene.join('')}</div>`
)
