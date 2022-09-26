import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import projectStyles from '../ProjectsModal.scss'
import styles from '../ScenarioModal.scss'
import { MeasurePackageForm } from '../../Form/MeasurePackageForms'
import { ScenarioMeasurePackageForm } from '../../Form/ScenarioMeasurePackageForms'

export default class MeasurePackageModal extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    viewMode: PropTypes.oneOf(['addMeasurePackage', 'editMeasurePackage']),
    projectPackage: PropTypes.object
  }

  render() {
    const { user, viewMode, onClose } = this.props

    let headerText, text
    switch (viewMode) {
      case 'addMeasurePackage':
        text = 'Add Measure Package'
        headerText = 'New Measure package'
        break
      case 'editMeasurePackage':
        headerText = 'Edit Measure Package'
        text = 'Measure Package Details'
        break
    }
    let description = `Author: ${user.email}`
    let page = this.props.page || 'building'
    return (
      <div
        data-test="projects-modal"
        className={classNames(projectStyles.projectsModal)}
      >
        <div
          className={classNames(
            projectStyles.projectsModalHeader,
            styles.modalHeader
          )}
        >
          <div className={projectStyles.projectsModalTitle}>
            <div className={projectStyles.container}>
              <h3>{headerText}</h3>
              <div
                className={projectStyles.projectsModalClose}
                onClick={() => onClose()}
              >
                <i className="material-icons">close</i>
              </div>
            </div>
          </div>
          <div className={styles.detail}>
            <div className={styles.container}>
              <h3>{text}</h3>
              <span>{description}</span>
            </div>
          </div>
        </div>
        {page === 'building' && (
          <MeasurePackageForm {...this.props} mode={viewMode} />
        )}
        {page === 'scenario' && (
          <ScenarioMeasurePackageForm {...this.props} mode={viewMode} />
        )}
      </div>
    )
  }
}
