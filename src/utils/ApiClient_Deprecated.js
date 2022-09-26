import superagent from 'superagent'
import { each as lodashEach } from 'lodash'
import { push } from 'react-router-redux'
import { useDispatch } from 'react-redux'
import { useAuth0 } from '@auth0/auth0-react'
import { useCallback } from 'react'
import config from '../../project.config'

const methods = ['get', 'post', 'put', 'patch', 'del']
const proto = !config.secure ? 'http://' : 'https://'

const makeRequest = (path, dispatch) => {
  return methods.reduce((agg, method) => {
    agg[method] = path =>
      new Promise(async (resolve, reject) => {
        const { params, data, headers, hmac, attachFiles, sendFullError } = {}
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
          if (_client.isAuthenticated) {
            const token = await _client.getTokenSilently({
              audience: 'https://dev-9v7hn33g.us.auth0.com/api/v2/',
              claim: 'read:current_user update:current_user_metadata'
            })
            request.set('Authorization', 'Bearer ' + token)
          }
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
            dispatch(clearBuildingStore())
            dispatch(clearTemplateStore())
            dispatch(clearOrganizationStore())
            dispatch(logoutClear())
            dispatch(push('/'))
          }
          if (status === 401 && body && body.message) {
            // Redirect to login if the expiration has passed
            // if (
            //   currentState.login &&
            //   currentState.login.expiry &&
            //   currentState.login.expiry < now
            // ) {
            //   dispatch(push('/'))
            // }

            return reject(body.message || err)
          } else if (status === 403 && body && body.message) {
            dispatch(push('/'))
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
    return agg
  }, {})
}

const makeRequest1 = method => async (path, params) => {}

const apiClient = () => {
  return methods.reduce((agg, method) => {
    agg[method] = makeRequest1(method)
  }, {})
}

export const useRequest = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const dispatch = useDispatch()
  //   const apiClient = methods.reduce((agg, method) => {
  //     agg[method] = useCallback(async (path, params = {}) => {
  //         try {
  //             const accessToken = isAuthenticated
  //                 ? await getAccessTokenSilently()
  //                 : null;
  //             const token = await getAccessTokenSilently()
  //             console.log(isAuthenticated, user, token);
  //             let updatedHeaders = {...params.headers}
  //             if(accessToken) {
  //                 updatedHeaders = {
  //                     ...updatedHeaders,
  //                     // Add the Authorization header to the existing headers
  //                     Authorization: `Bearer ${accessToken}`
  //                 }
  //             }
  //             const { body, status } = await superagent(method, proto + config.apiHost + path).set(updatedHeaders);
  //             return body;
  //         } catch(err) {
  //             console.log(err);
  //         }
  //     }, [isAuthenticated, getAccessTokenSilently, dispatch])
  //     return agg;
  //   }, {})
  //   return {
  //     apiClient
  //   }
  const memoizedFn = useCallback(
    async (endpoint, params = {}) => {
      try {
        const accessToken = isAuthenticated
          ? await getAccessTokenSilently()
          : null
        const token = await getAccessTokenSilently()
        let updatedHeaders = { ...params.headers }
        if (accessToken) {
          updatedHeaders = {
            ...updatedHeaders,
            // Add the Authorization header to the existing headers
            Authorization: `Bearer ${accessToken}`
          }
        }
        console.log(isAuthenticated, token)
        const { body, status } = await superagent(
          params.method || 'GET',
          proto + config.apiHost + endpoint
        ).set(updatedHeaders)
        return body
      } catch (err) {
        console.log(err)
      }
    },
    [isAuthenticated, getAccessTokenSilently, dispatch]
  )
  return {
    apiClient: memoizedFn
  }
}

export default useRequest
