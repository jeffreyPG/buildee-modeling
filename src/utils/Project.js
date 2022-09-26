import {
  qualifiedDefaultValue,
  qualifiedOptions,
  xcelMeasuresList
} from './xcelMeasures'
const math = require('mathjs')

export const filterBuildingEquipment = (buildingEquipmentList, options) => {
  const { category, application, technology } = options
  let buildingEquipment = buildingEquipmentList.filter(item => {
    let categoryValue =
      (item.libraryEquipment && item.libraryEquipment.category) || ''
    let applicationValue =
      (item.libraryEquipment && item.libraryEquipment.application) || ''
    let technologyValue =
      (item.libraryEquipment && item.libraryEquipment.technology) || ''
    if (category && category.length && category.indexOf(categoryValue) === -1)
      return false
    if (
      application &&
      application.length &&
      application.indexOf(applicationValue) === -1
    )
      return false
    if (
      technology &&
      technology.length &&
      technology.indexOf(technologyValue) === -1
    )
      return false
    return true
  })
  return buildingEquipment
}

export const filterBuildingEquipmentByType = (buildingEquipmentList, type) => {
  return buildingEquipmentList.filter(item => {
    let typeValue = (item.libraryEquipment && item.libraryEquipment.type) || ''
    return typeValue === type
  })
}

export const findBuildingEquipmentById = (
  buildingEquipmentList,
  equipmentId
) => {
  return buildingEquipmentList.find(item => item._id === equipmentId)
}

export const getQualifiedFlag = (fieldName, rebate) => {
  if (rebate == '') return false
  return qualifiedOptions[fieldName].indexOf(rebate) != -1
}

export const getValueFromQualifiedOption = (
  rebate,
  dlc_qualified,
  energy_star_qualified
) => {
  let option = [
    {
      key: 'dlc_qualified',
      value: dlc_qualified
    },
    {
      key: 'energy_star_qualified',
      value: energy_star_qualified
    }
  ]
  let qualifiedOption = option.filter(item =>
    getQualifiedFlag(item.key, rebate)
  )
  let incentiveValue = 0,
    costValue = 0,
    unit = ''
  if (qualifiedOption.length) {
    qualifiedOption = qualifiedOption[0]
    let data = qualifiedDefaultValue.filter(item => item.name === rebate)
    if (data.length) {
      data = data[0]
      incentiveValue = data.incentiveValue[qualifiedOption.value] || 0
      costValue = data.cost || 0
      unit = data.unit
    }
  }
  return {
    incentiveValue,
    costValue,
    incentiveUnit: unit,
    costUnit: unit
  }
}

export const getValueForXcelMeasure = (measureName, options) => {
  let incentiveValue = 0,
    costValue = 0,
    incentiveUnit = '',
    costUnit = ''
  let data = [],
    dataSource = null
  dataSource = xcelMeasuresList[measureName]
  if (dataSource) {
    data = dataSource.filter(measure => measure.name === options.rebate)
  }
  if (measureName === 'xcelWaterOrAirCooledChillers') {
    if (data.length) {
      costValue = data[0].cost
      costUnit = data[0].costUnit
      incentiveValue = data[0].incentive.map(item => item.value)
      incentiveUnit = data[0].incentive.map(item => item.unit)
      return {
        costValue,
        costUnit,
        incentive: data[0].incentive,
        incentiveValue,
        incentiveUnit
      }
    } else {
      costValue = 0
      costUnit = ''
      incentiveValue = []
      incentiveUnit = []
      return {
        costValue,
        costUnit,
        incentive: [],
        incentiveValue,
        incentiveUnit
      }
    }
  } else {
    if (data.length) {
      if (measureName === 'xcelMotorUpgrade') {
        const { plan } = options
        if (plan === 'New') incentiveValue = data[0].incentiveNew
        else incentiveValue = data[0].incentiveNew
      } else {
        incentiveValue = data[0].incentive
      }
      costValue = data[0].cost

      if (data[0].incentiveUnit && data[0].costUnit) {
        costUnit = data[0].costUnit
        incentiveUnit = data[0].incentiveUnit
      } else if (data[0].unit) {
        incentiveUnit = data[0].unit
        costUnit = data[0].unit
      }
    }
  }
  return { incentiveValue, costValue, incentiveUnit, costUnit }
}

