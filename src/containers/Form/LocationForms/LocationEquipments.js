import React from 'react'
import PropTypes from 'prop-types'
import SortableList from '../../../components/UI/SortableList'

const columnsMap = {
  Tag: {
    sortKey: 'configs',
    getValue: configs => {
      const config = configs.find(({ field }) => field === 'tagID')
      return (config && config.value) || '-'
    }
  },
  ID: {
    sortKey: 'configs',
    getValue: configs => {
      const config = configs.find(({ field }) => field === 'identifier')
      return (config && config.value) || '-'
    }
  },
  name: {
    sortKey: 'libraryEquipment',
    getValue: e => e.name
  },
  'Control Type': {
    sortKey: 'configs',
    getValue: configs => {
      const config = configs.find(({ field }) => field === 'controlType')
      return (config && config.value) || '-'
    }
  },
  'Condition Rating': {
    sortKey: 'maintenances',
    getValue: configs => {
      const config = configs.find(({ field }) => field === 'conditionRating')
      return (config && config.value) || '-'
    }
  }
}

const getColumns = ({ applicationDisplayName, columns }) => {
  return columns
    .map(column => {
      if (column === 'application') {
        return [column, { getValue: () => applicationDisplayName }]
      }
      return [column, columnsMap[column]]
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
}

class LocationEquipments extends React.Component {
  static propTypes = {
    category: PropTypes.string.isRequired,
    columns: PropTypes.arrayOf(PropTypes.string).isRequired,
    equipment: PropTypes.array.isRequired,
    onCopy: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired
  }

  static defaultProps = {
    mode: 'viewLocation'
  }

  state = {
    showFields: false
  }

  handleShowFields = () => {
    this.setState({ showFields: true })
  }

  handleHideFields = () => {
    this.setState({ showFields: false })
    this.clear()
  }

  render() {
    const {
      category,
      columns,
      equipment,
      onCopy,
      onDelete,
      onEdit,
      title
    } = this.props

    return (
      <SortableList
        listData={equipment}
        columns={getColumns({ applicationDisplayName: title, columns })}
        loading={false}
        rowActions={[
          {
            text: 'Edit',
            icon: 'create',
            handler: (equipment, index) =>
              onEdit({ category, equipment, index })
          },
          {
            text: 'Copy',
            icon: 'file_copy',
            handler: equipment => onCopy({ category, equipment })
          },
          {
            text: 'Delete',
            icon: 'delete',
            handler: (equipment, index) =>
              onDelete({ category, equipment, index })
          }
        ]}
        showTotals={false}
      />
    )
  }
}

export default LocationEquipments
