import _ from 'lodash'
import { getMedianValue } from 'utils/Portfolio'

export const replaceHTMLEntities = str => {
  if (str) {
    return str.replace(/&#(\d+);/g, function(match, dec) {
      return String.fromCharCode(dec)
    })
  }
  return ''
}

export const formatStringUpperCase = label => {
  if (label) return label[0].toUpperCase() + label.substring(1, label.length)
  return label
}

export const numberWithCommas = (x, type) => {
  if (x === null || x === undefined) {
    return ''
  }
  if (type === 'savings-range') {
    let ranges = x.toString().split(' - ')
    return ranges
      .map(range => {
        let parts = range.toString().split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return parts.join('.')
      })
      .join(' - ')
  }
  if (isNaN(x)) {
    return x
  }
  var parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

export const calculateAnnualSavings = (
  project,
  buildingId,
  sort,
  key = 'runResults'
) => {
  if (
    project[key] &&
    project[key][buildingId] &&
    project[key][buildingId]['annual-savings']
  ) {
    if (project[key][buildingId]['calculation-type'] === 'savings-range') {
      let elecrticCharge =
        project[key][buildingId]['annual-savings']['electric-charge']
      let gasCharge = project[key][buildingId]['annual-savings']['gas-charge']
      let minSavings = elecrticCharge['min-savings'] + gasCharge['min-savings']
      let maxSavings = elecrticCharge['max-savings'] + gasCharge['max-savings']
      if (sort === 'sort') {
        return Math.ceil(minSavings)
      } else {
        return Math.ceil(minSavings) + ' - $' + Math.ceil(maxSavings)
      }
    } else {
      return Math.ceil(
        project[key][buildingId]['annual-savings']['electric-charge'] +
          project[key][buildingId]['annual-savings']['gas-charge']
      )
    }
  } else {
    return null
  }
}
export const calculateProjectCost = project => {
  if (project.initialValues && project.initialValues['project_cost']) {
    return Math.ceil(project.initialValues['project_cost'])
  } else {
    return null
  }
}
export const calculateIncentive = (project, buildingId, key = 'runResults') => {
  if (
    project[key] &&
    project[key][buildingId] &&
    project[key][buildingId]['utility-incentive']
  ) {
    return Math.ceil(project[key][buildingId]['utility-incentive'])
  } else {
    return null
  }
}
export const calculateGasSavingsCost = (
  project,
  buildingId,
  option,
  key = 'runResults'
) => {
  if (option === 'gas') {
    if (project[key] && project[key][buildingId]) {
      if (
        project[key][buildingId]['energy-savings'] &&
        project[key][buildingId]['energy-savings'][option]
      ) {
        return (
          Math.round(
            (project[key][buildingId]['energy-savings'][option] +
              Number.EPSILON) *
              100
          ) / 100
        )
      } else if (
        project.fuel === option &&
        project[key][buildingId]['energy-savings']
      ) {
        return (
          Math.round(
            (project[key][buildingId]['energy-savings'] + Number.EPSILON) * 100
          ) / 100
        )
      }
    }
    return null
  }
}
export const calculateGHGSavingsCost = (
  project,
  buildingId,
  option,
  key = 'runResults'
) => {
  if (project.fuel === '') {
    project.fuel = 'electric'
  }
  if (option === 'ghg' || option === 'ghg-cost') {
    if (
      project[key] &&
      project[key][buildingId] &&
      project[key][buildingId][option] &&
      (project[key][buildingId][option] >= 0 ||
        Object.entries(project[key][buildingId][option]).length > 0)
    ) {
      return parseFloat(project[key][buildingId][option])
    }
  }
}

export const calculateTotalEnergySavings = (electric, gas) => {
  const electricSavings = +electric || 0
  const gasSavings = +gas || 0
  const total = electricSavings * 3.41214 + gasSavings * 99.9761
  return _.round(total, 2)
}

export const calculateEnergySavings = (
  project,
  buildingId,
  fuelType,
  sort,
  key = 'runResults'
) => {
  if (project.fuel === '' || !project.fuel) {
    project.fuel = 'electric'
  }

  if (project.fuel.includes(fuelType)) {
    if (
      project[key] &&
      project[key][buildingId] &&
      project[key][buildingId]['energy-savings'] &&
      (project[key][buildingId]['energy-savings'] >= 0 ||
        Object.entries(project[key][buildingId]['energy-savings']).length > 0)
    ) {
      if (project[key][buildingId]['calculation-type'] === 'savings-range') {
        if (sort === 'sort') {
          return Math.ceil(
            project[key][buildingId]['energy-savings']['min-savings']
          )
        } else {
          return (
            Math.ceil(
              project[key][buildingId]['energy-savings']['min-savings']
            ) +
            ' - ' +
            Math.ceil(project[key][buildingId]['energy-savings']['max-savings'])
          )
        }
      } else {
        const energySavings = project[key][buildingId]['energy-savings']
        if (typeof energySavings === 'object' && fuelType in energySavings) {
          return Math.ceil(energySavings[fuelType])
        }
        return Math.ceil(energySavings)
      }
    } else {
      return null
    }
  } else {
    return null
  }
}

export const calculateDemandSavings = (
  project,
  buildingId,
  key = 'runResults'
) => {
  if (project[key] && project[key][buildingId]) {
    if (
      !project[key][buildingId]['energy-savings'] ||
      typeof project[key][buildingId]['energy-savings'] !== 'object'
    ) {
      return null
    }

    return project[key][buildingId]['energy-savings']['demand']
  }
  return null
}

export const calculateEUL = (project, buildingId, key = 'runResults') => {
  if (project[key] && project[key][buildingId]) {
    if (
      !project[key][buildingId]['energy-savings'] ||
      typeof project[key][buildingId]['energy-savings'] !== 'object'
    ) {
      return null
    }

    return project[key][buildingId]['energy-savings']['eul']
  }
  return null
}

export const calculateROI = (project, buildingId, key = 'runResults') => {
  if (
    project[key] &&
    project[key][buildingId] &&
    project[key][buildingId]['calculation-type'] !== 'savings-range' &&
    project.initialValues &&
    project.initialValues.project_cost > 0 &&
    calculateAnnualSavings(project, buildingId, 'sort', key) > 0
  ) {
    let roi = (
      ((calculateAnnualSavings(project, buildingId, 'sort', key) +
        +(project.initialValues.maintenance_savings || 0)) /
        (+(project.initialValues.project_cost || 0) -
          +(project[key][buildingId]['utility-incentive'] || 0))) *
      100
    ).toFixed(0)
    return isFinite(roi) ? Number(roi) : null
  } else {
    return null
  }
}

const getCashFlowsForAnalysisResults = (
  project,
  buildingId,
  key = 'runResults'
) => {
  return (
    project[key] &&
    project[key][buildingId] &&
    project[key][buildingId]['calculation-type'] !== 'savings-range' &&
    project[key][buildingId]['cash-flows']
  )
}

const getCashFlowsForSimulationResults = (
  project,
  buildingId,
  key = 'runResults'
) => {
  return (
    project[key] &&
    project[key][buildingId] &&
    project[key][buildingId]['calculation-type'] !== 'savings-range' &&
    project[key][buildingId]['cash_flows']
  )
}

export const calculateSimplePayback = (
  project,
  buildingId,
  key = 'runResults'
) => {
  const cashFlows = getCashFlowsForAnalysisResults(project, buildingId, key)
  if (
    cashFlows &&
    cashFlows['simple_payback'] &&
    calculateAnnualSavings(project, buildingId, 'sort', key) > 0
  ) {
    return Number(cashFlows['simple_payback'].toFixed(2))
  } else {
    return null
  }
}
export const calculateNPV = (project, buildingId, key = 'runResults') => {
  const cashFlows = getCashFlowsForAnalysisResults(project, buildingId, key)
  if (
    cashFlows &&
    calculateAnnualSavings(project, buildingId, 'sort', key) > 0 &&
    project.initialValues &&
    project.initialValues.project_cost > 0
  ) {
    return Math.ceil(cashFlows['cash_flows'].slice(-1)[0].NPV)
  } else {
    return null
  }
}
export const calculateSIR = (project, buildingId, key = 'runResults') => {
  const cashFlows = getCashFlowsForAnalysisResults(project, buildingId, key)
  if (
    cashFlows &&
    cashFlows['cash_flows'][0].SIR &&
    calculateAnnualSavings(project, buildingId, 'sort', key) > 0
  ) {
    return Number(cashFlows['cash_flows'].slice(-1)[0].SIR.toFixed(2))
  } else {
    return null
  }
}

export const sortProjectsAscending = (
  a,
  b,
  key,
  buildingId,
  type = 'runResults'
) => {
  if (key === 'displayName') {
    return a[key].toLowerCase() < b[key].toLowerCase()
      ? -1
      : b[key].toLowerCase() < a[key].toLowerCase()
      ? 1
      : 0
  } else if (key === 'updated' || key === 'created') {
    return (a[key] || null) < (b[key] || null)
      ? -1
      : (b[key] || null) < (a[key] || null)
      ? 1
      : 0
  } else if (key === 'project_cost') {
    let valueA = getProjectCost(a) || null
    let valueB = getProjectCost(b) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'incentive') {
    let valueA = getIncentive(a, buildingId, type) || null
    let valueB = getIncentive(b, buildingId, type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'annual-savings') {
    let valueA = getAnnualSavings(a, buildingId, 'sort', type) || null
    let valueB = getAnnualSavings(b, buildingId, 'sort', type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'electric-savings') {
    let valueA =
      getEnergySavings(a, buildingId, 'electric', 'sort', type) || null
    let valueB =
      getEnergySavings(b, buildingId, 'electric', 'sort', type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'gas') {
    let valueA = getGasSavingsCost(a, buildingId, 'gas', 'sort', type) || null
    let valueB = getGasSavingsCost(b, buildingId, 'gas', 'sort', type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'water-savings') {
    let valueA = getEnergySavings(a, buildingId, 'water', 'sort', type) || null
    let valueB = getEnergySavings(b, buildingId, 'water', 'sort', type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'ghg') {
    let valueA = getGHGSavingsCost(a, buildingId, 'ghg', type) || null
    let valueB = getGHGSavingsCost(b, buildingId, 'ghg', type) || null
    if (!a.runResults[buildingId]['calculation-type']) valueA = null
    if (!b.runResults[buildingId]['calculation-type']) valueB = null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'ghg-cost') {
    let valueA = getGHGSavingsCost(a, buildingId, 'ghg-cost', type) || null
    let valueB = getGHGSavingsCost(b, buildingId, 'ghg-cost', type) || null
    if (!isFinite(valueA)) valueA = null
    if (!isFinite(valueB)) valueB = null
    if (!a.runResults[buildingId]['calculation-type']) valueA = null
    if (!b.runResults[buildingId]['calculation-type']) valueB = null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'roi') {
    let valueA = getROI(a, buildingId, type) || null
    let valueB = getROI(b, buildingId, type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'simple-payback') {
    let valueA = getSimplePayback(a, buildingId, type) || null
    let valueB = getSimplePayback(b, buildingId, type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'npv') {
    let valueA = getNPV(a, buildingId, type) || null
    let valueB = getNPV(b, buildingId, type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'sir') {
    let valueA = getSIR(a, buildingId, type) || null
    let valueB = getSIR(b, buildingId, type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'status') {
    let valueA = a.status || 'Identified'
    let valueB = b.status || 'Identified'
    return valueA.toLowerCase() < valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() < valueA.toLowerCase()
      ? 1
      : 0
  } else if (key === 'type') {
    let valueA = a.type || ''
    let valueB = b.type || ''
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA.toLowerCase() < valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() < valueA.toLowerCase()
      ? 1
      : 0
  } else if (key === 'package.name') {
    let valueA = (a && a.package && a.package.name) || ''
    let valueB = (b && b.package && b.package.name) || ''
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA.toLowerCase() < valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() < valueA.toLowerCase()
      ? 1
      : 0
  } else if (key === 'budgetType') {
    let valueA = a.budgetType || 'Low Cost/No Cost'
    let valueB = b.budgetType || 'Low Cost/No Cost'
    return valueA.toLowerCase() < valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() < valueA.toLowerCase()
      ? 1
      : 0
  } else if (key === 'energy-savings') {
    let valueA =
      getTotalEnergySavings(
        getEnergySavings(a, buildingId, 'electric', type),
        getGasSavingsCost(a, buildingId, 'gas', type)
      ) || null
    let valueB =
      getTotalEnergySavings(
        getEnergySavings(b, buildingId, 'electric', type),
        getGasSavingsCost(b, buildingId, 'gas', type)
      ) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'maintenance_savings') {
    let valueA = (a.initialValues && a.initialValues.maintenance_savings) || 0
    let valueB = (b.initialValues && b.initialValues.maintenance_savings) || 0
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (
    key === 'project_application' ||
    key === 'project_category' ||
    key === 'project_technology'
  ) {
    let valueA, valueB
    if (key === 'project_category') {
      valueA = getCategory(a) || ''
      valueB = getCategory(b) || ''
    }
    if (key === 'project_application') {
      valueA = getApplication(a) || ''
      valueB = getApplication(b) || ''
    }
    if (key === 'project_technology') {
      valueA = getTechnology(a) || ''
      valueB = getTechnology(b) || ''
    }
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA.toLowerCase() < valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() < valueA.toLowerCase()
      ? 1
      : 0
  } else if (key === 'demand-savings') {
    let valueA = getDemandSavings(a, buildingId, type) || null
    let valueB = getDemandSavings(b, buildingId, type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'effective-useful-life') {
    let valueA = getEUL(a, buildingId) || a.measureLife || null
    let valueB = getEUL(b, buildingId) || b.measureLife || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'author') {
    let valueA = a?.author?.name || ''
    let valueB = b?.author?.name || ''
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA.toLowerCase() < valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() < valueA.toLowerCase()
      ? 1
      : 0
  }
}

export const sortProjectsDescending = (
  a,
  b,
  key,
  buildingId,
  type = 'runResults'
) => {
  if (key === 'displayName') {
    return a[key].toLowerCase() > b[key].toLowerCase()
      ? -1
      : b[key].toLowerCase() > a[key].toLowerCase()
      ? 1
      : 0
  } else if (key === 'updated' || key === 'created') {
    return (a[key] || null) > (b[key] || null)
      ? -1
      : (b[key] || null) > (a[key] || null)
      ? 1
      : 0
  } else if (key === 'project_cost') {
    let valueA = getProjectCost(a) || null
    let valueB = getProjectCost(b) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'incentive') {
    let valueA = getIncentive(a, buildingId, type) || null
    let valueB = getIncentive(b, buildingId, type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'annual-savings') {
    let valueA = getAnnualSavings(a, buildingId, 'sort', type) || null
    let valueB = getAnnualSavings(b, buildingId, 'sort', type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'electric-savings') {
    let valueA =
      getEnergySavings(a, buildingId, 'electric', 'sort', type) || null
    let valueB =
      getEnergySavings(b, buildingId, 'electric', 'sort', type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'gas') {
    let valueA = getGasSavingsCost(a, buildingId, 'gas', 'sort', type) || null
    let valueB = getGasSavingsCost(b, buildingId, 'gas', 'sort', type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'water-savings') {
    let valueA = getEnergySavings(a, buildingId, 'water', 'sort', type) || null
    let valueB = getEnergySavings(b, buildingId, 'water', 'sort', type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'ghg') {
    let valueA = getGHGSavingsCost(a, buildingId, 'ghg', type) || null
    let valueB = getGHGSavingsCost(b, buildingId, 'ghg', type) || null
    if (!a.runResults[buildingId]['calculation-type']) valueA = null
    if (!b.runResults[buildingId]['calculation-type']) valueB = null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'ghg-cost') {
    let valueA = getGHGSavingsCost(a, buildingId, 'ghg-cost', type) || null
    let valueB = getGHGSavingsCost(b, buildingId, 'ghg-cost', type) || null
    if (!isFinite(valueA)) valueA = null
    if (!isFinite(valueB)) valueB = null
    if (!a.runResults[buildingId]['calculation-type']) valueA = null
    if (!b.runResults[buildingId]['calculation-type']) valueB = null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'roi') {
    let valueA = getROI(a, buildingId, type) || null
    let valueB = getROI(b, buildingId, type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'simple-payback') {
    let valueA = getSimplePayback(a, buildingId, type) || null
    let valueB = getSimplePayback(b, buildingId, type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'npv') {
    let valueA = getNPV(a, buildingId, type) || null
    let valueB = getNPV(b, buildingId, type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'sir') {
    let valueA = getSIR(a, buildingId, type) || null
    let valueB = getSIR(b, buildingId, type) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'status') {
    let valueA = a.status || 'Identified'
    let valueB = b.status || 'Identified'
    if (valueA === valueB) return 0
    if (valueA === '') return 1
    if (valueB === '') return -1
    return valueA.toLowerCase() > valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() > valueA.toLowerCase()
      ? 1
      : 0
  } else if (key === 'type') {
    let valueA = a.type || ''
    let valueB = b.type || ''
    if (valueA === valueB) return 0
    if (valueA === '') return 1
    if (valueB === '') return -1
    return valueA.toLowerCase() > valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() > valueA.toLowerCase()
      ? 1
      : 0
  } else if (key === 'package.name') {
    let valueA = (a && a.package && a.package.name) || ''
    let valueB = (b && b.package && b.package.name) || ''
    if (valueA === valueB) return 0
    if (valueA === '') return 1
    if (valueB === '') return -1
    return valueA.toLowerCase() > valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() > valueA.toLowerCase()
      ? 1
      : 0
  } else if (key === 'budgetType') {
    let valueA = a.budgetType || 'Low Cost/No Cost'
    let valueB = b.budgetType || 'Low Cost/No Cost'
    return valueA.toLowerCase() > valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() > valueA.toLowerCase()
      ? 1
      : 0
  } else if (key === 'energy-savings') {
    let valueA =
      getTotalEnergySavings(
        getEnergySavings(a, buildingId, 'electric', type),
        getGasSavingsCost(a, buildingId, 'gas', type)
      ) || null
    let valueB =
      getTotalEnergySavings(
        getEnergySavings(b, buildingId, 'electric', type),
        getGasSavingsCost(b, buildingId, 'gas', type)
      ) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'maintenance_savings') {
    let valueA =
      (a.initialValues && a.initialValues.maintenance_savings) || null
    let valueB =
      (b.initialValues && b.initialValues.maintenance_savings) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (
    key === 'project_application' ||
    key === 'project_category' ||
    key === 'project_technology'
  ) {
    let valueA, valueB
    if (key === 'project_category') {
      valueA = getCategory(a) || ''
      valueB = getCategory(b) || ''
    }
    if (key === 'project_application') {
      valueA = getApplication(a) || ''
      valueB = getApplication(b) || ''
    }
    if (key === 'project_technology') {
      valueA = getTechnology(a) || ''
      valueB = getTechnology(b) || ''
    }
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA.toLowerCase() > valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() > valueA.toLowerCase()
      ? 1
      : 0
  } else if (key === 'demand-savings') {
    let valueA = getDemandSavings(a, buildingId)
    let valueB = getDemandSavings(b, buildingId)
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'effective-useful-life') {
    let valueA = getEUL(a, buildingId) || a.measureLife || null
    let valueB = getEUL(b, buildingId) || b.measureLife || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'author') {
    let valueA = a?.author?.name || ''
    let valueB = b?.author?.name || ''
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA.toLowerCase() > valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() > valueA.toLowerCase()
      ? 1
      : 0
  }
}

export const sortProjectPackagesAscending = (a, b, key) => {
  if (key === 'name') {
    return a[key].toLowerCase() < b[key].toLowerCase()
      ? -1
      : b[key].toLowerCase() < a[key].toLowerCase()
      ? 1
      : 0
  } else if (key === 'updated' || key === 'created') {
    return (a[key] || null) < (b[key] || null)
      ? -1
      : (b[key] || null) < (a[key] || null)
      ? 1
      : 0
  } else if (key === 'project_cost') {
    let valueA = (a.total && a.total.projectCost) || null
    let valueB = (b.total && b.total.projectCost) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'incentive') {
    let valueA = (a.total && a.total.incentive) || null
    let valueB = (b.total && b.total.incentive) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'annual-savings') {
    let valueA = (a.total && a.total.annualSavings) || null
    let valueB = (b.total && b.total.annualSavings) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'electric-savings') {
    let valueA = (a.total && a.total.electric) || null
    let valueB = (b.total && b.total.electric) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'gas') {
    let valueA = (a.total && a.total.gasSavings) || null
    let valueB = (b.total && b.total.gasSavings) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'water-savings') {
    let valueA = (a.total && a.total.waterSavings) || null
    let valueB = (b.total && b.total.waterSavings) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'roi') {
    let valueA = (a.total && a.total.roi) || null
    let valueB = (b.total && b.total.roi) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'simple-payback') {
    let valueA = (a.total && a.total.simplePayBack) || null
    let valueB = (b.total && b.total.simplePayBack) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'npv') {
    let valueA = (a.total && a.total.npv) || null
    let valueB = (b.total && b.total.npv) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'sir') {
    let valueA = (a.total && a.total.sir) || null
    let valueB = (b.total && b.total.sir) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'ghg') {
    let valueA = (a.total && a.total.ghgSavings) || null
    let valueB = (b.total && b.total.ghgSavings) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'ghg-cost') {
    let valueA = (a.total && a.total.ghgSavingsCost) || null
    let valueB = (b.total && b.total.ghgSavingsCost) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'energy-savings') {
    let valueA = (a.total && a.total.energySavings) || null
    let valueB = (b.total && b.total.energySavings) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'project_number') {
    let valueA = (a && a.projects && a.projects.length) || null
    let valueB = (b && b.projects && b.projects.length) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'demand-savings') {
    let valueA = (a && a.total && a.total.demandSavings) || null
    let valueB = (b && b.total && b.total.demandSavings) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'maintenance_savings') {
    let valueA = (a && a.total && a.total.maintenanceSavings) || null
    let valueB = (b && b.total && b.total.maintenanceSavings) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'effective-useful-life') {
    let valueA = (a && a.total && a.total.eul) || null
    let valueB = (b && b.total && b.total.eul) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'status') {
    let valueA = a.status || 'Identified'
    let valueB = b.status || 'Identified'
    return valueA.toLowerCase() < valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() < valueA.toLowerCase()
      ? 1
      : 0
  } else if (key === 'constructionStatus') {
    let valueA = a.constructionStatus || 'Conceptual design'
    let valueB = b.constructionStatus || 'Conceptual design'
    return valueA.toLowerCase() < valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() < valueA.toLowerCase()
      ? 1
      : 0
  } else if (key == 'estimatedstartdate') {
    const valueA = a.estimatedStartDate ? new Date(a.estimatedStartDate) : null
    const valueB = b.estimatedStartDate ? new Date(b.estimatedStartDate) : null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key == 'estimatedcompletiondate') {
    const valueA = a.estimatedCompletionDate
      ? new Date(a.estimatedCompletionDate)
      : null
    const valueB = b.estimatedCompletionDate
      ? new Date(b.estimatedCompletionDate)
      : null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key == 'actualstartdate') {
    const valueA = a.actualStartDate ? new Date(a.actualStartDate) : null
    const valueB = b.actualStartDate ? new Date(b.actualStartDate) : null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key == 'actualcompletiondate') {
    const valueA = a.actualCompletionDate
      ? new Date(a.actualCompletionDate)
      : null
    const valueB = b.actualCompletionDate
      ? new Date(b.actualCompletionDate)
      : null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  } else if (key === 'author') {
    let valueA = a?.author?.name || ''
    let valueB = b?.author?.name || ''
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA.toLowerCase() < valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() < valueA.toLowerCase()
      ? 1
      : 0
  } else {
    const valueA = a[key] || null
    const valueB = b[key] || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
  }
}

export const sortProjectPackagesDescending = (a, b, key) => {
  if (key === 'name') {
    return a[key].toLowerCase() > b[key].toLowerCase()
      ? -1
      : b[key].toLowerCase() > a[key].toLowerCase()
      ? 1
      : 0
  } else if (key === 'updated' || key === 'created') {
    return (a[key] || null) > (b[key] || null)
      ? -1
      : (b[key] || null) > (a[key] || null)
      ? 1
      : 0
  } else if (key === 'project_cost') {
    let valueA = (a.total && a.total.projectCost) || null
    let valueB = (b.total && b.total.projectCost) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'incentive') {
    let valueA = (a.total && a.total.incentive) || null
    let valueB = (b.total && b.total.incentive) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? -1 : 0
  } else if (key === 'annual-savings') {
    let valueA = (a.total && a.total.annualSavings) || null
    let valueB = (b.total && b.total.annualSavings) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'electric-savings') {
    let valueA = (a.total && a.total.electric) || null
    let valueB = (b.total && b.total.electric) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'gas') {
    let valueA = (a.total && a.total.gasSavings) || null
    let valueB = (b.total && b.total.gasSavings) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'water-savings') {
    let valueA = (a.total && a.total.waterSavings) || null
    let valueB = (b.total && b.total.waterSavings) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'roi') {
    let valueA = (a.total && a.total.roi) || null
    let valueB = (b.total && b.total.roi) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'simple-payback') {
    let valueA = (a.total && a.total.simplePayBack) || null
    let valueB = (b.total && b.total.simplePayBack) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'npv') {
    let valueA = (a.total && a.total.npv) || null
    let valueB = (b.total && b.total.npv) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'sir') {
    let valueA = (a.total && a.total.sir) || null
    let valueB = (b.total && b.total.sir) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'ghg') {
    let valueA = (a.total && a.total.ghgSavings) || null
    let valueB = (b.total && b.total.ghgSavings) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'ghg-cost') {
    let valueA = (a.total && a.total.ghgSavingsCost) || null
    let valueB = (b.total && b.total.ghgSavingsCost) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'energy-savings') {
    let valueA = (a.total && a.total.energySavings) || null
    let valueB = (b.total && b.total.energySavings) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'project_number') {
    let valueA = (a && a.projects && a.projects.length) || null
    let valueB = (b && b.projects && b.projects.length) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'demand-savings') {
    let valueA = (a && a.total && a.total.demandSavings) || null
    let valueB = (b && b.total && b.total.demandSavings) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'effective-useful-life') {
    let valueA = (a && a.total && a.total.eul) || null
    let valueB = (b && b.total && b.total.eul) || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'status') {
    let valueA = a.status || 'Identified'
    let valueB = b.status || 'Identified'
    return valueA.toLowerCase() > valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() > valueA.toLowerCase()
      ? 1
      : 0
  } else if (key === 'constructionStatus') {
    let valueA = a.constructionStatus || 'Conceptual design'
    let valueB = b.constructionStatus || 'Conceptual design'
    return valueA.toLowerCase() > valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() > valueA.toLowerCase()
      ? 1
      : 0
  } else if (key == 'estimatedstartdate') {
    const valueA = a.estimatedStartDate ? new Date(a.estimatedStartDate) : null
    const valueB = b.estimatedStartDate ? new Date(b.estimatedStartDate) : null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key == 'estimatedcompletiondate') {
    const valueA = a.estimatedCompletionDate
      ? new Date(a.estimatedCompletionDate)
      : null
    const valueB = b.estimatedCompletionDate
      ? new Date(b.estimatedCompletionDate)
      : null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key == 'actualstartdate') {
    const valueA = a.actualStartDate ? new Date(a.actualStartDate) : null
    const valueB = b.actualStartDate ? new Date(b.actualStartDate) : null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key == 'actualcompletiondate') {
    const valueA = a.actualCompletionDate
      ? new Date(a.actualCompletionDate)
      : null
    const valueB = b.actualCompletionDate
      ? new Date(b.actualCompletionDate)
      : null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  } else if (key === 'author') {
    let valueA = a?.author?.name || ''
    let valueB = b?.author?.name || ''
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA.toLowerCase() > valueB.toLowerCase()
      ? -1
      : valueB.toLowerCase() > valueA.toLowerCase()
      ? 1
      : 0
  } else {
    const valueA = a[key] || null
    const valueB = b[key] || null
    if (valueA === valueB) return 0
    if (!valueA) return 1
    if (!valueB) return -1
    return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
  }
}

export const getDisplayName = project => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    return project.displayName
  } else {
    return project.name
  }
}

export const getProjectCost = project => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let value = 0
      for (let item of project.projects) {
        let itemValue = calculateProjectCost(item) || 0
        if (itemValue == +itemValue) itemValue = +itemValue
        value += itemValue
      }
      return value
    }
    return calculateProjectCost(project) || 0
  } else {
    return (project.total && project.total.projectCost) || 0
  }
}

export const getIncentive = (project, buildingId, key = 'runResults') => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let value = 0
      for (let item of project.projects) {
        let itemValue = calculateIncentive(item, buildingId, key) || 0
        if (itemValue == +itemValue) itemValue = +itemValue
        value += itemValue
      }
      return value
    }
    return calculateIncentive(project, buildingId, key)
  } else {
    let total = {}
    if (key === 'runResults') total = project.total || {}
    else total = project.totalWithRates || {}
    return total && total.incentive
  }
}

export const getAnnualSavings = (
  project,
  buildingId,
  sort = 'sort',
  key = 'runResults'
) => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let value = 0
      for (let item of project.projects) {
        let itemValue = calculateAnnualSavings(item, buildingId, sort, key) || 0
        if (itemValue == +itemValue) itemValue = +itemValue
        value += +itemValue
      }
      return value
    }
    return calculateAnnualSavings(project, buildingId, sort, key)
  } else {
    let total = {}
    if (key === 'runResults') total = project.total || {}
    else total = project.totalWithRates || {}
    return total && total.annualSavings
  }
}

export const getROI = (project, buildingId, key = 'runResults') => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let value = 0
      for (let item of project.projects) {
        let itemValue = calculateROI(item, buildingId, key) || 0
        if (itemValue == +itemValue) itemValue = +itemValue
        value += itemValue
      }
      return value
    }
    return calculateROI(project, buildingId, key)
  } else {
    let total = {}
    if (key === 'runResults') total = project.total || {}
    else total = project.totalWithRates || {}
    return total && total.roi
  }
}

export const getSimplePayback = (project, buildingId, key = 'runResults') => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let values = []
      let { cashFlowData = {} } = project
      if (!_.isEmpty(cashFlowData) && project.projects.length > 1) {
        return getSimplePaybackFromCashFlow(cashFlowData)
      }
      for (let item of project.projects) {
        let itemValue = calculateSimplePayback(item, buildingId, key) || 0
        if (itemValue == +itemValue) itemValue = +itemValue
        if (itemValue) values.push(itemValue)
      }
      return getMedianValue(values) || 0
    }
    return calculateSimplePayback(project, buildingId, key)
  } else {
    let total = {}
    if (key === 'runResults') total = project.total || {}
    else total = project.totalWithRates || {}
    return total && total.simplePayBack
  }
}

export const getSimplePaybackFromCashFlow = data => {
  return data?.simple_payback || 0
}

export const getNPV = (project, buildingId, key = 'runResults') => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let value = 0
      let { cashFlowData = {} } = project
      if (!_.isEmpty(cashFlowData) && project && project.projects.length > 1) {
        const annualSavings = getAnnualSavings(project, buildingId)
        return getNPVFromCashFlow(cashFlowData, annualSavings)
      }
      for (let item of project.projects) {
        let itemValue = calculateNPV(item, buildingId, key) || 0
        if (itemValue == +itemValue) itemValue = +itemValue
        value += itemValue
      }
      return value
    }
    return calculateNPV(project, buildingId, key)
  } else {
    let total = {}
    if (key === 'runResults') total = project.total || {}
    else total = project.totalWithRates || {}
    return total && total.npv
  }
}

export const getNPVFromCashFlow = (data, annualSavings) => {
  let npv
  let cashFlows = data.cash_flows || []
  if (!_.isEmpty(cashFlows) && annualSavings > 0) {
    npv = Math.ceil(cashFlows.slice(-1)[0].NPV)
  } else npv = 0
  return npv
}

export const getSIR = (project, buildingId, key = 'runResults') => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let value = 0
      let { cashFlowData } = project
      if (!_.isEmpty(cashFlowData) && project.projects.length > 1) {
        const annualSavings = getAnnualSavings(project, buildingId)
        return getSIRFromCashFlow(cashFlowData, annualSavings)
      }
      for (let item of project.projects) {
        let itemValue = calculateSIR(item, buildingId, key)
        if (itemValue == +itemValue) itemValue = +itemValue
        value += itemValue
      }
      return value
    }
    return calculateSIR(project, buildingId, key)
  } else {
    let total = {}
    if (key === 'runResults') total = project.total || {}
    else total = project.totalWithRates || {}
    return total && total.sir
  }
}