export const getRebateTypeAndLabelForXcelMeasure = (measureName, value) => {
  let rebateType = ''
  let label = ''
  if (measureName === 'xcelDishwashers') {
    rebateType = value ? `Commercial Refrigeration Efficiency - ${value}` : ''
    label = rebateType
  } else if (measureName === 'xcelMiniSplitHP') {
    if (value >= 16 && value <= 21) {
      rebateType =
        'Cooling Efficiency - Mini-Split Heat Pump (16-21 SEER, 9-12 HSPF)'
    } else if (value > 21 && value <= 24) {
      rebateType =
        'Cooling Efficiency - Mini-Split Heat Pump (21-24 SEER, 9-12 HSPF)'
    } else if (value > 24) {
      rebateType =
        'Cooling Efficiency - Mini-Split Heat Pump (24-26 SEER, 9-12 HSPF)'
    }
    label = rebateType
  } else if (measureName === 'xcelOzoneLaundry') {
    if (value >= 0 && value <= 100) {
      rebateType =
        'Commercial Refrigeration Efficiency - Ozone Laundry - < 100 Lbs Washer'
    } else if (value > 100 && value <= 500) {
      rebateType =
        'Commercial Refrigeration Efficiency - Ozone Laundry - >100 Lbs < 500 Lbs Washer'
    } else if (value > 500) {
      rebateType =
        'Commercial Refrigeration Efficiency - Ozone Laundry - >500 Lbs Washer'
    }
    label = rebateType
  } else if (measureName === 'xcelVFDOnMotor') {
    let motorValue = (value && value.split('-')) || []
    if (motorValue.length) {
      motorValue = motorValue[0]
      if (motorValue > 200) {
        rebateType =
          "Rebate and Cost Information Unavailable. Motor size is ineligible for 'Motor and Drive Efficiency' Program. Program for motors 1HP - 200 HP"
        label = rebateType
      } else {
        rebateType = `Motor and Drive Efficiency - ${motorValue}HP - HVAC and Non Well Water`
        label = `${rebateType} Non HVAC`
      }
    }
  } else if (measureName === 'xcelVFDOnMotorWaterWellPump') {
    let motorValue = (value && value.split('-')) || []
    if (motorValue.length) {
      motorValue = motorValue[0]
      if (motorValue > 200 || motorValue < 10) {
        rebateType =
          "Rebate and Cost Information Unavailable. Motor size is ineligible for 'Motor and Drive Efficiency' Program. Program for motors 1HP - 200 HP"
      } else {
        rebateType = `Motor and Drive Efficiency - ${motorValue}HP - Well Water`
      }
      label = rebateType
    }
  } else if (measureName === 'xcelRefrigerationNoHeatCaseDoors') {
    rebateType = `Commercial Refrigeration Efficiency - No Heat Door - ${value}`
    label = rebateType
  } else if (measureName === 'xcelRefrigerationCaseDoors') {
    rebateType = `Commercial Refrigeration Efficiency - Case Door - ${value}`
    label = rebateType
  } else if (measureName === 'xcelWaterHeaterNew') {
    const { heater_type, inputCapacity, gallons } = value
    const headerTypeLabel =
      heater_type !== 'condensing' ? 'Non-Condensing' : 'Condensing'
    if (gallons > 0) {
      if (inputCapacity >= 75000 && inputCapacity <= 199999) {
        rebateType =
          'Heating Efficiency - Commercial Water Heater 75,000 to 199,999 BTUh'
      } else if (inputCapacity >= 200000 && inputCapacity <= 299999) {
        rebateType =
          'Heating Efficiency - Commercial Water Heater 200,000 to 299,000 BTUh'
      } else if (inputCapacity >= 300000) {
        rebateType =
          'Heating Efficiency - Commercial Water Heater >=300,000 BTUh'
      }
    } else {
      if (inputCapacity >= 75000 && inputCapacity <= 199999) {
        rebateType =
          'Heating Efficiency - Tankless Commercial Water Heater 75,000 to 199,999 BTUh'
      } else if (inputCapacity >= 200000) {
        rebateType =
          'Heating Efficiency - Tankless Commercial Water Heater >= 200,000 BTUh'
      }
    }
    if (rebateType === '') {
      label = ''
    } else {
      label = rebateType
    }
  } else if (measureName === 'xcelCompressedAirMistEliminatorsSavings') {
    if (value && value.split(' ').length === 5) {
      const minCfm = value.split(' ')[0]
      const maxCfm = value.split(' ')[3]
      rebateType = `Compressed Air - Mist Eliminator Filter - >= ${minCfm} CFM < ${maxCfm} CFM`
    }
    label = rebateType
  } else if (measureName === 'xcelBoilerNewHighEfficiency') {
    const { boilerType, inputCapacity } = value
    const boilerTypeLabel =
      boilerType !== 'condensing' ? 'Non-Condensing' : 'Condensing'
    let lableForHeaterType = `Heating Efficiency - ${boilerTypeLabel} - `
    let lableForCapacity = ''
    if (inputCapacity >= 0 && inputCapacity <= 0.175) {
      lableForCapacity = '< 0.175 MMBTUH'
    } else if (inputCapacity > 0.175 && inputCapacity <= 0.5) {
      lableForCapacity = '> 0.176 MMBTUH < 0.5 MMBTUH'
    } else if (inputCapacity > 0.5 && inputCapacity <= 1.0) {
      lableForCapacity = '> 0.51 MMBTUH < 1.0 MMBTUH'
    } else if (inputCapacity > 1.0 && inputCapacity <= 2.0) {
      lableForCapacity = '> 1.01 MMBTUH < 2 MMBTUH'
    } else if (inputCapacity > 2.0 && inputCapacity <= 4.0) {
      lableForCapacity = '> 2.01 MMBTUH < 4 MMBTUH'
    } else if (inputCapacity > 4.0 && inputCapacity <= 6.0) {
      lableForCapacity = '> 4.01 MMBTUH < 6 MMBTUH'
    } else if (inputCapacity > 6.0 && inputCapacity <= 8.0) {
      lableForCapacity = '> 6.01 MMBTUH < 8 MMBTUH'
    } else {
      return {
        rebateType: '',
        label: ''
      }
    }
    rebateType = lableForHeaterType + lableForCapacity
    label = rebateType
  } else if (measureName === 'xcelMotorUpgrade') {
    rebateType = `Motor and Drive Efficiency - ${value}`
    label = rebateType
  } else if (measureName === 'xcelRefrigerationECMotors') {
    rebateType = `Commercial Refrigeration Efficiency - ${value}`
    label = rebateType
  } else if (measureName === 'xcelCompressedAirCyclingDryersSavings') {
    if (value && value.split(' ').length === 5) {
      const minCfm = value.split(' ')[0]
      const maxCfm = value.split(' ')[3]
      rebateType = `Compressed Air - Cycling Dryer - >= ${minCfm} CFM < ${maxCfm} CFM`
    }
    label = rebateType
  } else if (measureName === 'xcelCompressedAirDewPointControlsSavings') {
    if (value && value.split(' ').length === 5) {
      const minCfm = value.split(' ')[0]
      const maxCfm = value.split(' ')[3]
      rebateType = `Compressed Air - Dew Point Controller - >= ${minCfm} CFM < ${maxCfm} CFM`
    }
    label = rebateType
  } else if (
    measureName === 'xcelBoilerOutdoorAirReset' ||
    measureName === 'xcelBoilerStackDamper' ||
    measureName === 'xcelBoilerModulatingBurnerControl' ||
    measureName === 'xcelBoilerO2TrimControl'
  ) {
    let firstLabel = ''
    if (measureName === 'xcelBoilerOutdoorAirReset')
      firstLabel =
        'Heating Efficiency - Outdoor Air Reset on Non Condensing Boiler'
    if (measureName === 'xcelBoilerStackDamper')
      firstLabel = 'Heating Efficiency - Stack Dampers on Non Condensing Boiler'
    if (measureName === 'xcelBoilerModulatingBurnerControl')
      firstLabel =
        'Heating Efficiency - Modulating Burners on Non Condensing Boiler'
    if (measureName === 'xcelBoilerO2TrimControl')
      firstLabel =
        'Heating Efficiency - O2 Trim Control on Non Condensing Boiler'
    let secondLabel = ''
    if (value >= 0 && value <= 300) {
      secondLabel = '<= 300 MBTUH'
    } else if (value > 300 && value <= 1000) {
      secondLabel = '301 - 1 MMBTUH'
    } else if (value >= 1000 && value < 10000) {
      secondLabel = '1 - 10 MMBTUH'
    } else if (value >= 10000) {
      secondLabel = '>= 10 MMBTUH'
    }
    rebateType = `${firstLabel} ${secondLabel}`
    label = rebateType
  } else if (measureName === 'xcelWaterOrAirCooledChillers') {
    const { chiller_type, size } = value
    if (chiller_type === 'scroll-or-screw') {
      if (size < 75) {
        label = 'CO - SSCH < 75 tons'
      } else if (size < 150) {
        label = 'CO - SSCH - 75 - 149 tons'
      } else if (size < 300) {
        label = 'CO - SSCH - 150 - 299 tons'
      } else if (size < 600) {
        label = 'CO - SSCH 300 tons - 599 tons'
      } else if (size >= 600) {
        label = 'CO - SSCH >= 600 tons'
      }
      if (!label) {
        label = ''
      } else {
        label = 'Screw/Scroll Chillers - ' + label
      }
    } else {
      if (size < 150) {
        label = 'CO - CFCH - 0 - 149 tons'
      } else if (size < 300) {
        label = 'CO - CFCH - 150 - 299 tons'
      } else if (size < 400) {
        label = 'CO - CFCH - 300 - 399 tons'
      } else if (size < 600) {
        label = 'CO - CFCH - 400 - 599 tons'
      } else if (size >= 600) {
        label = 'CO - CFCH - 600 tons and above'
      }
      if (!label) {
        label = ''
      } else {
        label = 'Centrifugal Chillers - ' + label
      }
    }
    rebateType = label
  } else if (measureName === 'xcelPipeInsulation') {
    let { pipeDiameter, insulationThickness, t_fluid } = value
    if (t_fluid > 200 && t_fluid <= 250) {
      rebateType = 'Pipe Insulation 201-250 Degree'
    } else if (t_fluid > 250 && t_fluid <= 350) {
      rebateType = 'Pipe Insulation 251-350 Degree'
    } else rebateType = ''
    label = rebateType
  } else if (measureName === 'xcelHVACUnitReplacement') {
    const { equipment_type, size, eer_eff, seer_eff } = value
    if (equipment_type === 'PTAC') {
      if (size >= 0 && size <= 500) {
        if (eer_eff >= 0 && eer_eff < 11) {
          rebateType = 'No Rebate available based on unit EER'
        } else if (
          eer_eff >= 11 &&
          eer_eff < 11.5 &&
          seer_eff >= 0 &&
          seer_eff <= 50
        ) {
          rebateType =
            'Cooling Efficiency - PTAC (Replacements) - 11 EER - Tier 1'
        } else if (
          eer_eff >= 11.5 &&
          eer_eff < 12 &&
          seer_eff >= 0 &&
          seer_eff <= 50
        ) {
          rebateType =
            'Cooling Efficiency - PTAC (Replacements) - 11.5 EER - Tier 2'
        } else if (
          eer_eff > 12 &&
          eer_eff <= 50 &&
          seer_eff >= 0 &&
          seer_eff <= 50
        ) {
          rebateType =
            'Cooling Efficiency - PTAC (Replacements) - 12 EER - Tier 3'
        }
      }
    } else if (equipment_type === 'Condensing Units') {
      if (size >= 0 && size < 150) {
        if (eer_eff < 10.3) {
          rebateType = 'No Rebate available based on unit EER'
        } else if (eer_eff >= 10.3 && eer_eff <= 50) {
          if (seer_eff < 14.5) {
            rebateType = 'No Rebate available based on unit SEER'
          } else if (seer_eff >= 14.5 && size < 15) {
            rebateType =
              'Cooling Efficiency - Air-Cooled Chillers - < 150 tons - Tier 1'
          } else if (seer_eff >= 15 && seer_eff < 16) {
            rebateType =
              'Cooling Efficiency - Air-Cooled Chillers - < 150 tons - Tier 2'
          } else if (seer_eff >= 16 && seer_eff < 18) {
            rebateType =
              'Cooling Efficiency - Air-Cooled Chillers - < 150 tons - Tier 3'
          } else if (seer_eff >= 18 && seer_eff <= 50) {
            rebateType =
              'Cooling Efficiency - Air-Cooled Chillers - < 150 tons - Tier 4'
          }
        }
      } else if (size >= 150 && size <= 500) {
        if (eer_eff < 10.3) {
          rebateType = 'No Rebate available based on unit EER'
        } else if (eer_eff >= 10.3 && eer_eff <= 50) {
          if (seer_eff < 14.5) {
            rebateType = 'No Rebate available based on unit SEER'
          } else if (seer_eff >= 14.5 && seer_eff < 15) {
            rebateType =
              'Cooling Efficiency - Air-Cooled Chillers - >= 150 tons - Tier 1'
          } else if (seer_eff >= 15 && seer_eff < 16) {
            rebateType =
              'Cooling Efficiency - Air-Cooled Chillers - >= 150 tons - Tier 2'
          } else if (seer_eff >= 16 && seer_eff < 18) {
            rebateType =
              'Cooling Efficiency - Air-Cooled Chillers - >= 150 tons - Tier 3'
          } else if (seer_eff >= 18 && seer_eff <= 50) {
            rebateType =
              'Cooling Efficiency - Air-Cooled Chillers - >= 150 tons - Tier 4'
          }
        }
      }
    } else if (equipment_type === 'Split Systems') {
      if (size >= 0 && size < 5.5) {
        if (eer_eff < 12.2) {
          rebateType = 'No Rebate available based on unit EER'
        } else if (eer_eff >= 12.2 && eer_eff <= 50) {
          if (seer_eff < 15) {
            rebateType = 'No Rebate available based on unit SEER'
          } else if (seer_eff >= 15 && seer_eff < 16) {
            rebateType =
              'Cooling Efficiency - Split Systems less than 5.4 tons - Tier 1'
          } else if (seer_eff >= 16 && seer_eff < 17) {
            rebateType =
              'Cooling Efficiency - Split Systems less than 5.4 tons - Tier 2'
          } else if (seer_eff >= 17 && seer_eff < 18) {
            rebateType =
              'Cooling Efficiency - Split Systems less than 5.4 tons - Tier 3'
          } else if (seer_eff >= 18 && seer_eff <= 50) {
            rebateType =
              'Cooling Efficiency - Split Systems less than 5.4 tons - Tier 4'
          }
        }
      } else if (size >= 5.5 && size < 11.4) {
        if (eer_eff < 11.6) {
          rebateType = 'No Rebate available based on unit EER'
        } else if (eer_eff >= 11.6 && eer_eff <= 50) {
          if (seer_eff < 13) {
            rebateType = 'No Rebate available based on unit SEER'
          } else if (seer_eff >= 13 && seer_eff < 13.8) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 5.5-11.3 tons - Tier 1'
          } else if (seer_eff >= 13.8 && seer_eff < 14.6) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 5.5-11.3 tons - Tier 2'
          } else if (seer_eff >= 14.6 && seer_eff < 18) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 5.5-11.3 tons - Tier 3'
          } else if (seer_eff >= 18 && seer_eff <= 50) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 5.5-11.3 tons - Tier 4'
          }
        }
      } else if (size >= 11.4 && size < 20) {
        if (eer_eff < 11.6) {
          rebateType = 'No Rebate available based on unit EER'
        } else if (eer_eff >= 11.6 && eer_eff <= 50) {
          if (seer_eff < 12.6) {
            rebateType = 'No Rebate available based on unit SEER'
          } else if (seer_eff >= 12.6 && seer_eff < 13.4) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 11.4-19.9 tons - Tier 1'
          } else if (seer_eff >= 13.4 && seer_eff < 14) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 11.4-19.9 tons - Tier 2'
          } else if (seer_eff >= 14 && seer_eff < 17.5) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 11.4-19.9 tons - Tier 3'
          } else if (seer_eff >= 17.5 && seer_eff <= 50) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 11.4-19.9 tons - Tier 4'
          }
        }
      } else if (size >= 20 && size < 63.4) {
        if (eer_eff < 10.3) {
          rebateType = 'No Rebate available based on unit EER'
        } else if (eer_eff >= 10.3 && eer_eff <= 50) {
          if (seer_eff < 12) {
            rebateType = 'No Rebate available based on unit EER'
          } else if (seer_eff >= 12 && seer_eff < 12.6) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 20-63.3 tons - Tier 1'
          } else if (seer_eff >= 12.6 && seer_eff < 13.3) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 20-63.3 tons - Tier 2'
          } else if (seer_eff >= 13.3 && seer_eff < 15) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 20-63.3 tons - Tier 3'
          } else if (seer_eff >= 15 && seer_eff <= 50) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 20-63.3 tons - Tier 4'
          }
        }
      }
    } else if (equipment_type === 'Rooftop Units') {
      if (size >= 0 && size < 5.5) {
        if (eer_eff < 12.2) {
          rebateType = 'No Rebate available based on unit EER'
        } else if (eer_eff >= 12.2 && eer_eff <= 50) {
          if (seer_eff < 15) {
            rebateType = 'No Rebate available based on unit SEER'
          } else if (seer_eff >= 15 && seer_eff < 16) {
            rebateType =
              'Cooling Efficiency - Rooftop Units less than 5.4 tons - Tier 1'
          } else if (seer_eff >= 16 && seer_eff < 17) {
            rebateType =
              'Cooling Efficiency - Rooftop Units less than 5.4 tons - Tier 2'
          } else if (seer_eff >= 17 && seer_eff < 18) {
            rebateType =
              'Cooling Efficiency - Rooftop Units less than 5.4 tons - Tier 3'
          } else if (seer_eff >= 18 && seer_eff <= 50) {
            rebateType =
              'Cooling Efficiency - Rooftop Units less than 5.4 tons - Tier 4'
          }
        }
      } else if (size >= 5.5 && size < 11.4) {
        if (eer_eff < 11.6) {
          rebateType = 'No Rebate available based on unit EER'
        } else if (eer_eff >= 11.6 && eer_eff <= 50) {
          if (seer_eff < 13) {
            rebateType = 'No Rebate available based on unit SEER'
          } else if (seer_eff >= 13 && seer_eff < 13.8) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 5.5-11.3 tons - Tier 1'
          } else if (seer_eff >= 13.8 && seer_eff < 14.6) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 5.5-11.3 tons - Tier 2'
          } else if (seer_eff >= 14.6 && seer_eff < 18) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 5.5-11.3 tons - Tier 3'
          } else if (seer_eff >= 18 && seer_eff <= 50) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 5.5-11.3 tons - Tier 4'
          }
        }
      } else if (size >= 11.4 && size < 20) {
        if (eer_eff < 11.6) {
          rebateType = 'No Rebate available based on unit EER'
        } else if (eer_eff >= 11.6 && eer_eff <= 50) {
          if (seer_eff < 12.6) {
            rebateType = 'No Rebate available based on unit SEER'
          } else if (seer_eff >= 12.6 && seer_eff < 13.4) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 11.4-19.9 tons - Tier 1'
          } else if (seer_eff >= 13.4 && seer_eff < 14) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 11.4-19.9 tons - Tier 2'
          } else if (seer_eff >= 14 && seer_eff < 17.5) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 11.4-19.9 tons - Tier 3'
          } else if (seer_eff >= 17.5 && seer_eff <= 50) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 11.4-19.9 tons - Tier 4'
          }
        }
      } else if (size >= 20 && size < 63.4) {
        if (eer_eff < 10.3) {
          rebateType = 'No Rebate available based on unit EER'
        } else if (eer_eff >= 10.3 && eer_eff <= 50) {
          if (seer_eff < 12) {
            rebateType = 'No Rebate available based on unit SEER'
          } else if (seer_eff >= 12 && seer_eff < 12.6) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 20-63.3 tons - Tier 1'
          } else if (seer_eff >= 12.6 && seer_eff < 13.3) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 20-63.3 tons - Tier 2'
          } else if (seer_eff >= 13.3 && seer_eff < 15) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 20-63.3 tons - Tier 3'
          } else if (seer_eff >= 15 && seer_eff <= 50) {
            rebateType =
              'Cooling Efficiency - Rooftop Units & Split Systems 20-63.3 tons - Tier 4'
          }
        }
      } else if (size >= 63.4 && size <= 500) {
        if (eer_eff < 10) {
          rebateType = 'No Rebate available based on unit EER'
        } else if (eer_eff >= 10 && eer_eff <= 50) {
          if (seer_eff < 12) {
            rebateType = 'No Rebate available based on unit SEER'
          } else if (seer_eff >= 12 && seer_eff < 12.6) {
            rebateType =
              'Cooling Efficiency - Rooftop Units greater than 63.3 tons - Tier 1'
          } else if (seer_eff >= 12.6 && seer_eff < 13.3) {
            rebateType =
              'Cooling Efficiency - Rooftop Units greater than 63.3 tons - Tier 2'
          } else if (seer_eff >= 13.3 && seer_eff < 15) {
            rebateType =
              'Cooling Efficiency - Rooftop Units greater than 63.3 tons - Tier 3'
          } else if (seer_eff >= 15 && seer_eff <= 50) {
            rebateType =
              'Cooling Efficiency - Rooftop Units greater than 63.3 tons - Tier 4'
          }
        }
      }
    }
    label = rebateType
  }
  return { rebateType, label }
}

