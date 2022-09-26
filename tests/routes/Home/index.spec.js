import IndexRoute from 'routes'
import HomeRoute from 'routes/Home'

const store = {}

describe('(Route) Home/Index', () => {

  it('returns a route configuration object', () => {
    expect(typeof IndexRoute(store)).to.equal('object')
    expect(IndexRoute(store).childRoutes).to.be.an('array')
    expect(typeof HomeRoute(store)).to.equal('object')
  })
  it('ensure the HomeRoute is set as the IndexRoute', () => {
    expect(String(IndexRoute(store).indexRoute.getComponent)).itself.to.equal(String(HomeRoute(store).getComponent))
  })
  it('returns a path of "/"', () => {
    expect(IndexRoute(store).path).to.equal('/')
  })

})
