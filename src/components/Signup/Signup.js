import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import styles from './Signup.scss'
import { TermsOfUseModal } from '../../containers/Modal'
import { SignupForm } from 'containers/Form/SignupForm'

export class Signup extends React.Component {
  static propTypes = {
    signup: PropTypes.func.isRequired,
    clearViewState: PropTypes.func.isRequired
  }

  state = {
    termsOfUseModal: false
  }

  UNSAFE_componentWillMount() {
    const { query } = this.props.location
    this.props.clearViewState()
  }

  openTermsModal = bool => {
    this.setState({ termsOfUseModal: bool })
  }

  render() {
    const { signup } = this.props
    let orgId = ''
    let initialValues = {}
    if (this.props.location.query && this.props.location.query.orgId) {
      orgId = this.props.location.query.orgId
    }

    if (this.props.location.query && this.props.location.query.email) {
      initialValues = { email: this.props.location.query.email }
    }

    return (
      <div className={styles.signup}>
        <div className={styles.containerSmall}>
          <h1>Sign Up</h1>

          {this.state.termsOfUseModal && (
            <TermsOfUseModal openTermsModal={this.openTermsModal} />
          )}

          <SignupForm
            processSubmit={signup}
            orgId={orgId}
            initialValues={initialValues}
            openTermsModal={this.openTermsModal}
          />

          <div className={styles.signupCTAs}>
            Already Have an Account?{' '}
            <Link to="/login" className={styles.signupLink}>
              Login
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

export default Signup
