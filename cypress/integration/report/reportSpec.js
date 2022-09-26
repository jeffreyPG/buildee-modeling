import faker from 'faker'

describe('Report', function() {
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

  context('Templates', function() {
    it('can be added, updated, and removed', function() {
      const name = `Test ${faker.commerce.product()}`

      // Create
      cy.get('[data-test="logged-in-header"]').then($header => {
        if ($header.find("span:contains('Reports')").length > 0) {
          console.log('YEP')
          cy.get('[data-test="reports-header-link"]').click()
          cy.get('[data-test="documents-header-link"]').click()
        } else {
          cy.get('[data-test="reports-header-link"]').click()
        }
      })

      cy.contains('New Template').click()
      cy.get('[data-test="template-name"]').type(name)

      let dataTransfer = new DndSimulatorDataTransfer()

      cy.get('[data-test="draggable-title-element"]')
        .trigger('mousedown', { which: 1 })
        .trigger('dragstart', { dataTransfer })
        .trigger('drag', {})

      cy.get('[data-test="droppable-template-panel"]')
        .trigger('dragover', { dataTransfer })
        .trigger('drop', { dataTransfer })
        .trigger('dragend', { dataTransfer })
        .trigger('mouseup', { which: 1 })

      cy.get('[data-test="template-title-text"]').type('test template title')

      cy.get('[data-test="template-title-edit-option"]').click({
        force: true
      })
      cy.get('[data-test="template-title-style-h2"]').check({ force: true })

      dataTransfer = new DndSimulatorDataTransfer()

      //cy.get('[data-test="draggable-equipment-element"]')
      //  .trigger('mousedown', { which: 1 })
      //  .trigger('dragstart', { dataTransfer })
      //  .trigger('drag', {})

      //cy.get('[data-test="droppable-template-panel"]')
      //  .trigger('dragover', { dataTransfer })
      //  .trigger('drop', { dataTransfer })
      //  .trigger('dragend', { dataTransfer })
      //  .trigger('mouseup', { which: 1 })

      //cy.get('[data-test="editor-body-edit-equipment-icon"]').click({
      //  force: true
      //})

      //cy.get('[name="category"]').select('Lighting')
      //cy.get('[name="application"]').select('Lamp')
      //cy.get('[name="technology"]').select('LED')

      //cy.contains('Brand').click()
      //cy.contains('Length').click()
      //cy.contains('Ballast Type').click()

      //cy.get('[data-test="editor-body-edit-equipment-icon"]').click({
      //  force: true
      //})

      //cy.contains('Equipment - Lighting / Lamp / LED').should('have.length', 1)
      //// The field display values are not being used!
      //cy.contains('Brand | Length | Ballast type').should('have.length', 1)

      //cy.get('[data-test="editor-body-edit-equipment-icon"]').click({
      //  force: true
      //})

      //cy.get('[name="category"]').should('have.value', 'LIGHTING')
      //cy.get('[name="application"]').should('have.value', 'LAMP')
      //cy.get('[name="technology"]').should('have.value', 'LED')

      //cy.get('input[value="brand"]').should('be.checked')
      //cy.get('input[value="size"]').should('be.checked')
      //cy.get('input[value="ballastType"]').should('be.checked')

      cy.contains('Save').click()

      cy.contains('Created Template').should('have.length', 1)

      // Edit
      cy.contains(name).click()

      cy.get('[data-test="template-title-text"]').should(
        'have.value',
        'test template title'
      )

      cy.get('[data-test="template-title-edit-option"]').click({
        force: true
      })
      cy.get('[data-test="template-title-style-h2"]').should('be.checked')

      //cy.contains('Equipment - Lighting / Lamp / LED').should('have.length', 1)

      //cy.get('[data-test="editor-body-edit-equipment-icon"]').click({
      //  force: true
      //})

      //cy.get('input[value="brand"]').should('be.checked')
      //cy.get('input[value="size"]').should('be.checked')
      //cy.get('input[value="ballastType"]').should('be.checked')
      //cy.get('[name="category"]').should('have.value', 'LIGHTING')
      //cy.get('[name="application"]').should('have.value', 'LAMP')

      //cy.get('[name="technology"]')
      //  .should('have.value', 'LED')
      //  // Should allow ability to clear without doing this
      //  .select('Select Technology')
      //  .select('Halogen')
      //  .should('have.value', 'HALOGEN')
      //cy.get('[name="category"]').should('have.value', 'LIGHTING')
      //cy.get('[name="application"]').should('have.value', 'LAMP')

      //cy.contains('Equipment - Lighting / Lamp / Halogen').should(
      //  'have.length',
      //  1
      //)

      //cy.get('input[value="brand"]').should('not.be.checked')
      //cy.get('input[value="size"]').should('not.be.checked')
      //cy.get('input[value="ballastType"]').should('not.be.checked')

      cy.contains('Update').click()
      cy.contains('Updated Template').should('have.length', 1)

      // Remove
      cy.contains(name).click()

      //cy.contains('Equipment - Lighting / Lamp / Halogen').should(
      //  'have.length',
      //  1
      //)

      cy.contains('Delete').click()
      cy.contains('Yes, delete this template').click()
      cy.contains('Removed Template').should('have.length', 1)
    })
  })
})

function DndSimulatorDataTransfer() {
  this.data = {}
}

DndSimulatorDataTransfer.prototype.dropEffect = 'move'
DndSimulatorDataTransfer.prototype.effectAllowed = 'all'
DndSimulatorDataTransfer.prototype.files = []
DndSimulatorDataTransfer.prototype.items = []
DndSimulatorDataTransfer.prototype.types = []

DndSimulatorDataTransfer.prototype.clearData = function(format) {
  if (format) {
    delete this.data[format]

    const index = this.types.indexOf(format)
    delete this.types[index]
    delete this.data[index]
  } else {
    this.data = {}
  }
}

DndSimulatorDataTransfer.prototype.setData = function(format, data) {
  this.data[format] = data
  this.items.push(data)
  this.types.push(format)
}

DndSimulatorDataTransfer.prototype.getData = function(format) {
  if (format in this.data) {
    return this.data[format]
  }

  return ''
}

DndSimulatorDataTransfer.prototype.setDragImage = function(
  img,
  xOffset,
  yOffset
) {
  // since simulation doesn"t replicate the visual
  // effects, there is no point in implementing this
}
