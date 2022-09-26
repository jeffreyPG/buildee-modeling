import { injectReducer } from '../../store/reducers'

export const flashBootstrap = (store = {}) => {
  const reducer = require('./modules/flash').default

  injectReducer(store, { key: 'flash', reducer })
}
