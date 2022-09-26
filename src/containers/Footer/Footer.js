import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { push } from 'react-router-redux'
import classNames from 'classnames'
import styles from './Footer.scss'
import Logo from '../../components/Svg'

export class Footer extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,

    push: PropTypes.func.isRequired
  }

  render() {
    const { user } = this.props
    // If the user is in the forgot password flow then do not render the footer
    if (user.resetPassword) {
      return <span />
    }

    return (
      <div className={styles.footer}>
        <Link to="/">
          <Logo maxHeight={'twenty'} />
        </Link>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  user: state.login.user || {}
})
export default connect(
  mapStateToProps,
  {
    push
  }
)(Footer)
