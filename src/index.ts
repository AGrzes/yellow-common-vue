export * from './routes'
export * from './api'
export * from './app'
export * from './components'
import Vue from 'vue'
export {Vue}
import VueRouter from 'vue-router'
export {VueRouter}

export const bootstrap = () => {
  import('./bootstrap')
}
