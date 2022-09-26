import superagent from 'superagent'
import { default as encrypt } from 'crypto-js/hmac-sha1'
import states from 'static/states.json'
import config from '../../project.config'
import buildingTypes from 'static/building-types'
import { UNIT_DETAILS } from 'static/utility-units'

const GAUSSIAN = 1 / Math.sqrt(2 * Math.PI)
const proto = !config.secure ? 'http://' : 'https://'

export const createDigest = ({ secret, method, path, nonce, timestamp }) => {
  const digest = [method, path, timestamp, nonce].join('+')
  return String(encrypt(digest, secret))
}

export const routerLoginCheck = store => {
  if (store && typeof store.getState === 'function') {
    store = store.getState()
  }
  return Boolean(
    store && store.login && store.login.user && store.login.user.email
  )
}

export const routerTermsCheck = store => {
  if (store && typeof store.getState === 'function') {
    store = store.getState()
  }
  return Boolean(
    store && store.login && store.login.user && store.login.user.acceptedTerms
  )
}

// true = expired, false = valid
export const sessionExpireCheck = sessionObj => {
  let ret = true
  if (
    sessionObj &&
    sessionObj.expiry &&
    sessionObj.expiry > new Date().getTime()
  ) {
    ret = false
  }
  return ret
}

// Graphing functions
export const normalDist = () => {
  let x = 0,
    y = 0,
    rds,
    c

  do {
    x = Math.random() * 2 - 1
    y = Math.random() * 2 - 1
    rds = x * x + y * y
  } while (rds == 0 || rds > 1)

  c = Math.sqrt((-2 * Math.log(rds)) / rds)

  return x * c
}

export const gaussian = x => {
  let mean = 0,
    sigma = 1

  x = (x - mean) / sigma

  return (GAUSSIAN * Math.exp(-0.5 * x * x)) / sigma
}

// export const downloadItem = path => {
//   let url = proto + config.apiHost + path
//   return new Promise((resolve,reject) => {
//     superagent
//       .get(url)
//       .then(res => {
//         resolve(window.location.assign(url))
//       })
//       .catch(() => {
//           alert("Issue Downloading Report")
//           reject("Issue downloading Report")
//       })
//   })

// } Bug- 3150: needs to be opened later on
export const downloadItem = path => {
  window.location.assign(generateDownloadUrl(path))
}

export const generateDownloadUrl = path => {
  return proto + config.apiHost + path
}

export const downloadIntegrationApiItem = path => {
  window.location.assign(
    'https://analysis-qa.buildee.com:5000/integration' + path
  )
}

export const HTTPDoesExist = (url, contentType) => {
  return new Promise((resolve, reject) => {
    superagent
      .get(url)
      .then(res => {
        if (!res || (res && !res.headers)) reject()

        let test = res.headers['content-type'].indexOf(contentType) !== -1
        resolve(test)
      })
      .catch(() => {
        reject()
      })
  })
}
export const validateEmail = email => {
  var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return regex.test(email)
}

export const formatUnderscoreNotation = function(field) {
  var ret = [],
    tmp
  field.split('_').map(function(ele) {
    tmp = ele.replace(/([A-Z])/g, ' $1')
    ret.push(tmp.charAt(0).toUpperCase() + tmp.slice(1))
  })
  return ret.join(' ')
}

export const formatCamelCaseNotation = field => {
  if (typeof field !== 'string') return field
  var tmp = field.replace(/([A-Z]|[0-9])/g, ' $1')
  var ret = tmp.charAt(0).toUpperCase() + tmp.slice(1)
  ret = ret.replace(/Of/g, 'of')
  return ret
}

export const formatProComponentNames = field => {
  switch (field) {
    case 'coolingtowers':
      return 'Cooling Towers'
    case 'customsystems':
      return 'Custom Systems'
    case 'lightfixtures':
      return 'Light Fixtures'
    case 'packagedunits':
      return 'Packaged Units'
    case 'plugloads':
      return 'Plug Loads'
    case 'processloads':
      return 'Process Loads'
    case 'waterfixtures':
      return 'Water Fixtures'
    case 'dhws':
      return 'Water Heaters'
    case 'generalarea':
      return 'General Area'
    default:
      return formatCamelCaseNotation(field)
  }
}

export const checkImageSize = (file, fn) => {
  var reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = function(event) {
    var dataUrl = event.target.result
    var image = new Image()
    image.src = dataUrl
    image.onload = function() {
      if (image.width > 150 && image.height > 150) fn(0)
      fn(1)
    }
  }
}

