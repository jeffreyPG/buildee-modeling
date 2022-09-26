import Quill from 'quill'
import styles from './DynamicTag.scss'

const EmbedBlock = Quill.import('blots/embed')

export class DynamicTag extends EmbedBlock {
  static blotName = 'dynamicTag'
  static tagName = 'span'
  static className = 'qlDynamicTag'

  static create(data) {
    const node = super.create(data)
    node.innerHTML = `{{${data.value}}}{{^${data.value}}}${data.defaultValue ||
      ''}{{/${data.value}}}`
    return DynamicTag.setDataValues(node, data)
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