export const getDropDownOptionsForXcelMeasure = (
  measureName,
  field,
  formValues
) => {
  let options = field.options || []
  let rebateType = '',
    label = ''
  if (measureName === 'xcelOzoneLaundry') {
    options = [
      {
        value: '',
        label: 'Select Rebate'
      }
    ]
    ;({ rebateType, label } = getRebateTypeAndLabelForXcelMeasure(
      'xcelOzoneLaundry',
      formValues['washing_machine_capacity'] || 0
    ))
  } else if (measureName === 'xcelMiniSplitHP') {
    ;({ rebateType, label } = getRebateTypeAndLabelForXcelMeasure(
      'xcelMiniSplitHP',
      formValues['seer_eff'] || 0
    ))
    if (!rebateType) {
      options = [
        {
          label:
            'No incentive available as unit does not meet the minimum SEER requirements.',
          value: ''
        }
      ]
    }
  } else if (measureName === 'xcelDishwashers') {
    options = [
      {
        value: '',
        label: 'Select Rebate'
      }
    ]
    ;({ rebateType, label } = getRebateTypeAndLabelForXcelMeasure(
      'xcelDishwashers',
      formValues['dishwasher_type']
    ))
  } else if (
    measureName === 'xcelVFDOnMotor' ||
    measureName === 'xcelVFDOnMotorWaterWellPump' ||
    measureName === 'xcelMotorUpgrade'
  ) {
    options = [
      {
        value: '',
        label: 'Select Rebate'
      }
    ]
    ;({ rebateType, label } = getRebateTypeAndLabelForXcelMeasure(
      measureName,
      formValues['motor_tag']
    ))
  } else if (
    measureName === 'xcelRefrigerationNoHeatCaseDoors' ||
    measureName === 'xcelRefrigerationCaseDoors'
  ) {
    options = [
      {
        value: '',
        label: 'Select Rebate'
      }
    ]
    ;({ rebateType, label } = getRebateTypeAndLabelForXcelMeasure(
      measureName,
      formValues['caseType']
    ))
  } else if (measureName === 'xcelWaterHeaterNew') {
    options = [
      {
        value: '',
        label: 'Select Rebate'
      }
    ]
    ;({ rebateType, label } = getRebateTypeAndLabelForXcelMeasure(measureName, {
      heater_type: formValues['heater_type'],
      inputCapacity: formValues['inputCapacity'],
      gallons: formValues['gallons']
    }))
  } else if (
    measureName === 'xcelCompressedAirMistEliminatorsSavings' ||
    measureName === 'xcelCompressedAirCyclingDryersSavings' ||
    measureName === 'xcelCompressedAirDewPointControlsSavings'
  ) {
    options = [
      {
        value: '',
        label: 'Select Rebate'
      }
    ]
    ;({ rebateType, label } = getRebateTypeAndLabelForXcelMeasure(
      measureName,
      formValues['cfm']
    ))
  } else if (measureName === 'xcelBoilerNewHighEfficiency') {
    options = [
      {
        value: '',
        label: 'Select Rebate'
      }
    ]
    ;({ rebateType, label } = getRebateTypeAndLabelForXcelMeasure(measureName, {
      boilerType: formValues['boilerType'],
      inputCapacity: formValues['inputCapacity']
    }))
  } else if (measureName === 'xcelRefrigerationECMotors') {
    options = [
      {
        value: '',
        label: 'Select Rebate'
      }
    ]
    ;({ rebateType, label } = getRebateTypeAndLabelForXcelMeasure(
      measureName,
      formValues['motor_application']
    ))
  } else if (
    measureName === 'xcelBoilerStackDamper' ||
    measureName === 'xcelBoilerOutdoorAirReset' ||
    measureName === 'xcelBoilerModulatingBurnerControl' ||
    measureName === 'xcelBoilerO2TrimControl'
  ) {
    options = [
      {
        value: '',
        label: 'Select Rebate'
      }
    ]
    ;({ rebateType, label } = getRebateTypeAndLabelForXcelMeasure(
      measureName,
      formValues['inputCapacity']
    ))
  } else if (measureName === 'xcelWaterOrAirCooledChillers') {
    options = [
      {
        value: '',
        label: 'Select Rebate'
      }
    ]
    ;({ rebateType, label } = getRebateTypeAndLabelForXcelMeasure(measureName, {
      chiller_type: formValues['chiller_type'] || 'scroll-or-screw',
      size: formValues['size']
    }))
  } else if (measureName === 'xcelPipeInsulation') {
    options = [
      {
        value: '',
        label: 'Select Rebate'
      }
    ]
    ;({ rebateType, label } = getRebateTypeAndLabelForXcelMeasure(measureName, {
      pipeDiameter: formValues['pipeDiameter'],
      insulationThickness: formValues['insulationThickness'],
      t_fluid: formValues['t_fluid']
    }))
  } else if (measureName === 'xcelHVACUnitReplacement') {
    options = [
      {
        value: '',
        label: 'Select Rebate'
      }
    ]
    ;({ rebateType, label } = getRebateTypeAndLabelForXcelMeasure(measureName, {
      equipment_type: formValues['equipment_type'],
      size: formValues['size'],
      eer_eff: formValues['eer_eff'],
      seer_eff: formValues['seer_eff']
    }))
  }
  if (rebateType) {
    options = [
      ...options,
      {
        value: rebateType,
        label: label
      }
    ]
  }
  return options
}

