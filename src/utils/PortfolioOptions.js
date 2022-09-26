// Buildings

export const BuildingFilterOptions = [
  {
    name: 'Organization',
    value: 'Organization',
    subFields: [
      {
        name: 'Organization Name',
        label: 'Organization Name',
        value: 'organization.name',
        select: 'multiSelect',
        tab: 'building'
      }
    ]
  },
  {
    name: 'Property',
    value: 'info',
    subFields: [
      {
        name: 'Primary Use',
        label: 'Primary Use',
        value: 'buildinguse',
        select: 'multiSelect',
        paramName: 'building_usetype',
        tab: 'building'
      },
      // {
      //   name: 'Building Secondary Types',
      //   label: 'Building Seconardy Use',
      //   value: 'buildingUseTypes.use',
      //   select: 'multiSelect',
      //   tab: 'building'
      // },
      {
        name: 'Gross Floor Area',
        label: 'Gross Floor Area',
        value: 'squarefeet',
        select: 'range',
        tab: 'building',
        unit: 'ft\u00B2',
        paramName: 'gross_floor_area'
      },
      // {
      //   name: 'Secondary Use Type Area',
      //   label: 'Secondary Use Type Area',
      //   value: 'buildingUseTypes.squarefeet',
      //   select: 'range',
      //   tab: 'building',
      //   unit: 'ft\u00B2'
      // },
      {
        name: 'Above Grade Floors',
        label: 'Above Grade Floors',
        value: 'floorcount',
        select: 'range',
        tab: 'building'
      },
      {
        name: 'Below Grade Floors',
        label: 'Below Grade Floors',
        value: 'belowgradefloorcount',
        select: 'range',
        tab: 'building'
      },
      {
        name: 'Year Built',
        label: 'Year Built',
        value: 'buildyear',
        select: 'yearRange',
        tab: 'building',
        paramName: 'year_built'
      },
      // {
      //   name: 'Created',
      //   label: 'Created',
      //   value: 'created',
      //   select: 'yearRange',
      //   tab: 'building'
      // },
      // {
      //   name: 'Updated',
      //   label: 'Updated',
      //   value: 'updated',
      //   select: 'yearRange',
      //   tab: 'building'
      // },
      // {
      //   name: 'Client Name',
      //   label: 'Client Name',
      //   value: 'clientname',
      //   select: 'multiSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Site Name',
      //   label: 'Site Name',
      //   value: 'sitename',
      //   select: 'multiSelect',
      //   tab: 'building'
      // },
      {
        name: 'City',
        label: 'City',
        value: 'location_city',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'city'
      },
      {
        name: 'State/Province',
        label: 'State/Province',
        value: 'location_state',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'state'
      },
      {
        name: 'Zip Code',
        label: 'Zip Code',
        value: 'location_zipcode',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'zip_code'
      },
      // {
      //   name: 'Open 24/7',
      //   label: 'Open 24/7',
      //   value: 'open247',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      {
        name: 'Borough',
        label: 'Borough',
        value: 'nycfields_borough',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'borough'
      },
      // {
      //   name: 'Historic Building',
      //   label: 'Historic Building',
      //   value: 'nycfields_historicbuilding',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Multi-Tenant',
      //   label: 'Multi-Tenant',
      //   value: 'nycfields_multitenant',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Percent Leased',
      //   label: 'Percent Leased',
      //   value: 'nycfields_percentleased',
      //   select: 'range',
      //   tab: 'building'
      // },
      // {
      //   name: 'Percent Owned',
      //   label: 'Percent Owned',
      //   value: 'nycfields_percentowned',
      //   select: 'range',
      //   tab: 'building'
      // },
      // {
      //   name: 'Shared Energy on Multiple Lots',
      //   label: 'Shared Energy on Multiple Lots',
      //   value: 'nycfields_energy_sys_multiple_lots',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Shared Energy on Singe Lot',
      //   label: 'Shared Energy on Singe Lot',
      //   value: 'nycfields_energy_sys_single_lotst',
      //   select: 'singleSelect',
      //   tab: 'building'
      // }
      {
        name: 'Created By',
        label: 'Created By',
        value: 'building.createdBy.id',
        select: 'multiSelect',
        tab: 'building'
      },
      {
        name: 'Created',
        label: 'Created',
        value: 'building.created',
        select: 'dateRange',
        tab: 'building'
      },
      {
        name: 'Updated',
        label: 'Updated',
        value: 'building.updated',
        select: 'dateRange',
        tab: 'building'
      }
    ]
  },
  // {
  // 	name: 'Overview',
  // 	value: 'overview',
  // 	subFields: [
  // 		// {
  // 		//   name: 'Annual Energy Use',
  // 		//   label: 'Annual Energy Use',
  // 		//   value: 'monthlyUtilities.annual_energy_use',
  // 		//   select: 'range',
  // 		//   timeDepends: true,
  // 		//   tab: 'building',
  // 		//   unit: 'MMBTU'
  // 		// },
  // 	],
  // },
  {
    name: 'Energy Use',
    value: 'Energy Use',
    subFields: [
      {
        name: 'Energy Use Intensity',
        label: 'Energy Use Intensity',
        value: 'monthlyUtilities.energy_use_intensity',
        select: 'range',
        timeDepends: true,
        tab: 'building',
        unit: 'kBtu/ft\u00B2',
        paramName: 'energyuse_intensity'
      },
      {
        name: 'Energy Star Score',
        label: 'Energy Star Score',
        value: 'buildingPmScores.score',
        select: 'range',
        tab: 'building',
        paramName: 'energy_star_score'
      },
      {
        name: 'Annual Electricity Use',
        label: 'Annual Electricity Use',
        value: 'monthlyUtilities.annual_electricity_use',
        select: 'range',
        tab: 'building',
        unit: 'kWh',
        paramName: 'electric_use'
      },
      {
        name: 'Annual Electricity Demand Use',
        label: 'Annual Electricity Demand Use',
        value: 'monthlyUtilities.annual_electricity_demand_use',
        select: 'range',
        tab: 'building',
        unit: 'kW',
        paramName: 'electric_demand_use'
      },
      {
        name: 'Annual Natural Gas Use',
        label: 'Annual Natural Gas Use',
        value: 'monthlyUtilities.annual_natural_gas_use',
        select: 'range',
        tab: 'building',
        unit: 'therms',
        paramName: 'natural_gas_use'
      },
      {
        name: 'Annual Fuel Oil 2 Use',
        label: 'Annual Fuel Oil 2 Use',
        value: 'monthlyUtilities.annual_fuel_oil2_use',
        select: 'range',
        tab: 'building',
        unit: 'gals',
        paramName: 'fuel_oil2_use'
      },
      {
        name: 'Annual Fuel Oil 4 Use',
        label: 'Annual Fuel Oil 4 Use',
        value: 'monthlyUtilities.annual_fuel_oil4_use',
        select: 'range',
        tab: 'building',
        unit: 'gals',
        paramName: 'fuel_oil4_use'
      },
      {
        name: 'Annual Fuel Oil 5 & 6 Use',
        label: 'Annual Fuel Oil 5 & 6 Use',
        value: 'monthlyUtilities.annual_fuel_oil56_use',
        select: 'range',
        tab: 'building',
        unit: 'gals',
        paramName: 'fuel_oil56_use'
      },
      {
        name: 'Annual Steam Use',
        label: 'Annual Steam Use',
        value: 'monthlyUtilities.annual_steam_use',
        select: 'range',
        tab: 'building',
        unit: 'Mlb',
        paramName: 'steam_use'
      },
      {
        name: 'Annual Diesel Use',
        label: 'Annual Diesel Use',
        value: 'monthlyUtilities.annual_diesel_use',
        select: 'range',
        tab: 'building',
        unit: 'gals'
      }
    ]
  },
  {
    name: 'Energy Cost',
    value: 'Energy Cost',
    subFields: [
      {
        name: 'Annual Energy Cost',
        label: 'Annual Energy Cost',
        value: 'monthlyUtilities.annual_energy_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'annual_cost'
      },
      {
        name: 'Energy Cost Intensity',
        label: 'Energy Cost Intensity',
        value: 'monthlyUtilities.energy_cost_intensity',
        select: 'costRange',
        tab: 'building',
        unit: '$/ft\u00B2',
        paramName: 'energycost_intensity'
      },
      {
        name: 'Annual Electricity Cost',
        label: 'Annual Electricity Cost',
        value: 'monthlyUtilities.annual_electricity_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'electric_cost'
      },
      {
        name: 'Annual Electricity Demand Cost',
        label: 'Annual Electricity Demand Cost',
        value: 'monthlyUtilities.annual_electricity_demand_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'electric_demand_cost'
      },
      {
        name: 'Annual Natural Gas Cost',
        label: 'Annual Natural Gas Cost',
        value: 'monthlyUtilities.annual_natural_gas_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'natural_gas_cost'
      },
      {
        name: 'Annual Fuel Oil 2 Cost',
        label: 'Annual Fuel Oil 2 Cost',
        value: 'monthlyUtilities.annual_fuel_oil2_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'fuel_oil2_cost'
      },
      {
        name: 'Annual Fuel Oil 4 Cost',
        label: 'Annual Fuel Oil 4 Cost',
        value: 'monthlyUtilities.annual_fuel_oil4_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'fuel_oil4_cost'
      },
      {
        name: 'Annual Fuel Oil 5 & 6 Cost',
        label: 'Annual Fuel Oil 5 & 6 Cost',
        value: 'monthlyUtilities.annual_fuel_oil56_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'fuel_oil56_cost'
      },
      {
        name: 'Annual Steam Cost',
        label: 'Annual Steam Cost',
        value: 'monthlyUtilities.annual_steam_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'steam_cost'
      },
      {
        name: 'Annual Diesel Cost',
        label: 'Annual Diesel Cost',
        value: 'monthlyUtilities.annual_diesel_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Electricity Rate',
        label: 'Electricity Rate',
        value: 'rates_electric',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Natural Gas Rate',
        label: 'Natural Gas Rate',
        value: 'rates_gas',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Water Rate',
        label: 'Water Rate',
        value: 'rates_water',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Fuel Oil 2 Rate',
        label: 'Fuel Oil 2 Rate',
        value: 'rates_fueloil2',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Fuel Oil 4 Rate',
        label: 'Fuel Oil 4 Rate',
        value: 'rates_fueloil4',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Fuel Oil 5 & 6 Rate',
        label: 'Fuel Oil 5 & 6 Rate',
        value: 'rates_fueloil56',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Steam Rate',
        label: 'Steam Rate',
        value: 'rates_steam',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Diesel Rate',
        label: 'Diesel Rate',
        value: 'rates_diesel',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      }
    ]
  },
  {
    name: 'GHG Emissions',
    value: 'GHG Emissions',
    subFields: [
      {
        name: 'Annual GHG Emissions',
        label: 'Annual GHG Emissions',
        value: 'monthlyUtilities.annual_ghg_emissions',
        select: 'range',
        paramName: 'ghg_emission',
        tab: 'building',
        unit: 'mtCO2e'
      },
      {
        name: 'GHG Intensity',
        label: 'GHG Intensity',
        value: 'monthlyUtilities.ghg_intensity',
        select: 'range',
        tab: 'building',
        unit: 'mtCO2e/ft\u00B2',
        paramName: 'ghg_intensity'
      }
    ]
  },
  {
    name: 'Water Cost & Use',
    value: 'Water Cost & Use',
    subFields: [
      {
        name: 'Annual Water Use',
        label: 'Annual Water Use',
        value: 'monthlyUtilities.annual_water_use',
        select: 'range',
        tab: 'building',
        unit: 'ccf'
      },
      {
        name: 'Water Use Intensity',
        label: 'Water Use Intensity',
        value: 'monthlyUtilities.water_use_intensity',
        select: 'range',
        tab: 'building',
        unit: 'ccf/ft\u00B2'
      },
      {
        name: 'Annual Water Cost',
        label: 'Annual Water Cost',
        value: 'monthlyUtilities.annual_water_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      }
    ]
  },
  {
    name: 'Measure',
    value: 'Measure',
    subFields: [
      {
        name: 'Measure Name',
        label: 'Measure Name',
        value: 'displayname',
        select: 'multiSelect',
        paramName: 'measure_name',
        tab: 'project'
      },
      {
        name: 'Measure Cost',
        label: 'Measure Cost',
        value: 'metric_projectcost',
        select: 'range',
        paramName: 'measure_cost',
        tab: 'project',
        unit: '$'
      },
      {
        name: 'Measure Application',
        label: 'Measure Application',
        value: 'project_application',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Measure Category',
        label: 'Measure Category',
        value: 'project_category',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Measure Technology',
        label: 'Measure Technology',
        value: 'project_technology',
        select: 'multiSelect',
        tab: 'project'
      },
      // {
      //   name: 'Incentive',
      //   label: 'Incentive',
      //   value: 'runresults_utility_incentive',
      //   select: 'range',
      //   tab: 'project',
      //   unit: '$'
      // },
      {
        name: 'Energy Cost Savings',
        label: 'Energy Cost Savings',
        value: 'metric_annualsavings',
        select: 'range',
        paramName: 'cost_savings',
        tab: 'project',
        unit: '$'
      },
      {
        name: 'Natural Gas Reduction',
        label: 'Natural Gas Reduction',
        value: 'runresults_energy_savings_gas',
        select: 'range',
        paramName: 'natural_gas_reduction',
        tab: 'project',
        unit: 'therms'
      },
      // {
      //   name: 'GHG Saving',
      //   label: 'GHG Saving',
      //   value: 'runresults_ghg',
      //   select: 'range',
      //   tab: 'project',
      //   unit: 'mtCO2e'
      // },
      {
        name: '$/GHG Reduction',
        label: '$/GHG Reduction',
        value: 'runresults_ghg_cost',
        select: 'range',
        tab: 'project',
        paramName: 'ghg_emissions',
        unit: '$/mtCO2e'
      },
      {
        name: 'Electricity Demand Savings',
        label: 'Electricity Demand Savings',
        value: 'runresults_energy_savings_demand',
        select: 'range',
        tab: 'project',
        unit: 'kWh'
      },
      {
        name: 'Electricity Savings',
        label: 'Electricity Savings',
        value: 'metric_electricsavings',
        select: 'range',
        unit: 'kWh',
        tab: 'project',
        paramName: 'electric_reduction'
      },
      // {
      //   name: 'Maintenance Savings',
      //   label: 'Maintenance Savings',
      //   value: 'initialvalues_maintenance_savings',
      //   select: 'range',
      //   tab: 'project',
      //   unit: '$'
      // },
      // {
      //   name: 'Simple Payback',
      //   label: 'Simple Payback',
      //   value: 'metric_simple_payback',
      //   select: 'range',
      //   tab: 'project',
      //   unit: 'yrs'
      // },
      {
        name: 'Status',
        label: 'Status',
        value: 'status',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Type',
        label: 'Type',
        value: 'type',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Created By',
        label: 'Created By',
        value: 'building.createdBy.id',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Created',
        label: 'Created',
        value: 'project.created',
        select: 'dateRange',
        tab: 'project'
      },
      {
        name: 'Updated',
        label: 'Updated',
        value: 'project.updated',
        select: 'dateRange',
        tab: 'project'
      }
      // {
      //   name: 'Project Name',
      //   label: 'Project Name',
      //   value: 'project_name',
      //   select: 'multiSelect',
      //   tab: 'project'
      // },
      // {
      //   name: 'Effective Useful Life',
      //   label: 'Effective Useful Life',
      //   value: 'runresults_energy_savings_eul',
      //   select: 'range',
      //   tab: 'project',
      //   unit: 'yrs'
      // },
    ]
  },
  {
    name: 'Project',
    value: 'ProjectPackage',
    subFields: [
      {
        name: 'Project Name',
        label: 'Project Name',
        value: 'name',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Status',
        label: 'Status',
        value: 'status',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Construction Status',
        label: 'Construction Status',
        value: 'constructionstatus',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Energy Cost Savings',
        label: 'Energy Cost Savings',
        value: 'total_annualsavings',
        select: 'range',
        unit: '$',
        tab: 'projectPackage'
      },
      {
        name: 'Energy Savings',
        label: 'Energy Savings',
        value: 'total_energysavings',
        select: 'range',
        unit: 'kBtu',
        tab: 'projectPackage'
      },
      {
        name: 'Electricity Savings',
        label: 'Electricity Savings',
        value: 'total_electric',
        select: 'range',
        unit: 'kWh',
        tab: 'projectPackage'
      },
      {
        name: 'Electricity Demand Savings',
        label: 'Electricity Demand Savings',
        value: 'total_demandsavings',
        unit: 'kWh',
        select: 'range',
        tab: 'projectPackage'
      },
      {
        name: 'Natural Gas Reduction',
        label: 'Natural Gas Reduction',
        value: 'total_gassavings',
        select: 'range',
        unit: 'therms',
        tab: 'projectPackage'
      },
      // {
      // 	name: 'Water Savings',
      // 	label: 'Water Savings',
      // 	value: 'total_watersavings',
      // 	select: 'range',
      // 	unit: 'ccf',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'GHG Savings',
      // 	label: 'GHG Savings',
      // 	value: 'total_ghgsavings',
      // 	select: 'range',
      // 	unit: 'mtCO2e',
      // 	tab: 'projectPackage',
      // },
      {
        name: '$/GHG Reduction',
        label: '$/GHG Reduction',
        value: 'total_ghgsavingscost',
        select: 'range',
        unit: '$ /mtCO2e',
        tab: 'projectPackage'
      },
      {
        name: 'Project Cost',
        label: 'Project Cost',
        value: 'total_projectcost',
        select: 'costRange',
        unit: '$',
        tab: 'projectPackage'
      },
      // {
      // 	name: 'Incentive',
      // 	label: 'Incentive',
      // 	value: 'total_incentive',
      // 	select: 'costRange',
      // 	unit: '$',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'Maintenance Savings',
      // 	label: 'Maintenance Savings',
      // 	value: 'total_maintenancesavings',
      // 	select: 'costRange',
      // 	unit: '$',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'ROI',
      // 	label: 'ROI',
      // 	value: 'total_roi',
      // 	select: 'range',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'Simple Payback',
      // 	label: 'Simple Payback',
      // 	value: 'total_simplepayback',
      // 	select: 'range',
      // 	unit: 'yrs',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'NPV',
      // 	label: 'NPV',
      // 	value: 'total_npv',
      // 	select: 'range',
      // 	unit: 'yrs',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'SIR',
      // 	label: 'SIR',
      // 	value: 'total_sir',
      // 	select: 'range',
      // 	tab: 'projectPackage',
      // },
      {
        name: 'Effective Useful Life',
        label: 'Effective Useful Life',
        value: 'total_eul',
        select: 'range',
        unit: 'yrs',
        tab: 'projectPackage'
      },
      {
        name: 'Created By',
        label: 'Created By',
        value: 'building.createdBy.id',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Created',
        label: 'Created',
        value: 'project.created',
        select: 'dateRange',
        tab: 'projectPackage'
      },
      {
        name: 'Updated',
        label: 'Updated',
        value: 'project.updated',
        select: 'dateRange',
        tab: 'projectPackage'
      }
    ]
  }
]

