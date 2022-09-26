import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './EAProjectList.scss'

const EAProjectList = props => {
  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <div className={classNames(styles.tableRowItem, styles.tableRowItem_5)}>
          Select your buildee Pro measures to convert them to Projects.
        </div>
        <div className={classNames(styles.tableRowItem, styles.EAProjColLast)}>
          Needs More Information
        </div>
      </div>
      {props.showingEaMeasures.map((eaMeasure, measuresIndex) => {
        if (eaMeasure.eaComponents && eaMeasure.eaComponents.length > 0) {
          return (
            eaMeasure.eaComponents &&
            eaMeasure.eaComponents.map((component, index) => {
              return (
                <div
                  key={index}
                  className={styles.tableRow}
                  onClick={() =>
                    props.handleAddEaProject(eaMeasure, component, index)
                  }
                >
                  <div
                    className={classNames(
                      styles.tableRowItem,
                      styles.tableRowItem_5,
                      styles.EAProjColFirst
                    )}
                  >
                    {eaMeasure.measure.name} - {component.name}
                  </div>
                  <div
                    className={classNames(
                      styles.tableRowItem,
                      styles.EAProjColLast
                    )}
                  >
                    <i className="material-icons warning">warning</i>
                  </div>
                </div>
              )
            })
          )
        } else {
          return (
            <div
              key={measuresIndex}
              className={styles.tableRow}
              onClick={() =>
                props.handleAddEaProject(eaMeasure, null, measuresIndex)
              }
            >
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.tableRowItem_5,
                  styles.EAProjColFirst
                )}
              >
                {eaMeasure.measure.name}
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.EAProjColLast
                )}
              >
                <i className="material-icons warning">warning</i>
              </div>
            </div>
          )
        }
      })}
    </div>
  )
}

export default EAProjectList
