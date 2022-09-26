export const OverviewFields = [
  {
    name: 'Summary',
    value: 'summary',
    subFields: [
      { name: 'Average Energy Cost', value: 'utility.summary.totalCost' },
      {
        name: 'Average Cost per square foot',
        value: 'utility.summary.totalCostPerSquareFoot'
      },
      { name: 'Average Energy Use', value: 'utility.summary.totalEnergyUse' },
      { name: 'Site EUI (kBtu/ft²)', value: 'utility.summary.siteEui' },
      { name: 'Average Water Use', value: 'utility.summary.totalWaterUse' },
      { name: 'Water WUI (ccf/ft²)', value: 'utility.summary.waterWui' },
      {
        name: 'CBECs Median Electricity EUI (kWh/ft²)',
        value: 'utility.summary.cbecsMedianElectricityEUI'
      },
      {
        name: 'CBECs Median Natural Gas EUI (therms/ft²)',
        value: 'utility.summary.cbecsMedianNaturalGasEUI'
      },
      {
        name: 'CBECs Median EUI - All Sources (kBtu/ft²)',
        value: 'utility.summary.cbecsMedianEUIAllSources'
      }
    ]
  },
  {
    name: 'Electricity',
    value: 'electricity',
    subFields: [
      {
        name: 'Electricity EUI (kWh/ft²)',
        value: 'utility.electricity.electricityEui'
      },
      {
        name: 'Electricity Average Usage',
        value: 'utility.electricity.totalUsage'
      },
      {
        name: 'Electricity Average Usage Percent',
        value: 'utility.electricity.totalUsagePercent'
      },
      {
        name: 'Electricity Annual Cost',
        value: 'utility.electricity.totalCost'
      },
      {
        name: 'Electricity Average Cost per Square Foot',
        value: 'utility.electricity.costPerSquareFoot'
      },
      {
        name: 'Electricity Average Cost',
        value: 'utility.electricity.totalUsageCost'
      },
      {
        name: 'Electricity Average Cost Percent',
        value: 'utility.electricity.totalUsageCostPercent'
      },
      {
        name: 'Electricity Average Demand',
        value: 'utility.electricity.totalDemand'
      },
      {
        name: 'Electricity Average Demand Cost',
        value: 'utility.electricity.totalDemandCost'
      },
      {
        name: 'Electricity GHG Emissions',
        value: 'utility.electricity.ghgEmissions'
      }
    ]
  },
  {
    name: 'Natural Gas',
    value: 'naturalGas',
    subFields: [
      { name: 'Natural Gas EUI', value: 'utility.naturalGas.naturalGasEui' },
      {
        name: 'Natural Gas Average Usage',
        value: 'utility.naturalGas.totalUsage'
      },
      {
        name: 'Natural Gas Average Usage Percent',
        value: 'utility.naturalGas.totalUsagePercent'
      },
      {
        name: 'Natural Gas Average Cost',
        value: 'utility.naturalGas.totalUsageCost'
      },
      {
        name: 'Natural Gas Average Usage Cost Percent',
        value: 'utility.naturalGas.totalUsageCostPercent'
      },
      {
        name: 'Natural Gas GHG Emissions',
        value: 'utility.naturalGas.ghgEmissions'
      }
    ]
  },
  {
    name: 'Water',
    value: 'water',
    subFields: [
      { name: 'Water WUI (ccf/ft²)', value: 'utility.water.waterWUI' },
      { name: 'Water Average Usage', value: 'utility.water.totalUsage' },
      {
        name: 'Water Average Usage Cost',
        value: 'utility.water.totalUsageCost'
      },
      {
        name: 'Water Average Usage Cost Percent',
        value: 'utility.water.totalUsageCostPercent'
      }
    ]
  },
  {
    name: 'Steam',
    value: 'steam',
    subFields: [
      { name: 'Steam EUI (Mlb/ft²)', value: 'utility.steam.waterWUI' },
      { name: 'Steam Average Usage', value: 'utility.steam.totalUsage' },
      {
        name: 'Steam Average Usage Percent',
        value: 'utility.steam.totalUsagePercent'
      },
      {
        name: 'Steam Average Usage Cost',
        value: 'utility.steam.totalUsageCost'
      },
      {
        name: 'Steam Average Usage Cost Percent',
        value: 'utility.steam.totalUsageCostPercent'
      },
      { name: 'Steam GHG Emissions', value: 'utility.steam.ghgEmissions' }
    ]
  },
  {
    name: 'Fuel Oil 2',
    value: 'fuelOil2',
    subFields: [
      {
        name: 'Fuel Oil 2 EUI (gal/ft²)',
        value: 'utility.fuelOil2.waterWUI'
      },
      {
        name: 'Fuel Oil 2 Average Usage',
        value: 'utility.fuelOil2.totalUsage'
      },
      {
        name: 'Fuel Oil 2 Average Usage Percent',
        value: 'utility.fuelOil2.totalUsagePercent'
      },
      {
        name: 'Fuel Oil 2 Average Usage Cost',
        value: 'utility.fuelOil2.totalUsageCost'
      },
      {
        name: 'Fuel Oil 2 Average Usage Cost Percent',
        value: 'utility.fuelOil2.totalUsageCostPercent'
      },
      {
        name: 'Fuel Oil 2 GHG Emissions',
        value: 'utility.fuelOil2.ghgEmissions'
      }
    ]
  },
  {
    name: 'Fuel Oil 4',
    value: 'fuelOil4',
    subFields: [
      {
        name: 'Fuel Oil 4 EUI (gal/ft²)',
        value: 'utility.fuelOil4.waterWUI'
      },
      {
        name: 'Fuel Oil 4 Average Usage',
        value: 'utility.fuelOil4.totalUsage'
      },
      {
        name: 'Fuel Oil 4 Average Usage Percent',
        value: 'utility.fuelOil4.totalUsagePercent'
      },
      {
        name: 'Fuel Oil 4 Average Usage Cost',
        value: 'utility.fuelOil4.totalUsageCost'
      },
      {
        name: 'Fuel Oil 4 Average Usage Cost Percent',
        value: 'utility.fuelOil4.totalUsageCostPercent'
      },
      {
        name: 'Fuel Oil 4 GHG Emissions',
        value: 'utility.fuelOil4.ghgEmissions'
      }
    ]
  },
  {
    name: 'Fuel Oil 5 & 6',
    value: 'fuelOil56',
    subFields: [
      {
        name: 'Fuel Oil 5 & 6 EUI (gal/ft²)',
        value: 'utility.fuelOil56.waterWUI'
      },
      {
        name: 'Fuel Oil 5 & 6 Average Usage',
        value: 'utility.fuelOil56.totalUsage'
      },
      {
        name: 'Fuel Oil 5 & 6 Average Usage Percent',
        value: 'utility.fuelOil56.totalUsagePercent'
      },
      {
        name: 'Fuel Oil 5 & 6 Average Usage Cost',
        value: 'utility.fuelOil56.totalUsageCost'
      },
      {
        name: 'Fuel Oil 5 & 6 Average Usage Cost Percent',
        value: 'utility.fuelOil56.totalUsageCostPercent'
      },
      {
        name: 'Fuel Oil 5 & 6 GHG Emissions',
        value: 'utility.fuelOil56.ghgEmissions'
      }
    ]
  },
  {
    name: 'Diesel',
    value: 'diesel',
    subFields: [
      {
        name: 'Diesel EUI (gal/ft²)',
        value: 'utility.diesel.waterWUI'
      },
      { name: 'Diesel Average Usage', value: 'utility.diesel.totalUsage' },
      {
        name: 'Diesel Average Usage Percent',
        value: 'utility.diesel.totalUsagePercent'
      },
      {
        name: 'Diesel Average Usage Cost',
        value: 'utility.diesel.totalUsageCost'
      },
      {
        name: 'Diesel Average Usage Cost Percent',
        value: 'utility.diesel.totalUsageCostPercent'
      },
      { name: 'Diesel GHG Emissions', value: 'utility.diesel.ghgEmissions' }
    ]
  },
  {
    name: 'Other Fuel',
    value: 'otherFuel',
    subFields: [
      {
        name: 'Other EUI (kWh/ft²)',
        value: 'utility.otherFuel.waterWUI'
      },
      { name: 'Other Average Usage', value: 'utility.otherFuel.totalUsage' },
      {
        name: 'Other Average Usage Percent',
        value: 'utility.otherFuel.totalUsagePercent'
      },
      {
        name: 'Other Average Usage Cost',
        value: 'utility.otherFuel.totalUsageCost'
      },
      {
        name: 'Other Average Usage Cost Percent',
        value: 'utility.otherFuel.totalUsageCostPercent'
      }
    ]
  },
  {
    name: 'Rates',
    value: 'rates',
    subFields: [
      {
        name: 'Electricity Average Blended Rate',
        value: 'utility.rates.electricity'
      },
      { name: 'Natural Gas Average Blended Rate', value: 'utility.rates.gas' },
      { name: 'Water Average Blended Rate', value: 'utility.rates.water' },
      { name: 'Steam Average Blended Rate', value: 'utility.rates.steam' },
      {
        name: 'Fuel Oil 2 Average Blended Rate',
        value: 'utility.rates.fuelOil2'
      },
      {
        name: 'Fuel Oil 4 Average Blended Rate',
        value: 'utility.rates.fuelOil4'
      },
      {
        name: 'Fuel Oil 5 & 6 Average Blended Rate',
        value: 'utility.rates.fuelOil56'
      },
      { name: 'Diesel Average Blended Rate', value: 'utility.rates.diesel' },
      { name: 'Other Average Blended Rate', value: 'utility.rates.other' }
    ]
  },
  {
    name: 'GHG Emissions',
    value: 'ghgEmissions',
    subFields: [
      {
        name: 'Average Emissions (mtCO2e)',
        value: 'utility.ghgEmissions.totalEmissions'
      },
      {
        name: 'GHG Intensity (kgCO2e/ft²)',
        value: 'utility.ghgEmissions.ghgIntensity'
      },
      {
        name: 'Vehicles Driven in a Year',
        value: 'utility.ghgEmissions.vehiclesDriven'
      },
      {
        name: 'Barrels of Oil Consumed',
        value: 'utility.ghgEmissions.oilBarrelsConsumed'
      },
      {
        name: 'Railcars of Coal Burned',
        value: 'utility.ghgEmissions.coalRailcarsBurned'
      }
    ]
  },
  {
    name: 'Portfolio Manager',
    value: 'portfolioManager',
    subFields: [
      {
        name: 'Energy Star Portfolio Manager Score',
        value: 'utility.portfolioManager.score'
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
      { name: 'Your Building', value: 'utility.annualCostBenchmark.you' },
      {
        name: '% vs Median',
        value: 'utility.annualCostBenchmark.percentMedian'
      },
      { name: 'Median', value: 'utility.annualCostBenchmark.median' },
      {
        name: '75th Percentile',
        value: 'utility.annualCostBenchmark.percentile75'
      },
      {
        name: '90th Percentile',
        value: 'utility.annualCostBenchmark.percentile90'
      }
    ]
  },
  {
    name: 'Annual Usage Benchmark',
    value: 'annualUsageBenchmark',
    subFields: [
      { name: 'Your Building', value: 'utility.annualUsageBenchmark.you' },
      {
        name: '% vs Median',
        value: 'utility.annualUsageBenchmark.percentMedian'
      },
      { name: 'Median', value: 'utility.annualUsageBenchmark.median' },
      {
        name: '75th Percentile',
        value: 'utility.annualUsageBenchmark.percentile75'
      },
      {
        name: '90th Percentile',
        value: 'utility.annualUsageBenchmark.percentile90'
      }
    ]
  },
  {
    name: 'Degree Days',
    value: 'degree',
    subFields: [
      { name: 'HDD', value: 'utility.degree.Hdd' },
      { name: 'CDD', value: 'utility.degree.Cdd' }
    ]
  }
]
export const EndUseFields = [
  {
    name: 'Estimated End Use Breakdown',
    value: 'estimatedEndUseBreakdown',
    subFields: [
      {
        name: 'Estimated End Use Breakdown Percentages',
        value: 'estimatedEndUseBreakdown.percentage'
      }
    ]
  },
  {
    name: 'Actual End Use Breakdown',
    value: 'actualEndUseBreakdown',
    subFields: [
      {
        name: 'Actual End Use Breakdown Total Use (kBtu)',
        value: 'actualEndUseBreakdown.totalUse'
      },
      {
        name: 'Actual End Use Breakdown Electricity Use (kWh)',
        value: 'actualEndUseBreakdown.electricity.energyUse'
      },
      {
        name: 'Actual End Use Breakdown Natural Gas Use (therms)',
        value: 'actualEndUseBreakdown.naturalGas.energyUse'
      },
      {
        name: 'Actual End Use Breakdown Percentages',
        value: 'actualEndUseBreakdown.totalCost'
      }
    ]
  }
]
export const UtilityFields = [
  {
    name: 'Electricity',
    value: 'electricity',
    subFields: [
      {
        name: 'Electricity Average Usage',
        value: 'utility.electricity.totalUsage'
      },
      {
        name: 'Electricity Average Cost',
        value: 'utility.electricity.totalUsageCost'
      },
      {
        name: 'Electricity Average Demand',
        value: 'utility.electricity.totalDemand'
      },
      {
        name: 'Electricity Average Demand Cost',
        value: 'utility.electricity.totalDemandCost'
      },
      {
        name: 'Electricity Cost Per Square Foot',
        value: 'utility.electricity.costPerSquareFoot'
      },
      {
        name: 'Electricity Days in Period',
        value: 'utility.electricity.daysInPeriod'
      },
      {
        name: 'Electricity Average Daily',
        value: 'utility.electricity.avgDaily'
      },
      {
        name: 'Electricity Average Max Demand Value',
        value: 'utility.electricity.totalDemandMonthly'
      }
      // {
      //   name: 'Electricity Average Annual Energy',
      //   value: 'utility.electricity.averageAnnualEnergy'
      // },
      // {
      //   name: 'Electricity Average Annual Cost',
      //   value: 'utility.electricity.averageAnnualCost'
      // }
    ]
  },
  {
    name: 'Natural Gas',
    value: 'naturalGas',
    subFields: [
      { name: 'Natural Gas Average Usage', value: 'naturalGas.totalUsage' },

      {
        name: 'Natural Gas Average Cost',
        value: 'utility.naturalGas.totalUsageCost'
      },
      {
        name: 'Natural Gas $/Square Foot',
        value: 'utility.naturalGas.costPerSquareFoot'
      },
      {
        name: 'Natural Gas Days in Period',
        value: 'utility.naturalGas.daysInPeriod'
      },
      {
        name: 'Natural Gas Average Daily',
        value: 'utility.naturalGas.avgDaily'
      },
      // {
      //   name: 'Natural Gas Average Annual Energy',
      //   value: 'utility.naturalGas.averageAnnualEnergy'
      // },
      // {
      //   name: 'Natural Gas Average Annual Cost',
      //   value: 'utility.naturalGas.averageAnnualCost'
      // },
      {
        name: 'Natural Gas Utilities',
        value: 'utility.naturalGas.naturalGasUtilities'
      }
    ]
  },
  {
    name: 'Water',
    value: 'water',
    subFields: [
      { name: 'Water Average Usage', value: 'utility.water.totalUsage' },
      {
        name: 'Water Average Usage Cost',
        value: 'utility.water.totalUsageCost'
      },
      { name: 'Water $/Square Foot', value: 'utility.water.costPerSquareFoot' },
      { name: 'Water Days in Period', value: 'utility.water.daysInPeriod' },
      { name: 'Water Average Daily', value: 'utility.water.avgDaily' }
      // ,
      // {
      //   name: 'Water Average Annual Energy',
      //   value: 'utility.water.averageAnnualEnergy'
      // },
      // {
      //   name: 'Water Average Annual Cost',
      //   value: 'utility.water.averageAnnualCost'
      // }
    ]
  },
  {
    name: 'Steam',
    value: 'steam',
    subFields: [
      { name: 'Steam Average Usage', value: 'utility.steam.totalUsage' },
      {
        name: 'Steam Average Usage Cost',
        value: 'utility.steam.totalUsageCost'
      },
      { name: 'Steam $/Square Foot', value: 'utility.steam.costPerSquareFoot' },
      { name: 'Steam Days in Period', value: 'utility.steam.daysInPeriod' },
      { name: 'Steam Average Daily', value: 'utility.steam.avgDaily' }
      // ,
      // {
      //   name: 'Steam Average Annual Energy',
      //   value: 'utility.steam.averageAnnualEnergy'
      // },
      // {
      //   name: 'Steam Average Annual Cost',
      //   value: 'utility.steam.averageAnnualCost'
      // }
    ]
  },
  {
    name: 'Fuel Oil 2',
    value: 'fuelOil2',
    subFields: [
      {
        name: 'Fuel Oil 2 Average Usage',
        value: 'utility.fuelOil2.totalUsage'
      },
      {
        name: 'Fuel Oil 2 Average Usage Cost',
        value: 'utility.fuelOil2.totalUsageCost'
      },
      {
        name: 'Fuel Oil 2 $/Square Foot',
        value: 'utility.fuelOil2.costPerSquareFoot'
      },
      {
        name: 'Fuel Oil 2 Days in Period',
        value: 'utility.fuelOil2.daysInPeriod'
      },
      { name: 'Fuel Oil 2 Average Daily', value: 'utility.fuelOil2.avgDaily' }
      // ,
      // {
      //   name: 'Fuel Oil 2 Average Annual Energy',
      //   value: 'utility.fuelOil2.averageAnnualEnergy'
      // },
      // {
      //   name: 'Fuel Oil 2 Average Annual Cost',
      //   value: 'utility.fuelOil2.averageAnnualCost'
      // }
    ]
  },
  {
    name: 'Fuel Oil 4',
    value: 'fuelOil4',
    subFields: [
      {
        name: 'Fuel Oil 4 Average Usage',
        value: 'utility.fuelOil4.totalUsage'
      },
      {
        name: 'Fuel Oil 4 Average Usage Cost',
        value: 'utility.fuelOil4.totalUsageCost'
      },
      {
        name: 'Fuel Oil 4 $/Square Foot',
        value: 'utility.fuelOil4.costPerSquareFoot'
      },
      {
        name: 'Fuel Oil 4 Days in Period',
        value: 'utility.fuelOil4.daysInPeriod'
      },
      { name: 'Fuel Oil 4 Average Daily', value: 'utility.fuelOil4.avgDaily' }
      // ,
      // {
      //   name: 'Fuel Oil 4 Average Annual Energy',
      //   value: 'utility.fuelOil4.averageAnnualEnergy'
      // },
      // {
      //   name: 'Fuel Oil 4 Average Annual Cost',
      //   value: 'utility.fuelOil4.averageAnnualCost'
      // }
    ]
  },
  {
    name: 'Fuel Oil 5 & 6',
    value: 'fuelOil56',
    subFields: [
      {
        name: 'Fuel Oil 5 & 6  Usage',
        value: 'utility.fuelOil56.totalUsage'
      },
      {
        name: 'Fuel Oil 5 & 6 Average Usage Cost',
        value: 'utility.fuelOil56.totalUsageCost'
      },
      {
        name: 'Fuel Oil 5 & 6 $/Square Foot',
        value: 'utility.fuelOil56.costPerSquareFoot'
      },
      {
        name: 'Fuel Oil 5 & 6 Days in Period',
        value: 'utility.fuelOil56.daysInPeriod'
      },
      {
        name: 'Fuel Oil 5 & 6 Average Daily',
        value: 'utility.fuelOil56.avgDaily'
      }
      // ,
      // {
      //   name: 'Fuel Oil 5 & 6 Average Annual Energy',
      //   value: 'utility.fuelOil56.averageAnnualEnergy'
      // },
      // {
      //   name: 'Fuel Oil 5 & 6 Average Annual Cost',
      //   value: 'utility.fuelOil56.averageAnnualCost'
      // }
    ]
  },
  {
    name: 'Diesel',
    value: 'diesel',
    subFields: [
      {
        name: 'Diesel Average Usage',
        value: 'utility.diesel.totalUsage'
      },
      {
        name: 'Diesel Average Usage Cost',
        value: 'utility.diesel.totalUsageCost'
      },
      {
        name: 'Diesel $/Square Foot',
        value: 'utility.diesel.costPerSquareFoot'
      },
      { name: 'Diesel Days in Period', value: 'utility.diesel.daysInPeriod' },
      { name: 'Diesel Average Daily', value: 'utility.diesel.avgDaily' }
      // ,{
      //   name: 'Diesel Average Annual Energy',
      //   value: 'utility.diesel.averageAnnualEnergy'
      // },
      // {
      //   name: 'Diesel Average Annual Cost',
      //   value: 'utility.diesel.averageAnnualCost'
      // }
    ]
  },
  {
    name: 'Others',
    value: 'otherFuel',
    subFields: [
      {
        name: 'Others Average Usage',
        value: 'utility.otherFuel.totalUsage'
      },
      {
        name: 'Others Average Usage Cost',
        value: 'utility.otherFuel.totalUsageCost'
      },
      {
        name: 'Others $/Square Foot',
        value: 'utility.otherFuel.costPerSquareFoot'
      },
      {
        name: 'Others Days in Period',
        value: 'utility.otherFuel.daysInPeriod'
      },
      { name: 'Others Average Daily', value: 'utility.otherFuel.avgDaily' }
      // ,{
      //   name: 'Others Average Annual Energy',
      //   value: 'utility.otherFuel.averageAnnualEnergy'
      // },
      // {
      //   name: 'Others Average Annual Cost',
      //   value: 'utility.otherFuel.averageAnnualCost'
      // }
    ]
  }
]

export const ContactFields = [
  { name: 'Title', value: 'title' },
  { name: 'First Name', value: 'firstName' },
  { name: 'Last Name', value: 'lastName' },
  { name: 'Company', value: 'company' },
  { name: 'Role', value: 'role' },
  { name: 'Phone Number', value: 'phoneNumber' },
  { name: 'Email Address', value: 'emailAddress' },
  { name: 'Qualification', value: 'qualification' },
  { name: 'Certificate Number', value: 'certificateNumber' },
  { name: 'Expiration Date', value: 'expirationDate' },
  { name: 'Years Of Experience', value: 'yearsOfExperience' }
]

export const DataUserFields = [
  { name: 'Name', value: 'user.name' },
  { name: 'Email', value: 'user.email' },
  { name: 'Current Organization', value: 'user.currentOrganizationName' },
  { name: 'Phone Number', value: 'user.phoneNumber' },
  { name: 'Bio', value: 'user.bio' }
]

export const DataBuildingFields = [
  { name: 'Building Name', value: 'building.buildingName' },
  { name: 'Primary Use', value: 'building.buildingUse' },
  { name: 'Open 24/7', value: 'building.open247' },
  { name: 'Year Built', value: 'building.buildYear' },
  { name: 'Number of Above Grade Floors', value: 'building.floorCount' },
  {
    name: 'Number of Below Grade Floors',
    value: 'building.belowGradeFloorCount'
  },
  { name: 'Square Footage', value: 'building.squareFeet' },
  { name: 'Country', value: 'building.location.country' },
  { name: 'Address', value: 'building.location.address' },
  { name: 'City', value: 'building.location.city' },
  { name: 'State/Province', value: 'building.location.state' },
  { name: 'Postal Code', value: 'building.location.zipCode' },
  { name: 'Client', value: 'building.clientName' },
  { name: 'Site', value: 'building.siteName' },
  { name: 'Borough', value: 'building.nycFields.borough' },
  { name: 'Block', value: 'building.nycFields.block' },
  { name: 'Tax Lot', value: 'building.nycFields.taxLot' },
  { name: 'BIN', value: 'building.nycFields.bin' },
  { name: 'EER', value: 'building.nycFields.eer' },
  { name: 'Building Use List', value: 'building.useList' },
  { name: 'Use List with Square Footage', value: 'building.listSquareFeet' }
]

export const MeasureFields = [
  { name: 'Measure Cost', value: 'measure.project_cost' },
  { name: 'Annual Savings', value: 'measure.annual_savings' },
  { name: 'Energy Savings', value: 'measure.energy_savings' },
  { name: 'Electric Savings', value: 'measure.electric_savings' },
  { name: 'Natural Gas Savings', value: 'measure.gas_savings' },
  { name: 'Water Savings', value: 'measure.water_savings' },
  { name: 'GHG Savings', value: 'measure.ghg' },
  { name: 'GHG Cost', value: 'measure.ghg_cost' },
  { name: 'Demand Savings', value: 'measure.demand' },
  { name: 'Simple Payback', value: 'measure.simple_payback' },
  { name: 'Payback Period Range', value: 'measure.simple_payback_range' },
  { name: 'Total Incentive', value: 'measure.incentive' },
  { name: 'Sales Margin Equivalency', value: 'measure.sales_margin' },
  { name: 'Vehicles Driven Equivalency', value: 'measure.vehiclesDriven' },
  { name: 'Oil Barrels Equivalency', value: 'measure.oilBarrelsConsumed' },
  { name: 'Rail Cars of Coal Equivalency', value: 'measure.coalRailcarsBurned' }
]

export const ReportingFields = [
  { name: "Today's Date", value: 'report.createdDate' },
  { name: 'Start Date', value: 'report.startDate' },
  { name: 'End Date', value: 'report.endDate' }
]
