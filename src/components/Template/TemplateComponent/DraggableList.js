import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import List from './BodyComponents/List'
import * as DragActions from '../../../routes/Spreadsheet/modules/spreadsheet'
import styles from './ExcelEditor.scss'

const DraggableList = ({
  actions,
  tabs,
  props,
  currentTab,
  handleDataChange,
  handleDoubleClick,
  handleAddTab,
  handleEditTabName,
  handleOnBlur,
  handleSelectTab
}) => (
  <ul className={styles['navtabs']}>
    {tabs.map((tab, key) => {
      return (
        <List
          index={key}
          key={tab._id}
          tabs={tab}
          drag={actions.drag}
          alltabs={tabs}
          props={props}
          currentTab={currentTab}
          currenListItemId={tab._id}
          handleAddTab={handleAddTab}
          handleDataChange={handleDataChange}
          handleDoubleClick={handleDoubleClick}
          handleEditTabName={handleEditTabName}
          handleBlur={handleOnBlur}
          handleSelectTab={handleSelectTab}
        />
      )
    })}
  </ul>
)

function mapStateToProps(state, props) {
  return {
    props: props,
    state: state,
    tab: state.tab,
    editTabNameMode: state.editTabNameMode,
    currentTab: state.currentTab,
    handleDataChange: props.handleDataChange
  }
}

function mapDispatchToProps(dispatch, state) {
  return {
    actions: bindActionCreators(DragActions, dispatch),
    tab: state.tab,
    editTabNameMode: state.editTabNameMode,
    currentTab: state.currentTab,
    handleAddTab: state.handleAddTab,
    handleEditTabName: state.handleEditTabName,
    handleOnBlur: state.handleOnBlur,
    handleSelectTab: state.handleSelectTab,
    handleDoubleClick: state.handleDoubleClick,
    handleDataChange: state.handleDataChange
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DragDropContext(HTML5Backend)(DraggableList))
