import { Header, Headers, HeaderGenerator } from './header'

export type OpenApiTransforms = 'OPERATION_ID' | 'SCHEMA_NAME'

export interface OpenAPIParams {
  schema: string
  url?: string
  transforms?: OpenApiTransforms
  headers?: HeaderGenerator
}

export class PartialOpenAPI {
  private schema: string
  private apiUrl?: string
  private transforms?: OpenApiTransforms
  private headers: Header[]
  private introspectionHeaders: Header[]

  constructor(params: OpenAPIParams) {
    const headers = new Headers()

    if (params.headers) {
      params.headers(headers)
    }

    this.schema = params.schema
    this.apiUrl = params.url
    this.transforms = params.transforms
    this.headers = headers.headers
    this.introspectionHeaders = headers.introspectionHeaders
  }

  finalize(namespace: string): OpenAPI {
    return new OpenAPI(
      namespace,
      this.schema,
      this.headers,
      this.introspectionHeaders,
      this.transforms,
      this.apiUrl
    )
  }
}

export class OpenAPI {
  private namespace: string
  private schema: string
  private apiUrl?: string
  private transforms?: OpenApiTransforms
  private headers: Header[]
  private introspectionHeaders: Header[]

  constructor(
    namespace: string,
    schema: string,
    headers: Header[],
    introspectionHeaders: Header[],
    transforms?: OpenApiTransforms,
    url?: string
  ) {
    this.namespace = namespace
    this.schema = schema
    this.apiUrl = url
    this.transforms = transforms
    this.headers = headers
    this.introspectionHeaders = introspectionHeaders
  }

  public toString(): string {
    const header = '  @openapi(\n'
    const namespace = this.namespace ? `    name: "${this.namespace}"\n` : ''
    const url = this.apiUrl ? `    url: "${this.apiUrl}"\n` : ''
    const schema = `    schema: "${this.schema}"\n`

    const transforms = this.transforms
      ? `    transforms: { queryNaming: ${this.transforms} }\n`
      : ''

    var headers = this.headers.map((header) => `      ${header}`).join('\n')
    headers = headers ? `    headers: [\n${headers}\n    ]\n` : ''

    var introspectionHeaders = this.introspectionHeaders
      .map((header) => `      ${header}`)
      .join('\n')

    introspectionHeaders = headers
      ? `    introspectionHeaders: [\n${introspectionHeaders}\n    ]\n`
      : ''

    const footer = '  )'

    return `${header}${namespace}${url}${schema}${transforms}${headers}${introspectionHeaders}${footer}`
  }
}
