import * as F from 'firebase/app'
import 'firebase/storage'
import { Actor } from 'common'
import { defer } from 'rxjs'

F.initializeApp({
  apiKey: 'AIzaSyBEab6rgh5TpMyRGSjcIy_OmUV_xD1laLg',
  projectId: 'g25-luna',
  storageBucket: 'g25-luna.appspot.com',
  appId: '1:812444916025:web:007c91e2b45db16152b0e8'
})

export const listAll = (actor: Actor) =>
  defer(() =>
    F.storage()
      .ref(`/${actor}/`)
      .listAll()
  )

export const saveRec = (a: Actor, f: File) =>
  defer(() =>
    F.storage()
      .ref(`/${a}/${f.name}`)
      .put(f)
  )