export const checkXcelMeasureFieldForCalcuation = (name, fieldName) => {
  const xcelMeasureFields = {
    xcelLEDLighting: [
      'xcelLEDLighting_rebate_type',
      'xcelLEDLighting_rebate',
      'dlc_qualified',
      'energy_star_qualified',
      'existing_equipment'
    ],
    xcelAntiSweatHeaterControls: [
      'antiSweatHeaterControlType',
      'numDoorsControlled'
    ],
    xcelOzoneLaundry: ['seer_eff', 'washing_machine_capacity'],
    xcelDishwashers: ['dishwasher_type', 'quantity'],
    xcelUnitHeaters: ['input_capacity', 'infrared_heater', 'unit_heater_type'],
    xcelMiniSplitHP: ['quantity', 'size_cool'],
    xcelPreRinseSprayValve: ['quantity'],
    xcelVFDOnMotor: ['quantity', 'motor_tag'],
    xcelVFDOnMotorWaterWellPump: ['motor_tag'],
    xcelAddLowFlowFaucetAerator: ['quantity'],
    xcelVFDOnCentrifugalChillers: [
      'quantity',
      'size',
      'iplv_vfd_baseline',
      'iplv_vfd_eff'
    ],
    xcelRefrigerationCoilTuneUp: ['quantity'],
    xcelRefrigerationNoHeatCaseDoors: ['quantity', 'caseType'],
    xcelRefrigerationCaseDoors: ['linear_feet', 'caseType'],
    xcelCompressedAirNoAirLossDrainSavings: ['quantity'],
    xcelWaterHeaterNew: ['heater_type', 'inputCapacity'],
    xcelCompressedAirMistEliminatorsSavings: ['quantity', 'cfm'],
    xcelBoilerNewHighEfficiency: ['inputCapacity', 'boilerType'],
    xcelMotorUpgrade: ['motor_tag', 'measure_enhancement_type'],
    xcelRefrigerationECMotors: ['quantity', 'motor_application'],
    xcelCompressedAirCyclingDryersSavings: ['quantity', 'cfm'],
    xcelCompressedAirDewPointControlsSavings: ['quantity', 'cfm'],
    xcelBoilerStackDamper: ['inputCapacity'],
    xcelBoilerOutdoorAirReset: ['inputCapacity'],
    xcelBoilerO2TrimControl: ['inputCapacity'],
    xcelBoilerModulatingBurnerControl: ['inputCapacity'],
    xcelWaterOrAirCooledChillers: ['quantity', 'size', 'iplv_eff', 'flv_eff'],
    xcelPipeInsulation: [
      'pipeDiameter',
      'insulationThickness',
      't_fluid',
      'lf'
    ],
    xcelHVACUnitReplacement: ['size', 'equipment_type', 'eer_eff', 'seer_eff']
  }

  const measureField = xcelMeasureFields[name]
  return (
    fieldName === `${name}RebateType` ||
    !!(measureField && measureField.indexOf(fieldName) !== -1)
  )
}

