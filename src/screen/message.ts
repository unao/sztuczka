export const smsUI = (who: string, msg: string) =>
  `<div style="width:320px;color:white">
    <b style="font-size:24px">${who}</b>
    <div style="font-size:48px;max-width:320px;
      border-radius:30px;
      background:black;padding:32px;
      border:2px solid white">
      ${msg}
    </div>

  </div>`
