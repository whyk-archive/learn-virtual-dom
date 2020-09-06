type NodeType = VNode | string | number
type AttributeType = string | EventListener
type Attributes = {
  [attr: string]: AttributeType
}

export interface VNode {
  nodeName: keyof ElementTagNameMap
  attributes: Attributes
  children: NodeType[]
}

export interface View<State, Actions> {
  (state: State, actions: Actions): VNode
}

/**
 * 仮想DOMを作成する
 * @param nodeName Node名
 * @param attributes Node属性
 * @param children Nodeの子要素リスト
 */
export const h = (nodeName: VNode['nodeName'], attributes: VNode['attributes'], ...children: VNode['children']): VNode => ({nodeName, attributes, children})

const isEventAttr = (attribute: string): boolean => /^on/.test(attribute)

const setAttributes = (target: HTMLElement, attributes: Attributes): void => {
  for (const attr in attributes) {
    if (isEventAttr(attr)) {
      const eventName = attr.slice(2)
      target.addEventListener(eventName, attributes[attr] as EventListener)
    } else {
      target.setAttribute(attr, attributes[attr] as string)
    }
  }
}

const isVNode = (node: NodeType): node is VNode => typeof node !== 'string' && typeof node !== 'number'

/**
 * Elementの作成
 * @param node 対象となるElement
 */
export const createElement = (node: NodeType): HTMLElement | Text => {
  if (!isVNode(node)) return document.createTextNode(node.toString())

  const el = document.createElement(node.nodeName)
  setAttributes(el, node.attributes)
  node.children.forEach(child => el.appendChild(createElement(child)))
  return el
}

/**
 * 仮想DOMの変更種別
 */
enum ChangeType {
  None,
  Type,
  Text,
  Node,
  Value,
  Attr
}

/**
 * 差分検知
 * @param oldNode 古いNode情報
 * @param newNode 新しいNode情報
 */
const hasChanged = (oldNode: NodeType, newNode: NodeType): ChangeType => {
  if (typeof oldNode !== typeof newNode) return ChangeType.Type
  if (!isVNode(oldNode) && oldNode !== newNode) return ChangeType.Text
  if (isVNode(oldNode) && isVNode(newNode)) {
    if (oldNode.nodeName !== newNode.nodeName) return ChangeType.Node
    if (oldNode.attributes.value !== newNode.attributes.value) return ChangeType.Value
    if (JSON.stringify(oldNode.attributes) !== JSON.stringify(newNode.attributes)) return ChangeType.Attr
  }
  return ChangeType.None
}

/**
 * input要素のvalueを更新する
 * @param target 対象のinput要素
 * @param newVal inputのvalueに設定する値
 */
const updateInputValue = (target: HTMLInputElement, newVal: string): void => { target.value = newVal }

/**
 * 属性の更新
 * @param target 対象のElement
 * @param oldAttrs 古い属性
 * @param newAttrs 新しい属性
 */
const updateAttributes = (target: HTMLElement, oldAttrs: Attributes, newAttrs: Attributes): void => {
  for (const attr in oldAttrs) {
    if (!isEventAttr(attr)) target.removeAttribute(attr)
  }
  for (const attr in newAttrs) {
    if (!isEventAttr(attr)) target.setAttribute(attr, newAttrs[attr] as string)
  }
}

/**
 * 仮想DOMの変更を実DOMに反映
 * @param parent 親要素
 * @param oldNode 古いNode情報
 * @param newNode 新しいNode情報
 * @param index 子要素の順番
 */
export const updateElement = (parent: HTMLElement, oldNode: NodeType, newNode: NodeType, index = 0): void => {
  if (!oldNode) {
    parent.appendChild(createElement(newNode))
    return
  }

  const target = parent.childNodes[index]
  if (!newNode) {
    parent.removeChild(target)
    return
  }

  const changetype = hasChanged(oldNode, newNode)
  if ([ChangeType.Type, ChangeType.Text, ChangeType.Node].includes(changetype)) {
    parent.replaceChild(createElement(newNode), target)
    return
  } else if (changetype === ChangeType.Value) {
    updateInputValue(target as HTMLInputElement, (newNode as VNode).attributes.value as string)
    return
  } else if (changetype === ChangeType.Attr) {
    updateAttributes(target as HTMLInputElement, (oldNode as VNode).attributes, (newNode as VNode).attributes)
    return
  }

  if (isVNode(oldNode) && isVNode(newNode)) {
    for (let i = 0; newNode.children.length > i || oldNode.children.length > i; i++) {
      updateElement(target as HTMLElement, oldNode.children[i], newNode.children[i], i)
    }
  }
}
