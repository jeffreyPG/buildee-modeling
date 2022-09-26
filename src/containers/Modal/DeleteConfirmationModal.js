import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './DeleteConfirmationModal.scss'

export class DeleteConfirmationModal extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    confirmationFunction: PropTypes.func,
    onClose: PropTypes.func,
    itemToDelete: PropTypes.object,
    moveToTop: PropTypes.bool
  }

  state = {
    didMount: false,
    includedEquipment: [],
    deleteIncludedEquipment: false
  }

  UNSAFE_componentWillMount = () => {
    this.setState({ didMount: true })
  }

  componentDidMount = () => {
    const itemToDelete = this.props.itemToDelete || null
    const equipmentList = []

    if (itemToDelete) {
      if (itemToDelete.equipment && itemToDelete.equipment.length > 0) {
        itemToDelete.equipment.forEach(equip => equipmentList.push(equip._id))
      } else if (itemToDelete.sections) {
        itemToDelete.sections.forEach(section => {
          if (section.buildingEquipment.length > 0) {
            section.buildingEquipment.forEach(equip =>
              equipmentList.push(equip._id)
            )
          }
        })
      }
    }

    this.setState({ includedEquipment: equipmentList })
  }

  componentWillUnmount() {
    document.body.classList.remove('bodyModalOpen')
  }

  render() {
    const { includedEquipment } = this.state
    const { moveToTop } = this.props

    return (
      <div
        className={classNames(
          styles.modal,
          styles.templatesModal,
          styles['fade-in'],
          this.state.didMount ? styles.visible : '',
          moveToTop ? styles.maxZIndex : ''
        )}
      >
        <div className={classNames(styles.modalOuter, styles.modalOuterSmall)}>
          <div className={styles.modalInner}>
            <div className={styles.templates}>
              <div className={styles.templatesHeading}>
                <h2>Are you sure?</h2>
                <div
                  className={styles.modalClose}
                  onClick={() => this.props.onClose()}
                >
                  <i className='material-icons'>close</i>
                </div>
              </div>
              <div className={styles.templatesInner}>
                {this.props.flag === 'remove' ? (
                  <p>
                    Do you want to remove {<b>{this.props.title}</b> || 'this'}{' '}
                    from{' '}
                    {this.props.modeFrom === 'Proposal'
                      ? 'proposal'
                      : 'project'}
                    ?
                  </p>
                ) : (
                  <p>
                    Do you want to permanently delete{' '}
                    {<b>{this.props.title}</b> || 'this'}?
                  </p>
                )}
              </div>
              {includedEquipment && includedEquipment.length > 0 && (
                <div className={styles.checkboxContainer}>
                  <label>
                    <small>
                      Delete the {includedEquipment.length} included equipments?
                    </small>
                    <input
                      value={this.state.deleteIncludedEquipment}
                      type='checkbox'
                      id='deleteIncludedEquipment'
                      className={
                        this.state.deleteIncludedEquipment ? styles.checked : ''
                      }
                      onChange={() =>
                        this.setState({
                          deleteIncludedEquipment: !this.state
                            .deleteIncludedEquipment
                        })
                      }
                    />
                    <span />
                  </label>
                </div>
              )}
              <div className={styles.templatesButtons}>
                <button
                  type='button'
                  className={classNames(styles.button, styles.buttonDelete)}
                  onClick={event => {
                    event.stopPropagation()
                    this.props.onClose()
                  }}
                >
                  NO
                </button>
                <button
                  type='button'
                  className={classNames(styles.button, styles.buttonPrimary)}
                  onClick={event => {
                    event.stopPropagation()
                    if (this.state.deleteIncludedEquipment) {
                      this.props.confirmationFunction(includedEquipment)
                    } else {
                      this.props.confirmationFunction()
                    }
                    this.props.onClose()
                  }}
                  data-test='delete-confirmation'
                >
                  YES
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default DeleteConfirmationModal
