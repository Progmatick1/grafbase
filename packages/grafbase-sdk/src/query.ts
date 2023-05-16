import { ListDefinition } from './field/list'
import { ScalarDefinition } from './field/typedefs'
import { ReferenceDefinition } from './reference'

export type InputType = ScalarDefinition | ListDefinition | ReferenceDefinition
export type OutputType = ScalarDefinition | ListDefinition | ReferenceDefinition

export interface QueryInput {
  args?: Record<string, InputType>
  returns: OutputType
  resolver: string
}

export class QueryArgument {
  name: string
  type: InputType

  constructor(name: string, type: InputType) {
    this.name = name
    this.type = type
  }

  public toString(): string {
    return `${this.name}: ${this.type}`
  }
}

export enum QueryType {
  Query = 'Query',
  Mutation = 'Mutation'
}

export class Query {
  name: string
  arguments: QueryArgument[]
  returns: OutputType
  resolver: string
  type: QueryType

  constructor(
    name: string,
    type: QueryType,
    returnType: OutputType,
    resolverName: string
  ) {
    this.name = name
    this.arguments = []
    this.returns = returnType
    this.resolver = resolverName
    this.type = type
  }

  public pushArgument(name: string, type: InputType): Query {
    this.arguments.push(new QueryArgument(name, type))

    return this
  }

  public toString(): string {
    const header = `extend type ${this.type} {`
    const args = this.arguments.map(String).join(', ')
    const argsStr = args ? `(${args})` : ''
    const query = `  ${this.name}${argsStr}: ${this.returns} @resolver(name: "${this.resolver}")`
    const footer = '}'

    return `${header}\n${query}\n${footer}`
  }
}