export const Resize = (file, maxWidth, maxHeight, fn) => {
  var reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = function(event) {
    var dataUrl = event.target.result

    getOrientation(file, function(orientation) {
      let degree = 0
      switch (orientation) {
        case 1:
          degree = 0
          break
        case 2:
          degree = 0
          break
        case 3:
          degree = 180
          break
        case 4:
          degree = 180
          break
        case 5:
          degree = 90
          break
        case 6:
          degree = 90
          break
        case 7:
          degree = 270
          break
        case 8:
          degree = 270
          break
        default:
          degree = 0
          break
      }

      var image = new Image()
      image.src = dataUrl
      image.onload = function() {
        var resizedDataUrl = resizeImage(
          degree,
          image,
          maxWidth,
          maxHeight,
          0.7,
          file.type
        )
        fn(resizedDataUrl)
      }
    })
  }
}

const getOrientation = (file, callback) => {
  var reader = new FileReader()
  reader.onload = function(e) {
    var view = new DataView(e.target.result)

    var length = view.byteLength,
      offset = 2
    while (offset < length) {
      if (view.getUint16(offset + 2, false) <= 8) return callback(-1)
      var marker = view.getUint16(offset, false)
      offset += 2
      if (marker == 0xffe1) {
        if (view.getUint32((offset += 2), false) != 0x45786966) {
          return callback(-1)
        }

        var little = view.getUint16((offset += 6), false) == 0x4949
        offset += view.getUint32(offset + 4, little)
        var tags = view.getUint16(offset, little)
        offset += 2
        for (var i = 0; i < tags; i++) {
          if (view.getUint16(offset + i * 12, little) == 0x0112) {
            return callback(view.getUint16(offset + i * 12 + 8, little))
          }
        }
      } else if ((marker & 0xff00) != 0xff00) {
        break
      } else {
        offset += view.getUint16(offset, false)
      }
    }
    return callback(-1)
  }
  reader.readAsArrayBuffer(file)
}

const resizeImage = (degree, image, maxWidth, maxHeight, quality, fileType) => {
  var canvas = document.createElement('canvas')

  var width = image.width
  var height = image.height

  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width)
      width = maxWidth
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height)
      height = maxHeight
    }
  }

  if (degree === 90 || degree === 270) {
    canvas.width = height
    canvas.height = width
  } else {
    canvas.width = width
    canvas.height = height
  }

  var ctx = canvas.getContext('2d')

  if (degree === 0) {
    ctx.drawImage(image, 0, 0, width, height)
  } else if (degree === 90) {
    ctx.translate(canvas.width, 0)
    ctx.rotate((degree * Math.PI) / 180)
    ctx.drawImage(image, 0, 0, canvas.height, canvas.width)
  } else if (degree === 270) {
    ctx.translate(canvas.width, 0)
    ctx.rotate((degree * Math.PI) / 180)
    ctx.drawImage(
      image,
      -canvas.height,
      -canvas.width,
      canvas.height,
      canvas.width
    )
  }

  // set file type as jpeg if the file type is not png (transparent background issue)
  if (fileType !== 'image/png') {
    fileType = 'image/jpeg'
  }

  var resized = canvas.toDataURL(fileType, quality)

  var byteString
  if (resized.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(resized.split(',')[1])
  } else byteString = unescape(resized.split(',')[1])

  // separate out the mime component
  var mimeString = resized
    .split(',')[0]
    .split(':')[1]
    .split(';')[0]

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length)
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  return new Blob([ia], { type: mimeString })
}

export const formatHyphenNotationLabel = field => {
  var ret = [],
    tmp
  field.split('-').map(function(ele) {
    tmp = ele.replace(/([A-Z])/g, ' $1')
    ret.push(tmp.charAt(0).toUpperCase() + tmp.slice(1))
  })
  return ret.join(' ')
}

/**
 * _getValueFromObjPerPath.call(objectContext, pathToGetValue);
 */
export const _getValueFromObjPerPath = function(path, value) {
  const field = path.split('.').reduce(function(prev, curr) {
    return prev !== undefined && prev !== null ? prev[curr] : undefined
  }, this)
  return field
}

export const formatNumbersWithCommas = x => {
  if (!x) {
    return ''
  }
  if (isNaN(x)) {
    return x
  }

  x = parseFloat(x).toFixed(2)

  var parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  if (parts[parts.length - 1] === '00') {
    return parts[0]
  }
  return parts.join('.')
}

export const defaultUtilUnitsFromType = (utilType, commoditySettings = {}) => {
  if (commoditySettings[utilType]) return commoditySettings[utilType].unit
  return UNIT_DETAILS[utilType].defaultUnit
}

export const truncateName = (string, length) => {
  if (string && string.length > 0) {
    return string.length > length
      ? string.substr(0, length - 1) + '...'
      : string
  }
}