export const getSIRFromCashFlow = (data, annualSavings) => {
  let cashFlows = data.cash_flows || []
  let sir
  if (
    !_.isEmpty(cashFlows) &&
    cashFlows[0] &&
    cashFlows[0].SIR &&
    annualSavings > 0
  ) {
    sir = Number(cashFlows.slice(-1)[0].SIR.toFixed(2))
  } else sir = 0
  return sir
}

export const getDemandSavings = (project, buildingId, key = 'runResults') => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let value = 0
      for (let item of project.projects) {
        let itemValue = calculateDemandSavings(item, buildingId, key) || 0
        if (itemValue == +itemValue) itemValue = +itemValue
        if (!isFinite(itemValue)) itemValue = 0
        value += itemValue
      }
      return value
    }
    return calculateDemandSavings(project, buildingId, key)
  } else {
    let total = {}
    if (key === 'runResults') total = project.total || {}
    else total = project.totalWithRates || {}
    return total && total.demandSavings
  }
}

export const getEUL = (project, buildingId, key = 'runResults') => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let value = 0
      for (let item of project.projects) {
        let itemValue =
          calculateEUL(item, buildingId, key) || item.measureLife || 0
        value = Math.max(value, Number(itemValue))
      }
      return value
    }
    return calculateEUL(project, buildingId, key) || project.measureLife
  } else {
    let total = {}
    if (key === 'runResults') total = project.total || {}
    else total = project.totalWithRates || {}
    return total && total.eul
  }
}

