import React from 'react'
import PropTypes from 'prop-types'
import { ProfileTermsText } from '../../components/Profile'
import Logo from '../../components/Svg'
import classNames from 'classnames'
import styles from './TermsOfUseModal.scss'

export class TermsOfUseModal extends React.Component {
  static propTypes = {
    openTermsModal: PropTypes.func.isRequired
  }

  state = {
    didMount: false
  }

  componentDidMount = () => {
    setTimeout(() => {
      this.setState({ didMount: true })
    }, 0)
  }

  render() {
    return (
      <div
        className={classNames(
          styles.modal,
          styles.termsModal,
          styles['fade-in'],
          this.state.didMount ? styles.visible : ''
        )}
      >
        <div className={styles.modalOuter}>
          <div className={styles.modalInner}>
            <div className={styles.terms}>
              <div
                className={styles.modalClose}
                onClick={() => this.props.openTermsModal(false)}
              >
                <i className="material-icons">close</i>
              </div>
              <h3>Welcome to</h3>
              <Logo maxHeight={'home'} />
              <div className={styles.termsText}>
                <ProfileTermsText />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default TermsOfUseModal