export const buildingColumnOptions = [
  {
    name: 'Property',
    value: 'info',
    subFields: [
      {
        value: 'buildingname',
        label: 'Name',
        option: 'left',
        order: 1
      },
      {
        value: 'location_address',
        label: 'Address',
        option: 'left',
        order: 3
      },
      {
        value: 'location_city',
        label: 'City',
        option: 'left',
        order: 4
      },
      {
        value: 'location_state',
        label: 'State/ Province',
        option: 'left',
        order: 5
      },
      {
        value: 'location_zipcode',
        label: 'Zip Code',
        option: 'left',
        order: 6
      },
      {
        value: 'clientname',
        label: 'Client Name',
        option: 'left',
        order: 58
      },
      {
        label: 'Primary Use',
        value: 'buildinguse',
        option: 'left',
        order: 8
      },
      {
        label: 'Secondary Use Types',
        value: 'buildingUseTypes.use',
        option: 'left',
        order: 19
      },
      {
        name: 'Gross Floor Area',
        label: 'Gross Floor Area',
        value: 'squarefeet',
        unit: 'ft\u00B2',
        order: 9,
        total: true
      },
      {
        label: 'Secondary Use Type Area',
        value: 'buildingUseTypes.squarefeet',
        option: 'left',
        unit: 'ft\u00B2',
        order: 20
      },
      {
        label: 'Above Grade Floors',
        value: 'floorcount',
        option: 'right',
        order: 10
      },
      {
        label: 'Below Grade Floors',
        value: 'belowgradefloorcount',
        option: 'right',
        order: 11
      },
      {
        label: 'Year Built',
        value: 'buildyear',
        option: 'left',
        order: 12
      },
      {
        label: 'Total Cost Saving',
        value: 'totalCostSaving',
        option: 'right',
        unit: '$'
      },
      {
        label: 'Organization Name',
        value: 'organization.name',
        option: 'left',
        order: 2
      },
      {
        value: 'sitename',
        label: 'Site Name',
        option: 'left',
        order: 57
      },
      {
        value: 'open247',
        label: 'Open 24/7',
        option: 'left',
        order: 55
      },
      {
        value: 'nycfields_bin',
        label: 'Bin',
        option: 'left'
      },
      {
        value: 'nycfields_taxlot',
        label: 'Tax Lot',
        option: 'left'
      },
      {
        value: 'nycfields_block',
        label: 'Block',
        option: 'left'
      },
      {
        value: 'nycfields_borough',
        label: 'Borough',
        option: 'left',
        order: 7
      },
      {
        value: 'nycfields_historicbuilding',
        label: 'Historic Building',
        option: 'left',
        order: 49
      },
      {
        value: 'nycfields_multitenant',
        label: 'Multi-Tenant',
        option: 'left',
        order: 50
      },
      {
        value: 'nycfields_percentleased',
        label: 'Percent Leased',
        option: 'left',
        order: 51
      },
      {
        value: 'nycfields_percentowned',
        label: 'Percent Owned',
        option: 'left',
        order: 52
      },
      {
        value: 'nycfields_energy_sys_multiple_lots',
        label: 'Shared Energy on Multiple Lots',
        option: 'left',
        order: 53
      },
      {
        value: 'nycfields_energy_sys_single_lotst',
        label: 'Shared Energy on Single Lot',
        option: 'left',
        order: 54
      }
    ]
  },
  {
    name: 'Utilities',
    value: 'utilities',
    subFields: [
      {
        label: 'Annual Electricity Use',
        value: 'monthlyUtilities.annual_electricity_use',
        option: 'right',
        unit: 'kWh',
        order: 15,
        timeDepends: true,
        total: true
      },
      {
        label: 'Annual Electricity Cost',
        value: 'monthlyUtilities.annual_electricity_cost',
        option: 'right',
        unit: '$',
        order: 16,
        timeDepends: true,
        total: true
      },
      // {
      //   label: 'Electricity Rate',
      //   value: 'rates_electric',
      //   option: 'right',
      //   unit: '$',
      //   order: 24
      // },
      {
        label: 'Avg. Annual Electricity Demand Use',
        value: 'monthlyUtilities.annual_electricity_demand_use',
        option: 'left',
        unit: 'kW',
        order: 18,
        timeDepends: true,
        total: true
      },
      {
        label: 'Avg. Annual Electricity Demand Cost',
        value: 'monthlyUtilities.annual_electricity_demand_cost',
        option: 'left',
        unit: '$',
        order: 19,
        timeDepends: true,
        total: true
      },
      {
        label: 'Avg. Annual Natural Gas Use',
        value: 'monthlyUtilities.annual_natural_gas_use',
        option: 'left',
        unit: 'therms',
        order: 20,
        timeDepends: true,
        total: true
      },
      {
        label: 'Avg. Annual Natural Gas Cost',
        value: 'monthlyUtilities.annual_natural_gas_cost',
        option: 'left',
        unit: '$',
        order: 21,
        timeDepends: true,
        total: true
      },
      // {
      //   label: 'Natural Gas Rate',
      //   value: 'rates_gas',
      //   option: 'left',
      //   unit: '$',
      //   order: 29
      // },
      // {
      //   label: 'Water Rate',
      //   value: 'rates_water',
      //   option: 'left',
      //   unit: '$',
      //   order: 33
      // },
      {
        label: 'Avg. Annual Fuel Oil 2 Use',
        value: 'monthlyUtilities.annual_fuel_oil2_use',
        option: 'left',
        unit: 'gals',
        timeDepends: true,
        total: true,
        order: 27
      },
      {
        label: 'Avg. Annual Fuel Oil 2 Cost',
        value: 'monthlyUtilities.annual_fuel_oil2_cost',
        option: 'left',
        unit: '$',
        timeDepends: true,
        total: true,
        order: 28
      },
      // {
      //   label: 'Fuel Oil 2 Rate',
      //   value: 'rates_fueloil2',
      //   option: 'left',
      //   unit: '$',
      //   order: 36
      // },
      {
        label: 'Avg. Annual Fuel Oil 4 Use',
        value: 'monthlyUtilities.annual_fuel_oil4_use',
        option: 'left',
        unit: 'gals',
        timeDepends: true,
        total: true,
        order: 30
      },
      {
        label: 'Avg. Annual Fuel Oil 4 Cost',
        value: 'monthlyUtilities.annual_fuel_oil4_cost',
        option: 'left',
        unit: '$',
        timeDepends: true,
        total: true,
        order: 31
      },
      // {
      //   label: 'Fuel Oil 4 Rate',
      //   value: 'rates_fueloil4',
      //   option: 'left',
      //   unit: '$',
      //   order: 39
      // },
      {
        label: 'Avg. Annual Fuel Oil 5 & 6 Use',
        value: 'monthlyUtilities.annual_fuel_oil56_use',
        option: 'left',
        unit: 'gals',
        timeDepends: true,
        total: true,
        order: 33
      },
      {
        label: 'Avg. Annual Fuel Oil 5 & 6 Cost',
        value: 'monthlyUtilities.annual_fuel_oil56_cost',
        option: 'left',
        unit: '$',
        timeDepends: true,
        total: true,
        order: 34
      },
      // {
      //   label: 'Fuel Oil 5 & 6 Rate',
      //   value: 'rates_fueloil56',
      //   option: 'left',
      //   unit: '$',
      //   order: 42
      // },
      {
        label: 'Avg. Annual Steam Use',
        value: 'monthlyUtilities.annual_steam_use',
        option: 'left',
        unit: 'Mlb',
        timeDepends: true,
        total: true,
        order: 36
      },
      {
        label: 'Avg. Annual Steam Cost',
        value: 'monthlyUtilities.annual_steam_cost',
        option: 'left',
        unit: '$',
        timeDepends: true,
        total: true,
        order: 37
      },
      // {
      //   label: 'Steam Rate',
      //   value: 'rates_steam',
      //   option: 'left',
      //   unit: '$',
      //   order: 45
      // },
      {
        label: 'Avg. Annual Diesel Use',
        value: 'monthlyUtilities.annual_diesel_use',
        option: 'left',
        unit: 'gals',
        timeDepends: true,
        total: true,
        order: 39
      },
      {
        label: 'Avg. Annual Diesel Cost',
        value: 'monthlyUtilities.annual_diesel_cost',
        option: 'left',
        unit: '$',
        timeDepends: true,
        total: true,
        order: 40
      },
      // {
      //   label: 'Diesel Rate',
      //   value: 'rates_diesel',
      //   option: 'left',
      //   unit: '$',
      //   order: 48
      // }
      {
        label: 'Avg. Annual Water Use',
        value: 'monthlyUtilities.annual_water_use',
        option: 'left',
        unit: 'ccf',
        order: 42,
        timeDepends: true
      },
      {
        label: 'Water Use Intensity',
        value: 'monthlyUtilities.water_use_intensity',
        option: 'left',
        unit: 'ccf/ft\u00B2',
        order: 43,
        timeDepends: true
      },
      {
        label: 'Avg. Annual Water Cost',
        value: 'monthlyUtilities.annual_water_cost',
        option: 'left',
        unit: '$',
        order: 44,
        timeDepends: true,
        total: true
      }
    ]
  },
  {
    name: 'Overview',
    value: 'overview',
    subFields: [
      {
        label: 'Avg. Annual Energy Use',
        value: 'monthlyUtilities.annual_energy_use',
        option: 'right',
        unit: 'MMBTU',
        order: 14,
        timeDepends: true,
        total: true
      },
      {
        label: 'Avg. Energy Use Intensity',
        value: 'monthlyUtilities.energy_use_intensity',
        option: 'right',
        unit: 'kBtu/ft\u00B2',
        order: 13,
        timeDepends: true
      },
      {
        label: 'Avg. Annual Energy Cost',
        value: 'monthlyUtilities.annual_energy_cost',
        option: 'right',
        unit: '$',
        order: 15,
        timeDepends: true,
        total: true
      },
      {
        label: 'Avg. Energy Cost Intensity',
        value: 'monthlyUtilities.energy_cost_intensity',
        option: 'right',
        unit: '$/ft\u00B2',
        order: 13,
        timeDepends: true
      },
      {
        label: 'Energy Star Score',
        value: 'buildingPmScores.score',
        option: 'right',
        order: 12
      },
      {
        label: 'Avg. Annual GHG Emissions',
        value: 'monthlyUtilities.annual_ghg_emissions',
        option: 'right',
        unit: 'mtCO2e',
        order: 16,
        timeDepends: true,
        total: true
      },
      {
        label: 'Avg. GHG Intensity',
        value: 'monthlyUtilities.ghg_intensity',
        option: 'right',
        unit: 'mtCO2e/ft\u00B2',
        order: 17,
        timeDepends: true
      }
    ]
  },
  {
    name: 'Measures',
    value: 'Projects',
    subFields: [
      {
        label: 'Measures',
        value: 'projects',
        option: 'right',
        total: true
      }
    ]
  },
  {
    name: 'Author',
    value: 'Author',
    subFields: [
      {
        label: 'Created',
        value: 'created'
      },
      {
        label: 'Updated',
        value: 'updated'
      },
      {
        value: 'createdBy.name',
        label: 'Author',
        option: 'left'
      }
    ]
  }
]

export const defaultBuildingColumn = [
  {
    value: 'buildingname',
    label: 'Name',
    option: 'left',
    order: 1
  },
  {
    value: 'organization.name',
    label: 'Organization Name',
    option: 'left',
    order: 2
  },
  {
    value: 'location_address',
    label: 'Address',
    option: 'left',
    order: 3
  },
  {
    value: 'location_city',
    label: 'City',
    option: 'left',
    order: 4
  },
  {
    value: 'location_state',
    label: 'State/ Province',
    option: 'left',
    order: 5
  },
  {
    value: 'location_zipcode',
    label: 'Zip Code',
    option: 'left',
    order: 6
  },
  {
    value: 'nycfields_borough',
    label: 'Borough',
    option: 'left',
    order: 7
  },
  {
    label: 'Primary Use',
    value: 'buildinguse',
    option: 'left',
    order: 8
  },
  {
    name: 'Gross Floor Area',
    label: 'Gross Floor Area',
    value: 'squarefeet',
    unit: 'ft\u00B2',
    order: 9,
    total: true
  },
  {
    label: 'Above Grade Floors',
    value: 'floorcount',
    option: 'right',
    order: 10
  },
  {
    label: 'Below Grade Floors',
    value: 'belowgradefloorcount',
    option: 'right',
    order: 11
  },
  {
    label: 'Year Built',
    value: 'buildyear',
    option: 'left',
    order: 12
  },
  {
    label: 'Energy Star Score',
    value: 'buildingPmScores.score',
    option: 'right',
    order: 13
  },
  {
    label: 'Avg. Energy Use Intensity',
    value: 'monthlyUtilities.energy_use_intensity',
    option: 'right',
    unit: 'kBtu/ft\u00B2',
    order: 14,
    timeDepends: true
  },
  {
    label: 'Avg. Annual Energy Use',
    value: 'monthlyUtilities.annual_energy_use',
    option: 'right',
    unit: 'MMBTU',
    order: 15,
    timeDepends: true,
    total: true
  },
  {
    label: 'Avg. Annual Energy Cost',
    value: 'monthlyUtilities.annual_energy_cost',
    option: 'right',
    unit: '$',
    order: 16,
    timeDepends: true,
    total: true
  },
  {
    label: 'Avg. Annual GHG Emissions',
    value: 'monthlyUtilities.annual_ghg_emissions',
    option: 'right',
    unit: 'mtCO2e',
    order: 17,
    timeDepends: true,
    total: true
  },
  {
    label: 'Avg. GHG Intensity',
    value: 'monthlyUtilities.ghg_intensity',
    option: 'right',
    unit: 'mtCO2e/ft\u00B2',
    order: 18,
    timeDepends: true
  },
  {
    label: 'Created',
    value: 'created',
    order: 19
  },
  {
    label: 'Updated',
    value: 'updated',
    order: 20
  },
  {
    value: 'createdBy.name',
    label: 'Author',
    option: 'left',
    order: 21
  }
]

// Projects -> Measures