export const getMaintenanceSavings = (project, key = 'runResults') => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let value = 0
      for (let item of project.projects) {
        let itemValue =
          (item.initialValues && item.initialValues.maintenance_savings) || 0
        if (itemValue == +itemValue) itemValue = +itemValue
        if (isNaN(itemValue)) itemValue = 0
        value += itemValue
      }
      return value
    }

    return (
      (project.initialValues && project.initialValues.maintenance_savings) || 0
    )
  } else {
    let total = {}
    if (key === 'runResults') total = project.total || {}
    else total = project.totalWithRates || {}
    return total && total.maintenanceSavings
  }
}

export const getEnergySavings = (
  project,
  buildingId,
  fuel,
  sort = 'sort',
  key = 'runResults'
) => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let value = 0
      for (let item of project.projects) {
        let itemValue =
          calculateEnergySavings(item, buildingId, fuel, sort, key) || 0
        if (itemValue == +itemValue) itemValue = +itemValue
        if (!isFinite(itemValue)) itemValue = 0
        value += itemValue
      }
      return value
    }

    return calculateEnergySavings(project, buildingId, fuel, sort, key)
  } else {
    let total = {}
    if (key === 'runResults') total = project.total || {}
    else total = project.totalWithRates || {}
    switch (fuel) {
      case 'electric':
        return total && total.electric
      case 'water':
        return total && total.waterSavings
      default:
        return null
    }
  }
}

