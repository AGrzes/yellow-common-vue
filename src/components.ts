import Vue from 'vue'

export function listComponent({name, label, secondaryLabel}: {name: string, label?: string, secondaryLabel?: string}) {
  label = label || 'name'
  const sl = secondaryLabel ? `<small>{{${name}.${secondaryLabel}}}</small>` : ''
  Vue.component(`${name}-summary`, {
    props: [name],
    template:  `
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">{{${name}.${label}}} ${sl}</h5>
      <router-link :to="{name:'${name}',params:{${name}:${name}._id}}" class="nav-link">Details</router-link>
    </div>
  </div>
    `
  })
}

export interface FieldDescriptor {
  name: string
  section?: string
  kind?: 'string' | 'reference'
  target?: string
  multiplicity?: 'single' | 'multiple'
}

function groupFields(groups: string[], fields: FieldDescriptor[]): {[group: string]: FieldDescriptor[]} {
  return _.groupBy(fields, (fd) => _.includes(groups, fd.section) ? fd.section : 'default')
}

function ensureSingle<T>(value: T|T[]): T {
  if (_.isArray(value)) {
    return value[0]
  } else {
    return value
  }
}

function ensureMultiple<T>(value: T|T[]): T[] {
  if (_.isArray(value)) {
    return value
  } else {
    return [value]
  }
}

export function detailsComponent(name: string, fields: FieldDescriptor[]) {
  Vue.component(`${name}-details`, {
    props: [name],
    template:  `
  <generic-details :fields="fields" :item="${name}"></generic-details>
    `,
    data() {
      return {
        fields
      }
    }
  })
}

export function components() {

  Vue.component('text-single', {
    props: ['field', 'item'],
    template:  `
    <span>{{value}}</span>
    `,
    computed: {
      value() {
        return ensureSingle(this.item[this.field.name])
      }
    }
  })

  Vue.component('text-bag', {
    props: ['field', 'item'],
    template:  `
    <span><span v-for="value in values" class="mr-1">{{value}}</span><span>
    `,
    computed: {
      values() {
        return ensureMultiple(this.item[this.field.name])
      }
    }
  })

  Vue.component('reference-single', {
    props: ['field', 'item'],
    template:  `
    <span>
      <router-link :to="to(value)">{{value}}</router-link>
    </span>
    `,
    computed: {
      value() {
        return ensureSingle(this.item[this.field.name])
      }
    },
    methods: {
      to(value: string) {
        return {
          name: `${this.field.target}`,
          params: {
            [this.field.target]: value
          }
        }
      }
    }
  })

  Vue.component('reference-bag', {
    props: ['field', 'item'],
    template:  `
    <span>
      <span v-for="value in values" class="mr-1">
        <router-link :to="to(value)">{{value}}</router-link>
      </span>
    <span>
    `,
    computed: {
      values() {
        return ensureMultiple(this.item[this.field.name])
      }
    },
    methods: {
      to(value: string) {
        return {
          name: `${this.field.target}`,
          params: {
            [this.field.target]: value
          }
        }
      }
    }
  })

  Vue.component('text-block', {
    props: ['field', 'item'],
    template:  `
    <div>{{value}}</div>
    `,
    computed: {
      value() {
        return ensureSingle(this.item[this.field.name])
      }
    }
  })

  Vue.component('text-list', {
    props: ['field', 'item'],
    template:  `
    <ul><li v-for="value in values" class="mr-1">{{value}}</li></ul>
    `,
    computed: {
      values() {
        return ensureMultiple(this.item[this.field.name])
      }
    }
  })

  Vue.component('reference-block', {
    props: ['field', 'item'],
    template:  `
    <div>
      <router-link :to="to(value)">{{value}}</router-link>
    </div>
    `,
    computed: {
      value() {
        return ensureSingle(this.item[this.field.name])
      }
    },
    methods: {
      to(value: string) {
        return {
          name: `${this.field.target}`,
          params: {
            [this.field.target]: value
          }
        }
      }
    }
  })

  Vue.component('reference-list', {
    props: ['field', 'item'],
    template:  `
      <ul>
        <li  v-for="value in values" class="mr-1">
          <router-link :to="to(value)">{{value}}</router-link>
        </li>
      </ul>
    `,
    computed: {
      values() {
        return ensureMultiple(this.item[this.field.name])
      }
    },
    methods: {
      to(value: string) {
        return {
          name: `${this.field.target}`,
          params: {
            [this.field.target]: value
          }
        }
      }
    }
  })

  const inlineComponents = {
    single: {
      string: 'text-single',
      reference: 'reference-single'
    },
    multiple: {
      string: 'text-bag',
      reference: 'reference-bag'
    }
  }

  const blockComponents = {
    single: {
      string: 'text-block',
      reference: 'reference-block'
    },
    multiple: {
      string: 'text-list',
      reference: 'reference-list'
    }
  }

  function resolveComponent(field: FieldDescriptor, context: any, item: any): string {
    if (context.block) {
      return blockComponents[field.multiplicity || 'single'][field.kind || 'string']
    } else if (context.inline) {
      return inlineComponents[field.multiplicity || 'single'][field.kind || 'string']
    }
  }

  Vue.component('generic-details', {
    props: ['fields', 'item'],
    template:  `
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">
        <component :is="resolveComponent(field,{inline:true},item)"
          :field="field"
          :item="item"
          v-for="field in sections.header"
          :key="field.name">
        </component>
        <small>
          <component :is="resolveComponent(field,{inline:true},item)"
            :field="field"
            :item="item"
            v-for="field in sections.subHeader"
            :key="field.name">
          </component>
        </small>
      </h5>
      <component :is="resolveComponent(field,{block:true},item)"
        :field="field"
        :item="item"
        v-for="field in sections.default"
        :key="field.name">
      </component>
    </div>
  </div>
    `,
    computed: {
      sections(): {[section: string]: FieldDescriptor[]} {
        return groupFields(['header', 'subHeader'], this.fields)
      }
    },
    methods: {
      resolveComponent
    }
  })

}
