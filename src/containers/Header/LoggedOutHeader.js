import React from 'react'
import { IndexLink, Link } from 'react-router'
import styles from './LoggedOutHeader.scss'
import Logo from '../../components/Svg'

export const LoggedOutHeader = () => (
  <div className={styles.loggedOutHeader}>
    <div className={styles.container}>
      <div className={styles.loggedOutHeaderLeft}>
        <IndexLink to="/" activeClassName={styles.activeRoute}>
          <Logo maxHeight={'twenty'} />
        </IndexLink>
      </div>
    </div>
  </div>
)

export default LoggedOutHeader