export const getGHGSavingsCost = (
  project,
  buildingId,
  option,
  key = 'runResults'
) => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let value = 0
      for (let item of project.projects) {
        let itemValue =
          calculateGHGSavingsCost(item, buildingId, option, key) || 0
        if (item.projects && item.projects.length > 0)
          itemValue = getGHGSavingsCost(item, buildingId, option, key)
        if (itemValue == +itemValue) itemValue = +itemValue
        if (!isFinite(itemValue)) itemValue = 0
        value += itemValue
      }
      return value
    }

    let value = calculateGHGSavingsCost(project, buildingId, option, key)
    if (!isFinite(value)) return 0
    return value
  } else {
    let total = {}
    if (key === 'runResults') total = project.total || {}
    else total = project.totalWithRates || {}
    switch (option) {
      case 'ghg':
        return total && total.ghgSavings
      case 'ghg-cost':
        return total && total.ghgSavingsCost
      default:
        return null
    }
  }
}

export const getGasSavingsCost = (
  project,
  buildingId,
  data,
  key = 'runResults'
) => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let value = 0
      for (let item of project.projects) {
        let itemValue = calculateGasSavingsCost(item, buildingId, data, key)
        if (!isFinite(itemValue)) itemValue = 0
        if (itemValue == +itemValue) itemValue = +itemValue
        value += itemValue
      }
      return value
    }

    return calculateGasSavingsCost(project, buildingId, data, key)
  } else {
    let total = {}
    if (key === 'runResults') total = project.total || {}
    else total = project.totalWithRates || {}
    switch (data) {
      case 'gas':
        return total && total.gasSavings
      default:
        return null
    }
  }
}

