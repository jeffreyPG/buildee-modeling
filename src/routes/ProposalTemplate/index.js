import { routerLoginCheck, routerTermsCheck } from 'utils/Utils'

export default store => {
  const requireLogin = ({ params }, replace, cb) => {
    // check to make sure they're logged in
    if (!routerLoginCheck(store)) {
      replace('/')
    }
    // check to make sure they've accepted the terms of use
    if (!routerTermsCheck(store)) {
      replace('/terms-of-service')
    }
    cb()
  }

  return [
    {
      path: 'organization/:organizationId/proposalTemplates',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const Organization = require('./containers/ProposalTemplatesContainer')
              .default
            cb(null, Organization)
          },
          'proposalTemplates'
        )
      }
    },
    {
      path: 'proposalTemplate/create',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const TemplateCreate = require('./containers/ProposalTemplateCreateContainer')
              .default
            cb(null, TemplateCreate)
          },
          'proposalTemplates'
        )
      }
    },
    {
      path: 'proposalTemplate/:templateId',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const TemplateCreate = require('./containers/ProposalTemplateEditContainer')
              .default
            cb(null, TemplateCreate)
          },
          'proposalTemplates'
        )
      }
    }
  ]
}
