import React, { Component } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import styles from './ProjectInfo.scss'

class ProjectInfo extends Component {
  static propTypes = {
    handleCloseModal: PropTypes.func.isRequired,
    currentProject: PropTypes.object.isRequired
  }

  state = {
    showSource: false
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      return
    }
    this.props.handleCloseModal()
  }

  toggleSource = () => {
    this.setState(prevState => ({
      showSource: !prevState.showSource
    }))
  }

  render() {
    const { currentProject, handleCloseModal } = this.props

    return (
      <div className={styles.projectInfo} ref={node => (this.node = node)}>
        <div className={styles.projectInfoHeader}>
          <span>Measure Info</span>
          <i
            className={classNames('material-icons', styles.closeIcon)}
            onClick={handleCloseModal}
          >
            close
          </i>
        </div>
        {currentProject &&
          currentProject.incentive &&
          currentProject.incentive.application_link && (
            <div className={styles.projectInfoInput}>
              <label>Link to Application</label>
              <p>
                <a
                  href={currentProject.incentive.application_link}
                  target="_blank"
                >
                  {currentProject.incentive.application_link}
                </a>
              </p>
            </div>
          )}

        {currentProject && currentProject.source && (
          <div className={styles.projectInfoInput}>
            <div className={styles.projectInfoSource}>
              <small onClick={this.toggleSource}>
                {this.state.showSource
                  ? 'Hide Calculation Description '
                  : 'Show Calculation Description '}
              </small>
              {this.state.showSource && (
                <a
                  href={currentProject.source.match(
                    /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim
                  )}
                  target="_blank"
                >
                  {currentProject.source.replace(
                    /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim,
                    ''
                  )}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
}
export default ProjectInfo
