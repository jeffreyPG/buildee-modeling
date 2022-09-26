import Quill from 'quill'
import styles from './ImageTag.scss'

const EmbedBlock = Quill.import('blots/embed')

export class ImageTag extends EmbedBlock {
  static blotName = 'imageTag'
  static tagName = 'span'
  static className = 'qlImageTag'

  static create(data) {
    const node = super.create(data)
    let src = ''
    node.setAttribute('option', data.option)
    if (data.option === 'imageUpload') {
      src = data.imageUrl
    } else {
      if (data.option === 'buildingImage') {
        src = `{{building.buildingImage}}{{^building.buildingImage}}https://buildee-test.s3-us-west-2.amazonaws.com/public/domain_black_48dp.svg{{/building.buildingImage}}`
      } else {
        src = `{{user.image}}{{^user.image}}https://buildee-test.s3-us-west-2.amazonaws.com/public/contacts_black_48dp.svg{{/user.image}}`
      }
      const dim = data.width !== 'auto' ? data.width : data.height
      node.style.height = `${dim}px`
      node.style.width = `${dim}px`
    }
    node.innerHTML = `<img src=${src} width=${data.width !== 'auto' &&
      data.width} height=${data.height !== 'auto' && data.height}/>`
    return ImageTag.setDataValues(node, data)
  }

  static setDataValues(element, data) {
    const domNode = element
    Object.keys(data).forEach(key => {
      domNode.dataset[key] = data[key]
    })
    return domNode
  }

  static value(domNode) {
    return domNode.dataset
  }
}
