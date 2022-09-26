export const OverviewFields = [
  {
    name: 'Summary',
    value: 'summary',
    subFields: [
      { name: 'Total Energy Cost', value: 'summary.totalCost' },
      {
        name: 'Total Cost per square foot',
        value: 'summary.totalCostPerSquareFoot'
      },
      { name: 'Total Energy Use', value: 'summary.totalEnergyUse' },
      { name: 'Site EUI (kBtu/ft²)', value: 'summary.siteEui' },
      { name: 'Total Water Use', value: 'summary.totalWaterUse' },
      { name: 'Water WUI (ccf/ft²)', value: 'summary.waterWui' },
      {
        name: 'CBECs Median Electricity EUI (kWh/ft²)',
        value: 'summary.CBECs Median Electricity EUI (kWh/SqFt)'
      },
      {
        name: 'CBECs Median Natural Gas EUI (therms/ft²)',
        value: 'summary.CBECs Median Natural Gas EUI (Therms/SqFt)'
      },
      {
        name: 'CBECs Median EUI - All Sources (kBtu/ft²)',
        value: 'summary.CBECs Median EUI - All Sources (kBtu/SqFt)'
      }
    ]
  },
  {
    name: 'Electricity',
    value: 'electricity',
    subFields: [
      {
        name: 'Electricity EUI (kWh/ft²)',
        value: 'electricity.electricityEui'
      },
      { name: 'Total Usage', value: 'electricity.totalUsage' },
      { name: 'Total Usage Percent', value: 'electricity.totalUsagePercent' },
      { name: 'Total Cost', value: 'electricity.totalCost' },
      {
        name: 'Total Cost per Square Foot',
        value: 'electricity.costPerSquareFoot'
      },
      {
        name: 'Total Usage Cost',
        value: 'electricity.totalUsageCost'
      },
      {
        name: 'Total Usage Cost Percent',
        value: 'electricity.totalUsageCostPercent'
      },
      { name: 'Total Demand', value: 'electricity.totalDemand' },
      { name: 'Total Demand Cost', value: 'electricity.totalDemandCost' },
      { name: 'GHG Emissions', value: 'electricity.ghgEmissions' }
    ]
  },
  {
    name: 'Natural Gas',
    value: 'naturalGas',
    subFields: [
      { name: 'Natural Gas EUI', value: 'naturalGas.naturalGasEui' },
      { name: 'Total Usage', value: 'naturalGas.totalUsage' },
      { name: 'Total Usage Percent', value: 'naturalGas.totalUsagePercent' },
      { name: 'Total Usage Cost', value: 'naturalGas.totalUsageCost' },
      {
        name: 'Total Usage Cost Percent',
        value: 'naturalGas.totalUsageCostPercent'
      },
      { name: 'GHG Emissions', value: 'naturalGas.ghgEmissions' }
    ]
  },
  {
    name: 'Water',
    value: 'water',
    subFields: [
      { name: 'Water WUI (ccf/ft²)', value: 'water.waterWUI' },
      { name: 'Total Usage', value: 'water.totalUsage' },
      { name: 'Total Usage Cost', value: 'water.totalUsageCost' },
      {
        name: 'Total Usage Cost Percent',
        value: 'water.totalUsageCostPercent'
      }
    ]
  },
  {
    name: 'Steam',
    value: 'steam',
    subFields: [
      { name: 'Steam EUI (Mlb/ft²)', value: 'steam.waterWUI' },
      { name: 'Total Usage', value: 'steam.totalUsage' },
      { name: 'Total Usage Percent', value: 'steam.totalUsagePercent' },
      { name: 'Total Usage Cost', value: 'steam.totalUsageCost' },
      {
        name: 'Total Usage Cost Percent',
        value: 'steam.totalUsageCostPercent'
      },
      { name: 'GHG Emissions', value: 'steam.ghgEmissions' }
    ]
  },
  {
    name: 'Fuel Oil 2',
    value: 'fuelOil2',
    subFields: [
      { name: 'Fuel Oil 2 EUI (gal/ft²)', value: 'fuelOil2.waterWUI' },
      { name: 'Total Usage', value: 'fuelOil2.totalUsage' },
      { name: 'Total Usage Percent', value: 'fuelOil2.totalUsagePercent' },
      { name: 'Total Usage Cost', value: 'fuelOil2.totalUsageCost' },
      {
        name: 'Total Usage Cost Percent',
        value: 'fuelOil2.totalUsageCostPercent'
      },
      { name: 'GHG Emissions', value: 'fuelOil2.ghgEmissions' }
    ]
  },
  {
    name: 'Fuel Oil 4',
    value: 'fuelOil4',
    subFields: [
      { name: 'Fuel Oil 4 EUI (gal/ft²)', value: 'fuelOil4.waterWUI' },
      { name: 'Total Usage', value: 'fuelOil4.totalUsage' },
      { name: 'Total Usage Percent', value: 'fuelOil4.totalUsagePercent' },
      { name: 'Total Usage Cost', value: 'fuelOil4.totalUsageCost' },
      {
        name: 'Total Usage Cost Percent',
        value: 'fuelOil4.totalUsageCostPercent'
      },
      { name: 'GHG Emissions', value: 'fuelOil4.ghgEmissions' }
    ]
  },
  {
    name: 'Fuel Oil 5 & 6',
    value: 'fuelOil56',
    subFields: [
      {
        name: 'Fuel Oil 5 & 6 EUI (gal/ft²)',
        value: 'fuelOil56.waterWUI'
      },
      { name: 'Total Usage', value: 'fuelOil56.totalUsage' },
      { name: 'Total Usage Percent', value: 'fuelOil56.totalUsagePercent' },
      { name: 'Total Usage Cost', value: 'fuelOil56.totalUsageCost' },
      {
        name: 'Total Usage Cost Percent',
        value: 'fuelOil56.totalUsageCostPercent'
      },
      { name: 'GHG Emissions', value: 'fuelOil56.ghgEmissions' }
    ]
  },
  {
    name: 'Diesel',
    value: 'diesel',
    subFields: [
      { name: 'Diesel EUI (gal/ft²)', value: 'diesel.waterWUI' },
      { name: 'Total Usage', value: 'diesel.totalUsage' },
      { name: 'Total Usage Percent', value: 'diesel.totalUsagePercent' },
      { name: 'Total Usage Cost', value: 'diesel.totalUsageCost' },
      {
        name: 'Total Usage Cost Percent',
        value: 'diesel.totalUsageCostPercent'
      },
      { name: 'GHG Emissions', value: 'diesel.ghgEmissions' }
    ]
  },
  {
    name: 'Other Fuel',
    value: 'otherFuel',
    subFields: [
      { name: 'Other EUI (kWh/ft²)', value: 'otherFuel.waterWUI' },
      { name: 'Total Usage', value: 'otherFuel.totalUsage' },
      { name: 'Total Usage Percent', value: 'otherFuel.totalUsagePercent' },
      { name: 'Total Usage Cost', value: 'otherFuel.totalUsageCost' },
      {
        name: 'Total Usage Cost Percent',
        value: 'otherFuel.totalUsageCostPercent'
      }
    ]
  },
  {
    name: 'Rates',
    value: 'rates',
    subFields: [
      { name: 'Electricity Average Blended Rate', value: 'rates.electricity' },
      { name: 'Natural Gas Average Blended Rate', value: 'rates.gas' },
      { name: 'Water Average Blended Rate', value: 'rates.water' },
      { name: 'Steam Average Blended Rate', value: 'rates.steam' },
      { name: 'Fuel Oil 2 Average Blended Rate', value: 'rates.fuelOil2' },
      { name: 'Fuel Oil 4 Average Blended Rate', value: 'rates.fuelOil4' },
      { name: 'Fuel Oil 5 & 6 Average Blended Rate', value: 'rates.fuelOil56' },
      { name: 'Diesel Average Blended Rate', value: 'rates.diesel' },
      { name: 'Other Average Blended Rate', value: 'rates.other' }
    ]
  },
  {
    name: 'GHG Emissions',
    value: 'ghgEmissions',
    subFields: [
      {
        name: 'Total Emissions (mtCO2e)',
        value: 'ghgEmissions.totalEmissions'
      },
      {
        name: 'GHG Intensity (kgCO2e/ft²)',
        value: 'ghgEmissions.ghgIntensity'
      },
      {
        name: 'Vehicles Driven in a Year',
        value: 'ghgEmissions.vehiclesDriven'
      },
      {
        name: 'Barrels of Oil Consumed',
        value: 'ghgEmissions.oilBarrelsConsumed'
      },
      {
        name: 'Railcars of Coal Burned',
        value: 'ghgEmissions.coalRailcarsBurned'
      }
    ]
  },
  {
    name: 'Portfolio Manager',
    value: 'portfolioManager',
    subFields: [
      {
        name: 'Energy Star Portfolio Manager Score',
        value: 'portfolioManager.score'
      }
      // { name: 'Site EUI', value: 'portfolioManager.siteEui' },
      // { name: 'Source EUI', value: 'portfolioManager.sourceEui' },
      // { name: 'National Median', value: 'portfolioManager.nationalMedian' }
    ]
  },
  {
    name: 'Annual Cost Benchmark',
    value: 'annualCostBenchmark',
    subFields: [
      { name: 'Your Building', value: 'annualCostBenchmark.you' },
      { name: '% vs Median', value: 'annualCostBenchmark.percentMedian' },
      { name: 'Median', value: 'annualCostBenchmark.median' },
      { name: '75th Percentile', value: 'annualCostBenchmark.percentile75' },
      { name: '90th Percentile', value: 'annualCostBenchmark.percentile90' }
    ]
  },
  {
    name: 'Annual Usage Benchmark',
    value: 'annualUsageBenchmark',
    subFields: [
      { name: 'Your Building', value: 'annualUsageBenchmark.you' },
      { name: '% vs Median', value: 'annualUsageBenchmark.percentMedian' },
      { name: 'Median', value: 'annualUsageBenchmark.median' },
      { name: '75th Percentile', value: 'annualUsageBenchmark.percentile75' },
      { name: '90th Percentile', value: 'annualUsageBenchmark.percentile90' }
    ]
  },
  {
    name: 'Degree Days',
    value: 'degree',
    subFields: [
      { name: 'HDD', value: 'degree.Hdd' },
      { name: 'CDD', value: 'degree.Cdd' }
    ]
  }
]
export const EndUseFields = [
  {
    name: 'Estimated End Use Breakdown',
    value: 'estimatedEndUseBreakdown',
    subFields: [
      {
        name: 'Percentages',
        value: 'estimatedEndUseBreakdown.percentage'
      }
    ]
  },
  {
    name: 'Actual End Use Breakdown',
    value: 'actualEndUseBreakdown',
    subFields: [
      { name: 'Total Use (kBtu)', value: 'actualEndUseBreakdown.totalUse' },
      {
        name: 'Electricity Use (kWh)',
        value: 'actualEndUseBreakdown.electricity.energyUse'
      },
      {
        name: 'Natural Gas Use (therms)',
        value: 'actualEndUseBreakdown.naturalGas.energyUse'
      },
      { name: 'Percentages', value: 'actualEndUseBreakdown.totalCost' }
    ]
  }
]
export const UtilityFields = [
  {
    name: 'Electricity',
    value: 'electricity',
    subFields: [
      { name: 'Total Usage', value: 'electricity.totalUsage' },

      {
        name: 'Total Usage Cost',
        value: 'electricity.totalUsageCost'
      },
      { name: 'Total Cost', value: 'electricity.totalCost' },

      { name: 'Total Demand', value: 'electricity.totalDemand' },
      {
        name: 'Total Demand Cost',
        value: 'electricity.totalDemandCost'
      },
      {
        name: 'Cost Per Square Foot',
        value: 'electricity.costPerSquareFoot'
      },
      { name: 'Days in Period', value: 'electricity.daysInPeriod' },
      { name: 'Average Daily', value: 'electricity.avgDaily' },
      {
        name: 'Maximum Demand Value',
        value: 'electricity.maximumDemandValue'
      }
    ]
  },
  {
    name: 'Natural Gas',
    value: 'naturalGas',
    subFields: [
      { name: 'Total Usage', value: 'naturalGas.totalUsage' },

      {
        name: 'Total Usage Cost',
        value: 'naturalGas.totalUsageCost'
      },
      {
        name: '$/Square Foot',
        value: 'naturalGas.costPerSquareFoot'
      },
      { name: 'Days in Period', value: 'naturalGas.daysInPeriod' },
      { name: 'Average Daily', value: 'naturalGas.avgDaily' }
    ]
  },
  {
    name: 'Water',
    value: 'water',
    subFields: [
      { name: 'Total Usage', value: 'water.totalUsage' },
      { name: 'Total Usage Cost', value: 'water.totalUsageCost' },
      { name: '$/Square Foot', value: 'water.costPerSquareFoot' },
      { name: 'Days in Period', value: 'water.daysInPeriod' },
      { name: 'Average Daily', value: 'water.avgDaily' }
    ]
  },
  {
    name: 'Steam',
    value: 'steam',
    subFields: [
      { name: 'Total Usage', value: 'steam.totalUsage' },
      { name: 'Total Usage Cost', value: 'steam.totalUsageCost' },
      { name: '$/Square Foot', value: 'steam.costPerSquareFoot' },
      { name: 'Days in Period', value: 'steam.daysInPeriod' },
      { name: 'Average Daily', value: 'steam.avgDaily' }
    ]
  },
  {
    name: 'Fuel Oil 2',
    value: 'fuelOil2',
    subFields: [
      {
        name: 'Total Usage',
        value: 'fuelOil2.totalUsage'
      },
      {
        name: 'Total Usage Cost',
        value: 'fuelOil2.totalUsageCost'
      },
      {
        name: '$/Square Foot',
        value: 'fuelOil2.costPerSquareFoot'
      },
      { name: 'Days in Period', value: 'fuelOil2.daysInPeriod' },
      { name: 'Average Daily', value: 'fuelOil2.avgDaily' }
    ]
  },
  {
    name: 'Fuel Oil 4',
    value: 'fuelOil4',
    subFields: [
      {
        name: 'Total Usage',
        value: 'fuelOil4.totalUsage'
      },
      {
        name: 'Total Usage Cost',
        value: 'fuelOil4.totalUsageCost'
      },
      {
        name: '$/Square Foot',
        value: 'fuelOil4.costPerSquareFoot'
      },
      { name: 'Days in Period', value: 'fuelOil4.daysInPeriod' },
      { name: 'Average Daily', value: 'fuelOil4.avgDaily' }
    ]
  },
  {
    name: 'Fuel Oil 5 & 6',
    value: 'fuelOil56',
    subFields: [
      {
        name: 'Total Usage',
        value: 'fuelOil56.totalUsage'
      },
      {
        name: 'Total Usage Cost',
        value: 'fuelOil56.totalUsageCost'
      },
      {
        name: '$/Square Foot',
        value: 'fuelOil56.costPerSquareFoot'
      },
      { name: 'Days in Period', value: 'fuelOil56.daysInPeriod' },
      { name: 'Average Daily', value: 'fuelOil56.avgDaily' }
    ]
  },
  {
    name: 'Diesel',
    value: 'diesel',
    subFields: [
      {
        name: 'Total Usage',
        value: 'diesel.totalUsage'
      },
      {
        name: 'Total Usage Cost',
        value: 'diesel.totalUsageCost'
      },
      {
        name: '$/Square Foot',
        value: 'diesel.costPerSquareFoot'
      },
      { name: 'Days in Period', value: 'diesel.daysInPeriod' },
      { name: 'Average Daily', value: 'diesel.avgDaily' }
    ]
  },
  {
    name: 'Others',
    value: 'otherFuel',
    subFields: [
      {
        name: 'Total Usage',
        value: 'otherFuel.totalUsage'
      },
      {
        name: 'Total Usage Cost',
        value: 'otherFuel.totalUsageCost'
      },
      {
        name: '$/Square Foot',
        value: 'otherFuel.costPerSquareFoot'
      },
      { name: 'Days in Period', value: 'otherFuel.daysInPeriod' },
      { name: 'Average Daily', value: 'otherFuel.avgDaily' }
    ]
  }
  // {
  //   name: 'Degree Days',
  //   value: 'degree',
  //   subFields: [
  //     {
  //       name: 'HDD',
  //       value: 'degree.Hdd'
  //     },
  //     {
  //       name: 'CDD',
  //       value: 'degree.Cdd'
  //     }
  //   ]
  // },
]
export const OperationFields = [
  { name: 'Setpoint Schedules', value: 'setpoint' },
  { name: 'Operational Schedules', value: 'operational' }
]
export const ConstructionFields = [
  {
    name: 'Wall',
    value: 'wall',
    subFields: [
      { name: 'Name', value: 'wall.name', section: 'Properties' },
      { name: 'R-Value', value: 'wall.rvalue', section: 'Properties' },
      { name: 'U-Value', value: 'wall.uvalue', section: 'Properties' },
      { name: 'Comments', value: 'wall.comments', section: 'Properties' }
    ]
  },
  {
    name: 'Roof',
    value: 'roof',
    subFields: [
      { name: 'Name', value: 'roof.name', section: 'Properties' },
      { name: 'R-Value', value: 'roof.rvalue', section: 'Properties' },
      { name: 'U-Value', value: 'roof.uvalue', section: 'Properties' },
      { name: 'Comments', value: 'roof.comments', section: 'Properties' }
    ]
  },
  {
    name: 'Foundation',
    value: 'foundation',
    subFields: [
      {
        name: 'Name',
        value: 'foundation.name',
        section: 'Properties'
      },
      {
        name: 'R-Value',
        value: 'foundation.rvalue',
        section: 'Properties'
      },
      {
        name: 'U-Vlue',
        value: 'foundation.uvalue',
        section: 'Properties'
      },
      {
        name: 'Comments',
        value: 'foundation.comments',
        section: 'Properties'
      }
    ]
  },
  {
    name: 'Window',
    value: 'window',
    subFields: [
      { name: 'Name', value: 'window.name', section: 'Properties' },
      { name: 'R-Value', value: 'window.rvalue', section: 'Properties' },
      { name: 'U-Value', value: 'window.uvalue', section: 'Properties' },
      { name: 'Comments', value: 'window.comments', section: 'Properties' }
    ]
  },
  {
    name: 'Exterior Floor',
    value: 'exterior_floor',
    subFields: [
      { name: 'Name', value: 'exterior_floor.name', section: 'Properties' },
      {
        name: 'R-Value',
        value: 'exterior_floor.rvalue',
        section: 'Properties'
      },
      {
        name: 'U-Value',
        value: 'exterior_floor.uvalue',
        section: 'Properties'
      },
      {
        name: 'Comments',
        value: 'exterior_floor.comments',
        section: 'Properties'
      }
    ]
  },
  {
    name: 'Interior Floor',
    value: 'interior_floor',
    subFields: [
      { name: 'Name', value: 'interior_floor.name', section: 'Properties' },
      {
        name: 'R-Value',
        value: 'interior_floor.rvalue',
        section: 'Properties'
      },
      {
        name: 'U-Value',
        value: 'interior_floor.uvalue',
        section: 'Properties'
      },
      {
        name: 'Comments',
        value: 'interior_floor.comments',
        section: 'Properties'
      }
    ]
  }
]
export const LocationFields = [
  {
    name: 'Summary',
    value: 'summary',
    subFields: [
      {
        name: 'Use Type',
        value: 'summary.usetype',
        section: 'Properties'
      },
      {
        name: 'Space Type',
        value: 'summary.spaceType',
        section: 'Properties'
      },
      { name: 'Floor', value: 'summary.floor', section: 'Properties' },
      {
        name: 'Gross Use Type Area',
        value: 'summary.grossUseTypeArea',
        section: 'Properties'
      },
      {
        name: 'Gross Floor Area',
        value: 'summary.grossFloorArea',
        section: 'Properties'
      },
      {
        name: '% of Floor Area',
        value: 'summary.percentofFloorArea',
        section: 'Properties'
      },
      {
        name: '% of Use Type Area',
        value: 'summary.percentofUseTypeArea',
        section: 'Properties'
      },
      {
        name: '% of Common Area',
        value: 'summary.percentofCommonArea',
        section: 'Properties'
      },
      {
        name: '% of Tenant Area',
        value: 'summary.percentofTenantArea',
        section: 'Properties'
      },
      {
        name: '% of Conditioned Area',
        value: 'summary.percentofConditionedArea',
        section: 'Properties'
      },
      {
        name: '% of Unconditioned Area',
        value: 'summary.percentofUnconditionedArea',
        section: 'Properties'
      }
    ]
  },
  {
    name: 'Details',
    value: 'details',
    subFields: [
      {
        name: 'Use Type',
        value: 'details.usetype',
        section: 'Properties'
      },
      {
        name: 'Space Type',
        value: 'details.spaceType',
        section: 'Properties'
      },
      { name: 'Name', value: 'details.name', section: 'Properties' },
      { name: 'Floor', value: 'details.floor', section: 'Properties' },
      {
        name: 'Gross Floor Area',
        value: 'details.area',
        section: 'Properties'
      },
      {
        name: 'Conditioning',
        value: 'details.conditioning',
        section: 'Properties'
      },
      { name: 'User', value: 'details.user', section: 'Properties' },
      {
        name: 'Length',
        value: 'details.length',
        section: 'Properties'
      },
      { name: 'Width', value: 'details.width', section: 'Properties' },
      { name: 'Height', value: 'details.height', section: 'Properties' }
    ]
  }
]
export const ContactFields = [
  { name: 'Title', value: 'title' },
  { name: 'FirstName', value: 'firstName' },
  { name: 'LastName', value: 'lastName' },
  { name: 'company', value: 'company' },
  { name: 'Role', value: 'role' },
  { name: 'Phone Number', value: 'phoneNumber' },
  { name: 'Email Address', value: 'emailAddress' },
  { name: 'Qualification', value: 'qualification' },
  { name: 'Certificate Number', value: 'certificateNumber' },
  { name: 'Expiration Date', value: 'expirationDate' },
  { name: 'Years Of Experience', value: 'yearsOfExperience' }
]
export const DataUserFields = [
  { name: 'Name', value: 'name' },
  { name: 'Email', value: 'email' },
  { name: 'Company', value: 'company' }
]
export const DataBuildingFields = [
  { name: 'Building Name', value: 'buildingName' },
  { name: 'Building Use', value: 'buildingUse' },
  { name: 'Open 24/7', value: 'open247' },
  { name: 'Year Built', value: 'buildYear' },
  { name: 'Number of Above Grade Floors', value: 'floorCount' },
  { name: 'Number of Below Grade Floors', value: 'belowGradeFloorCount' },
  { name: 'Square Footage', value: 'squareFeet' },
  { name: 'Address', value: 'address' },
  { name: 'Report Date', value: 'createdDate' },
  { name: 'Client', value: 'clientName' },
  { name: 'Site', value: 'siteName' },
  { name: 'Borough', value: 'borough' },
  { name: 'Block', value: 'block' },
  { name: 'Tax Lot', value: 'taxLot' },
  { name: 'BIN', value: 'bin' },
  { name: 'EER', value: 'eer' },
  { name: 'Building Use List', value: 'useList' },
  { name: 'Use List with Square Footage', value: 'listSquareFeet' }
]

export const yearRange = [
  { key: '12', label: 'Last 12 months', value: '12' },
  { key: '24', label: 'Last 24 months', value: '24' },
  { key: '36', label: 'Last 36 months', value: '36' },
  { key: 'Custom', label: 'Custom', value: 'Custom' }
]
