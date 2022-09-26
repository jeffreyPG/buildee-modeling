describe('Login', function() {
  it('succeeds and redirects', function() {
    cy.visit('/')
    cy.contains('Login').click()
    cy.get('#username').type(Cypress.env('test_user'))
    cy.get('#password').type(Cypress.env('test_password'))
    cy.get('button').click()
    cy.url().should('not.eq', '/login')
  })
})