export const calculateIncetiveCostValueForXcelMeasure = (name, formObj) => {
  const measuresWithQuantity = [
    'xcelDishwashers',
    'xcelPreRinseSprayValve',
    'xcelVFDOnMotor',
    'xcelAddLowFlowFaucetAerator',
    'xcelRefrigerationCoilTuneUp',
    'xcelRefrigerationNoHeatCaseDoors',
    'xcelCompressedAirNoAirLossDrainSavings',
    'xcelRefrigerationECMotors'
  ]
  let { incentiveValue, costValue } = getValueForXcelMeasure(name, {
    rebate: formObj[`${name}RebateType`]
  })
  if (name == 'xcelMotorUpgrade') {
    ;({ incentiveValue, costValue } = getValueForXcelMeasure(name, {
      rebate: formObj[`${name}RebateType`],
      plan: formObj['measure_enhancement_type']
    }))
  }
  if (measuresWithQuantity.indexOf(name) !== -1) {
    incentiveValue = incentiveValue * formObj.quantity
    costValue = costValue * formObj.quantity
  } else if (name === 'xcelAntiSweatHeaterControls') {
    incentiveValue = incentiveValue * formObj.numDoorsControlled
    costValue = costValue * formObj.numDoorsControlled
  } else if (name === 'xcelUnitHeaters') {
    incentiveValue = (incentiveValue * formObj.input_capacity) / 100000
    costValue = (costValue * formObj.input_capacity) / 1000
  } else if (name === 'xcelMiniSplitHP') {
    costValue = costValue * formObj.quantity * formObj.size_cool
  } else if (name === 'xcelVFDOnCentrifugalChillers') {
    incentiveValue =
      incentiveValue *
      formObj.quantity *
      ((formObj.iplv_vfd_baseline - formObj.iplv_vfd_eff) / 0.01) *
      formObj.size
    costValue = costValue * formObj.size * formObj.quantity
  } else if (name === 'xcelRefrigerationCaseDoors') {
    incentiveValue = incentiveValue * formObj.linear_feet
    costValue = costValue * formObj.linear_feet
  } else if (name === 'xcelWaterHeaterNew') {
    incentiveValue =
      (incentiveValue * formObj.inputCapacity * formObj.quantity) / 100000
  } else if (name === 'xcelBoilerNewHighEfficiency') {
    incentiveValue = incentiveValue * formObj.inputCapacity
  } else if (
    name === 'xcelCompressedAirMistEliminatorsSavings' ||
    name === 'xcelCompressedAirCyclingDryersSavings' ||
    name === 'xcelCompressedAirDewPointControlsSavings'
  ) {
    let minCfm = 0,
      maxCfm = 0
    const value = formObj.cfm
    if (value && value.split(' ').length === 5) {
      minCfm = value.split(' ')[0]
      maxCfm = value.split(' ')[3]
    }
    incentiveValue = incentiveValue * minCfm
    costValue = costValue * formObj.quantity
  } else if (
    name === 'xcelBoilerStackDamper' ||
    name === 'xcelBoilerOutdoorAirReset'
  ) {
    incentiveValue = incentiveValue * formObj.inputCapacity
    costValue = costValue * formObj.inputCapacity
  } else if (name === 'xcelBoilerModulatingBurnerControl') {
    incentiveValue = incentiveValue * formObj.inputCapacity
    costValue = costValue > 0 ? costValue : 0
  } else if (name === 'xcelBoilerO2TrimControl') {
    // incentiveValue = incentiveValue
    // costValue = 0
  } else if (name === 'xcelWaterOrAirCooledChillers') {
    const data = getValueForXcelMeasure(name, {
      rebate: formObj[`${name}RebateType`]
    })
    incentiveValue = 0
    if (data.incentive.length) {
      incentiveValue =
        data.incentive[0].value * formObj.size * formObj.quantity +
        data.incentive[1].value *
          formObj.size *
          formObj.quantity *
          ((data.incentive[1].flv_vfd_baseline - formObj.flv_eff) / 0.01) +
        data.incentive[2].value *
          formObj.size *
          formObj.quantity *
          ((data.incentive[2].IPlv_vfd_baseline - formObj.iplv_eff) / 0.01)
    }
    costValue = data.costValue * formObj.size * formObj.quantity
  } else if (name === 'xcelPipeInsulation') {
    incentiveValue = incentiveValue * formObj.lf
    costValue = costValue * formObj.lf
  } else if (name === 'xcelHVACUnitReplacement') {
    incentiveValue = incentiveValue * (formObj.size - 10)
    incentiveValue = incentiveValue >= 0 ? +incentiveValue : 0
    costValue = costValue * formObj.size
  }
  return { incentiveValue, costValue }
}

