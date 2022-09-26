import { DynamicTag } from '../DynamicTag/DynamicTag'
import styles from './ContactTag.scss'

export class ContactTag extends DynamicTag {
  static blotName = 'contactTag'
  static tagName = 'span'
  static className = 'qlContactTag'

  static create(data) {
    const node = super.create(data)
    node.innerHTML = `{{#list contact}}{{#isEqual role "${data.role}"}}{{${
      data.value
    }}}{{else}}${data.defaultValue || ''}{{/isEqual}}{{/list}}`
    return ContactTag.setDataValues(node, data)
  }
}