export const defaultProjectColumn = [
  {
    value: 'displayname',
    label: 'Name',
    order: 1
  },
  {
    value: 'building.buildingname',
    label: 'Building Name',
    order: 2
  },
  {
    value: 'organization.name',
    label: 'Organization Name',
    order: 3
  },
  {
    name: 'Status',
    value: 'status',
    label: 'Status',
    order: 4
  },
  {
    name: 'Type',
    value: 'type',
    label: 'Type',
    order: 5
  },
  {
    name: 'Project Name',
    value: 'project_name',
    label: 'Project Name',
    order: 6
  },
  {
    name: 'Annual Cost Savings',
    label: 'Annual Cost Savings',
    value: 'metric_annualsavings',
    unit: '$',
    total: true,
    order: 7
  },
  {
    name: 'Energy Savings',
    label: 'Energy Savings',
    value: 'metric_energysavings',
    unit: 'kBtu',
    total: true,
    order: 8
  },
  {
    name: 'Electricity Savings',
    label: 'Electricity Savings',
    value: 'metric_electricsavings',
    unit: 'kWh',
    total: true,
    order: 9
  },
  {
    name: 'Demand Savings',
    label: 'Demand Savings',
    value: 'metric_demandsavings',
    unit: 'kW',
    total: true,
    order: 10
  },
  {
    name: 'Natural Gas Savings',
    label: 'Natural Gas Savings',
    value: 'metric_gassavings',
    unit: 'therms',
    total: true,
    order: 11
  },
  {
    name: 'GHG Saving',
    label: 'GHG Saving',
    value: 'metric_ghgsavings',
    unit: 'mtCO2e',
    total: true,
    order: 13
  },
  {
    name: 'GHG Savings Cost',
    label: 'GHG Savings Cost',
    value: 'metric_ghgsavingscost',
    unit: '$/mtCO2e',
    total: true,
    order: 14
  },
  {
    value: 'Measure Cost',
    label: 'Measure Cost',
    value: 'metric_projectcost',
    unit: '$',
    total: true,
    order: 15
  },
  {
    value: 'Incentive',
    label: 'Incentive',
    value: 'metric_incentive',
    unit: '$',
    total: true,
    order: 16
  },
  {
    name: 'Maintenance Savings',
    label: 'Maintenance Savings',
    value: 'initialvalues_maintenance_savings',
    unit: '$',
    total: true,
    order: 17
  },
  {
    name: 'Simple Payback',
    label: 'Simple Payback',
    value: 'metric_simple_payback',
    order: 18
  },
  {
    name: 'Rebate Code',
    label: 'Rebate Code',
    value: 'incentive_rebate_code',
    order: 23
  },
  {
    name: 'Measure Category',
    label: 'Measure Category',
    value: 'project_category'
  },
  {
    name: 'Measure Application',
    label: 'Measure Application',
    value: 'project_application'
  },
  {
    name: 'Measure Technology',
    label: 'Measure Technology',
    value: 'project_technology'
  },
  {
    name: 'Effective Useful Life',
    label: 'Effective Useful Life',
    value: 'metric_eul',
    unit: 'yrs',
    total: true
  },
  {
    name: 'updated',
    label: 'Updated',
    value: 'updated'
  },
  {
    name: 'created',
    label: 'Created',
    value: 'created'
  },
  {
    value: 'createdBy.name',
    label: 'Author',
    option: 'left'
  }
]

export const projectColumnOptions = [
  {
    name: 'Organization',
    value: 'Organization',
    subFields: [
      {
        value: 'organization.name',
        label: 'Organization Name',
        order: 3
      }
    ]
  },
  {
    name: 'Building',
    value: 'Building',
    subFields: [
      {
        value: 'building.buildingname',
        label: 'Building Name',
        order: 2
      }
    ]
  },
  {
    name: 'Measure',
    value: 'ProjectPackage',
    subFields: [
      {
        value: 'displayname',
        label: 'Name',
        order: 1
      },
      {
        name: 'Status',
        value: 'status',
        label: 'Status',
        order: 4
      },
      {
        name: 'Type',
        value: 'type',
        label: 'Type',
        order: 5
      },
      {
        name: 'Project Name',
        value: 'project_name',
        label: 'Project Name',
        order: 6
      },
      {
        value: 'Project Cost',
        label: 'Measure Cost',
        value: 'metric_projectcost',
        unit: '$',
        total: true,
        order: 14
      },
      {
        name: 'Measure Category',
        label: 'Measure Category',
        value: 'project_category'
      },
      {
        name: 'Measure Application',
        label: 'Measure Application',
        value: 'project_application'
      },
      {
        name: 'Measure Technology',
        label: 'Measure Technology',
        value: 'project_technology'
      },
      {
        value: 'Incentive',
        label: 'Incentive',
        value: 'metric_incentive',
        unit: '$',
        total: true,
        order: 15
      },
      {
        name: 'Annual Cost Savings',
        label: 'Annual Cost Savings',
        value: 'metric_annualsavings',
        unit: '$',
        total: true,
        order: 7
      },
      {
        name: 'Energy Savings',
        label: 'Energy Savings',
        value: 'metric_energysavings',
        unit: 'kBtu',
        total: true,
        order: 8
      },
      {
        name: 'Electricity Savings',
        label: 'Electricity Savings',
        value: 'metric_electricsavings',
        unit: 'kWh',
        total: true,
        order: 9
      },
      {
        name: 'Demand Savings',
        label: 'Demand Savings',
        value: 'metric_demandsavings',
        unit: 'kW',
        total: true,
        order: 10
      },
      {
        name: 'Natural Gas Savings',
        label: 'Natural Gas Savings',
        value: 'metric_gassavings',
        unit: 'therms',
        total: true,
        order: 11
      },
      {
        name: 'GHG Saving',
        label: 'GHG Saving',
        value: 'metric_ghgsavings',
        unit: 'mtCO2e',
        total: true,
        order: 13
      },
      {
        name: 'GHG Savings Cost',
        label: 'GHG Savings Cost',
        value: 'metric_ghgsavingscost',
        unit: '$/mtCO2e',
        total: true,
        order: 14
      },
      {
        name: 'Maintenance Savings',
        label: 'Maintenance Savings',
        value: 'initialvalues_maintenance_savings',
        unit: '$',
        total: true,
        order: 17
      },
      {
        name: 'Rebate Code',
        label: 'Rebate Code',
        value: 'incentive_rebate_code',
        order: 23
      },
      {
        name: 'Simple Payback',
        label: 'Simple Payback',
        value: 'metric_simple_payback',
        order: 18
      },
      {
        name: 'Effective Useful Life',
        label: 'Effective Useful Life',
        value: 'metric_eul',
        unit: 'yrs',
        total: true
      },
      {
        name: 'updated',
        label: 'Updated',
        value: 'updated'
      },
      {
        name: 'created',
        label: 'Created',
        value: 'created'
      }
    ]
  },
  {
    name: 'Author',
    value: 'Author',
    subFields: [
      {
        label: 'Updated',
        value: 'updated'
      },
      {
        label: 'created',
        value: 'created'
      },
      {
        value: 'createdBy.name',
        label: 'Author'
      }
    ]
  }
]

export const projectFilterOptions = [
  {
    name: 'Organization',
    value: 'Organization',
    subFields: [
      {
        name: 'Organization Name',
        label: 'Organization Name',
        value: 'organization.name',
        select: 'multiSelect',
        tab: 'building'
      }
    ]
  },
  {
    name: 'Property',
    value: 'info',
    subFields: [
      {
        name: 'Primary Use',
        label: 'Primary Use',
        value: 'buildinguse',
        select: 'multiSelect',
        paramName: 'building_usetype',
        tab: 'building'
      },
      // {
      //   name: 'Building Secondary Types',
      //   label: 'Building Seconardy Use',
      //   value: 'buildingUseTypes.use',
      //   select: 'multiSelect',
      //   tab: 'building'
      // },
      {
        name: 'Gross Floor Area',
        label: 'Gross Floor Area',
        value: 'squarefeet',
        select: 'range',
        tab: 'building',
        unit: 'ft\u00B2',
        paramName: 'gross_floor_area'
      },
      // {
      //   name: 'Secondary Use Type Area',
      //   label: 'Secondary Use Type Area',
      //   value: 'buildingUseTypes.squarefeet',
      //   select: 'range',
      //   tab: 'building',
      //   unit: 'ft\u00B2'
      // },
      // {
      //   name: 'Floors',
      //   label: 'Floors',
      //   value: 'floorcount',
      //   select: 'range',
      //   tab: 'building'
      // },
      {
        name: 'Year Built',
        label: 'Year Built',
        value: 'buildyear',
        select: 'yearRange',
        tab: 'building',
        paramName: 'year_built'
      },
      // {
      //   name: 'Created',
      //   label: 'Created',
      //   value: 'created',
      //   select: 'yearRange',
      //   tab: 'building'
      // },
      // {
      //   name: 'Updated',
      //   label: 'Updated',
      //   value: 'updated',
      //   select: 'yearRange',
      //   tab: 'building'
      // },
      // {
      //   name: 'Client Name',
      //   label: 'Client Name',
      //   value: 'clientname',
      //   select: 'multiSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Site Name',
      //   label: 'Site Name',
      //   value: 'sitename',
      //   select: 'multiSelect',
      //   tab: 'building'
      // },
      {
        name: 'City',
        label: 'City',
        value: 'location_city',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'city'
      },
      {
        name: 'State/Province',
        label: 'State/Province',
        value: 'location_state',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'state'
      },
      {
        name: 'Zip Code',
        label: 'Zip Code',
        value: 'location_zipcode',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'zip_code'
      },
      // {
      //   name: 'Open 24/7',
      //   label: 'Open 24/7',
      //   value: 'open247',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      {
        name: 'Borough',
        label: 'Borough',
        value: 'nycfields_borough',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'borough'
      },
      // {
      //   name: 'Historic Building',
      //   label: 'Historic Building',
      //   value: 'nycfields_historicbuilding',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Multi-Tenant',
      //   label: 'Multi-Tenant',
      //   value: 'nycfields_multitenant',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Percent Leased',
      //   label: 'Percent Leased',
      //   value: 'nycfields_percentleased',
      //   select: 'range',
      //   tab: 'building'
      // },
      // {
      //   name: 'Percent Owned',
      //   label: 'Percent Owned',
      //   value: 'nycfields_percentowned',
      //   select: 'range',
      //   tab: 'building'
      // },
      // {
      //   name: 'Shared Energy on Multiple Lots',
      //   label: 'Shared Energy on Multiple Lots',
      //   value: 'nycfields_energy_sys_multiple_lots',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Shared Energy on Singe Lot',
      //   label: 'Shared Energy on Singe Lot',
      //   value: 'nycfields_energy_sys_single_lotst',
      //   select: 'singleSelect',
      //   tab: 'building'
      // }
      {
        name: 'Created By',
        label: 'Created By',
        value: 'building.createdBy.id',
        select: 'multiSelect',
        tab: 'building'
      },
      {
        name: 'Created',
        label: 'Created',
        value: 'building.created',
        select: 'dateRange',
        tab: 'building'
      },
      {
        name: 'Updated',
        label: 'Updated',
        value: 'building.updated',
        select: 'dateRange',
        tab: 'building'
      }
    ]
  },
  // {
  // 	name: 'Overview',
  // 	value: 'overview',
  // 	subFields: [
  // 		// {
  // 		//   name: 'Annual Energy Use',
  // 		//   label: 'Annual Energy Use',
  // 		//   value: 'monthlyUtilities.annual_energy_use',
  // 		//   select: 'range',
  // 		//   timeDepends: true,
  // 		//   tab: 'building',
  // 		//   unit: 'MMBTU'
  // 		// },
  // 	],
  // },
  {
    name: 'Energy Use',
    value: 'Energy Use',
    subFields: [
      {
        name: 'Energy Use Intensity',
        label: 'Energy Use Intensity',
        value: 'monthlyUtilities.energy_use_intensity',
        select: 'range',
        timeDepends: true,
        tab: 'building',
        unit: 'kBtu/ft\u00B2',
        paramName: 'energyuse_intensity'
      },
      {
        name: 'Energy Star Score',
        label: 'Energy Star Score',
        value: 'buildingPmScores.score',
        select: 'range',
        tab: 'building',
        paramName: 'energy_star_score'
      },
      {
        name: 'Annual Electricity Use',
        label: 'Annual Electricity Use',
        value: 'monthlyUtilities.annual_electricity_use',
        select: 'range',
        tab: 'building',
        unit: 'kWh',
        paramName: 'electric_use'
      },
      {
        name: 'Annual Electricity Demand Use',
        label: 'Annual Electricity Demand Use',
        value: 'monthlyUtilities.annual_electricity_demand_use',
        select: 'range',
        tab: 'building',
        unit: 'kW',
        paramName: 'electric_demand_use'
      },
      {
        name: 'Annual Natural Gas Use',
        label: 'Annual Natural Gas Use',
        value: 'monthlyUtilities.annual_natural_gas_use',
        select: 'range',
        tab: 'building',
        unit: 'therms',
        paramName: 'natural_gas_use'
      },
      {
        name: 'Annual Fuel Oil 2 Use',
        label: 'Annual Fuel Oil 2 Use',
        value: 'monthlyUtilities.annual_fuel_oil2_use',
        select: 'range',
        tab: 'building',
        unit: 'gals',
        paramName: 'fuel_oil2_use'
      },
      {
        name: 'Annual Fuel Oil 4 Use',
        label: 'Annual Fuel Oil 4 Use',
        value: 'monthlyUtilities.annual_fuel_oil4_use',
        select: 'range',
        tab: 'building',
        unit: 'gals',
        paramName: 'fuel_oil4_use'
      },
      {
        name: 'Annual Fuel Oil 5 & 6 Use',
        label: 'Annual Fuel Oil 5 & 6 Use',
        value: 'monthlyUtilities.annual_fuel_oil56_use',
        select: 'range',
        tab: 'building',
        unit: 'gals',
        paramName: 'fuel_oil56_use'
      },
      {
        name: 'Annual Steam Use',
        label: 'Annual Steam Use',
        value: 'monthlyUtilities.annual_steam_use',
        select: 'range',
        tab: 'building',
        unit: 'Mlb',
        paramName: 'steam_use'
      },
      {
        name: 'Annual Diesel Use',
        label: 'Annual Diesel Use',
        value: 'monthlyUtilities.annual_diesel_use',
        select: 'range',
        tab: 'building',
        unit: 'gals'
      }
    ]
  },
  {
    name: 'Energy Cost',
    value: 'Energy Cost',
    subFields: [
      {
        name: 'Annual Energy Cost',
        label: 'Annual Energy Cost',
        value: 'monthlyUtilities.annual_energy_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'annual_cost'
      },
      {
        name: 'Energy Cost Intensity',
        label: 'Energy Cost Intensity',
        value: 'monthlyUtilities.energy_cost_intensity',
        select: 'costRange',
        tab: 'building',
        unit: '$/ft\u00B2',
        paramName: 'energycost_intensity'
      },
      {
        name: 'Annual Electricity Cost',
        label: 'Annual Electricity Cost',
        value: 'monthlyUtilities.annual_electricity_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'electric_cost'
      },
      {
        name: 'Annual Electricity Demand Cost',
        label: 'Annual Electricity Demand Cost',
        value: 'monthlyUtilities.annual_electricity_demand_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'electric_demand_cost'
      },
      {
        name: 'Annual Natural Gas Cost',
        label: 'Annual Natural Gas Cost',
        value: 'monthlyUtilities.annual_natural_gas_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'natural_gas_cost'
      },
      {
        name: 'Annual Fuel Oil 2 Cost',
        label: 'Annual Fuel Oil 2 Cost',
        value: 'monthlyUtilities.annual_fuel_oil2_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'fuel_oil2_cost'
      },
      {
        name: 'Annual Fuel Oil 4 Cost',
        label: 'Annual Fuel Oil 4 Cost',
        value: 'monthlyUtilities.annual_fuel_oil4_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'fuel_oil4_cost'
      },
      {
        name: 'Annual Fuel Oil 5 & 6 Cost',
        label: 'Annual Fuel Oil 5 & 6 Cost',
        value: 'monthlyUtilities.annual_fuel_oil56_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'fuel_oil56_cost'
      },
      {
        name: 'Annual Steam Cost',
        label: 'Annual Steam Cost',
        value: 'monthlyUtilities.annual_steam_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'steam_cost'
      },
      {
        name: 'Annual Diesel Cost',
        label: 'Annual Diesel Cost',
        value: 'monthlyUtilities.annual_diesel_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Electricity Rate',
        label: 'Electricity Rate',
        value: 'rates_electric',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Natural Gas Rate',
        label: 'Natural Gas Rate',
        value: 'rates_gas',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Water Rate',
        label: 'Water Rate',
        value: 'rates_water',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Fuel Oil 2 Rate',
        label: 'Fuel Oil 2 Rate',
        value: 'rates_fueloil2',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Fuel Oil 4 Rate',
        label: 'Fuel Oil 4 Rate',
        value: 'rates_fueloil4',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Fuel Oil 5 & 6 Rate',
        label: 'Fuel Oil 5 & 6 Rate',
        value: 'rates_fueloil56',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Steam Rate',
        label: 'Steam Rate',
        value: 'rates_steam',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Diesel Rate',
        label: 'Diesel Rate',
        value: 'rates_diesel',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      }
    ]
  },
  {
    name: 'GHG Emissions',
    value: 'GHG Emissions',
    subFields: [
      {
        name: 'Annual GHG Emissions',
        label: 'Annual GHG Emissions',
        value: 'monthlyUtilities.annual_ghg_emissions',
        select: 'range',
        paramName: 'ghg_emission',
        tab: 'building',
        unit: 'mtCO2e'
      },
      {
        name: 'GHG Intensity',
        label: 'GHG Intensity',
        value: 'monthlyUtilities.ghg_intensity',
        select: 'range',
        tab: 'building',
        unit: 'mtCO2e/ft\u00B2',
        paramName: 'ghg_intensity'
      }
    ]
  },
  {
    name: 'Water Cost & Use',
    value: 'Water Cost & Use',
    subFields: [
      {
        name: 'Annual Water Use',
        label: 'Annual Water Use',
        value: 'monthlyUtilities.annual_water_use',
        select: 'range',
        tab: 'building',
        unit: 'ccf'
      },
      {
        name: 'Water Use Intensity',
        label: 'Water Use Intensity',
        value: 'monthlyUtilities.water_use_intensity',
        select: 'range',
        tab: 'building',
        unit: 'ccf/ft\u00B2'
      },
      {
        name: 'Annual Water Cost',
        label: 'Annual Water Cost',
        value: 'monthlyUtilities.annual_water_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      }
    ]
  },
  {
    name: 'Measure',
    value: 'Measure',
    subFields: [
      {
        name: 'Measure Name',
        label: 'Measure Name',
        value: 'displayname',
        select: 'multiSelect',
        paramName: 'measure_name',
        tab: 'project'
      },
      {
        name: 'Measure Cost',
        label: 'Measure Cost',
        value: 'metric_projectcost',
        select: 'range',
        paramName: 'measure_cost',
        tab: 'project',
        unit: '$'
      },
      {
        name: 'Measure Application',
        label: 'Measure Application',
        value: 'project_application',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Measure Category',
        label: 'Measure Category',
        value: 'project_category',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Measure Technology',
        label: 'Measure Technology',
        value: 'project_technology',
        select: 'multiSelect',
        tab: 'project'
      },
      // {
      //   name: 'Incentive',
      //   label: 'Incentive',
      //   value: 'runresults_utility_incentive',
      //   select: 'range',
      //   tab: 'project',
      //   unit: '$'
      // },
      {
        name: 'Energy Cost Savings',
        label: 'Energy Cost Savings',
        value: 'metric_annualsavings',
        select: 'range',
        paramName: 'cost_savings',
        tab: 'project',
        unit: '$'
      },
      {
        name: 'Natural Gas Reduction',
        label: 'Natural Gas Reduction',
        value: 'metric_gassavings',
        select: 'range',
        paramName: 'natural_gas_reduction',
        tab: 'project',
        unit: 'therms'
      },
      // {
      //   name: 'GHG Saving',
      //   label: 'GHG Saving',
      //   value: 'runresults_ghg',
      //   select: 'range',
      //   tab: 'project',
      //   unit: 'mtCO2e'
      // },
      {
        name: '$/GHG Reduction',
        label: '$/GHG Reduction',
        value: 'runresults_ghg_cost',
        select: 'range',
        tab: 'project',
        paramName: 'ghg_emissions',
        unit: '$/mtCO2e'
      },
      {
        name: 'Electricity Demand Savings',
        label: 'Electricity Demand Savings',
        value: 'runresults_energy_savings_demand',
        select: 'range',
        tab: 'project',
        unit: 'kWh'
      },
      {
        name: 'Electricity Savings',
        label: 'Electricity Savings',
        value: 'metric_electricsavings',
        select: 'range',
        unit: 'kWh',
        tab: 'project',
        paramName: 'electric_reduction'
      },
      // {
      //   name: 'Maintenance Savings',
      //   label: 'Maintenance Savings',
      //   value: 'initialvalues_maintenance_savings',
      //   select: 'range',
      //   tab: 'project',
      //   unit: '$'
      // },
      // {
      //   name: 'Simple Payback',
      //   label: 'Simple Payback',
      //   value: 'metric_simple_payback',
      //   select: 'range',
      //   tab: 'project',
      //   unit: 'yrs'
      // },
      {
        name: 'Status',
        label: 'Status',
        value: 'status',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Type',
        label: 'Type',
        value: 'type',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Created By',
        label: 'Created By',
        value: 'project.createdBy.id',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Created',
        label: 'Created',
        value: 'project.created',
        select: 'dateRange',
        tab: 'project'
      },
      {
        name: 'Updated',
        label: 'Updated',
        value: 'project.updated',
        select: 'dateRange',
        tab: 'project'
      }
      // {
      //   name: 'Project Name',
      //   label: 'Project Name',
      //   value: 'project_name',
      //   select: 'multiSelect',
      //   tab: 'project'
      // },
      // {
      //   name: 'Effective Useful Life',
      //   label: 'Effective Useful Life',
      //   value: 'runresults_energy_savings_eul',
      //   select: 'range',
      //   tab: 'project',
      //   unit: 'yrs'
      // },
    ]
  },
  {
    name: 'Project',
    value: 'ProjectPackage',
    subFields: [
      {
        name: 'Project Name',
        label: 'Project Name',
        value: 'name',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Status',
        label: 'Status',
        value: 'status',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Construction Status',
        label: 'Construction Status',
        value: 'constructionstatus',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Energy Cost Savings',
        label: 'Energy Cost Savings',
        value: 'total_annualsavings',
        select: 'range',
        unit: '$',
        tab: 'projectPackage'
      },
      {
        name: 'Energy Savings',
        label: 'Energy Savings',
        value: 'total_energysavings',
        select: 'range',
        unit: 'kBtu',
        tab: 'projectPackage'
      },
      {
        name: 'Electricity Savings',
        label: 'Electricity Savings',
        value: 'total_electric',
        select: 'range',
        unit: 'kWh',
        tab: 'projectPackage'
      },
      {
        name: 'Electricity Demand Savings',
        label: 'Electricity Demand Savings',
        value: 'total_demandsavings',
        unit: 'kWh',
        select: 'range',
        tab: 'projectPackage'
      },
      {
        name: 'Natural Gas Reduction',
        label: 'Natural Gas Reduction',
        value: 'total_gassavings',
        select: 'range',
        unit: 'therms',
        tab: 'projectPackage'
      },
      // {
      // 	name: 'Water Savings',
      // 	label: 'Water Savings',
      // 	value: 'total_watersavings',
      // 	select: 'range',
      // 	unit: 'ccf',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'GHG Savings',
      // 	label: 'GHG Savings',
      // 	value: 'total_ghgsavings',
      // 	select: 'range',
      // 	unit: 'mtCO2e',
      // 	tab: 'projectPackage',
      // },
      {
        name: '$/GHG Reduction',
        label: '$/GHG Reduction',
        value: 'total_ghgsavingscost',
        select: 'range',
        unit: '$ /mtCO2e',
        tab: 'projectPackage'
      },
      {
        name: 'Project Cost',
        label: 'Project Cost',
        value: 'total_projectcost',
        select: 'costRange',
        unit: '$',
        tab: 'projectPackage'
      },
      // {
      // 	name: 'Incentive',
      // 	label: 'Incentive',
      // 	value: 'total_incentive',
      // 	select: 'costRange',
      // 	unit: '$',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'Maintenance Savings',
      // 	label: 'Maintenance Savings',
      // 	value: 'total_maintenancesavings',
      // 	select: 'costRange',
      // 	unit: '$',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'ROI',
      // 	label: 'ROI',
      // 	value: 'total_roi',
      // 	select: 'range',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'Simple Payback',
      // 	label: 'Simple Payback',
      // 	value: 'total_simplepayback',
      // 	select: 'range',
      // 	unit: 'yrs',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'NPV',
      // 	label: 'NPV',
      // 	value: 'total_npv',
      // 	select: 'range',
      // 	unit: 'yrs',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'SIR',
      // 	label: 'SIR',
      // 	value: 'total_sir',
      // 	select: 'range',
      // 	tab: 'projectPackage',
      // },
      {
        name: 'Effective Useful Life',
        label: 'Effective Useful Life',
        value: 'total_eul',
        select: 'range',
        unit: 'yrs',
        tab: 'projectPackage'
      },
      {
        name: 'Created By',
        label: 'Created By',
        value: 'projectPackage.createdBy.id',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Created',
        label: 'Created',
        value: 'projectPackage.created',
        select: 'dateRange',
        tab: 'projectPackage'
      },
      {
        name: 'Updated',
        label: 'Updated',
        value: 'projectPackage.updated',
        select: 'dateRange',
        tab: 'projectPackage'
      }
    ]
  }
]

