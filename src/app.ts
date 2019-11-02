import Vue from 'vue'
import VueRouter from 'vue-router'

interface AppConfig {
  element?: string
  router?: VueRouter
}

export const app = (options: AppConfig = {}) => {
  const element = options.element || 'app'
  const vueOptions: any = {
    el: `body #${element}`,
    template: `<router-view></router-view>`,
    data: {
    }
  }
  if (options.router) {
    vueOptions.router = options.router
  }

  return new Vue(vueOptions)
}