export const parentNodeHasClass = (element, classname) => {
  // If we are here we didn't find the searched class in any parents node
  if (!element.parentNode) return false
  // If the current node has the class return true, otherwise we will search
  // it in the parent node
  if (typeof element.className === 'string') {
    if (element.className.split(' ').indexOf(classname) >= 0) {
      return true
    }
    const classNames = element.className.split(' ')
    const value = classNames.some(className => {
      return className.includes(classname)
    })
    if (value) return true
  }
  return parentNodeHasClass(element.parentNode, classname)
}

export const detectMobileTouch = () => {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera
  if (
    /windows phone/i.test(userAgent) ||
    /android/i.test(userAgent) ||
    (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)
  ) {
    return 'mobile'
  } else {
    return 'desktop'
  }
}

export const findLastIndex = (array, searchValue) => {
  var index = array
    .slice()
    .reverse()
    .findIndex(x => x.substring(0, x.indexOf('.')) === searchValue)
  var count = array.length - 1
  var finalIndex = index >= 0 ? count - index : index
  return finalIndex
}

export const formatOverviewFields = field => {
  const _formatDotCamelCaseNotation = field => {
    let parts = field.split('.')

    if (parts[0] === 'year' && parts[1] === 'Custom') {
      // custom year format
      const format = `Time Period - From ${parts[2]}/${parts[3]} To ${parts[4]}/${parts[5]}`
      return format
    }

    return parts
      .map((part, index) => {
        if (index === 0) {
          return formatCamelCaseNotation(part) + ' – '
        } else {
          return formatCamelCaseNotation(part) + ' '
        }
      })
      .join('')
  }

  let label
  switch (field) {
    case 'annualCostBenchmark.you':
      label = 'Annual Cost Benchmark - You'
      break
    case 'annualCostBenchmark.percentMedian':
      label = 'Annual Cost Benchmark - Percent Median'
      break
    case 'annualCostBenchmark.median':
      label = 'Annual Cost Benchmark - Median'
      break
    case 'annualCostBenchmark.percentile75':
      label = 'Annual Cost Benchmark - 75th Pecentile'
      break
    case 'annualCostBenchmark.percentile90':
      label = 'Annual Cost Benchmark - 90th Pecentile'
      break
    case 'annualUsageBenchmark.you':
      label = 'Annual Usage Benchmark - You'
      break
    case 'annualUsageBenchmark.percentMedian':
      label = 'Annual Usage Benchmark - Percent Median'
      break
    case 'annualUsageBenchmark.median':
      label = 'Annual Usage Benchmark - Median'
      break
    case 'annualUsageBenchmark.percentile75':
      label = 'Annual Usage Benchmark - 75th Pecentile'
      break
    case 'annualUsageBenchmark.percentile90':
      label = 'Annual Usage Benchmark - 90th Pecentile'
      break
    case 'ghgEmissions.totalEmissions':
      label = 'GHG Emissions - Total Emissions'
      break
    case 'ghgEmissions.vehiclesDriven':
      label = 'GHG Emissions - Vehicles Driven in a Year'
      break
    case 'ghgEmissions.oilBarrelsConsumed':
      label = 'GHG Emissions - Barrels of Oil Consumed'
      break
    case 'ghgEmissions.coalRailcarsBurned':
      label = 'GHG Emissions - Railcars of Coal Burned'
      break
    case 'ghgEmissions.ghgIntensity':
      label = 'GHG Emissions - GHG Intensity'
      break
    case 'fuelOil56.waterWUI':
      label = 'Fuel Oil 5 & 6 - Water WUI'
      break
    case 'fuelOil56.totalUsage':
      label = 'Fuel Oil 5 & 6 - Total Usage'
      break
    case 'fuelOil56.totalUsagePercent':
      label = 'Fuel Oil 5 & 6 - Total Usage Percentage'
      break
    case 'fuelOil56.totalUsageCost':
      label = 'Fuel Oil 5 & 6 - Total Cost'
      break
    case 'fuelOil56.totalUsageCostPercent':
      label = 'Fuel Oil 5 & 6 - Total Cost Percentage'
      break
    case 'fuelOil56.GhgEmissions':
      label = 'Fuel Oil 5 & 6 - GHG Emissions'
      break
    default:
      label = _formatDotCamelCaseNotation(field)
      break
  }
  return label
}
/*
 * Format Benchmarking fields
 */
