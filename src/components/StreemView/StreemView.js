import React from 'react'
import styles from './StreemView.scss'

function generateRandomID(length) {
  var result = ''
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const StreemView = () => {
  return (
    <iframe
      src={`https://buildee.streempro.app/embed?refId=${generateRandomID(
        6
      )}&source=buildee&redirect=callLog`}
      title="Streem"
      className={styles.streemView}
    />
  )
}

export default StreemView
