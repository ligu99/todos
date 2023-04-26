<script>
import {postRequest} from "@/http/request_service.js";
const STORAGE_KEY = 'vue-todomvc'

const filters = {
  all: (todos) => todos,
  active: (todos) => todos.filter((todo) => !todo.completed),
  completed: (todos) => todos.filter((todo) => todo.completed)
}

export default {
  // app initial state
  data: () => ({
    todos: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
    editedTodo: null,
    visibility: 'all'
  }),

  // watch todos change for localStorage persistence
  watch: {
    todos: {
      handler(todos) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
      },
      deep: true
    }
  },

  mounted() {
    window.addEventListener('hashchange', this.onHashChange)
    this.onHashChange()
  },

  computed: {
    filteredTodos() {
      return filters[this.visibility](this.todos)
    },
    remaining() {
      return filters.active(this.todos).length
    }
  },

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    toggleAll(e) {
      this.todos.forEach((todo) => (todo.completed = e.target.checked))
    },

    addTodo(e) {
      const value = e.target.value.trim()
      if (!value) {
        return
      }
      this.todos.push({
        id: Date.now(),
        title: value,
        completed: false
      })
      this.saveToDB(value)
      e.target.value = ''
    },
    saveToDB(value){
      postRequest("/todos/add",{id: Date.now(),todoValue:value}).then(res=>{
        console.log(res);
      })
    },
    removeTodo(todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
    },

    editTodo(todo) {
      this.beforeEditCache = todo.title
      this.editedTodo = todo
    },

    doneEdit(todo) {
      if (!this.editedTodo) {
        return
      }
      this.editedTodo = null
      todo.title = todo.title.trim()
      if (!todo.title) {
        this.removeTodo(todo)
      }else{
        if(this.beforeEditCache !== todo.title){
          this.saveToDB(todo.title)
        }
      }
    },

    cancelEdit(todo) {
      this.editedTodo = null
      todo.title = this.beforeEditCache
    },

    removeCompleted() {
      this.todos = filters.active(this.todos)
    },

    onHashChange() {
      var visibility = window.location.hash.replace(/#\/?/, '')
      if (filters[visibility]) {
        this.visibility = visibility
      } else {
        window.location.hash = ''
        this.visibility = 'all'
      }
    }
  },
  directives: {
    "todo-focus": {
      inserted:function(el, binding) {
        if (binding.value) {
          el.focus();
        }
      }
    }
  },
}
</script>

<template>
<div>
  <section class="todoapp">
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        autofocus
        placeholder="What needs to be done?"
        @keyup.enter="addTodo"
      >
    </header>
    <section class="main" v-show="todos.length">
      <input
        id="toggle-all"
        class="toggle-all"
        type="checkbox"
        :checked="remaining === 0"
        @change="toggleAll"
      >
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list">
        <li
          v-for="todo in filteredTodos"
          class="todo"
          :key="todo.id"
          :class="{ completed: todo.completed, editing: todo === editedTodo }"
        >
          <div class="view">
            <input class="toggle" type="checkbox" v-model="todo.completed">
            <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
            <button class="destroy" @click="removeTodo(todo)"></button>
          </div>
          <input
            v-if="todo === editedTodo"
            class="edit"
            type="text"
            v-model="todo.title"
            v-todo-focus="todo === editedTodo"
            @vnode-mounted="({ el }) => el.focus()"
            @blur="doneEdit(todo)"
            @keyup.enter="doneEdit(todo)"
            @keyup.escape="cancelEdit(todo)"
          >
        </li>
      </ul>
    </section>
    <footer class="footer" v-show="todos.length">
      <span class="todo-count">
        <strong>{{ remaining }}</strong>
        <span>{{ remaining === 1 ? ' item' : ' items' }} left</span>
      </span>
      <ul class="filters">
        <li>
          <a href="#/all" :class="{ selected: visibility === 'all' }">All</a>
        </li>
        <li>
          <a href="#/active" :class="{ selected: visibility === 'active' }">Active</a>
        </li>
        <li>
          <a href="#/completed" :class="{ selected: visibility === 'completed' }">Completed</a>
        </li>
      </ul>
      <button class="clear-completed" @click="removeCompleted" v-show="todos.length > remaining">
        Clear completed
      </button>
    </footer>
  </section>
  <div class="textcenter">
    <div class="fs14">Double-click to edit a todo</div>
    <div class="fs14">Copyright © 2023-present Phil</div>
  </div>
</div>
</template>

<style scoped>
@import '~@/assets/index.css'; 
</style>
<style lang="less">
.textcenter{
  text-align: center;
}
.fs14{
  font-size: 14px;
  opacity: 0.5;
}
.filters {
  color: #777777;
}
</style>