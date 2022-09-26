import React, { Component } from 'react'
import styles from './ProjectExtraDropdown.scss'
import PropTypes from 'prop-types'
import { PortalWithState } from 'react-portal'

class ProjectExtraDropdown extends Component {
  state = {
    top: 0,
    left: 0,
    closePortal: null
  }

  static propTypes = {
    project: PropTypes.object.isRequired
  }

  handleClick(closePortal) {
    if (this.node) {
      const element = this.node.getClientRects()[0]
      const top = element.top + window.scrollY + element.height - 5
      const left = element.left + window.scrollX - 260

      this.setState({ top, left, closePortal })
    }
  }

  handleEditProject = (project, closePortal) => {
    this.props.handleEditProject(project)
    closePortal()
  }

  handleCopyProject = (project, closePortal) => {
    this.props.handleCopyProject(project)
    closePortal()
  }

  handleCreateProject = (project, closePortal) => {
    this.props.handleCreateProject(project)
    closePortal()
  }

  handleOpenDeleteConfirmModal = (project, closePortal) => {
    this.props.handleOpenDeleteConfirmationModal(project)
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
    let {
      project,
      deleteText,
      finishText,
      copyText = '',
      createText = ''
    } = this.props
    if (project.target === 'measurePackage') {
      deleteText = 'Delete Measure Package'
    }
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
                  {!project.isComplete && project.target !== 'measurePackage' && (
                    <div
                      className={styles.extrasLink}
                      onClick={e =>
                        this.handleEditProject(project, args.closePortal)
                      }
                    >
                      <i className="material-icons">warning</i>
                      {finishText}
                    </div>
                  )}
                  {copyText && (
                    <div
                      className={styles.extrasLink}
                      onClick={e =>
                        this.handleCopyProject(project, args.closePortal)
                      }
                    >
                      <i className="material-icons">content_copy</i>
                      {copyText}
                    </div>
                  )}
                  {createText && (
                    <div
                      className={styles.extrasLink}
                      onClick={e =>
                        this.handleCreateProject(project, args.closePortal)
                      }
                    >
                      <i className="material-icons">content_copy</i>
                      {createText}
                    </div>
                  )}
                  <div
                    className={styles.extrasLink}
                    onClick={e =>
                      this.handleOpenDeleteConfirmModal(
                        project,
                        args.closePortal
                      )
                    }
                  >
                    <i className="material-icons">delete</i>
                    {deleteText}
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

export default ProjectExtraDropdown
