// Only import the modules necessary for initial render
import CoreLayout from '../layouts/CoreLayout/CoreLayout'
import LoggedOutLayout from '../layouts/LoggedOutLayout/LoggedOutLayout'
import LoggedInLayout from '../layouts/LoggedInLayout/LoggedInLayout'

// Initial Load
import Home from './Home'

// Code splitting load
import LoginRoute from './Login'
import ProfileRoute from './Profile'
import PortfolioRoute from './Portfolio'
import BuildingRoute from './Building'
import LibraryRoute from './Library'
import OrganizationRoute from './Organization'
import TemplateRoute from './Template'
import SpreadsheetRoute from './Spreadsheet'
import HireRoute from './Hire'
import NotFoundRoute from './NotFound'
import DocuSignRoute from './DocuSign'

// Code splitting load and inject
import SignupRoute from './Signup'
import ForgotRoute from './Forgot'

// Use PlainRoute objects to build route definitions instead of JSX
export const createRoutes = store => {
  // Load the multi routes
  const ProfileRoutes = ProfileRoute(store)
  const NotFoundRoutes = NotFoundRoute(store)
  const PortfolioRoutes = PortfolioRoute(store)
  const BuildingRoutes = BuildingRoute(store)
  const LibraryRoutes = LibraryRoute(store)
  const OrganizationRoutes = OrganizationRoute(store)
  const TemplateRoutes = TemplateRoute(store)
  const SpreadsheetRoutes = SpreadsheetRoute(store)
  const DocuSignRoutes = DocuSignRoute(store)

  return {
    path: '/',
    component: CoreLayout,
    indexRoute: Home(store),
    childRoutes: [
      {
        component: LoggedInLayout,
        childRoutes: [
          HireRoute(store),

          ...ProfileRoutes,
          ...PortfolioRoutes,
          ...BuildingRoutes,
          ...LibraryRoutes,
          ...OrganizationRoutes,
          ...TemplateRoutes,
          ...SpreadsheetRoutes,
          ...DocuSignRoutes,
          ...NotFoundRoutes
        ]
      }
    ]
  }
}

export default createRoutes
