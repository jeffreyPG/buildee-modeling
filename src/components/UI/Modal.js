import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import ScrollableNavBar from './ScrollableNavBar'
import styles from './Modal.scss'

const MODAL_OPEN_CLASS = 'bodyModalOpen'

export class Modal extends React.Component {
  constructor(props) {
    super(props)
    this.modalRef = null
    this.sections = {}
  }

  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]).isRequired,
    subheadline: PropTypes.string.isRequired,
    tabs: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    steps: PropTypes.arrayOf(PropTypes.string),
    currentStepIndex: PropTypes.number
  }

  componentWillUnmount() {
    document.body.classList.remove(MODAL_OPEN_CLASS)
  }

  handleScroll = tab => {
    const section = this.sections[tab]
    if (section) {
      this.modalRef.scrollTo(0, section.offsetTop - 152)
    }
  }

  setSectionRef = ({ title, element }) => {
    this.sections[title] = element
  }

  render() {
    const {
      children,
      subheadline,
      description,
      onClose,
      tabs,
      steps = [],
      currentStepIndex = 0
    } = this.props

    return (
      <div ref={ref => (this.modalRef = ref)} className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <div className={styles.container}>
              <h3>{subheadline}</h3>
              <span>{description}</span>
              <div className={styles.modalClose} onClick={onClose}>
                <i className="material-icons">close</i>
              </div>
            </div>
          </div>
          {steps.length > 0 && (
            <div className={classNames(styles.modalStepper, styles.container)}>
              <div className={styles.modalStepperContainer}>
                {steps.map((stepName, index) => (
                  <div
                    className={classNames(
                      styles.modalStep,
                      index <= currentStepIndex
                        ? styles.modalStepDone
                        : styles.modalStepPending
                    )}
                  >
                    <span>
                      {index >= currentStepIndex ? (
                        index + 1
                      ) : (
                        <i className="material-icons">check</i>
                      )}
                    </span>
                    {stepName}
                    {index < steps.length - 1 && (
                      <div className={styles.modalStepperLine} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tabs && (
            <div className={styles.modalTabs}>
              <ScrollableNavBar tabs={tabs} onScroll={this.handleScroll} />
            </div>
          )}
        </div>
        {React.Children.map(children, child =>
          React.cloneElement(child, {
            setSectionRef: this.setSectionRef
          })
        )}
      </div>
    )
  }
}
export default Modal
