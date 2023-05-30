import { AuthRuleF } from '../auth'
import { Enum, EnumShape } from '../enum'
import { AuthDefinition } from './auth'
import { CacheDefinition, FieldCacheParams, FieldLevelCache } from './cache'
import { DefaultDefinition } from './default'
import { ListDefinition } from './list'
import { ResolverDefinition } from './resolver'
import { SearchDefinition } from './search'
import { UniqueDefinition } from './unique'

export class EnumDefinition<T extends string, U extends EnumShape<T>> {
  enumName: string
  enumVariants: U
  isOptional: boolean

  constructor(referencedEnum: Enum<T, U>) {
    this.enumName = referencedEnum.name
    this.enumVariants = referencedEnum.variants
    this.isOptional = false
  }

  /**
   * Set the field optional.
   */
  public optional(): this {
    this.isOptional = true

    return this
  }

  /**
   * Allow multiple scalars to be used as values for the field.
   */
  public list(): ListDefinition {
    return new ListDefinition(this)
  }

  /**
   * Set the field-level auth directive.
   *
   * @param rules - A closure to build the authentication rules.
   */
  public auth(rules: AuthRuleF): AuthDefinition {
    return new AuthDefinition(this, rules)
  }

  /**
   * Make the field searchable.
   */
  public search(): SearchDefinition {
    return new SearchDefinition(this)
  }

  /**
   * Make the field unique.
   *
   * @param scope - Additional fields to be added to the constraint.
   */
  public unique(scope?: string[]): UniqueDefinition {
    return new UniqueDefinition(this, scope)
  }

  /**
   * Set the default value of the field.
   *
   * @param value - The value written to the database.
   */
  public default(value: U[number]): DefaultDefinition {
    return new DefaultDefinition(this, value)
  }

  /**
   * Attach a resolver function to the field.
   *
   * @param name - The name of the resolver function file without the extension or directory.
   */
  public resolver(name: string): ResolverDefinition {
    return new ResolverDefinition(this, name)
  }

  /**
   * Set the field-level cache directive.
   *
   * @param params - The cache definition parameters.
   */
  public cache(params: FieldCacheParams): CacheDefinition {
    return new CacheDefinition(this, new FieldLevelCache(params))
  }

  public toString(): string {
    const required = this.isOptional ? '' : '!'

    return `${this.enumName}${required}`
  }

  fieldTypeVal(): Enum<T, U> {
    return new Enum(this.enumName, this.enumVariants)
  }
}