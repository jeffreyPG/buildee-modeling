import React from 'react'
import styles from './Form.scss'
import PropTypes from 'prop-types'

export class FormSection extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    children: PropTypes.any,
    setSectionRef: PropTypes.func
  }

  render() {
    const { title, description, children, setSectionRef } = this.props

    return (
      <div
        className={styles.formSection}
        ref={element => setSectionRef && setSectionRef({ title, element })}
      >
        <div className={styles.formSectionDescription}>
          <p>{title}</p>
          <span>{description}</span>
        </div>
        <div className={styles.formSectionInputs}>{children}</div>
      </div>
    )
  }
}

export default FormSection