/**
 * Only tested with lighting fixtures
 * @param equipment
 */
export const getEquipmentQuantity = (equipment, units = '') => {
  let base_quantity = (equipment && equipment.quantity) || 0
  let libraryEquipment = equipment.libraryEquipment || undefined
  if (!libraryEquipment) return base_quantity

  try {
    if (
      libraryEquipment.application === 'FIXTURE' &&
      libraryEquipment.category === 'LIGHTING' &&
      units !== 'fixture'
    ) {
      let numOfLamps = libraryEquipment.fields.numberOfLamps.value || 1
      base_quantity *= numOfLamps
    }
  } catch (e) {
    console.error('Failed to get equipment quantity!', e)
    return base_quantity
  }

  return base_quantity
}

const getEquipmentAnnualHours = (equipment, building) => {
  let operationId = equipment.operation && equipment.operation.id
  if (!building || !building.operations || !operationId) return undefined
  for (let op of building.operations) {
    if (op._id === operationId) {
      return op.annualHours
    }
  }
  return undefined
}

const getEquipmentAnnualHoursV2 = (equipment, building, operations = []) => {
  let operationId = equipment.operation && equipment.operation.id
  let filterOperations = operations.filter(
    operation =>
      operation.equipmentIds.includes(equipment._id) ||
      operation._id === operationId
  )
  let value = 0
  if (filterOperations.length !== 0) {
    for (let operation of filterOperations) {
      value = value + (+operation.annualHours || 0)
    }
    value = Math.min(value, 365 * 24)
  }
  return value
}

