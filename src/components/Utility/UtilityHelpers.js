export const getUtilityUnits = type => {
  let utilUnits = []

  if (type === 'electric') {
    utilUnits = [
      { name: 'gj', displayName: 'GJ' },
      { name: 'kbtu', displayName: 'kBtu (thousand Btu)' },
      { name: 'kwh', displayName: 'kWh (thousand Watt-hours)' },
      { name: 'mbtu', displayName: 'MBtu/MMBtu (million Btu)' },
      { name: 'mwh', displayName: 'MWh (million Watt-hours)' }
    ]
  } else if (type === 'natural-gas') {
    utilUnits = [
      { name: 'ccf', displayName: 'ccf (hundred cubic feet)' },
      { name: 'cf', displayName: 'cf (cubic feet)' },
      { name: 'cubic-meters', displayName: 'Cubic meters' },
      { name: 'gj', displayName: 'GJ' },
      { name: 'kbtu', displayName: 'kBtu (thousand Btu)' },
      { name: 'kcf', displayName: 'kcf (thousand cubic feet)' },
      { name: 'mbtu', displayName: 'MBtu/MMBtu (million Btu)' },
      { name: 'mcf', displayName: 'MCF' },
      { name: 'therms', displayName: 'therms' }
    ]
  } else if (type === 'water') {
    utilUnits = [{ name: 'kgal', displayName: 'kGal' }]
  } else if (type === 'steam') {
    utilUnits = [
      { name: 'gj', displayName: 'GJ' },
      { name: 'kbtu', displayName: 'kBtu (thousand Btu)' },
      { name: 'kilogram', displayName: 'Kilogram' },
      { name: 'klbs', displayName: 'kLbs. (thousand pounds)' },
      { name: 'mbtu', displayName: 'MBtu/MMBtu (million Btu)' },
      { name: 'mlbs', displayName: 'MLbs. (million pounds)' },
      { name: 'pounds', displayName: 'Pounds' },
      { name: 'therms', displayName: 'therms' }
    ]
  } else if (
    type === 'diesel' ||
    type === 'fuel-oil-2' ||
    type === 'fuel-oil-4' ||
    type === 'fuel-oil-5-6'
  ) {
    utilUnits = [
      { name: 'gallons-uk', displayName: 'Gallons (UK)' },
      { name: 'gallons', displayName: 'Gallons' },
      { name: 'gj', displayName: 'GJ' },
      { name: 'kbtu', displayName: 'kBtu (thousand Btu)' },
      { name: 'liters', displayName: 'Liters' },
      { name: 'mbtu', displayName: 'MBtu/MMBtu (million Btu)' }
    ]
  } else if (type === 'other') {
    utilUnits = [{ name: 'btu', displayName: 'Btu' }]
  }

  return utilUnits
}

export const getUtilityHeadingData = type => {
  if (type === 'electric' || type === 'natural-gas' || type === 'water') {
    return {
      heading: 'Add Meter Data',
      subHeading: 'Add a meter or new billing data for an existing meter'
    }
  }
  return {
    heading: 'Add Deliveries Data',
    subHeading: 'Add delivery data'
  }
}

