import React from 'react'
import PropTypes from 'prop-types'
import styles from './LoggedInHeader.scss'
import classNames from 'classnames'
import { parentNodeHasClass } from 'utils/Utils'

export class AppDropdown extends React.Component {
  static propTypes = {
    push: PropTypes.func.isRequired,
    updateUserProducts: PropTypes.func.isRequired,
    products: PropTypes.object.isRequired
  }

  state = {
    showAppDropdown: false
  }

  UNSAFE_componentWillMount = () => {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick = e => {
    // the click is inside, continue to menu links
    if (parentNodeHasClass(e.target, 'appMenuClick')) return
    // otherwise, toggle (close) the app dropdown
    this.closeAppDropdown()
  }

  closeAppDropdown = () => {
    this.setState({ showAppDropdown: false })
  }

  toggleAppDropdown = () => {
    this.setState({ showAppDropdown: !this.state.showAppDropdown })
  }

  handleClickEa = event => {
    event.preventDefault()
    window.location.assign('http://ea.simuwatt.com/')
    this.toggleAppDropdown()
  }

  handleClickNYCModule = event => {
    event.preventDefault()
    let tempProducts = { ...this.props.products }
    tempProducts.buildeeNYC =
      this.props.products.buildeeNYC === 'show' ? 'access' : 'show'
    this.props.updateUserProducts(tempProducts)
    this.toggleAppDropdown()
  }

  render() {
    const { products } = this.props

    if (products && (!products.buildeeNYC || products.buildeeNYC === 'hide'))
      return null

    return (
      <div>
        <a
          className={'appMenuClick'}
          onClick={e => this.toggleAppDropdown(e)}
          title="Apps"
        >
          <i className={classNames('material-icons', styles.appsIcon)}>apps</i>
        </a>
        {this.state.showAppDropdown && (
          <ul
            className={classNames(styles.appDropdown, 'appMenuClick')}
            ref={node => (this.node = node)}
          >
            <li onClick={e => this.handleClickNYCModule(e)}>
              <div title="nycModule">
                <i className="material-icons">subway</i>
                buildee NYC
                {products.buildeeNYC === 'access' && (
                  <i className="material-icons">check</i>
                )}
              </div>
            </li>
          </ul>
        )}
      </div>
    )
  }
}

export default AppDropdown
