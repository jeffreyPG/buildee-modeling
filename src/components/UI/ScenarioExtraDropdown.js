import React, { Component } from 'react'
import styles from './ProjectExtraDropdown.scss'
import PropTypes from 'prop-types'
import { PortalWithState } from 'react-portal'

class ScenarioExtraDropdown extends Component {
  state = {
    top: 0,
    left: 0,
    closePortal: null
  }

  static propTypes = {
    scenario: PropTypes.object.isRequired
  }

  handleClick(closePortal) {
    if (this.node) {
      const element = this.node.getClientRects()[0]
      const top = element.top + window.scrollY + element.height - 5
      const left = element.left + window.scrollX - 260

      this.setState({ top, left, closePortal })
    }
  }

  handleOpenConvertModal = (scenario, closePortal) => {
    this.props.handleOpenConvertModal(scenario)
    closePortal()
  }

  handleOpenDeleteConfirmModal = (scenario, closePortal) => {
    this.props.handleRemoveScenario(scenario)
    closePortal()
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (nextProps.index != nextProps.currentIndex) {
      const { closePortal } = this.state
      closePortal && closePortal()
    }
  }

  hidePortal = closePortal => {
    if (this.props.index != this.props.currentIndex) closePortal()
  }

  render() {
    const { top, left } = this.state
    const { scenario } = this.props
    return (
      <PortalWithState closeOnOutsideClick closeOnEsc>
        {args => {
          return (
            <div>
              <span
                className={styles.extrasButton}
                onClick={e => {
                  this.props.handleToggleExtras(this.props.index)
                  args.openPortal(e)
                  this.handleClick(args.closePortal)
                }}
                ref={node => {
                  this.node = node
                }}
              />
              {this.hidePortal(args.closePortal)}
              {args.portal(
                <div
                  id="portal"
                  style={{ zIndex: '90', position: 'absolute', top, left }}
                  className={styles.extrasDropdown}
                >
                  <div
                    className={styles.extrasLink}
                    onClick={e =>
                      this.handleOpenConvertModal(scenario, args.closePortal)
                    }
                  >
                    <i className="material-icons">loop</i>
                    {'Convert to Project'}
                  </div>
                  <div
                    className={styles.extrasLink}
                    onClick={e =>
                      this.handleOpenDeleteConfirmModal(
                        scenario,
                        args.closePortal
                      )
                    }
                  >
                    <i className="material-icons">delete</i>
                    {'Delete Scenario'}
                  </div>
                </div>
              )}
            </div>
          )
        }}
      </PortalWithState>
    )
  }
}

export default ScenarioExtraDropdown
