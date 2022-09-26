const industryTypes = [
  { value: 'advertising', name: 'Advertising' },
  { value: 'aerospacedefense', name: 'Aerospace/Defense' },
  { value: 'air-transport', name: 'Air Transport' },
  { value: 'apparel', name: 'Apparel' },
  { value: 'auto-truck', name: 'Auto & Truck' },
  { value: 'auto-parts', name: 'Auto Parts' },
  { value: 'bank-money-center', name: 'Bank (Money Center)' },
  { value: 'bank-regional', name: 'Banks (Regional)' },
  { value: 'beverage-alcoholic', name: 'Beverage (Alcoholic)' },
  { value: 'beverage-soft', name: 'Beverage (Soft)' },
  { value: 'broadcasting', name: 'Broadcasting' },
  {
    value: 'brokerage-investment-banking',
    name: 'Brokerage & Investment Banking'
  },
  {
    name: 'Building Materials',
    value: 'building-materials'
  },
  {
    name: 'Business & Consumer Services',
    value: 'business-consumer-services'
  },
  {
    name: 'Cable TV',
    value: 'cable-tv'
  },
  {
    name: 'Chemical (Basic)',
    value: 'chemical-basic'
  },
  {
    name: 'Chemical (Diversified)',
    value: 'chemical-diversified'
  },
  {
    name: 'Chemical (Specialty)',
    value: 'chemical-specialty'
  },
  {
    name: 'Coal & Related Energy',
    value: 'coal-related-energy'
  },
  {
    name: 'Computer Services',
    value: 'computer-services'
  },
  {
    name: 'Computers/Peripherals',
    value: 'computersperipherals'
  },
  {
    name: 'Construction Supplies',
    value: 'construction-supplies'
  },
  {
    name: 'Diversified',
    value: 'diversified'
  },
  {
    name: 'Drugs (Biotechnology)',
    value: 'drugs-biotechnology'
  },
  {
    name: 'Drugs (Pharmaceutical)',
    value: 'drugs-pharmaceutical'
  },
  {
    name: 'Education',
    value: 'education'
  },
  {
    name: 'Electrical Equipment',
    value: 'electrical-equipment'
  },
  {
    name: 'Electronics (Consumer & Office)',
    value: 'electronics-consumer-office'
  },
  {
    name: 'Electronics (General)',
    value: 'electronics-general'
  },
  {
    name: 'Engineering/Construction',
    value: 'engineeringconstruction'
  },
  {
    name: 'Entertainment',
    value: 'entertainment'
  },
  {
    name: 'Environmental & Waste Services',
    value: 'environmental-waste-services'
  },
  {
    name: 'Farming/Agriculture',
    value: 'farmingagriculture'
  },
  {
    name: 'Financial Svcs. (Non-bank & Insurance)',
    value: 'financial-svcs-nonbank-insurance'
  },
  {
    name: 'Food Processing',
    value: 'food-processing'
  },
  {
    name: 'Food Wholesalers',
    value: 'food-wholesalers'
  },
  {
    name: 'Furn/Home Furnishings',
    value: 'furnhome-furnishings'
  },
  {
    name: 'Green & Renewable Energy',
    value: 'green-renewable-energy'
  },
  {
    name: 'Healthcare Products',
    value: 'healthcare-products'
  },
  {
    name: 'Healthcare Support Services',
    value: 'healthcare-support-services'
  },
  {
    name: 'Healthcare Information and Technology',
    value: 'healthcare-information-and-technology'
  },
  {
    name: 'Homebuilding',
    value: 'homebuilding'
  },
  {
    name: 'Hospitals/Healthcare Facilities',
    value: 'hospitalshealthcare-facilities'
  },
  {
    name: 'Hotel/Gaming',
    value: 'hotelgaming'
  },
  {
    name: 'Household Products',
    value: 'household-products'
  },
  {
    name: 'Information Services',
    value: 'information-services'
  },
  {
    name: 'Insurance (General)',
    value: 'insurance-general'
  },
  {
    name: 'Insurance (Life)',
    value: 'insurance-life'
  },
  {
    name: 'Insurance (Prop/Cas.)',
    value: 'insurance-propcas'
  },
  {
    name: 'Investments & Asset Management',
    value: 'investments-asset-management'
  },
  {
    name: 'Machinery',
    value: 'machinery'
  },
  {
    name: 'Metals & Mining',
    value: 'metals-mining'
  },
  {
    name: 'Office Equipment & Services',
    value: 'office-equipment-services'
  },
  {
    name: 'Oil/Gas (Integrated)',
    value: 'oilgas-integrated'
  },
  {
    name: 'Oil/Gas (Production and Exploration)',
    value: 'oilgas-production-and-exploration'
  },
  {
    name: 'Oil/Gas Distribution',
    value: 'oilgas-distribution'
  },
  {
    name: 'Oilfield Svcs/Equip.',
    value: 'oilfield-svcsequip'
  },
  {
    name: 'Packaging & Container',
    value: 'packaging-container'
  },
  {
    name: 'Paper/Forest Products',
    value: 'paperforest-products'
  },
  {
    name: 'Power',
    value: 'power'
  },
  {
    name: 'Precious Metals',
    value: 'precious-metals'
  },
  {
    name: 'Publshing & Newspapers',
    value: 'publshing-newspapers'
  },
  {
    name: 'R.E.I.T',
    value: 'reit'
  },
  {
    name: 'Real Estate (Development)',
    value: 'real-estate-development'
  },
  {
    name: 'Real Estate (General/Diversified)',
    value: 'real-estate-generaldiversified'
  },
  {
    name: 'Real Estate (Operations & Services)',
    value: 'real-estate-operations-services'
  },
  {
    name: 'Recreation',
    value: 'recreation'
  },
  {
    name: 'Reinsurance',
    value: 'reinsurance'
  },
  {
    name: 'Restaurant/Dining',
    value: 'restaurantdining'
  },
  {
    name: 'Retail (Automotive)',
    value: 'retail-automotive'
  },
  {
    name: 'Retail (Building Supply)',
    value: 'retail-building-supply'
  },
  {
    name: 'Retail (Distributors)',
    value: 'retail-distributors'
  },
  {
    name: 'Retail (General)',
    value: 'retail-general'
  },
  {
    name: 'Retail (Grocery and Food)',
    value: 'retail-grocery-and-food'
  },
  {
    name: 'Retail (Online)',
    value: 'retail-online'
  },
  {
    name: 'Retail (Special Lines)',
    value: 'retail-special-lines'
  },
  {
    name: 'Rubber & Tires',
    value: 'rubber-tires'
  },
  {
    name: 'Semiconductor',
    value: 'semiconductor'
  },
  {
    name: 'Semiconductor Equip',
    value: 'semiconductor-equip'
  },
  {
    name: 'Shipbuilding & Marine',
    value: 'shipbuilding-marine'
  },
  {
    name: 'Shoe',
    value: 'shoe'
  },
  {
    name: 'Software (Entertainment)',
    value: 'software-entertainment'
  },
  {
    name: 'Software (Internet)',
    value: 'software-internet'
  },
  {
    name: 'Software (System & Application)',
    value: 'software-system-application'
  },
  {
    name: 'Steel',
    value: 'steel'
  },
  {
    name: 'Telecom (Wireless)',
    value: 'telecom-wireless'
  },
  {
    name: 'Telecom. Equipment',
    value: 'telecom-equipment'
  },
  {
    name: 'Telecom. Services',
    value: 'telecom-services'
  },
  {
    name: 'Tobacco',
    value: 'tobacco'
  },
  {
    name: 'Transportation',
    value: 'transportation'
  },
  {
    name: 'Transportation (Railroads)',
    value: 'transportation-railroads'
  },
  {
    name: 'Trucking',
    value: 'trucking'
  },
  {
    name: 'Unclassified',
    value: 'unclassified'
  },
  {
    name: 'Utility (General)',
    value: 'utility-general'
  },
  {
    name: 'Utility (Water)',
    value: 'utility-water'
  },
  {
    name: 'Worship Facility',
    value: 'Worship Facility'
  },
  {
    name: 'Senior Living Community',
    value: 'Senior Living Community'
  },
  {
    name: 'Daycare/Childcare Center',
    value: 'Daycare/Childcare Center'
  }
]

export default industryTypes.sort((a, b) => (a.name > b.name ? 1 : -1))
