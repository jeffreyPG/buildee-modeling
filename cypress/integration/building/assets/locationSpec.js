import faker from 'faker'

describe('Building', function() {
  beforeEach(function() {
    cy.wrap(faker.address.streetAddress()).as('buildingName')
    cy.wrap(`Test ${faker.commerce.product()}`).as('equipmentName')
    cy.fixture('light.json').as('publicEquipment')
  })

  beforeEach(function() {
    cy.addBuilding({ name: this.buildingName }).then(function(response) {
      const { body } = response
      const { building } = body
      cy.wrap(building._id).as('buildingId')
    })
  })

  beforeEach(function() {
    // Login
    cy.visit('/')
    cy.contains('Login').click()
    cy.get('#username').type(Cypress.env('test_user'))
    cy.get('#password').type(Cypress.env('test_password'))
    cy.get('button').click()
  })

  afterEach(function() {
    cy.deleteBuilding({ buildingId: this.buildingId })
  })

  describe('Locations', function() {
    beforeEach(function() {
      // Enable waiting for building data to load
      cy.server()
      cy.route({ method: 'GET', url: '/api/organization/*/building/*' }).as(
        'getBuilding'
      )
      cy.contains(this.buildingName).click()
      cy.wait('@getBuilding')

      // Visit Building Details
      cy.contains(this.buildingName).click()
      cy.contains('Assets').click()
    })

    it('can create edit bulk copy and delete from the locations tab', function() {
      // Visit Locations Tab
      cy.contains('Location').click()

      const locationName = `Test ${faker.name.jobArea()} ${faker.random.number()}`

      cy.contains('New').click()

      // Create
      cy.get('[name="usetype"]').select('Office', { force: true })
      cy.get('[name="name"]').type(locationName, { force: true })
      cy.get('[name="conditioning"]').select('Heating & Cooling', {
        force: true
      })
      cy.get('[name="user"]').select('Owner', { force: true })
      cy.get('[name="floor"]').select('1', { force: true })
      cy.get('[name="area"]').type(1000, { force: true })

      // Add Light
      cy.get(
        `[data-test="location-equipments-${this.publicEquipment.category}"]`
      ).within(function() {
        cy.get('[data-test="add-equipment"]').click({
          force: true
        })
      })
      cy.get('[name="category"]')
        .should('be.disabled')
        .should('have.value', this.publicEquipment.category)
      cy.get('[data-test="equipment-search-input"]').type(
        this.publicEquipment.params.search,
        {
          force: true
        }
      )
      cy.contains(this.publicEquipment.name).click({ force: true })
      cy.get('[name="quantity"]').type('{selectall}303', {
        force: true
      })
      cy.get('button')
        .contains('Add Equipment')
        .should('not.be.disabled')
        .click()

      cy.get(
        `[data-test="location-equipments-${this.publicEquipment.category}"]`
      ).within(function() {
        cy.contains(this.publicEquipment.name)
      })

      cy.get('button')
        .contains('Add Location')
        .should('not.be.disabled')
        .click()

      cy.get('[data-test="building-locations-list"]').within(function() {
        cy.contains('1000')
        cy.contains(locationName)
      })

      // Edit
      cy.get('[data-test="extras-button"]').click()
      cy.contains('Edit').click()
      cy.get('[name="usetype"]').select('Office', { force: true })
      cy.get('[name="name"]').type('UPDATED', { force: true })
      cy.get('[name="conditioning"]').select('Unconditioned', {
        force: true
      })
      cy.get('[name="user"]').select('Tenant', { force: true })
      cy.get('[name="floor"]').select('3', { force: true })
      cy.get('[name="area"]')
        .should('have.value', '1000')
        .type('{selectall}2000', { force: true })

      cy.get(
        `[data-test="location-equipments-${this.publicEquipment.category}"]`
      ).within(function() {
        cy.get('[data-test="extras-button"]').click({
          force: true
        })
        cy.contains('Edit').click({ force: true })
      })

      cy.get('[name="quantity"]')
        .should('have.value', '303')
        .type('{selectall}808', {
          force: true
        })
      cy.get('button')
        .contains('Update Equipment')
        .should('not.be.disabled')
        .click()

      cy.get(
        `[data-test="location-equipments-${this.publicEquipment.category}"]`
      ).within(function() {
        cy.contains(this.publicEquipment.name)
      })

      cy.get(
        `[data-test="location-equipments-${this.publicEquipment.category}"]`
      ).within(function() {
        // Copy Light
        cy.get('[data-test="extras-button"]').click({
          force: true
        })
        cy.contains('Copy').click({ force: true })
        cy.get('[data-test="sortable-list-row"]').should('have.length', 2)

        // Delete Light
        cy.get('[data-test="extras-button"]')
          .last()
          .click({
            force: true
          })
        cy.contains('Delete').click({ force: true })
        cy.get('[data-test="sortable-list-row"]').should('have.length', 1)
      })

      cy.get('button[type=submit]').click()
      cy.get('[data-test="building-locations-list"]').within(function() {
        cy.contains('3')
        cy.contains('2000')
        cy.contains(locationName + 'UPDATED')
      })

      cy.get(
        '[data-test="building-locations-list"] [data-test="sortable-list-row"]'
      ).should('have.length', 1)

      // Bulk Copy
      cy.get('[data-test="extras-button"]')
        .first()
        .click({ force: true })
      cy.contains('Bulk Copy').click()

      cy.get('[data-test="location-bulk-namefrom"]').type('1')
      cy.get('[data-test="location-bulk-nameto"]').type('3')
      cy.get('[data-test="location-bulk-usetype"]').should(
        'have.value',
        'office'
      )
      cy.get('[data-test="location-bulk-conditioning"]').should(
        'have.value',
        'unconditioned'
      )
      cy.get('[data-test="location-bulk-floor"]').should('have.value', '3')
      cy.get('[data-test="location-bulk-user"]').should('have.value', 'tenant')

      cy.get('button')
        .contains('Bulk Copy')
        .should('not.be.disabled')
        .click()

      cy.get('[data-test="building-locations-list"]').within(function() {
        cy.contains('1')
        cy.contains('3')
        cy.get('[data-test="sortable-list-row"]').should('have.length', 4)
      })

      cy.get(
        '[data-test="building-locations-list"] [data-test="sortable-list-row"]'
      )
        .last()
        .within(function() {
          cy.get('[data-test="extras-button"]').click({ force: true })
          cy.contains('Edit').click()
        })

      cy.get(
        `[data-test="location-equipments-${this.publicEquipment.category}"]`
      ).within(function() {
        cy.contains(this.publicEquipment.name)
      })

      // Delete
      cy.get('[data-test="extras-button"]')
        .first()
        .click({ force: true })
      cy.contains('Delete').click({ force: true })
      cy.contains('Delete').should('not.be.visible')
      cy.get('[data-test="delete-confirmation"]').click({ force: true })
      cy.get(
        '[data-test="building-locations-list"] [data-test="sortable-list-row"]'
      ).should('have.length', 3)
    })

    it('can create from within the equipment tab', function() {
      // Visit equipment Tab
      cy.contains('Equipment').click()

      const locationName = `Test ${faker.name.jobArea()} ${faker.random.number()}`

      cy.contains('New').click()

      cy.get('[data-test="filter-button"]').click()
      cy.get('[name="category"]').select(this.publicEquipment.category, {
        force: true
      })
      cy.get('[data-test="equipment-search-input"]').type(
        this.publicEquipment.params.search,
        {
          force: true
        }
      )
      cy.contains(this.publicEquipment.name).click({ force: true })
      cy.get('[name="quantity"]').type('{selectall}303', {
        force: true
      })

      cy.get('[name="location"]').type(locationName, { force: true })

      cy.get('[data-test="autosuggest-button"]').click({ force: true })

      cy.get('[name="usetype"]').select('office', { force: true })
      cy.get('[name="conditioning"]').select('unconditioned', { force: true })
      cy.get('[name="user"]').select('owner', { force: true })

      cy.get('button')
        .contains('Add Location')
        .should('not.be.disabled')
        .click()

      cy.get('[data-test="building-equipment-add-button"]')
        .should('not.be.disabled')
        .click()

      cy.get('[data-test="building-equipment-table"]').within(function() {
        cy.contains(locationName)
      })
    })

    it('can bulk create from the locations tab', function() {
      const expectedInitialLocationCount = 0
      const expectedFinalLocationCount = 6
      // Visit Locations Tab
      cy.contains('Locations').click()

      cy.get('[data-test="building-locations-list"]').within(function() {
        cy.get('[data-test="sortable-list-row"]').should(
          'have.length',
          expectedInitialLocationCount
        )
      })

      cy.get('[data-test="location-tab-extras"]').click()
      cy.contains('Bulk Add').click()

      cy.get('[data-test="location-bulk-namefrom"]').type('10')
      cy.get('[data-test="location-bulk-nameto"]').type('15')
      cy.get('[data-test="location-bulk-usetype"]').select('office')
      cy.get('[data-test="location-bulk-conditioning"]').select('unconditioned')
      cy.get('[data-test="location-bulk-floor"]').select('B3')
      cy.get('[data-test="location-bulk-user"]').select('owner')

      cy.get('button')
        .contains('Bulk Add')
        .should('not.be.disabled')
        .click()

      cy.get('[data-test="building-locations-list"]').within(function() {
        cy.contains('10')
        cy.contains('15')
        cy.contains('B3')
        cy.contains('Office')
        cy.get('[data-test="sortable-list-row"]').should(
          'have.length',
          expectedFinalLocationCount
        )
      })
    })
  })
})
