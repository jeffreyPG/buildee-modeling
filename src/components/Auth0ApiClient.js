import { useAuth0 } from '@auth0/auth0-react'
import React, { Fragment, useEffect } from 'react'
import ApiClient from 'utils/ApiClient'

export default function() {
  const { getAccessTokenSilently, logout, isAuthenticated } = useAuth0()
  useEffect(() => {
    ApiClient.getAccessTokenSilently = getAccessTokenSilently
    ApiClient.isAuthenticated = isAuthenticated
    ApiClient.logout = logout
  }, [getAccessTokenSilently, logout, isAuthenticated])
  return <Fragment></Fragment>
}
