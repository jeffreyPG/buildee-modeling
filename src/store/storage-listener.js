import config from '../../project.config'

let localStorageKey = config.localStorageKey || 'default-app'
export function createStorageListener(store) {
  return () => {
    const wrappedAction = JSON.parse(localStorage.getItem(localStorageKey))
    if (
      wrappedAction &&
      wrappedAction.docuSign &&
      wrappedAction.docuSign.code
    ) {
      let storeCode = store.getState().docuSign.code || ''
      if (storeCode !== wrappedAction.docuSign.code)
        store.dispatch({
          type: 'DOCUSIGN/SET_CODE',
          code: wrappedAction.docuSign.code
        })
    }
    if (
      wrappedAction &&
      wrappedAction.docuSign &&
      wrappedAction.docuSign.embeddedSignStatus
    ) {
      let storeEmbeddedSignStatus =
        store.getState().docuSign.embeddedSignStatus || ''
      if (storeEmbeddedSignStatus !== wrappedAction.docuSign.embeddedSignStatus)
        store.dispatch({
          type: 'DOCUSIGN/SET_EMBEDDED_STATUS',
          status: wrappedAction.docuSign.embeddedSignStatus
        })
    }
  }
}