// ProjectPackages -> Projects

export const defaultProjectPackageColumn = [
  {
    value: 'name',
    label: 'Name',
    order: 1
  },
  {
    value: 'building.buildingname',
    label: 'Building Name',
    order: 2
  },
  {
    value: 'organization.name',
    label: 'Organization Name',
    order: 3
  },
  {
    value: 'status',
    label: 'Status',
    order: 4
  },
  {
    value: 'constructionstatus',
    label: 'Construction Status',
    order: 5
  },
  {
    name: 'Annual Cost Savings',
    label: 'Annual Cost Savings',
    value: 'total_annualsavings',
    unit: '$',
    total: true,
    order: 10
  },
  {
    name: 'Energy Savings',
    label: 'Energy Savings',
    value: 'total_energysavings',
    unit: 'kBtu',
    total: true,
    order: 11
  },
  {
    name: 'Electric Savings',
    label: 'Electric Savings',
    value: 'total_electric',
    unit: 'kWh',
    total: true,
    order: 12
  },
  {
    name: 'Demand Savings',
    label: 'Demand Savings',
    value: 'total_demandsavings',
    unit: 'kWh',
    total: true,
    order: 13
  },
  {
    name: 'Natural Gas Savings',
    label: 'Natural Gas Savings',
    value: 'total_gassavings',
    unit: 'therms',
    total: true,
    order: 14
  },
  {
    name: 'GHG Savings',
    label: 'GHG Savings',
    value: 'total_ghgsavings',
    unit: 'mtCO2e',
    total: true,
    order: 15
  },
  {
    name: 'GHG Savings Cost',
    label: 'GHG Savings Cost',
    value: 'total_ghgsavingscost',
    unit: '$/mtCO2e',
    total: true,
    order: 16
  },
  {
    name: 'Water Savings',
    label: 'Water Savings',
    value: 'total_watersavings',
    unit: 'ccf',
    total: true,
    order: 17
  },
  {
    name: 'Project Cost',
    label: 'Project Cost',
    value: 'total_projectcost',
    unit: '$',
    total: true,
    order: 18
  },
  {
    name: 'Incentive',
    label: 'Incentive',
    value: 'total_incentive',
    unit: '$',
    total: true,
    order: 19
  },
  {
    name: 'Maintenance Savings',
    label: 'Maintenance Savings',
    value: 'total_maintenancesavings',
    unit: '$',
    total: true,
    order: 20
  },
  {
    name: 'ROI',
    label: 'ROI',
    value: 'total_roi',
    order: 21
  },
  {
    name: 'Simple Payback',
    label: 'Simple Payback',
    value: 'total_simplepayback',
    order: 22
  },
  {
    name: 'NPV',
    label: 'NPV',
    value: 'total_npv',
    order: 23
  },
  {
    name: 'SIR',
    label: 'SIR',
    value: 'total_sir',
    order: 24
  },
  {
    name: 'Effective Useful Life',
    label: 'Effective Useful Life',
    value: 'total_eul',
    order: 25,
    unit: 'yrs'
  },
  {
    name: 'updated',
    label: 'Updated',
    value: 'updated',
    order: 26
  },
  {
    name: 'created',
    label: 'Created',
    value: 'created',
    order: 27
  },
  {
    name: 'Author',
    value: 'createdBy.name',
    label: 'Author',
    option: 'left',
    order: 28
  }
]

export const projectPackageColumnOptions = [
  {
    name: 'Organization',
    value: 'Organization',
    subFields: [
      {
        value: 'organization.name',
        label: 'Organization Name',
        order: 3
      }
    ]
  },
  {
    name: 'Building',
    value: 'Building',
    subFields: [
      {
        value: 'building.buildingname',
        label: 'Building Name',
        order: 2
      }
    ]
  },
  {
    name: 'Project',
    value: 'ProjectPackage',
    subFields: [
      {
        value: 'name',
        label: 'Name',
        order: 1
      },
      {
        value: 'status',
        label: 'Status',
        order: 4
      },
      {
        value: 'constructionstatus',
        label: 'Construction Status',
        order: 5
      },
      {
        value: 'estimatedstartdate',
        label: 'Construction Estimated Start Date',
        order: 6
      },
      {
        value: 'estimatedcompletiondate',
        label: 'Construction Estimated End Date',
        order: 7
      },
      {
        value: 'actualstartdate',
        label: 'Construction Actual Start Date',
        order: 8
      },
      {
        value: 'actualcompletiondate',
        label: 'Construction Actual End Date',
        order: 9
      },
      {
        name: 'Annual Cost Savings',
        label: 'Annual Cost Savings',
        value: 'total_annualsavings',
        unit: '$',
        total: true,
        order: 10
      },
      {
        name: 'Energy Savings',
        label: 'Energy Savings',
        value: 'total_energysavings',
        unit: 'kBtu',
        total: true,
        order: 11
      },
      {
        name: 'Electric Savings',
        label: 'Electric Savings',
        value: 'total_electric',
        unit: 'kWh',
        total: true,
        order: 12
      },
      {
        name: 'Demand Savings',
        label: 'Demand Savings',
        value: 'total_demandsavings',
        unit: 'kWh',
        total: true,
        order: 13
      },
      {
        name: 'Natural Gas Savings',
        label: 'Natural Gas Savings',
        value: 'total_gassavings',
        unit: 'therms',
        total: true,
        order: 14
      },
      {
        name: 'Water Savings',
        label: 'Water Savings',
        value: 'total_watersavings',
        unit: 'ccf',
        total: true,
        order: 17
      },
      {
        name: 'GHG Savings',
        label: 'GHG Savings',
        value: 'total_ghgsavings',
        unit: 'mtCO2e',
        total: true,
        order: 15
      },
      {
        name: 'GHG Savings Cost',
        label: 'GHG Savings Cost',
        value: 'total_ghgsavingscost',
        unit: '$/mtCO2e',
        total: true,
        order: 16
      },
      {
        name: 'Project Cost',
        label: 'Project Cost',
        value: 'total_projectcost',
        unit: '$',
        total: true,
        order: 18
      },
      {
        name: 'Incentive',
        label: 'Incentive',
        value: 'total_incentive',
        unit: '$',
        total: true,
        order: 19
      },
      {
        name: 'Maintenance Savings',
        label: 'Maintenance Savings',
        value: 'total_maintenancesavings',
        unit: '$',
        total: true,
        order: 20
      },
      {
        name: 'ROI',
        label: 'ROI',
        value: 'total_roi',
        order: 21
      },
      {
        name: 'Simple Payback',
        label: 'Simple Payback',
        value: 'total_simplepayback',
        order: 22
      },
      {
        name: 'NPV',
        label: 'NPV',
        value: 'total_npv',
        order: 23
      },
      {
        name: 'SIR',
        label: 'SIR',
        value: 'total_sir',
        order: 24
      },
      {
        name: 'Effective Useful Life',
        label: 'Effective Useful Life',
        value: 'total_eul',
        order: 25,
        unit: 'yrs'
      },
      {
        name: 'updated',
        label: 'Updated',
        value: 'updated',
        order: 26
      },
      {
        name: 'created',
        label: 'Created',
        value: 'created',
        order: 27
      }
    ]
  },
  {
    name: 'Author',
    value: 'Author',
    subFields: [
      {
        label: 'Updated',
        value: 'updated'
      },
      {
        label: 'created',
        value: 'created'
      },
      {
        value: 'createdBy.name',
        label: 'Author'
      }
    ]
  }
]

