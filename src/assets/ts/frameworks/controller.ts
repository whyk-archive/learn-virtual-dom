import { View, VNode, createElement, updateElement } from './view';
import { ActionTree } from './actions';

interface AppConstructor<State, Actions extends ActionTree<State>> {
  el: Element | string
  view: View<State, Actions>
  state: State,
  actions: Actions
}

export class App<State, Actions extends ActionTree<State>> {
  private readonly el: Element
  private readonly view: AppConstructor<State, Actions>['view']
  private readonly state: AppConstructor<State, Actions>['state']
  private readonly actions: AppConstructor<State, Actions>['actions']

  private oldNode: VNode
  private newNode: VNode
  private skipRender: boolean

  constructor(params: AppConstructor<State, Actions>) {
    this.el = typeof params.el === 'string' ? document.querySelector(params.el) : params.el
    this.view = params.view
    this.state = params.state,
    this.actions = this.dispatchAction(params.actions)
    this.resolveNode()
  }

  /**
   * ユーザーが定義したActionsに仮想DOMを再構築するためのフックを仕込む
   * @param actions
   */
  private dispatchAction(actions: Actions) {
    const dispatchd: ActionTree<State> = {}

    for (const key in actions) {
      const action = actions[key]
      dispatchd[key] = (state: State, ...data: any) => {
        const ret = action(state, ...data)
        this.resolveNode()
        return ret
      }
    }

    return dispatchd as Actions
  }

  /**
   * 仮想DOMを構築
   */
  private resolveNode() {
    // 仮想DOM再構築
    this.newNode = this.view(this.state, this.actions)
    this.scheduleRender()
  }

  /**
   * renderのスケジューリング
   */
  private scheduleRender() {
    if (!this.skipRender) {
      this.skipRender = true
      setTimeout(this.render.bind(this));
    }
  }

  /**
   * 実DOMに反映
   */
  private render() {
    if (this.oldNode) {
      updateElement(this.el as HTMLElement, this.oldNode, this.newNode)
    } else {
      this.el.appendChild(createElement(this.newNode))
    }
    this.oldNode = this.newNode
    this.skipRender = false
  }
}