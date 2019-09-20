const fontFace = `
@font-face {
    font-family: "Roboto";
    src: url("/fonts/Roboto-Regular.ttf") format('truetype');
    font-weight: 400;
    font-style: normal;
}

@font-face {
  font-family: "Roboto";
  src: url("/fonts/Roboto-RegularItalic.ttf") format('truetype');
  font-weight: 400;
  font-style: Italic;
}

@font-face {
  font-family: "Roboto";
  src: url("/fonts/Roboto-Bold.ttf") format('truetype');
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: "Roboto";
  src: url("/fonts/Roboto-BoldItalic.ttf") format('truetype');
  font-weight: 700;
  font-style: italic;
}
`

export const loadFont = () => {
  document.head.insertAdjacentHTML('beforeend', `<style>${fontFace}</style>`)
  document.body.style.fontFamily = `'Roboto', sans-serif`
}
