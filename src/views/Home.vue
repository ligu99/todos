<script>
import {postRequest} from "@/http/request_service.js";
const STORAGE_KEY = 'vue-todomvc'
const TAGS_KEY = 'todo-tags'
const filters = {
  all: (todos) => todos,
  active: (todos) => todos.filter((todo) => !todo.completed),
  completed: (todos) => todos.filter((todo) => todo.completed)
}

export default {
  // app initial state
  data: () => ({
    todos: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
    tags: JSON.parse(localStorage.getItem(TAGS_KEY) || '[]'),
    editedTodo: null,
    visibility: 'all',
    newtitle:"",
    newTagId:"",
    selectedItem:[],
    tagActive:1,
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
    this.onHashChange();
    if(!localStorage.getItem(TAGS_KEY)){
      this.initTags(); 
    }
  },

  computed: {
    filteredTodos() {
      let todos = filters[this.visibility](this.todos);
      if(this.tagActive!==1){
        todos = todos.filter(item=>item.tagId===this.tagActive);
      }
      return todos
    },
    remaining() {
      return filters.active(this.todos).length
    },
    filteredTags(){
      return this.tags.filter(item=>item.id!==1)
    },
    newTagValue(){
      let newTag=this.tags.filter(item=>item.id===this.newTagId)
      return newTag.length>0? newTag[0].value : "";
    }
  },

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    initTags(){
      let arr = [{id:1,value:"All"},{id:2,value:"Public"},{id:3,value:"Private"}]
      localStorage.setItem(TAGS_KEY, JSON.stringify(arr));
      this.tags=arr;
    },
    toggleAll(e) {
      this.todos.forEach((todo) => (todo.completed = e.target.checked))
    },

    addTodo() {
      const value = this.newtitle.trim()
      if (!value) {
        return
      }
      this.todos.push({
        id: Date.now(),
        title: value,
        tagValue:this.newTagValue,
        tagId:this.newTagId,
        completed: false
      })
      this.saveToDB(value)
      this.newtitle = "";
      this.newTagId = "";
    },
    handleAdd(){
      if(!this.newtitle) return;
      this.todos.push({
        id: Date.now(),
        title: this.newtitle,
        tagValue:this.newTagValue,
        tagId:this.newTagId,
        completed: false
      })
      this.saveToDB(this.newtitle);
      this.newtitle = "";
      this.newTagId = "";
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

    selectOnly(value){
      if (this.selectedItem.length ===1 && this.selectedItem[0] === value) {
        this.selectedItem = [];
      } else {
        this.selectedItem = [];
        this.selectedItem.push = value;
      }
    },

    toTags(){
      this.$router.push("/tags")
    },

    handleTag(item){
      this.tagActive = item.id;
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
      <i class="ticon">T</i>
      <input
        class="new-todo"
        autofocus
        placeholder="What needs to be done?"
        @keyup.enter="addTodo"
        v-model="newtitle"
      >
      <select id="fruit" v-model="newTagId" class="new-select" >
        <option value="">Non-Tag</option>
        <option v-for="o in filteredTags" :key="o.id" :value="o.id">{{o.value}}</option>
      </select>
      <span class="add-btn" @click="handleAdd">Add</span>
    </header>
    <section class="main" v-show="todos.length">
      <!-- <input
        id="toggle-all"
        class="toggle-all"
        type="checkbox"
        :checked="remaining === 0"
        @change="toggleAll"
      > -->
      <!-- <label for="toggle-all">Mark all as complete</label> -->
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
            <div class="tag-box">
              <span>{{todo.tagValue}}</span>
              <!-- <span>
                <input type="checkbox" v-model="selectedItem" value="A" @click="selectOnly('A')">
                tag1
              </span>
              <span>
                <input type="checkbox" v-model="selectedItem" value="B" @click="selectOnly('B')">
                tag2
              </span> -->
            </div>
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
  <div class="left-menu-box">
    <h4>Menu</h4>
    <div class="menu-item">
      <div class="active">Home</div>
      <div @click="toTags">Tags</div>
    </div>
  </div>
  <div class="tag-menu-box">
    <h4>Tags</h4>
    <div class="menu-item">
      <div 
        @click="handleTag(item)"
        :class="{active:tagActive===item.id}" v-for="item in tags" :key="item.id"
      >
        {{item.value}}
      </div>
      <!-- <div>Public</div>
      <div class="active">Private</div> -->
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
.new-select{
  width: 84px;
  height: 32px;
  border: 1px solid rgba(175, 47, 47, 0.2);
  color: #777777;
  outline: unset;
  max-height: 280px;
  position: absolute;
  top: 20px;
  right: 65px;
  cursor: pointer;
}
.tag-menu-box,.left-menu-box{
  .menu-item{
    width: 80px;
    border: 1px solid #e6e6e6;
    overflow: hidden;
    div{
      padding: 8px 0px;
      text-align: center;
      cursor: pointer;
    }
  }
  .active{
    background: rgba(0, 0, 0, .04);
  }
}
.left-menu-box{
  position: fixed;
  left: 0px;
  top: 100px;
  h4{
    margin: 0px 0px;
    text-align: left;
    padding-left:18px;
    padding-bottom: 10px;
  }
  .menu-item{
    border-left:none;
    border-radius:0px 10px 10px 0px;
  }
}
.tag-menu-box{
  position: fixed;
  right: 0px;
  top: 100px;
  h4{
    margin: 0px 0px;
    text-align: right;
    padding-right:18px;
    padding-bottom: 10px;
  }
  .menu-item{
    border-right:none;
    border-radius:10px 0px 0px 10px;
  }
}
</style>