import { push } from 'react-router-redux'
import { client as apolloClient } from 'utils/ApolloClient'
import gql from 'graphql-tag'
import { detectMobileTouch } from 'utils/Utils'
import ApiClient from 'utils/ApiClient'
import { updateUser } from 'routes/Login/modules/login'

// ------------------------------------
// Constants
// ------------------------------------
// export const LOGIN = 'AUTH/LOGIN'
// export const LOGIN_FAIL = 'AUTH/LOGIN_FAIL'
// export const LOGIN_SUCCESS = 'AUTH/LOGIN_SUCCESS'

// import ApiClient from 'utils/ApiClient'

// import { showFlash as flash } from 'utils/Flash/modules/flash'
// import { push } from 'react-router-redux'

// ------------------------------------
// Actions
// ------------------------------------

export const actions = {}

export const checkLoginAndRedirect = (auth0User, onLoginFailed) => {
  return async (dispatch, getState) => {
    try {
      const [_, userId] = auth0User.sub ? auth0User.sub.split('|') : []
      let { user: currentUser } = getState().login || {}
      if (!currentUser || userId != currentUser._id) {
        const client = new ApiClient(dispatch, getState())
        const response = await client.get('/user')
        currentUser = response.user
        dispatch(updateUser(response.user))
      }
      // redirect to a shared organization buildings view (for MVP)
      if (detectMobileTouch() === 'mobile') {
        dispatch(
          push('/organization/' + currentUser.orgIds.slice(-1)[0] + '/building')
        )
      } else {
        const { data } = await apolloClient.query({
          query: gql`
            {
              enabledFeatures {
                name
              }
            }
          `,
          fetchPolicy: 'network-only'
        })

        const hasFeature =
          data.enabledFeatures &&
          data.enabledFeatures.some(feature => feature.name === 'portfolio')
        if (hasFeature) {
          dispatch(
            push(
              '/organization/' + currentUser.orgIds.slice(-1)[0] + '/portfolio'
            )
          )
        } else {
          dispatch(
            push(
              '/organization/' + currentUser.orgIds.slice(-1)[0] + '/building'
            )
          )
        }
      }
    } catch (e) {
      console.log(e)
      // Login action failed
      if (onLoginFailed) onLoginFailed()
    }
  }
}

// ------------------------------------
// Action Helpers
// ------------------------------------

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {}
export default function homeReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