export const formatBenchmarkFields = field => {
  let label

  switch (field) {
    case 'general.siteEUI':
      label = 'Site EUI'
      break
    case 'general.pmScore':
      label = 'Energy Star Portfolio Manager Score'
      break
    case 'annualCost.percentMedian':
      label = 'Annual Cost - % vs Median'
      break
    case 'annualCost.you':
      label = 'Annual Cost - You'
      break
    case 'annualCost.median':
      label = 'Annual Cost - Median'
      break
    case 'annualCost.percentile75':
      label = 'Annual Cost - 75th Percentile'
      break
    case 'annualCost.percentile90':
      label = 'Annual Cost - 90th Percentile'
      break
    case 'annualUsage.percentMedian':
      label = 'Annual Usage - % vs Median'
      break
    case 'annualUsage.you':
      label = 'Annual Usage - You'
      break
    case 'annualUsage.median':
      label = 'Annual Usage - Median'
      break
    case 'annualUsage.percentile75':
      label = 'Annual Usage - 75th Percentile'
      break
    case 'annualUsage.percentile90':
      label = 'Annual Usage - 90th Percentile'
      break
    case 'systemsUsage.general':
      label = 'Systems Usage - General'
      break
    case 'systemsUsage.lighting':
      label = 'Systems Usage - Lighting'
      break
    case 'systemsUsage.heating':
      label = 'Systems Usage - Heating'
      break
    case 'systemsUsage.cooling':
      label = 'Systems Usage - Cooling'
      break
    case 'systemsUsage.dhw':
      label = 'Systems Usage - Water Heating'
      break
  }

  return label
}

/*
 * Format Benchmarking fields
 */
export const formatLocationFields = field => {
  field = _formatDotNotationLabel(field)
  if (field === 'Usetype') {
    return 'Use Type'
  } else if (field.includes('Percentof')) {
    return field.replace('Percentof', '% of')
  } else {
    return field
  }
}

var _formatDotNotationLabel = function(label, includeParent) {
  var ret = [],
    tmp
  label.split('.').map(function(ele) {
    tmp = ele.replace(/([A-Z])/g, ' $1')
    ret.push(tmp.charAt(0).toUpperCase() + tmp.slice(1))
  })
  return !includeParent ? ret[ret.length - 1] : ret.join(' - ')
}
/*
 * Format Utility fields
 */
export const formatUtilityFields = field => {
  const _formatDotCamelCaseNotation = field => {
    let parts = field.split('.')
    return parts
      .map((part, index) => {
        if (index === 0) {
          return formatCamelCaseNotation(part) + ' – '
        } else {
          return formatCamelCaseNotation(part) + ' '
        }
      })
      .join('')
  }

  let label

  switch (field) {
    case 'ghgEmissions.totalEmissions':
      label = 'GHG Emissions - Total Emissions'
      break
    case 'ghgEmissions.ghgIntensity':
      label = 'GHG Emissions - GHG Intensity'
      break
    case 'ghgEmissions.vehiclesDriven':
      label = 'GHG Emissions - Vehicles Driven in a Year'
      break
    case 'ghgEmissions.oilBarrelsConsumed':
      label = 'GHG Emissions - Barrels of Oil Consumed'
      break
    case 'ghgEmissions.coalRailcarsBurned':
      label = 'GHG Emissions - Railcars of Coal Burned'
      break
    case 'fuelOil56Meters.totalUsage':
      label = 'Fuel Oil 5 & 6 Meter – Total Delivered'
      break
    case 'fuelOil56Meters.totalUsagePercent':
      label = 'Fuel Oil 5 & 6 Meter – Total Delivered Percent'
      break
    case 'fuelOil56Meters.totalUsageCost':
      label = 'Fuel Oil 5 & 6 Meter – Total Delivered Cost'
      break
    case 'fuelOil56Meters.totalUsageCostPercent':
      label = 'Fuel Oil 5 & 6 Meter – Total Delivered Cost Percent'
      break
    case 'rates.fuelOil56':
      label = 'Rates – Fuel Oil 5 & 6'
      break
    case 'year.12':
      label = 'Time Period - Last 12 months'
      break
    case 'year.24':
      label = 'Time Period - Last 24 months'
      break
    case 'year.36':
      label = 'Time Period - Last 36 months'
      break
    default:
      label = _formatDotCamelCaseNotation(field)
      break
  }
  return label
}

export const isProdEnv = domain => {
  return true
  return (
    domain === 'beta.buildee.com' ||
    domain === 'pre-prod.buildee.com' ||
    domain === 'app.buildee.com'
  )
}

