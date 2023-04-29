<script>
import {postRequest} from "@/http/request_service.js";
const STORAGE_KEY = 'todo-tags'


export default {
  // app initial state
  data: () => ({
    todos: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
    editedTodo: null,
    newtitle:"",
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
  },
  computed: {
    filteredTags(){
      return this.todos.filter(item=>item.id!==1)
    }
  },

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    toggleAll(e) {
      this.todos.forEach((todo) => (todo.completed = e.target.checked))
    },

    addTodo(e) {
      const value = this.newtitle.trim()
      if (!value) {
        return
      }
      this.todos.push({
        id: Date.now(),
        value: value,
        completed: false
      })
      this.newtitle = "";
    },
    handleAdd(){
      if(!this.newtitle) return;
      this.todos.push({
        id: Date.now(),
        value: this.newtitle,
        completed: false
      })
      this.newtitle = "";
    },

    removeTodo(todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
    },

    editTodo(todo) {
      this.beforeEditCache = todo.value
      this.editedTodo = todo
    },

    doneEdit(todo) {
      if (!this.editedTodo) {
        return
      }
      this.editedTodo = null
      todo.value = todo.value.trim()
      if (!todo.value) {
        this.removeTodo(todo)
      }
    },

    cancelEdit(todo) {
      this.editedTodo = null
      todo.value = this.beforeEditCache
    },

    removeCompleted() {
      this.todos = filters.active(this.todos)
    },

    selectOnly(value){
      if (this.selectedItem.length ===1 && this.selectedItem[0] === value) {
        this.selectedItem = [];
      } else {
        this.selectedItem = [];
        this.selectedItem.push = value;
      }
    },
    toHome(){
        this.$router.push("/all")
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
      <h1>tags</h1>
      <i class="ticon">T</i>
      <input
        class="new-todo"
        autofocus
        placeholder="Please Input tag"
        @keyup.enter="addTodo"
        v-model="newtitle"
      >
      <span class="add-btn" @click="handleAdd">Add</span>
    </header>
    <section class="main" v-show="todos.length">
      <ul class="todo-list">
        <li
          v-for="todo in filteredTags"
          class="todo"
          :key="todo.id"
          :class="{ completed: todo.completed, editing: todo === editedTodo }"
        >
          <i class="tagicon">T</i>
          <div class="view">
            <!-- <input class="toggle" type="checkbox" v-model="todo.completed"> -->
            <label @dblclick="editTodo(todo)">{{ todo.value }}</label>
            <button class="destroy" @click="removeTodo(todo)"></button>
          </div>
          <input
            v-if="todo === editedTodo"
            class="edit"
            type="text"
            v-model="todo.value"
            v-todo-focus="todo === editedTodo"
            @vnode-mounted="({ el }) => el.focus()"
            @blur="doneEdit(todo)"
            @keyup.enter="doneEdit(todo)"
            @keyup.escape="cancelEdit(todo)"
          >
        </li>
      </ul>
    </section>
    
  </section>
  <div class="left-menu-box">
    <h4>Menu</h4>
    <div class="menu-item">
      <div @click="toHome">Home</div>
      <div class="active">Tags</div>
    </div>
  </div>
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

.tagicon{
    position: absolute;
    width: 50px;
    text-align: center;
    height: 100%;
    line-height: 58.8px;
}
</style>