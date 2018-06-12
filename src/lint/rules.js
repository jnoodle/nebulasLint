// airbnb-base rules
import bestPractices from 'eslint-config-airbnb-base/rules/best-practices'
import errors from 'eslint-config-airbnb-base/rules/errors'
import node from 'eslint-config-airbnb-base/rules/node'
import style from 'eslint-config-airbnb-base/rules/style'
import variables from 'eslint-config-airbnb-base/rules/variables'
import es6 from 'eslint-config-airbnb-base/rules/es6'
// import imports from 'eslint-config-airbnb-base/rules/imports'

// nebulas lint rules by jnoodle
const rules = {

  'no-global-assign': 'error',

  'indent': ['warning', 2],

  // Unsupported methods
  "disallow-methods": [2, [
    'toDateString',
    'toTimeString',
    'getTimezoneOffset',
    'toLocaleDateString',
    'toLocaleString',
    'toLocaleTimeString',
    'setInterval',
  ]]
}

export default Object.assign({},
  bestPractices.rules,
  errors.rules,
  node.rules,
  style.rules,
  variables.rules,
  es6.rules,
  // imports.rules,
  rules,
)
