import { merge, fromEvent } from 'rxjs'
import { tap, map, startWith, finalize } from 'common'

const brightnessUI = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
<path fill="gray" d="M0 0h24v24H0V0z"/>
<path fill-opacity=".3" d="M18 9.52V6h-3.52L12 3.52 9.52 6H6v3.52L3.52 12 6 14.48V18h3.52L12 20.48 14.48 18H18v-3.52L20.48 12 18 9.52zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z"/>
<path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zm-2 5.79V18h-3.52L12 20.48 9.52 18H6v-3.52L3.52 12 6 9.52V6h3.52L12 3.52 14.48 6H18v3.52L20.48 12 18 14.48zM12 6v12c3.31 0 6-2.69 6-6s-2.69-6-6-6z"/>
</svg>`
const fullscreenUI = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
<path d="M0 0h24v24H0z" fill="gray"/>
<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
</svg>`

export const ui = () => `
  <div id="ctrl-ui" style="z-index:10;height:40px;position:fixed;bottom:0;width:100vw;display:flex;justify-content:space-between">
    <div id="ctrl-full" style="width:40px;height:40px">
      ${fullscreenUI}
    </div>

    <div id="ctrl-bright" style="width:40px;height:40px">
      ${brightnessUI}
    </div>
  </div>
`

export const logic = (root: HTMLElement) => {
  !document.getElementById('ctrl-ui') &&
    root.insertAdjacentHTML('beforeend', ui())
  return merge(
    fromEvent(document.getElementById('ctrl-bright')!, 'click').pipe(
      map(() => document.body.children[0] as HTMLDivElement),
      tap(t => {
        t.style.opacity = t.style.opacity === '0' ? '1' : '0'
        document.body.style.backgroundColor =
          t.style.opacity === '0' ? 'black' : 'white'
      })
    ),
    fromEvent(document.getElementById('ctrl-full')!, 'click').pipe(
      tap(() => document.documentElement.requestFullscreen())
    ),
    fromEvent(document.documentElement, 'fullscreenchange').pipe(
      startWith(true),
      tap(
        () =>
          (document.getElementById(
            'ctrl-full'
          )!.style.visibility = document.fullscreenElement
            ? 'hidden'
            : 'visible')
      )
    )
  )
}
