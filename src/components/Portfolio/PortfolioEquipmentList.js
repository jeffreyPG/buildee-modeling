import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './PortfolioContainer.scss'

class PortfolioEquipmentList extends Component {
  static propTypes = {}
  state = {}

  UNSAFE_componentWillMount = () => {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    this.setState({ showExtras: false })
  }

  handleClickImportPM = () => {
    this.props.push('/portfolio')
  }

  handleToggleExtras = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras
    }))
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      // the click is inside, continue to menu links
      return
    }
    // otherwise, toggle (close) the dropdowns
    this.setState({ showExtras: false })
  }

  handleFilterChange = filters => {
    this.setState({ filters })
  }

  render() {
    return <div></div>
  }
}
export default PortfolioEquipmentList
