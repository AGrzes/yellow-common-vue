export * from './routes'
export * from './api'
import Vue from 'vue'
export {Vue}
import VueRourter from 'vue-router'
export {VueRourter}

export const bootstrap = () => {
  import('./bootstrap')
}
