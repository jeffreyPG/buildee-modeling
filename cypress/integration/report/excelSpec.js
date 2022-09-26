import faker from 'faker'

describe('Spreadsheet', function() {
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
          it('can be added', function(){
            const tempName = `Test ${faker.commerce.product()}`
            const name = `Test ${faker.commerce.product()}`
            const name2 = `Test ${faker.commerce.product()}`
            const name3 = `Test ${faker.commerce.product()}`
            let dataTransfer = new DndSimulatorDataTransfer()
              // Create
              cy.get('[data-test="logged-in-header"]').then($header => {
                  if ($header.find("span:contains('Reports')").length > 0) {
                      console.log('YEP')
                      cy.get('[data-test="reports-header-link"]').click()
                      cy.get('[data-test="spreadsheets-header-link"]').click()
                  } else {
                      cy.get('[data-test="reports-header-link"]').click()
                  }
              })
              cy.contains('New Template').click()
            
              cy.get('#select-btn').click()


              cy.get('[data-test="template-name"]').type(tempName)       
              cy.get('[data-test="sheet-name"]').clear().type(name)
              cy.get('[data-test="data-source"]').select('Locations')
              cy.get('[data-test="add-tab"]').click()
              cy.get('[data-test="sheet-name"]').clear().type(name2)
              cy.get('[data-test="data-source"]').select('Overview & Property')
              cy.get('[data-test="add-tab"]').click()
              cy.get('[data-test="sheet-name"]').clear().type(name3)
              cy.get('[data-test="data-source"]').select('Construction')
              cy.get('[data-test="add-tab"]').click()
              cy.get('[data-test="sheet-name"]').clear().type('System Tab')
              cy.get('[data-test="data-source"]').select('Systems')
              cy.get('#systemType').select('2 Pipe Fan Coil Unit')
              cy.get('[data-test="add-tab"]').click()
              cy.get('[data-test="sheet-name"]').clear().type('Equipment Tab')
              cy.get('[data-test="data-source"]').select('Equipment')
              cy.get('[name="category"]').select('Lighting')
              cy.get('[name="application"]').select('Lamp')
              cy.get('[name="technology"]').select('LED')
              cy.get('[data-test="add-tab"]').click()
              cy.get('[data-test="sheet-name"]').clear().type('Utilities Tab')
              cy.get('[data-test="data-source"]').select('Utilities')
              cy.get('[name="Summary"]').select('Total Natural Gas')
              cy.get('[name="fuelType"]').select('Electric')
              cy.get('[name="year"]').select('Last 12 Months')

              cy.get('[data-test="select-tab"]').contains('System Tab').click()
              cy.get('[data-test="delete-tab"]').click()
              cy.get('[data-test="delete"]').click()
              //After deleting tab check the current tab
              cy.get('[name="Sheets"]').should('have.value', name3)
              cy.get('[name="Source"]').should('have.value', 'Construction')

              cy.get('[data-test="select-tab"]').contains(name)
              .trigger('mousedown', { which: 1 })
              .trigger('dragstart')
              .trigger('drag', {})
              cy.get('[data-test="select-tab"]').contains(name2)
              .trigger('dragover', { dataTransfer })
              .trigger('drop', { dataTransfer })
              .trigger('dragend', { dataTransfer })
              .trigger('mouseup', { which: 1 })
              //after drag check
              cy.get('[name="Sheets"]').should('have.value', name)
              cy.get('[name="Source"]').should('have.value', 'Locations')
              //tab selection
              cy.get('[data-test="select-tab"]').contains(name2).click()
              cy.get('[name="Sheets"]').should('have.value', name2)
              cy.get('[name="Source"]').should('have.value', 'Overview & Property')

              cy.get('[data-test="save-template"]').click()
              cy.contains('Created Spreadsheet Template').should('have.length', 1)
              cy.inv
              //Edit
              cy.contains(tempName).click()
              cy.get('[data-test="template-name"]').should('have.value', tempName)

              cy.get('[data-test="select-tab"]').contains(name2).click()
              cy.get('[name="Sheets"]').clear().type('New Tab')
              cy.get('[name="Source"]').select('Systems')
              cy.get('#systemType').select('2 Pipe Fan Coil Unit')

              cy.get('[data-test="select-tab"]').contains('Equipment Tab').click()
              cy.get('[name="Sheets"]').clear().type('New Equipment').then(()=>{
                cy.get('[name="category"]').select('Select Category')
                cy.get('[name="application"]').select('Select Application')
                cy.get('[name="technology"]').select('Select Technology')
                cy.get('[name="category"]').select('Controls')
                cy.get('[name="application"]').select('HVAC Controls')
                cy.get('[name="technology"]').select('Thermostat')
              })
              

              
              cy.get('[name="Sheets"]').should('have.value', 'New Equipment')
              cy.get('[name="Source"]').should('have.value', 'Equipment')
              cy.get('[name="category"]').should('have.value', 'CONTROLS')
              cy.get('[name="application"]').should('have.value', 'HVAC_CONTROLS')
              cy.get('[name="technology"]').should('have.value', 'THERMOSTAT')

              cy.contains('Update').click()
              cy.contains('Updated Spreadsheet Template').should('have.length', 1)

              //Delete Template
              cy.contains(tempName).click()

              cy.contains('Delete').click()
              cy.contains('Yes, delete this template').click()
              cy.contains('Removed Spreadsheet Template').should('have.length', 1)
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