import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

export const handleRoute = (handler: (vm, route) => void) => ({
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      handler(vm, to)
    })
  },
  beforeRouteUpdate(to, from, next) {
    handler(this, to)
    next()
  }
}
)

interface ListHandlerOptions {
  name: string
  listName?: string
  containerWrapper?(content: string): string
  control?: string
  itemProperty?: string
  fetch?(): Promise<any[]>
  fetchGenerator?(): () => Promise<any[]>
}

export const listHandler = (options: ListHandlerOptions): RouteConfig => {
  const name = options.name
  const listName = options.listName || `${name}s`
  const containerWrapper = options.containerWrapper || ((content) => `
  <div class="container mt-3">
    ${content}
  </div>
        `)
  const control = options.control || `${name}-summary`
  const itemProperty = options.itemProperty || name
  const fetch = options.fetch || options.fetchGenerator()
  return {
    name: `${name}-list`,
    path: `${listName}`,
    component: Vue.extend({
      template: containerWrapper(`<${control} v-for="${name} in ${listName}" :${itemProperty}="${name}"></${control}>`),
        data() {
          return {
            [listName]: []
          }
        },
        mounted() {
          fetch().then((data) => this[listName] = data)
        }
    })
  }
}

interface ItemHandlerOptions {
  name: string
  listName?: string
  containerWrapper?(content: string): string
  control?: string
  itemProperty?: string
  fetch?(id: string): Promise<any>
  fetchGenerator?(): (id: string) => Promise<any>
}

export const itemHandler = (options: ItemHandlerOptions): RouteConfig => {
  const name = options.name
  const listName = options.listName || `${name}s`
  const containerWrapper = options.containerWrapper || ((content) => `
  <div class="container mt-3">
    ${content}
  </div>
        `)
  const control = options.control || `${name}-details`
  const itemProperty = options.itemProperty || name
  const fetch = options.fetch || options.fetchGenerator()
  return {
    name,
    path: `${listName}/:${name}`,
    component: Vue.extend({
      template: containerWrapper(`<${control} :${itemProperty}="${name}" v-if="${name}"></${control}>`),
        data() {
          return {
            [name]: null
          }
        },
        ...handleRoute((vm, route) => {
          fetch(route.params[name]).then((data) => vm[name] = data)
        })
    })
  }
}

export const router = (routes: RouteConfig[]): VueRouter => {
  Vue.use(VueRouter)
  return new VueRouter({
    mode: 'history',
    routes,
    linkActiveClass: 'active'
  })
}
