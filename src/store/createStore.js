import {
  applyMiddleware,
  compose,
  combineReducers,
  createStore as createReduxStore
} from 'redux'
import thunk from 'redux-thunk'
import { browserHistory } from 'react-router'
import makeRootReducer from './reducers'

import { routerMiddleware, LOCATION_CHANGE } from 'react-router-redux'

import * as storage from 'redux-storage'
import createEngine from 'redux-storage-engine-localstorage'
import filter from 'redux-storage-decorator-filter'

import config from '../../project.config'

const localStorageKey = config.localStorageKey || 'default-app'

const createStore = (initialState = {}, history) => {
  // Look for localstorage data and rehydrate the redux store from this
  const engine = filter(createEngine(localStorageKey), [
    'login',
    'organization',
    'building',
    'utility',
    'analysis',
    'docuSign'
    // 'template'
  ])
  const localStorageMiddleware = storage.createMiddleware(engine, [
    LOCATION_CHANGE
  ])
  try {
    let checkLocalStore = localStorage.getItem(localStorageKey)
    initialState = Object.assign(
      {},
      initialState,
      checkLocalStore ? JSON.parse(checkLocalStore) : {}
    )
  } catch (err) {
    if (__DEV__) {
      // if (__DEBUG__ || __DEV__) {
      console.log(
        'Error setting initial state from local storage. Error: ',
        err
      )
    }
  }

  // ======================================================
  // Middleware Configuration
  // ======================================================
  const middleware = [thunk, localStorageMiddleware, routerMiddleware(history)]

  // ======================================================
  // Store Enhancers
  // ======================================================
  const enhancers = []
  let composeEnhancers = compose

  if (__DEV__) {
    if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
      composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    }
  }

  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  const store = createReduxStore(
    makeRootReducer(),
    initialState,
    composeEnhancers(applyMiddleware(...middleware), ...enhancers)
  )
  store.asyncReducers = {}

  const load = storage.createLoader(engine)
  load(store)
    .then(newState => {
      if (__DEV__) {
        // if (__DEBUG__ || __DEV__) {
        console.log('Loaded state:', newState)
      }
    })
    .catch(() => console.log('Failed to load previous state'))

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const reducers = require('./reducers').default
      store.replaceReducer(reducers(store.asyncReducers))
    })
  }

  return store
}

export default createStore
