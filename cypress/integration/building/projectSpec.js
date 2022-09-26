import faker from 'faker'

describe('Building', function() {
  beforeEach(function() {
    cy.wrap(faker.address.streetAddress()).as('buildingName')
  })

  beforeEach(function() {
    cy.addBuilding({ name: this.buildingName }).then(function(response) {
      const { body } = response
      const { building } = body
      cy.wrap(building._id).as('buildingId')
    })
  })

  afterEach(function() {
    cy.deleteBuilding({ buildingId: this.buildingId })
  })

  beforeEach(function() {
    // Enable waiting for building data to load
    cy.server()
    cy.route({ method: 'GET', url: '/api/user/*/organizations' }).as(
      'getOrganizations'
    )
    cy.route({ method: 'GET', url: '/api/organization/*/building' }).as(
      'getBuildings'
    )
    // Login
    cy.visit('/')
    cy.contains('Login').click()
    cy.get('#username').type(Cypress.env('test_user'))
    cy.get('#password').type(Cypress.env('test_password'))
    cy.get('button').click()
    cy.wait(['@getOrganizations', '@getBuildings'])
  })

  describe('Public Projects', function() {
    beforeEach(function() {
      cy.wrap({
        name: 'Step Dimming of Lighting'
      }).as('publicProject')
    })

    beforeEach(function() {
      // Enable waiting for building data to load
      cy.server()
      cy.route({ method: 'GET', url: '/api/organization/*/building/*' }).as(
        'getBuilding'
      )
      cy.route({ method: 'GET', url: '/api/building/*/enduse' }).as('getEndUse')
      cy.route({ method: 'GET', url: '/api/building/*/fullbenchmark' }).as(
        'getBenchmark'
      )

      // Visit Building Details
      cy.contains(this.buildingName).click()
      cy.wait(['@getBuilding', '@getEndUse', '@getBenchmark'])
    })

    it('can be added and updated', function() {
      const locationName1 = 'my first location'
      const locationName2 = 'my second location'

      cy.route({ method: 'GET', url: '/api/project?buildingId=*' }).as(
        'getBuildingProjects'
      )
      cy.contains('Projects').click()

      cy.wait('@getBuildingProjects')

      cy.contains('New Project').click()

      cy.contains('Public Library').click({ force: true })

      cy.get('input[placeholder="Search for keywords"]').type(
        this.publicProject.name,
        { force: true }
      )
      cy.contains(this.publicProject.name).click({
        force: true,
        timeout: 10000
      })
      cy.contains('Next').click()

      cy.get('[name="location"]').type(locationName1, { force: true })
      cy.get('[data-test="autosuggest-button"]').click({ force: true })
      cy.get('[name="usetype"]').select('Hotel', { force: true })
      cy.get('button')
        .contains('Add Location')
        .should('not.be.disabled')
        .click()

      cy.get('[name="location"]').type(locationName2, { force: true })
      cy.get('[data-test="autosuggest-button"]').click({ force: true })
      cy.get('[name="usetype"]').select('Hotel', { force: true })
      cy.get('button')
        .contains('Add Location')
        .should('not.be.disabled')
        .click()

      cy.contains('Add Project').click()
      cy.contains('Created/Updated Project').should('have.length', 1)

      cy.contains(this.publicProject.name).click()

      cy.contains(locationName1)
      cy.contains(locationName2)
    })
  })

  describe('My Library Projects', function() {
    beforeEach(function() {
      cy.wrap({
        name: 'Step Dimming of Lighting'
      }).as('publicProject')
    })

    beforeEach(function() {
      // Copy public project to my library
      cy.route({ method: 'GET', url: '/api/organization/*/project' }).as(
        'getProjects'
      )
      cy.route({ method: 'GET', url: '/api/measure' }).as('getMeasures')

      const orgId = Cypress.env('test_organization')
      cy.visit(`/organization/${orgId}/library`)

      cy.wait(['@getProjects', '@getMeasures'])

      cy.get('[data-test="projects-modal"]').within(function($modal) {
        cy.contains('Public Library').click({ force: true })
        cy.get('input[placeholder="Search for keywords"]').type(
          this.publicProject.name,
          { force: true }
        )
        cy.get('[data-test="public-project-extras-button"]').click()
        cy.contains('Copy').click()
        cy.contains('Copy Project').click()
        cy.contains('My Library')
          .invoke('attr', 'class')
          .should('contain', 'tabActive')
        cy.contains(this.publicProject.name)
      })
    })

    beforeEach(function() {
      // Enable waiting for building data to load
      cy.server()
      cy.route({ method: 'GET', url: '/api/organization/*/building/*' }).as(
        'getBuilding'
      )
      cy.route({ method: 'GET', url: '/api/building/*/enduse' }).as('getEndUse')
      cy.route({ method: 'GET', url: '/api/building/*/fullbenchmark' }).as(
        'getBenchmark'
      )

      // Visit Building Details
      cy.contains('Buildings').click({ force: true })
      cy.contains(this.buildingName).click()
      cy.wait(['@getBuilding', '@getEndUse', '@getBenchmark'])
    })

    it('can be added and updated', function() {
      const locationName1 = 'my first location'
      const locationName2 = 'my second location'

      cy.route({ method: 'GET', url: '/api/project?buildingId=*' }).as(
        'getBuildingProjects'
      )
      cy.contains('Projects').click()

      cy.wait('@getBuildingProjects')

      cy.contains('New Project').click()

      cy.contains('My Library').click({ force: true })

      cy.get('input[placeholder="Search for keywords"]').type(
        this.publicProject.name,
        { force: true }
      )
      cy.contains(this.publicProject.name).click({
        force: true,
        timeout: 10000
      })
      cy.contains('Next').click()

      cy.get('[name="location"]').type(locationName1, { force: true })
      cy.get('[data-test="autosuggest-button"]').click({ force: true })
      cy.get('[name="usetype"]').select('Hotel', { force: true })
      cy.get('button')
        .contains('Add Location')
        .should('not.be.disabled')
        .click()

      cy.get('[name="location"]').type(locationName2, { force: true })
      cy.get('[data-test="autosuggest-button"]').click({ force: true })
      cy.get('[name="usetype"]').select('Hotel', { force: true })
      cy.get('button')
        .contains('Add Location')
        .should('not.be.disabled')
        .click()

      cy.contains('Add Project').click()
      cy.contains('Created/Updated Project').should('have.length', 1)

      // Cannot reproduce bug whre location is not showing up in the list
      cy.reload()
      cy.contains('Projects').click()

      cy.contains(this.publicProject.name).click()

      cy.contains(locationName1)
      cy.contains(locationName2)
    })
  })
})