export const evaluateConditions = (conditions, formValues) => {
  if (conditions.length === 0) return true

  let conditionAccepted = false
  for (let condition of conditions) {
    let operation = condition.operation || 'OR'
    let thisConditionAccepted = evaluateCondition(condition, formValues)
    if (operation === 'OR')
      conditionAccepted = conditionAccepted || thisConditionAccepted
    if (operation === 'AND')
      conditionAccepted = conditionAccepted && thisConditionAccepted
  }
  return conditionAccepted
}

export const evaluateCondition = (condition, formValues) => {
  let fieldValue = formValues[condition.field]
  let gt, gte, lt, lte, eq, includes, contains, neq, notNull
  gt = gte = lt = lte = eq = includes = contains = neq = notNull = true
  if (condition.gt || condition.gt === 0 || condition.gt === '')
    gt = fieldValue > condition.gt
  if (condition.gte || condition.gte === 0 || condition.gte === '')
    gte = fieldValue >= condition.gte
  if (condition.lt || condition.lt === 0 || condition.lt === '')
    lt = fieldValue < condition.lt
  if (condition.lte || condition.lte === 0 || condition.lte === '')
    lte = fieldValue <= condition.lte
  if (condition.eq || condition.eq === 0 || condition.eq === '')
    eq = fieldValue == condition.eq
  if (condition.neq || condition.neq === 0 || condition.neq === '')
    neq = fieldValue !== condition.neq
  if (condition.notNull)
    notNull = fieldValue !== undefined && fieldValue !== null
  if (condition.in) includes = condition.in.indexOf(fieldValue) >= 0
  if (condition.contains) {
    if (!fieldValue) {
      contains = false
    } else {
      contains = fieldValue.indexOf(condition.contains) >= 0
    }
  }

  return gt && gte && lt && lte && eq && includes && contains && neq && notNull
}

