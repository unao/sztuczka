import { Plot } from './state'
import { of } from 'rxjs'

const txtUI = (plot: Plot) =>
  `<div style="padding:8px;max-width:80%">
    ${plot
      .map(
        p => `<div id="txt-${p.id}" style="padding:4px;margin-left:${
          p.who ? 0 : 64
        }px;font-size:${p.who ? 18 : 12}px;">
  ${p.who ? `<div style="color:black"><b>${p.who}: </b></div>` : ''}
  ${p.what}
    </div>`
      )
      .join('')}
  </div>`

export const handleScene = (plot: Plot, root: HTMLDivElement) => {
  root.innerHTML = txtUI(plot)
  return of(true)
}