export const projectPackageFilterOptions = [
  {
    name: 'Organization',
    value: 'Organization',
    subFields: [
      {
        name: 'Organization Name',
        label: 'Organization Name',
        value: 'organization.name',
        select: 'multiSelect',
        tab: 'building'
      }
    ]
  },
  {
    name: 'Property',
    value: 'info',
    subFields: [
      {
        name: 'Primary Use',
        label: 'Primary Use',
        value: 'buildinguse',
        select: 'multiSelect',
        paramName: 'building_usetype',
        tab: 'building'
      },
      // {
      //   name: 'Building Secondary Types',
      //   label: 'Building Seconardy Use',
      //   value: 'buildingUseTypes.use',
      //   select: 'multiSelect',
      //   tab: 'building'
      // },
      {
        name: 'Gross Floor Area',
        label: 'Gross Floor Area',
        value: 'squarefeet',
        select: 'range',
        tab: 'building',
        unit: 'ft\u00B2',
        paramName: 'gross_floor_area'
      },
      // {
      //   name: 'Secondary Use Type Area',
      //   label: 'Secondary Use Type Area',
      //   value: 'buildingUseTypes.squarefeet',
      //   select: 'range',
      //   tab: 'building',
      //   unit: 'ft\u00B2'
      // },
      // {
      //   name: 'Floors',
      //   label: 'Floors',
      //   value: 'floorcount',
      //   select: 'range',
      //   tab: 'building'
      // },
      {
        name: 'Year Built',
        label: 'Year Built',
        value: 'buildyear',
        select: 'yearRange',
        tab: 'building',
        paramName: 'year_built'
      },
      // {
      //   name: 'Created',
      //   label: 'Created',
      //   value: 'created',
      //   select: 'yearRange',
      //   tab: 'building'
      // },
      // {
      //   name: 'Updated',
      //   label: 'Updated',
      //   value: 'updated',
      //   select: 'yearRange',
      //   tab: 'building'
      // },
      // {
      //   name: 'Client Name',
      //   label: 'Client Name',
      //   value: 'clientname',
      //   select: 'multiSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Site Name',
      //   label: 'Site Name',
      //   value: 'sitename',
      //   select: 'multiSelect',
      //   tab: 'building'
      // },
      {
        name: 'City',
        label: 'City',
        value: 'location_city',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'city'
      },
      {
        name: 'State/Province',
        label: 'State/Province',
        value: 'location_state',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'state'
      },
      {
        name: 'Zip Code',
        label: 'Zip Code',
        value: 'location_zipcode',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'zip_code'
      },
      // {
      //   name: 'Open 24/7',
      //   label: 'Open 24/7',
      //   value: 'open247',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      {
        name: 'Borough',
        label: 'Borough',
        value: 'nycfields_borough',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'borough'
      },
      {
        name: 'Created By',
        label: 'Created By',
        value: 'building.createdBy.id',
        select: 'multiSelect',
        tab: 'building'
      },
      {
        name: 'Created',
        label: 'Created',
        value: 'building.created',
        select: 'dateRange',
        tab: 'building'
      },
      {
        name: 'Updated',
        label: 'Updated',
        value: 'building.updated',
        select: 'dateRange',
        tab: 'building'
      }
      // {
      //   name: 'Historic Building',
      //   label: 'Historic Building',
      //   value: 'nycfields_historicbuilding',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Multi-Tenant',
      //   label: 'Multi-Tenant',
      //   value: 'nycfields_multitenant',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Percent Leased',
      //   label: 'Percent Leased',
      //   value: 'nycfields_percentleased',
      //   select: 'range',
      //   tab: 'building'
      // },
      // {
      //   name: 'Percent Owned',
      //   label: 'Percent Owned',
      //   value: 'nycfields_percentowned',
      //   select: 'range',
      //   tab: 'building'
      // },
      // {
      //   name: 'Shared Energy on Multiple Lots',
      //   label: 'Shared Energy on Multiple Lots',
      //   value: 'nycfields_energy_sys_multiple_lots',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Shared Energy on Singe Lot',
      //   label: 'Shared Energy on Singe Lot',
      //   value: 'nycfields_energy_sys_single_lotst',
      //   select: 'singleSelect',
      //   tab: 'building'
      // }
    ]
  },
  // {
  // 	name: 'Overview',
  // 	value: 'overview',
  // 	subFields: [
  // 		// {
  // 		//   name: 'Annual Energy Use',
  // 		//   label: 'Annual Energy Use',
  // 		//   value: 'monthlyUtilities.annual_energy_use',
  // 		//   select: 'range',
  // 		//   timeDepends: true,
  // 		//   tab: 'building',
  // 		//   unit: 'MMBTU'
  // 		// },
  // 	],
  // },
  {
    name: 'Energy Use',
    value: 'Energy Use',
    subFields: [
      {
        name: 'Energy Use Intensity',
        label: 'Energy Use Intensity',
        value: 'monthlyUtilities.energy_use_intensity',
        select: 'range',
        timeDepends: true,
        tab: 'building',
        unit: 'kBtu/ft\u00B2',
        paramName: 'energyuse_intensity'
      },
      {
        name: 'Energy Star Score',
        label: 'Energy Star Score',
        value: 'buildingPmScores.score',
        select: 'range',
        tab: 'building',
        paramName: 'energy_star_score'
      },
      {
        name: 'Annual Electricity Use',
        label: 'Annual Electricity Use',
        value: 'monthlyUtilities.annual_electricity_use',
        select: 'range',
        tab: 'building',
        unit: 'kWh',
        paramName: 'electric_use'
      },
      {
        name: 'Annual Electricity Demand Use',
        label: 'Annual Electricity Demand Use',
        value: 'monthlyUtilities.annual_electricity_demand_use',
        select: 'range',
        tab: 'building',
        unit: 'kW',
        paramName: 'electric_demand_use'
      },
      {
        name: 'Annual Natural Gas Use',
        label: 'Annual Natural Gas Use',
        value: 'monthlyUtilities.annual_natural_gas_use',
        select: 'range',
        tab: 'building',
        unit: 'therms',
        paramName: 'natural_gas_use'
      },
      {
        name: 'Annual Fuel Oil 2 Use',
        label: 'Annual Fuel Oil 2 Use',
        value: 'monthlyUtilities.annual_fuel_oil2_use',
        select: 'range',
        tab: 'building',
        unit: 'gals',
        paramName: 'fuel_oil2_use'
      },
      {
        name: 'Annual Fuel Oil 4 Use',
        label: 'Annual Fuel Oil 4 Use',
        value: 'monthlyUtilities.annual_fuel_oil4_use',
        select: 'range',
        tab: 'building',
        unit: 'gals',
        paramName: 'fuel_oil4_use'
      },
      {
        name: 'Annual Fuel Oil 5 & 6 Use',
        label: 'Annual Fuel Oil 5 & 6 Use',
        value: 'monthlyUtilities.annual_fuel_oil56_use',
        select: 'range',
        tab: 'building',
        unit: 'gals',
        paramName: 'fuel_oil56_use'
      },
      {
        name: 'Annual Steam Use',
        label: 'Annual Steam Use',
        value: 'monthlyUtilities.annual_steam_use',
        select: 'range',
        tab: 'building',
        unit: 'Mlb',
        paramName: 'steam_use'
      },
      {
        name: 'Annual Diesel Use',
        label: 'Annual Diesel Use',
        value: 'monthlyUtilities.annual_diesel_use',
        select: 'range',
        tab: 'building',
        unit: 'gals'
      }
    ]
  },
  {
    name: 'Energy Cost',
    value: 'Energy Cost',
    subFields: [
      {
        name: 'Annual Energy Cost',
        label: 'Annual Energy Cost',
        value: 'monthlyUtilities.annual_energy_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'annual_cost'
      },
      {
        name: 'Energy Cost Intensity',
        label: 'Energy Cost Intensity',
        value: 'monthlyUtilities.energy_cost_intensity',
        select: 'costRange',
        tab: 'building',
        unit: '$/ft\u00B2',
        paramName: 'energycost_intensity'
      },
      {
        name: 'Annual Electricity Cost',
        label: 'Annual Electricity Cost',
        value: 'monthlyUtilities.annual_electricity_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'electric_cost'
      },
      {
        name: 'Annual Electricity Demand Cost',
        label: 'Annual Electricity Demand Cost',
        value: 'monthlyUtilities.annual_electricity_demand_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'electric_demand_cost'
      },
      {
        name: 'Annual Natural Gas Cost',
        label: 'Annual Natural Gas Cost',
        value: 'monthlyUtilities.annual_natural_gas_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'natural_gas_cost'
      },
      {
        name: 'Annual Fuel Oil 2 Cost',
        label: 'Annual Fuel Oil 2 Cost',
        value: 'monthlyUtilities.annual_fuel_oil2_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'fuel_oil2_cost'
      },
      {
        name: 'Annual Fuel Oil 4 Cost',
        label: 'Annual Fuel Oil 4 Cost',
        value: 'monthlyUtilities.annual_fuel_oil4_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'fuel_oil4_cost'
      },
      {
        name: 'Annual Fuel Oil 5 & 6 Cost',
        label: 'Annual Fuel Oil 5 & 6 Cost',
        value: 'monthlyUtilities.annual_fuel_oil56_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'fuel_oil56_cost'
      },
      {
        name: 'Annual Steam Cost',
        label: 'Annual Steam Cost',
        value: 'monthlyUtilities.annual_steam_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'steam_cost'
      },
      {
        name: 'Annual Diesel Cost',
        label: 'Annual Diesel Cost',
        value: 'monthlyUtilities.annual_diesel_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Electricity Rate',
        label: 'Electricity Rate',
        value: 'rates_electric',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Natural Gas Rate',
        label: 'Natural Gas Rate',
        value: 'rates_gas',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Water Rate',
        label: 'Water Rate',
        value: 'rates_water',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Fuel Oil 2 Rate',
        label: 'Fuel Oil 2 Rate',
        value: 'rates_fueloil2',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Fuel Oil 4 Rate',
        label: 'Fuel Oil 4 Rate',
        value: 'rates_fueloil4',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Fuel Oil 5 & 6 Rate',
        label: 'Fuel Oil 5 & 6 Rate',
        value: 'rates_fueloil56',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Steam Rate',
        label: 'Steam Rate',
        value: 'rates_steam',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Diesel Rate',
        label: 'Diesel Rate',
        value: 'rates_diesel',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      }
    ]
  },
  {
    name: 'GHG Emissions',
    value: 'GHG Emissions',
    subFields: [
      {
        name: 'Annual GHG Emissions',
        label: 'Annual GHG Emissions',
        value: 'monthlyUtilities.annual_ghg_emissions',
        select: 'range',
        paramName: 'ghg_emission',
        tab: 'building',
        unit: 'mtCO2e'
      },
      {
        name: 'GHG Intensity',
        label: 'GHG Intensity',
        value: 'monthlyUtilities.ghg_intensity',
        select: 'range',
        tab: 'building',
        unit: 'mtCO2e/ft\u00B2',
        paramName: 'ghg_intensity'
      }
    ]
  },
  {
    name: 'Water Cost & Use',
    value: 'Water Cost & Use',
    subFields: [
      {
        name: 'Annual Water Use',
        label: 'Annual Water Use',
        value: 'monthlyUtilities.annual_water_use',
        select: 'range',
        tab: 'building',
        unit: 'ccf'
      },
      {
        name: 'Water Use Intensity',
        label: 'Water Use Intensity',
        value: 'monthlyUtilities.water_use_intensity',
        select: 'range',
        tab: 'building',
        unit: 'ccf/ft\u00B2'
      },
      {
        name: 'Annual Water Cost',
        label: 'Annual Water Cost',
        value: 'monthlyUtilities.annual_water_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      }
    ]
  },
  {
    name: 'Measure',
    value: 'Measure',
    subFields: [
      {
        name: 'Measure Name',
        label: 'Measure Name',
        value: 'displayname',
        select: 'multiSelect',
        paramName: 'measure_name',
        tab: 'project'
      },
      {
        name: 'Measure Cost',
        label: 'Measure Cost',
        value: 'metric_projectcost',
        select: 'range',
        paramName: 'measure_cost',
        tab: 'project',
        unit: '$'
      },
      {
        name: 'Measure Application',
        label: 'Measure Application',
        value: 'project_application',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Measure Category',
        label: 'Measure Category',
        value: 'project_category',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Measure Technology',
        label: 'Measure Technology',
        value: 'project_technology',
        select: 'multiSelect',
        tab: 'project'
      },
      // {
      //   name: 'Incentive',
      //   label: 'Incentive',
      //   value: 'runresults_utility_incentive',
      //   select: 'range',
      //   tab: 'project',
      //   unit: '$'
      // },
      {
        name: 'Energy Cost Savings',
        label: 'Energy Cost Savings',
        value: 'metric_annualsavings',
        select: 'range',
        paramName: 'cost_savings',
        tab: 'project',
        unit: '$'
      },
      {
        name: 'Natural Gas Reduction',
        label: 'Natural Gas Reduction',
        value: 'metric_gassavings',
        select: 'range',
        paramName: 'natural_gas_reduction',
        tab: 'project',
        unit: 'therms'
      },
      // {
      //   name: 'GHG Saving',
      //   label: 'GHG Saving',
      //   value: 'runresults_ghg',
      //   select: 'range',
      //   tab: 'project',
      //   unit: 'mtCO2e'
      // },
      {
        name: '$/GHG Reduction',
        label: '$/GHG Reduction',
        value: 'runresults_ghg_cost',
        select: 'range',
        tab: 'project',
        paramName: 'ghg_emissions',
        unit: '$/mtCO2e'
      },
      {
        name: 'Electricity Demand Savings',
        label: 'Electricity Demand Savings',
        value: 'runresults_energy_savings_demand',
        select: 'range',
        tab: 'project',
        unit: 'kWh'
      },
      {
        name: 'Electricity Savings',
        label: 'Electricity Savings',
        value: 'metric_electricsavings',
        select: 'range',
        unit: 'kWh',
        tab: 'project',
        paramName: 'electric_reduction'
      },
      // {
      //   name: 'Maintenance Savings',
      //   label: 'Maintenance Savings',
      //   value: 'initialvalues_maintenance_savings',
      //   select: 'range',
      //   tab: 'project',
      //   unit: '$'
      // },
      // {
      //   name: 'Simple Payback',
      //   label: 'Simple Payback',
      //   value: 'metric_simple_payback',
      //   select: 'range',
      //   tab: 'project',
      //   unit: 'yrs'
      // },
      {
        name: 'Status',
        label: 'Status',
        value: 'status',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Type',
        label: 'Type',
        value: 'type',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Created By',
        label: 'Created By',
        value: 'project.createdBy.id',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Created',
        label: 'Created',
        value: 'project.created',
        select: 'dateRange',
        tab: 'project'
      },
      {
        name: 'Updated',
        label: 'Updated',
        value: 'project.updated',
        select: 'dateRange',
        tab: 'project'
      }
      // {
      //   name: 'Project Name',
      //   label: 'Project Name',
      //   value: 'project_name',
      //   select: 'multiSelect',
      //   tab: 'project'
      // },
      // {
      //   name: 'Effective Useful Life',
      //   label: 'Effective Useful Life',
      //   value: 'runresults_energy_savings_eul',
      //   select: 'range',
      //   tab: 'project',
      //   unit: 'yrs'
      // },
    ]
  },
  {
    name: 'Project',
    value: 'ProjectPackage',
    subFields: [
      {
        name: 'Project Name',
        label: 'Project Name',
        value: 'name',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Status',
        label: 'Status',
        value: 'status',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Construction Status',
        label: 'Construction Status',
        value: 'constructionstatus',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Energy Cost Savings',
        label: 'Energy Cost Savings',
        value: 'total_annualsavings',
        select: 'range',
        unit: '$',
        tab: 'projectPackage'
      },
      {
        name: 'Energy Savings',
        label: 'Energy Savings',
        value: 'total_energysavings',
        select: 'range',
        unit: 'kBtu',
        tab: 'projectPackage'
      },
      {
        name: 'Electricity Savings',
        label: 'Electricity Savings',
        value: 'total_electric',
        select: 'range',
        unit: 'kWh',
        tab: 'projectPackage'
      },
      {
        name: 'Electricity Demand Savings',
        label: 'Electricity Demand Savings',
        value: 'total_demandsavings',
        unit: 'kWh',
        select: 'range',
        tab: 'projectPackage'
      },
      {
        name: 'Natural Gas Reduction',
        label: 'Natural Gas Reduction',
        value: 'total_gassavings',
        select: 'range',
        unit: 'therms',
        tab: 'projectPackage'
      },
      // {
      // 	name: 'Water Savings',
      // 	label: 'Water Savings',
      // 	value: 'total_watersavings',
      // 	select: 'range',
      // 	unit: 'ccf',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'GHG Savings',
      // 	label: 'GHG Savings',
      // 	value: 'total_ghgsavings',
      // 	select: 'range',
      // 	unit: 'mtCO2e',
      // 	tab: 'projectPackage',
      // },
      {
        name: '$/GHG Reduction',
        label: '$/GHG Reduction',
        value: 'total_ghgsavingscost',
        select: 'range',
        unit: '$ /mtCO2e',
        tab: 'projectPackage'
      },
      {
        name: 'Project Cost',
        label: 'Project Cost',
        value: 'total_projectcost',
        select: 'costRange',
        unit: '$',
        tab: 'projectPackage'
      },
      // {
      // 	name: 'Incentive',
      // 	label: 'Incentive',
      // 	value: 'total_incentive',
      // 	select: 'costRange',
      // 	unit: '$',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'Maintenance Savings',
      // 	label: 'Maintenance Savings',
      // 	value: 'total_maintenancesavings',
      // 	select: 'costRange',
      // 	unit: '$',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'ROI',
      // 	label: 'ROI',
      // 	value: 'total_roi',
      // 	select: 'range',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'Simple Payback',
      // 	label: 'Simple Payback',
      // 	value: 'total_simplepayback',
      // 	select: 'range',
      // 	unit: 'yrs',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'NPV',
      // 	label: 'NPV',
      // 	value: 'total_npv',
      // 	select: 'range',
      // 	unit: 'yrs',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'SIR',
      // 	label: 'SIR',
      // 	value: 'total_sir',
      // 	select: 'range',
      // 	tab: 'projectPackage',
      // },
      {
        name: 'Effective Useful Life',
        label: 'Effective Useful Life',
        value: 'total_eul',
        select: 'range',
        unit: 'yrs',
        tab: 'projectPackage'
      },
      {
        name: 'Created By',
        label: 'Created By',
        value: 'projectPackage.createdBy.id',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Created',
        label: 'Created',
        value: 'projectPackage.created',
        select: 'dateRange',
        tab: 'projectPackage'
      },
      {
        name: 'Updated',
        label: 'Updated',
        value: 'projectPackage.updated',
        select: 'dateRange',
        tab: 'projectPackage'
      }
    ]
  }
]

// Teams