export const getTotalEnergySavings = (
  project,
  buildingId,
  key = 'runResults'
) => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let totalValue = 0
      for (let item of project.projects) {
        let electric =
          calculateEnergySavings(item, buildingId, 'electric', 'sort', key) || 0
        let gas = calculateGasSavingsCost(item, buildingId, 'gas', key) || 0
        let itemValue = calculateTotalEnergySavings(electric, gas) || 0
        if (itemValue == +itemValue) itemValue = +itemValue
        totalValue += itemValue
      }
      return totalValue
    }

    let electric =
      calculateEnergySavings(project, buildingId, 'electric', 'sort', key) || 0
    let gas = calculateGasSavingsCost(project, buildingId, 'gas', key) || 0
    return calculateTotalEnergySavings(electric, gas) || 0
  } else {
    let total = {}
    if (key === 'runResults') total = project.total || {}
    else total = project.totalWithRates || {}
    return total && total.energySavings
  }
}

export const getCalculationType = (project, buildingId, key = 'runResults') => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') {
    if (project && project.projects && project.projects.length) {
      let calculationType = ''
      for (let item of project.projects) {
        let itemValue =
          item &&
          item[key] &&
          item[key][buildingId] &&
          item[key][buildingId]['calculation-type']
        if (!calculationType && itemValue) return itemValue
      }
      return ''
    }
    return (
      project &&
      project[key] &&
      project[key][buildingId] &&
      project[key][buildingId]['calculation-type']
    )
  } else {
    let total = {}
    if (key === 'runResults') total = project.total || {}
    else total = project.totalWithRates || {}
    return total && total.calculationType
  }
}

export const getCategory = project => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') return project.project_category
  return project.category && project.category.displayName
}

export const getApplication = project => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') return project.project_application
  return project.application && project.application.displayName
}

export const getTechnology = project => {
  if (!project) return null
  let collectionTarget = project.collectionTarget || 'measure'
  if (collectionTarget === 'measure') return project.project_technology
  return project.technology && project.technology.displayName
}