export const formatEndUseBreakDownFields = field => {
  const _formatDotCamelCaseNotation = field => {
    let parts = field.split('.')
    return parts
      .map((part, index) => {
        if (index === 0) {
          return formatCamelCaseNotation(part) + ' – '
        } else {
          return formatCamelCaseNotation(part) + ' '
        }
      })
      .join('')
  }

  let label

  switch (field) {
    case 'estimatedEndUseBreakdown.percentages':
      label = 'Estimated End Use Breakdown - Percentages'
      break
    case 'actualEndUseBreakdown.totalUse':
      label = 'Actual End Use Breakdown - Total Use'
      break
    case 'actualEndUseBreakdown.electricityUse':
      label = 'Actual End Use Breakdown - Electricity Use'
      break
    case 'actualEndUseBreakdown.naturalGasUse':
      label = 'Actual End Use Breakdown - Natural Gas Use'
      break
    case 'actualEndUseBreakdown.percentages':
      label = 'Actual End Use Breakdown - Percentages'
      break
    default:
      label = _formatDotCamelCaseNotation(field)
      break
  }
  return label
}

export const formatChartReportName = name => {
  let label
  switch (name) {
    case 'Monthly Electricity Usage and Degree days':
      label = 'Monthly Electricity Usage and Degree Days'
      break
    case 'Monthly Natural Gas Usage and Degree days':
      label = 'Monthly Natural Gas Usage and Degree Days'
      break
    case 'Monthly Electricity Demand and Degree days':
      label = 'Monthly Electricity Demand and Degree Days'
      break
    case 'Monthly Fuel Oil 2 and Degree days':
      label = 'Monthly Fuel Oil 2 and Degree Days'
      break
    case 'Monthly Fuel Oil 4 and Degree days':
      label = 'Monthly Fuel Oil 4 and Degree Days'
      break
    case 'Monthly Fuel Oil 5 & 6 and Degree days':
      label = 'Monthly Fuel Oil 5 & 6 and Degree Days'
      break
    case 'Monthly Energy Usage - All Fuels':
      label = 'Monthly Energy Usage'
      break
    case 'Energy End Use Breakdown - All Fuels':
      label = 'CBECS - Energy End Use Breakdown'
      break
    case 'Electric End Use Breakdown':
      label = 'CBECS - Electric End Use Breakdown'
      break
    case 'Natural - Gas End Use Breakdown':
      label = 'CBECS - Natural Gas End Use Breakdown'
      break
    case 'Electricity Cost Breakdown':
      label = 'CBECS - Electric Cost Breakdown'
      break
    case 'Natural Gas Cost Breakdown':
      label = 'CBECS - Natural Gas Cost Breakdown'
      break
    case 'Energy End Use Breakdown - All Fuels Actual':
      label = 'ASHRAE Level II - Energy End Use Breakdown'
      break
    case 'Electric End Use Breakdown Actual':
      label = 'ASHRAE Level II - Electric End Use Breakdown'
      break
    case 'Natural Gas End Use Breakdown Actual':
      label = 'ASHRAE Level II - Natural Gas End Use Breakdown'
      break
    case 'Energy Saving by End Use':
      label = 'ASHRAE Level II - Energy Savings by End Use'
      break
    case 'EUI Impact':
      label = 'ASHRAE Level II - EUI Savings Impact'
      break
    case 'GHG Impact':
      label = 'ASHRAE Level II - GHG Savings Impact'
      break
    default:
      label = name
      break
  }
  return label
}
export const sortChart = views => {
  const order = [
    'Monthly Electricity Usage and Outside Air Temperature',
    'Monthly Electricity Demand and Outside Air Temperature',
    'Monthly Natural Gas Usage and Outside Air Temperature',
    'Monthly Electricity Usage and Cost',
    'Monthly Electricity and Electricity Demand',
    'Monthly Energy Usage - All Fuels',
    'Monthly Water Usage',
    'Utility Cost Breakdown',
    'Energy Use Breakdown',
    'Annual Energy Use Intensity ',
    'Annual Water Use Intensity',
    'Energy Use Intensity Benchmark',
    'CO2 Emission Breakdown',
    'Annual CO2 Emissions',
    'Monthly Electricity Usage and Degree days',
    'Monthly Natural Gas Usage and Degree days',
    'Monthly Electricity Demand and Degree days',
    'Monthly Fuel Oil 2 and Degree days',
    'Monthly Fuel Oil 4 and Degree days',
    'Monthly Fuel Oil 5 & 6 and Degree days',
    'Energy End Use Breakdown - All Fuels',
    'Electric End Use Breakdown',
    'Natural - Gas End Use Breakdown',
    'Electricity Cost Breakdown',
    'Natural Gas Cost Breakdown',
    'Energy End Use Breakdown - All Fuels Actual',
    'Electric End Use Breakdown Actual',
    'Natural Gas End Use Breakdown Actual',
    'Energy Saving by End Use',
    'GHG Impact',
    'EUI Impact'
  ]
  let charts = views.sort((a, b) => {
    let orderA = order.indexOf(a.reportName)
    let orderB = order.indexOf(b.reportName)
    if (orderA === orderB) return 0
    else if (orderA === -1) return 1
    else if (orderB === -1) return -1
    else return orderA < orderB ? -1 : 1
  })
  return charts
}

