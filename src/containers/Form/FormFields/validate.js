const validate = values => {
  const errors = {}
  if (!values.buildingName) {
    errors.buildingName = 'Required'
  }

  if (
    values.postalCode &&
    !/(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$)/i.test(
      values.postalCode
    )
  ) {
    errors.postalCode = 'Invalid Postal Code'
  }

  if (!values.floorCount) {
    // errors.floorCount = 'Required'
  } else if (!/^[0-9]*$/i.test(values.floorCount)) {
    errors.floorCount = 'Please enter a valid number'
  }

  if (!values.squareFeet) {
    // errors.squareFeet = 'Required'
  } else if (!/^[0-9]*$/i.test(values.squareFeet)) {
    errors.squareFeet = 'Please enter a valid number'
  }

  if (!values.buildYear) {
    // errors.buildYear = 'Required'
  } else if (!/^[12][0-9]{3}$/i.test(values.buildYear)) {
    errors.buildYear = 'Please enter a valid year'
  }

  // if (!values.buildingUse) {
  //   errors.buildingUse = 'Required'
  // }

  // if (!values.open247) {
  //   errors.open247 = 'Required'
  // }

  return errors
}

export default validate
