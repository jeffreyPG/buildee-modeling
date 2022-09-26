import gql from 'graphql-tag'

const equipmentField = '{ displayName value display }'

const equipmentCategorization = `
  EquipmentCategorizationResult {
    category {
      displayName
      value
    }
    application {
      displayName
      value
    }
    technology {
      displayName
      value
    }
  }
`
export const equipmentFragment = `
  Equipment {
    _id
    application
    category
    description
    technology
    type
    name
    organization
    fuel
    fields {
      absorptionType ${equipmentField}
      access ${equipmentField}
      activeModePower ${equipmentField}
      afue ${equipmentField}
      ahri_certifiedReferenceNumber ${equipmentField}
      airDryerAirflow ${equipmentField}
      alarms ${equipmentField}
      amperage ${equipmentField}
      annualEnergyUse ${equipmentField}
      apparentPower ${equipmentField}
      apparentPowerRating ${equipmentField}
      asFoundInletWaterTemp ${equipmentField}
      asFoundOperatingTemperature ${equipmentField}
      asFoundOutletWaterTemp ${equipmentField}
      averageStandbyPower ${equipmentField}
      ballastFactor ${equipmentField}
      ballastType ${equipmentField}
      bciGroup ${equipmentField}
      boilerDesign ${equipmentField}
      bowlModel ${equipmentField}
      booster ${equipmentField}
      brand ${equipmentField}
      brandProductLine ${equipmentField}
      btu ${equipmentField}
      btuh ${equipmentField}
      burnerManufacturer ${equipmentField}
      burnerQuantity ${equipmentField}
      burnerType ${equipmentField}
      bil ${equipmentField}
      bankType ${equipmentField}
      bankConnection ${equipmentField}
      branch ${equipmentField}
      cadb_addDate ${equipmentField}
      capacity ${equipmentField}
      capacityGallons ${equipmentField}
      capacityLbs ${equipmentField}
      capacityTons ${equipmentField}
      capacitorQuantity ${equipmentField}
      cct ${equipmentField}
      ceilingHeight ${equipmentField}
      cellType ${equipmentField}
      cfh ${equipmentField}
      cfm ${equipmentField}
      chemicalType ${equipmentField}
      chemistry ${equipmentField}
      chilledWaterMeterCharacteristics ${equipmentField}
      chilledWaterMeterDisplay ${equipmentField}
      chilledWaterMeterEndUse ${equipmentField}
      chilledWaterMeterNumber ${equipmentField}
      chilledWaterMeterType ${equipmentField}
      chilledWaterSource ${equipmentField}
      coldCrankingAmps ${equipmentField}
      compressorCapacity ${equipmentField}
      compressorLocation ${equipmentField}
      compressorMotorPower ${equipmentField}
      compressorPower ${equipmentField}
      compressorType ${equipmentField}
      condenserFanPower ${equipmentField}
      condenserLocation ${equipmentField}
      condenserType ${equipmentField}
      condensing ${equipmentField}
      condFlowRate ${equipmentField}
      connectivity ${equipmentField}
      controlType ${equipmentField}
      cookingType ${equipmentField}
      coolantTemp ${equipmentField}
      coolantType ${equipmentField}
      coolingCapacity ${equipmentField}
      coolingTowerWaterMeterCharacteristics ${equipmentField}
      coolingTowerWaterMeterDisplay ${equipmentField}
      coolingTowerWaterMeterEndUse ${equipmentField}
      coolingTowerWaterMeterNumber ${equipmentField}
      coolingTowerWaterMeterType ${equipmentField}
      coolingType ${equipmentField}
      cop ${equipmentField}
      circuitNumber ${equipmentField}
      crankingAmps ${equipmentField}
      dataSource ${equipmentField}
      description ${equipmentField}
      designInletWaterTemp ${equipmentField}
      designOutletWaterTemp ${equipmentField}
      designTemperature ${equipmentField}
      depth ${equipmentField}
      dimension ${equipmentField}
      direction ${equipmentField}
      dischargeFlow ${equipmentField}
      dischargeFlowRate ${equipmentField}
      dischargePressure ${equipmentField}
      dishwasherType ${equipmentField}
      displayType ${equipmentField}
      districtSteamOperatingPressure ${equipmentField}
      draftEquipment ${equipmentField}
      draftType ${equipmentField}
      driveMotorEfficiency ${equipmentField}
      driveMotorPower ${equipmentField}
      driveType ${equipmentField}
      eer ${equipmentField}
      eer25Load ${equipmentField}
      eer50Load ${equipmentField}
      eer75Load ${equipmentField}
      eerFullLoad ${equipmentField}
      efficiency ${equipmentField}
      elecEfficiency ${equipmentField}
      electricInput ${equipmentField}
      electricMeterEndUse ${equipmentField}
      electricMeterNumber ${equipmentField}
      electricMeterType ${equipmentField}
      electricMeterTypeIfOther ${equipmentField}
      enclosureType ${equipmentField}
      energyConsumptionPer100LbsOfIce ${equipmentField}
      energyFactor ${equipmentField}
      energyInputRateKbtuh ${equipmentField}
      energyInputRateW ${equipmentField}
      energySource ${equipmentField}
      energyStarRated ${equipmentField}
      evapFlowRate ${equipmentField}
      evaporatorFanPower ${equipmentField}
      fanAirFlowRate ${equipmentField}
      fanConfiguration ${equipmentField}
      fanControl ${equipmentField}
      fanEfficiency ${equipmentField}
      fanGeometry ${equipmentField}
      fanManufacturer ${equipmentField}
      fanModel ${equipmentField}
      fanMotorEfficiency ${equipmentField}
      fanMotorPower ${equipmentField}
      fanPower ${equipmentField}
      fanYearOfManufacture ${equipmentField}
      feedwaterTankSize ${equipmentField}
      feetOfHead ${equipmentField}
      flowRate ${equipmentField}
      fluidType ${equipmentField}
      flushingDeviceType ${equipmentField}
      flushMechanism ${equipmentField}
      flushType ${equipmentField}
      flushVolume ${equipmentField}
      fpm ${equipmentField}
      frequency ${equipmentField}
      fuelInput ${equipmentField}
      fuelSource ${equipmentField}
      fullLoadAmps ${equipmentField}
      generatorInupt ${equipmentField}
      gpd ${equipmentField}
      gph ${equipmentField}
      gpm ${equipmentField}
      harvestRate ${equipmentField}
      heaterType ${equipmentField}
      heatingCapacity ${equipmentField}
      heatingHotWaterMeterCharacteristics ${equipmentField}
      heatingHotWaterMeterDisplay ${equipmentField}
      heatingHotWaterMeterEndUse ${equipmentField}
      heatingHotWaterMeterNumber ${equipmentField}
      heatingHotWaterMeterType ${equipmentField}
      heatingHotWaterSource ${equipmentField}
      heatingType ${equipmentField}
      hwhType ${equipmentField}
      heatTransferRate ${equipmentField}
      height ${equipmentField}
      hp ${equipmentField}
      idleEnergyConsumptionRateKbtuh ${equipmentField}
      idleEnergyConsumptionRateW ${equipmentField}
      illuminance ${equipmentField}
      impellerDiameter ${equipmentField}
      indoorType ${equipmentField}
      inducedDraft ${equipmentField}
      inletConnectionSize ${equipmentField}
      inletPipeSize ${equipmentField}
      inletSize ${equipmentField}
      inputCapacity ${equipmentField}
      inputPower ${equipmentField}
      inputPowerAtZeroFlow ${equipmentField}
      insulationThickness ${equipmentField}
      insulationType ${equipmentField}
      iplv ${equipmentField}
      kpa ${equipmentField}
      kaic ${equipmentField}
      lampAnsiDesignation ${equipmentField}
      lampInputPower ${equipmentField}
      lampLightSourceType ${equipmentField}
      lampManufacturer ${equipmentField}
      lampModel ${equipmentField}
      length ${equipmentField}
      loadFactor ${equipmentField}
      lowPowerMode ${equipmentField}
      lowPowerModeFactor ${equipmentField}
      lugs ${equipmentField}
      manufacturer ${equipmentField}
      material ${equipmentField}
      maxAirflow ${equipmentField}
      maxAmbientTemp ${equipmentField}
      maxCapacity ${equipmentField}
      maxChargeAmps ${equipmentField}
      maxChargeCurrent ${equipmentField}
      maxFlow ${equipmentField}
      maxFlowRate ${equipmentField}
      maxFullFlowOperatingPressure ${equipmentField}
      maxHead ${equipmentField}
      maxHeatingCapacity ${equipmentField}
      maximumCompressorPower ${equipmentField}
      maximumCoolingCapacity ${equipmentField}
      maximumEvaporatorFanCapacity ${equipmentField}
      maximumEvaporatorFanPower ${equipmentField}
      maximumFlowRate ${equipmentField}
      maximumHead ${equipmentField}
      maximumWaterFlowRate ${equipmentField}
      maxInletTemp ${equipmentField}
      maxInputCapacity ${equipmentField}
      maxLoad ${equipmentField}
      maxOperatingPressure ${equipmentField}
      maxOutputCapacity ${equipmentField}
      maxPower ${equipmentField}
      maxPressure ${equipmentField}
      maxSpeed ${equipmentField}
      maxTempOutput ${equipmentField}
      mbh ${equipmentField}
      medium ${equipmentField}
      minCapacity ${equipmentField}
      minFullLoadEfficiency ${equipmentField}
      minHeatingCapacity ${equipmentField}
      minimumEvaporatorFanCapacity ${equipmentField}
      minimumEvaporatorFanPower ${equipmentField}
      minimumWaterFlowRate ${equipmentField}
      minInputCapacity ${equipmentField}
      minOperatingPressure ${equipmentField}
      minOutputCapacity ${equipmentField}
      minPressure ${equipmentField}
      model ${equipmentField}
      modelIndoor ${equipmentField}
      modelLongForm ${equipmentField}
      modelOutdoor ${equipmentField}
      modelShortForm ${equipmentField}
      modelStatus ${equipmentField}
      moduleEfficiency ${equipmentField}
      monitorInterval ${equipmentField}
      motorControlType ${equipmentField}
      motorEfficiency ${equipmentField}
      motorized ${equipmentField}
      motorManufacturer ${equipmentField}
      motorModel ${equipmentField}
      motorType ${equipmentField}
      motorYearOfManufacture ${equipmentField}
      naturalGasMeterCharacteristics ${equipmentField}
      naturalGasMeterDisplay ${equipmentField}
      naturalGasMeterEndUse ${equipmentField}
      naturalGasMeterNumber ${equipmentField}
      naturalGasMeterType ${equipmentField}
      networkAddress ${equipmentField}
      ngOutputMethod ${equipmentField}
      nominalOutputPower ${equipmentField}
      numberOfCells ${equipmentField}
      numberOfCircuits ${equipmentField}
      numberOfCompressors ${equipmentField}
      numberOfFans ${equipmentField}
      numberOfLamps ${equipmentField}
      numberOfPoles ${equipmentField}
      numberOfPrvStations ${equipmentField}
      numberOfPumps ${equipmentField}
      nycId ${equipmentField}
      offModePower ${equipmentField}
      oilUse ${equipmentField}
      operatingPower ${equipmentField}
      operatingPressure ${equipmentField}
      outletConnectionSize ${equipmentField}
      outletPipeSize ${equipmentField}
      outletSize ${equipmentField}
      outputCapacity ${equipmentField}
      outputCapacityUnits ${equipmentField}
      outputMethod ${equipmentField}
      outputPressure ${equipmentField}
      outputRating ${equipmentField}
      panelMaxPowerPointCurrent ${equipmentField}
      peakPower ${equipmentField}
      percentSecondary ${equipmentField}
      phase ${equipmentField}
      plateArea ${equipmentField}
      power ${equipmentField}
      powerCapability ${equipmentField}
      powerCapacity ${equipmentField}
      powerFactor ${equipmentField}
      powerPerCycle ${equipmentField}
      powerRating ${equipmentField}
      poles ${equipmentField}
      pressureSetpoint ${equipmentField}
      primaryAirFlowRate ${equipmentField}
      processType ${equipmentField}
      productCategory ${equipmentField}
      prvStation1OutletPressure ${equipmentField}
      prvStation2OutletPressure ${equipmentField}
      prvStation3OutletPressure ${equipmentField}
      prvStation4OutletPressure ${equipmentField}
      prvStation5OutletPressure ${equipmentField}
      psi ${equipmentField}
      pumpEfficiency ${equipmentField}
      pumpManufacturer ${equipmentField}
      pumpModel ${equipmentField}
      pumpSerialNumber ${equipmentField}
      pumpYearOfManufacture ${equipmentField}
      qtyOfCompressors ${equipmentField}
      qtyOfCondensers ${equipmentField}
      qtyOfEvaporators ${equipmentField}
      ratedAirFlow ${equipmentField}
      ratedCapacity ${equipmentField}
      ratedOperatingPressure ${equipmentField}
      ratedOutputCapacity ${equipmentField}
      ratedPower ${equipmentField}
      ratedPowerInput ${equipmentField}
      ratedSensibleCapacity ${equipmentField}
      ratedTotalCapacity ${equipmentField}
      realPower ${equipmentField}
      recessed ${equipmentField}
      rechargeTime ${equipmentField}
      reducedFlushVolume ${equipmentField}
      refrigerantType ${equipmentField}
      rpm ${equipmentField}
      scop ${equipmentField}
      sectionControlType ${equipmentField}
      sectionGrossFloorArea ${equipmentField}
      sectionName ${equipmentField}
      seer ${equipmentField}
      serialNumber ${equipmentField}
      sideAInletFlow ${equipmentField}
      sideAInletPressure ${equipmentField}
      sideAInletTemp ${equipmentField}
      sideAOutletFlow ${equipmentField}
      sideAOutletPressure ${equipmentField}
      sideAOutletTemp ${equipmentField}
      sideBInletFlow ${equipmentField}
      sideBInletPressure ${equipmentField}
      sideBInletTemp ${equipmentField}
      sideBOutletFlow ${equipmentField}
      sideBOutletPressure ${equipmentField}
      sideBOutletTemp ${equipmentField}
      size ${equipmentField}
      sourceType ${equipmentField}
      speed ${equipmentField}
      stages ${equipmentField}
      standbyPower ${equipmentField}
      startingMethod ${equipmentField}
      staticPressure ${equipmentField}
      steamMeterCharacteristics ${equipmentField}
      steamMeterDisplay ${equipmentField}
      steamMeterEndUse ${equipmentField}
      steamMeterNumber ${equipmentField}
      steamMeterType ${equipmentField}
      steamSource ${equipmentField}
      storageCapacity ${equipmentField}
      storagePressure ${equipmentField}
      storageTemperature ${equipmentField}
      supplyFanMotorFrame ${equipmentField}
      supplyFanMotorSerialNumber ${equipmentField}
      supplyFanType ${equipmentField}
      systemSerialNumber ${equipmentField}
      systemType ${equipmentField}
      switchType ${equipmentField}
      tankInsulationRvalue ${equipmentField}
      tankInsulationThickness ${equipmentField}
      tankModel ${equipmentField}
      tankVolume ${equipmentField}
      tempRange ${equipmentField}
      tempRating ${equipmentField}
      thermalEfficiency ${equipmentField}
      toiletType ${equipmentField}
      totalAnnualEnergyConsumption ${equipmentField}
      totalInputPower ${equipmentField}
      totalWaterCapacity ${equipmentField}
      totalWattage ${equipmentField}
      type ${equipmentField}
      unitType ${equipmentField}
      unitVolume ${equipmentField}
      urinalType ${equipmentField}
      useLocations ${equipmentField}
      utilityInput ${equipmentField}
      utilityName ${equipmentField}
      utilityVoltageDropout ${equipmentField}
      utilityVoltagePickup ${equipmentField}
      valveType ${equipmentField}
      ventilationType ${equipmentField}
      voltage ${equipmentField}
      volume ${equipmentField}
      walkinControllerType ${equipmentField}
      waterColumn ${equipmentField}
      waterConsumptionPer100LbsOfIce ${equipmentField}
      waterConsumptionPerCycle ${equipmentField}
      waterLevel ${equipmentField}
      waterMeterCharacteristics ${equipmentField}
      waterMeterDisplay ${equipmentField}
      waterMeterEndUse ${equipmentField}
      waterMeterNumber ${equipmentField}
      waterMeterType ${equipmentField}
      waterSource ${equipmentField}
      waterTemp ${equipmentField}
      waterTempIn ${equipmentField}
      width ${equipmentField}
      yearOfManufacture ${equipmentField}
      mountingType ${equipmentField}
      mountLength ${equipmentField}
      mountWidth ${equipmentField}
      lensType ${equipmentField}
      distribution ${equipmentField}
    }
  }
`