export const calculateIncentive = (conditionalIncentive, formValues) => {
  let description = ''
  let incentiveValue = formValues.input
  for (let incentive of conditionalIncentive) {
    if (evaluateConditions(incentive.conditions, formValues)) {
      let value = evaluateFormula(incentive.formula, formValues)
      if (value !== null) incentiveValue = value
      description = incentive.description
      break
    }
  }
  return { description: description, incentive: incentiveValue }
}

export const evaluateFormula = (formula, formValues) => {
  let completedFormula = formula
  for (let field in formValues) {
    completedFormula = completedFormula.replaceAll(
      '[' + field + ']',
      formValues[field]
    )
  }
  let result = null
  try {
    result = Math.round(math.evaluate(completedFormula) * 1000) / 1000
  } catch (e) {}

  return result
}

export const getEquipmentSelectFieldsString = (
  equipmentDataFields,
  equipment,
  building
) => {
  let fieldNames = []
  let equipmentString =
    (equipment.libraryEquipment && equipment.libraryEquipment.name) || ''
  equipmentString += ' — '
  let stringParts = []
  let isDisabled = false
  const defaultValue = '--'
  for (let key in equipmentDataFields) {
    let field = equipmentDataFields[key]
    let fieldName = field.field || ''
    let configName = field.config || ''
    let dataName = field.data || ''

    let value = ''
    if (fieldName && fieldNames.indexOf(fieldName) < 0) {
      fieldNames.push(fieldName)
      let f = {}
      if (equipment.libraryEquipment && equipment.libraryEquipment.fields) {
        f = equipment.libraryEquipment.fields[fieldName] || {}
      }
      value = f.value || defaultValue
    }
    if (configName && fieldNames.indexOf(configName) < 0) {
      fieldNames.push(configName)
      let f = equipment.configs.find(c => c.field === configName) || {}
      value = f.value || defaultValue
    }
    if (dataName && fieldNames.indexOf(dataName) < 0) {
      fieldNames.push(dataName)
      if (dataName === 'quantity') {
        value = equipment.quantity || defaultValue
      } else if (dataName === 'annualHours') {
        value = getEquipmentAnnualHours(equipment, building) || defaultValue
      } else if (dataName === 'lamps') {
        // Only for Lighting Fixtures
        let lampField = equipment.libraryEquipment.fields['numberOfLamps'] || {}
        let lamps = lampField.value || 0
        let q = equipment.quantity || 0
        value = lamps * q
        if (!value) value = defaultValue
      } else if (dataName === 'technology') {
        continue
      }
    }
    if (value === defaultValue && !field.optional) {
      isDisabled = true
    }
    if (value) {
      let prefix = field.prefix || ''
      let suffix = field.suffix || ''
      stringParts.push(prefix + value + suffix)
    }
  }
  return {
    label: equipmentString + stringParts.join(', '),
    disabled: isDisabled
  }
}

export const setFormEquipmentValues = (
  equipmentDataFields,
  equipment,
  formValues,
  building,
  operations = [],
  version = 1
) => {
  for (let formFieldName in equipmentDataFields) {
    let field = equipmentDataFields[formFieldName]
    let fieldName = field.field || ''
    let configName = field.config || ''
    let dataName = field.data || ''
    let conversion = field.conversion || 1

    let value = ''
    if (fieldName) {
      let f =
        (equipment &&
          equipment.libraryEquipment &&
          equipment.libraryEquipment.fields &&
          equipment.libraryEquipment.fields[fieldName]) ||
        {}
      value = f.value || 0
    } else if (configName) {
      let f = equipment.configs.find(c => c.field === configName) || {}
      value = f.value
    } else if (dataName) {
      if (dataName === 'quantity') {
        value = equipment.quantity
      } else if (dataName === 'annualHours') {
        if (version === 2) {
          value =
            getEquipmentAnnualHoursV2(equipment, building, operations) || 0.0
        } else {
          value = getEquipmentAnnualHours(equipment, building) || 0.0
        }
      } else if (dataName === 'lamps') {
        // Only for Lighting Fixtures
        let lampField = equipment.libraryEquipment.fields['numberOfLamps'] || {}
        let lamps = lampField.value || 0
        let q = equipment.quantity || 0
        value = lamps * q
      } else if (dataName === 'technology') {
        value = equipment.libraryEquipment.technology || ''
      }
    }
    if (conversion !== 1) {
      value = value * conversion
    }
    if (field.dict) {
      if (field.dict[value]) {
        value = field.dict[value]
      } else {
        continue
      }
    }
    formValues[formFieldName] = value
  }
  formValues.existing_equipment_name = equipment.libraryEquipment.name
}