export const validateConsumptionUtilities = utilityArray => {
  return new Promise((resolve, reject) => {
    let promises = []

    var utilitiesArrayPromise = utilityArray.map((utilityObj, index) => {
      var validateUtilities = new Promise((resolve, reject) => {
        // if the object doesn't have all the fields
        if (
          !(
            utilityObj.hasOwnProperty('endDate') &&
            utilityObj.endDate !== '' &&
            utilityObj.endDate !== null &&
            utilityObj.hasOwnProperty('startDate') &&
            utilityObj.startDate !== '' &&
            utilityObj.startDate !== null &&
            utilityObj.hasOwnProperty('totalUsage') &&
            utilityObj.totalUsage !== '' &&
            utilityObj.totalUsage !== null &&
            utilityObj.hasOwnProperty('totalCost') &&
            utilityObj.totalCost !== '' &&
            utilityObj.totalCost !== null
          )
        ) {
          reject(
            `Please completely fill out all months. Check month #${index + 1}`
          )
        }

        // if the object has an end and start date
        if (
          utilityObj.hasOwnProperty('endDate') &&
          utilityObj.endDate !== '' &&
          utilityObj.hasOwnProperty('startDate') &&
          utilityObj.startDate !== ''
        ) {
          // if the end date is after start date
          const startDate = new Date(utilityObj.startDate).getTime()
          const endDate = new Date(utilityObj.endDate).getTime()

          if (startDate > endDate) {
            reject(
              `Please make sure start date is before end date. Check month #${index +
                1}`
            )
          }
        }

        resolve()
      })
      promises.push(validateUtilities)
    })

    Promise.all(utilitiesArrayPromise).then(() => {
      return Promise.all(promises)
        .then(() => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  })
}

export const validateDeliveryUtilities = utilityArray => {
  return new Promise((resolve, reject) => {
    let promises = []

    var utilitiesArrayPromise = utilityArray.map((utilityObj, index) => {
      var validateUtilities = new Promise((resolve, reject) => {
        // if the object doesn't have all the fields
        if (
          !(
            utilityObj.hasOwnProperty('deliveryDate') &&
            utilityObj.deliveryDate !== '' &&
            utilityObj.deliveryDate !== null &&
            utilityObj.hasOwnProperty('quantity') &&
            utilityObj.quantity !== '' &&
            utilityObj.quantity !== null &&
            utilityObj.hasOwnProperty('totalCost') &&
            utilityObj.totalCost !== '' &&
            utilityObj.totalCost !== null
          )
        ) {
          reject(
            `Please completely fill out all months. Check month #${index + 1}`
          )
        }
        resolve()
      })
      promises.push(validateUtilities)
    })

    Promise.all(utilitiesArrayPromise).then(() => {
      return Promise.all(promises)
        .then(() => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  })
}

export const yearDifference = (startDate, endDate) => {
  var diff = (startDate.getTime() - endDate.getTime()) / 1000
  diff /= 60 * 60 * 24

  return Math.abs(diff / 365.25)
}

export const isoDateNow = () => new Date().toISOString()

export const isoDateOneMonthFromNow = () =>
  new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()

export const isoDateOneYearFromNow = () => {
  const fullYearAgo = new Date().getFullYear() - 1
  const fullYearAgoTimestamp = new Date().setFullYear(fullYearAgo)
  return new Date(fullYearAgoTimestamp).toISOString()
}

export const roundSignificantNumbers = (num, sigFigs) => {
  // if number is between 1 and -1, round to the significant numbers given in the function
  return num > -1 && num < 1
    ? parseFloat(num).toPrecision(sigFigs)
    : Math.round(parseFloat(num) * 100) / 100
}

export const getYearList = (startYear, endYear) => {
  let years = []
  for (let i = startYear; i <= endYear; i++) {
    years.push(String(i))
  }

  return years
}

export const getCsvTimeframes = meterData => {
  const firstMeter = meterData[0]
  const lastMeter = meterData[meterData.length - 1]

  let timeframes = {}
  if (new Date(firstMeter.startDate) < new Date(lastMeter.startDate)) {
    timeframes.startDate = new Date(
      firstMeter.startDate
    ).toLocaleDateString('en-US', { timeZone: 'UTC' })
    timeframes.endDate = new Date(lastMeter.endDate).toLocaleDateString(
      'en-US',
      { timeZone: 'UTC' }
    )
  } else {
    timeframes.startDate = new Date(
      lastMeter.startDate
    ).toLocaleDateString('en-US', { timeZone: 'UTC' })
    timeframes.endDate = new Date(
      firstMeter.endDate
    ).toLocaleDateString('en-US', { timeZone: 'UTC' })
  }

  return timeframes
}

export const getCsvTimeframesOfDelivery = deliveryData => {
  const firstMeter = deliveryData[0]
  const lastMeter = deliveryData[deliveryData.length - 1]

  let timeframes = {}
  if (new Date(firstMeter.deliveryDate) < new Date(lastMeter.deliveryDate)) {
    timeframes.startDate = new Date(
      firstMeter.deliveryDate
    ).toLocaleDateString('en-US', { timeZone: 'UTC' })
    timeframes.endDate = new Date(
      lastMeter.deliveryDate
    ).toLocaleDateString('en-US', { timeZone: 'UTC' })
  } else {
    timeframes.startDate = new Date(
      lastMeter.deliveryDate
    ).toLocaleDateString('en-US', { timeZone: 'UTC' })
    timeframes.endDate = new Date(
      firstMeter.deliveryDate
    ).toLocaleDateString('en-US', { timeZone: 'UTC' })
  }

  return timeframes
}
