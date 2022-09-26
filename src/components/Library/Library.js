import React from 'react'
import PropTypes from 'prop-types'
import { ProjectsModal } from '../../containers/Modal'

export class Library extends React.Component {
  static propTypes = {
    getMeasures: PropTypes.func.isRequired,
    getProjectPackages: PropTypes.func.isRequired,
    uploadProjectImage: PropTypes.func.isRequired,
    getUserById: PropTypes.func.isRequired,
    createOrganizationProject: PropTypes.func.isRequired,
    editOrganizationProject: PropTypes.func.isRequired,
    getOrganizationProjects: PropTypes.func.isRequired,
    deleteOrganizationProject: PropTypes.func.isRequired,
    getOrganizationName: PropTypes.func.isRequired
  }

  state = {
    currentProject: {}
  }

  render() {
    let { routeParams } = this.props
    let { tab } = routeParams
    tab = tab === 'public' ? 'publicLibrary' : 'myLibrary'

    return (
      <ProjectsModal
        library={true}
        uploadProjectImage={this.props.uploadProjectImage}
        createOrganizationProject={this.props.createOrganizationProject}
        editOrganizationProject={this.props.editOrganizationProject}
        getUserById={this.props.getUserById}
        getOrganizationName={this.props.getOrganizationName}
        getOrganizationProjects={this.props.getOrganizationProjects}
        deleteOrganizationProject={this.props.deleteOrganizationProject}
        currentProject={this.state.currentProject}
        getMeasures={this.props.getMeasures}
        getProjectPackages={this.props.getProjectPackages}
        tab={tab}
        handleCloseAddProjects={() => {
          this.setState({
            currentProject: null
          })
        }}
      />
    )
  }
}

export default Library