export const defaultTeamMeasureColumn = [
  {
    value: 'name',
    label: 'Name',
    order: 1
  },
  {
    value: 'organization.name',
    label: 'Organization Name',
    order: 2
  },
  {
    value: 'numberOfBuilding',
    label: '# of Buildings',
    order: 3,
    total: true
  },
  {
    value: 'project_identified',
    label: '# of Measures',
    order: 4,
    total: true
  },
  {
    value: 'average_project_building',
    label: 'Avg. # of Measures/Building',
    order: 5,
    total: true
  },
  {
    value: 'total_energy_savings_identified',
    label: 'Total Energy Savings Identified (kBTU)',
    order: 6,
    total: true
  },
  {
    value: 'average_project_kbtu',
    label: 'Avg. Energy Savings/Measure (kBTU)',
    order: 7,
    total: true
  },
  {
    value: 'total_ghg_cost_savings_identified',
    label: 'Total Cost Savings Identified ($)',
    order: 8,
    total: true
  },
  {
    value: 'total_ghg_savings_identified',
    label: 'Total GHG Savings Identified (mtCO2e)',
    order: 9,
    total: true
  },
  {
    value: 'total_incentive_identified',
    label: 'Total Incentives Identified ($)',
    order: 10,
    total: true
  },
  {
    value: 'median_project_payback',
    label: 'Median Measure Payback (yrs)',
    order: 11,
    total: true
  }
]

export const teamColumnMeasureOptions = [
  {
    name: 'Organization',
    value: 'Organization',
    subFields: [
      {
        value: 'organization.name',
        label: 'Organization Name',
        order: 2
      }
    ]
  },
  {
    name: 'Team',
    value: 'Team',
    subFields: [
      {
        value: 'name',
        label: 'Name',
        order: 1
      },
      {
        value: 'numberOfBuilding',
        label: '# of Buildings',
        order: 3,
        total: true
      },
      {
        value: 'project_identified',
        label: '# of Measures',
        order: 4,
        total: true
      },
      {
        value: 'average_project_building',
        label: 'Avg. # of Measures/Building',
        order: 5,
        total: true
      },
      {
        value: 'total_energy_savings_identified',
        label: 'Total Energy Savings Identified (kBTU)',
        order: 6,
        total: true
      },
      {
        value: 'average_project_kbtu',
        label: 'Avg. Energy Savings/Measure (kBTU)',
        order: 7,
        total: true
      },
      {
        value: 'total_ghg_cost_savings_identified',
        label: 'Total Cost Savings Identified ($)',
        order: 8,
        total: true
      },
      {
        value: 'total_ghg_savings_identified',
        label: 'Total GHG Savings Identified (mtCO2e)',
        order: 9,
        total: true
      },
      {
        value: 'total_incentive_identified',
        label: 'Total Incentives Identified ($)',
        order: 10,
        total: true
      },
      {
        value: 'median_project_payback',
        label: 'Median Measure Payback (yrs)',
        order: 11,
        total: true
      }
    ]
  }
]

export const defaultTeamProjectColumn = [
  {
    value: 'name',
    label: 'Name',
    order: 1
  },
  {
    value: 'organization.name',
    label: 'Organization Name',
    order: 2
  },
  {
    value: 'numberOfBuilding',
    label: '# of Buildings',
    order: 3,
    total: true
  },
  {
    value: 'project_identified',
    label: '# of Projects',
    order: 4,
    total: true
  },
  {
    value: 'average_project_building',
    label: 'Avg. # of Projects/Building',
    order: 5,
    total: true
  },
  {
    value: 'total_energy_savings_identified',
    label: 'Total Energy Savings Identified (kBTU)',
    order: 6,
    total: true
  },
  {
    value: 'average_project_kbtu',
    label: 'Avg. Energy Savings/Project (kBTU)',
    order: 7,
    total: true
  },
  {
    value: 'total_ghg_cost_savings_identified',
    label: 'Total Cost Savings Identified ($)',
    order: 8,
    total: true
  },
  {
    value: 'total_ghg_savings_identified',
    label: 'Total GHG Savings Identified (mtCO2e)',
    order: 9,
    total: true
  },
  {
    value: 'total_incentive_identified',
    label: 'Total Incentives Identified ($)',
    order: 10,
    total: true
  },
  {
    value: 'median_project_payback',
    label: 'Median Measure Payback (yrs)',
    order: 11,
    total: true
  }
]

export const teamColumnProjectOptions = [
  {
    name: 'Organization',
    value: 'Organization',
    subFields: [
      {
        value: 'organization.name',
        label: 'Organization Name',
        order: 2
      }
    ]
  },
  {
    name: 'Team',
    value: 'Team',
    subFields: [
      {
        value: 'name',
        label: 'Name',
        order: 1
      },
      {
        value: 'numberOfBuilding',
        label: '# of Buildings',
        order: 3,
        total: true
      },
      {
        value: 'project_identified',
        label: '# of Projects',
        order: 4,
        total: true
      },
      {
        value: 'average_project_building',
        label: 'Avg. # of Projects/Building',
        order: 5,
        total: true
      },
      {
        value: 'total_energy_savings_identified',
        label: 'Total Energy Savings Identified (kBTU)',
        order: 6,
        total: true
      },
      {
        value: 'average_project_kbtu',
        label: 'Avg. Energy Savings/Project (kBTU)',
        order: 7,
        total: true
      },
      {
        value: 'total_ghg_cost_savings_identified',
        label: 'Total Cost Savings Identified ($)',
        order: 8,
        total: true
      },
      {
        value: 'total_ghg_savings_identified',
        label: 'Total GHG Savings Identified (mtCO2e)',
        order: 9,
        total: true
      },
      {
        value: 'total_incentive_identified',
        label: 'Total Incentives Identified ($)',
        order: 10,
        total: true
      },
      {
        value: 'median_project_payback',
        label: 'Median Measure Payback (yrs)',
        order: 11,
        total: true
      }
    ]
  }
]

export const defaultTeamProposalColumn = [
  {
    value: 'name',
    label: 'Name',
    order: 1
  },
  {
    value: 'organization.name',
    label: 'Organization Name',
    order: 2
  },
  {
    value: 'numberOfBuilding',
    label: '# of Buildings',
    order: 3,
    total: true
  },
  {
    value: 'project_identified',
    label: '# of Proposals',
    order: 4,
    total: true
  },
  {
    value: 'average_project_building',
    label: 'Avg. # of Proposals/Building',
    order: 5,
    total: true
  },
  {
    value: 'total_energy_savings_identified',
    label: 'Total Energy Savings Identified (kBTU)',
    order: 6,
    total: true
  },
  {
    value: 'average_project_kbtu',
    label: 'Avg. Energy Savings/Proposal (kBTU)',
    order: 7,
    total: true
  },
  {
    value: 'total_ghg_cost_savings_identified',
    label: 'Total Cost Savings Identified ($)',
    order: 8,
    total: true
  },
  {
    value: 'total_ghg_savings_identified',
    label: 'Total GHG Savings Identified (mtCO2e)',
    order: 9,
    total: true
  },
  {
    value: 'total_incentive_identified',
    label: 'Total Incentives Identified ($)',
    order: 10,
    total: true
  },
  {
    value: 'median_project_payback',
    label: 'Median Measure Payback (yrs)',
    order: 11,
    total: true
  }
]

export const teamColumnProposalOptions = [
  {
    name: 'Organization',
    value: 'Organization',
    subFields: [
      {
        value: 'organization.name',
        label: 'Organization Name',
        order: 2
      }
    ]
  },
  {
    name: 'Team',
    value: 'Team',
    subFields: [
      {
        value: 'name',
        label: 'Name',
        order: 1
      },
      {
        value: 'numberOfBuilding',
        label: '# of Buildings',
        order: 3,
        total: true
      },
      {
        value: 'project_identified',
        label: '# of Proposals',
        order: 4,
        total: true
      },
      {
        value: 'average_project_building',
        label: 'Avg. # of Proposals/Building',
        order: 5,
        total: true
      },
      {
        value: 'total_energy_savings_identified',
        label: 'Total Energy Savings Identified (kBTU)',
        order: 6,
        total: true
      },
      {
        value: 'average_project_kbtu',
        label: 'Avg. Energy Savings/Proposal (kBTU)',
        order: 7,
        total: true
      },
      {
        value: 'total_ghg_cost_savings_identified',
        label: 'Total Cost Savings Identified ($)',
        order: 8,
        total: true
      },
      {
        value: 'total_ghg_savings_identified',
        label: 'Total GHG Savings Identified (mtCO2e)',
        order: 9,
        total: true
      },
      {
        value: 'total_incentive_identified',
        label: 'Total Incentives Identified ($)',
        order: 10,
        total: true
      },
      {
        value: 'median_project_payback',
        label: 'Median Measure Payback (yrs)',
        order: 11,
        total: true
      }
    ]
  }
]

//dashboard

