import { Actor } from '../common'

import * as txt from '../assets/parsed.json'

const scenes = txt['AKT I'].scenes.concat(txt['AKT II'].scenes)

let currentEl = document.body

export const setCurrent = (id: string) => {
  currentEl.style.border = null
  currentEl = document.getElementById(`txt-${id}`)!
  currentEl.style.border = `2px solid black`
  // alert(currentEl.offsetTop)
  // document.documentElement.scrollTop = currentEl.offsetTop
  currentEl.scrollIntoView()
}

export const text = (actor: Actor) =>
  scenes.map(
    scene => `
  <div id="txt-wrap">
<h3 style="margin-left:48px">${scene.title}</h3>
${(scene.plot as any)
  .map(
    (p: any) => `<div id="txt-${p.id}" style="padding:4px;margin-left:${
      p.type === 'say' ? 4 : 64
    }px;font-size:${p.type === 'say' ? 18 : 12}px;${
      p.who === actor ? 'background-color:rgba(0,255,0,0.1)' : ''
    }">
  ${
    p.type === 'say'
      ? `<span style="color:${p.who === actor ? 'green' : 'black'}"><b>${
          p.who
        }: </b></span>`
      : ''
  }
  ${p.what}
</div>`
  )
  .join('')}
<div>
`
  )