const PROJECT_FRAGMENT = `
  Project {
    _id
    displayName
  }
`

export const buildingEquipmentFragment = `
  BuildingEquipment {
    _id
    quantity
    images
    comments
    location {
      _id
      name
      usetype
      floor
      spaceType
    }
    projects {
      ... on ${PROJECT_FRAGMENT}
    }
    configs {
      field
      value
    }
    maintenances {
      field
      value
    }
    operations
    operation{
      id,
      name
    }
    libraryEquipment {
      ... on ${equipmentFragment}
    }
    createdByUser {
      name
    }
    createdAt
    updatedAt
  }
`

export const ADD_EQUIPMENT = gql`
  mutation addEquipment($equipment: CreateEquipmentInput!) {
    addEquipment(equipment: $equipment) {
      _id
    }
  }
`

export const UPDATE_EQUIPMENT = gql`
  mutation updateEquipment($equipment: UpdateEquipmentInput!) {
    updateEquipment(equipment: $equipment) {
      _id
    }
  }
`

export const ADD_BUILDING_EQUIPMENT = gql`
  mutation addBuildingEquipment($input: addBuildingEquipmentInput!) {
    addBuildingEquipment(input: $input) {
      ... on ${buildingEquipmentFragment}
    }
  }
`
export const COPY_BUILDING_EQUIPMENT = gql`
  mutation copyBuildingEquipment($input: copyBuildingEquipmentInput!) {
    copyBuildingEquipment(input: $input) {
      ... on ${buildingEquipmentFragment}
    }
  }
`

