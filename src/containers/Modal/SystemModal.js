import React from 'react'
import PropTypes from 'prop-types'

import SystemForm from '../Form/SystemForms/SystemForm'
import Modal from '../../components/UI/Modal'

const TABS = ['Details', 'Comments', 'Images']

function getCretedUserName(system = {}) {
  return system && system.createdByUserId ? system.createdByUserId.name : null
}

export class SystemModal extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    organization: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    modalView: PropTypes.oneOf(['viewSystem', 'addSystem', 'editSystem'])
      .isRequired,
    system: PropTypes.object
  }

  UNSAFE_componentWillMount() {
    if (this.props.modalView !== 'addSystem') {
      const systemNames = this.props.system.sections.map(
        section => section.name
      )
      this.handleSelect(systemNames)
    } else {
      let initialTabs = ['Details']
      this.setState({
        sections: TABS.map(tab => {
          return {
            name: tab,
            active:
              this.props.modalView !== 'addSystem' || initialTabs.includes(tab)
          }
        })
      })
    }
  }

  handleSelect = systemNames => {
    this.setState({
      sections: ['Details']
        .concat(systemNames, ['Comments', 'Images'])
        .map(tab => ({
          name: tab,
          active: true
        }))
    })
  }

  render() {
    const { modalView, user, onClose } = this.props
    const { sections } = this.state
    const activeTabs = sections
      .filter(section => section.active === true)
      .map(activeSection => activeSection.name)

    let headerText
    switch (modalView) {
      case 'viewSystem':
        headerText = 'View System'
        break
      case 'addSystem':
        headerText = 'Add System'
        break
      case 'editSystem':
        headerText = 'Edit System'
        break
    }
    const createdUser = getCretedUserName(this.props.system)
    return (
      <Modal
        tabs={activeTabs}
        subheadline={headerText}
        description={createdUser ? `Author: ${createdUser}` : ''}
        onClose={onClose}
      >
        <SystemForm
          {...this.props}
          mode={modalView}
          onSelect={this.handleSelect}
        />
      </Modal>
    )
  }
}
export default SystemModal
