import LoginRoute from 'routes/Login'

const store = {}

describe('(Route) Login', () => {

  it('returns a route configuration object', () => {
    expect(typeof LoginRoute(store)).to.equal('object')
    expect(typeof LoginRoute(store).getComponent).to.equal('function')
  })
  it('returns a path of "login"', () => {
    expect(LoginRoute(store).path).to.equal('login')
  })

})
