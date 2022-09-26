import React, { useCallback, useEffect } from 'react'
import Logo from '../../components/Svg'
import classNames from 'classnames'
import styles from './Home.scss'
import { useAuth0 } from '@auth0/auth0-react'
import { Loader } from 'utils/Loader'

const Home = ({ user, push, checkLoginAndRedirectAction }) => {
  const {
    loginWithRedirect,
    isLoading,
    isAuthenticated,
    user: auth0User,
    error,
    logout
  } = useAuth0()
  useEffect(() => {
    if (!isLoading) checkLoginAndRedirect()
  }, [isLoading])
  const isAccessDenied = error && error.error === 'access_denied'
  const checkLoginAndRedirect = useCallback(() => {
    if (isAuthenticated && auth0User) {
      checkLoginAndRedirectAction(auth0User, logout)
    } else {
      if (!isAccessDenied) loginWithRedirect()
    }
  }, [isAuthenticated, user, auth0User, push])

  return (
    <div className={styles.home}>
      {isLoading || !isAccessDenied ? (
        <div className={styles.loadingContainer}>
          <Loader />
          <span>Getting your login information...</span>
        </div>
      ) : (
        <div className={styles.containerSmall}>
          <div className={styles.homeLogo}>
            <Logo maxHeight={'home'} />
          </div>
          {isAccessDenied && (
            <div className={styles.error}>{error.message}</div>
          )}
          <div className={styles.homeCTAs}>
            {isAccessDenied && (
              <button
                onClick={logout}
                className={classNames(styles.button, styles.buttonPrimary)}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
