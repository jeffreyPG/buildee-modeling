import React from 'react'
import styles from './AuthCheckView.scss'
import { Loader } from 'utils/Loader'

const AuthCheckView = () => {
  return (
    <div className={styles.container}>
      <Loader />
      <span>Getting your login information...</span>
    </div>
  )
}

export default AuthCheckView
