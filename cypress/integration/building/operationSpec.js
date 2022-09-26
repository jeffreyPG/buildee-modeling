import faker from 'faker'
import features from '../../../src/utils/Feature/config'

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

  describe('Operations', function() {
    beforeEach(function() {
      // Enable waiting for building data to load
      cy.server()
      cy.route({ method: 'GET', url: '/api/organization/*/building/*' }).as(
        'getBuilding'
      )
      cy.contains(this.buildingName).click()
      cy.wait('@getBuilding')

      cy.contains(this.buildingName).click()

      cy.contains('Operation').click()
    })

    it('can create edit copy and delete', function() {
      cy.contains('New').click()

      // Create
      cy.get('[data-test="schedule-type"]').select('Setpoint')
      cy.get('[data-test="schedule-name"]').should('have.value', null)
      cy.get('[data-test="schedule-name"]').select('Typical Cooling Setpoint')
      if (features.buildingOperationsDates === true) {
        cy.get('[data-test="schedule-start-date"]').clear({ force: true })
        cy.contains('Start date is required').should('have.length', 1)
        cy.get('[data-test="schedule-start-date"]').type('03/01', {
          force: true
        })
        cy.get('[data-test="schedule-end-date"]').clear({ force: true })
        cy.contains('End date is required').should('have.length', 1)
        cy.get('[data-test="schedule-end-date"]').type('01/01', { force: true })
        cy.contains('End date is before start date').should('have.length', 1)
        cy.get('[data-test="schedule-end-date"]')
          .clear({ force: true })
          .type('04/01', { force: true })
        cy.contains('End date is before start date').should('have.length', 0)
      }
      cy.get(
        '[data-test="schedule-select-time"] > option[value="1:00AM"]'
      ).should('have.length', 0)

      cy.get('[data-test="schedule-select-time"]').select('10:00AM', {
        force: true
      })

      cy.get('[data-test="schedule-comments"]').type(
        'This is a typical schedule for a thermostat',
        { force: true }
      )
      cy.get('[data-test="schedule-submit-button"]')
        .contains('Add Schedule')
        .click()

      // Edit
      cy.get('[data-test="extras-button"]').click()
      cy.contains('Edit').click()
      cy.get('[data-test="schedule-type"]').should('be.disabled')
      cy.get('[data-test="schedule-name"]').should('be.disabled')
      cy.get(
        '[data-test="schedule-select-time"] > option[value="1:00AM"]'
      ).should('have.length', 0)
      cy.get(
        '[data-test="schedule-select-time"] > option[value="10:00AM"]'
      ).should('have.length', 0)
      cy.get('[data-test="schedule-select-time"]').select('11:00AM', {
        force: true
      })
      cy.get('[data-test="schedule-comments"]').type(
        '{selectall}This is a typical updated schedule for a thermostat',
        { force: true }
      )
      cy.get('[data-test="schedule-submit-button"]')
        .contains('Update Schedule')
        .click()

      cy.get('[data-test="extras-button"]').click()
      cy.contains('Edit').click()
      //cy.get('[data-test="schedule-comments"]').should(
      //  'have.value',
      //  'This is a typical updated schedule for a thermostat'
      //)
      cy.contains('Cancel').click()

      // Copy
      cy.get('[data-test="extras-button"]').click()
      cy.contains('Copy').click()
      cy.get('[data-test="schedule-type"]').should('have.value', 'setpoint')
      cy.get('[data-test="schedule-name"]').should('not.have.value', null)
      cy.get('[data-test="schedule-submit-button"]')
        .contains('Add Schedule')
        .click()
      cy.get('[data-test="sortable-list-row"]').should('have.length', 2)

      // Delete
      cy.get('[data-test="extras-button"]')
        .first()
        .click()
      cy.contains('Delete').click()
      cy.get('[data-test="delete-confirmation"]').click({ force: true })
      cy.get('[data-test="sortable-list-row"]').should('have.length', 1)
    })
  })
})
