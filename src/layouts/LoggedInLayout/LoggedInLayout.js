import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Offline } from 'react-detect-offline'

import Flash from 'utils/Flash/components/Flash'
import { OfflineFlash } from './OfflineFlash'
import { LoggedInHeader, SubHeader } from 'containers/Header'
import { withAuthenticationRequired } from '@auth0/auth0-react'

import styles from './LoggedInLayout.scss'
import 'styles/main.scss'
import AuthCheckView from 'components/AuthCheckView/AuthCheckView'

export const LoggedInLayout = ({ children, location }) => (
  <div className={styles['logged-in-layout']}>
    <div className={styles['logged-in-layout__header']}>
      <LoggedInHeader location={location} />
    </div>

    <div className={styles['logged-in-layout__header']}>
      <SubHeader location={location} />
    </div>

    <div className={styles['logged-in-layout__flash']}>
      <Flash />
    </div>

    <div className={styles['logged-in-layout__viewport']}>{children}</div>
    <Offline>
      <OfflineFlash />
    </Offline>
  </div>
)

LoggedInLayout.propTypes = {
  children: PropTypes.element.isRequired
}

export default withAuthenticationRequired(LoggedInLayout, {
  onRedirecting: () => <AuthCheckView />
})
