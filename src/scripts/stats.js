const p = require('../assets/parsed')

let total = 0
const reduceScenes = (s, a = {}) => s.reduce((acc, p) => acc.concat(p.plot), [])
  .reduce((acc, p) => {
    if (p.who) {
      acc[p.who] = (acc[p.who] || 0) + p.what.length
      total += p.what.length
    }
    return acc
  }, a)

const r = {}
reduceScenes(p['AKT I'].scenes, r)
reduceScenes(p['AKT II'].scenes, r)
console.log(total, r)