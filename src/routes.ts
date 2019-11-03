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

interface HandlerOptions {
  containerWrapper?(content: string): string
  listFetchGenerator?(name: string): () => Promise<any[]>
  itemFetchGenerator?(name: string): (id: string) => Promise<any>
  itemProperty?(name: string): string
  listControl?(name: string): string
  listPath?(name: string): string
  itemPath?(name: string): string
  itemControl?(name: string): string
  itemKeyProperty?(name: string): string
}
interface ListHandlerOptions  {
  name: string
  path?: string
  control?: string
  itemProperty?: string
  itemKey?: string
  fetch?(): Promise<any[]>
  containerWrapper?(content: string): string
}

interface ItemHandlerOptions {
  name: string
  path?: string
  containerWrapper?(content: string): string
  control?: string
  itemProperty?: string
  fetch?(id: string): Promise<any>
}

export class HandlerGenerator {
  constructor(private options: HandlerOptions) {
    this.options.listFetchGenerator = this.options.listFetchGenerator || (() => {
      throw new Error('Fetch not defined')
    })
    this.options.containerWrapper = this.options.containerWrapper || ((content) => content)
    this.options.itemProperty = this.options.itemProperty || ((name) => name)
    this.options.listControl = this.options.listControl || ((name) => `${name}-summary`)
    this.options.listPath = this.options.listPath || ((name) => `${name}`)
    this.options.itemPath = this.options.itemPath || ((name) => `${this.options.listPath(name)}/:${this.options.itemProperty(name)}`)
    this.options.itemControl = this.options.itemControl || ((name) => `${name}-details`)
    this.options.itemKeyProperty = this.options.itemKeyProperty || ((name) => '_id')
  }

  public list(options: ListHandlerOptions): RouteConfig {
    const name = options.name
    const path = options.path || this.options.listPath(name)
    const containerWrapper = options.containerWrapper || this.options.containerWrapper
    const control = options.control || this.options.listControl(name)
    const itemProperty = options.itemProperty || this.options.itemProperty(name)
    const fetch = options.fetch || this.options.listFetchGenerator(name)
    const key = options.itemKey || this.options.itemKeyProperty(name)
    return {
      name: `${name}-list`,
      path,
      component: Vue.extend({
        template: containerWrapper(`
<${control} v-for="item in list" :${itemProperty}="item" :key="item.${key}"></${control}>
        `),
          data() {
            return {
              list: []
            }
          },
          mounted() {
            fetch().then((data) => this.list = data)
          }
      })
    }
  }
  public item(options: ItemHandlerOptions): RouteConfig {
    const name = options.name
    const path = options.path || this.options.itemPath(name)
    const containerWrapper = options.containerWrapper || this.options.containerWrapper
    const control = options.control || this.options.itemControl(name)
    const itemProperty = options.itemProperty || this.options.itemProperty(name)
    const fetch = options.fetch || this.options.itemFetchGenerator(name)
    return {
      name,
      path,
      component: Vue.extend({
        template: containerWrapper(`<${control} :${itemProperty}="item" v-if="item"></${control}>`),
          data() {
            return {
              item: null
            }
          },
          ...handleRoute((vm, route) => {
            fetch(route.params[name]).then((data) => vm.item = data)
          })
      })
    }
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
