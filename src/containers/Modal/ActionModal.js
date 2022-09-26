import React from 'react'
import PropTypes from 'prop-types'

import ActionForm from '../Form/ActionForms/ActionForm'
import Modal from '../../components/UI/Modal'

const TABS = ['Details', 'Contacts', 'Comments']

export default class ActionModal extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    modalView: PropTypes.oneOf(['viewAction', 'addAction', 'editAction'])
      .isRequired,
    action: PropTypes.object
  }

  UNSAFE_componentWillMount() {
    const initialTabs = ['Details']
    this.setState({
      sections: TABS.map(tab => {
        return {
          name: tab,
          active:
            this.props.modalView !== 'addAction' || initialTabs.includes(tab)
        }
      })
    })
  }

  handleSelect = () => {
    this.setState({
      sections: this.state.sections.map(section => ({
        ...section,
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
      case 'viewAction':
        headerText = 'View Action'
        break
      case 'addAction':
        headerText = 'Add Action'
        break
      case 'editAction':
        headerText = 'Edit Action'
        break
    }
    return (
      <Modal
        tabs={activeTabs}
        subheadline={headerText}
        description={`Author: ${user.email}`}
        onClose={onClose}
      >
        <ActionForm
          {...this.props}
          mode={modalView}
          onSelect={this.handleSelect}
        />
      </Modal>
    )
  }
}
