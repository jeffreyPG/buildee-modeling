import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import classNames from 'classnames'
import styles from './DropdownMenu.scss'

class DropdownMenu extends Component {
  static propTypes = {
    options: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    selectedView: PropTypes.string
  }

  state = {
    showExtras: false
  }

  UNSAFE_componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      // the click is inside, continue to menu links
      return
    }
    // otherwise, toggle (close) the dropdowns
    this.setState({ showExtras: false })
  }

  handleToggleExtra = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras
    }))
  }

  render() {
    const { showExtras } = this.state
    let { selectedView = '', options } = this.props
    let selectedOption = _.find(options, { value: selectedView })
    if (!selectedOption) {
      selectedOption = options[0]
      selectedView = (options && options[0] && options[0].value) || ''
    }

    return (
      <div
        onClick={this.handleToggleExtra}
        className={classNames(
          styles.extras,
          showExtras ? styles.extrasShow : styles.extrasHide,
          styles.dropDownMenu
        )}
        ref={node => (this.node = node)}
      >
        <div className={styles.dropDownMenuSelected}>
          <span>{(selectedOption && selectedOption.label) || ''}</span>
          {showExtras ? (
            <i className="material-icons">expand_less</i>
          ) : (
            <i className="material-icons">expand_more</i>
          )}
        </div>
        <div
          className={classNames(
            styles.extrasDropdown,
            styles.extrasDropdownRight,
            styles.dropDownMenuList
          )}
        >
          {options &&
            options.map((option, index) => (
              <div
                className={classNames(
                  styles.extrasLink,
                  selectedOption.value === option.value
                    ? styles.dropDownMenuActive
                    : ''
                )}
                key={index}
                onClick={() => this.props.onSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
        </div>
      </div>
    )
  }
}

export default DropdownMenu
