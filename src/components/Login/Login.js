import React, { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import styles from './Login.scss'
import { Loader } from 'utils/Loader'

const Login = push => {
  const { isAuthenticated, loginWithRedirect } = useAuth0()
  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect()
    } else {
      push('/')
    }
  }, [isAuthenticated, loginWithRedirect, push])
  return (
    <div className={styles.container}>
      <Loader />
      <span>Getting your login information...</span>
    </div>
  )
}

export default Login
