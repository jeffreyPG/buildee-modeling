import React from 'react'
import PropTypes from 'prop-types'
import NavBar from './NavBar'

class ScrollableNavBar extends React.Component {
  static propTypes = {
    tabs: PropTypes.array,
    onScroll: PropTypes.func
  }

  render() {
    return <NavBar onChange={this.props.onScroll} tabs={this.props.tabs} />
  }
}

export default ScrollableNavBar