export const GET_BUILDING_EQUIPMENT = gql`
  query BuildingEquipment($buildingId: ID!) {
    buildingEquipment(buildingId: $buildingId) {
      ... on ${buildingEquipmentFragment}
    }
  }
`

export const GET_BUILDING_EQUIPMENT_LIST = gql`
  query BuildingEquipmentList($buildingId: ID!) {
    buildingEquipment(buildingId: $buildingId) {
      ... on ${buildingEquipmentFragment}
    }
    applications {
      value
      displayName
    }
  }
`
export const GET_RECENT_BUILDING_EQUIPMENT = gql`
  query recentBuildingEquipment($buildingId: ID!, $recentEquipment: RecentEquipmentInput) {
    recentBuildingEquipment(buildingId: $buildingId, recentEquipment: $recentEquipment) {
      ... on ${equipmentFragment}
    }
  }
`

export const SEARCH_EQUIPMENT = gql`
  query SearchEquipment($equipment: SearchEquipmentInput!, $search: SearchInput) {
    searchEquipment(equipment: $equipment, search: $search) {
      equipments {
        ... on ${equipmentFragment}
      }
      categorizations {
        ... on ${equipmentCategorization}
      }
    }
  }
`

export const REMOVE_BUILDING_EQUIPMENT = gql`
  mutation removeBuildingEquipment($input: removeBuildingEquipmentInput!) {
    removeBuildingEquipment(input: $input) {
      ... on ${buildingEquipmentFragment}
    }
  }
`

export const REMOVE_BUILDING_EQUIPMENTS = gql`
  mutation removeBuildingEquipments($input: removeBuildingEquipmentsInput!) {
    removeBuildingEquipments(input: $input) {
      deletedIds
    }
  }
`

export const UPDATE_BUILDING_EQUIPMENT = gql`
  mutation updateBuildingEquipment($input: updateBuildingEquipmentInput!) {
    updateBuildingEquipment(input: $input) {
      ... on ${buildingEquipmentFragment}
    }
  }
`
