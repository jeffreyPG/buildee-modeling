import React from 'react'
import classNames from 'classnames'
import styles from './Loader.scss'

const Loader = props => {
  return (
    <div
      className={classNames(
        styles.loader,
        props.color === 'white' ? styles.loaderWhite : '',
        props.style === 'inline' ? styles.loaderInline : ''
      )}
    >
      {props.size === 'button' && (
        <svg
          className={classNames(styles.loaderSVG, styles.loaderButton)}
          viewBox="0 0 20 20"
          width="20px"
          height="17px"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className={classNames(
              styles.loaderCircle,
              styles.loaderCircleButton
            )}
            cx="10"
            cy="10"
            r="8"
          />
        </svg>
      )}
      {!props.size && (
        <svg
          className={styles.loaderSVG}
          viewBox="0 0 60 60"
          width="60px"
          height="60px"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className={classNames(styles.loaderCircle)}
            cx="30"
            cy="30"
            r="25"
          />
        </svg>
      )}
    </div>
  )
}

export default Loader