export const groupByChart = (charts, isTwoColumn) => {
  let group = {}
  let availableLayout1Name = [
    'Monthly Electricity Usage and Outside Air Temperature',
    'Monthly Electricity Demand and Outside Air Temperature',
    'Monthly Natural Gas Usage and Outside Air Temperature',
    'Monthly Electricity Usage and Cost',
    'Monthly Electricity and Electricity Demand',
    'Monthly Energy Usage',
    'Monthly Water Usage',
    'Annual Energy Use Intensity',
    'Annual Water Use Intensity',
    'Energy Use Intensity Benchmark',
    'Annual CO2 Emissions',
    'Monthly Electricity Usage and Degree Days',
    'Monthly Natural Gas Usage and Degree Days',
    'Monthly Electricity Demand and Degree Days',
    'ASHRAE Level II - Energy Savings by End Use',
    'ASHRAE Level II - GHG Savings Impact',
    'ASHRAE Level II - EUI Savings Impact'
  ]
  let availableLayout2Name = [
    'ASHRAE Level II - Electric End Use Breakdown',
    'ASHRAE Level II - Energy End Use Breakdown',
    'ASHRAE Level II - Natural Gas End Use Breakdown',
    'CBECS - Electric End Use Breakdown',
    'CBECS - Electric Cost Breakdown',
    'CBECS - Energy End Use Breakdown',
    'CBECS - Natural Gas End Use Breakdown',
    'CBECS - Natural Gas Cost Breakdown',
    'CO2 Emission Breakdown',
    'Energy Use Breakdown',
    'Utility Cost Breakdown'
  ]
  const groupMap = {
    'Monthly Electricity Usage and Outside Air Temperature':
      'Energy Billing Data',
    'Monthly Electricity Demand and Outside Air Temperature':
      'Energy Billing Data',
    'Monthly Natural Gas Usage and Outside Air Temperature':
      'Energy Billing Data',
    'Monthly Electricity Usage and Cost': 'Energy Billing Data',
    'Monthly Electricity and Electricity Demand': 'Energy Billing Data',
    'Monthly Energy Usage - All Fuels': 'Energy Billing Data',
    'Monthly Water Usage': 'Energy Billing Data',
    'Utility Cost Breakdown': 'Energy Billing Data',
    'Energy Use Breakdown': 'Energy Billing Data',
    'Annual Energy Use Intensity ': 'EUI & WUI',
    'Annual Water Use Intensity': 'EUI & WUI',
    'Energy Use Intensity Benchmark': 'EUI & WUI',
    'CO2 Emission Breakdown': 'GHG Emissions',
    'Annual CO2 Emissions': 'GHG Emissions',
    'Monthly Electricity Usage and Degree days': 'Energy Usage & Degree Days',
    'Monthly Natural Gas Usage and Degree days': 'Energy Usage & Degree Days',
    'Monthly Electricity Demand and Degree days': 'Energy Usage & Degree Days',
    'Monthly Fuel Oil 2 and Degree days': 'Energy Usage & Degree Days',
    'Monthly Fuel Oil 4 and Degree days': 'Energy Usage & Degree Days',
    'Monthly Fuel Oil 5 & 6 and Degree days': 'Energy Usage & Degree Days',
    'Energy End Use Breakdown - All Fuels': 'CBECS Benchmarking',
    'Electric End Use Breakdown': 'CBECS Benchmarking',
    'Natural - Gas End Use Breakdown': 'CBECS Benchmarking',
    'Electricity Cost Breakdown': 'CBECS Benchmarking',
    'Natural Gas Cost Breakdown': 'CBECS Benchmarking',
    'Energy End Use Breakdown - All Fuels Actual': 'ASHRAE Level II Reports',
    'Electric End Use Breakdown Actual': 'ASHRAE Level II Reports',
    'Natural Gas End Use Breakdown Actual': 'ASHRAE Level II Reports',
    'Energy Saving by End Use': 'ASHRAE Level II Reports',
    'GHG Impact': 'ASHRAE Level II Reports',
    'EUI Impact': 'ASHRAE Level II Reports'
  }
  group = charts.reduce((r, a) => {
    if (isTwoColumn) {
      let label = formatChartReportName(a.reportName)
      if (!availableLayout2Name.includes(label)) return r
    } else {
      let label = formatChartReportName(a.reportName)
      if (!availableLayout1Name.includes(label)) return r
    }
    let key = groupMap[a.reportName]
    if (!key) key = 'Other'
    r[key] = [...(r[key] || []), a]
    return r
  }, {})
  return group
}
export const getCookie = name => {
  let matches = document.cookie.match(
    new RegExp(
      '(?:^|; )' +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
        '=([^;]*)'
    )
  )
  return matches ? decodeURIComponent(matches[1]) : undefined
}

