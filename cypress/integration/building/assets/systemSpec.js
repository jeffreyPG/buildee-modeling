import faker from 'faker'

describe('Systems', function() {
  beforeEach(function() {
    cy.wrap(faker.address.streetAddress()).as('buildingName')
  })

  beforeEach(function() {
    // Create Building
    cy.addBuilding({ name: this.buildingName })
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

  beforeEach(function() {
    cy.fixture('light').as('publicEquipment')
    cy.wrap(`Test ${faker.name.jobArea()} ${faker.random.number()}`).as('name')
  })

  beforeEach(function() {
    // Enable waiting for building data to load
    cy.server()
    cy.route({ method: 'GET', url: '/api/organization/*/building/*' }).as(
      'getBuilding'
    )
    cy.contains(this.buildingName).click()
    cy.wait('@getBuilding')

    cy.contains('Assets').click()
    cy.contains('Systems').click()
  })

  it('succeeds', function() {
    const equipmentSearch = 'Generic'
    const equipmentName = 'Generic Thermostat'
    cy.contains('New').click()

    cy.get('[data-test="system-type"]').select('Hot Water Baseboards/Radiators')
    cy.get('[name="name"]').type(this.name, { force: true })
    cy.contains('Next').click()

    cy.get('[data-test="system-category-CONTROLS"]').within(function() {
      cy.contains('Add New').click({ force: true })
    })

    cy.get('[data-test="equipment-form"]').within(function() {
      cy.get('[name="category"]').should('have.value', 'CONTROLS')
      cy.get('[name="name"]').type(equipmentSearch, { force: true })
      cy.contains(equipmentName).click({ force: true })
      cy.get('[data-test="building-equipment-add-button"]').click()
    })

    cy.get('[data-test="system-category-CONTROLS"]').within(function() {
      cy.contains(equipmentName).should('have.length', 1)
    })

    cy.get('[data-test="system-add-button"]').click()
    cy.get('[data-test="building-systems-list"]').contains(this.name)

    cy.get('[data-test="extras-button"]').click({ force: true })
    cy.contains('Edit').click({ force: true })

    cy.get('[name="name"]').should('have.value', this.name)
    cy.get('[data-test="system-category-CONTROLS"]').within(function() {
      cy.contains(equipmentName).should('have.length', 1)

      cy.get('[data-test="extras-button"]').click({ force: true })
      cy.contains('Edit').click({ force: true })
    })

    cy.get('[data-test="equipment-form"]').within(function() {
      cy.get('[name="quantity"]').type('{selectall}3', { force: true })
      cy.contains('Update Equipment').click()
    })

    cy.get('[data-test="system-category-CONTROLS"]').within(function() {
      cy.contains(equipmentName).should('have.length', 1)

      cy.contains('3')

      cy.get('[data-test="sortable-list-row"]').should('have.length', 1)
      cy.get('[data-test="extras-button"]').click({ force: true })
      cy.contains('Copy').click({ force: true })
      cy.get('[data-test="sortable-list-row"]').should('have.length', 2)

      cy.get('[data-test="extras-button"]')
        .first()
        .click({ force: true })
      cy.contains('Delete').click({ force: true })
      cy.get('[data-test="sortable-list-row"]').should('have.length', 1)
    })

    cy.get('[data-test="system-add-button"]').click()
    cy.get('[data-test="building-systems-list"]').contains(this.name)

    cy.get('[data-test="extras-button"]')
      .first()
      .click()
    cy.contains('Copy').click({ force: true })
    cy.contains('Next').click()
    cy.get('[data-test="system-add-button"]').click()

    cy.get('[data-test="sortable-list-row"]').should('have.length', 2)
    cy.get('[data-test="extras-button"]')
      .first()
      .click()
    cy.contains('Delete').click()
    cy.get('[data-test="delete-confirmation"]').click({ force: true })
    cy.get('[data-test="sortable-list-row"]').should('have.length', 1)
  })
})
