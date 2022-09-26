import React, { Component } from 'react'
import classNames from 'classnames'
import styles from './BuildingGroupFilter.scss'

const getBuildingGroupName = (buildingGroups, id) => {
  const buildingGroup = buildingGroups.find(building => building._id === id)
  return buildingGroup ? buildingGroup.name : ''
}

class BuildingGroupFilter extends Component {
  state = {
    showFilter: false,
    editGroup: false,
    groupName: ''
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.editBuildingGroup && !this.state.editGroup) {
      if (nextProps.selectedBuildingGroupId) {
        const buildingGroup = nextProps.buildingGroups.find(
          building => building._id === nextProps.selectedBuildingGroupId
        )
        this.setState({
          editGroup: true,
          showFilter: false,
          groupName: buildingGroup.name
        })
      } else {
        this.setState({ editGroup: true, showFilter: false, groupName: '' })
      }
    }
  }

  toggleFilter = () => {
    this.setState({ showFilter: !this.state.showFilter })
  }

  onAddGroup = () => {
    this.setState({ editGroup: true, showFilter: false, groupName: '' })
    this.props.onAddGroup(true)
  }

  onAddGroupCancel = () => {
    this.setState({ editGroup: false })
    this.props.toggleEditGroup(false)
  }

  onUpdateGroup = () => {
    this.props.onUpdateGroup(this.state.groupName)
    this.setState({ editGroup: false, groupName: '' })
  }

  onSelectGroup = groupId => () => {
    this.setState({ editGroup: false, groupName: '' })
    this.props.onSelectGroup(groupId)
    this.toggleFilter()
  }

  onEditGroup = groupId => () => {
    this.props.onEditGroup(groupId)
    const selectedGroup = this.props.buildingGroups.find(
      group => group._id === groupId
    )
    this.setState({ editGroup: true, groupName: selectedGroup.name })
    this.toggleFilter()
  }

  onDeleteGroup = groupId => () => {
    this.props.onDeleteGroup(groupId)
    this.toggleFilter()
  }

  onGroupNameChange = event => {
    this.setState({ groupName: event.target.value })
  }

  render() {
    const { buildingGroups = [], selectedBuildingGroupId, user } = this.props
    const { showFilter, editGroup, groupName } = this.state
    return (
      <div>
        <button
          className={styles.filterButtonContainer}
          onClick={this.toggleFilter}
        >
          <i className="material-icons">domain</i>
          <span className={styles.filterText}>
            {selectedBuildingGroupId
              ? getBuildingGroupName(buildingGroups, selectedBuildingGroupId)
              : 'Building Group'}
          </span>
        </button>
        {showFilter && (
          <div className={styles.filterContainer}>
            <div className={styles.filterContainerHeader}>
              <p>Building Group</p>
              <br />
              <i
                className={classNames('material-icons', styles.deleteIcon)}
                onClick={this.toggleFilter}
              >
                close
              </i>
            </div>
            <div className={styles.filterContainerBody}>
              <div className={styles.addText} onClick={this.onAddGroup}>
                +&nbsp; Add Group
              </div>
              <span className={styles.filterSeperator} />
              <div>
                {[
                  <div
                    key="building-group-all"
                    className={styles.filterRow}
                    onClick={this.onSelectGroup('all')}
                  >
                    All Buildings
                  </div>,
                  buildingGroups.map((group, index) => (
                    <div
                      key={`building-group-${index}`}
                      className={styles.filterRow}
                    >
                      <div
                        onClick={this.onSelectGroup(group._id)}
                        className={styles.groupName}
                      >
                        {group.name}
                      </div>
                      {user._id === group.createdByUserId && (
                        <div>
                          <i
                            className={`material-icons ${styles.actionIcon}`}
                            onClick={this.onEditGroup(group._id)}
                          >
                            edit
                          </i>
                          <i
                            className={`material-icons ${styles.actionIcon}`}
                            onClick={this.onDeleteGroup(group._id)}
                          >
                            delete
                          </i>
                        </div>
                      )}
                    </div>
                  ))
                ]}
              </div>
            </div>
          </div>
        )}
        {editGroup && (
          <div className={styles.footer}>
            <div className={styles.editContainer}>
              <div> Check buildings to be included in the building group. </div>
              <div className={styles.buttonContainer}>
                Name of the group:
                <input
                  className={styles.groupNameInput}
                  value={groupName}
                  onChange={this.onGroupNameChange}
                />
              </div>
              <div className={styles.buttonContainer}>
                <button
                  onClick={this.onAddGroupCancel}
                  className={classNames(styles.button, styles.buttonSecondary)}
                >
                  Cancel
                </button>
                <br />
                <button
                  className={classNames(styles.button, styles.buttonPrimary)}
                  onClick={this.onUpdateGroup}
                  disabled={groupName === ''}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default BuildingGroupFilter
