import axios from 'axios'

export class Api {
  constructor(private base: string, private plural: boolean = true) {}
  public list<T>(object: string ): () => Promise<T[]> {
    const target = object + (this.plural ? 's' : '')
    return () => axios.get(`${this.base}${target}`).then(({data}) => data)
  }
  public get<T>(object: string ): (id: string) => Promise<T> {
    const target = object + (this.plural ? 's' : '')
    return (id: string) => axios.get(`${this.base}${target}/${id}`).then(({data}) => data)
  }
}
