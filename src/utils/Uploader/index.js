import { injectReducer } from '../../store/reducers'

export const loaderBootstrap = (store = {}) => {
  const reducer = require('./modules/uploader').default

  injectReducer(store, { key: 'uploader', reducer })
}
