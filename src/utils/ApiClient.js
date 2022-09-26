import superagent from 'superagent'
import { each as lodashEach, merge } from 'lodash'
import { push } from 'react-router-redux'
import config from '../../project.config'
import { logoutClear } from '../routes/Login/modules/login'
import { clearTemplateStore } from '../routes/Template/modules/template'
import { clearBuildingStore } from '../routes/Building/modules/building'
import { clearOrganizationStore } from '../routes/Organization/modules/organization'
import { createDigest } from './Utils'

const methods = ['get', 'post', 'put', 'patch', 'del']
const proto = !config.secure ? 'http://' : 'https://'

export default class ApiClient {
  static currentState = null
  static dispatch = null
  static getAccessTokenSilently = null
  static logout = null
  static isAuthenticated = false

  constructor(dispatch, currentState, abortRequestSend = false) {
    this.now = new Date().getTime()
    this.dispatch = dispatch
    this.currentState = currentState

    methods.forEach(method => {
      this[method] = (
        path,
        {
          params,
          data,
          headers,
          hmac,
          attachFiles,
          sendFullError,
          responseParser
        } = {}
      ) =>
        new Promise(async (resolve, reject) => {
          const request = superagent[method](proto + config.apiHost + path)
          let hmacSend = typeof hmac === 'undefined' || hmac

          if (headers) {
            lodashEach(headers, (headerValue, headerName) => {
              request.set(headerName, headerValue)
            })
          }

          if (headers && 'hmac' in headers) {
            hmacSend = headers.hmac
          }
          if (hmacSend) {
            if (ApiClient.getAccessTokenSilently) {
              const token = await ApiClient.getAccessTokenSilently({
                audience: 'https://dev-9v7hn33g.us.auth0.com/api/v2/',
                claim: 'read:current_user update:current_user_metadata'
              })
              request.set('Authorization', 'Bearer ' + token)
            }
          }

          if (responseParser) {
            request.parse(responseParser)
          }

          if (params) {
            request.query(params)
          }

          if (data) {
            request.send(data)
          }

          if (
            attachFiles &&
            attachFiles.length &&
            typeof attachFiles.map === 'function'
          ) {
            attachFiles.map(file => {
              request.attach(file.name || 'file', file)
            })
          }

          if (request.header.hasOwnProperty('hmac')) {
            delete request.header.hmac
          }

          request.end((err, { body, status } = {}) => {
            if (body && body.message === 'Hmac Authentication failed') {
              body.message =
                'Something went wrong, please log out and log back in'
              this.dispatch(clearBuildingStore())
              this.dispatch(clearTemplateStore())
              this.dispatch(clearOrganizationStore())
              this.dispatch(logoutClear())
              this.dispatch(push('/'))
            }
            if (status === 401 && body && body.message) {
              // Redirect to login if the expiration has passed
              if (
                this.currentState.login &&
                this.currentState.login.expiry &&
                this.currentState.login.expiry < this.now
              ) {
                this.dispatch(push('/'))
              }

              return reject(body.message || err)
            } else if (status === 403 && body && body.message) {
              this.dispatch(push('/'))
            } else if (
              body &&
              body.status &&
              body.status.toLowerCase() === 'error'
            ) {
              return reject(
                sendFullError
                  ? body
                  : body.message ||
                      new Error('Unexpected Error, Please try again later.')
              )
            }
            return err ? reject(body || err) : resolve(body)
          })
        })
    })
  }
}
