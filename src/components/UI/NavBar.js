import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import UserFeature from '../../utils/Feature/UserFeature'
import styles from './NavBar.scss'

class NavBar extends React.Component {
  static propTypes = {
    onChange: PropTypes.func
  }

  state = {
    selected:
      this.props.tabs &&
      this.props.tabs.length &&
      typeof this.props.tabs[0] === 'object'
        ? this.props.tabs[0].name
        : this.props.tabs[0]
  }

  handleTabClicked = tab => {
    this.setState({ selected: tab })
    this.props.onChange(tab)
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.state.selected !== nextProps.selectedTab &&
      nextProps.selectedTab
    ) {
      this.setState({ selected: nextProps.selectedTab })
    }
  }

  render() {
    const { tabs } = this.props
    const { selected } = this.state

    if (tabs && tabs.length && typeof tabs[0] === 'object') {
      return (
        <div className={styles.tabs}>
          <div className={styles.container}>
            {tabs.map((tab, index) => {
              if (tab.featureFlag) {
                return (
                  <UserFeature name={tab.featureFlag} key={index}>
                    {({ enabled }) => {
                      if (!enabled) return null
                      return (
                        <div
                          name={`${tab.name}Tab`}
                          onClick={() => this.handleTabClicked(tab.name)}
                          className={classNames(
                            styles.tab,
                            tab.name === selected ? styles.tabActive : ''
                          )}
                        >
                          {tab.name}
                        </div>
                      )
                    }}
                  </UserFeature>
                )
              }
              return (
                <div
                  key={index}
                  name={`${tab.name}Tab`}
                  onClick={() => this.handleTabClicked(tab.name)}
                  className={classNames(
                    styles.tab,
                    tab.name === selected ? styles.tabActive : ''
                  )}
                >
                  {tab.name}
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    return (
      <div className={styles.tabs}>
        <div className={styles.container}>
          {tabs.map((tab, index) => {
            return (
              <div
                key={index}
                name={`${tab}Tab`}
                onClick={() => this.handleTabClicked(tab)}
                className={classNames(
                  styles.tab,
                  tab === selected ? styles.tabActive : ''
                )}
              >
                {tab}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default NavBar
