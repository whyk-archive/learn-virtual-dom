import { h, View } from './frameworks/view';
import { ActionTree } from './frameworks/actions';
import { App } from './frameworks/controller';

interface State {
  tasks: string[]
  form: {
    title: string,
    hasError: boolean
  }
}

const state: State = {
  tasks: [
    'Learn about VDOM',
    'Welcome to Simple VDOM!!'
  ],
  form: {
    title: '',
    hasError: false
  }
}

interface Actions extends ActionTree<State> {
  validate: (state: State, title: string) => boolean
  createTask: (state: State, title: string) => void
  removeTask: (state: State, index: number) => void
}

const actions: Actions = {
  validate(state, title) {
    if (!title || title.length < 3 || title.length > 20) state.form.hasError = true
    else state.form.hasError = false
    return !state.form.hasError
  },
  createTask(state, title = '') {
    state.tasks.push(title)
    state.form.title = ''
  },
  removeTask(state, index) {
    console.log({state, index});
    state.tasks.splice(index, 1)
  }
}

// const oninput = (e: Event) => {
//   const target = e.target as HTMLInputElement
//   state.form.title = target.value
//   actions.validate(state, target.value)
// }

const view: View<State, Actions> = (state, actions) => 
  // <div class="nes-container is-rounded">
  //   <h1 class="title">Virtual DOM TODO App</h1>

  //   <form class="nes-container">
  //     <div class="nes-field">
  //       <label for="task-title">Title</label>

  //       <input
  //         type="text"
  //         class="nes-input"
  //         value={state.form.title}
  //         onInput={() => {/** タイトルのチェック */}}
  //         />

  //       <p
  //         class="nes-text is-error"
  //         style={{ display: state.form.hasError ? 'block' : 'none' }}>
  //         Enter a value between 3 and 20 characters
  //       </p>

  //       <button
  //         type="button"
  //         class="nes-btn is-primary"
  //         onClick={() => {/* 登録処理 */}}
  //         >
  //         Create
  //       </button>
  //     </div>
  //   </form>

  //   <ul class="nes-list is-disc nes-container">
  //     {
  //       state.tasks.map((task) => {
  //         return <li class="item">
  //           {task}
  //           <button
  //             type="button"
  //             class="nes-btn is-error"
  //             onClick={() => {/** 削除処理 */}}>
  //             ×
  //           </button>
  //         </li>
  //       })
  //     }
  //   </ul>
  // </div>

  h(
    'div', 
    { 
      class: 'nes-container is-rounded',
      style: 'padding: 2rem;'
    },
    h(
      'h1',
      {
        class: 'title',
        style: 'margin-bottom: 2rem;'
      },
      h('i', { class: 'nes-icon heart is-medium' }),
      'Virtual DOM TODO App '
    ),
    h(
      'form',
      {
        class: 'nes-container',
        style: 'margin-bottom: 2rem;'
      },
      h(
        'div',
        {
          class: 'nes-field',
          style: 'margin-bottom: 1rem;',
        },
        h(
          'label',
          {
            class: 'label',
            for: 'task-title'
          },
          'Title'
        ),
        h('input', {
          type: 'text',
          id: 'task-title',
          class: 'nes-input',
          value: state.form.title,
          oninput: (event: Event) => {
            const target = event.target as HTMLInputElement
            state.form.title = target.value
            actions.validate(state, target.value)
          }
        }),
      ),
      h(
        'p',
        {
          class: 'nes-text is-error',
          style: `display: ${state.form.hasError ? 'display' : 'none'}`,
        },
        'Enter a value between 3 and 20 characters'
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'nes-btn is-primary',
          onclick: () => {
            if (state.form.hasError) return
            actions.createTask(state, state.form.title)
          }
        },
        'Create'
      )
    ),
    h(
      'ul',
      { class: 'nes-list is-disc nes-container' },
      ...state.tasks.map((task, i) => {
        return h(
          'li',
          {
            class: 'item',
            style: 'margin-bottom: 1rem;'
          },
          task,
          h(
            'button',
            {
              type: 'button',
              class: 'nes-btn is-error',
              style: 'margin-left: 1rem;',
              onclick: () => actions.removeTask(state, i)
            },
            '×'
          )
        )
      })
    )
  )

new App<State, Actions>({
  el: '#app',
  state,
  view,
  actions
})