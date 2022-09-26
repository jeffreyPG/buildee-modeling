import React from 'react'
import styles from './Template.scss'

export class ChartDashboard extends React.Component {
  render() {
    return (
      <div className={styles.template}>
        <iframe
          width="100%"
          height="700"
          src="https://tableau.buildee.com/t/buildee/views/Analytics/Usage?:showAppBanner=false&:display_count=n&:showVizHome=n&:origin=viz_share_link&:embed=y#7"
        ></iframe>
      </div>
    )
  }
}
