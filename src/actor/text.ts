import { Actor } from '../common'

import * as txt from '../assets/parsed.json'

const scenes = txt['AKT I'].scenes.concat(txt['AKT II'].scenes)

let currentEl = document.body

export const setCurrent = (id: string) => {
  currentEl.style.border = null
  currentEl = document.getElementById(`txt-${id}`)!
  currentEl.style.border = `2px solid black`
  currentEl.scrollIntoView()
}

export const text = (actor: Actor) =>
  scenes.map(
    scene => `
  <div>
<h3 style="margin-left:48px">${scene.title}</h3>
${scene.plot
  .map(
    p => `<div id="txt-${p.id}" style="padding:4px;margin-left:${
      p.who ? 4 : 64
    }px;font-size:${p.who ? 18 : 12}px;${
      p.who === actor ? 'background-color:rgba(0,255,0,0.1)' : ''
    }">
  ${
    p.who
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