export const dashboardFilterOptions = [
  {
    name: 'Organization',
    value: 'Organization',
    subFields: [
      {
        name: 'Organization Name',
        label: 'Organization Name',
        value: 'organization.name',
        select: 'multiSelect',
        tab: 'building'
      }
    ]
  },
  {
    name: 'Property',
    value: 'info',
    subFields: [
      {
        name: 'Primary Use',
        label: 'Primary Use',
        value: 'buildinguse',
        select: 'multiSelect',
        paramName: 'building_usetype',
        tab: 'building'
      },
      // {
      //   name: 'Building Secondary Types',
      //   label: 'Building Seconardy Use',
      //   value: 'buildingUseTypes.use',
      //   select: 'multiSelect',
      //   tab: 'building'
      // },
      {
        name: 'Gross Floor Area',
        label: 'Gross Floor Area',
        value: 'squarefeet',
        select: 'range',
        tab: 'building',
        unit: 'ft\u00B2',
        paramName: 'gross_floor_area'
      },
      // {
      //   name: 'Secondary Use Type Area',
      //   label: 'Secondary Use Type Area',
      //   value: 'buildingUseTypes.squarefeet',
      //   select: 'range',
      //   tab: 'building',
      //   unit: 'ft\u00B2'
      // },
      // {
      //   name: 'Floors',
      //   label: 'Floors',
      //   value: 'floorcount',
      //   select: 'range',
      //   tab: 'building'
      // },
      {
        name: 'Year Built',
        label: 'Year Built',
        value: 'buildyear',
        select: 'yearRange',
        tab: 'building',
        paramName: 'year_built'
      },
      // {
      //   name: 'Created',
      //   label: 'Created',
      //   value: 'created',
      //   select: 'yearRange',
      //   tab: 'building'
      // },
      // {
      //   name: 'Updated',
      //   label: 'Updated',
      //   value: 'updated',
      //   select: 'yearRange',
      //   tab: 'building'
      // },
      // {
      //   name: 'Client Name',
      //   label: 'Client Name',
      //   value: 'clientname',
      //   select: 'multiSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Site Name',
      //   label: 'Site Name',
      //   value: 'sitename',
      //   select: 'multiSelect',
      //   tab: 'building'
      // },
      {
        name: 'City',
        label: 'City',
        value: 'location_city',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'city'
      },
      {
        name: 'State/Province',
        label: 'State/Province',
        value: 'location_state',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'state'
      },
      {
        name: 'Zip Code',
        label: 'Zip Code',
        value: 'location_zipcode',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'zip_code'
      },
      // {
      //   name: 'Open 24/7',
      //   label: 'Open 24/7',
      //   value: 'open247',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      {
        name: 'Borough',
        label: 'Borough',
        value: 'nycfields_borough',
        select: 'multiSelect',
        tab: 'building',
        paramName: 'borough'
      },
      {
        name: 'Created By',
        label: 'Created By',
        value: 'building.createdBy.id',
        select: 'multiSelect',
        tab: 'building'
      },
      {
        name: 'Created',
        label: 'Created',
        value: 'building.created',
        select: 'dateRange',
        tab: 'building'
      },
      {
        name: 'Updated',
        label: 'Updated',
        value: 'building.updated',
        select: 'dateRange',
        tab: 'building'
      }
      // {
      //   name: 'Historic Building',
      //   label: 'Historic Building',
      //   value: 'nycfields_historicbuilding',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Multi-Tenant',
      //   label: 'Multi-Tenant',
      //   value: 'nycfields_multitenant',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Percent Leased',
      //   label: 'Percent Leased',
      //   value: 'nycfields_percentleased',
      //   select: 'range',
      //   tab: 'building'
      // },
      // {
      //   name: 'Percent Owned',
      //   label: 'Percent Owned',
      //   value: 'nycfields_percentowned',
      //   select: 'range',
      //   tab: 'building'
      // },
      // {
      //   name: 'Shared Energy on Multiple Lots',
      //   label: 'Shared Energy on Multiple Lots',
      //   value: 'nycfields_energy_sys_multiple_lots',
      //   select: 'singleSelect',
      //   tab: 'building'
      // },
      // {
      //   name: 'Shared Energy on Singe Lot',
      //   label: 'Shared Energy on Singe Lot',
      //   value: 'nycfields_energy_sys_single_lotst',
      //   select: 'singleSelect',
      //   tab: 'building'
      // }
    ]
  },
  // {
  // 	name: 'Overview',
  // 	value: 'overview',
  // 	subFields: [
  // 		// {
  // 		//   name: 'Annual Energy Use',
  // 		//   label: 'Annual Energy Use',
  // 		//   value: 'monthlyUtilities.annual_energy_use',
  // 		//   select: 'range',
  // 		//   timeDepends: true,
  // 		//   tab: 'building',
  // 		//   unit: 'MMBTU'
  // 		// },
  // 	],
  // },
  {
    name: 'Energy Use',
    value: 'Energy Use',
    subFields: [
      {
        name: 'Energy Use Intensity',
        label: 'Energy Use Intensity',
        value: 'monthlyUtilities.energy_use_intensity',
        select: 'range',
        timeDepends: true,
        tab: 'building',
        unit: 'kBtu/ft\u00B2',
        paramName: 'energyuse_intensity'
      },
      {
        name: 'Energy Star Score',
        label: 'Energy Star Score',
        value: 'buildingPmScores.score',
        select: 'range',
        tab: 'building',
        paramName: 'energy_star_score'
      },
      {
        name: 'Annual Electricity Use',
        label: 'Annual Electricity Use',
        value: 'monthlyUtilities.annual_electricity_use',
        select: 'range',
        tab: 'building',
        unit: 'kWh',
        paramName: 'electric_use'
      },
      {
        name: 'Annual Electricity Demand Use',
        label: 'Annual Electricity Demand Use',
        value: 'monthlyUtilities.annual_electricity_demand_use',
        select: 'range',
        tab: 'building',
        unit: 'kW',
        paramName: 'electric_demand_use'
      },
      {
        name: 'Annual Natural Gas Use',
        label: 'Annual Natural Gas Use',
        value: 'monthlyUtilities.annual_natural_gas_use',
        select: 'range',
        tab: 'building',
        unit: 'therms',
        paramName: 'natural_gas_use'
      },
      {
        name: 'Annual Fuel Oil 2 Use',
        label: 'Annual Fuel Oil 2 Use',
        value: 'monthlyUtilities.annual_fuel_oil2_use',
        select: 'range',
        tab: 'building',
        unit: 'gals',
        paramName: 'fuel_oil2_use'
      },
      {
        name: 'Annual Fuel Oil 4 Use',
        label: 'Annual Fuel Oil 4 Use',
        value: 'monthlyUtilities.annual_fuel_oil4_use',
        select: 'range',
        tab: 'building',
        unit: 'gals',
        paramName: 'fuel_oil4_use'
      },
      {
        name: 'Annual Fuel Oil 5 & 6 Use',
        label: 'Annual Fuel Oil 5 & 6 Use',
        value: 'monthlyUtilities.annual_fuel_oil56_use',
        select: 'range',
        tab: 'building',
        unit: 'gals',
        paramName: 'fuel_oil56_use'
      },
      {
        name: 'Annual Steam Use',
        label: 'Annual Steam Use',
        value: 'monthlyUtilities.annual_steam_use',
        select: 'range',
        tab: 'building',
        unit: 'Mlb',
        paramName: 'steam_use'
      },
      {
        name: 'Annual Diesel Use',
        label: 'Annual Diesel Use',
        value: 'monthlyUtilities.annual_diesel_use',
        select: 'range',
        tab: 'building',
        unit: 'gals'
      }
    ]
  },
  {
    name: 'Energy Cost',
    value: 'Energy Cost',
    subFields: [
      {
        name: 'Annual Energy Cost',
        label: 'Annual Energy Cost',
        value: 'monthlyUtilities.annual_energy_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'annual_cost'
      },
      {
        name: 'Energy Cost Intensity',
        label: 'Energy Cost Intensity',
        value: 'monthlyUtilities.energy_cost_intensity',
        select: 'costRange',
        tab: 'building',
        unit: '$/ft\u00B2',
        paramName: 'energycost_intensity'
      },
      {
        name: 'Annual Electricity Cost',
        label: 'Annual Electricity Cost',
        value: 'monthlyUtilities.annual_electricity_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'electric_cost'
      },
      {
        name: 'Annual Electricity Demand Cost',
        label: 'Annual Electricity Demand Cost',
        value: 'monthlyUtilities.annual_electricity_demand_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'electric_demand_cost'
      },
      {
        name: 'Annual Natural Gas Cost',
        label: 'Annual Natural Gas Cost',
        value: 'monthlyUtilities.annual_natural_gas_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'natural_gas_cost'
      },
      {
        name: 'Annual Fuel Oil 2 Cost',
        label: 'Annual Fuel Oil 2 Cost',
        value: 'monthlyUtilities.annual_fuel_oil2_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'fuel_oil2_cost'
      },
      {
        name: 'Annual Fuel Oil 4 Cost',
        label: 'Annual Fuel Oil 4 Cost',
        value: 'monthlyUtilities.annual_fuel_oil4_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'fuel_oil4_cost'
      },
      {
        name: 'Annual Fuel Oil 5 & 6 Cost',
        label: 'Annual Fuel Oil 5 & 6 Cost',
        value: 'monthlyUtilities.annual_fuel_oil56_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'fuel_oil56_cost'
      },
      {
        name: 'Annual Steam Cost',
        label: 'Annual Steam Cost',
        value: 'monthlyUtilities.annual_steam_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$',
        paramName: 'steam_cost'
      },
      {
        name: 'Annual Diesel Cost',
        label: 'Annual Diesel Cost',
        value: 'monthlyUtilities.annual_diesel_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Electricity Rate',
        label: 'Electricity Rate',
        value: 'rates_electric',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Natural Gas Rate',
        label: 'Natural Gas Rate',
        value: 'rates_gas',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Water Rate',
        label: 'Water Rate',
        value: 'rates_water',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Fuel Oil 2 Rate',
        label: 'Fuel Oil 2 Rate',
        value: 'rates_fueloil2',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Fuel Oil 4 Rate',
        label: 'Fuel Oil 4 Rate',
        value: 'rates_fueloil4',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Fuel Oil 5 & 6 Rate',
        label: 'Fuel Oil 5 & 6 Rate',
        value: 'rates_fueloil56',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Steam Rate',
        label: 'Steam Rate',
        value: 'rates_steam',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      },
      {
        name: 'Diesel Rate',
        label: 'Diesel Rate',
        value: 'rates_diesel',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      }
    ]
  },
  {
    name: 'GHG Emissions',
    value: 'GHG Emissions',
    subFields: [
      {
        name: 'Annual GHG Emissions',
        label: 'Annual GHG Emissions',
        value: 'monthlyUtilities.annual_ghg_emissions',
        select: 'range',
        paramName: 'ghg_emission',
        tab: 'building',
        unit: 'mtCO2e'
      },
      {
        name: 'GHG Intensity',
        label: 'GHG Intensity',
        value: 'monthlyUtilities.ghg_intensity',
        select: 'range',
        tab: 'building',
        unit: 'mtCO2e/ft\u00B2',
        paramName: 'ghg_intensity'
      }
    ]
  },
  {
    name: 'Water Cost & Use',
    value: 'Water Cost & Use',
    subFields: [
      {
        name: 'Annual Water Use',
        label: 'Annual Water Use',
        value: 'monthlyUtilities.annual_water_use',
        select: 'range',
        tab: 'building',
        unit: 'ccf'
      },
      {
        name: 'Water Use Intensity',
        label: 'Water Use Intensity',
        value: 'monthlyUtilities.water_use_intensity',
        select: 'range',
        tab: 'building',
        unit: 'ccf/ft\u00B2'
      },
      {
        name: 'Annual Water Cost',
        label: 'Annual Water Cost',
        value: 'monthlyUtilities.annual_water_cost',
        select: 'costRange',
        tab: 'building',
        unit: '$'
      }
    ]
  },
  {
    name: 'Measure',
    value: 'Measure',
    subFields: [
      {
        name: 'Measure Name',
        label: 'Measure Name',
        value: 'displayname',
        select: 'multiSelect',
        paramName: 'measure_name',
        tab: 'project'
      },
      {
        name: 'Measure Cost',
        label: 'Measure Cost',
        value: 'metric_projectcost',
        select: 'range',
        paramName: 'measure_cost',
        tab: 'project',
        unit: '$'
      },
      {
        name: 'Measure Application',
        label: 'Measure Application',
        value: 'project_application',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Measure Category',
        label: 'Measure Category',
        value: 'project_category',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Measure Technology',
        label: 'Measure Technology',
        value: 'project_technology',
        select: 'multiSelect',
        tab: 'project'
      },
      // {
      //   name: 'Incentive',
      //   label: 'Incentive',
      //   value: 'runresults_utility_incentive',
      //   select: 'range',
      //   tab: 'project',
      //   unit: '$'
      // },
      {
        name: 'Energy Cost Savings',
        label: 'Energy Cost Savings',
        value: 'metric_annualsavings',
        select: 'range',
        paramName: 'cost_savings',
        tab: 'project',
        unit: '$'
      },
      {
        name: 'Natural Gas Reduction',
        label: 'Natural Gas Reduction',
        value: 'metric_gassavings',
        select: 'range',
        paramName: 'natural_gas_reduction',
        tab: 'project',
        unit: 'therms'
      },
      // {
      //   name: 'GHG Saving',
      //   label: 'GHG Saving',
      //   value: 'runresults_ghg',
      //   select: 'range',
      //   tab: 'project',
      //   unit: 'mtCO2e'
      // },
      {
        name: '$/GHG Reduction',
        label: '$/GHG Reduction',
        value: 'runresults_ghg_cost',
        select: 'range',
        tab: 'project',
        paramName: 'ghg_emissions',
        unit: '$/mtCO2e'
      },
      {
        name: 'Electricity Demand Savings',
        label: 'Electricity Demand Savings',
        value: 'runresults_energy_savings_demand',
        select: 'range',
        tab: 'project',
        unit: 'kWh'
      },
      {
        name: 'Electricity Savings',
        label: 'Electricity Savings',
        value: 'metric_electricsavings',
        select: 'range',
        unit: 'kWh',
        tab: 'project',
        paramName: 'electric_reduction'
      },
      // {
      //   name: 'Maintenance Savings',
      //   label: 'Maintenance Savings',
      //   value: 'initialvalues_maintenance_savings',
      //   select: 'range',
      //   tab: 'project',
      //   unit: '$'
      // },
      // {
      //   name: 'Simple Payback',
      //   label: 'Simple Payback',
      //   value: 'metric_simple_payback',
      //   select: 'range',
      //   tab: 'project',
      //   unit: 'yrs'
      // },
      {
        name: 'Status',
        label: 'Status',
        value: 'status',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Type',
        label: 'Type',
        value: 'type',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Created By',
        label: 'Created By',
        value: 'project.createdBy.id',
        select: 'multiSelect',
        tab: 'project'
      },
      {
        name: 'Created',
        label: 'Created',
        value: 'project.created',
        select: 'dateRange',
        tab: 'project'
      },
      {
        name: 'Updated',
        label: 'Updated',
        value: 'project.updated',
        select: 'dateRange',
        tab: 'project'
      }
      // {
      //   name: 'Project Name',
      //   label: 'Project Name',
      //   value: 'project_name',
      //   select: 'multiSelect',
      //   tab: 'project'
      // },
      // {
      //   name: 'Effective Useful Life',
      //   label: 'Effective Useful Life',
      //   value: 'runresults_energy_savings_eul',
      //   select: 'range',
      //   tab: 'project',
      //   unit: 'yrs'
      // },
    ]
  },
  {
    name: 'Project',
    value: 'ProjectPackage',
    subFields: [
      {
        name: 'Project Name',
        label: 'Project Name',
        value: 'name',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Status',
        label: 'Status',
        value: 'status',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Construction Status',
        label: 'Construction Status',
        value: 'constructionstatus',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Energy Cost Savings',
        label: 'Energy Cost Savings',
        value: 'total_annualsavings',
        select: 'range',
        unit: '$',
        tab: 'projectPackage'
      },
      {
        name: 'Energy Savings',
        label: 'Energy Savings',
        value: 'total_energysavings',
        select: 'range',
        unit: 'kBtu',
        tab: 'projectPackage'
      },
      {
        name: 'Electricity Savings',
        label: 'Electricity Savings',
        value: 'total_electric',
        select: 'range',
        unit: 'kWh',
        tab: 'projectPackage'
      },
      {
        name: 'Electricity Demand Savings',
        label: 'Electricity Demand Savings',
        value: 'total_demandsavings',
        unit: 'kWh',
        select: 'range',
        tab: 'projectPackage'
      },
      {
        name: 'Natural Gas Reduction',
        label: 'Natural Gas Reduction',
        value: 'total_gassavings',
        select: 'range',
        unit: 'therms',
        tab: 'projectPackage'
      },
      // {
      // 	name: 'Water Savings',
      // 	label: 'Water Savings',
      // 	value: 'total_watersavings',
      // 	select: 'range',
      // 	unit: 'ccf',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'GHG Savings',
      // 	label: 'GHG Savings',
      // 	value: 'total_ghgsavings',
      // 	select: 'range',
      // 	unit: 'mtCO2e',
      // 	tab: 'projectPackage',
      // },
      {
        name: '$/GHG Reduction',
        label: '$/GHG Reduction',
        value: 'total_ghgsavingscost',
        select: 'range',
        unit: '$ /mtCO2e',
        tab: 'projectPackage'
      },
      {
        name: 'Project Cost',
        label: 'Project Cost',
        value: 'total_projectcost',
        select: 'costRange',
        unit: '$',
        tab: 'projectPackage'
      },
      // {
      // 	name: 'Incentive',
      // 	label: 'Incentive',
      // 	value: 'total_incentive',
      // 	select: 'costRange',
      // 	unit: '$',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'Maintenance Savings',
      // 	label: 'Maintenance Savings',
      // 	value: 'total_maintenancesavings',
      // 	select: 'costRange',
      // 	unit: '$',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'ROI',
      // 	label: 'ROI',
      // 	value: 'total_roi',
      // 	select: 'range',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'Simple Payback',
      // 	label: 'Simple Payback',
      // 	value: 'total_simplepayback',
      // 	select: 'range',
      // 	unit: 'yrs',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'NPV',
      // 	label: 'NPV',
      // 	value: 'total_npv',
      // 	select: 'range',
      // 	unit: 'yrs',
      // 	tab: 'projectPackage',
      // },
      // {
      // 	name: 'SIR',
      // 	label: 'SIR',
      // 	value: 'total_sir',
      // 	select: 'range',
      // 	tab: 'projectPackage',
      // },
      {
        name: 'Effective Useful Life',
        label: 'Effective Useful Life',
        value: 'total_eul',
        select: 'range',
        unit: 'yrs',
        tab: 'projectPackage'
      },
      {
        name: 'Created By',
        label: 'Created By',
        value: 'projectPackage.createdBy.id',
        select: 'multiSelect',
        tab: 'projectPackage'
      },
      {
        name: 'Created',
        label: 'Created',
        value: 'projectPackage.created',
        select: 'dateRange',
        tab: 'projectPackage'
      },
      {
        name: 'Updated',
        label: 'Updated',
        value: 'projectPackage.updated',
        select: 'dateRange',
        tab: 'projectPackage'
      }
    ]
  }
]

// Scenario
export const defaultScenarioColumn = [
  {
    value: 'name',
    label: 'Name',
    order: 1
  },
  {
    name: 'updated',
    label: 'Updated',
    value: 'updated'
  },
  {
    name: 'created',
    label: 'Created',
    value: 'created'
  }
]

export const scenarioFilterOptions = [
  {
    name: 'Organization',
    value: 'Organization',
    subFields: [
      {
        name: 'Organization Name',
        label: 'Organization Name',
        value: 'organizations.organization.name',
        select: 'multiSelect',
        tab: 'scenario'
      }
    ]
  }
  // {
  //   name: 'Scenario',
  //   value: 'Scenario',
  //   subFields: [
  //     {
  //       name: 'Annual Cost Savings',
  //       label: 'Annual Cost Savings',
  //       value: 'metric.annualSavings',
  //       select: 'range',
  //       unit: '$',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'Energy Savings',
  //       label: 'Energy Savings',
  //       value: 'metric.energySavings',
  //       select: 'range',
  //       unit: 'kBtu',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'Electric Savings',
  //       label: 'Electric Savings',
  //       value: 'metric.electricSavings',
  //       select: 'range',
  //       unit: 'kWh',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'Demand Savings',
  //       label: 'Demand Savings',
  //       value: 'metric.demandSavings',
  //       unit: 'kWh',
  //       select: 'range',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'Natural Gas Savings',
  //       label: 'Natural Gas Savings',
  //       value: 'metric.gasSavings',
  //       select: 'range',
  //       unit: 'therms',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'Water Savings',
  //       label: 'Water Savings',
  //       value: 'metric.waterSavings',
  //       select: 'range',
  //       unit: 'ccf',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'GHG Savings',
  //       label: 'GHG Savings',
  //       value: 'metric.ghgSavings',
  //       select: 'range',
  //       unit: 'mtCO2e',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'GHG Savings Cost',
  //       label: 'GHG Savings Cost',
  //       value: 'metric.ghgSavingsCost',
  //       select: 'range',
  //       unit: '$/mtCO2e',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'Project Cost',
  //       label: 'Project Cost',
  //       value: 'metric.projectCost',
  //       select: 'costRange',
  //       unit: '$',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'Incentive',
  //       label: 'Incentive',
  //       value: 'metric.incentive',
  //       select: 'costRange',
  //       unit: '$',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'Maintenance Savings',
  //       label: 'Maintenance Savings',
  //       value: 'metric.maintenanceSavings',
  //       select: 'costRange',
  //       unit: '$',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'ROI',
  //       label: 'ROI',
  //       value: 'metric.roi',
  //       select: 'range',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'Simple Payback',
  //       label: 'Simple Payback',
  //       value: 'metirc.simple_payback',
  //       select: 'range',
  //       unit: 'yrs',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'NPV',
  //       label: 'NPV',
  //       value: 'metric.npv',
  //       select: 'range',
  //       unit: 'yrs',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'SIR',
  //       label: 'SIR',
  //       value: 'metric.sir',
  //       select: 'range',
  //       tab: 'scenario'
  //     },
  //     {
  //       name: 'Effective Useful Life',
  //       label: 'Effective Useful Life',
  //       value: 'metric.eul',
  //       select: 'range',
  //       unit: 'yrs',
  //       tab: 'scenario'
  //     }
  //   ]
  // }
]

//Proosals

export const ProposalFilterOptions = [
  {
    name: 'Organization',
    value: 'Organization',
    subFields: [
      {
        name: 'Organization Name',
        label: 'Organization Name',
        value: 'organization.name',
        select: 'multiSelect',
        tab: 'building'
      }
    ]
  },
  {
    name: 'Author',
    value: 'author',
    subFields: [
      {
        name: 'Created By',
        label: 'Created By',
        value: 'proposal.createdBy.id',
        select: 'multiSelect',
        tab: 'proposal'
      },
      {
        name: 'Created',
        label: 'Created',
        value: 'proposal.created',
        select: 'dateRange',
        tab: 'proposal'
      },
      {
        name: 'Updated',
        label: 'Updated',
        value: 'proposal.updated',
        select: 'dateRange',
        tab: 'proposal'
      }
    ]
  }
]

export const proposalColumnOptions = [
  {
    name: 'Organization',
    value: 'Organization',
    subFields: [
      {
        value: 'organization.name',
        label: 'Organization Name',
        order: 3
      }
    ]
  },
  {
    name: 'Building',
    value: 'Building',
    subFields: [
      {
        value: 'building.buildingName',
        label: 'Building Name',
        order: 2
      }
    ]
  },
  {
    name: 'Proposal',
    value: 'Proposal',
    subFields: [
      {
        value: 'name',
        label: 'Name'
      },
      {
        label: 'Annual Cost Savings',
        value: 'total.annualSavings',
        unit: '$',
        total: true
      },
      {
        label: 'Energy Savings',
        value: 'total.energySavings',
        unit: 'kBtu',
        total: true
      },
      {
        label: 'Electric Savings',
        value: 'total.electricSavings',
        unit: 'kWh',
        total: true
      },
      {
        label: 'Demand Savings',
        value: 'total.demandSavings',
        unit: 'kW',
        total: true
      },
      {
        label: 'Natural Gas Savings',
        value: 'total.gas',
        unit: 'therms',
        total: true
      },
      { label: 'GHG Savings', value: 'total.ghg', unit: 'mtCO2e', total: true },
      {
        label: 'GHG Savings Cost',
        value: 'total.ghgCost',
        unit: '$/mtCO2e',
        total: true
      },
      {
        label: 'Water Savings',
        value: 'total.waterSavings',
        unit: 'ccf',
        total: true
      },
      {
        label: 'Proposal Cost',
        value: 'total.projectCost',
        unit: '$',
        total: true
      },
      { label: 'Incentive', value: 'total.incentive', unit: '$', total: true },
      {
        label: 'Maintenance Savings',
        value: 'total.maintenanceSavings',
        unit: '$',
        total: true
      },
      { label: 'ROI', value: 'total.roi' },
      {
        label: 'Simple Payback',
        value: 'total.simplePayBack'
      },
      { label: 'NPV', value: 'total.npv' },
      { label: 'SIR', value: 'total.sir' },
      {
        label: 'Effective Useful Life',
        value: 'total.eul',
        unit: 'yrs',
        total: true
      },
      {
        label: 'Updated',
        value: 'updated'
      },
      {
        label: 'Created',
        value: 'created'
      }
    ]
  },
  {
    name: 'Author',
    value: 'Author',
    subFields: [
      {
        label: 'Updated',
        value: 'updated'
      },
      {
        label: 'created',
        value: 'created'
      },
      {
        value: 'createdBy.name',
        label: 'Author'
      }
    ]
  }
]