export const setCookie = (name, value) => {
  let options = {
    path: '/'
  }

  let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value)

  for (let optionKey in options) {
    updatedCookie += '; ' + optionKey
    let optionValue = options[optionKey]
    if (optionValue !== true) {
      updatedCookie += '=' + optionValue
    }
  }
  document.cookie = updatedCookie
}

export const checkCookie = name => {
  let cookie = getCookie(name)
  if (!cookie) {
    setCookie('downloading', 'finished')
    document.cookie = 'downloading=finished; path=/'
    cookie = getCookie('downloading')
    console.log('updated cookie', cookie)
    return true
  }
  return cookie !== 'started'
}

export const detectBrowser = () => {
  var navUserAgent = navigator.userAgent
  var browserName = navigator.appName
  var browserVersion = '' + parseFloat(navigator.appVersion)
  var majorVersion = parseInt(navigator.appVersion, 10)
  var tempNameOffset, tempVersionOffset, tempVersion

  if ((tempVersionOffset = navUserAgent.indexOf('Opera')) != -1) {
    browserName = 'Opera'
    browserVersion = navUserAgent.substring(tempVersionOffset + 6)
    if ((tempVersionOffset = navUserAgent.indexOf('Version')) != -1)
      browserVersion = navUserAgent.substring(tempVersionOffset + 8)
  } else if ((tempVersionOffset = navUserAgent.indexOf('MSIE')) != -1) {
    browserName = 'Microsoft Internet Explorer'
    browserVersion = navUserAgent.substring(tempVersionOffset + 5)
  } else if ((tempVersionOffset = navUserAgent.indexOf('Chrome')) != -1) {
    browserName = 'Chrome'
    browserVersion = navUserAgent.substring(tempVersionOffset + 7)
  } else if ((tempVersionOffset = navUserAgent.indexOf('Safari')) != -1) {
    browserName = 'Safari'
    browserVersion = navUserAgent.substring(tempVersionOffset + 7)
    if ((tempVersionOffset = navUserAgent.indexOf('Version')) != -1)
      browserVersion = navUserAgent.substring(tempVersionOffset + 8)
  } else if ((tempVersionOffset = navUserAgent.indexOf('Firefox')) != -1) {
    browserName = 'Firefox'
    browserVersion = navUserAgent.substring(tempVersionOffset + 8)
  } else if (
    (tempNameOffset = navUserAgent.lastIndexOf(' ') + 1) <
    (tempVersionOffset = navUserAgent.lastIndexOf('/'))
  ) {
    browserName = navUserAgent.substring(tempNameOffset, tempVersionOffset)
    browserVersion = navUserAgent.substring(tempVersionOffset + 1)
    if (browserName.toLowerCase() == browserName.toUpperCase()) {
      browserName = navigator.appName
    }
  }

  // trim version
  if ((tempVersion = browserVersion.indexOf(';')) != -1)
    browserVersion = browserVersion.substring(0, tempVersion)
  if ((tempVersion = browserVersion.indexOf(' ')) != -1)
    browserVersion = browserVersion.substring(0, tempVersion)
  return { browserName, browserVersion }
}

export const getStates = country => {
  let stateList = []
  if (country === '') {
    Object.keys(states).map(function(key) {
      stateList = [...stateList, ...states[key]]
    })
  } else {
    stateList = states[country]
  }
  stateList.sort()
  return stateList
}

export const findBuildingUseName = buildingUse => {
  if (buildingUse) {
    let typeObject = buildingTypes.find(type => type.value === buildingUse)
    return typeObject ? typeObject.name : '-'
  } else {
    return '-'
  }
}

const convertFieldName = (fieldName = '') => {
  return fieldName.includes('.') ? fieldName.split('.')[1] : fieldName
}

