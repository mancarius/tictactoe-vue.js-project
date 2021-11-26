
import './styles/quasar.scss'
import iconSet from 'quasar/icon-set/fontawesome-v5.js'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'
import {
  Notify, Dialog
} from 'quasar';

// To be used on app.use(Quasar, { ... })
export default {
  config: {
    brand: {
      primary: '#f5f0dd',
      secondary: '#f1e9f4',
      accent: '#7ee0df',

      dark: '#383838',

      positive: '#66ba7a',
      negative: '#ba5965',
      info: '#a6d7e0',
      warning: '#f0cb67'
    }
  },
  plugins: {
    Notify,
    Dialog
  },
  iconSet: iconSet
}