export const defaultProposalColumn = [
  {
    value: 'name',
    label: 'Name'
  },
  {
    value: 'organization.name',
    label: 'Organization'
  },
  {
    value: 'building.buildingName',
    label: 'Building Name'
  },
  {
    label: 'Annual Cost Savings',
    value: 'total.annualSavings',
    unit: '$',
    total: true
  },
  {
    label: 'Energy Savings',
    value: 'total.energySavings',
    unit: 'kBtu',
    total: true
  },
  {
    label: 'Electric Savings',
    value: 'total.electricSavings',
    unit: 'kWh',
    total: true
  },
  {
    label: 'Demand Savings',
    value: 'total.demandSavings',
    unit: 'kW',
    total: true
  },
  {
    label: 'Natural Gas Savings',
    value: 'total.gas',
    unit: 'therms',
    total: true
  },
  { label: 'GHG Savings', value: 'total.ghg', unit: 'mtCO2e', total: true },
  {
    label: 'GHG Savings Cost',
    value: 'total.ghgCost',
    unit: '$/mtCO2e',
    total: true
  },
  {
    label: 'Water Savings',
    value: 'total.waterSavings',
    unit: 'ccf',
    total: true
  },
  {
    label: 'Proposal Cost',
    value: 'total.projectCost',
    unit: '$',
    total: true
  },
  { label: 'Incentive', value: 'total.incentive', unit: '$', total: true },
  {
    label: 'Maintenance Savings',
    value: 'total.maintenanceSavings',
    unit: '$',
    total: true
  },
  { label: 'ROI', value: 'total.roi' },
  {
    label: 'Simple Payback',
    value: 'total.simplePayBack'
  },
  { label: 'NPV', value: 'total.npv' },
  { label: 'SIR', value: 'total.sir' },
  {
    label: 'Effective Useful Life',
    value: 'total.eul',
    unit: 'yrs',
    total: true
  },
  {
    label: 'Updated',
    value: 'updated'
  },
  {
    label: 'Created',
    value: 'created'
  },
  {
    value: 'createdBy.name',
    label: 'Author'
  }
]

//Dashboard Tabs
export const dashboardTabs = [
  {
    name: 'Energy Use',
    subTabs: [
      {
        name: 'Usage',
        value: 'Usage',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioView/Portfolio?chart_type=energy_use_usage',
        exportBeta:
          'https://tableau.buildee.com/t/buildee/views/AnnualEnergyUsebyFuel/AnnualEnergyUsebyFuel.pdf',
        exportQA:
          'https://tableau.buildee.com/t/buildeebeta/views/AnnualEnergyUsebyFuel/AnnualEnergyUsebyFuel.pdf',
        components: [
          {
            name: 'toggle',
            paramName: 'is_stacked_bar',
            options: [
              {
                value: 'Total',
                icon: 'bar_chart'
              },
              {
                value: 'By Commodity',
                icon: 'stacked_bar_chart'
              }
            ]
          }
        ]
      },
      {
        name: 'Cost',
        value: 'Cost',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioView/Portfolio?chart_type=energy_use_cost',
        exportBeta:
          'https://tableau.buildee.com/t/buildee/views/AnnualEnergyCostbyFuel/AnnualEnergyCostbyFuel.pdf',
        exportQA:
          'https://tableau.buildee.com/t/buildeebeta/views/AnnualEnergyCostbyFuel/AnnualEnergyCostbyFuel.pdf',
        components: [
          {
            name: 'toggle',
            paramName: 'is_stacked_bar',
            options: [
              {
                value: 'Total',
                icon: 'bar_chart'
              },
              {
                value: 'By Commodity',
                icon: 'stacked_bar_chart'
              }
            ]
          }
        ]
      },
      {
        name: 'Intensity',
        value: 'Intensity',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioView/Portfolio?chart_type=energy_use_intensity',
        exportBeta:
          'https://tableau.buildee.com/t/buildee/views/AnnualEnergyUseIntensityEUI/AnnualEnergyCostbyFuel.pdf',
        exportQA:
          'https://tableau.buildee.com/t/buildeebeta/views/AnnualEnergyUseIntensityEUI/AnnualEnergyCostbyFuel.pdf',
        components: [
          {
            name: 'toggle',
            paramName: 'is_stacked_bar',
            options: [
              {
                value: 'Total',
                icon: 'bar_chart'
              },
              {
                value: 'By Commodity',
                icon: 'stacked_bar_chart'
              }
            ]
          }
        ]
      },
      {
        name: 'Monthly Profile',
        value: 'Monthly Profile',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioView/Portfolio?chart_type=energy_use_monthly_profile',
        exportBeta:
          'https://tableau.buildee.com/t/buildee/views/MonthlyEnergyUsebySource/MonthlyEnergyUsebySource.pdf',
        exportQA:
          'https://tableau.buildee.com/t/buildeebeta/views/MonthlyEnergyUsebySource/MonthlyEnergyUsebySource.pdf',
        components: [
          {
            name: 'toggle',
            paramName: 'is_stacked_bar',
            options: [
              {
                value: 'Total',
                icon: 'bar_chart'
              },
              {
                value: 'By Commodity',
                icon: 'stacked_bar_chart'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'GHG Emissions',
    subTabs: [
      {
        name: 'GHG Emissions',
        value: 'GHG Emissions',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioView/Portfolio?chart_type=ghg_emissions',
        exportBeta:
          'https://tableau.buildee.com/t/buildee/views/AnnualGHGEmissionsbyFuel/AnnualGHGEmissionsbyFuel.pdf',
        exportQA:
          'https://tableau.buildee.com/t/buildeebeta/views/AnnualGHGEmissionsbyFuel/AnnualGHGEmissionsbyFuel.pdf',
        components: [
          {
            name: 'toggle',
            paramName: 'is_stacked_bar',
            options: [
              {
                value: 'Total',
                icon: 'bar_chart'
              },
              {
                value: 'By Commodity',
                icon: 'stacked_bar_chart'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Water Use',
    subTabs: [
      {
        name: 'Usage',
        value: 'Usage',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioView/Portfolio?chart_type=water_use_usage',
        exportBeta:
          'https://tableau.buildee.com/t/buildee/views/AnnualWaterUsage/AnnualWaterUsage.pdf',
        exportQA:
          'https://tableau.buildee.com/t/buildeebeta/views/AnnualWaterUsage/AnnualWaterUsage.pdf'
      },
      {
        name: 'Cost',
        value: 'Cost',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioView/Portfolio?chart_type=water_use_cost',
        exportBeta:
          'https://tableau.buildee.com/t/buildee/views/AnnualWaterCost/AnnualWaterCost.pdf',
        exportQA:
          'https://tableau.buildee.com/t/buildeebeta/views/AnnualWaterCost/AnnualWaterCost.pdf'
      },
      {
        name: 'Intensity',
        value: 'Intensity',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioView/Portfolio?chart_type=water_use_intensity',
        exportBeta:
          'https://tableau.buildee.com/t/buildee/views/AnnualWaterUseIntensity/AnnualWaterUseIntensity.pdf',
        exportQA:
          'https://tableau.buildee.com/t/buildeebeta/views/AnnualWaterUseIntensity/AnnualWaterUseIntensity.pdf'
      }
    ]
  },
  {
    name: 'Part to Whole',
    subTabs: [
      {
        name: 'EUI',
        value: 'EUI',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioView/Portfolio?chart_type=parts_of_a_whole',
        exportBeta: 'https://tableau.buildee.com/t/buildee/views/EUI/EUI.pdf',
        exportQA: 'https://tableau.buildee.com/t/buildeebeta/views/EUI/EUI.pdf',
        components: [
          {
            name: 'dropdown',
            paramName: 'top_N_eui',
            options: [
              {
                value: 'All',
                label: 'All'
              },
              {
                value: '50',
                label: 'Top 50'
              },
              {
                value: '25',
                label: 'Top 25'
              },
              {
                value: '10',
                label: 'Top 10'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Measures',
    subTabs: [
      {
        name: 'Measure Impact',
        value: 'Measure Impact',
        route: '',
        components: [
          {
            name: 'dropdown',
            options: [
              {
                value: 'Energy Savings',
                label: 'Energy Savings',
                route:
                  'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioMeasures/PortfolioMeasures?chart_type=measures_energy_savings',
                exportBeta:
                  'https://tableau.buildee.com/t/buildee/views/EnergySavingsbyStatusCategory/EnergySavingsbyStatusCategory.pdf',
                exportQA:
                  'https://tableau.buildee.com/t/buildeebeta/views/EnergySavingsbyStatusCategory/EnergySavingsbyStatusCategory.pdf'
              },
              {
                value: 'Emissions Savings',
                label: 'Emissions Savings',
                route:
                  'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioMeasures/PortfolioMeasures?chart_type=measures_emissions_savings',
                exportBeta:
                  'https://tableau.buildee.com/t/buildee/views/EmissionsSavingsbyStatusCategory_16147141892910/EmissionsSavingsbyStatusCategory.pdf',
                exportQA:
                  'https://tableau.buildee.com/t/buildeebeta/views/EmissionsSavingsbyStatusCategory_16147141892910/EmissionsSavingsbyStatusCategory.pdf'
              }
            ]
          },
          {
            name: 'dropdown',
            paramName: 'status_category',
            options: [
              {
                value: 'Category',
                label: 'Category'
              },
              {
                value: 'Status',
                label: 'Status'
              }
            ]
          }
        ]
      },
      {
        name: 'Measure Value',
        value: 'Measure Value',
        route: '',
        components: [
          {
            name: 'dropdown',
            options: [
              {
                value: 'Cost Savings',
                label: 'Cost Savings',
                route:
                  'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioMeasures/PortfolioMeasures?chart_type=measures_cost_savings',
                exportBeta:
                  'https://tableau.buildee.com/t/buildee/views/CostSavingsbyStatusCategory/CostSavingsbyStatusCategory.pdf',
                exportQA:
                  'https://tableau.buildee.com/t/buildeebeta/views/CostSavingsbyStatusCategory/CostSavingsbyStatusCategory.pdf'
              },
              {
                value: 'Cost',
                label: 'Cost',
                route:
                  'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioMeasures/PortfolioMeasures?chart_type=measures_cost',
                exportBeta:
                  'https://tableau.buildee.com/t/buildee/views/CostbyStatusCategory/CostbyStatusCategory.pdf',
                exportQA:
                  'https://tableau.buildee.com/t/buildeebeta/views/CostbyStatusCategory/CostbyStatusCategory.pdf'
              }
            ]
          },
          {
            name: 'dropdown',
            paramName: 'status_category',
            options: [
              {
                value: 'Category',
                label: 'Category'
              },
              {
                value: 'Status',
                label: 'Status'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Projects',
    subTabs: [
      {
        name: 'Project Impact',
        value: 'Project Impact',
        route: '',
        components: [
          {
            name: 'dropdown',
            options: [
              {
                value: 'Energy Savings',
                label: 'Energy Savings',
                route:
                  'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioMeasures/PortfolioMeasures?chart_type=projects_energy_savings',
                exportBeta:
                  'https://tableau.buildee.com//buildee/views/Projects-EnergySavingsbyStatusCategory/Projects-EnergySavingsbyStatusCategory.pdf',
                exportQA:
                  'https://tableau.buildee.com/t/buildeebeta/views/Projects-EnergySavingsbyStatusCategory/Projects-EnergySavingsbyStatusCategory.pdf'
              },
              {
                value: 'GHG Reduction',
                label: 'GHG Reduction',
                route:
                  'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioMeasures/PortfolioMeasures?chart_type=projects_emissions_savings',
                exportBeta:
                  'https://tableau.buildee.com/t/buildee/views/Projects-GHGReductionbyStatusCategory/Projects-GHGReductionbyStatusCategory.pdf',
                exportQA:
                  'https://tableau.buildee.com/t/buildeebeta/views/Projects-GHGReductionbyStatusCategory/Projects-GHGReductionbyStatusCategory.pdf'
              }
            ]
          },
          {
            name: 'dropdown',
            paramName: 'status_category',
            options: [
              {
                value: 'Category',
                label: 'Category'
              },
              {
                value: 'Status',
                label: 'Status'
              }
            ]
          }
        ]
      },
      {
        name: 'Project Value',
        value: 'Project Value',
        route: '',
        components: [
          {
            name: 'dropdown',
            options: [
              {
                value: 'Cost Savings',
                label: 'Cost Savings',
                route:
                  'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioMeasures/PortfolioMeasures?chart_type=projects_cost_savings',
                exportBeta:
                  'https://tableau.buildee.com/t/buildee/views/Projects-CostSavingsbyStatusCategory/Projects-CostSavingsbyStatusCategory.pdf',
                exportQA:
                  'https://tableau.buildee.com/t/buildeebeta/views/Projects-CostSavingsbyStatusCategory/Projects-CostSavingsbyStatusCategory.pdf'
              },
              {
                value: 'Cost',
                label: 'Cost',
                route:
                  'https://tableau.buildee.com/#/site/buildeebeta/views/PortfolioMeasures/PortfolioMeasures?chart_type=projects_cost',
                exportBeta:
                  'https://tableau.buildee.com/t/buildee/views/Projects-CostbyStatusCategory/Projects-CostbyStatusCategory.pdf',
                exportQA:
                  'https://tableau.buildee.com/t/buildeebeta/views/Projects-CostbyStatusCategory/Projects-CostbyStatusCategory.pdf'
              }
            ]
          },
          {
            name: 'dropdown',
            paramName: 'status_category',
            options: [
              {
                value: 'Category',
                label: 'Category'
              },
              {
                value: 'Status',
                label: 'Status'
              }
            ]
          }
        ]
      }
    ]
  }
]

//Scenario Tabs
export const scenarioTabs = [
  {
    name: 'Comparison',
    subTabs: [
      {
        name: 'Energy Savings',
        value: 'Energy Savings',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/ScenarioComparisionviewEnergySavings/ScenarioComparisionviewEnergySavings',
        components: [
          {
            name: 'toggle',
            paramName: 'is_stacked_bar',
            options: [
              {
                value: 'Total',
                icon: 'bar_chart'
              },
              {
                value: 'By Commodity',
                icon: 'stacked_bar_chart'
              }
            ]
          }
        ]
      },
      {
        name: 'GHG Reduction',
        value: 'GHG Reduction',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/ScenarioComparisionviewGHGReduction/ScenarioComparisionviewGHGReduction',
        exportBeta:
          'https://tableau.buildee.com/t/buildee/views/AnnualEnergyCostbyFuel/AnnualEnergyCostbyFuel.pdf',
        exportQA:
          'https://tableau.buildee.com/t/buildeebeta/views/AnnualEnergyCostbyFuel/AnnualEnergyCostbyFuel.pdf',
        components: [
          {
            name: 'toggle',
            paramName: 'is_stacked_bar',
            options: [
              {
                value: 'Total',
                icon: 'bar_chart'
              },
              {
                value: 'By Commodity',
                icon: 'stacked_bar_chart'
              }
            ]
          }
        ]
      },
      {
        name: 'Cost Savings',
        value: 'Cost Savings',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/ScenarioComparisionviewCostSavings/ScenarioComparisionviewCostSavings',
        components: [
          {
            name: 'toggle',
            paramName: 'is_stacked_bar',
            options: [
              {
                value: 'Total',
                icon: 'bar_chart'
              },
              {
                value: 'By Commodity',
                icon: 'stacked_bar_chart'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Timeline',
    subTabs: [
      {
        name: 'Energy Savings',
        value: 'Energy Savings',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/ScenarioTimelineviewEnergySavings/ScenarioTimelineviewEnergySavings'
      },
      {
        name: 'GHG Reduction',
        value: 'GHG Reduction',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/ScenarioTimelineviewGHGReduction/ScenarioTimelineviewGHGReduction'
      },
      {
        name: 'Cost Savings',
        value: 'Cost Savings',
        route:
          'https://tableau.buildee.com/#/site/buildeebeta/views/ScenarioTimelineviewCostSavings/ScenarioTimelineviewCostSavings'
      }
    ]
  }
]

export const getTeamColumnOptions = view => {
  if (view === 'Project') {
    return {
      defaultTeamColumn: defaultTeamProjectColumn,
      teamColumnOptions: teamColumnProjectOptions
    }
  }
  if (view === 'Proposal') {
    return {
      defaultTeamColumn: defaultTeamProposalColumn,
      teamColumnOptions: teamColumnProposalOptions
    }
  }

  return {
    defaultTeamColumn: defaultTeamMeasureColumn,
    teamColumnOptions: teamColumnMeasureOptions
  }
}