// format project fields
export const formatProjectFields = fieldName => {
  let label

  let field = convertFieldName(fieldName)

  switch (field) {
    case 'eul':
      label = 'Effective Useful Life'
      break
    case 'Measure Cost':
      label = 'Measure Cost'
      break
    case 'annual_savings':
      label = 'Annual Cost Savings'
      break
    case 'gas_savings':
      label = 'Natural Gas Savings'
      break
    case 'roi':
      label = 'ROI'
      break
    case 'npv':
      label = 'NPV'
      break
    case 'sir':
      label = 'SIR'
      break
    case 'ghg':
      label = 'GHG Savings'
      break
    case 'ghg-cost':
      label = 'GHG Cost'
      break
    case 'total_financing_funding':
      label = 'Total Financing/Funding'
      break
    case 'demand':
      label = 'Demand Savings'
      break
    case 'total_cost':
      label = 'Total Cost'
      break
    case 'net_project_cost':
      label = 'Net Measure Cost'
      break
    case 'total_hard_cost':
      label = 'Total Hard Costs'
      break
    case 'Total Soft Costs':
      label = 'Total Hard Costs'
      break
    case 'material_unit_cost':
      label = 'Materials Unit Cost'
      break
    case 'material_quantity':
      label = 'Materials Quantity'
      break
    case 'material_cost':
      label = 'Total Materials Cost'
      break
    case 'installation_factors':
      label = 'Site-Specific Installation Factors'
      break
    case 'other_hard_cost':
      label = 'Other Hard Costs'
      break
    case 'permits':
      label = 'Permits & Inspections'
      break
    case 'other_soft_cost':
      label = 'Other Soft Costs'
      break
    case 'total_soft_cost':
      label = 'Total Soft Costs'
      break
    case 'finance_cost_share':
      label = 'Cost Share'
      break
    case 'finance_cost_share_rate':
      label = 'Cost Share Rate'
      break
    case 'finance_finance':
      label = 'Financing'
      break
    case 'finance_finance_rate':
      label = 'Financing Rate'
      break
    case 'fund_cost_share':
      label = 'Cost Share'
      break
    case 'fund_cost_share_rate':
      label = 'Cost Share Rate'
      break
    case 'fund_finance':
      label = 'Financing'
      break
    case 'fund_finance_rate':
      label = 'Funding Rate'
      break
    default:
      label = formatUnderscoreNotation(field)
      break
  }

  return label
}

export const checkLicense = user => {
  const license = (user && user.license) || ''
  return license === 'ACTIVE'
}

export const checkInternalUser = user => {
  const simuwattRole = user?.simuwattRole ?? "Don't have role"
  return simuwattRole === ''
}

export const checkInternalOrg = organization => {
  const options = organization?.options || {}
  const simuwattOrg = options.simuwattOrg ?? true
  return !simuwattOrg
}

export const isDisabledUser = user => {
  const license = user && user.license
  return license === 'DEACTIVATED'
}

export const findGroupUniqueName = (allGroups = []) => {
  const names = allGroups.map(group => group.name).filter(name => !!name)
  const defaultNames = names.filter(names => names.startsWith('Group'))
  const numbers = defaultNames
    .map(name => name.substring(6))
    .filter(item => !!item)
    .map(item => +item)
  let count = 1
  if (numbers.length) {
    count = Math.max(...numbers)
    count++
  }
  return `Group ${count}`
}

export const capitalizeFirstLetter = (string = '') => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export const truncateText = (text, length = 0) => {
  return text && text.length > length ? `${text.substr(0, length)}...` : text
}

export const checkIsResidentalEndUse = buildingUse =>
  [
    'mobile-home',
    'single-family-detached',
    'single-family-attached',
    'apartment-small',
    'apartment-medium'
  ].includes(buildingUse)

export const formatFeatureFlagName = name => {
  switch (name) {
    case 'buildingOverview':
      return 'Overview'
    case 'buildingUtilities':
      return 'Utilities'
    case 'buildingOperations':
      return 'Operation'
    case 'buildingAssets':
      return 'Equipment & Locations'
    case 'buildingSystem':
      return 'Systems'
    case 'buildingConstruction':
      return 'Constructions'
    case 'buildingProjects':
      return 'Measures'
    case 'projectProposal':
      return 'Proposals'
    case 'projectProject':
      return 'Projects'
    case 'reportDocuments':
      return 'Document Reports'
    case 'reportSpreadsheets':
      return 'Spreadsheet Reports'
    case 'portfolio':
      return 'Portfolio'
    case 'team':
      return 'Teams'
    case 'nycExport':
      return 'buildee NYC'
    case 'docuSign':
      return 'DocuSign'
  }
}

export const handleStringSort = (itemA, itemB, key) => {
  const valueA = itemA[key] || ''
  const valueB = itemB[key] || ''
  return valueA.toLowerCase() < valueB.toLowerCase()
    ? -1
    : valueA.toLowerCase() > valueB.toLowerCase()
    ? 1
    : 0
}
