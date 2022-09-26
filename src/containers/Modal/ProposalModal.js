import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import projectStyles from './ProjectsModal.scss'
import styles from './ScenarioModal.scss'
import { ProposalForm } from '../Form/ProjectForms'
import { PortfolioProposalForm } from 'containers/Form/PortfolioProposalForms'

export default class ProposalModal extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    viewMode: PropTypes.oneOf(['addProposal', 'editProposal', 'copyProposal'])
  }

  render() {
    let { user, viewMode, onClose, proposal, proposalMode } = this.props
    if (!proposalMode) {
      proposalMode = proposal && proposal.mode
    }

    let headerText, text
    switch (viewMode) {
      case 'addProposal':
        text = 'Add Proposal'
        headerText = 'New Proposal'
        break
      case 'copyProposal':
        text = 'Copy Proposal'
        headerText = 'New Proposal'
        break
      case 'editProposal':
        headerText = 'Edit Proposal'
        text = 'Proposal Details'
        break
    }
    let description = `Author: ${user.email}`
    return (
      <div
        data-test="proposal-modal"
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
        {proposalMode === 'Measure' || proposalMode === 'Project' ? (
          <ProposalForm {...this.props} mode={viewMode} />
        ) : (
          <PortfolioProposalForm
            {...this.props}
            mode={viewMode}
            proposalMode={
              proposalMode === 'PortfolioMeasure' ? 'Measure' : 'Project'
            }
            buildingLevel={true}
            buildingId={this.props.building && this.props.building._id}
          />
        )}
      </div>
    )
  }
}
