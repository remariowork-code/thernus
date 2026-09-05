
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Watchlist
 * 
 */
export type Watchlist = $Result.DefaultSelection<Prisma.$WatchlistPayload>
/**
 * Model WatchlistSymbol
 * 
 */
export type WatchlistSymbol = $Result.DefaultSelection<Prisma.$WatchlistSymbolPayload>
/**
 * Model Sector
 * 
 */
export type Sector = $Result.DefaultSelection<Prisma.$SectorPayload>
/**
 * Model Stock
 * 
 */
export type Stock = $Result.DefaultSelection<Prisma.$StockPayload>
/**
 * Model SectorStock
 * 
 */
export type SectorStock = $Result.DefaultSelection<Prisma.$SectorStockPayload>
/**
 * Model Signal
 * 
 */
export type Signal = $Result.DefaultSelection<Prisma.$SignalPayload>
/**
 * Model SignalOutcome
 * Signal-performance analysis (spec section 29). Populated by a scheduled job
 * that revisits each signal at fixed horizons and records what happened next,
 * so the system can eventually say which signals are worth acting on.
 */
export type SignalOutcome = $Result.DefaultSelection<Prisma.$SignalOutcomePayload>
/**
 * Model AlertRule
 * 
 */
export type AlertRule = $Result.DefaultSelection<Prisma.$AlertRulePayload>
/**
 * Model AlertEvent
 * 
 */
export type AlertEvent = $Result.DefaultSelection<Prisma.$AlertEventPayload>
/**
 * Model NewsArticle
 * 
 */
export type NewsArticle = $Result.DefaultSelection<Prisma.$NewsArticlePayload>
/**
 * Model NewsSymbol
 * 
 */
export type NewsSymbol = $Result.DefaultSelection<Prisma.$NewsSymbolPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const SignalType: {
  MOMENTUM_START: 'MOMENTUM_START',
  MOMENTUM_ACCELERATION: 'MOMENTUM_ACCELERATION',
  VOLUME_SPIKE: 'VOLUME_SPIKE',
  NEW_HIGH: 'NEW_HIGH',
  VWAP_BREAK: 'VWAP_BREAK',
  SECTOR_AWAKENING: 'SECTOR_AWAKENING',
  SECTOR_BREAKOUT: 'SECTOR_BREAKOUT',
  SECTOR_ACCELERATION: 'SECTOR_ACCELERATION',
  CATALYST: 'CATALYST'
};

export type SignalType = (typeof SignalType)[keyof typeof SignalType]


export const SignalSeverity: {
  INFO: 'INFO',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export type SignalSeverity = (typeof SignalSeverity)[keyof typeof SignalSeverity]

}

export type SignalType = $Enums.SignalType

export const SignalType: typeof $Enums.SignalType

export type SignalSeverity = $Enums.SignalSeverity

export const SignalSeverity: typeof $Enums.SignalSeverity

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.PrismaClientConstructorArgs<ClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.watchlist`: Exposes CRUD operations for the **Watchlist** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Watchlists
    * const watchlists = await prisma.watchlist.findMany()
    * ```
    */
  get watchlist(): Prisma.WatchlistDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.watchlistSymbol`: Exposes CRUD operations for the **WatchlistSymbol** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WatchlistSymbols
    * const watchlistSymbols = await prisma.watchlistSymbol.findMany()
    * ```
    */
  get watchlistSymbol(): Prisma.WatchlistSymbolDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sector`: Exposes CRUD operations for the **Sector** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sectors
    * const sectors = await prisma.sector.findMany()
    * ```
    */
  get sector(): Prisma.SectorDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.stock`: Exposes CRUD operations for the **Stock** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Stocks
    * const stocks = await prisma.stock.findMany()
    * ```
    */
  get stock(): Prisma.StockDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sectorStock`: Exposes CRUD operations for the **SectorStock** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SectorStocks
    * const sectorStocks = await prisma.sectorStock.findMany()
    * ```
    */
  get sectorStock(): Prisma.SectorStockDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.signal`: Exposes CRUD operations for the **Signal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Signals
    * const signals = await prisma.signal.findMany()
    * ```
    */
  get signal(): Prisma.SignalDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.signalOutcome`: Exposes CRUD operations for the **SignalOutcome** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SignalOutcomes
    * const signalOutcomes = await prisma.signalOutcome.findMany()
    * ```
    */
  get signalOutcome(): Prisma.SignalOutcomeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.alertRule`: Exposes CRUD operations for the **AlertRule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AlertRules
    * const alertRules = await prisma.alertRule.findMany()
    * ```
    */
  get alertRule(): Prisma.AlertRuleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.alertEvent`: Exposes CRUD operations for the **AlertEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AlertEvents
    * const alertEvents = await prisma.alertEvent.findMany()
    * ```
    */
  get alertEvent(): Prisma.AlertEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.newsArticle`: Exposes CRUD operations for the **NewsArticle** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more NewsArticles
    * const newsArticles = await prisma.newsArticle.findMany()
    * ```
    */
  get newsArticle(): Prisma.NewsArticleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.newsSymbol`: Exposes CRUD operations for the **NewsSymbol** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more NewsSymbols
    * const newsSymbols = await prisma.newsSymbol.findMany()
    * ```
    */
  get newsSymbol(): Prisma.NewsSymbolDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.10.0
   * Query Engine version: 0edf323efd1d98336f3f0a68684b56f689b900d3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * Resolved type of the argument passed to the `PrismaClient` constructor.
   *
   * When called without a narrower options type (the common case), this resolves
   * to `PrismaClientOptions` directly, which produces a clear TypeScript error
   * message (`not assignable to parameter of type 'PrismaClientOptions'`) when
   * the argument is missing or incomplete. When the user supplies a narrower
   * options type (e.g. via a literal), it falls back to `Subset` to keep
   * filtering out unknown properties.
   */
  export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> =
    [PrismaClientOptions] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      ((Without<T, U> & U) | (Without<U, T> & T)) & object
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Watchlist: 'Watchlist',
    WatchlistSymbol: 'WatchlistSymbol',
    Sector: 'Sector',
    Stock: 'Stock',
    SectorStock: 'SectorStock',
    Signal: 'Signal',
    SignalOutcome: 'SignalOutcome',
    AlertRule: 'AlertRule',
    AlertEvent: 'AlertEvent',
    NewsArticle: 'NewsArticle',
    NewsSymbol: 'NewsSymbol'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "watchlist" | "watchlistSymbol" | "sector" | "stock" | "sectorStock" | "signal" | "signalOutcome" | "alertRule" | "alertEvent" | "newsArticle" | "newsSymbol"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Watchlist: {
        payload: Prisma.$WatchlistPayload<ExtArgs>
        fields: Prisma.WatchlistFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WatchlistFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WatchlistFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>
          }
          findFirst: {
            args: Prisma.WatchlistFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WatchlistFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>
          }
          findMany: {
            args: Prisma.WatchlistFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>[]
          }
          create: {
            args: Prisma.WatchlistCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>
          }
          createMany: {
            args: Prisma.WatchlistCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WatchlistCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>[]
          }
          delete: {
            args: Prisma.WatchlistDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>
          }
          update: {
            args: Prisma.WatchlistUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>
          }
          deleteMany: {
            args: Prisma.WatchlistDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WatchlistUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WatchlistUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>[]
          }
          upsert: {
            args: Prisma.WatchlistUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>
          }
          aggregate: {
            args: Prisma.WatchlistAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWatchlist>
          }
          groupBy: {
            args: Prisma.WatchlistGroupByArgs<ExtArgs>
            result: $Utils.Optional<WatchlistGroupByOutputType>[]
          }
          count: {
            args: Prisma.WatchlistCountArgs<ExtArgs>
            result: $Utils.Optional<WatchlistCountAggregateOutputType> | number
          }
        }
      }
      WatchlistSymbol: {
        payload: Prisma.$WatchlistSymbolPayload<ExtArgs>
        fields: Prisma.WatchlistSymbolFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WatchlistSymbolFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistSymbolPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WatchlistSymbolFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistSymbolPayload>
          }
          findFirst: {
            args: Prisma.WatchlistSymbolFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistSymbolPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WatchlistSymbolFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistSymbolPayload>
          }
          findMany: {
            args: Prisma.WatchlistSymbolFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistSymbolPayload>[]
          }
          create: {
            args: Prisma.WatchlistSymbolCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistSymbolPayload>
          }
          createMany: {
            args: Prisma.WatchlistSymbolCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WatchlistSymbolCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistSymbolPayload>[]
          }
          delete: {
            args: Prisma.WatchlistSymbolDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistSymbolPayload>
          }
          update: {
            args: Prisma.WatchlistSymbolUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistSymbolPayload>
          }
          deleteMany: {
            args: Prisma.WatchlistSymbolDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WatchlistSymbolUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WatchlistSymbolUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistSymbolPayload>[]
          }
          upsert: {
            args: Prisma.WatchlistSymbolUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WatchlistSymbolPayload>
          }
          aggregate: {
            args: Prisma.WatchlistSymbolAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWatchlistSymbol>
          }
          groupBy: {
            args: Prisma.WatchlistSymbolGroupByArgs<ExtArgs>
            result: $Utils.Optional<WatchlistSymbolGroupByOutputType>[]
          }
          count: {
            args: Prisma.WatchlistSymbolCountArgs<ExtArgs>
            result: $Utils.Optional<WatchlistSymbolCountAggregateOutputType> | number
          }
        }
      }
      Sector: {
        payload: Prisma.$SectorPayload<ExtArgs>
        fields: Prisma.SectorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SectorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SectorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorPayload>
          }
          findFirst: {
            args: Prisma.SectorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SectorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorPayload>
          }
          findMany: {
            args: Prisma.SectorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorPayload>[]
          }
          create: {
            args: Prisma.SectorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorPayload>
          }
          createMany: {
            args: Prisma.SectorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SectorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorPayload>[]
          }
          delete: {
            args: Prisma.SectorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorPayload>
          }
          update: {
            args: Prisma.SectorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorPayload>
          }
          deleteMany: {
            args: Prisma.SectorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SectorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SectorUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorPayload>[]
          }
          upsert: {
            args: Prisma.SectorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorPayload>
          }
          aggregate: {
            args: Prisma.SectorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSector>
          }
          groupBy: {
            args: Prisma.SectorGroupByArgs<ExtArgs>
            result: $Utils.Optional<SectorGroupByOutputType>[]
          }
          count: {
            args: Prisma.SectorCountArgs<ExtArgs>
            result: $Utils.Optional<SectorCountAggregateOutputType> | number
          }
        }
      }
      Stock: {
        payload: Prisma.$StockPayload<ExtArgs>
        fields: Prisma.StockFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StockFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StockFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>
          }
          findFirst: {
            args: Prisma.StockFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StockFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>
          }
          findMany: {
            args: Prisma.StockFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>[]
          }
          create: {
            args: Prisma.StockCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>
          }
          createMany: {
            args: Prisma.StockCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StockCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>[]
          }
          delete: {
            args: Prisma.StockDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>
          }
          update: {
            args: Prisma.StockUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>
          }
          deleteMany: {
            args: Prisma.StockDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StockUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StockUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>[]
          }
          upsert: {
            args: Prisma.StockUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>
          }
          aggregate: {
            args: Prisma.StockAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStock>
          }
          groupBy: {
            args: Prisma.StockGroupByArgs<ExtArgs>
            result: $Utils.Optional<StockGroupByOutputType>[]
          }
          count: {
            args: Prisma.StockCountArgs<ExtArgs>
            result: $Utils.Optional<StockCountAggregateOutputType> | number
          }
        }
      }
      SectorStock: {
        payload: Prisma.$SectorStockPayload<ExtArgs>
        fields: Prisma.SectorStockFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SectorStockFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorStockPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SectorStockFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorStockPayload>
          }
          findFirst: {
            args: Prisma.SectorStockFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorStockPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SectorStockFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorStockPayload>
          }
          findMany: {
            args: Prisma.SectorStockFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorStockPayload>[]
          }
          create: {
            args: Prisma.SectorStockCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorStockPayload>
          }
          createMany: {
            args: Prisma.SectorStockCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SectorStockCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorStockPayload>[]
          }
          delete: {
            args: Prisma.SectorStockDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorStockPayload>
          }
          update: {
            args: Prisma.SectorStockUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorStockPayload>
          }
          deleteMany: {
            args: Prisma.SectorStockDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SectorStockUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SectorStockUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorStockPayload>[]
          }
          upsert: {
            args: Prisma.SectorStockUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectorStockPayload>
          }
          aggregate: {
            args: Prisma.SectorStockAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSectorStock>
          }
          groupBy: {
            args: Prisma.SectorStockGroupByArgs<ExtArgs>
            result: $Utils.Optional<SectorStockGroupByOutputType>[]
          }
          count: {
            args: Prisma.SectorStockCountArgs<ExtArgs>
            result: $Utils.Optional<SectorStockCountAggregateOutputType> | number
          }
        }
      }
      Signal: {
        payload: Prisma.$SignalPayload<ExtArgs>
        fields: Prisma.SignalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SignalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SignalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          findFirst: {
            args: Prisma.SignalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SignalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          findMany: {
            args: Prisma.SignalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>[]
          }
          create: {
            args: Prisma.SignalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          createMany: {
            args: Prisma.SignalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SignalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>[]
          }
          delete: {
            args: Prisma.SignalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          update: {
            args: Prisma.SignalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          deleteMany: {
            args: Prisma.SignalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SignalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SignalUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>[]
          }
          upsert: {
            args: Prisma.SignalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          aggregate: {
            args: Prisma.SignalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSignal>
          }
          groupBy: {
            args: Prisma.SignalGroupByArgs<ExtArgs>
            result: $Utils.Optional<SignalGroupByOutputType>[]
          }
          count: {
            args: Prisma.SignalCountArgs<ExtArgs>
            result: $Utils.Optional<SignalCountAggregateOutputType> | number
          }
        }
      }
      SignalOutcome: {
        payload: Prisma.$SignalOutcomePayload<ExtArgs>
        fields: Prisma.SignalOutcomeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SignalOutcomeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalOutcomePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SignalOutcomeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalOutcomePayload>
          }
          findFirst: {
            args: Prisma.SignalOutcomeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalOutcomePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SignalOutcomeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalOutcomePayload>
          }
          findMany: {
            args: Prisma.SignalOutcomeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalOutcomePayload>[]
          }
          create: {
            args: Prisma.SignalOutcomeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalOutcomePayload>
          }
          createMany: {
            args: Prisma.SignalOutcomeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SignalOutcomeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalOutcomePayload>[]
          }
          delete: {
            args: Prisma.SignalOutcomeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalOutcomePayload>
          }
          update: {
            args: Prisma.SignalOutcomeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalOutcomePayload>
          }
          deleteMany: {
            args: Prisma.SignalOutcomeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SignalOutcomeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SignalOutcomeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalOutcomePayload>[]
          }
          upsert: {
            args: Prisma.SignalOutcomeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalOutcomePayload>
          }
          aggregate: {
            args: Prisma.SignalOutcomeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSignalOutcome>
          }
          groupBy: {
            args: Prisma.SignalOutcomeGroupByArgs<ExtArgs>
            result: $Utils.Optional<SignalOutcomeGroupByOutputType>[]
          }
          count: {
            args: Prisma.SignalOutcomeCountArgs<ExtArgs>
            result: $Utils.Optional<SignalOutcomeCountAggregateOutputType> | number
          }
        }
      }
      AlertRule: {
        payload: Prisma.$AlertRulePayload<ExtArgs>
        fields: Prisma.AlertRuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AlertRuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertRulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AlertRuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertRulePayload>
          }
          findFirst: {
            args: Prisma.AlertRuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertRulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AlertRuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertRulePayload>
          }
          findMany: {
            args: Prisma.AlertRuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertRulePayload>[]
          }
          create: {
            args: Prisma.AlertRuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertRulePayload>
          }
          createMany: {
            args: Prisma.AlertRuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AlertRuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertRulePayload>[]
          }
          delete: {
            args: Prisma.AlertRuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertRulePayload>
          }
          update: {
            args: Prisma.AlertRuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertRulePayload>
          }
          deleteMany: {
            args: Prisma.AlertRuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AlertRuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AlertRuleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertRulePayload>[]
          }
          upsert: {
            args: Prisma.AlertRuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertRulePayload>
          }
          aggregate: {
            args: Prisma.AlertRuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAlertRule>
          }
          groupBy: {
            args: Prisma.AlertRuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<AlertRuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.AlertRuleCountArgs<ExtArgs>
            result: $Utils.Optional<AlertRuleCountAggregateOutputType> | number
          }
        }
      }
      AlertEvent: {
        payload: Prisma.$AlertEventPayload<ExtArgs>
        fields: Prisma.AlertEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AlertEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AlertEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertEventPayload>
          }
          findFirst: {
            args: Prisma.AlertEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AlertEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertEventPayload>
          }
          findMany: {
            args: Prisma.AlertEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertEventPayload>[]
          }
          create: {
            args: Prisma.AlertEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertEventPayload>
          }
          createMany: {
            args: Prisma.AlertEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AlertEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertEventPayload>[]
          }
          delete: {
            args: Prisma.AlertEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertEventPayload>
          }
          update: {
            args: Prisma.AlertEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertEventPayload>
          }
          deleteMany: {
            args: Prisma.AlertEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AlertEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AlertEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertEventPayload>[]
          }
          upsert: {
            args: Prisma.AlertEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertEventPayload>
          }
          aggregate: {
            args: Prisma.AlertEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAlertEvent>
          }
          groupBy: {
            args: Prisma.AlertEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<AlertEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.AlertEventCountArgs<ExtArgs>
            result: $Utils.Optional<AlertEventCountAggregateOutputType> | number
          }
        }
      }
      NewsArticle: {
        payload: Prisma.$NewsArticlePayload<ExtArgs>
        fields: Prisma.NewsArticleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NewsArticleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsArticlePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NewsArticleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsArticlePayload>
          }
          findFirst: {
            args: Prisma.NewsArticleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsArticlePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NewsArticleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsArticlePayload>
          }
          findMany: {
            args: Prisma.NewsArticleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsArticlePayload>[]
          }
          create: {
            args: Prisma.NewsArticleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsArticlePayload>
          }
          createMany: {
            args: Prisma.NewsArticleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NewsArticleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsArticlePayload>[]
          }
          delete: {
            args: Prisma.NewsArticleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsArticlePayload>
          }
          update: {
            args: Prisma.NewsArticleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsArticlePayload>
          }
          deleteMany: {
            args: Prisma.NewsArticleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NewsArticleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NewsArticleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsArticlePayload>[]
          }
          upsert: {
            args: Prisma.NewsArticleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsArticlePayload>
          }
          aggregate: {
            args: Prisma.NewsArticleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNewsArticle>
          }
          groupBy: {
            args: Prisma.NewsArticleGroupByArgs<ExtArgs>
            result: $Utils.Optional<NewsArticleGroupByOutputType>[]
          }
          count: {
            args: Prisma.NewsArticleCountArgs<ExtArgs>
            result: $Utils.Optional<NewsArticleCountAggregateOutputType> | number
          }
        }
      }
      NewsSymbol: {
        payload: Prisma.$NewsSymbolPayload<ExtArgs>
        fields: Prisma.NewsSymbolFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NewsSymbolFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsSymbolPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NewsSymbolFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsSymbolPayload>
          }
          findFirst: {
            args: Prisma.NewsSymbolFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsSymbolPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NewsSymbolFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsSymbolPayload>
          }
          findMany: {
            args: Prisma.NewsSymbolFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsSymbolPayload>[]
          }
          create: {
            args: Prisma.NewsSymbolCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsSymbolPayload>
          }
          createMany: {
            args: Prisma.NewsSymbolCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NewsSymbolCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsSymbolPayload>[]
          }
          delete: {
            args: Prisma.NewsSymbolDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsSymbolPayload>
          }
          update: {
            args: Prisma.NewsSymbolUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsSymbolPayload>
          }
          deleteMany: {
            args: Prisma.NewsSymbolDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NewsSymbolUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NewsSymbolUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsSymbolPayload>[]
          }
          upsert: {
            args: Prisma.NewsSymbolUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsSymbolPayload>
          }
          aggregate: {
            args: Prisma.NewsSymbolAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNewsSymbol>
          }
          groupBy: {
            args: Prisma.NewsSymbolGroupByArgs<ExtArgs>
            result: $Utils.Optional<NewsSymbolGroupByOutputType>[]
          }
          count: {
            args: Prisma.NewsSymbolCountArgs<ExtArgs>
            result: $Utils.Optional<NewsSymbolCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * A driver adapter that PrismaClient uses to connect to your database, such as the ones provided by `@prisma/adapter-pg`, `@prisma/adapter-libsql`, `@prisma/adapter-planetscale`, etc.
     * 
     * A driver adapter is **required** unless you connect to your database through Prisma Accelerate (in which case use `accelerateUrl` instead).
     * 
     * Learn more: https://pris.ly/d/driver-adapters
     * 
     * @example
     * ```ts
     * import { PrismaPg } from '@prisma/adapter-pg'
     * import { PrismaClient } from './generated/prisma/client'
     * 
     * const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
     * const prisma = new PrismaClient({ adapter })
     * ```
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * The Prisma Accelerate connection URL. Use this option to connect to your database through Prisma Accelerate instead of using a driver adapter to connect directly.
     * 
     * Learn more: https://pris.ly/d/accelerate
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    watchlist?: WatchlistOmit
    watchlistSymbol?: WatchlistSymbolOmit
    sector?: SectorOmit
    stock?: StockOmit
    sectorStock?: SectorStockOmit
    signal?: SignalOmit
    signalOutcome?: SignalOutcomeOmit
    alertRule?: AlertRuleOmit
    alertEvent?: AlertEventOmit
    newsArticle?: NewsArticleOmit
    newsSymbol?: NewsSymbolOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    watchlists: number
    alertRules: number
    alertEvents: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    watchlists?: boolean | UserCountOutputTypeCountWatchlistsArgs
    alertRules?: boolean | UserCountOutputTypeCountAlertRulesArgs
    alertEvents?: boolean | UserCountOutputTypeCountAlertEventsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountWatchlistsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WatchlistWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAlertRulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlertRuleWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAlertEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlertEventWhereInput
  }


  /**
   * Count Type WatchlistCountOutputType
   */

  export type WatchlistCountOutputType = {
    symbols: number
  }

  export type WatchlistCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    symbols?: boolean | WatchlistCountOutputTypeCountSymbolsArgs
  }

  // Custom InputTypes
  /**
   * WatchlistCountOutputType without action
   */
  export type WatchlistCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistCountOutputType
     */
    select?: WatchlistCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * WatchlistCountOutputType without action
   */
  export type WatchlistCountOutputTypeCountSymbolsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WatchlistSymbolWhereInput
  }


  /**
   * Count Type SectorCountOutputType
   */

  export type SectorCountOutputType = {
    stocks: number
    signals: number
  }

  export type SectorCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    stocks?: boolean | SectorCountOutputTypeCountStocksArgs
    signals?: boolean | SectorCountOutputTypeCountSignalsArgs
  }

  // Custom InputTypes
  /**
   * SectorCountOutputType without action
   */
  export type SectorCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorCountOutputType
     */
    select?: SectorCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SectorCountOutputType without action
   */
  export type SectorCountOutputTypeCountStocksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SectorStockWhereInput
  }

  /**
   * SectorCountOutputType without action
   */
  export type SectorCountOutputTypeCountSignalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SignalWhereInput
  }


  /**
   * Count Type StockCountOutputType
   */

  export type StockCountOutputType = {
    sectors: number
  }

  export type StockCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sectors?: boolean | StockCountOutputTypeCountSectorsArgs
  }

  // Custom InputTypes
  /**
   * StockCountOutputType without action
   */
  export type StockCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockCountOutputType
     */
    select?: StockCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * StockCountOutputType without action
   */
  export type StockCountOutputTypeCountSectorsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SectorStockWhereInput
  }


  /**
   * Count Type SignalCountOutputType
   */

  export type SignalCountOutputType = {
    alertEvents: number
  }

  export type SignalCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    alertEvents?: boolean | SignalCountOutputTypeCountAlertEventsArgs
  }

  // Custom InputTypes
  /**
   * SignalCountOutputType without action
   */
  export type SignalCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalCountOutputType
     */
    select?: SignalCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SignalCountOutputType without action
   */
  export type SignalCountOutputTypeCountAlertEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlertEventWhereInput
  }


  /**
   * Count Type NewsArticleCountOutputType
   */

  export type NewsArticleCountOutputType = {
    symbols: number
  }

  export type NewsArticleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    symbols?: boolean | NewsArticleCountOutputTypeCountSymbolsArgs
  }

  // Custom InputTypes
  /**
   * NewsArticleCountOutputType without action
   */
  export type NewsArticleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsArticleCountOutputType
     */
    select?: NewsArticleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * NewsArticleCountOutputType without action
   */
  export type NewsArticleCountOutputTypeCountSymbolsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NewsSymbolWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    watchlists?: boolean | User$watchlistsArgs<ExtArgs>
    alertRules?: boolean | User$alertRulesArgs<ExtArgs>
    alertEvents?: boolean | User$alertEventsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    watchlists?: boolean | User$watchlistsArgs<ExtArgs>
    alertRules?: boolean | User$alertRulesArgs<ExtArgs>
    alertEvents?: boolean | User$alertEventsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      watchlists: Prisma.$WatchlistPayload<ExtArgs>[]
      alertRules: Prisma.$AlertRulePayload<ExtArgs>[]
      alertEvents: Prisma.$AlertEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    watchlists<T extends User$watchlistsArgs<ExtArgs> = {}>(args?: Subset<T, User$watchlistsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WatchlistPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    alertRules<T extends User$alertRulesArgs<ExtArgs> = {}>(args?: Subset<T, User$alertRulesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertRulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    alertEvents<T extends User$alertEventsArgs<ExtArgs> = {}>(args?: Subset<T, User$alertEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.watchlists
   */
  export type User$watchlistsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistInclude<ExtArgs> | null
    where?: WatchlistWhereInput
    orderBy?: WatchlistOrderByWithRelationInput | WatchlistOrderByWithRelationInput[]
    cursor?: WatchlistWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WatchlistScalarFieldEnum | WatchlistScalarFieldEnum[]
  }

  /**
   * User.alertRules
   */
  export type User$alertRulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertRule
     */
    select?: AlertRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertRule
     */
    omit?: AlertRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertRuleInclude<ExtArgs> | null
    where?: AlertRuleWhereInput
    orderBy?: AlertRuleOrderByWithRelationInput | AlertRuleOrderByWithRelationInput[]
    cursor?: AlertRuleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AlertRuleScalarFieldEnum | AlertRuleScalarFieldEnum[]
  }

  /**
   * User.alertEvents
   */
  export type User$alertEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertEvent
     */
    select?: AlertEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertEvent
     */
    omit?: AlertEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertEventInclude<ExtArgs> | null
    where?: AlertEventWhereInput
    orderBy?: AlertEventOrderByWithRelationInput | AlertEventOrderByWithRelationInput[]
    cursor?: AlertEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AlertEventScalarFieldEnum | AlertEventScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Watchlist
   */

  export type AggregateWatchlist = {
    _count: WatchlistCountAggregateOutputType | null
    _min: WatchlistMinAggregateOutputType | null
    _max: WatchlistMaxAggregateOutputType | null
  }

  export type WatchlistMinAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WatchlistMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WatchlistCountAggregateOutputType = {
    id: number
    userId: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WatchlistMinAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WatchlistMaxAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WatchlistCountAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WatchlistAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Watchlist to aggregate.
     */
    where?: WatchlistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Watchlists to fetch.
     */
    orderBy?: WatchlistOrderByWithRelationInput | WatchlistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WatchlistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Watchlists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Watchlists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Watchlists
    **/
    _count?: true | WatchlistCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WatchlistMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WatchlistMaxAggregateInputType
  }

  export type GetWatchlistAggregateType<T extends WatchlistAggregateArgs> = {
        [P in keyof T & keyof AggregateWatchlist]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWatchlist[P]>
      : GetScalarType<T[P], AggregateWatchlist[P]>
  }




  export type WatchlistGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WatchlistWhereInput
    orderBy?: WatchlistOrderByWithAggregationInput | WatchlistOrderByWithAggregationInput[]
    by: WatchlistScalarFieldEnum[] | WatchlistScalarFieldEnum
    having?: WatchlistScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WatchlistCountAggregateInputType | true
    _min?: WatchlistMinAggregateInputType
    _max?: WatchlistMaxAggregateInputType
  }

  export type WatchlistGroupByOutputType = {
    id: string
    userId: string
    name: string
    createdAt: Date
    updatedAt: Date
    _count: WatchlistCountAggregateOutputType | null
    _min: WatchlistMinAggregateOutputType | null
    _max: WatchlistMaxAggregateOutputType | null
  }

  type GetWatchlistGroupByPayload<T extends WatchlistGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WatchlistGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WatchlistGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WatchlistGroupByOutputType[P]>
            : GetScalarType<T[P], WatchlistGroupByOutputType[P]>
        }
      >
    >


  export type WatchlistSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    symbols?: boolean | Watchlist$symbolsArgs<ExtArgs>
    _count?: boolean | WatchlistCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["watchlist"]>

  export type WatchlistSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["watchlist"]>

  export type WatchlistSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["watchlist"]>

  export type WatchlistSelectScalar = {
    id?: boolean
    userId?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WatchlistOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "name" | "createdAt" | "updatedAt", ExtArgs["result"]["watchlist"]>
  export type WatchlistInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    symbols?: boolean | Watchlist$symbolsArgs<ExtArgs>
    _count?: boolean | WatchlistCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type WatchlistIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type WatchlistIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $WatchlistPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Watchlist"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      symbols: Prisma.$WatchlistSymbolPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      name: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["watchlist"]>
    composites: {}
  }

  type WatchlistGetPayload<S extends boolean | null | undefined | WatchlistDefaultArgs> = $Result.GetResult<Prisma.$WatchlistPayload, S>

  type WatchlistCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WatchlistFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WatchlistCountAggregateInputType | true
    }

  export interface WatchlistDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Watchlist'], meta: { name: 'Watchlist' } }
    /**
     * Find zero or one Watchlist that matches the filter.
     * @param {WatchlistFindUniqueArgs} args - Arguments to find a Watchlist
     * @example
     * // Get one Watchlist
     * const watchlist = await prisma.watchlist.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WatchlistFindUniqueArgs>(args: SelectSubset<T, WatchlistFindUniqueArgs<ExtArgs>>): Prisma__WatchlistClient<$Result.GetResult<Prisma.$WatchlistPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Watchlist that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WatchlistFindUniqueOrThrowArgs} args - Arguments to find a Watchlist
     * @example
     * // Get one Watchlist
     * const watchlist = await prisma.watchlist.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WatchlistFindUniqueOrThrowArgs>(args: SelectSubset<T, WatchlistFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WatchlistClient<$Result.GetResult<Prisma.$WatchlistPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Watchlist that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistFindFirstArgs} args - Arguments to find a Watchlist
     * @example
     * // Get one Watchlist
     * const watchlist = await prisma.watchlist.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WatchlistFindFirstArgs>(args?: SelectSubset<T, WatchlistFindFirstArgs<ExtArgs>>): Prisma__WatchlistClient<$Result.GetResult<Prisma.$WatchlistPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Watchlist that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistFindFirstOrThrowArgs} args - Arguments to find a Watchlist
     * @example
     * // Get one Watchlist
     * const watchlist = await prisma.watchlist.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WatchlistFindFirstOrThrowArgs>(args?: SelectSubset<T, WatchlistFindFirstOrThrowArgs<ExtArgs>>): Prisma__WatchlistClient<$Result.GetResult<Prisma.$WatchlistPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Watchlists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Watchlists
     * const watchlists = await prisma.watchlist.findMany()
     * 
     * // Get first 10 Watchlists
     * const watchlists = await prisma.watchlist.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const watchlistWithIdOnly = await prisma.watchlist.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WatchlistFindManyArgs>(args?: SelectSubset<T, WatchlistFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WatchlistPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Watchlist.
     * @param {WatchlistCreateArgs} args - Arguments to create a Watchlist.
     * @example
     * // Create one Watchlist
     * const Watchlist = await prisma.watchlist.create({
     *   data: {
     *     // ... data to create a Watchlist
     *   }
     * })
     * 
     */
    create<T extends WatchlistCreateArgs>(args: SelectSubset<T, WatchlistCreateArgs<ExtArgs>>): Prisma__WatchlistClient<$Result.GetResult<Prisma.$WatchlistPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Watchlists.
     * @param {WatchlistCreateManyArgs} args - Arguments to create many Watchlists.
     * @example
     * // Create many Watchlists
     * const watchlist = await prisma.watchlist.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WatchlistCreateManyArgs>(args?: SelectSubset<T, WatchlistCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Watchlists and returns the data saved in the database.
     * @param {WatchlistCreateManyAndReturnArgs} args - Arguments to create many Watchlists.
     * @example
     * // Create many Watchlists
     * const watchlist = await prisma.watchlist.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Watchlists and only return the `id`
     * const watchlistWithIdOnly = await prisma.watchlist.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WatchlistCreateManyAndReturnArgs>(args?: SelectSubset<T, WatchlistCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WatchlistPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Watchlist.
     * @param {WatchlistDeleteArgs} args - Arguments to delete one Watchlist.
     * @example
     * // Delete one Watchlist
     * const Watchlist = await prisma.watchlist.delete({
     *   where: {
     *     // ... filter to delete one Watchlist
     *   }
     * })
     * 
     */
    delete<T extends WatchlistDeleteArgs>(args: SelectSubset<T, WatchlistDeleteArgs<ExtArgs>>): Prisma__WatchlistClient<$Result.GetResult<Prisma.$WatchlistPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Watchlist.
     * @param {WatchlistUpdateArgs} args - Arguments to update one Watchlist.
     * @example
     * // Update one Watchlist
     * const watchlist = await prisma.watchlist.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WatchlistUpdateArgs>(args: SelectSubset<T, WatchlistUpdateArgs<ExtArgs>>): Prisma__WatchlistClient<$Result.GetResult<Prisma.$WatchlistPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Watchlists.
     * @param {WatchlistDeleteManyArgs} args - Arguments to filter Watchlists to delete.
     * @example
     * // Delete a few Watchlists
     * const { count } = await prisma.watchlist.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WatchlistDeleteManyArgs>(args?: SelectSubset<T, WatchlistDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Watchlists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Watchlists
     * const watchlist = await prisma.watchlist.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WatchlistUpdateManyArgs>(args: SelectSubset<T, WatchlistUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Watchlists and returns the data updated in the database.
     * @param {WatchlistUpdateManyAndReturnArgs} args - Arguments to update many Watchlists.
     * @example
     * // Update many Watchlists
     * const watchlist = await prisma.watchlist.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Watchlists and only return the `id`
     * const watchlistWithIdOnly = await prisma.watchlist.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WatchlistUpdateManyAndReturnArgs>(args: SelectSubset<T, WatchlistUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WatchlistPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Watchlist.
     * @param {WatchlistUpsertArgs} args - Arguments to update or create a Watchlist.
     * @example
     * // Update or create a Watchlist
     * const watchlist = await prisma.watchlist.upsert({
     *   create: {
     *     // ... data to create a Watchlist
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Watchlist we want to update
     *   }
     * })
     */
    upsert<T extends WatchlistUpsertArgs>(args: SelectSubset<T, WatchlistUpsertArgs<ExtArgs>>): Prisma__WatchlistClient<$Result.GetResult<Prisma.$WatchlistPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Watchlists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistCountArgs} args - Arguments to filter Watchlists to count.
     * @example
     * // Count the number of Watchlists
     * const count = await prisma.watchlist.count({
     *   where: {
     *     // ... the filter for the Watchlists we want to count
     *   }
     * })
    **/
    count<T extends WatchlistCountArgs>(
      args?: Subset<T, WatchlistCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WatchlistCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Watchlist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WatchlistAggregateArgs>(args: Subset<T, WatchlistAggregateArgs>): Prisma.PrismaPromise<GetWatchlistAggregateType<T>>

    /**
     * Group by Watchlist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WatchlistGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WatchlistGroupByArgs['orderBy'] }
        : { orderBy?: WatchlistGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WatchlistGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWatchlistGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Watchlist model
   */
  readonly fields: WatchlistFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Watchlist.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WatchlistClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    symbols<T extends Watchlist$symbolsArgs<ExtArgs> = {}>(args?: Subset<T, Watchlist$symbolsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WatchlistSymbolPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Watchlist model
   */
  interface WatchlistFieldRefs {
    readonly id: FieldRef<"Watchlist", 'String'>
    readonly userId: FieldRef<"Watchlist", 'String'>
    readonly name: FieldRef<"Watchlist", 'String'>
    readonly createdAt: FieldRef<"Watchlist", 'DateTime'>
    readonly updatedAt: FieldRef<"Watchlist", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Watchlist findUnique
   */
  export type WatchlistFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistInclude<ExtArgs> | null
    /**
     * Filter, which Watchlist to fetch.
     */
    where: WatchlistWhereUniqueInput
  }

  /**
   * Watchlist findUniqueOrThrow
   */
  export type WatchlistFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistInclude<ExtArgs> | null
    /**
     * Filter, which Watchlist to fetch.
     */
    where: WatchlistWhereUniqueInput
  }

  /**
   * Watchlist findFirst
   */
  export type WatchlistFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistInclude<ExtArgs> | null
    /**
     * Filter, which Watchlist to fetch.
     */
    where?: WatchlistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Watchlists to fetch.
     */
    orderBy?: WatchlistOrderByWithRelationInput | WatchlistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Watchlists.
     */
    cursor?: WatchlistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Watchlists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Watchlists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Watchlists.
     */
    distinct?: WatchlistScalarFieldEnum | WatchlistScalarFieldEnum[]
  }

  /**
   * Watchlist findFirstOrThrow
   */
  export type WatchlistFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistInclude<ExtArgs> | null
    /**
     * Filter, which Watchlist to fetch.
     */
    where?: WatchlistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Watchlists to fetch.
     */
    orderBy?: WatchlistOrderByWithRelationInput | WatchlistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Watchlists.
     */
    cursor?: WatchlistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Watchlists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Watchlists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Watchlists.
     */
    distinct?: WatchlistScalarFieldEnum | WatchlistScalarFieldEnum[]
  }

  /**
   * Watchlist findMany
   */
  export type WatchlistFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistInclude<ExtArgs> | null
    /**
     * Filter, which Watchlists to fetch.
     */
    where?: WatchlistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Watchlists to fetch.
     */
    orderBy?: WatchlistOrderByWithRelationInput | WatchlistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Watchlists.
     */
    cursor?: WatchlistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Watchlists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Watchlists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Watchlists.
     */
    distinct?: WatchlistScalarFieldEnum | WatchlistScalarFieldEnum[]
  }

  /**
   * Watchlist create
   */
  export type WatchlistCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistInclude<ExtArgs> | null
    /**
     * The data needed to create a Watchlist.
     */
    data: XOR<WatchlistCreateInput, WatchlistUncheckedCreateInput>
  }

  /**
   * Watchlist createMany
   */
  export type WatchlistCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Watchlists.
     */
    data: WatchlistCreateManyInput | WatchlistCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Watchlist createManyAndReturn
   */
  export type WatchlistCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null
    /**
     * The data used to create many Watchlists.
     */
    data: WatchlistCreateManyInput | WatchlistCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Watchlist update
   */
  export type WatchlistUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistInclude<ExtArgs> | null
    /**
     * The data needed to update a Watchlist.
     */
    data: XOR<WatchlistUpdateInput, WatchlistUncheckedUpdateInput>
    /**
     * Choose, which Watchlist to update.
     */
    where: WatchlistWhereUniqueInput
  }

  /**
   * Watchlist updateMany
   */
  export type WatchlistUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Watchlists.
     */
    data: XOR<WatchlistUpdateManyMutationInput, WatchlistUncheckedUpdateManyInput>
    /**
     * Filter which Watchlists to update
     */
    where?: WatchlistWhereInput
    /**
     * Limit how many Watchlists to update.
     */
    limit?: number
  }

  /**
   * Watchlist updateManyAndReturn
   */
  export type WatchlistUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null
    /**
     * The data used to update Watchlists.
     */
    data: XOR<WatchlistUpdateManyMutationInput, WatchlistUncheckedUpdateManyInput>
    /**
     * Filter which Watchlists to update
     */
    where?: WatchlistWhereInput
    /**
     * Limit how many Watchlists to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Watchlist upsert
   */
  export type WatchlistUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistInclude<ExtArgs> | null
    /**
     * The filter to search for the Watchlist to update in case it exists.
     */
    where: WatchlistWhereUniqueInput
    /**
     * In case the Watchlist found by the `where` argument doesn't exist, create a new Watchlist with this data.
     */
    create: XOR<WatchlistCreateInput, WatchlistUncheckedCreateInput>
    /**
     * In case the Watchlist was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WatchlistUpdateInput, WatchlistUncheckedUpdateInput>
  }

  /**
   * Watchlist delete
   */
  export type WatchlistDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistInclude<ExtArgs> | null
    /**
     * Filter which Watchlist to delete.
     */
    where: WatchlistWhereUniqueInput
  }

  /**
   * Watchlist deleteMany
   */
  export type WatchlistDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Watchlists to delete
     */
    where?: WatchlistWhereInput
    /**
     * Limit how many Watchlists to delete.
     */
    limit?: number
  }

  /**
   * Watchlist.symbols
   */
  export type Watchlist$symbolsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistSymbol
     */
    select?: WatchlistSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WatchlistSymbol
     */
    omit?: WatchlistSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistSymbolInclude<ExtArgs> | null
    where?: WatchlistSymbolWhereInput
    orderBy?: WatchlistSymbolOrderByWithRelationInput | WatchlistSymbolOrderByWithRelationInput[]
    cursor?: WatchlistSymbolWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WatchlistSymbolScalarFieldEnum | WatchlistSymbolScalarFieldEnum[]
  }

  /**
   * Watchlist without action
   */
  export type WatchlistDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistInclude<ExtArgs> | null
  }


  /**
   * Model WatchlistSymbol
   */

  export type AggregateWatchlistSymbol = {
    _count: WatchlistSymbolCountAggregateOutputType | null
    _min: WatchlistSymbolMinAggregateOutputType | null
    _max: WatchlistSymbolMaxAggregateOutputType | null
  }

  export type WatchlistSymbolMinAggregateOutputType = {
    id: string | null
    watchlistId: string | null
    symbol: string | null
    createdAt: Date | null
  }

  export type WatchlistSymbolMaxAggregateOutputType = {
    id: string | null
    watchlistId: string | null
    symbol: string | null
    createdAt: Date | null
  }

  export type WatchlistSymbolCountAggregateOutputType = {
    id: number
    watchlistId: number
    symbol: number
    createdAt: number
    _all: number
  }


  export type WatchlistSymbolMinAggregateInputType = {
    id?: true
    watchlistId?: true
    symbol?: true
    createdAt?: true
  }

  export type WatchlistSymbolMaxAggregateInputType = {
    id?: true
    watchlistId?: true
    symbol?: true
    createdAt?: true
  }

  export type WatchlistSymbolCountAggregateInputType = {
    id?: true
    watchlistId?: true
    symbol?: true
    createdAt?: true
    _all?: true
  }

  export type WatchlistSymbolAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WatchlistSymbol to aggregate.
     */
    where?: WatchlistSymbolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WatchlistSymbols to fetch.
     */
    orderBy?: WatchlistSymbolOrderByWithRelationInput | WatchlistSymbolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WatchlistSymbolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WatchlistSymbols from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WatchlistSymbols.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WatchlistSymbols
    **/
    _count?: true | WatchlistSymbolCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WatchlistSymbolMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WatchlistSymbolMaxAggregateInputType
  }

  export type GetWatchlistSymbolAggregateType<T extends WatchlistSymbolAggregateArgs> = {
        [P in keyof T & keyof AggregateWatchlistSymbol]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWatchlistSymbol[P]>
      : GetScalarType<T[P], AggregateWatchlistSymbol[P]>
  }




  export type WatchlistSymbolGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WatchlistSymbolWhereInput
    orderBy?: WatchlistSymbolOrderByWithAggregationInput | WatchlistSymbolOrderByWithAggregationInput[]
    by: WatchlistSymbolScalarFieldEnum[] | WatchlistSymbolScalarFieldEnum
    having?: WatchlistSymbolScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WatchlistSymbolCountAggregateInputType | true
    _min?: WatchlistSymbolMinAggregateInputType
    _max?: WatchlistSymbolMaxAggregateInputType
  }

  export type WatchlistSymbolGroupByOutputType = {
    id: string
    watchlistId: string
    symbol: string
    createdAt: Date
    _count: WatchlistSymbolCountAggregateOutputType | null
    _min: WatchlistSymbolMinAggregateOutputType | null
    _max: WatchlistSymbolMaxAggregateOutputType | null
  }

  type GetWatchlistSymbolGroupByPayload<T extends WatchlistSymbolGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WatchlistSymbolGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WatchlistSymbolGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WatchlistSymbolGroupByOutputType[P]>
            : GetScalarType<T[P], WatchlistSymbolGroupByOutputType[P]>
        }
      >
    >


  export type WatchlistSymbolSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    watchlistId?: boolean
    symbol?: boolean
    createdAt?: boolean
    watchlist?: boolean | WatchlistDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["watchlistSymbol"]>

  export type WatchlistSymbolSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    watchlistId?: boolean
    symbol?: boolean
    createdAt?: boolean
    watchlist?: boolean | WatchlistDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["watchlistSymbol"]>

  export type WatchlistSymbolSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    watchlistId?: boolean
    symbol?: boolean
    createdAt?: boolean
    watchlist?: boolean | WatchlistDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["watchlistSymbol"]>

  export type WatchlistSymbolSelectScalar = {
    id?: boolean
    watchlistId?: boolean
    symbol?: boolean
    createdAt?: boolean
  }

  export type WatchlistSymbolOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "watchlistId" | "symbol" | "createdAt", ExtArgs["result"]["watchlistSymbol"]>
  export type WatchlistSymbolInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    watchlist?: boolean | WatchlistDefaultArgs<ExtArgs>
  }
  export type WatchlistSymbolIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    watchlist?: boolean | WatchlistDefaultArgs<ExtArgs>
  }
  export type WatchlistSymbolIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    watchlist?: boolean | WatchlistDefaultArgs<ExtArgs>
  }

  export type $WatchlistSymbolPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WatchlistSymbol"
    objects: {
      watchlist: Prisma.$WatchlistPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      watchlistId: string
      symbol: string
      createdAt: Date
    }, ExtArgs["result"]["watchlistSymbol"]>
    composites: {}
  }

  type WatchlistSymbolGetPayload<S extends boolean | null | undefined | WatchlistSymbolDefaultArgs> = $Result.GetResult<Prisma.$WatchlistSymbolPayload, S>

  type WatchlistSymbolCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WatchlistSymbolFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WatchlistSymbolCountAggregateInputType | true
    }

  export interface WatchlistSymbolDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WatchlistSymbol'], meta: { name: 'WatchlistSymbol' } }
    /**
     * Find zero or one WatchlistSymbol that matches the filter.
     * @param {WatchlistSymbolFindUniqueArgs} args - Arguments to find a WatchlistSymbol
     * @example
     * // Get one WatchlistSymbol
     * const watchlistSymbol = await prisma.watchlistSymbol.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WatchlistSymbolFindUniqueArgs>(args: SelectSubset<T, WatchlistSymbolFindUniqueArgs<ExtArgs>>): Prisma__WatchlistSymbolClient<$Result.GetResult<Prisma.$WatchlistSymbolPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WatchlistSymbol that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WatchlistSymbolFindUniqueOrThrowArgs} args - Arguments to find a WatchlistSymbol
     * @example
     * // Get one WatchlistSymbol
     * const watchlistSymbol = await prisma.watchlistSymbol.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WatchlistSymbolFindUniqueOrThrowArgs>(args: SelectSubset<T, WatchlistSymbolFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WatchlistSymbolClient<$Result.GetResult<Prisma.$WatchlistSymbolPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WatchlistSymbol that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistSymbolFindFirstArgs} args - Arguments to find a WatchlistSymbol
     * @example
     * // Get one WatchlistSymbol
     * const watchlistSymbol = await prisma.watchlistSymbol.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WatchlistSymbolFindFirstArgs>(args?: SelectSubset<T, WatchlistSymbolFindFirstArgs<ExtArgs>>): Prisma__WatchlistSymbolClient<$Result.GetResult<Prisma.$WatchlistSymbolPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WatchlistSymbol that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistSymbolFindFirstOrThrowArgs} args - Arguments to find a WatchlistSymbol
     * @example
     * // Get one WatchlistSymbol
     * const watchlistSymbol = await prisma.watchlistSymbol.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WatchlistSymbolFindFirstOrThrowArgs>(args?: SelectSubset<T, WatchlistSymbolFindFirstOrThrowArgs<ExtArgs>>): Prisma__WatchlistSymbolClient<$Result.GetResult<Prisma.$WatchlistSymbolPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WatchlistSymbols that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistSymbolFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WatchlistSymbols
     * const watchlistSymbols = await prisma.watchlistSymbol.findMany()
     * 
     * // Get first 10 WatchlistSymbols
     * const watchlistSymbols = await prisma.watchlistSymbol.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const watchlistSymbolWithIdOnly = await prisma.watchlistSymbol.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WatchlistSymbolFindManyArgs>(args?: SelectSubset<T, WatchlistSymbolFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WatchlistSymbolPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WatchlistSymbol.
     * @param {WatchlistSymbolCreateArgs} args - Arguments to create a WatchlistSymbol.
     * @example
     * // Create one WatchlistSymbol
     * const WatchlistSymbol = await prisma.watchlistSymbol.create({
     *   data: {
     *     // ... data to create a WatchlistSymbol
     *   }
     * })
     * 
     */
    create<T extends WatchlistSymbolCreateArgs>(args: SelectSubset<T, WatchlistSymbolCreateArgs<ExtArgs>>): Prisma__WatchlistSymbolClient<$Result.GetResult<Prisma.$WatchlistSymbolPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WatchlistSymbols.
     * @param {WatchlistSymbolCreateManyArgs} args - Arguments to create many WatchlistSymbols.
     * @example
     * // Create many WatchlistSymbols
     * const watchlistSymbol = await prisma.watchlistSymbol.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WatchlistSymbolCreateManyArgs>(args?: SelectSubset<T, WatchlistSymbolCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WatchlistSymbols and returns the data saved in the database.
     * @param {WatchlistSymbolCreateManyAndReturnArgs} args - Arguments to create many WatchlistSymbols.
     * @example
     * // Create many WatchlistSymbols
     * const watchlistSymbol = await prisma.watchlistSymbol.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WatchlistSymbols and only return the `id`
     * const watchlistSymbolWithIdOnly = await prisma.watchlistSymbol.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WatchlistSymbolCreateManyAndReturnArgs>(args?: SelectSubset<T, WatchlistSymbolCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WatchlistSymbolPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WatchlistSymbol.
     * @param {WatchlistSymbolDeleteArgs} args - Arguments to delete one WatchlistSymbol.
     * @example
     * // Delete one WatchlistSymbol
     * const WatchlistSymbol = await prisma.watchlistSymbol.delete({
     *   where: {
     *     // ... filter to delete one WatchlistSymbol
     *   }
     * })
     * 
     */
    delete<T extends WatchlistSymbolDeleteArgs>(args: SelectSubset<T, WatchlistSymbolDeleteArgs<ExtArgs>>): Prisma__WatchlistSymbolClient<$Result.GetResult<Prisma.$WatchlistSymbolPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WatchlistSymbol.
     * @param {WatchlistSymbolUpdateArgs} args - Arguments to update one WatchlistSymbol.
     * @example
     * // Update one WatchlistSymbol
     * const watchlistSymbol = await prisma.watchlistSymbol.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WatchlistSymbolUpdateArgs>(args: SelectSubset<T, WatchlistSymbolUpdateArgs<ExtArgs>>): Prisma__WatchlistSymbolClient<$Result.GetResult<Prisma.$WatchlistSymbolPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WatchlistSymbols.
     * @param {WatchlistSymbolDeleteManyArgs} args - Arguments to filter WatchlistSymbols to delete.
     * @example
     * // Delete a few WatchlistSymbols
     * const { count } = await prisma.watchlistSymbol.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WatchlistSymbolDeleteManyArgs>(args?: SelectSubset<T, WatchlistSymbolDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WatchlistSymbols.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistSymbolUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WatchlistSymbols
     * const watchlistSymbol = await prisma.watchlistSymbol.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WatchlistSymbolUpdateManyArgs>(args: SelectSubset<T, WatchlistSymbolUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WatchlistSymbols and returns the data updated in the database.
     * @param {WatchlistSymbolUpdateManyAndReturnArgs} args - Arguments to update many WatchlistSymbols.
     * @example
     * // Update many WatchlistSymbols
     * const watchlistSymbol = await prisma.watchlistSymbol.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WatchlistSymbols and only return the `id`
     * const watchlistSymbolWithIdOnly = await prisma.watchlistSymbol.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WatchlistSymbolUpdateManyAndReturnArgs>(args: SelectSubset<T, WatchlistSymbolUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WatchlistSymbolPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WatchlistSymbol.
     * @param {WatchlistSymbolUpsertArgs} args - Arguments to update or create a WatchlistSymbol.
     * @example
     * // Update or create a WatchlistSymbol
     * const watchlistSymbol = await prisma.watchlistSymbol.upsert({
     *   create: {
     *     // ... data to create a WatchlistSymbol
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WatchlistSymbol we want to update
     *   }
     * })
     */
    upsert<T extends WatchlistSymbolUpsertArgs>(args: SelectSubset<T, WatchlistSymbolUpsertArgs<ExtArgs>>): Prisma__WatchlistSymbolClient<$Result.GetResult<Prisma.$WatchlistSymbolPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WatchlistSymbols.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistSymbolCountArgs} args - Arguments to filter WatchlistSymbols to count.
     * @example
     * // Count the number of WatchlistSymbols
     * const count = await prisma.watchlistSymbol.count({
     *   where: {
     *     // ... the filter for the WatchlistSymbols we want to count
     *   }
     * })
    **/
    count<T extends WatchlistSymbolCountArgs>(
      args?: Subset<T, WatchlistSymbolCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WatchlistSymbolCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WatchlistSymbol.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistSymbolAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WatchlistSymbolAggregateArgs>(args: Subset<T, WatchlistSymbolAggregateArgs>): Prisma.PrismaPromise<GetWatchlistSymbolAggregateType<T>>

    /**
     * Group by WatchlistSymbol.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistSymbolGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WatchlistSymbolGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WatchlistSymbolGroupByArgs['orderBy'] }
        : { orderBy?: WatchlistSymbolGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WatchlistSymbolGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWatchlistSymbolGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WatchlistSymbol model
   */
  readonly fields: WatchlistSymbolFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WatchlistSymbol.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WatchlistSymbolClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    watchlist<T extends WatchlistDefaultArgs<ExtArgs> = {}>(args?: Subset<T, WatchlistDefaultArgs<ExtArgs>>): Prisma__WatchlistClient<$Result.GetResult<Prisma.$WatchlistPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WatchlistSymbol model
   */
  interface WatchlistSymbolFieldRefs {
    readonly id: FieldRef<"WatchlistSymbol", 'String'>
    readonly watchlistId: FieldRef<"WatchlistSymbol", 'String'>
    readonly symbol: FieldRef<"WatchlistSymbol", 'String'>
    readonly createdAt: FieldRef<"WatchlistSymbol", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WatchlistSymbol findUnique
   */
  export type WatchlistSymbolFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistSymbol
     */
    select?: WatchlistSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WatchlistSymbol
     */
    omit?: WatchlistSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistSymbolInclude<ExtArgs> | null
    /**
     * Filter, which WatchlistSymbol to fetch.
     */
    where: WatchlistSymbolWhereUniqueInput
  }

  /**
   * WatchlistSymbol findUniqueOrThrow
   */
  export type WatchlistSymbolFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistSymbol
     */
    select?: WatchlistSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WatchlistSymbol
     */
    omit?: WatchlistSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistSymbolInclude<ExtArgs> | null
    /**
     * Filter, which WatchlistSymbol to fetch.
     */
    where: WatchlistSymbolWhereUniqueInput
  }

  /**
   * WatchlistSymbol findFirst
   */
  export type WatchlistSymbolFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistSymbol
     */
    select?: WatchlistSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WatchlistSymbol
     */
    omit?: WatchlistSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistSymbolInclude<ExtArgs> | null
    /**
     * Filter, which WatchlistSymbol to fetch.
     */
    where?: WatchlistSymbolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WatchlistSymbols to fetch.
     */
    orderBy?: WatchlistSymbolOrderByWithRelationInput | WatchlistSymbolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WatchlistSymbols.
     */
    cursor?: WatchlistSymbolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WatchlistSymbols from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WatchlistSymbols.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WatchlistSymbols.
     */
    distinct?: WatchlistSymbolScalarFieldEnum | WatchlistSymbolScalarFieldEnum[]
  }

  /**
   * WatchlistSymbol findFirstOrThrow
   */
  export type WatchlistSymbolFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistSymbol
     */
    select?: WatchlistSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WatchlistSymbol
     */
    omit?: WatchlistSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistSymbolInclude<ExtArgs> | null
    /**
     * Filter, which WatchlistSymbol to fetch.
     */
    where?: WatchlistSymbolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WatchlistSymbols to fetch.
     */
    orderBy?: WatchlistSymbolOrderByWithRelationInput | WatchlistSymbolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WatchlistSymbols.
     */
    cursor?: WatchlistSymbolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WatchlistSymbols from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WatchlistSymbols.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WatchlistSymbols.
     */
    distinct?: WatchlistSymbolScalarFieldEnum | WatchlistSymbolScalarFieldEnum[]
  }

  /**
   * WatchlistSymbol findMany
   */
  export type WatchlistSymbolFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistSymbol
     */
    select?: WatchlistSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WatchlistSymbol
     */
    omit?: WatchlistSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistSymbolInclude<ExtArgs> | null
    /**
     * Filter, which WatchlistSymbols to fetch.
     */
    where?: WatchlistSymbolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WatchlistSymbols to fetch.
     */
    orderBy?: WatchlistSymbolOrderByWithRelationInput | WatchlistSymbolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WatchlistSymbols.
     */
    cursor?: WatchlistSymbolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WatchlistSymbols from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WatchlistSymbols.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WatchlistSymbols.
     */
    distinct?: WatchlistSymbolScalarFieldEnum | WatchlistSymbolScalarFieldEnum[]
  }

  /**
   * WatchlistSymbol create
   */
  export type WatchlistSymbolCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistSymbol
     */
    select?: WatchlistSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WatchlistSymbol
     */
    omit?: WatchlistSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistSymbolInclude<ExtArgs> | null
    /**
     * The data needed to create a WatchlistSymbol.
     */
    data: XOR<WatchlistSymbolCreateInput, WatchlistSymbolUncheckedCreateInput>
  }

  /**
   * WatchlistSymbol createMany
   */
  export type WatchlistSymbolCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WatchlistSymbols.
     */
    data: WatchlistSymbolCreateManyInput | WatchlistSymbolCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WatchlistSymbol createManyAndReturn
   */
  export type WatchlistSymbolCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistSymbol
     */
    select?: WatchlistSymbolSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WatchlistSymbol
     */
    omit?: WatchlistSymbolOmit<ExtArgs> | null
    /**
     * The data used to create many WatchlistSymbols.
     */
    data: WatchlistSymbolCreateManyInput | WatchlistSymbolCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistSymbolIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WatchlistSymbol update
   */
  export type WatchlistSymbolUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistSymbol
     */
    select?: WatchlistSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WatchlistSymbol
     */
    omit?: WatchlistSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistSymbolInclude<ExtArgs> | null
    /**
     * The data needed to update a WatchlistSymbol.
     */
    data: XOR<WatchlistSymbolUpdateInput, WatchlistSymbolUncheckedUpdateInput>
    /**
     * Choose, which WatchlistSymbol to update.
     */
    where: WatchlistSymbolWhereUniqueInput
  }

  /**
   * WatchlistSymbol updateMany
   */
  export type WatchlistSymbolUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WatchlistSymbols.
     */
    data: XOR<WatchlistSymbolUpdateManyMutationInput, WatchlistSymbolUncheckedUpdateManyInput>
    /**
     * Filter which WatchlistSymbols to update
     */
    where?: WatchlistSymbolWhereInput
    /**
     * Limit how many WatchlistSymbols to update.
     */
    limit?: number
  }

  /**
   * WatchlistSymbol updateManyAndReturn
   */
  export type WatchlistSymbolUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistSymbol
     */
    select?: WatchlistSymbolSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WatchlistSymbol
     */
    omit?: WatchlistSymbolOmit<ExtArgs> | null
    /**
     * The data used to update WatchlistSymbols.
     */
    data: XOR<WatchlistSymbolUpdateManyMutationInput, WatchlistSymbolUncheckedUpdateManyInput>
    /**
     * Filter which WatchlistSymbols to update
     */
    where?: WatchlistSymbolWhereInput
    /**
     * Limit how many WatchlistSymbols to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistSymbolIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WatchlistSymbol upsert
   */
  export type WatchlistSymbolUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistSymbol
     */
    select?: WatchlistSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WatchlistSymbol
     */
    omit?: WatchlistSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistSymbolInclude<ExtArgs> | null
    /**
     * The filter to search for the WatchlistSymbol to update in case it exists.
     */
    where: WatchlistSymbolWhereUniqueInput
    /**
     * In case the WatchlistSymbol found by the `where` argument doesn't exist, create a new WatchlistSymbol with this data.
     */
    create: XOR<WatchlistSymbolCreateInput, WatchlistSymbolUncheckedCreateInput>
    /**
     * In case the WatchlistSymbol was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WatchlistSymbolUpdateInput, WatchlistSymbolUncheckedUpdateInput>
  }

  /**
   * WatchlistSymbol delete
   */
  export type WatchlistSymbolDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistSymbol
     */
    select?: WatchlistSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WatchlistSymbol
     */
    omit?: WatchlistSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistSymbolInclude<ExtArgs> | null
    /**
     * Filter which WatchlistSymbol to delete.
     */
    where: WatchlistSymbolWhereUniqueInput
  }

  /**
   * WatchlistSymbol deleteMany
   */
  export type WatchlistSymbolDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WatchlistSymbols to delete
     */
    where?: WatchlistSymbolWhereInput
    /**
     * Limit how many WatchlistSymbols to delete.
     */
    limit?: number
  }

  /**
   * WatchlistSymbol without action
   */
  export type WatchlistSymbolDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistSymbol
     */
    select?: WatchlistSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WatchlistSymbol
     */
    omit?: WatchlistSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistSymbolInclude<ExtArgs> | null
  }


  /**
   * Model Sector
   */

  export type AggregateSector = {
    _count: SectorCountAggregateOutputType | null
    _min: SectorMinAggregateOutputType | null
    _max: SectorMaxAggregateOutputType | null
  }

  export type SectorMinAggregateOutputType = {
    id: string | null
    slug: string | null
    name: string | null
    description: string | null
    active: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SectorMaxAggregateOutputType = {
    id: string | null
    slug: string | null
    name: string | null
    description: string | null
    active: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SectorCountAggregateOutputType = {
    id: number
    slug: number
    name: number
    description: number
    active: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SectorMinAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    description?: true
    active?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SectorMaxAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    description?: true
    active?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SectorCountAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    description?: true
    active?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SectorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sector to aggregate.
     */
    where?: SectorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sectors to fetch.
     */
    orderBy?: SectorOrderByWithRelationInput | SectorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SectorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sectors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sectors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sectors
    **/
    _count?: true | SectorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SectorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SectorMaxAggregateInputType
  }

  export type GetSectorAggregateType<T extends SectorAggregateArgs> = {
        [P in keyof T & keyof AggregateSector]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSector[P]>
      : GetScalarType<T[P], AggregateSector[P]>
  }




  export type SectorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SectorWhereInput
    orderBy?: SectorOrderByWithAggregationInput | SectorOrderByWithAggregationInput[]
    by: SectorScalarFieldEnum[] | SectorScalarFieldEnum
    having?: SectorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SectorCountAggregateInputType | true
    _min?: SectorMinAggregateInputType
    _max?: SectorMaxAggregateInputType
  }

  export type SectorGroupByOutputType = {
    id: string
    slug: string
    name: string
    description: string | null
    active: boolean
    createdAt: Date
    updatedAt: Date
    _count: SectorCountAggregateOutputType | null
    _min: SectorMinAggregateOutputType | null
    _max: SectorMaxAggregateOutputType | null
  }

  type GetSectorGroupByPayload<T extends SectorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SectorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SectorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SectorGroupByOutputType[P]>
            : GetScalarType<T[P], SectorGroupByOutputType[P]>
        }
      >
    >


  export type SectorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    description?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    stocks?: boolean | Sector$stocksArgs<ExtArgs>
    signals?: boolean | Sector$signalsArgs<ExtArgs>
    _count?: boolean | SectorCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sector"]>

  export type SectorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    description?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["sector"]>

  export type SectorSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    description?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["sector"]>

  export type SectorSelectScalar = {
    id?: boolean
    slug?: boolean
    name?: boolean
    description?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SectorOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "slug" | "name" | "description" | "active" | "createdAt" | "updatedAt", ExtArgs["result"]["sector"]>
  export type SectorInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    stocks?: boolean | Sector$stocksArgs<ExtArgs>
    signals?: boolean | Sector$signalsArgs<ExtArgs>
    _count?: boolean | SectorCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SectorIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SectorIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SectorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Sector"
    objects: {
      stocks: Prisma.$SectorStockPayload<ExtArgs>[]
      signals: Prisma.$SignalPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      slug: string
      name: string
      description: string | null
      active: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["sector"]>
    composites: {}
  }

  type SectorGetPayload<S extends boolean | null | undefined | SectorDefaultArgs> = $Result.GetResult<Prisma.$SectorPayload, S>

  type SectorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SectorFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SectorCountAggregateInputType | true
    }

  export interface SectorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Sector'], meta: { name: 'Sector' } }
    /**
     * Find zero or one Sector that matches the filter.
     * @param {SectorFindUniqueArgs} args - Arguments to find a Sector
     * @example
     * // Get one Sector
     * const sector = await prisma.sector.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SectorFindUniqueArgs>(args: SelectSubset<T, SectorFindUniqueArgs<ExtArgs>>): Prisma__SectorClient<$Result.GetResult<Prisma.$SectorPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Sector that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SectorFindUniqueOrThrowArgs} args - Arguments to find a Sector
     * @example
     * // Get one Sector
     * const sector = await prisma.sector.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SectorFindUniqueOrThrowArgs>(args: SelectSubset<T, SectorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SectorClient<$Result.GetResult<Prisma.$SectorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sector that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectorFindFirstArgs} args - Arguments to find a Sector
     * @example
     * // Get one Sector
     * const sector = await prisma.sector.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SectorFindFirstArgs>(args?: SelectSubset<T, SectorFindFirstArgs<ExtArgs>>): Prisma__SectorClient<$Result.GetResult<Prisma.$SectorPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sector that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectorFindFirstOrThrowArgs} args - Arguments to find a Sector
     * @example
     * // Get one Sector
     * const sector = await prisma.sector.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SectorFindFirstOrThrowArgs>(args?: SelectSubset<T, SectorFindFirstOrThrowArgs<ExtArgs>>): Prisma__SectorClient<$Result.GetResult<Prisma.$SectorPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sectors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sectors
     * const sectors = await prisma.sector.findMany()
     * 
     * // Get first 10 Sectors
     * const sectors = await prisma.sector.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sectorWithIdOnly = await prisma.sector.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SectorFindManyArgs>(args?: SelectSubset<T, SectorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Sector.
     * @param {SectorCreateArgs} args - Arguments to create a Sector.
     * @example
     * // Create one Sector
     * const Sector = await prisma.sector.create({
     *   data: {
     *     // ... data to create a Sector
     *   }
     * })
     * 
     */
    create<T extends SectorCreateArgs>(args: SelectSubset<T, SectorCreateArgs<ExtArgs>>): Prisma__SectorClient<$Result.GetResult<Prisma.$SectorPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sectors.
     * @param {SectorCreateManyArgs} args - Arguments to create many Sectors.
     * @example
     * // Create many Sectors
     * const sector = await prisma.sector.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SectorCreateManyArgs>(args?: SelectSubset<T, SectorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sectors and returns the data saved in the database.
     * @param {SectorCreateManyAndReturnArgs} args - Arguments to create many Sectors.
     * @example
     * // Create many Sectors
     * const sector = await prisma.sector.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sectors and only return the `id`
     * const sectorWithIdOnly = await prisma.sector.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SectorCreateManyAndReturnArgs>(args?: SelectSubset<T, SectorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectorPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Sector.
     * @param {SectorDeleteArgs} args - Arguments to delete one Sector.
     * @example
     * // Delete one Sector
     * const Sector = await prisma.sector.delete({
     *   where: {
     *     // ... filter to delete one Sector
     *   }
     * })
     * 
     */
    delete<T extends SectorDeleteArgs>(args: SelectSubset<T, SectorDeleteArgs<ExtArgs>>): Prisma__SectorClient<$Result.GetResult<Prisma.$SectorPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Sector.
     * @param {SectorUpdateArgs} args - Arguments to update one Sector.
     * @example
     * // Update one Sector
     * const sector = await prisma.sector.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SectorUpdateArgs>(args: SelectSubset<T, SectorUpdateArgs<ExtArgs>>): Prisma__SectorClient<$Result.GetResult<Prisma.$SectorPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sectors.
     * @param {SectorDeleteManyArgs} args - Arguments to filter Sectors to delete.
     * @example
     * // Delete a few Sectors
     * const { count } = await prisma.sector.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SectorDeleteManyArgs>(args?: SelectSubset<T, SectorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sectors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sectors
     * const sector = await prisma.sector.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SectorUpdateManyArgs>(args: SelectSubset<T, SectorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sectors and returns the data updated in the database.
     * @param {SectorUpdateManyAndReturnArgs} args - Arguments to update many Sectors.
     * @example
     * // Update many Sectors
     * const sector = await prisma.sector.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sectors and only return the `id`
     * const sectorWithIdOnly = await prisma.sector.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SectorUpdateManyAndReturnArgs>(args: SelectSubset<T, SectorUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectorPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Sector.
     * @param {SectorUpsertArgs} args - Arguments to update or create a Sector.
     * @example
     * // Update or create a Sector
     * const sector = await prisma.sector.upsert({
     *   create: {
     *     // ... data to create a Sector
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Sector we want to update
     *   }
     * })
     */
    upsert<T extends SectorUpsertArgs>(args: SelectSubset<T, SectorUpsertArgs<ExtArgs>>): Prisma__SectorClient<$Result.GetResult<Prisma.$SectorPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sectors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectorCountArgs} args - Arguments to filter Sectors to count.
     * @example
     * // Count the number of Sectors
     * const count = await prisma.sector.count({
     *   where: {
     *     // ... the filter for the Sectors we want to count
     *   }
     * })
    **/
    count<T extends SectorCountArgs>(
      args?: Subset<T, SectorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SectorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Sector.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SectorAggregateArgs>(args: Subset<T, SectorAggregateArgs>): Prisma.PrismaPromise<GetSectorAggregateType<T>>

    /**
     * Group by Sector.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SectorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SectorGroupByArgs['orderBy'] }
        : { orderBy?: SectorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SectorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSectorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Sector model
   */
  readonly fields: SectorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Sector.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SectorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    stocks<T extends Sector$stocksArgs<ExtArgs> = {}>(args?: Subset<T, Sector$stocksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectorStockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    signals<T extends Sector$signalsArgs<ExtArgs> = {}>(args?: Subset<T, Sector$signalsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Sector model
   */
  interface SectorFieldRefs {
    readonly id: FieldRef<"Sector", 'String'>
    readonly slug: FieldRef<"Sector", 'String'>
    readonly name: FieldRef<"Sector", 'String'>
    readonly description: FieldRef<"Sector", 'String'>
    readonly active: FieldRef<"Sector", 'Boolean'>
    readonly createdAt: FieldRef<"Sector", 'DateTime'>
    readonly updatedAt: FieldRef<"Sector", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Sector findUnique
   */
  export type SectorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sector
     */
    select?: SectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sector
     */
    omit?: SectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorInclude<ExtArgs> | null
    /**
     * Filter, which Sector to fetch.
     */
    where: SectorWhereUniqueInput
  }

  /**
   * Sector findUniqueOrThrow
   */
  export type SectorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sector
     */
    select?: SectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sector
     */
    omit?: SectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorInclude<ExtArgs> | null
    /**
     * Filter, which Sector to fetch.
     */
    where: SectorWhereUniqueInput
  }

  /**
   * Sector findFirst
   */
  export type SectorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sector
     */
    select?: SectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sector
     */
    omit?: SectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorInclude<ExtArgs> | null
    /**
     * Filter, which Sector to fetch.
     */
    where?: SectorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sectors to fetch.
     */
    orderBy?: SectorOrderByWithRelationInput | SectorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sectors.
     */
    cursor?: SectorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sectors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sectors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sectors.
     */
    distinct?: SectorScalarFieldEnum | SectorScalarFieldEnum[]
  }

  /**
   * Sector findFirstOrThrow
   */
  export type SectorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sector
     */
    select?: SectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sector
     */
    omit?: SectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorInclude<ExtArgs> | null
    /**
     * Filter, which Sector to fetch.
     */
    where?: SectorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sectors to fetch.
     */
    orderBy?: SectorOrderByWithRelationInput | SectorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sectors.
     */
    cursor?: SectorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sectors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sectors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sectors.
     */
    distinct?: SectorScalarFieldEnum | SectorScalarFieldEnum[]
  }

  /**
   * Sector findMany
   */
  export type SectorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sector
     */
    select?: SectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sector
     */
    omit?: SectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorInclude<ExtArgs> | null
    /**
     * Filter, which Sectors to fetch.
     */
    where?: SectorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sectors to fetch.
     */
    orderBy?: SectorOrderByWithRelationInput | SectorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sectors.
     */
    cursor?: SectorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sectors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sectors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sectors.
     */
    distinct?: SectorScalarFieldEnum | SectorScalarFieldEnum[]
  }

  /**
   * Sector create
   */
  export type SectorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sector
     */
    select?: SectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sector
     */
    omit?: SectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorInclude<ExtArgs> | null
    /**
     * The data needed to create a Sector.
     */
    data: XOR<SectorCreateInput, SectorUncheckedCreateInput>
  }

  /**
   * Sector createMany
   */
  export type SectorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sectors.
     */
    data: SectorCreateManyInput | SectorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Sector createManyAndReturn
   */
  export type SectorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sector
     */
    select?: SectorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Sector
     */
    omit?: SectorOmit<ExtArgs> | null
    /**
     * The data used to create many Sectors.
     */
    data: SectorCreateManyInput | SectorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Sector update
   */
  export type SectorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sector
     */
    select?: SectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sector
     */
    omit?: SectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorInclude<ExtArgs> | null
    /**
     * The data needed to update a Sector.
     */
    data: XOR<SectorUpdateInput, SectorUncheckedUpdateInput>
    /**
     * Choose, which Sector to update.
     */
    where: SectorWhereUniqueInput
  }

  /**
   * Sector updateMany
   */
  export type SectorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sectors.
     */
    data: XOR<SectorUpdateManyMutationInput, SectorUncheckedUpdateManyInput>
    /**
     * Filter which Sectors to update
     */
    where?: SectorWhereInput
    /**
     * Limit how many Sectors to update.
     */
    limit?: number
  }

  /**
   * Sector updateManyAndReturn
   */
  export type SectorUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sector
     */
    select?: SectorSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Sector
     */
    omit?: SectorOmit<ExtArgs> | null
    /**
     * The data used to update Sectors.
     */
    data: XOR<SectorUpdateManyMutationInput, SectorUncheckedUpdateManyInput>
    /**
     * Filter which Sectors to update
     */
    where?: SectorWhereInput
    /**
     * Limit how many Sectors to update.
     */
    limit?: number
  }

  /**
   * Sector upsert
   */
  export type SectorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sector
     */
    select?: SectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sector
     */
    omit?: SectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorInclude<ExtArgs> | null
    /**
     * The filter to search for the Sector to update in case it exists.
     */
    where: SectorWhereUniqueInput
    /**
     * In case the Sector found by the `where` argument doesn't exist, create a new Sector with this data.
     */
    create: XOR<SectorCreateInput, SectorUncheckedCreateInput>
    /**
     * In case the Sector was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SectorUpdateInput, SectorUncheckedUpdateInput>
  }

  /**
   * Sector delete
   */
  export type SectorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sector
     */
    select?: SectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sector
     */
    omit?: SectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorInclude<ExtArgs> | null
    /**
     * Filter which Sector to delete.
     */
    where: SectorWhereUniqueInput
  }

  /**
   * Sector deleteMany
   */
  export type SectorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sectors to delete
     */
    where?: SectorWhereInput
    /**
     * Limit how many Sectors to delete.
     */
    limit?: number
  }

  /**
   * Sector.stocks
   */
  export type Sector$stocksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorStock
     */
    select?: SectorStockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectorStock
     */
    omit?: SectorStockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorStockInclude<ExtArgs> | null
    where?: SectorStockWhereInput
    orderBy?: SectorStockOrderByWithRelationInput | SectorStockOrderByWithRelationInput[]
    cursor?: SectorStockWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SectorStockScalarFieldEnum | SectorStockScalarFieldEnum[]
  }

  /**
   * Sector.signals
   */
  export type Sector$signalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    where?: SignalWhereInput
    orderBy?: SignalOrderByWithRelationInput | SignalOrderByWithRelationInput[]
    cursor?: SignalWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SignalScalarFieldEnum | SignalScalarFieldEnum[]
  }

  /**
   * Sector without action
   */
  export type SectorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sector
     */
    select?: SectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sector
     */
    omit?: SectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorInclude<ExtArgs> | null
  }


  /**
   * Model Stock
   */

  export type AggregateStock = {
    _count: StockCountAggregateOutputType | null
    _min: StockMinAggregateOutputType | null
    _max: StockMaxAggregateOutputType | null
  }

  export type StockMinAggregateOutputType = {
    id: string | null
    symbol: string | null
    name: string | null
    exchange: string | null
    active: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StockMaxAggregateOutputType = {
    id: string | null
    symbol: string | null
    name: string | null
    exchange: string | null
    active: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StockCountAggregateOutputType = {
    id: number
    symbol: number
    name: number
    exchange: number
    active: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StockMinAggregateInputType = {
    id?: true
    symbol?: true
    name?: true
    exchange?: true
    active?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StockMaxAggregateInputType = {
    id?: true
    symbol?: true
    name?: true
    exchange?: true
    active?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StockCountAggregateInputType = {
    id?: true
    symbol?: true
    name?: true
    exchange?: true
    active?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StockAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Stock to aggregate.
     */
    where?: StockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stocks to fetch.
     */
    orderBy?: StockOrderByWithRelationInput | StockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Stocks
    **/
    _count?: true | StockCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StockMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StockMaxAggregateInputType
  }

  export type GetStockAggregateType<T extends StockAggregateArgs> = {
        [P in keyof T & keyof AggregateStock]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStock[P]>
      : GetScalarType<T[P], AggregateStock[P]>
  }




  export type StockGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StockWhereInput
    orderBy?: StockOrderByWithAggregationInput | StockOrderByWithAggregationInput[]
    by: StockScalarFieldEnum[] | StockScalarFieldEnum
    having?: StockScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StockCountAggregateInputType | true
    _min?: StockMinAggregateInputType
    _max?: StockMaxAggregateInputType
  }

  export type StockGroupByOutputType = {
    id: string
    symbol: string
    name: string
    exchange: string
    active: boolean
    createdAt: Date
    updatedAt: Date
    _count: StockCountAggregateOutputType | null
    _min: StockMinAggregateOutputType | null
    _max: StockMaxAggregateOutputType | null
  }

  type GetStockGroupByPayload<T extends StockGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StockGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StockGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StockGroupByOutputType[P]>
            : GetScalarType<T[P], StockGroupByOutputType[P]>
        }
      >
    >


  export type StockSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    name?: boolean
    exchange?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sectors?: boolean | Stock$sectorsArgs<ExtArgs>
    _count?: boolean | StockCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["stock"]>

  export type StockSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    name?: boolean
    exchange?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["stock"]>

  export type StockSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    name?: boolean
    exchange?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["stock"]>

  export type StockSelectScalar = {
    id?: boolean
    symbol?: boolean
    name?: boolean
    exchange?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type StockOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "symbol" | "name" | "exchange" | "active" | "createdAt" | "updatedAt", ExtArgs["result"]["stock"]>
  export type StockInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sectors?: boolean | Stock$sectorsArgs<ExtArgs>
    _count?: boolean | StockCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type StockIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type StockIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $StockPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Stock"
    objects: {
      sectors: Prisma.$SectorStockPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      symbol: string
      name: string
      exchange: string
      active: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["stock"]>
    composites: {}
  }

  type StockGetPayload<S extends boolean | null | undefined | StockDefaultArgs> = $Result.GetResult<Prisma.$StockPayload, S>

  type StockCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StockFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StockCountAggregateInputType | true
    }

  export interface StockDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Stock'], meta: { name: 'Stock' } }
    /**
     * Find zero or one Stock that matches the filter.
     * @param {StockFindUniqueArgs} args - Arguments to find a Stock
     * @example
     * // Get one Stock
     * const stock = await prisma.stock.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StockFindUniqueArgs>(args: SelectSubset<T, StockFindUniqueArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Stock that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StockFindUniqueOrThrowArgs} args - Arguments to find a Stock
     * @example
     * // Get one Stock
     * const stock = await prisma.stock.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StockFindUniqueOrThrowArgs>(args: SelectSubset<T, StockFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Stock that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockFindFirstArgs} args - Arguments to find a Stock
     * @example
     * // Get one Stock
     * const stock = await prisma.stock.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StockFindFirstArgs>(args?: SelectSubset<T, StockFindFirstArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Stock that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockFindFirstOrThrowArgs} args - Arguments to find a Stock
     * @example
     * // Get one Stock
     * const stock = await prisma.stock.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StockFindFirstOrThrowArgs>(args?: SelectSubset<T, StockFindFirstOrThrowArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Stocks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Stocks
     * const stocks = await prisma.stock.findMany()
     * 
     * // Get first 10 Stocks
     * const stocks = await prisma.stock.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const stockWithIdOnly = await prisma.stock.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StockFindManyArgs>(args?: SelectSubset<T, StockFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Stock.
     * @param {StockCreateArgs} args - Arguments to create a Stock.
     * @example
     * // Create one Stock
     * const Stock = await prisma.stock.create({
     *   data: {
     *     // ... data to create a Stock
     *   }
     * })
     * 
     */
    create<T extends StockCreateArgs>(args: SelectSubset<T, StockCreateArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Stocks.
     * @param {StockCreateManyArgs} args - Arguments to create many Stocks.
     * @example
     * // Create many Stocks
     * const stock = await prisma.stock.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StockCreateManyArgs>(args?: SelectSubset<T, StockCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Stocks and returns the data saved in the database.
     * @param {StockCreateManyAndReturnArgs} args - Arguments to create many Stocks.
     * @example
     * // Create many Stocks
     * const stock = await prisma.stock.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Stocks and only return the `id`
     * const stockWithIdOnly = await prisma.stock.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StockCreateManyAndReturnArgs>(args?: SelectSubset<T, StockCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Stock.
     * @param {StockDeleteArgs} args - Arguments to delete one Stock.
     * @example
     * // Delete one Stock
     * const Stock = await prisma.stock.delete({
     *   where: {
     *     // ... filter to delete one Stock
     *   }
     * })
     * 
     */
    delete<T extends StockDeleteArgs>(args: SelectSubset<T, StockDeleteArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Stock.
     * @param {StockUpdateArgs} args - Arguments to update one Stock.
     * @example
     * // Update one Stock
     * const stock = await prisma.stock.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StockUpdateArgs>(args: SelectSubset<T, StockUpdateArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Stocks.
     * @param {StockDeleteManyArgs} args - Arguments to filter Stocks to delete.
     * @example
     * // Delete a few Stocks
     * const { count } = await prisma.stock.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StockDeleteManyArgs>(args?: SelectSubset<T, StockDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Stocks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Stocks
     * const stock = await prisma.stock.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StockUpdateManyArgs>(args: SelectSubset<T, StockUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Stocks and returns the data updated in the database.
     * @param {StockUpdateManyAndReturnArgs} args - Arguments to update many Stocks.
     * @example
     * // Update many Stocks
     * const stock = await prisma.stock.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Stocks and only return the `id`
     * const stockWithIdOnly = await prisma.stock.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends StockUpdateManyAndReturnArgs>(args: SelectSubset<T, StockUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Stock.
     * @param {StockUpsertArgs} args - Arguments to update or create a Stock.
     * @example
     * // Update or create a Stock
     * const stock = await prisma.stock.upsert({
     *   create: {
     *     // ... data to create a Stock
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Stock we want to update
     *   }
     * })
     */
    upsert<T extends StockUpsertArgs>(args: SelectSubset<T, StockUpsertArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Stocks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockCountArgs} args - Arguments to filter Stocks to count.
     * @example
     * // Count the number of Stocks
     * const count = await prisma.stock.count({
     *   where: {
     *     // ... the filter for the Stocks we want to count
     *   }
     * })
    **/
    count<T extends StockCountArgs>(
      args?: Subset<T, StockCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StockCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Stock.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StockAggregateArgs>(args: Subset<T, StockAggregateArgs>): Prisma.PrismaPromise<GetStockAggregateType<T>>

    /**
     * Group by Stock.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StockGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StockGroupByArgs['orderBy'] }
        : { orderBy?: StockGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StockGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStockGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Stock model
   */
  readonly fields: StockFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Stock.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StockClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sectors<T extends Stock$sectorsArgs<ExtArgs> = {}>(args?: Subset<T, Stock$sectorsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectorStockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Stock model
   */
  interface StockFieldRefs {
    readonly id: FieldRef<"Stock", 'String'>
    readonly symbol: FieldRef<"Stock", 'String'>
    readonly name: FieldRef<"Stock", 'String'>
    readonly exchange: FieldRef<"Stock", 'String'>
    readonly active: FieldRef<"Stock", 'Boolean'>
    readonly createdAt: FieldRef<"Stock", 'DateTime'>
    readonly updatedAt: FieldRef<"Stock", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Stock findUnique
   */
  export type StockFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * Filter, which Stock to fetch.
     */
    where: StockWhereUniqueInput
  }

  /**
   * Stock findUniqueOrThrow
   */
  export type StockFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * Filter, which Stock to fetch.
     */
    where: StockWhereUniqueInput
  }

  /**
   * Stock findFirst
   */
  export type StockFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * Filter, which Stock to fetch.
     */
    where?: StockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stocks to fetch.
     */
    orderBy?: StockOrderByWithRelationInput | StockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Stocks.
     */
    cursor?: StockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Stocks.
     */
    distinct?: StockScalarFieldEnum | StockScalarFieldEnum[]
  }

  /**
   * Stock findFirstOrThrow
   */
  export type StockFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * Filter, which Stock to fetch.
     */
    where?: StockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stocks to fetch.
     */
    orderBy?: StockOrderByWithRelationInput | StockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Stocks.
     */
    cursor?: StockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Stocks.
     */
    distinct?: StockScalarFieldEnum | StockScalarFieldEnum[]
  }

  /**
   * Stock findMany
   */
  export type StockFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * Filter, which Stocks to fetch.
     */
    where?: StockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stocks to fetch.
     */
    orderBy?: StockOrderByWithRelationInput | StockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Stocks.
     */
    cursor?: StockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Stocks.
     */
    distinct?: StockScalarFieldEnum | StockScalarFieldEnum[]
  }

  /**
   * Stock create
   */
  export type StockCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * The data needed to create a Stock.
     */
    data: XOR<StockCreateInput, StockUncheckedCreateInput>
  }

  /**
   * Stock createMany
   */
  export type StockCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Stocks.
     */
    data: StockCreateManyInput | StockCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Stock createManyAndReturn
   */
  export type StockCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * The data used to create many Stocks.
     */
    data: StockCreateManyInput | StockCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Stock update
   */
  export type StockUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * The data needed to update a Stock.
     */
    data: XOR<StockUpdateInput, StockUncheckedUpdateInput>
    /**
     * Choose, which Stock to update.
     */
    where: StockWhereUniqueInput
  }

  /**
   * Stock updateMany
   */
  export type StockUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Stocks.
     */
    data: XOR<StockUpdateManyMutationInput, StockUncheckedUpdateManyInput>
    /**
     * Filter which Stocks to update
     */
    where?: StockWhereInput
    /**
     * Limit how many Stocks to update.
     */
    limit?: number
  }

  /**
   * Stock updateManyAndReturn
   */
  export type StockUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * The data used to update Stocks.
     */
    data: XOR<StockUpdateManyMutationInput, StockUncheckedUpdateManyInput>
    /**
     * Filter which Stocks to update
     */
    where?: StockWhereInput
    /**
     * Limit how many Stocks to update.
     */
    limit?: number
  }

  /**
   * Stock upsert
   */
  export type StockUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * The filter to search for the Stock to update in case it exists.
     */
    where: StockWhereUniqueInput
    /**
     * In case the Stock found by the `where` argument doesn't exist, create a new Stock with this data.
     */
    create: XOR<StockCreateInput, StockUncheckedCreateInput>
    /**
     * In case the Stock was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StockUpdateInput, StockUncheckedUpdateInput>
  }

  /**
   * Stock delete
   */
  export type StockDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * Filter which Stock to delete.
     */
    where: StockWhereUniqueInput
  }

  /**
   * Stock deleteMany
   */
  export type StockDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Stocks to delete
     */
    where?: StockWhereInput
    /**
     * Limit how many Stocks to delete.
     */
    limit?: number
  }

  /**
   * Stock.sectors
   */
  export type Stock$sectorsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorStock
     */
    select?: SectorStockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectorStock
     */
    omit?: SectorStockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorStockInclude<ExtArgs> | null
    where?: SectorStockWhereInput
    orderBy?: SectorStockOrderByWithRelationInput | SectorStockOrderByWithRelationInput[]
    cursor?: SectorStockWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SectorStockScalarFieldEnum | SectorStockScalarFieldEnum[]
  }

  /**
   * Stock without action
   */
  export type StockDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
  }


  /**
   * Model SectorStock
   */

  export type AggregateSectorStock = {
    _count: SectorStockCountAggregateOutputType | null
    _avg: SectorStockAvgAggregateOutputType | null
    _sum: SectorStockSumAggregateOutputType | null
    _min: SectorStockMinAggregateOutputType | null
    _max: SectorStockMaxAggregateOutputType | null
  }

  export type SectorStockAvgAggregateOutputType = {
    weight: number | null
  }

  export type SectorStockSumAggregateOutputType = {
    weight: number | null
  }

  export type SectorStockMinAggregateOutputType = {
    id: string | null
    sectorId: string | null
    stockId: string | null
    weight: number | null
  }

  export type SectorStockMaxAggregateOutputType = {
    id: string | null
    sectorId: string | null
    stockId: string | null
    weight: number | null
  }

  export type SectorStockCountAggregateOutputType = {
    id: number
    sectorId: number
    stockId: number
    weight: number
    _all: number
  }


  export type SectorStockAvgAggregateInputType = {
    weight?: true
  }

  export type SectorStockSumAggregateInputType = {
    weight?: true
  }

  export type SectorStockMinAggregateInputType = {
    id?: true
    sectorId?: true
    stockId?: true
    weight?: true
  }

  export type SectorStockMaxAggregateInputType = {
    id?: true
    sectorId?: true
    stockId?: true
    weight?: true
  }

  export type SectorStockCountAggregateInputType = {
    id?: true
    sectorId?: true
    stockId?: true
    weight?: true
    _all?: true
  }

  export type SectorStockAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SectorStock to aggregate.
     */
    where?: SectorStockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SectorStocks to fetch.
     */
    orderBy?: SectorStockOrderByWithRelationInput | SectorStockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SectorStockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SectorStocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SectorStocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SectorStocks
    **/
    _count?: true | SectorStockCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SectorStockAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SectorStockSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SectorStockMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SectorStockMaxAggregateInputType
  }

  export type GetSectorStockAggregateType<T extends SectorStockAggregateArgs> = {
        [P in keyof T & keyof AggregateSectorStock]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSectorStock[P]>
      : GetScalarType<T[P], AggregateSectorStock[P]>
  }




  export type SectorStockGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SectorStockWhereInput
    orderBy?: SectorStockOrderByWithAggregationInput | SectorStockOrderByWithAggregationInput[]
    by: SectorStockScalarFieldEnum[] | SectorStockScalarFieldEnum
    having?: SectorStockScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SectorStockCountAggregateInputType | true
    _avg?: SectorStockAvgAggregateInputType
    _sum?: SectorStockSumAggregateInputType
    _min?: SectorStockMinAggregateInputType
    _max?: SectorStockMaxAggregateInputType
  }

  export type SectorStockGroupByOutputType = {
    id: string
    sectorId: string
    stockId: string
    weight: number
    _count: SectorStockCountAggregateOutputType | null
    _avg: SectorStockAvgAggregateOutputType | null
    _sum: SectorStockSumAggregateOutputType | null
    _min: SectorStockMinAggregateOutputType | null
    _max: SectorStockMaxAggregateOutputType | null
  }

  type GetSectorStockGroupByPayload<T extends SectorStockGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SectorStockGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SectorStockGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SectorStockGroupByOutputType[P]>
            : GetScalarType<T[P], SectorStockGroupByOutputType[P]>
        }
      >
    >


  export type SectorStockSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sectorId?: boolean
    stockId?: boolean
    weight?: boolean
    sector?: boolean | SectorDefaultArgs<ExtArgs>
    stock?: boolean | StockDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sectorStock"]>

  export type SectorStockSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sectorId?: boolean
    stockId?: boolean
    weight?: boolean
    sector?: boolean | SectorDefaultArgs<ExtArgs>
    stock?: boolean | StockDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sectorStock"]>

  export type SectorStockSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sectorId?: boolean
    stockId?: boolean
    weight?: boolean
    sector?: boolean | SectorDefaultArgs<ExtArgs>
    stock?: boolean | StockDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sectorStock"]>

  export type SectorStockSelectScalar = {
    id?: boolean
    sectorId?: boolean
    stockId?: boolean
    weight?: boolean
  }

  export type SectorStockOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sectorId" | "stockId" | "weight", ExtArgs["result"]["sectorStock"]>
  export type SectorStockInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sector?: boolean | SectorDefaultArgs<ExtArgs>
    stock?: boolean | StockDefaultArgs<ExtArgs>
  }
  export type SectorStockIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sector?: boolean | SectorDefaultArgs<ExtArgs>
    stock?: boolean | StockDefaultArgs<ExtArgs>
  }
  export type SectorStockIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sector?: boolean | SectorDefaultArgs<ExtArgs>
    stock?: boolean | StockDefaultArgs<ExtArgs>
  }

  export type $SectorStockPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SectorStock"
    objects: {
      sector: Prisma.$SectorPayload<ExtArgs>
      stock: Prisma.$StockPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sectorId: string
      stockId: string
      weight: number
    }, ExtArgs["result"]["sectorStock"]>
    composites: {}
  }

  type SectorStockGetPayload<S extends boolean | null | undefined | SectorStockDefaultArgs> = $Result.GetResult<Prisma.$SectorStockPayload, S>

  type SectorStockCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SectorStockFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SectorStockCountAggregateInputType | true
    }

  export interface SectorStockDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SectorStock'], meta: { name: 'SectorStock' } }
    /**
     * Find zero or one SectorStock that matches the filter.
     * @param {SectorStockFindUniqueArgs} args - Arguments to find a SectorStock
     * @example
     * // Get one SectorStock
     * const sectorStock = await prisma.sectorStock.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SectorStockFindUniqueArgs>(args: SelectSubset<T, SectorStockFindUniqueArgs<ExtArgs>>): Prisma__SectorStockClient<$Result.GetResult<Prisma.$SectorStockPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SectorStock that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SectorStockFindUniqueOrThrowArgs} args - Arguments to find a SectorStock
     * @example
     * // Get one SectorStock
     * const sectorStock = await prisma.sectorStock.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SectorStockFindUniqueOrThrowArgs>(args: SelectSubset<T, SectorStockFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SectorStockClient<$Result.GetResult<Prisma.$SectorStockPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SectorStock that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectorStockFindFirstArgs} args - Arguments to find a SectorStock
     * @example
     * // Get one SectorStock
     * const sectorStock = await prisma.sectorStock.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SectorStockFindFirstArgs>(args?: SelectSubset<T, SectorStockFindFirstArgs<ExtArgs>>): Prisma__SectorStockClient<$Result.GetResult<Prisma.$SectorStockPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SectorStock that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectorStockFindFirstOrThrowArgs} args - Arguments to find a SectorStock
     * @example
     * // Get one SectorStock
     * const sectorStock = await prisma.sectorStock.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SectorStockFindFirstOrThrowArgs>(args?: SelectSubset<T, SectorStockFindFirstOrThrowArgs<ExtArgs>>): Prisma__SectorStockClient<$Result.GetResult<Prisma.$SectorStockPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SectorStocks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectorStockFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SectorStocks
     * const sectorStocks = await prisma.sectorStock.findMany()
     * 
     * // Get first 10 SectorStocks
     * const sectorStocks = await prisma.sectorStock.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sectorStockWithIdOnly = await prisma.sectorStock.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SectorStockFindManyArgs>(args?: SelectSubset<T, SectorStockFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectorStockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SectorStock.
     * @param {SectorStockCreateArgs} args - Arguments to create a SectorStock.
     * @example
     * // Create one SectorStock
     * const SectorStock = await prisma.sectorStock.create({
     *   data: {
     *     // ... data to create a SectorStock
     *   }
     * })
     * 
     */
    create<T extends SectorStockCreateArgs>(args: SelectSubset<T, SectorStockCreateArgs<ExtArgs>>): Prisma__SectorStockClient<$Result.GetResult<Prisma.$SectorStockPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SectorStocks.
     * @param {SectorStockCreateManyArgs} args - Arguments to create many SectorStocks.
     * @example
     * // Create many SectorStocks
     * const sectorStock = await prisma.sectorStock.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SectorStockCreateManyArgs>(args?: SelectSubset<T, SectorStockCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SectorStocks and returns the data saved in the database.
     * @param {SectorStockCreateManyAndReturnArgs} args - Arguments to create many SectorStocks.
     * @example
     * // Create many SectorStocks
     * const sectorStock = await prisma.sectorStock.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SectorStocks and only return the `id`
     * const sectorStockWithIdOnly = await prisma.sectorStock.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SectorStockCreateManyAndReturnArgs>(args?: SelectSubset<T, SectorStockCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectorStockPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SectorStock.
     * @param {SectorStockDeleteArgs} args - Arguments to delete one SectorStock.
     * @example
     * // Delete one SectorStock
     * const SectorStock = await prisma.sectorStock.delete({
     *   where: {
     *     // ... filter to delete one SectorStock
     *   }
     * })
     * 
     */
    delete<T extends SectorStockDeleteArgs>(args: SelectSubset<T, SectorStockDeleteArgs<ExtArgs>>): Prisma__SectorStockClient<$Result.GetResult<Prisma.$SectorStockPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SectorStock.
     * @param {SectorStockUpdateArgs} args - Arguments to update one SectorStock.
     * @example
     * // Update one SectorStock
     * const sectorStock = await prisma.sectorStock.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SectorStockUpdateArgs>(args: SelectSubset<T, SectorStockUpdateArgs<ExtArgs>>): Prisma__SectorStockClient<$Result.GetResult<Prisma.$SectorStockPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SectorStocks.
     * @param {SectorStockDeleteManyArgs} args - Arguments to filter SectorStocks to delete.
     * @example
     * // Delete a few SectorStocks
     * const { count } = await prisma.sectorStock.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SectorStockDeleteManyArgs>(args?: SelectSubset<T, SectorStockDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SectorStocks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectorStockUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SectorStocks
     * const sectorStock = await prisma.sectorStock.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SectorStockUpdateManyArgs>(args: SelectSubset<T, SectorStockUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SectorStocks and returns the data updated in the database.
     * @param {SectorStockUpdateManyAndReturnArgs} args - Arguments to update many SectorStocks.
     * @example
     * // Update many SectorStocks
     * const sectorStock = await prisma.sectorStock.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SectorStocks and only return the `id`
     * const sectorStockWithIdOnly = await prisma.sectorStock.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SectorStockUpdateManyAndReturnArgs>(args: SelectSubset<T, SectorStockUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectorStockPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SectorStock.
     * @param {SectorStockUpsertArgs} args - Arguments to update or create a SectorStock.
     * @example
     * // Update or create a SectorStock
     * const sectorStock = await prisma.sectorStock.upsert({
     *   create: {
     *     // ... data to create a SectorStock
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SectorStock we want to update
     *   }
     * })
     */
    upsert<T extends SectorStockUpsertArgs>(args: SelectSubset<T, SectorStockUpsertArgs<ExtArgs>>): Prisma__SectorStockClient<$Result.GetResult<Prisma.$SectorStockPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SectorStocks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectorStockCountArgs} args - Arguments to filter SectorStocks to count.
     * @example
     * // Count the number of SectorStocks
     * const count = await prisma.sectorStock.count({
     *   where: {
     *     // ... the filter for the SectorStocks we want to count
     *   }
     * })
    **/
    count<T extends SectorStockCountArgs>(
      args?: Subset<T, SectorStockCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SectorStockCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SectorStock.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectorStockAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SectorStockAggregateArgs>(args: Subset<T, SectorStockAggregateArgs>): Prisma.PrismaPromise<GetSectorStockAggregateType<T>>

    /**
     * Group by SectorStock.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectorStockGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SectorStockGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SectorStockGroupByArgs['orderBy'] }
        : { orderBy?: SectorStockGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SectorStockGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSectorStockGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SectorStock model
   */
  readonly fields: SectorStockFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SectorStock.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SectorStockClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sector<T extends SectorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SectorDefaultArgs<ExtArgs>>): Prisma__SectorClient<$Result.GetResult<Prisma.$SectorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    stock<T extends StockDefaultArgs<ExtArgs> = {}>(args?: Subset<T, StockDefaultArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SectorStock model
   */
  interface SectorStockFieldRefs {
    readonly id: FieldRef<"SectorStock", 'String'>
    readonly sectorId: FieldRef<"SectorStock", 'String'>
    readonly stockId: FieldRef<"SectorStock", 'String'>
    readonly weight: FieldRef<"SectorStock", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * SectorStock findUnique
   */
  export type SectorStockFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorStock
     */
    select?: SectorStockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectorStock
     */
    omit?: SectorStockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorStockInclude<ExtArgs> | null
    /**
     * Filter, which SectorStock to fetch.
     */
    where: SectorStockWhereUniqueInput
  }

  /**
   * SectorStock findUniqueOrThrow
   */
  export type SectorStockFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorStock
     */
    select?: SectorStockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectorStock
     */
    omit?: SectorStockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorStockInclude<ExtArgs> | null
    /**
     * Filter, which SectorStock to fetch.
     */
    where: SectorStockWhereUniqueInput
  }

  /**
   * SectorStock findFirst
   */
  export type SectorStockFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorStock
     */
    select?: SectorStockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectorStock
     */
    omit?: SectorStockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorStockInclude<ExtArgs> | null
    /**
     * Filter, which SectorStock to fetch.
     */
    where?: SectorStockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SectorStocks to fetch.
     */
    orderBy?: SectorStockOrderByWithRelationInput | SectorStockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SectorStocks.
     */
    cursor?: SectorStockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SectorStocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SectorStocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SectorStocks.
     */
    distinct?: SectorStockScalarFieldEnum | SectorStockScalarFieldEnum[]
  }

  /**
   * SectorStock findFirstOrThrow
   */
  export type SectorStockFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorStock
     */
    select?: SectorStockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectorStock
     */
    omit?: SectorStockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorStockInclude<ExtArgs> | null
    /**
     * Filter, which SectorStock to fetch.
     */
    where?: SectorStockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SectorStocks to fetch.
     */
    orderBy?: SectorStockOrderByWithRelationInput | SectorStockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SectorStocks.
     */
    cursor?: SectorStockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SectorStocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SectorStocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SectorStocks.
     */
    distinct?: SectorStockScalarFieldEnum | SectorStockScalarFieldEnum[]
  }

  /**
   * SectorStock findMany
   */
  export type SectorStockFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorStock
     */
    select?: SectorStockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectorStock
     */
    omit?: SectorStockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorStockInclude<ExtArgs> | null
    /**
     * Filter, which SectorStocks to fetch.
     */
    where?: SectorStockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SectorStocks to fetch.
     */
    orderBy?: SectorStockOrderByWithRelationInput | SectorStockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SectorStocks.
     */
    cursor?: SectorStockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SectorStocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SectorStocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SectorStocks.
     */
    distinct?: SectorStockScalarFieldEnum | SectorStockScalarFieldEnum[]
  }

  /**
   * SectorStock create
   */
  export type SectorStockCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorStock
     */
    select?: SectorStockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectorStock
     */
    omit?: SectorStockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorStockInclude<ExtArgs> | null
    /**
     * The data needed to create a SectorStock.
     */
    data: XOR<SectorStockCreateInput, SectorStockUncheckedCreateInput>
  }

  /**
   * SectorStock createMany
   */
  export type SectorStockCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SectorStocks.
     */
    data: SectorStockCreateManyInput | SectorStockCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SectorStock createManyAndReturn
   */
  export type SectorStockCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorStock
     */
    select?: SectorStockSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SectorStock
     */
    omit?: SectorStockOmit<ExtArgs> | null
    /**
     * The data used to create many SectorStocks.
     */
    data: SectorStockCreateManyInput | SectorStockCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorStockIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SectorStock update
   */
  export type SectorStockUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorStock
     */
    select?: SectorStockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectorStock
     */
    omit?: SectorStockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorStockInclude<ExtArgs> | null
    /**
     * The data needed to update a SectorStock.
     */
    data: XOR<SectorStockUpdateInput, SectorStockUncheckedUpdateInput>
    /**
     * Choose, which SectorStock to update.
     */
    where: SectorStockWhereUniqueInput
  }

  /**
   * SectorStock updateMany
   */
  export type SectorStockUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SectorStocks.
     */
    data: XOR<SectorStockUpdateManyMutationInput, SectorStockUncheckedUpdateManyInput>
    /**
     * Filter which SectorStocks to update
     */
    where?: SectorStockWhereInput
    /**
     * Limit how many SectorStocks to update.
     */
    limit?: number
  }

  /**
   * SectorStock updateManyAndReturn
   */
  export type SectorStockUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorStock
     */
    select?: SectorStockSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SectorStock
     */
    omit?: SectorStockOmit<ExtArgs> | null
    /**
     * The data used to update SectorStocks.
     */
    data: XOR<SectorStockUpdateManyMutationInput, SectorStockUncheckedUpdateManyInput>
    /**
     * Filter which SectorStocks to update
     */
    where?: SectorStockWhereInput
    /**
     * Limit how many SectorStocks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorStockIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SectorStock upsert
   */
  export type SectorStockUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorStock
     */
    select?: SectorStockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectorStock
     */
    omit?: SectorStockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorStockInclude<ExtArgs> | null
    /**
     * The filter to search for the SectorStock to update in case it exists.
     */
    where: SectorStockWhereUniqueInput
    /**
     * In case the SectorStock found by the `where` argument doesn't exist, create a new SectorStock with this data.
     */
    create: XOR<SectorStockCreateInput, SectorStockUncheckedCreateInput>
    /**
     * In case the SectorStock was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SectorStockUpdateInput, SectorStockUncheckedUpdateInput>
  }

  /**
   * SectorStock delete
   */
  export type SectorStockDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorStock
     */
    select?: SectorStockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectorStock
     */
    omit?: SectorStockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorStockInclude<ExtArgs> | null
    /**
     * Filter which SectorStock to delete.
     */
    where: SectorStockWhereUniqueInput
  }

  /**
   * SectorStock deleteMany
   */
  export type SectorStockDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SectorStocks to delete
     */
    where?: SectorStockWhereInput
    /**
     * Limit how many SectorStocks to delete.
     */
    limit?: number
  }

  /**
   * SectorStock without action
   */
  export type SectorStockDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectorStock
     */
    select?: SectorStockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectorStock
     */
    omit?: SectorStockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorStockInclude<ExtArgs> | null
  }


  /**
   * Model Signal
   */

  export type AggregateSignal = {
    _count: SignalCountAggregateOutputType | null
    _avg: SignalAvgAggregateOutputType | null
    _sum: SignalSumAggregateOutputType | null
    _min: SignalMinAggregateOutputType | null
    _max: SignalMaxAggregateOutputType | null
  }

  export type SignalAvgAggregateOutputType = {
    score: number | null
    triggerValue: number | null
    previousValue: number | null
  }

  export type SignalSumAggregateOutputType = {
    score: number | null
    triggerValue: number | null
    previousValue: number | null
  }

  export type SignalMinAggregateOutputType = {
    id: string | null
    symbol: string | null
    sectorId: string | null
    type: $Enums.SignalType | null
    severity: $Enums.SignalSeverity | null
    score: number | null
    triggerValue: number | null
    previousValue: number | null
    headline: string | null
    createdAt: Date | null
  }

  export type SignalMaxAggregateOutputType = {
    id: string | null
    symbol: string | null
    sectorId: string | null
    type: $Enums.SignalType | null
    severity: $Enums.SignalSeverity | null
    score: number | null
    triggerValue: number | null
    previousValue: number | null
    headline: string | null
    createdAt: Date | null
  }

  export type SignalCountAggregateOutputType = {
    id: number
    symbol: number
    sectorId: number
    type: number
    severity: number
    score: number
    triggerValue: number
    previousValue: number
    headline: number
    metadata: number
    createdAt: number
    _all: number
  }


  export type SignalAvgAggregateInputType = {
    score?: true
    triggerValue?: true
    previousValue?: true
  }

  export type SignalSumAggregateInputType = {
    score?: true
    triggerValue?: true
    previousValue?: true
  }

  export type SignalMinAggregateInputType = {
    id?: true
    symbol?: true
    sectorId?: true
    type?: true
    severity?: true
    score?: true
    triggerValue?: true
    previousValue?: true
    headline?: true
    createdAt?: true
  }

  export type SignalMaxAggregateInputType = {
    id?: true
    symbol?: true
    sectorId?: true
    type?: true
    severity?: true
    score?: true
    triggerValue?: true
    previousValue?: true
    headline?: true
    createdAt?: true
  }

  export type SignalCountAggregateInputType = {
    id?: true
    symbol?: true
    sectorId?: true
    type?: true
    severity?: true
    score?: true
    triggerValue?: true
    previousValue?: true
    headline?: true
    metadata?: true
    createdAt?: true
    _all?: true
  }

  export type SignalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Signal to aggregate.
     */
    where?: SignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signals to fetch.
     */
    orderBy?: SignalOrderByWithRelationInput | SignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Signals
    **/
    _count?: true | SignalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SignalAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SignalSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SignalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SignalMaxAggregateInputType
  }

  export type GetSignalAggregateType<T extends SignalAggregateArgs> = {
        [P in keyof T & keyof AggregateSignal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSignal[P]>
      : GetScalarType<T[P], AggregateSignal[P]>
  }




  export type SignalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SignalWhereInput
    orderBy?: SignalOrderByWithAggregationInput | SignalOrderByWithAggregationInput[]
    by: SignalScalarFieldEnum[] | SignalScalarFieldEnum
    having?: SignalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SignalCountAggregateInputType | true
    _avg?: SignalAvgAggregateInputType
    _sum?: SignalSumAggregateInputType
    _min?: SignalMinAggregateInputType
    _max?: SignalMaxAggregateInputType
  }

  export type SignalGroupByOutputType = {
    id: string
    symbol: string | null
    sectorId: string | null
    type: $Enums.SignalType
    severity: $Enums.SignalSeverity
    score: number
    triggerValue: number
    previousValue: number | null
    headline: string
    metadata: JsonValue
    createdAt: Date
    _count: SignalCountAggregateOutputType | null
    _avg: SignalAvgAggregateOutputType | null
    _sum: SignalSumAggregateOutputType | null
    _min: SignalMinAggregateOutputType | null
    _max: SignalMaxAggregateOutputType | null
  }

  type GetSignalGroupByPayload<T extends SignalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SignalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SignalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SignalGroupByOutputType[P]>
            : GetScalarType<T[P], SignalGroupByOutputType[P]>
        }
      >
    >


  export type SignalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    sectorId?: boolean
    type?: boolean
    severity?: boolean
    score?: boolean
    triggerValue?: boolean
    previousValue?: boolean
    headline?: boolean
    metadata?: boolean
    createdAt?: boolean
    sector?: boolean | Signal$sectorArgs<ExtArgs>
    alertEvents?: boolean | Signal$alertEventsArgs<ExtArgs>
    outcome?: boolean | Signal$outcomeArgs<ExtArgs>
    _count?: boolean | SignalCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["signal"]>

  export type SignalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    sectorId?: boolean
    type?: boolean
    severity?: boolean
    score?: boolean
    triggerValue?: boolean
    previousValue?: boolean
    headline?: boolean
    metadata?: boolean
    createdAt?: boolean
    sector?: boolean | Signal$sectorArgs<ExtArgs>
  }, ExtArgs["result"]["signal"]>

  export type SignalSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    sectorId?: boolean
    type?: boolean
    severity?: boolean
    score?: boolean
    triggerValue?: boolean
    previousValue?: boolean
    headline?: boolean
    metadata?: boolean
    createdAt?: boolean
    sector?: boolean | Signal$sectorArgs<ExtArgs>
  }, ExtArgs["result"]["signal"]>

  export type SignalSelectScalar = {
    id?: boolean
    symbol?: boolean
    sectorId?: boolean
    type?: boolean
    severity?: boolean
    score?: boolean
    triggerValue?: boolean
    previousValue?: boolean
    headline?: boolean
    metadata?: boolean
    createdAt?: boolean
  }

  export type SignalOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "symbol" | "sectorId" | "type" | "severity" | "score" | "triggerValue" | "previousValue" | "headline" | "metadata" | "createdAt", ExtArgs["result"]["signal"]>
  export type SignalInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sector?: boolean | Signal$sectorArgs<ExtArgs>
    alertEvents?: boolean | Signal$alertEventsArgs<ExtArgs>
    outcome?: boolean | Signal$outcomeArgs<ExtArgs>
    _count?: boolean | SignalCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SignalIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sector?: boolean | Signal$sectorArgs<ExtArgs>
  }
  export type SignalIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sector?: boolean | Signal$sectorArgs<ExtArgs>
  }

  export type $SignalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Signal"
    objects: {
      sector: Prisma.$SectorPayload<ExtArgs> | null
      alertEvents: Prisma.$AlertEventPayload<ExtArgs>[]
      outcome: Prisma.$SignalOutcomePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      symbol: string | null
      sectorId: string | null
      type: $Enums.SignalType
      severity: $Enums.SignalSeverity
      score: number
      triggerValue: number
      previousValue: number | null
      headline: string
      metadata: Prisma.JsonValue
      createdAt: Date
    }, ExtArgs["result"]["signal"]>
    composites: {}
  }

  type SignalGetPayload<S extends boolean | null | undefined | SignalDefaultArgs> = $Result.GetResult<Prisma.$SignalPayload, S>

  type SignalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SignalFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SignalCountAggregateInputType | true
    }

  export interface SignalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Signal'], meta: { name: 'Signal' } }
    /**
     * Find zero or one Signal that matches the filter.
     * @param {SignalFindUniqueArgs} args - Arguments to find a Signal
     * @example
     * // Get one Signal
     * const signal = await prisma.signal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SignalFindUniqueArgs>(args: SelectSubset<T, SignalFindUniqueArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Signal that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SignalFindUniqueOrThrowArgs} args - Arguments to find a Signal
     * @example
     * // Get one Signal
     * const signal = await prisma.signal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SignalFindUniqueOrThrowArgs>(args: SelectSubset<T, SignalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Signal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalFindFirstArgs} args - Arguments to find a Signal
     * @example
     * // Get one Signal
     * const signal = await prisma.signal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SignalFindFirstArgs>(args?: SelectSubset<T, SignalFindFirstArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Signal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalFindFirstOrThrowArgs} args - Arguments to find a Signal
     * @example
     * // Get one Signal
     * const signal = await prisma.signal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SignalFindFirstOrThrowArgs>(args?: SelectSubset<T, SignalFindFirstOrThrowArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Signals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Signals
     * const signals = await prisma.signal.findMany()
     * 
     * // Get first 10 Signals
     * const signals = await prisma.signal.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const signalWithIdOnly = await prisma.signal.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SignalFindManyArgs>(args?: SelectSubset<T, SignalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Signal.
     * @param {SignalCreateArgs} args - Arguments to create a Signal.
     * @example
     * // Create one Signal
     * const Signal = await prisma.signal.create({
     *   data: {
     *     // ... data to create a Signal
     *   }
     * })
     * 
     */
    create<T extends SignalCreateArgs>(args: SelectSubset<T, SignalCreateArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Signals.
     * @param {SignalCreateManyArgs} args - Arguments to create many Signals.
     * @example
     * // Create many Signals
     * const signal = await prisma.signal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SignalCreateManyArgs>(args?: SelectSubset<T, SignalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Signals and returns the data saved in the database.
     * @param {SignalCreateManyAndReturnArgs} args - Arguments to create many Signals.
     * @example
     * // Create many Signals
     * const signal = await prisma.signal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Signals and only return the `id`
     * const signalWithIdOnly = await prisma.signal.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SignalCreateManyAndReturnArgs>(args?: SelectSubset<T, SignalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Signal.
     * @param {SignalDeleteArgs} args - Arguments to delete one Signal.
     * @example
     * // Delete one Signal
     * const Signal = await prisma.signal.delete({
     *   where: {
     *     // ... filter to delete one Signal
     *   }
     * })
     * 
     */
    delete<T extends SignalDeleteArgs>(args: SelectSubset<T, SignalDeleteArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Signal.
     * @param {SignalUpdateArgs} args - Arguments to update one Signal.
     * @example
     * // Update one Signal
     * const signal = await prisma.signal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SignalUpdateArgs>(args: SelectSubset<T, SignalUpdateArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Signals.
     * @param {SignalDeleteManyArgs} args - Arguments to filter Signals to delete.
     * @example
     * // Delete a few Signals
     * const { count } = await prisma.signal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SignalDeleteManyArgs>(args?: SelectSubset<T, SignalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Signals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Signals
     * const signal = await prisma.signal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SignalUpdateManyArgs>(args: SelectSubset<T, SignalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Signals and returns the data updated in the database.
     * @param {SignalUpdateManyAndReturnArgs} args - Arguments to update many Signals.
     * @example
     * // Update many Signals
     * const signal = await prisma.signal.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Signals and only return the `id`
     * const signalWithIdOnly = await prisma.signal.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SignalUpdateManyAndReturnArgs>(args: SelectSubset<T, SignalUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Signal.
     * @param {SignalUpsertArgs} args - Arguments to update or create a Signal.
     * @example
     * // Update or create a Signal
     * const signal = await prisma.signal.upsert({
     *   create: {
     *     // ... data to create a Signal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Signal we want to update
     *   }
     * })
     */
    upsert<T extends SignalUpsertArgs>(args: SelectSubset<T, SignalUpsertArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Signals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalCountArgs} args - Arguments to filter Signals to count.
     * @example
     * // Count the number of Signals
     * const count = await prisma.signal.count({
     *   where: {
     *     // ... the filter for the Signals we want to count
     *   }
     * })
    **/
    count<T extends SignalCountArgs>(
      args?: Subset<T, SignalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SignalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Signal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SignalAggregateArgs>(args: Subset<T, SignalAggregateArgs>): Prisma.PrismaPromise<GetSignalAggregateType<T>>

    /**
     * Group by Signal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SignalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SignalGroupByArgs['orderBy'] }
        : { orderBy?: SignalGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SignalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSignalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Signal model
   */
  readonly fields: SignalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Signal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SignalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sector<T extends Signal$sectorArgs<ExtArgs> = {}>(args?: Subset<T, Signal$sectorArgs<ExtArgs>>): Prisma__SectorClient<$Result.GetResult<Prisma.$SectorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    alertEvents<T extends Signal$alertEventsArgs<ExtArgs> = {}>(args?: Subset<T, Signal$alertEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    outcome<T extends Signal$outcomeArgs<ExtArgs> = {}>(args?: Subset<T, Signal$outcomeArgs<ExtArgs>>): Prisma__SignalOutcomeClient<$Result.GetResult<Prisma.$SignalOutcomePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Signal model
   */
  interface SignalFieldRefs {
    readonly id: FieldRef<"Signal", 'String'>
    readonly symbol: FieldRef<"Signal", 'String'>
    readonly sectorId: FieldRef<"Signal", 'String'>
    readonly type: FieldRef<"Signal", 'SignalType'>
    readonly severity: FieldRef<"Signal", 'SignalSeverity'>
    readonly score: FieldRef<"Signal", 'Float'>
    readonly triggerValue: FieldRef<"Signal", 'Float'>
    readonly previousValue: FieldRef<"Signal", 'Float'>
    readonly headline: FieldRef<"Signal", 'String'>
    readonly metadata: FieldRef<"Signal", 'Json'>
    readonly createdAt: FieldRef<"Signal", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Signal findUnique
   */
  export type SignalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signal to fetch.
     */
    where: SignalWhereUniqueInput
  }

  /**
   * Signal findUniqueOrThrow
   */
  export type SignalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signal to fetch.
     */
    where: SignalWhereUniqueInput
  }

  /**
   * Signal findFirst
   */
  export type SignalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signal to fetch.
     */
    where?: SignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signals to fetch.
     */
    orderBy?: SignalOrderByWithRelationInput | SignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Signals.
     */
    cursor?: SignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Signals.
     */
    distinct?: SignalScalarFieldEnum | SignalScalarFieldEnum[]
  }

  /**
   * Signal findFirstOrThrow
   */
  export type SignalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signal to fetch.
     */
    where?: SignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signals to fetch.
     */
    orderBy?: SignalOrderByWithRelationInput | SignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Signals.
     */
    cursor?: SignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Signals.
     */
    distinct?: SignalScalarFieldEnum | SignalScalarFieldEnum[]
  }

  /**
   * Signal findMany
   */
  export type SignalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signals to fetch.
     */
    where?: SignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signals to fetch.
     */
    orderBy?: SignalOrderByWithRelationInput | SignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Signals.
     */
    cursor?: SignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Signals.
     */
    distinct?: SignalScalarFieldEnum | SignalScalarFieldEnum[]
  }

  /**
   * Signal create
   */
  export type SignalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * The data needed to create a Signal.
     */
    data: XOR<SignalCreateInput, SignalUncheckedCreateInput>
  }

  /**
   * Signal createMany
   */
  export type SignalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Signals.
     */
    data: SignalCreateManyInput | SignalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Signal createManyAndReturn
   */
  export type SignalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * The data used to create many Signals.
     */
    data: SignalCreateManyInput | SignalCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Signal update
   */
  export type SignalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * The data needed to update a Signal.
     */
    data: XOR<SignalUpdateInput, SignalUncheckedUpdateInput>
    /**
     * Choose, which Signal to update.
     */
    where: SignalWhereUniqueInput
  }

  /**
   * Signal updateMany
   */
  export type SignalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Signals.
     */
    data: XOR<SignalUpdateManyMutationInput, SignalUncheckedUpdateManyInput>
    /**
     * Filter which Signals to update
     */
    where?: SignalWhereInput
    /**
     * Limit how many Signals to update.
     */
    limit?: number
  }

  /**
   * Signal updateManyAndReturn
   */
  export type SignalUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * The data used to update Signals.
     */
    data: XOR<SignalUpdateManyMutationInput, SignalUncheckedUpdateManyInput>
    /**
     * Filter which Signals to update
     */
    where?: SignalWhereInput
    /**
     * Limit how many Signals to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Signal upsert
   */
  export type SignalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * The filter to search for the Signal to update in case it exists.
     */
    where: SignalWhereUniqueInput
    /**
     * In case the Signal found by the `where` argument doesn't exist, create a new Signal with this data.
     */
    create: XOR<SignalCreateInput, SignalUncheckedCreateInput>
    /**
     * In case the Signal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SignalUpdateInput, SignalUncheckedUpdateInput>
  }

  /**
   * Signal delete
   */
  export type SignalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter which Signal to delete.
     */
    where: SignalWhereUniqueInput
  }

  /**
   * Signal deleteMany
   */
  export type SignalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Signals to delete
     */
    where?: SignalWhereInput
    /**
     * Limit how many Signals to delete.
     */
    limit?: number
  }

  /**
   * Signal.sector
   */
  export type Signal$sectorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sector
     */
    select?: SectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sector
     */
    omit?: SectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectorInclude<ExtArgs> | null
    where?: SectorWhereInput
  }

  /**
   * Signal.alertEvents
   */
  export type Signal$alertEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertEvent
     */
    select?: AlertEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertEvent
     */
    omit?: AlertEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertEventInclude<ExtArgs> | null
    where?: AlertEventWhereInput
    orderBy?: AlertEventOrderByWithRelationInput | AlertEventOrderByWithRelationInput[]
    cursor?: AlertEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AlertEventScalarFieldEnum | AlertEventScalarFieldEnum[]
  }

  /**
   * Signal.outcome
   */
  export type Signal$outcomeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalOutcome
     */
    select?: SignalOutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalOutcome
     */
    omit?: SignalOutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalOutcomeInclude<ExtArgs> | null
    where?: SignalOutcomeWhereInput
  }

  /**
   * Signal without action
   */
  export type SignalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
  }


  /**
   * Model SignalOutcome
   */

  export type AggregateSignalOutcome = {
    _count: SignalOutcomeCountAggregateOutputType | null
    _avg: SignalOutcomeAvgAggregateOutputType | null
    _sum: SignalOutcomeSumAggregateOutputType | null
    _min: SignalOutcomeMinAggregateOutputType | null
    _max: SignalOutcomeMaxAggregateOutputType | null
  }

  export type SignalOutcomeAvgAggregateOutputType = {
    priceAtSignal: number | null
    return5m: number | null
    return15m: number | null
    return30m: number | null
    return60m: number | null
    maxFavorable: number | null
    maxAdverse: number | null
  }

  export type SignalOutcomeSumAggregateOutputType = {
    priceAtSignal: number | null
    return5m: number | null
    return15m: number | null
    return30m: number | null
    return60m: number | null
    maxFavorable: number | null
    maxAdverse: number | null
  }

  export type SignalOutcomeMinAggregateOutputType = {
    id: string | null
    signalId: string | null
    priceAtSignal: number | null
    return5m: number | null
    return15m: number | null
    return30m: number | null
    return60m: number | null
    maxFavorable: number | null
    maxAdverse: number | null
    continuedHigher: boolean | null
    evaluatedAt: Date | null
    createdAt: Date | null
  }

  export type SignalOutcomeMaxAggregateOutputType = {
    id: string | null
    signalId: string | null
    priceAtSignal: number | null
    return5m: number | null
    return15m: number | null
    return30m: number | null
    return60m: number | null
    maxFavorable: number | null
    maxAdverse: number | null
    continuedHigher: boolean | null
    evaluatedAt: Date | null
    createdAt: Date | null
  }

  export type SignalOutcomeCountAggregateOutputType = {
    id: number
    signalId: number
    priceAtSignal: number
    return5m: number
    return15m: number
    return30m: number
    return60m: number
    maxFavorable: number
    maxAdverse: number
    continuedHigher: number
    evaluatedAt: number
    createdAt: number
    _all: number
  }


  export type SignalOutcomeAvgAggregateInputType = {
    priceAtSignal?: true
    return5m?: true
    return15m?: true
    return30m?: true
    return60m?: true
    maxFavorable?: true
    maxAdverse?: true
  }

  export type SignalOutcomeSumAggregateInputType = {
    priceAtSignal?: true
    return5m?: true
    return15m?: true
    return30m?: true
    return60m?: true
    maxFavorable?: true
    maxAdverse?: true
  }

  export type SignalOutcomeMinAggregateInputType = {
    id?: true
    signalId?: true
    priceAtSignal?: true
    return5m?: true
    return15m?: true
    return30m?: true
    return60m?: true
    maxFavorable?: true
    maxAdverse?: true
    continuedHigher?: true
    evaluatedAt?: true
    createdAt?: true
  }

  export type SignalOutcomeMaxAggregateInputType = {
    id?: true
    signalId?: true
    priceAtSignal?: true
    return5m?: true
    return15m?: true
    return30m?: true
    return60m?: true
    maxFavorable?: true
    maxAdverse?: true
    continuedHigher?: true
    evaluatedAt?: true
    createdAt?: true
  }

  export type SignalOutcomeCountAggregateInputType = {
    id?: true
    signalId?: true
    priceAtSignal?: true
    return5m?: true
    return15m?: true
    return30m?: true
    return60m?: true
    maxFavorable?: true
    maxAdverse?: true
    continuedHigher?: true
    evaluatedAt?: true
    createdAt?: true
    _all?: true
  }

  export type SignalOutcomeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SignalOutcome to aggregate.
     */
    where?: SignalOutcomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignalOutcomes to fetch.
     */
    orderBy?: SignalOutcomeOrderByWithRelationInput | SignalOutcomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SignalOutcomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignalOutcomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignalOutcomes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SignalOutcomes
    **/
    _count?: true | SignalOutcomeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SignalOutcomeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SignalOutcomeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SignalOutcomeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SignalOutcomeMaxAggregateInputType
  }

  export type GetSignalOutcomeAggregateType<T extends SignalOutcomeAggregateArgs> = {
        [P in keyof T & keyof AggregateSignalOutcome]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSignalOutcome[P]>
      : GetScalarType<T[P], AggregateSignalOutcome[P]>
  }




  export type SignalOutcomeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SignalOutcomeWhereInput
    orderBy?: SignalOutcomeOrderByWithAggregationInput | SignalOutcomeOrderByWithAggregationInput[]
    by: SignalOutcomeScalarFieldEnum[] | SignalOutcomeScalarFieldEnum
    having?: SignalOutcomeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SignalOutcomeCountAggregateInputType | true
    _avg?: SignalOutcomeAvgAggregateInputType
    _sum?: SignalOutcomeSumAggregateInputType
    _min?: SignalOutcomeMinAggregateInputType
    _max?: SignalOutcomeMaxAggregateInputType
  }

  export type SignalOutcomeGroupByOutputType = {
    id: string
    signalId: string
    priceAtSignal: number
    return5m: number | null
    return15m: number | null
    return30m: number | null
    return60m: number | null
    maxFavorable: number | null
    maxAdverse: number | null
    continuedHigher: boolean | null
    evaluatedAt: Date | null
    createdAt: Date
    _count: SignalOutcomeCountAggregateOutputType | null
    _avg: SignalOutcomeAvgAggregateOutputType | null
    _sum: SignalOutcomeSumAggregateOutputType | null
    _min: SignalOutcomeMinAggregateOutputType | null
    _max: SignalOutcomeMaxAggregateOutputType | null
  }

  type GetSignalOutcomeGroupByPayload<T extends SignalOutcomeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SignalOutcomeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SignalOutcomeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SignalOutcomeGroupByOutputType[P]>
            : GetScalarType<T[P], SignalOutcomeGroupByOutputType[P]>
        }
      >
    >


  export type SignalOutcomeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    signalId?: boolean
    priceAtSignal?: boolean
    return5m?: boolean
    return15m?: boolean
    return30m?: boolean
    return60m?: boolean
    maxFavorable?: boolean
    maxAdverse?: boolean
    continuedHigher?: boolean
    evaluatedAt?: boolean
    createdAt?: boolean
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["signalOutcome"]>

  export type SignalOutcomeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    signalId?: boolean
    priceAtSignal?: boolean
    return5m?: boolean
    return15m?: boolean
    return30m?: boolean
    return60m?: boolean
    maxFavorable?: boolean
    maxAdverse?: boolean
    continuedHigher?: boolean
    evaluatedAt?: boolean
    createdAt?: boolean
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["signalOutcome"]>

  export type SignalOutcomeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    signalId?: boolean
    priceAtSignal?: boolean
    return5m?: boolean
    return15m?: boolean
    return30m?: boolean
    return60m?: boolean
    maxFavorable?: boolean
    maxAdverse?: boolean
    continuedHigher?: boolean
    evaluatedAt?: boolean
    createdAt?: boolean
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["signalOutcome"]>

  export type SignalOutcomeSelectScalar = {
    id?: boolean
    signalId?: boolean
    priceAtSignal?: boolean
    return5m?: boolean
    return15m?: boolean
    return30m?: boolean
    return60m?: boolean
    maxFavorable?: boolean
    maxAdverse?: boolean
    continuedHigher?: boolean
    evaluatedAt?: boolean
    createdAt?: boolean
  }

  export type SignalOutcomeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "signalId" | "priceAtSignal" | "return5m" | "return15m" | "return30m" | "return60m" | "maxFavorable" | "maxAdverse" | "continuedHigher" | "evaluatedAt" | "createdAt", ExtArgs["result"]["signalOutcome"]>
  export type SignalOutcomeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }
  export type SignalOutcomeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }
  export type SignalOutcomeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }

  export type $SignalOutcomePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SignalOutcome"
    objects: {
      signal: Prisma.$SignalPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      signalId: string
      priceAtSignal: number
      return5m: number | null
      return15m: number | null
      return30m: number | null
      return60m: number | null
      maxFavorable: number | null
      maxAdverse: number | null
      continuedHigher: boolean | null
      evaluatedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["signalOutcome"]>
    composites: {}
  }

  type SignalOutcomeGetPayload<S extends boolean | null | undefined | SignalOutcomeDefaultArgs> = $Result.GetResult<Prisma.$SignalOutcomePayload, S>

  type SignalOutcomeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SignalOutcomeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SignalOutcomeCountAggregateInputType | true
    }

  export interface SignalOutcomeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SignalOutcome'], meta: { name: 'SignalOutcome' } }
    /**
     * Find zero or one SignalOutcome that matches the filter.
     * @param {SignalOutcomeFindUniqueArgs} args - Arguments to find a SignalOutcome
     * @example
     * // Get one SignalOutcome
     * const signalOutcome = await prisma.signalOutcome.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SignalOutcomeFindUniqueArgs>(args: SelectSubset<T, SignalOutcomeFindUniqueArgs<ExtArgs>>): Prisma__SignalOutcomeClient<$Result.GetResult<Prisma.$SignalOutcomePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SignalOutcome that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SignalOutcomeFindUniqueOrThrowArgs} args - Arguments to find a SignalOutcome
     * @example
     * // Get one SignalOutcome
     * const signalOutcome = await prisma.signalOutcome.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SignalOutcomeFindUniqueOrThrowArgs>(args: SelectSubset<T, SignalOutcomeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SignalOutcomeClient<$Result.GetResult<Prisma.$SignalOutcomePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SignalOutcome that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalOutcomeFindFirstArgs} args - Arguments to find a SignalOutcome
     * @example
     * // Get one SignalOutcome
     * const signalOutcome = await prisma.signalOutcome.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SignalOutcomeFindFirstArgs>(args?: SelectSubset<T, SignalOutcomeFindFirstArgs<ExtArgs>>): Prisma__SignalOutcomeClient<$Result.GetResult<Prisma.$SignalOutcomePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SignalOutcome that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalOutcomeFindFirstOrThrowArgs} args - Arguments to find a SignalOutcome
     * @example
     * // Get one SignalOutcome
     * const signalOutcome = await prisma.signalOutcome.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SignalOutcomeFindFirstOrThrowArgs>(args?: SelectSubset<T, SignalOutcomeFindFirstOrThrowArgs<ExtArgs>>): Prisma__SignalOutcomeClient<$Result.GetResult<Prisma.$SignalOutcomePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SignalOutcomes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalOutcomeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SignalOutcomes
     * const signalOutcomes = await prisma.signalOutcome.findMany()
     * 
     * // Get first 10 SignalOutcomes
     * const signalOutcomes = await prisma.signalOutcome.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const signalOutcomeWithIdOnly = await prisma.signalOutcome.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SignalOutcomeFindManyArgs>(args?: SelectSubset<T, SignalOutcomeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalOutcomePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SignalOutcome.
     * @param {SignalOutcomeCreateArgs} args - Arguments to create a SignalOutcome.
     * @example
     * // Create one SignalOutcome
     * const SignalOutcome = await prisma.signalOutcome.create({
     *   data: {
     *     // ... data to create a SignalOutcome
     *   }
     * })
     * 
     */
    create<T extends SignalOutcomeCreateArgs>(args: SelectSubset<T, SignalOutcomeCreateArgs<ExtArgs>>): Prisma__SignalOutcomeClient<$Result.GetResult<Prisma.$SignalOutcomePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SignalOutcomes.
     * @param {SignalOutcomeCreateManyArgs} args - Arguments to create many SignalOutcomes.
     * @example
     * // Create many SignalOutcomes
     * const signalOutcome = await prisma.signalOutcome.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SignalOutcomeCreateManyArgs>(args?: SelectSubset<T, SignalOutcomeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SignalOutcomes and returns the data saved in the database.
     * @param {SignalOutcomeCreateManyAndReturnArgs} args - Arguments to create many SignalOutcomes.
     * @example
     * // Create many SignalOutcomes
     * const signalOutcome = await prisma.signalOutcome.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SignalOutcomes and only return the `id`
     * const signalOutcomeWithIdOnly = await prisma.signalOutcome.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SignalOutcomeCreateManyAndReturnArgs>(args?: SelectSubset<T, SignalOutcomeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalOutcomePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SignalOutcome.
     * @param {SignalOutcomeDeleteArgs} args - Arguments to delete one SignalOutcome.
     * @example
     * // Delete one SignalOutcome
     * const SignalOutcome = await prisma.signalOutcome.delete({
     *   where: {
     *     // ... filter to delete one SignalOutcome
     *   }
     * })
     * 
     */
    delete<T extends SignalOutcomeDeleteArgs>(args: SelectSubset<T, SignalOutcomeDeleteArgs<ExtArgs>>): Prisma__SignalOutcomeClient<$Result.GetResult<Prisma.$SignalOutcomePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SignalOutcome.
     * @param {SignalOutcomeUpdateArgs} args - Arguments to update one SignalOutcome.
     * @example
     * // Update one SignalOutcome
     * const signalOutcome = await prisma.signalOutcome.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SignalOutcomeUpdateArgs>(args: SelectSubset<T, SignalOutcomeUpdateArgs<ExtArgs>>): Prisma__SignalOutcomeClient<$Result.GetResult<Prisma.$SignalOutcomePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SignalOutcomes.
     * @param {SignalOutcomeDeleteManyArgs} args - Arguments to filter SignalOutcomes to delete.
     * @example
     * // Delete a few SignalOutcomes
     * const { count } = await prisma.signalOutcome.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SignalOutcomeDeleteManyArgs>(args?: SelectSubset<T, SignalOutcomeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SignalOutcomes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalOutcomeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SignalOutcomes
     * const signalOutcome = await prisma.signalOutcome.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SignalOutcomeUpdateManyArgs>(args: SelectSubset<T, SignalOutcomeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SignalOutcomes and returns the data updated in the database.
     * @param {SignalOutcomeUpdateManyAndReturnArgs} args - Arguments to update many SignalOutcomes.
     * @example
     * // Update many SignalOutcomes
     * const signalOutcome = await prisma.signalOutcome.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SignalOutcomes and only return the `id`
     * const signalOutcomeWithIdOnly = await prisma.signalOutcome.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SignalOutcomeUpdateManyAndReturnArgs>(args: SelectSubset<T, SignalOutcomeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalOutcomePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SignalOutcome.
     * @param {SignalOutcomeUpsertArgs} args - Arguments to update or create a SignalOutcome.
     * @example
     * // Update or create a SignalOutcome
     * const signalOutcome = await prisma.signalOutcome.upsert({
     *   create: {
     *     // ... data to create a SignalOutcome
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SignalOutcome we want to update
     *   }
     * })
     */
    upsert<T extends SignalOutcomeUpsertArgs>(args: SelectSubset<T, SignalOutcomeUpsertArgs<ExtArgs>>): Prisma__SignalOutcomeClient<$Result.GetResult<Prisma.$SignalOutcomePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SignalOutcomes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalOutcomeCountArgs} args - Arguments to filter SignalOutcomes to count.
     * @example
     * // Count the number of SignalOutcomes
     * const count = await prisma.signalOutcome.count({
     *   where: {
     *     // ... the filter for the SignalOutcomes we want to count
     *   }
     * })
    **/
    count<T extends SignalOutcomeCountArgs>(
      args?: Subset<T, SignalOutcomeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SignalOutcomeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SignalOutcome.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalOutcomeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SignalOutcomeAggregateArgs>(args: Subset<T, SignalOutcomeAggregateArgs>): Prisma.PrismaPromise<GetSignalOutcomeAggregateType<T>>

    /**
     * Group by SignalOutcome.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalOutcomeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SignalOutcomeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SignalOutcomeGroupByArgs['orderBy'] }
        : { orderBy?: SignalOutcomeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SignalOutcomeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSignalOutcomeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SignalOutcome model
   */
  readonly fields: SignalOutcomeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SignalOutcome.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SignalOutcomeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    signal<T extends SignalDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SignalDefaultArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SignalOutcome model
   */
  interface SignalOutcomeFieldRefs {
    readonly id: FieldRef<"SignalOutcome", 'String'>
    readonly signalId: FieldRef<"SignalOutcome", 'String'>
    readonly priceAtSignal: FieldRef<"SignalOutcome", 'Float'>
    readonly return5m: FieldRef<"SignalOutcome", 'Float'>
    readonly return15m: FieldRef<"SignalOutcome", 'Float'>
    readonly return30m: FieldRef<"SignalOutcome", 'Float'>
    readonly return60m: FieldRef<"SignalOutcome", 'Float'>
    readonly maxFavorable: FieldRef<"SignalOutcome", 'Float'>
    readonly maxAdverse: FieldRef<"SignalOutcome", 'Float'>
    readonly continuedHigher: FieldRef<"SignalOutcome", 'Boolean'>
    readonly evaluatedAt: FieldRef<"SignalOutcome", 'DateTime'>
    readonly createdAt: FieldRef<"SignalOutcome", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SignalOutcome findUnique
   */
  export type SignalOutcomeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalOutcome
     */
    select?: SignalOutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalOutcome
     */
    omit?: SignalOutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalOutcomeInclude<ExtArgs> | null
    /**
     * Filter, which SignalOutcome to fetch.
     */
    where: SignalOutcomeWhereUniqueInput
  }

  /**
   * SignalOutcome findUniqueOrThrow
   */
  export type SignalOutcomeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalOutcome
     */
    select?: SignalOutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalOutcome
     */
    omit?: SignalOutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalOutcomeInclude<ExtArgs> | null
    /**
     * Filter, which SignalOutcome to fetch.
     */
    where: SignalOutcomeWhereUniqueInput
  }

  /**
   * SignalOutcome findFirst
   */
  export type SignalOutcomeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalOutcome
     */
    select?: SignalOutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalOutcome
     */
    omit?: SignalOutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalOutcomeInclude<ExtArgs> | null
    /**
     * Filter, which SignalOutcome to fetch.
     */
    where?: SignalOutcomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignalOutcomes to fetch.
     */
    orderBy?: SignalOutcomeOrderByWithRelationInput | SignalOutcomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SignalOutcomes.
     */
    cursor?: SignalOutcomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignalOutcomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignalOutcomes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SignalOutcomes.
     */
    distinct?: SignalOutcomeScalarFieldEnum | SignalOutcomeScalarFieldEnum[]
  }

  /**
   * SignalOutcome findFirstOrThrow
   */
  export type SignalOutcomeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalOutcome
     */
    select?: SignalOutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalOutcome
     */
    omit?: SignalOutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalOutcomeInclude<ExtArgs> | null
    /**
     * Filter, which SignalOutcome to fetch.
     */
    where?: SignalOutcomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignalOutcomes to fetch.
     */
    orderBy?: SignalOutcomeOrderByWithRelationInput | SignalOutcomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SignalOutcomes.
     */
    cursor?: SignalOutcomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignalOutcomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignalOutcomes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SignalOutcomes.
     */
    distinct?: SignalOutcomeScalarFieldEnum | SignalOutcomeScalarFieldEnum[]
  }

  /**
   * SignalOutcome findMany
   */
  export type SignalOutcomeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalOutcome
     */
    select?: SignalOutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalOutcome
     */
    omit?: SignalOutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalOutcomeInclude<ExtArgs> | null
    /**
     * Filter, which SignalOutcomes to fetch.
     */
    where?: SignalOutcomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignalOutcomes to fetch.
     */
    orderBy?: SignalOutcomeOrderByWithRelationInput | SignalOutcomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SignalOutcomes.
     */
    cursor?: SignalOutcomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignalOutcomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignalOutcomes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SignalOutcomes.
     */
    distinct?: SignalOutcomeScalarFieldEnum | SignalOutcomeScalarFieldEnum[]
  }

  /**
   * SignalOutcome create
   */
  export type SignalOutcomeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalOutcome
     */
    select?: SignalOutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalOutcome
     */
    omit?: SignalOutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalOutcomeInclude<ExtArgs> | null
    /**
     * The data needed to create a SignalOutcome.
     */
    data: XOR<SignalOutcomeCreateInput, SignalOutcomeUncheckedCreateInput>
  }

  /**
   * SignalOutcome createMany
   */
  export type SignalOutcomeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SignalOutcomes.
     */
    data: SignalOutcomeCreateManyInput | SignalOutcomeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SignalOutcome createManyAndReturn
   */
  export type SignalOutcomeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalOutcome
     */
    select?: SignalOutcomeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SignalOutcome
     */
    omit?: SignalOutcomeOmit<ExtArgs> | null
    /**
     * The data used to create many SignalOutcomes.
     */
    data: SignalOutcomeCreateManyInput | SignalOutcomeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalOutcomeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SignalOutcome update
   */
  export type SignalOutcomeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalOutcome
     */
    select?: SignalOutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalOutcome
     */
    omit?: SignalOutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalOutcomeInclude<ExtArgs> | null
    /**
     * The data needed to update a SignalOutcome.
     */
    data: XOR<SignalOutcomeUpdateInput, SignalOutcomeUncheckedUpdateInput>
    /**
     * Choose, which SignalOutcome to update.
     */
    where: SignalOutcomeWhereUniqueInput
  }

  /**
   * SignalOutcome updateMany
   */
  export type SignalOutcomeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SignalOutcomes.
     */
    data: XOR<SignalOutcomeUpdateManyMutationInput, SignalOutcomeUncheckedUpdateManyInput>
    /**
     * Filter which SignalOutcomes to update
     */
    where?: SignalOutcomeWhereInput
    /**
     * Limit how many SignalOutcomes to update.
     */
    limit?: number
  }

  /**
   * SignalOutcome updateManyAndReturn
   */
  export type SignalOutcomeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalOutcome
     */
    select?: SignalOutcomeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SignalOutcome
     */
    omit?: SignalOutcomeOmit<ExtArgs> | null
    /**
     * The data used to update SignalOutcomes.
     */
    data: XOR<SignalOutcomeUpdateManyMutationInput, SignalOutcomeUncheckedUpdateManyInput>
    /**
     * Filter which SignalOutcomes to update
     */
    where?: SignalOutcomeWhereInput
    /**
     * Limit how many SignalOutcomes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalOutcomeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SignalOutcome upsert
   */
  export type SignalOutcomeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalOutcome
     */
    select?: SignalOutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalOutcome
     */
    omit?: SignalOutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalOutcomeInclude<ExtArgs> | null
    /**
     * The filter to search for the SignalOutcome to update in case it exists.
     */
    where: SignalOutcomeWhereUniqueInput
    /**
     * In case the SignalOutcome found by the `where` argument doesn't exist, create a new SignalOutcome with this data.
     */
    create: XOR<SignalOutcomeCreateInput, SignalOutcomeUncheckedCreateInput>
    /**
     * In case the SignalOutcome was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SignalOutcomeUpdateInput, SignalOutcomeUncheckedUpdateInput>
  }

  /**
   * SignalOutcome delete
   */
  export type SignalOutcomeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalOutcome
     */
    select?: SignalOutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalOutcome
     */
    omit?: SignalOutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalOutcomeInclude<ExtArgs> | null
    /**
     * Filter which SignalOutcome to delete.
     */
    where: SignalOutcomeWhereUniqueInput
  }

  /**
   * SignalOutcome deleteMany
   */
  export type SignalOutcomeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SignalOutcomes to delete
     */
    where?: SignalOutcomeWhereInput
    /**
     * Limit how many SignalOutcomes to delete.
     */
    limit?: number
  }

  /**
   * SignalOutcome without action
   */
  export type SignalOutcomeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalOutcome
     */
    select?: SignalOutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalOutcome
     */
    omit?: SignalOutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalOutcomeInclude<ExtArgs> | null
  }


  /**
   * Model AlertRule
   */

  export type AggregateAlertRule = {
    _count: AlertRuleCountAggregateOutputType | null
    _avg: AlertRuleAvgAggregateOutputType | null
    _sum: AlertRuleSumAggregateOutputType | null
    _min: AlertRuleMinAggregateOutputType | null
    _max: AlertRuleMaxAggregateOutputType | null
  }

  export type AlertRuleAvgAggregateOutputType = {
    threshold: number | null
  }

  export type AlertRuleSumAggregateOutputType = {
    threshold: number | null
  }

  export type AlertRuleMinAggregateOutputType = {
    id: string | null
    userId: string | null
    type: $Enums.SignalType | null
    sectorId: string | null
    minSeverity: $Enums.SignalSeverity | null
    threshold: number | null
    enabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AlertRuleMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    type: $Enums.SignalType | null
    sectorId: string | null
    minSeverity: $Enums.SignalSeverity | null
    threshold: number | null
    enabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AlertRuleCountAggregateOutputType = {
    id: number
    userId: number
    type: number
    sectorId: number
    minSeverity: number
    threshold: number
    enabled: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AlertRuleAvgAggregateInputType = {
    threshold?: true
  }

  export type AlertRuleSumAggregateInputType = {
    threshold?: true
  }

  export type AlertRuleMinAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    sectorId?: true
    minSeverity?: true
    threshold?: true
    enabled?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AlertRuleMaxAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    sectorId?: true
    minSeverity?: true
    threshold?: true
    enabled?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AlertRuleCountAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    sectorId?: true
    minSeverity?: true
    threshold?: true
    enabled?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AlertRuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AlertRule to aggregate.
     */
    where?: AlertRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertRules to fetch.
     */
    orderBy?: AlertRuleOrderByWithRelationInput | AlertRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AlertRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AlertRules
    **/
    _count?: true | AlertRuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AlertRuleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AlertRuleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AlertRuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AlertRuleMaxAggregateInputType
  }

  export type GetAlertRuleAggregateType<T extends AlertRuleAggregateArgs> = {
        [P in keyof T & keyof AggregateAlertRule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAlertRule[P]>
      : GetScalarType<T[P], AggregateAlertRule[P]>
  }




  export type AlertRuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlertRuleWhereInput
    orderBy?: AlertRuleOrderByWithAggregationInput | AlertRuleOrderByWithAggregationInput[]
    by: AlertRuleScalarFieldEnum[] | AlertRuleScalarFieldEnum
    having?: AlertRuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AlertRuleCountAggregateInputType | true
    _avg?: AlertRuleAvgAggregateInputType
    _sum?: AlertRuleSumAggregateInputType
    _min?: AlertRuleMinAggregateInputType
    _max?: AlertRuleMaxAggregateInputType
  }

  export type AlertRuleGroupByOutputType = {
    id: string
    userId: string
    type: $Enums.SignalType | null
    sectorId: string | null
    minSeverity: $Enums.SignalSeverity
    threshold: number
    enabled: boolean
    createdAt: Date
    updatedAt: Date
    _count: AlertRuleCountAggregateOutputType | null
    _avg: AlertRuleAvgAggregateOutputType | null
    _sum: AlertRuleSumAggregateOutputType | null
    _min: AlertRuleMinAggregateOutputType | null
    _max: AlertRuleMaxAggregateOutputType | null
  }

  type GetAlertRuleGroupByPayload<T extends AlertRuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AlertRuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AlertRuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AlertRuleGroupByOutputType[P]>
            : GetScalarType<T[P], AlertRuleGroupByOutputType[P]>
        }
      >
    >


  export type AlertRuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    sectorId?: boolean
    minSeverity?: boolean
    threshold?: boolean
    enabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["alertRule"]>

  export type AlertRuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    sectorId?: boolean
    minSeverity?: boolean
    threshold?: boolean
    enabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["alertRule"]>

  export type AlertRuleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    sectorId?: boolean
    minSeverity?: boolean
    threshold?: boolean
    enabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["alertRule"]>

  export type AlertRuleSelectScalar = {
    id?: boolean
    userId?: boolean
    type?: boolean
    sectorId?: boolean
    minSeverity?: boolean
    threshold?: boolean
    enabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AlertRuleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "type" | "sectorId" | "minSeverity" | "threshold" | "enabled" | "createdAt" | "updatedAt", ExtArgs["result"]["alertRule"]>
  export type AlertRuleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AlertRuleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AlertRuleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AlertRulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AlertRule"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      type: $Enums.SignalType | null
      sectorId: string | null
      minSeverity: $Enums.SignalSeverity
      threshold: number
      enabled: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["alertRule"]>
    composites: {}
  }

  type AlertRuleGetPayload<S extends boolean | null | undefined | AlertRuleDefaultArgs> = $Result.GetResult<Prisma.$AlertRulePayload, S>

  type AlertRuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AlertRuleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AlertRuleCountAggregateInputType | true
    }

  export interface AlertRuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AlertRule'], meta: { name: 'AlertRule' } }
    /**
     * Find zero or one AlertRule that matches the filter.
     * @param {AlertRuleFindUniqueArgs} args - Arguments to find a AlertRule
     * @example
     * // Get one AlertRule
     * const alertRule = await prisma.alertRule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AlertRuleFindUniqueArgs>(args: SelectSubset<T, AlertRuleFindUniqueArgs<ExtArgs>>): Prisma__AlertRuleClient<$Result.GetResult<Prisma.$AlertRulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AlertRule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AlertRuleFindUniqueOrThrowArgs} args - Arguments to find a AlertRule
     * @example
     * // Get one AlertRule
     * const alertRule = await prisma.alertRule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AlertRuleFindUniqueOrThrowArgs>(args: SelectSubset<T, AlertRuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AlertRuleClient<$Result.GetResult<Prisma.$AlertRulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AlertRule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertRuleFindFirstArgs} args - Arguments to find a AlertRule
     * @example
     * // Get one AlertRule
     * const alertRule = await prisma.alertRule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AlertRuleFindFirstArgs>(args?: SelectSubset<T, AlertRuleFindFirstArgs<ExtArgs>>): Prisma__AlertRuleClient<$Result.GetResult<Prisma.$AlertRulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AlertRule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertRuleFindFirstOrThrowArgs} args - Arguments to find a AlertRule
     * @example
     * // Get one AlertRule
     * const alertRule = await prisma.alertRule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AlertRuleFindFirstOrThrowArgs>(args?: SelectSubset<T, AlertRuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__AlertRuleClient<$Result.GetResult<Prisma.$AlertRulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AlertRules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertRuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AlertRules
     * const alertRules = await prisma.alertRule.findMany()
     * 
     * // Get first 10 AlertRules
     * const alertRules = await prisma.alertRule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const alertRuleWithIdOnly = await prisma.alertRule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AlertRuleFindManyArgs>(args?: SelectSubset<T, AlertRuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertRulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AlertRule.
     * @param {AlertRuleCreateArgs} args - Arguments to create a AlertRule.
     * @example
     * // Create one AlertRule
     * const AlertRule = await prisma.alertRule.create({
     *   data: {
     *     // ... data to create a AlertRule
     *   }
     * })
     * 
     */
    create<T extends AlertRuleCreateArgs>(args: SelectSubset<T, AlertRuleCreateArgs<ExtArgs>>): Prisma__AlertRuleClient<$Result.GetResult<Prisma.$AlertRulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AlertRules.
     * @param {AlertRuleCreateManyArgs} args - Arguments to create many AlertRules.
     * @example
     * // Create many AlertRules
     * const alertRule = await prisma.alertRule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AlertRuleCreateManyArgs>(args?: SelectSubset<T, AlertRuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AlertRules and returns the data saved in the database.
     * @param {AlertRuleCreateManyAndReturnArgs} args - Arguments to create many AlertRules.
     * @example
     * // Create many AlertRules
     * const alertRule = await prisma.alertRule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AlertRules and only return the `id`
     * const alertRuleWithIdOnly = await prisma.alertRule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AlertRuleCreateManyAndReturnArgs>(args?: SelectSubset<T, AlertRuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertRulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AlertRule.
     * @param {AlertRuleDeleteArgs} args - Arguments to delete one AlertRule.
     * @example
     * // Delete one AlertRule
     * const AlertRule = await prisma.alertRule.delete({
     *   where: {
     *     // ... filter to delete one AlertRule
     *   }
     * })
     * 
     */
    delete<T extends AlertRuleDeleteArgs>(args: SelectSubset<T, AlertRuleDeleteArgs<ExtArgs>>): Prisma__AlertRuleClient<$Result.GetResult<Prisma.$AlertRulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AlertRule.
     * @param {AlertRuleUpdateArgs} args - Arguments to update one AlertRule.
     * @example
     * // Update one AlertRule
     * const alertRule = await prisma.alertRule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AlertRuleUpdateArgs>(args: SelectSubset<T, AlertRuleUpdateArgs<ExtArgs>>): Prisma__AlertRuleClient<$Result.GetResult<Prisma.$AlertRulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AlertRules.
     * @param {AlertRuleDeleteManyArgs} args - Arguments to filter AlertRules to delete.
     * @example
     * // Delete a few AlertRules
     * const { count } = await prisma.alertRule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AlertRuleDeleteManyArgs>(args?: SelectSubset<T, AlertRuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AlertRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertRuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AlertRules
     * const alertRule = await prisma.alertRule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AlertRuleUpdateManyArgs>(args: SelectSubset<T, AlertRuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AlertRules and returns the data updated in the database.
     * @param {AlertRuleUpdateManyAndReturnArgs} args - Arguments to update many AlertRules.
     * @example
     * // Update many AlertRules
     * const alertRule = await prisma.alertRule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AlertRules and only return the `id`
     * const alertRuleWithIdOnly = await prisma.alertRule.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AlertRuleUpdateManyAndReturnArgs>(args: SelectSubset<T, AlertRuleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertRulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AlertRule.
     * @param {AlertRuleUpsertArgs} args - Arguments to update or create a AlertRule.
     * @example
     * // Update or create a AlertRule
     * const alertRule = await prisma.alertRule.upsert({
     *   create: {
     *     // ... data to create a AlertRule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AlertRule we want to update
     *   }
     * })
     */
    upsert<T extends AlertRuleUpsertArgs>(args: SelectSubset<T, AlertRuleUpsertArgs<ExtArgs>>): Prisma__AlertRuleClient<$Result.GetResult<Prisma.$AlertRulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AlertRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertRuleCountArgs} args - Arguments to filter AlertRules to count.
     * @example
     * // Count the number of AlertRules
     * const count = await prisma.alertRule.count({
     *   where: {
     *     // ... the filter for the AlertRules we want to count
     *   }
     * })
    **/
    count<T extends AlertRuleCountArgs>(
      args?: Subset<T, AlertRuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AlertRuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AlertRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertRuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AlertRuleAggregateArgs>(args: Subset<T, AlertRuleAggregateArgs>): Prisma.PrismaPromise<GetAlertRuleAggregateType<T>>

    /**
     * Group by AlertRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertRuleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AlertRuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AlertRuleGroupByArgs['orderBy'] }
        : { orderBy?: AlertRuleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AlertRuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAlertRuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AlertRule model
   */
  readonly fields: AlertRuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AlertRule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AlertRuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AlertRule model
   */
  interface AlertRuleFieldRefs {
    readonly id: FieldRef<"AlertRule", 'String'>
    readonly userId: FieldRef<"AlertRule", 'String'>
    readonly type: FieldRef<"AlertRule", 'SignalType'>
    readonly sectorId: FieldRef<"AlertRule", 'String'>
    readonly minSeverity: FieldRef<"AlertRule", 'SignalSeverity'>
    readonly threshold: FieldRef<"AlertRule", 'Float'>
    readonly enabled: FieldRef<"AlertRule", 'Boolean'>
    readonly createdAt: FieldRef<"AlertRule", 'DateTime'>
    readonly updatedAt: FieldRef<"AlertRule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AlertRule findUnique
   */
  export type AlertRuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertRule
     */
    select?: AlertRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertRule
     */
    omit?: AlertRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertRuleInclude<ExtArgs> | null
    /**
     * Filter, which AlertRule to fetch.
     */
    where: AlertRuleWhereUniqueInput
  }

  /**
   * AlertRule findUniqueOrThrow
   */
  export type AlertRuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertRule
     */
    select?: AlertRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertRule
     */
    omit?: AlertRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertRuleInclude<ExtArgs> | null
    /**
     * Filter, which AlertRule to fetch.
     */
    where: AlertRuleWhereUniqueInput
  }

  /**
   * AlertRule findFirst
   */
  export type AlertRuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertRule
     */
    select?: AlertRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertRule
     */
    omit?: AlertRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertRuleInclude<ExtArgs> | null
    /**
     * Filter, which AlertRule to fetch.
     */
    where?: AlertRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertRules to fetch.
     */
    orderBy?: AlertRuleOrderByWithRelationInput | AlertRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AlertRules.
     */
    cursor?: AlertRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AlertRules.
     */
    distinct?: AlertRuleScalarFieldEnum | AlertRuleScalarFieldEnum[]
  }

  /**
   * AlertRule findFirstOrThrow
   */
  export type AlertRuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertRule
     */
    select?: AlertRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertRule
     */
    omit?: AlertRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertRuleInclude<ExtArgs> | null
    /**
     * Filter, which AlertRule to fetch.
     */
    where?: AlertRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertRules to fetch.
     */
    orderBy?: AlertRuleOrderByWithRelationInput | AlertRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AlertRules.
     */
    cursor?: AlertRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AlertRules.
     */
    distinct?: AlertRuleScalarFieldEnum | AlertRuleScalarFieldEnum[]
  }

  /**
   * AlertRule findMany
   */
  export type AlertRuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertRule
     */
    select?: AlertRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertRule
     */
    omit?: AlertRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertRuleInclude<ExtArgs> | null
    /**
     * Filter, which AlertRules to fetch.
     */
    where?: AlertRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertRules to fetch.
     */
    orderBy?: AlertRuleOrderByWithRelationInput | AlertRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AlertRules.
     */
    cursor?: AlertRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AlertRules.
     */
    distinct?: AlertRuleScalarFieldEnum | AlertRuleScalarFieldEnum[]
  }

  /**
   * AlertRule create
   */
  export type AlertRuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertRule
     */
    select?: AlertRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertRule
     */
    omit?: AlertRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertRuleInclude<ExtArgs> | null
    /**
     * The data needed to create a AlertRule.
     */
    data: XOR<AlertRuleCreateInput, AlertRuleUncheckedCreateInput>
  }

  /**
   * AlertRule createMany
   */
  export type AlertRuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AlertRules.
     */
    data: AlertRuleCreateManyInput | AlertRuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AlertRule createManyAndReturn
   */
  export type AlertRuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertRule
     */
    select?: AlertRuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AlertRule
     */
    omit?: AlertRuleOmit<ExtArgs> | null
    /**
     * The data used to create many AlertRules.
     */
    data: AlertRuleCreateManyInput | AlertRuleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertRuleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AlertRule update
   */
  export type AlertRuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertRule
     */
    select?: AlertRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertRule
     */
    omit?: AlertRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertRuleInclude<ExtArgs> | null
    /**
     * The data needed to update a AlertRule.
     */
    data: XOR<AlertRuleUpdateInput, AlertRuleUncheckedUpdateInput>
    /**
     * Choose, which AlertRule to update.
     */
    where: AlertRuleWhereUniqueInput
  }

  /**
   * AlertRule updateMany
   */
  export type AlertRuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AlertRules.
     */
    data: XOR<AlertRuleUpdateManyMutationInput, AlertRuleUncheckedUpdateManyInput>
    /**
     * Filter which AlertRules to update
     */
    where?: AlertRuleWhereInput
    /**
     * Limit how many AlertRules to update.
     */
    limit?: number
  }

  /**
   * AlertRule updateManyAndReturn
   */
  export type AlertRuleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertRule
     */
    select?: AlertRuleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AlertRule
     */
    omit?: AlertRuleOmit<ExtArgs> | null
    /**
     * The data used to update AlertRules.
     */
    data: XOR<AlertRuleUpdateManyMutationInput, AlertRuleUncheckedUpdateManyInput>
    /**
     * Filter which AlertRules to update
     */
    where?: AlertRuleWhereInput
    /**
     * Limit how many AlertRules to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertRuleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AlertRule upsert
   */
  export type AlertRuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertRule
     */
    select?: AlertRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertRule
     */
    omit?: AlertRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertRuleInclude<ExtArgs> | null
    /**
     * The filter to search for the AlertRule to update in case it exists.
     */
    where: AlertRuleWhereUniqueInput
    /**
     * In case the AlertRule found by the `where` argument doesn't exist, create a new AlertRule with this data.
     */
    create: XOR<AlertRuleCreateInput, AlertRuleUncheckedCreateInput>
    /**
     * In case the AlertRule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AlertRuleUpdateInput, AlertRuleUncheckedUpdateInput>
  }

  /**
   * AlertRule delete
   */
  export type AlertRuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertRule
     */
    select?: AlertRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertRule
     */
    omit?: AlertRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertRuleInclude<ExtArgs> | null
    /**
     * Filter which AlertRule to delete.
     */
    where: AlertRuleWhereUniqueInput
  }

  /**
   * AlertRule deleteMany
   */
  export type AlertRuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AlertRules to delete
     */
    where?: AlertRuleWhereInput
    /**
     * Limit how many AlertRules to delete.
     */
    limit?: number
  }

  /**
   * AlertRule without action
   */
  export type AlertRuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertRule
     */
    select?: AlertRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertRule
     */
    omit?: AlertRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertRuleInclude<ExtArgs> | null
  }


  /**
   * Model AlertEvent
   */

  export type AggregateAlertEvent = {
    _count: AlertEventCountAggregateOutputType | null
    _min: AlertEventMinAggregateOutputType | null
    _max: AlertEventMaxAggregateOutputType | null
  }

  export type AlertEventMinAggregateOutputType = {
    id: string | null
    userId: string | null
    signalId: string | null
    delivered: boolean | null
    deliveredAt: Date | null
    createdAt: Date | null
  }

  export type AlertEventMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    signalId: string | null
    delivered: boolean | null
    deliveredAt: Date | null
    createdAt: Date | null
  }

  export type AlertEventCountAggregateOutputType = {
    id: number
    userId: number
    signalId: number
    delivered: number
    deliveredAt: number
    createdAt: number
    _all: number
  }


  export type AlertEventMinAggregateInputType = {
    id?: true
    userId?: true
    signalId?: true
    delivered?: true
    deliveredAt?: true
    createdAt?: true
  }

  export type AlertEventMaxAggregateInputType = {
    id?: true
    userId?: true
    signalId?: true
    delivered?: true
    deliveredAt?: true
    createdAt?: true
  }

  export type AlertEventCountAggregateInputType = {
    id?: true
    userId?: true
    signalId?: true
    delivered?: true
    deliveredAt?: true
    createdAt?: true
    _all?: true
  }

  export type AlertEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AlertEvent to aggregate.
     */
    where?: AlertEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertEvents to fetch.
     */
    orderBy?: AlertEventOrderByWithRelationInput | AlertEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AlertEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AlertEvents
    **/
    _count?: true | AlertEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AlertEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AlertEventMaxAggregateInputType
  }

  export type GetAlertEventAggregateType<T extends AlertEventAggregateArgs> = {
        [P in keyof T & keyof AggregateAlertEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAlertEvent[P]>
      : GetScalarType<T[P], AggregateAlertEvent[P]>
  }




  export type AlertEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlertEventWhereInput
    orderBy?: AlertEventOrderByWithAggregationInput | AlertEventOrderByWithAggregationInput[]
    by: AlertEventScalarFieldEnum[] | AlertEventScalarFieldEnum
    having?: AlertEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AlertEventCountAggregateInputType | true
    _min?: AlertEventMinAggregateInputType
    _max?: AlertEventMaxAggregateInputType
  }

  export type AlertEventGroupByOutputType = {
    id: string
    userId: string
    signalId: string
    delivered: boolean
    deliveredAt: Date | null
    createdAt: Date
    _count: AlertEventCountAggregateOutputType | null
    _min: AlertEventMinAggregateOutputType | null
    _max: AlertEventMaxAggregateOutputType | null
  }

  type GetAlertEventGroupByPayload<T extends AlertEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AlertEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AlertEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AlertEventGroupByOutputType[P]>
            : GetScalarType<T[P], AlertEventGroupByOutputType[P]>
        }
      >
    >


  export type AlertEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    signalId?: boolean
    delivered?: boolean
    deliveredAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["alertEvent"]>

  export type AlertEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    signalId?: boolean
    delivered?: boolean
    deliveredAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["alertEvent"]>

  export type AlertEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    signalId?: boolean
    delivered?: boolean
    deliveredAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["alertEvent"]>

  export type AlertEventSelectScalar = {
    id?: boolean
    userId?: boolean
    signalId?: boolean
    delivered?: boolean
    deliveredAt?: boolean
    createdAt?: boolean
  }

  export type AlertEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "signalId" | "delivered" | "deliveredAt" | "createdAt", ExtArgs["result"]["alertEvent"]>
  export type AlertEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }
  export type AlertEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }
  export type AlertEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }

  export type $AlertEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AlertEvent"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      signal: Prisma.$SignalPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      signalId: string
      delivered: boolean
      deliveredAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["alertEvent"]>
    composites: {}
  }

  type AlertEventGetPayload<S extends boolean | null | undefined | AlertEventDefaultArgs> = $Result.GetResult<Prisma.$AlertEventPayload, S>

  type AlertEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AlertEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AlertEventCountAggregateInputType | true
    }

  export interface AlertEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AlertEvent'], meta: { name: 'AlertEvent' } }
    /**
     * Find zero or one AlertEvent that matches the filter.
     * @param {AlertEventFindUniqueArgs} args - Arguments to find a AlertEvent
     * @example
     * // Get one AlertEvent
     * const alertEvent = await prisma.alertEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AlertEventFindUniqueArgs>(args: SelectSubset<T, AlertEventFindUniqueArgs<ExtArgs>>): Prisma__AlertEventClient<$Result.GetResult<Prisma.$AlertEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AlertEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AlertEventFindUniqueOrThrowArgs} args - Arguments to find a AlertEvent
     * @example
     * // Get one AlertEvent
     * const alertEvent = await prisma.alertEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AlertEventFindUniqueOrThrowArgs>(args: SelectSubset<T, AlertEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AlertEventClient<$Result.GetResult<Prisma.$AlertEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AlertEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertEventFindFirstArgs} args - Arguments to find a AlertEvent
     * @example
     * // Get one AlertEvent
     * const alertEvent = await prisma.alertEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AlertEventFindFirstArgs>(args?: SelectSubset<T, AlertEventFindFirstArgs<ExtArgs>>): Prisma__AlertEventClient<$Result.GetResult<Prisma.$AlertEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AlertEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertEventFindFirstOrThrowArgs} args - Arguments to find a AlertEvent
     * @example
     * // Get one AlertEvent
     * const alertEvent = await prisma.alertEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AlertEventFindFirstOrThrowArgs>(args?: SelectSubset<T, AlertEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__AlertEventClient<$Result.GetResult<Prisma.$AlertEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AlertEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AlertEvents
     * const alertEvents = await prisma.alertEvent.findMany()
     * 
     * // Get first 10 AlertEvents
     * const alertEvents = await prisma.alertEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const alertEventWithIdOnly = await prisma.alertEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AlertEventFindManyArgs>(args?: SelectSubset<T, AlertEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AlertEvent.
     * @param {AlertEventCreateArgs} args - Arguments to create a AlertEvent.
     * @example
     * // Create one AlertEvent
     * const AlertEvent = await prisma.alertEvent.create({
     *   data: {
     *     // ... data to create a AlertEvent
     *   }
     * })
     * 
     */
    create<T extends AlertEventCreateArgs>(args: SelectSubset<T, AlertEventCreateArgs<ExtArgs>>): Prisma__AlertEventClient<$Result.GetResult<Prisma.$AlertEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AlertEvents.
     * @param {AlertEventCreateManyArgs} args - Arguments to create many AlertEvents.
     * @example
     * // Create many AlertEvents
     * const alertEvent = await prisma.alertEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AlertEventCreateManyArgs>(args?: SelectSubset<T, AlertEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AlertEvents and returns the data saved in the database.
     * @param {AlertEventCreateManyAndReturnArgs} args - Arguments to create many AlertEvents.
     * @example
     * // Create many AlertEvents
     * const alertEvent = await prisma.alertEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AlertEvents and only return the `id`
     * const alertEventWithIdOnly = await prisma.alertEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AlertEventCreateManyAndReturnArgs>(args?: SelectSubset<T, AlertEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AlertEvent.
     * @param {AlertEventDeleteArgs} args - Arguments to delete one AlertEvent.
     * @example
     * // Delete one AlertEvent
     * const AlertEvent = await prisma.alertEvent.delete({
     *   where: {
     *     // ... filter to delete one AlertEvent
     *   }
     * })
     * 
     */
    delete<T extends AlertEventDeleteArgs>(args: SelectSubset<T, AlertEventDeleteArgs<ExtArgs>>): Prisma__AlertEventClient<$Result.GetResult<Prisma.$AlertEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AlertEvent.
     * @param {AlertEventUpdateArgs} args - Arguments to update one AlertEvent.
     * @example
     * // Update one AlertEvent
     * const alertEvent = await prisma.alertEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AlertEventUpdateArgs>(args: SelectSubset<T, AlertEventUpdateArgs<ExtArgs>>): Prisma__AlertEventClient<$Result.GetResult<Prisma.$AlertEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AlertEvents.
     * @param {AlertEventDeleteManyArgs} args - Arguments to filter AlertEvents to delete.
     * @example
     * // Delete a few AlertEvents
     * const { count } = await prisma.alertEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AlertEventDeleteManyArgs>(args?: SelectSubset<T, AlertEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AlertEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AlertEvents
     * const alertEvent = await prisma.alertEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AlertEventUpdateManyArgs>(args: SelectSubset<T, AlertEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AlertEvents and returns the data updated in the database.
     * @param {AlertEventUpdateManyAndReturnArgs} args - Arguments to update many AlertEvents.
     * @example
     * // Update many AlertEvents
     * const alertEvent = await prisma.alertEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AlertEvents and only return the `id`
     * const alertEventWithIdOnly = await prisma.alertEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AlertEventUpdateManyAndReturnArgs>(args: SelectSubset<T, AlertEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AlertEvent.
     * @param {AlertEventUpsertArgs} args - Arguments to update or create a AlertEvent.
     * @example
     * // Update or create a AlertEvent
     * const alertEvent = await prisma.alertEvent.upsert({
     *   create: {
     *     // ... data to create a AlertEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AlertEvent we want to update
     *   }
     * })
     */
    upsert<T extends AlertEventUpsertArgs>(args: SelectSubset<T, AlertEventUpsertArgs<ExtArgs>>): Prisma__AlertEventClient<$Result.GetResult<Prisma.$AlertEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AlertEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertEventCountArgs} args - Arguments to filter AlertEvents to count.
     * @example
     * // Count the number of AlertEvents
     * const count = await prisma.alertEvent.count({
     *   where: {
     *     // ... the filter for the AlertEvents we want to count
     *   }
     * })
    **/
    count<T extends AlertEventCountArgs>(
      args?: Subset<T, AlertEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AlertEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AlertEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AlertEventAggregateArgs>(args: Subset<T, AlertEventAggregateArgs>): Prisma.PrismaPromise<GetAlertEventAggregateType<T>>

    /**
     * Group by AlertEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AlertEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AlertEventGroupByArgs['orderBy'] }
        : { orderBy?: AlertEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AlertEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAlertEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AlertEvent model
   */
  readonly fields: AlertEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AlertEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AlertEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    signal<T extends SignalDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SignalDefaultArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AlertEvent model
   */
  interface AlertEventFieldRefs {
    readonly id: FieldRef<"AlertEvent", 'String'>
    readonly userId: FieldRef<"AlertEvent", 'String'>
    readonly signalId: FieldRef<"AlertEvent", 'String'>
    readonly delivered: FieldRef<"AlertEvent", 'Boolean'>
    readonly deliveredAt: FieldRef<"AlertEvent", 'DateTime'>
    readonly createdAt: FieldRef<"AlertEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AlertEvent findUnique
   */
  export type AlertEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertEvent
     */
    select?: AlertEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertEvent
     */
    omit?: AlertEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertEventInclude<ExtArgs> | null
    /**
     * Filter, which AlertEvent to fetch.
     */
    where: AlertEventWhereUniqueInput
  }

  /**
   * AlertEvent findUniqueOrThrow
   */
  export type AlertEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertEvent
     */
    select?: AlertEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertEvent
     */
    omit?: AlertEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertEventInclude<ExtArgs> | null
    /**
     * Filter, which AlertEvent to fetch.
     */
    where: AlertEventWhereUniqueInput
  }

  /**
   * AlertEvent findFirst
   */
  export type AlertEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertEvent
     */
    select?: AlertEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertEvent
     */
    omit?: AlertEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertEventInclude<ExtArgs> | null
    /**
     * Filter, which AlertEvent to fetch.
     */
    where?: AlertEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertEvents to fetch.
     */
    orderBy?: AlertEventOrderByWithRelationInput | AlertEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AlertEvents.
     */
    cursor?: AlertEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AlertEvents.
     */
    distinct?: AlertEventScalarFieldEnum | AlertEventScalarFieldEnum[]
  }

  /**
   * AlertEvent findFirstOrThrow
   */
  export type AlertEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertEvent
     */
    select?: AlertEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertEvent
     */
    omit?: AlertEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertEventInclude<ExtArgs> | null
    /**
     * Filter, which AlertEvent to fetch.
     */
    where?: AlertEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertEvents to fetch.
     */
    orderBy?: AlertEventOrderByWithRelationInput | AlertEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AlertEvents.
     */
    cursor?: AlertEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AlertEvents.
     */
    distinct?: AlertEventScalarFieldEnum | AlertEventScalarFieldEnum[]
  }

  /**
   * AlertEvent findMany
   */
  export type AlertEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertEvent
     */
    select?: AlertEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertEvent
     */
    omit?: AlertEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertEventInclude<ExtArgs> | null
    /**
     * Filter, which AlertEvents to fetch.
     */
    where?: AlertEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertEvents to fetch.
     */
    orderBy?: AlertEventOrderByWithRelationInput | AlertEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AlertEvents.
     */
    cursor?: AlertEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AlertEvents.
     */
    distinct?: AlertEventScalarFieldEnum | AlertEventScalarFieldEnum[]
  }

  /**
   * AlertEvent create
   */
  export type AlertEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertEvent
     */
    select?: AlertEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertEvent
     */
    omit?: AlertEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertEventInclude<ExtArgs> | null
    /**
     * The data needed to create a AlertEvent.
     */
    data: XOR<AlertEventCreateInput, AlertEventUncheckedCreateInput>
  }

  /**
   * AlertEvent createMany
   */
  export type AlertEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AlertEvents.
     */
    data: AlertEventCreateManyInput | AlertEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AlertEvent createManyAndReturn
   */
  export type AlertEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertEvent
     */
    select?: AlertEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AlertEvent
     */
    omit?: AlertEventOmit<ExtArgs> | null
    /**
     * The data used to create many AlertEvents.
     */
    data: AlertEventCreateManyInput | AlertEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AlertEvent update
   */
  export type AlertEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertEvent
     */
    select?: AlertEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertEvent
     */
    omit?: AlertEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertEventInclude<ExtArgs> | null
    /**
     * The data needed to update a AlertEvent.
     */
    data: XOR<AlertEventUpdateInput, AlertEventUncheckedUpdateInput>
    /**
     * Choose, which AlertEvent to update.
     */
    where: AlertEventWhereUniqueInput
  }

  /**
   * AlertEvent updateMany
   */
  export type AlertEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AlertEvents.
     */
    data: XOR<AlertEventUpdateManyMutationInput, AlertEventUncheckedUpdateManyInput>
    /**
     * Filter which AlertEvents to update
     */
    where?: AlertEventWhereInput
    /**
     * Limit how many AlertEvents to update.
     */
    limit?: number
  }

  /**
   * AlertEvent updateManyAndReturn
   */
  export type AlertEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertEvent
     */
    select?: AlertEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AlertEvent
     */
    omit?: AlertEventOmit<ExtArgs> | null
    /**
     * The data used to update AlertEvents.
     */
    data: XOR<AlertEventUpdateManyMutationInput, AlertEventUncheckedUpdateManyInput>
    /**
     * Filter which AlertEvents to update
     */
    where?: AlertEventWhereInput
    /**
     * Limit how many AlertEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AlertEvent upsert
   */
  export type AlertEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertEvent
     */
    select?: AlertEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertEvent
     */
    omit?: AlertEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertEventInclude<ExtArgs> | null
    /**
     * The filter to search for the AlertEvent to update in case it exists.
     */
    where: AlertEventWhereUniqueInput
    /**
     * In case the AlertEvent found by the `where` argument doesn't exist, create a new AlertEvent with this data.
     */
    create: XOR<AlertEventCreateInput, AlertEventUncheckedCreateInput>
    /**
     * In case the AlertEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AlertEventUpdateInput, AlertEventUncheckedUpdateInput>
  }

  /**
   * AlertEvent delete
   */
  export type AlertEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertEvent
     */
    select?: AlertEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertEvent
     */
    omit?: AlertEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertEventInclude<ExtArgs> | null
    /**
     * Filter which AlertEvent to delete.
     */
    where: AlertEventWhereUniqueInput
  }

  /**
   * AlertEvent deleteMany
   */
  export type AlertEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AlertEvents to delete
     */
    where?: AlertEventWhereInput
    /**
     * Limit how many AlertEvents to delete.
     */
    limit?: number
  }

  /**
   * AlertEvent without action
   */
  export type AlertEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertEvent
     */
    select?: AlertEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertEvent
     */
    omit?: AlertEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertEventInclude<ExtArgs> | null
  }


  /**
   * Model NewsArticle
   */

  export type AggregateNewsArticle = {
    _count: NewsArticleCountAggregateOutputType | null
    _min: NewsArticleMinAggregateOutputType | null
    _max: NewsArticleMaxAggregateOutputType | null
  }

  export type NewsArticleMinAggregateOutputType = {
    id: string | null
    headline: string | null
    source: string | null
    url: string | null
    publishedAt: Date | null
    catalystType: string | null
    createdAt: Date | null
  }

  export type NewsArticleMaxAggregateOutputType = {
    id: string | null
    headline: string | null
    source: string | null
    url: string | null
    publishedAt: Date | null
    catalystType: string | null
    createdAt: Date | null
  }

  export type NewsArticleCountAggregateOutputType = {
    id: number
    headline: number
    source: number
    url: number
    publishedAt: number
    catalystType: number
    createdAt: number
    _all: number
  }


  export type NewsArticleMinAggregateInputType = {
    id?: true
    headline?: true
    source?: true
    url?: true
    publishedAt?: true
    catalystType?: true
    createdAt?: true
  }

  export type NewsArticleMaxAggregateInputType = {
    id?: true
    headline?: true
    source?: true
    url?: true
    publishedAt?: true
    catalystType?: true
    createdAt?: true
  }

  export type NewsArticleCountAggregateInputType = {
    id?: true
    headline?: true
    source?: true
    url?: true
    publishedAt?: true
    catalystType?: true
    createdAt?: true
    _all?: true
  }

  export type NewsArticleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NewsArticle to aggregate.
     */
    where?: NewsArticleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NewsArticles to fetch.
     */
    orderBy?: NewsArticleOrderByWithRelationInput | NewsArticleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NewsArticleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NewsArticles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NewsArticles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned NewsArticles
    **/
    _count?: true | NewsArticleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NewsArticleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NewsArticleMaxAggregateInputType
  }

  export type GetNewsArticleAggregateType<T extends NewsArticleAggregateArgs> = {
        [P in keyof T & keyof AggregateNewsArticle]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNewsArticle[P]>
      : GetScalarType<T[P], AggregateNewsArticle[P]>
  }




  export type NewsArticleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NewsArticleWhereInput
    orderBy?: NewsArticleOrderByWithAggregationInput | NewsArticleOrderByWithAggregationInput[]
    by: NewsArticleScalarFieldEnum[] | NewsArticleScalarFieldEnum
    having?: NewsArticleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NewsArticleCountAggregateInputType | true
    _min?: NewsArticleMinAggregateInputType
    _max?: NewsArticleMaxAggregateInputType
  }

  export type NewsArticleGroupByOutputType = {
    id: string
    headline: string
    source: string
    url: string
    publishedAt: Date
    catalystType: string
    createdAt: Date
    _count: NewsArticleCountAggregateOutputType | null
    _min: NewsArticleMinAggregateOutputType | null
    _max: NewsArticleMaxAggregateOutputType | null
  }

  type GetNewsArticleGroupByPayload<T extends NewsArticleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NewsArticleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NewsArticleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NewsArticleGroupByOutputType[P]>
            : GetScalarType<T[P], NewsArticleGroupByOutputType[P]>
        }
      >
    >


  export type NewsArticleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    headline?: boolean
    source?: boolean
    url?: boolean
    publishedAt?: boolean
    catalystType?: boolean
    createdAt?: boolean
    symbols?: boolean | NewsArticle$symbolsArgs<ExtArgs>
    _count?: boolean | NewsArticleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["newsArticle"]>

  export type NewsArticleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    headline?: boolean
    source?: boolean
    url?: boolean
    publishedAt?: boolean
    catalystType?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["newsArticle"]>

  export type NewsArticleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    headline?: boolean
    source?: boolean
    url?: boolean
    publishedAt?: boolean
    catalystType?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["newsArticle"]>

  export type NewsArticleSelectScalar = {
    id?: boolean
    headline?: boolean
    source?: boolean
    url?: boolean
    publishedAt?: boolean
    catalystType?: boolean
    createdAt?: boolean
  }

  export type NewsArticleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "headline" | "source" | "url" | "publishedAt" | "catalystType" | "createdAt", ExtArgs["result"]["newsArticle"]>
  export type NewsArticleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    symbols?: boolean | NewsArticle$symbolsArgs<ExtArgs>
    _count?: boolean | NewsArticleCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type NewsArticleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type NewsArticleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $NewsArticlePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "NewsArticle"
    objects: {
      symbols: Prisma.$NewsSymbolPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      headline: string
      source: string
      url: string
      publishedAt: Date
      catalystType: string
      createdAt: Date
    }, ExtArgs["result"]["newsArticle"]>
    composites: {}
  }

  type NewsArticleGetPayload<S extends boolean | null | undefined | NewsArticleDefaultArgs> = $Result.GetResult<Prisma.$NewsArticlePayload, S>

  type NewsArticleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NewsArticleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NewsArticleCountAggregateInputType | true
    }

  export interface NewsArticleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['NewsArticle'], meta: { name: 'NewsArticle' } }
    /**
     * Find zero or one NewsArticle that matches the filter.
     * @param {NewsArticleFindUniqueArgs} args - Arguments to find a NewsArticle
     * @example
     * // Get one NewsArticle
     * const newsArticle = await prisma.newsArticle.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NewsArticleFindUniqueArgs>(args: SelectSubset<T, NewsArticleFindUniqueArgs<ExtArgs>>): Prisma__NewsArticleClient<$Result.GetResult<Prisma.$NewsArticlePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one NewsArticle that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NewsArticleFindUniqueOrThrowArgs} args - Arguments to find a NewsArticle
     * @example
     * // Get one NewsArticle
     * const newsArticle = await prisma.newsArticle.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NewsArticleFindUniqueOrThrowArgs>(args: SelectSubset<T, NewsArticleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NewsArticleClient<$Result.GetResult<Prisma.$NewsArticlePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NewsArticle that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsArticleFindFirstArgs} args - Arguments to find a NewsArticle
     * @example
     * // Get one NewsArticle
     * const newsArticle = await prisma.newsArticle.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NewsArticleFindFirstArgs>(args?: SelectSubset<T, NewsArticleFindFirstArgs<ExtArgs>>): Prisma__NewsArticleClient<$Result.GetResult<Prisma.$NewsArticlePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NewsArticle that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsArticleFindFirstOrThrowArgs} args - Arguments to find a NewsArticle
     * @example
     * // Get one NewsArticle
     * const newsArticle = await prisma.newsArticle.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NewsArticleFindFirstOrThrowArgs>(args?: SelectSubset<T, NewsArticleFindFirstOrThrowArgs<ExtArgs>>): Prisma__NewsArticleClient<$Result.GetResult<Prisma.$NewsArticlePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more NewsArticles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsArticleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all NewsArticles
     * const newsArticles = await prisma.newsArticle.findMany()
     * 
     * // Get first 10 NewsArticles
     * const newsArticles = await prisma.newsArticle.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const newsArticleWithIdOnly = await prisma.newsArticle.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NewsArticleFindManyArgs>(args?: SelectSubset<T, NewsArticleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NewsArticlePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a NewsArticle.
     * @param {NewsArticleCreateArgs} args - Arguments to create a NewsArticle.
     * @example
     * // Create one NewsArticle
     * const NewsArticle = await prisma.newsArticle.create({
     *   data: {
     *     // ... data to create a NewsArticle
     *   }
     * })
     * 
     */
    create<T extends NewsArticleCreateArgs>(args: SelectSubset<T, NewsArticleCreateArgs<ExtArgs>>): Prisma__NewsArticleClient<$Result.GetResult<Prisma.$NewsArticlePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many NewsArticles.
     * @param {NewsArticleCreateManyArgs} args - Arguments to create many NewsArticles.
     * @example
     * // Create many NewsArticles
     * const newsArticle = await prisma.newsArticle.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NewsArticleCreateManyArgs>(args?: SelectSubset<T, NewsArticleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many NewsArticles and returns the data saved in the database.
     * @param {NewsArticleCreateManyAndReturnArgs} args - Arguments to create many NewsArticles.
     * @example
     * // Create many NewsArticles
     * const newsArticle = await prisma.newsArticle.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many NewsArticles and only return the `id`
     * const newsArticleWithIdOnly = await prisma.newsArticle.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NewsArticleCreateManyAndReturnArgs>(args?: SelectSubset<T, NewsArticleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NewsArticlePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a NewsArticle.
     * @param {NewsArticleDeleteArgs} args - Arguments to delete one NewsArticle.
     * @example
     * // Delete one NewsArticle
     * const NewsArticle = await prisma.newsArticle.delete({
     *   where: {
     *     // ... filter to delete one NewsArticle
     *   }
     * })
     * 
     */
    delete<T extends NewsArticleDeleteArgs>(args: SelectSubset<T, NewsArticleDeleteArgs<ExtArgs>>): Prisma__NewsArticleClient<$Result.GetResult<Prisma.$NewsArticlePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one NewsArticle.
     * @param {NewsArticleUpdateArgs} args - Arguments to update one NewsArticle.
     * @example
     * // Update one NewsArticle
     * const newsArticle = await prisma.newsArticle.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NewsArticleUpdateArgs>(args: SelectSubset<T, NewsArticleUpdateArgs<ExtArgs>>): Prisma__NewsArticleClient<$Result.GetResult<Prisma.$NewsArticlePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more NewsArticles.
     * @param {NewsArticleDeleteManyArgs} args - Arguments to filter NewsArticles to delete.
     * @example
     * // Delete a few NewsArticles
     * const { count } = await prisma.newsArticle.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NewsArticleDeleteManyArgs>(args?: SelectSubset<T, NewsArticleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NewsArticles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsArticleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many NewsArticles
     * const newsArticle = await prisma.newsArticle.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NewsArticleUpdateManyArgs>(args: SelectSubset<T, NewsArticleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NewsArticles and returns the data updated in the database.
     * @param {NewsArticleUpdateManyAndReturnArgs} args - Arguments to update many NewsArticles.
     * @example
     * // Update many NewsArticles
     * const newsArticle = await prisma.newsArticle.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more NewsArticles and only return the `id`
     * const newsArticleWithIdOnly = await prisma.newsArticle.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NewsArticleUpdateManyAndReturnArgs>(args: SelectSubset<T, NewsArticleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NewsArticlePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one NewsArticle.
     * @param {NewsArticleUpsertArgs} args - Arguments to update or create a NewsArticle.
     * @example
     * // Update or create a NewsArticle
     * const newsArticle = await prisma.newsArticle.upsert({
     *   create: {
     *     // ... data to create a NewsArticle
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the NewsArticle we want to update
     *   }
     * })
     */
    upsert<T extends NewsArticleUpsertArgs>(args: SelectSubset<T, NewsArticleUpsertArgs<ExtArgs>>): Prisma__NewsArticleClient<$Result.GetResult<Prisma.$NewsArticlePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of NewsArticles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsArticleCountArgs} args - Arguments to filter NewsArticles to count.
     * @example
     * // Count the number of NewsArticles
     * const count = await prisma.newsArticle.count({
     *   where: {
     *     // ... the filter for the NewsArticles we want to count
     *   }
     * })
    **/
    count<T extends NewsArticleCountArgs>(
      args?: Subset<T, NewsArticleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NewsArticleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a NewsArticle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsArticleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NewsArticleAggregateArgs>(args: Subset<T, NewsArticleAggregateArgs>): Prisma.PrismaPromise<GetNewsArticleAggregateType<T>>

    /**
     * Group by NewsArticle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsArticleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NewsArticleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NewsArticleGroupByArgs['orderBy'] }
        : { orderBy?: NewsArticleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NewsArticleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNewsArticleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the NewsArticle model
   */
  readonly fields: NewsArticleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for NewsArticle.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NewsArticleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    symbols<T extends NewsArticle$symbolsArgs<ExtArgs> = {}>(args?: Subset<T, NewsArticle$symbolsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NewsSymbolPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the NewsArticle model
   */
  interface NewsArticleFieldRefs {
    readonly id: FieldRef<"NewsArticle", 'String'>
    readonly headline: FieldRef<"NewsArticle", 'String'>
    readonly source: FieldRef<"NewsArticle", 'String'>
    readonly url: FieldRef<"NewsArticle", 'String'>
    readonly publishedAt: FieldRef<"NewsArticle", 'DateTime'>
    readonly catalystType: FieldRef<"NewsArticle", 'String'>
    readonly createdAt: FieldRef<"NewsArticle", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * NewsArticle findUnique
   */
  export type NewsArticleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsArticle
     */
    select?: NewsArticleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsArticle
     */
    omit?: NewsArticleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsArticleInclude<ExtArgs> | null
    /**
     * Filter, which NewsArticle to fetch.
     */
    where: NewsArticleWhereUniqueInput
  }

  /**
   * NewsArticle findUniqueOrThrow
   */
  export type NewsArticleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsArticle
     */
    select?: NewsArticleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsArticle
     */
    omit?: NewsArticleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsArticleInclude<ExtArgs> | null
    /**
     * Filter, which NewsArticle to fetch.
     */
    where: NewsArticleWhereUniqueInput
  }

  /**
   * NewsArticle findFirst
   */
  export type NewsArticleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsArticle
     */
    select?: NewsArticleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsArticle
     */
    omit?: NewsArticleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsArticleInclude<ExtArgs> | null
    /**
     * Filter, which NewsArticle to fetch.
     */
    where?: NewsArticleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NewsArticles to fetch.
     */
    orderBy?: NewsArticleOrderByWithRelationInput | NewsArticleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NewsArticles.
     */
    cursor?: NewsArticleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NewsArticles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NewsArticles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NewsArticles.
     */
    distinct?: NewsArticleScalarFieldEnum | NewsArticleScalarFieldEnum[]
  }

  /**
   * NewsArticle findFirstOrThrow
   */
  export type NewsArticleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsArticle
     */
    select?: NewsArticleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsArticle
     */
    omit?: NewsArticleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsArticleInclude<ExtArgs> | null
    /**
     * Filter, which NewsArticle to fetch.
     */
    where?: NewsArticleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NewsArticles to fetch.
     */
    orderBy?: NewsArticleOrderByWithRelationInput | NewsArticleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NewsArticles.
     */
    cursor?: NewsArticleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NewsArticles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NewsArticles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NewsArticles.
     */
    distinct?: NewsArticleScalarFieldEnum | NewsArticleScalarFieldEnum[]
  }

  /**
   * NewsArticle findMany
   */
  export type NewsArticleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsArticle
     */
    select?: NewsArticleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsArticle
     */
    omit?: NewsArticleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsArticleInclude<ExtArgs> | null
    /**
     * Filter, which NewsArticles to fetch.
     */
    where?: NewsArticleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NewsArticles to fetch.
     */
    orderBy?: NewsArticleOrderByWithRelationInput | NewsArticleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing NewsArticles.
     */
    cursor?: NewsArticleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NewsArticles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NewsArticles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NewsArticles.
     */
    distinct?: NewsArticleScalarFieldEnum | NewsArticleScalarFieldEnum[]
  }

  /**
   * NewsArticle create
   */
  export type NewsArticleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsArticle
     */
    select?: NewsArticleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsArticle
     */
    omit?: NewsArticleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsArticleInclude<ExtArgs> | null
    /**
     * The data needed to create a NewsArticle.
     */
    data: XOR<NewsArticleCreateInput, NewsArticleUncheckedCreateInput>
  }

  /**
   * NewsArticle createMany
   */
  export type NewsArticleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many NewsArticles.
     */
    data: NewsArticleCreateManyInput | NewsArticleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NewsArticle createManyAndReturn
   */
  export type NewsArticleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsArticle
     */
    select?: NewsArticleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NewsArticle
     */
    omit?: NewsArticleOmit<ExtArgs> | null
    /**
     * The data used to create many NewsArticles.
     */
    data: NewsArticleCreateManyInput | NewsArticleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NewsArticle update
   */
  export type NewsArticleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsArticle
     */
    select?: NewsArticleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsArticle
     */
    omit?: NewsArticleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsArticleInclude<ExtArgs> | null
    /**
     * The data needed to update a NewsArticle.
     */
    data: XOR<NewsArticleUpdateInput, NewsArticleUncheckedUpdateInput>
    /**
     * Choose, which NewsArticle to update.
     */
    where: NewsArticleWhereUniqueInput
  }

  /**
   * NewsArticle updateMany
   */
  export type NewsArticleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update NewsArticles.
     */
    data: XOR<NewsArticleUpdateManyMutationInput, NewsArticleUncheckedUpdateManyInput>
    /**
     * Filter which NewsArticles to update
     */
    where?: NewsArticleWhereInput
    /**
     * Limit how many NewsArticles to update.
     */
    limit?: number
  }

  /**
   * NewsArticle updateManyAndReturn
   */
  export type NewsArticleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsArticle
     */
    select?: NewsArticleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NewsArticle
     */
    omit?: NewsArticleOmit<ExtArgs> | null
    /**
     * The data used to update NewsArticles.
     */
    data: XOR<NewsArticleUpdateManyMutationInput, NewsArticleUncheckedUpdateManyInput>
    /**
     * Filter which NewsArticles to update
     */
    where?: NewsArticleWhereInput
    /**
     * Limit how many NewsArticles to update.
     */
    limit?: number
  }

  /**
   * NewsArticle upsert
   */
  export type NewsArticleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsArticle
     */
    select?: NewsArticleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsArticle
     */
    omit?: NewsArticleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsArticleInclude<ExtArgs> | null
    /**
     * The filter to search for the NewsArticle to update in case it exists.
     */
    where: NewsArticleWhereUniqueInput
    /**
     * In case the NewsArticle found by the `where` argument doesn't exist, create a new NewsArticle with this data.
     */
    create: XOR<NewsArticleCreateInput, NewsArticleUncheckedCreateInput>
    /**
     * In case the NewsArticle was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NewsArticleUpdateInput, NewsArticleUncheckedUpdateInput>
  }

  /**
   * NewsArticle delete
   */
  export type NewsArticleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsArticle
     */
    select?: NewsArticleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsArticle
     */
    omit?: NewsArticleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsArticleInclude<ExtArgs> | null
    /**
     * Filter which NewsArticle to delete.
     */
    where: NewsArticleWhereUniqueInput
  }

  /**
   * NewsArticle deleteMany
   */
  export type NewsArticleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NewsArticles to delete
     */
    where?: NewsArticleWhereInput
    /**
     * Limit how many NewsArticles to delete.
     */
    limit?: number
  }

  /**
   * NewsArticle.symbols
   */
  export type NewsArticle$symbolsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsSymbol
     */
    select?: NewsSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsSymbol
     */
    omit?: NewsSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsSymbolInclude<ExtArgs> | null
    where?: NewsSymbolWhereInput
    orderBy?: NewsSymbolOrderByWithRelationInput | NewsSymbolOrderByWithRelationInput[]
    cursor?: NewsSymbolWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NewsSymbolScalarFieldEnum | NewsSymbolScalarFieldEnum[]
  }

  /**
   * NewsArticle without action
   */
  export type NewsArticleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsArticle
     */
    select?: NewsArticleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsArticle
     */
    omit?: NewsArticleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsArticleInclude<ExtArgs> | null
  }


  /**
   * Model NewsSymbol
   */

  export type AggregateNewsSymbol = {
    _count: NewsSymbolCountAggregateOutputType | null
    _min: NewsSymbolMinAggregateOutputType | null
    _max: NewsSymbolMaxAggregateOutputType | null
  }

  export type NewsSymbolMinAggregateOutputType = {
    id: string | null
    newsArticleId: string | null
    symbol: string | null
    sectorId: string | null
  }

  export type NewsSymbolMaxAggregateOutputType = {
    id: string | null
    newsArticleId: string | null
    symbol: string | null
    sectorId: string | null
  }

  export type NewsSymbolCountAggregateOutputType = {
    id: number
    newsArticleId: number
    symbol: number
    sectorId: number
    _all: number
  }


  export type NewsSymbolMinAggregateInputType = {
    id?: true
    newsArticleId?: true
    symbol?: true
    sectorId?: true
  }

  export type NewsSymbolMaxAggregateInputType = {
    id?: true
    newsArticleId?: true
    symbol?: true
    sectorId?: true
  }

  export type NewsSymbolCountAggregateInputType = {
    id?: true
    newsArticleId?: true
    symbol?: true
    sectorId?: true
    _all?: true
  }

  export type NewsSymbolAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NewsSymbol to aggregate.
     */
    where?: NewsSymbolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NewsSymbols to fetch.
     */
    orderBy?: NewsSymbolOrderByWithRelationInput | NewsSymbolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NewsSymbolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NewsSymbols from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NewsSymbols.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned NewsSymbols
    **/
    _count?: true | NewsSymbolCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NewsSymbolMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NewsSymbolMaxAggregateInputType
  }

  export type GetNewsSymbolAggregateType<T extends NewsSymbolAggregateArgs> = {
        [P in keyof T & keyof AggregateNewsSymbol]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNewsSymbol[P]>
      : GetScalarType<T[P], AggregateNewsSymbol[P]>
  }




  export type NewsSymbolGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NewsSymbolWhereInput
    orderBy?: NewsSymbolOrderByWithAggregationInput | NewsSymbolOrderByWithAggregationInput[]
    by: NewsSymbolScalarFieldEnum[] | NewsSymbolScalarFieldEnum
    having?: NewsSymbolScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NewsSymbolCountAggregateInputType | true
    _min?: NewsSymbolMinAggregateInputType
    _max?: NewsSymbolMaxAggregateInputType
  }

  export type NewsSymbolGroupByOutputType = {
    id: string
    newsArticleId: string
    symbol: string
    sectorId: string | null
    _count: NewsSymbolCountAggregateOutputType | null
    _min: NewsSymbolMinAggregateOutputType | null
    _max: NewsSymbolMaxAggregateOutputType | null
  }

  type GetNewsSymbolGroupByPayload<T extends NewsSymbolGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NewsSymbolGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NewsSymbolGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NewsSymbolGroupByOutputType[P]>
            : GetScalarType<T[P], NewsSymbolGroupByOutputType[P]>
        }
      >
    >


  export type NewsSymbolSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    newsArticleId?: boolean
    symbol?: boolean
    sectorId?: boolean
    newsArticle?: boolean | NewsArticleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["newsSymbol"]>

  export type NewsSymbolSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    newsArticleId?: boolean
    symbol?: boolean
    sectorId?: boolean
    newsArticle?: boolean | NewsArticleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["newsSymbol"]>

  export type NewsSymbolSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    newsArticleId?: boolean
    symbol?: boolean
    sectorId?: boolean
    newsArticle?: boolean | NewsArticleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["newsSymbol"]>

  export type NewsSymbolSelectScalar = {
    id?: boolean
    newsArticleId?: boolean
    symbol?: boolean
    sectorId?: boolean
  }

  export type NewsSymbolOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "newsArticleId" | "symbol" | "sectorId", ExtArgs["result"]["newsSymbol"]>
  export type NewsSymbolInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    newsArticle?: boolean | NewsArticleDefaultArgs<ExtArgs>
  }
  export type NewsSymbolIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    newsArticle?: boolean | NewsArticleDefaultArgs<ExtArgs>
  }
  export type NewsSymbolIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    newsArticle?: boolean | NewsArticleDefaultArgs<ExtArgs>
  }

  export type $NewsSymbolPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "NewsSymbol"
    objects: {
      newsArticle: Prisma.$NewsArticlePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      newsArticleId: string
      symbol: string
      sectorId: string | null
    }, ExtArgs["result"]["newsSymbol"]>
    composites: {}
  }

  type NewsSymbolGetPayload<S extends boolean | null | undefined | NewsSymbolDefaultArgs> = $Result.GetResult<Prisma.$NewsSymbolPayload, S>

  type NewsSymbolCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NewsSymbolFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NewsSymbolCountAggregateInputType | true
    }

  export interface NewsSymbolDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['NewsSymbol'], meta: { name: 'NewsSymbol' } }
    /**
     * Find zero or one NewsSymbol that matches the filter.
     * @param {NewsSymbolFindUniqueArgs} args - Arguments to find a NewsSymbol
     * @example
     * // Get one NewsSymbol
     * const newsSymbol = await prisma.newsSymbol.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NewsSymbolFindUniqueArgs>(args: SelectSubset<T, NewsSymbolFindUniqueArgs<ExtArgs>>): Prisma__NewsSymbolClient<$Result.GetResult<Prisma.$NewsSymbolPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one NewsSymbol that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NewsSymbolFindUniqueOrThrowArgs} args - Arguments to find a NewsSymbol
     * @example
     * // Get one NewsSymbol
     * const newsSymbol = await prisma.newsSymbol.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NewsSymbolFindUniqueOrThrowArgs>(args: SelectSubset<T, NewsSymbolFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NewsSymbolClient<$Result.GetResult<Prisma.$NewsSymbolPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NewsSymbol that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsSymbolFindFirstArgs} args - Arguments to find a NewsSymbol
     * @example
     * // Get one NewsSymbol
     * const newsSymbol = await prisma.newsSymbol.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NewsSymbolFindFirstArgs>(args?: SelectSubset<T, NewsSymbolFindFirstArgs<ExtArgs>>): Prisma__NewsSymbolClient<$Result.GetResult<Prisma.$NewsSymbolPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NewsSymbol that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsSymbolFindFirstOrThrowArgs} args - Arguments to find a NewsSymbol
     * @example
     * // Get one NewsSymbol
     * const newsSymbol = await prisma.newsSymbol.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NewsSymbolFindFirstOrThrowArgs>(args?: SelectSubset<T, NewsSymbolFindFirstOrThrowArgs<ExtArgs>>): Prisma__NewsSymbolClient<$Result.GetResult<Prisma.$NewsSymbolPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more NewsSymbols that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsSymbolFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all NewsSymbols
     * const newsSymbols = await prisma.newsSymbol.findMany()
     * 
     * // Get first 10 NewsSymbols
     * const newsSymbols = await prisma.newsSymbol.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const newsSymbolWithIdOnly = await prisma.newsSymbol.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NewsSymbolFindManyArgs>(args?: SelectSubset<T, NewsSymbolFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NewsSymbolPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a NewsSymbol.
     * @param {NewsSymbolCreateArgs} args - Arguments to create a NewsSymbol.
     * @example
     * // Create one NewsSymbol
     * const NewsSymbol = await prisma.newsSymbol.create({
     *   data: {
     *     // ... data to create a NewsSymbol
     *   }
     * })
     * 
     */
    create<T extends NewsSymbolCreateArgs>(args: SelectSubset<T, NewsSymbolCreateArgs<ExtArgs>>): Prisma__NewsSymbolClient<$Result.GetResult<Prisma.$NewsSymbolPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many NewsSymbols.
     * @param {NewsSymbolCreateManyArgs} args - Arguments to create many NewsSymbols.
     * @example
     * // Create many NewsSymbols
     * const newsSymbol = await prisma.newsSymbol.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NewsSymbolCreateManyArgs>(args?: SelectSubset<T, NewsSymbolCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many NewsSymbols and returns the data saved in the database.
     * @param {NewsSymbolCreateManyAndReturnArgs} args - Arguments to create many NewsSymbols.
     * @example
     * // Create many NewsSymbols
     * const newsSymbol = await prisma.newsSymbol.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many NewsSymbols and only return the `id`
     * const newsSymbolWithIdOnly = await prisma.newsSymbol.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NewsSymbolCreateManyAndReturnArgs>(args?: SelectSubset<T, NewsSymbolCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NewsSymbolPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a NewsSymbol.
     * @param {NewsSymbolDeleteArgs} args - Arguments to delete one NewsSymbol.
     * @example
     * // Delete one NewsSymbol
     * const NewsSymbol = await prisma.newsSymbol.delete({
     *   where: {
     *     // ... filter to delete one NewsSymbol
     *   }
     * })
     * 
     */
    delete<T extends NewsSymbolDeleteArgs>(args: SelectSubset<T, NewsSymbolDeleteArgs<ExtArgs>>): Prisma__NewsSymbolClient<$Result.GetResult<Prisma.$NewsSymbolPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one NewsSymbol.
     * @param {NewsSymbolUpdateArgs} args - Arguments to update one NewsSymbol.
     * @example
     * // Update one NewsSymbol
     * const newsSymbol = await prisma.newsSymbol.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NewsSymbolUpdateArgs>(args: SelectSubset<T, NewsSymbolUpdateArgs<ExtArgs>>): Prisma__NewsSymbolClient<$Result.GetResult<Prisma.$NewsSymbolPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more NewsSymbols.
     * @param {NewsSymbolDeleteManyArgs} args - Arguments to filter NewsSymbols to delete.
     * @example
     * // Delete a few NewsSymbols
     * const { count } = await prisma.newsSymbol.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NewsSymbolDeleteManyArgs>(args?: SelectSubset<T, NewsSymbolDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NewsSymbols.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsSymbolUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many NewsSymbols
     * const newsSymbol = await prisma.newsSymbol.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NewsSymbolUpdateManyArgs>(args: SelectSubset<T, NewsSymbolUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NewsSymbols and returns the data updated in the database.
     * @param {NewsSymbolUpdateManyAndReturnArgs} args - Arguments to update many NewsSymbols.
     * @example
     * // Update many NewsSymbols
     * const newsSymbol = await prisma.newsSymbol.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more NewsSymbols and only return the `id`
     * const newsSymbolWithIdOnly = await prisma.newsSymbol.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NewsSymbolUpdateManyAndReturnArgs>(args: SelectSubset<T, NewsSymbolUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NewsSymbolPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one NewsSymbol.
     * @param {NewsSymbolUpsertArgs} args - Arguments to update or create a NewsSymbol.
     * @example
     * // Update or create a NewsSymbol
     * const newsSymbol = await prisma.newsSymbol.upsert({
     *   create: {
     *     // ... data to create a NewsSymbol
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the NewsSymbol we want to update
     *   }
     * })
     */
    upsert<T extends NewsSymbolUpsertArgs>(args: SelectSubset<T, NewsSymbolUpsertArgs<ExtArgs>>): Prisma__NewsSymbolClient<$Result.GetResult<Prisma.$NewsSymbolPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of NewsSymbols.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsSymbolCountArgs} args - Arguments to filter NewsSymbols to count.
     * @example
     * // Count the number of NewsSymbols
     * const count = await prisma.newsSymbol.count({
     *   where: {
     *     // ... the filter for the NewsSymbols we want to count
     *   }
     * })
    **/
    count<T extends NewsSymbolCountArgs>(
      args?: Subset<T, NewsSymbolCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NewsSymbolCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a NewsSymbol.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsSymbolAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NewsSymbolAggregateArgs>(args: Subset<T, NewsSymbolAggregateArgs>): Prisma.PrismaPromise<GetNewsSymbolAggregateType<T>>

    /**
     * Group by NewsSymbol.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsSymbolGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NewsSymbolGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NewsSymbolGroupByArgs['orderBy'] }
        : { orderBy?: NewsSymbolGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NewsSymbolGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNewsSymbolGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the NewsSymbol model
   */
  readonly fields: NewsSymbolFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for NewsSymbol.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NewsSymbolClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    newsArticle<T extends NewsArticleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, NewsArticleDefaultArgs<ExtArgs>>): Prisma__NewsArticleClient<$Result.GetResult<Prisma.$NewsArticlePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the NewsSymbol model
   */
  interface NewsSymbolFieldRefs {
    readonly id: FieldRef<"NewsSymbol", 'String'>
    readonly newsArticleId: FieldRef<"NewsSymbol", 'String'>
    readonly symbol: FieldRef<"NewsSymbol", 'String'>
    readonly sectorId: FieldRef<"NewsSymbol", 'String'>
  }
    

  // Custom InputTypes
  /**
   * NewsSymbol findUnique
   */
  export type NewsSymbolFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsSymbol
     */
    select?: NewsSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsSymbol
     */
    omit?: NewsSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsSymbolInclude<ExtArgs> | null
    /**
     * Filter, which NewsSymbol to fetch.
     */
    where: NewsSymbolWhereUniqueInput
  }

  /**
   * NewsSymbol findUniqueOrThrow
   */
  export type NewsSymbolFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsSymbol
     */
    select?: NewsSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsSymbol
     */
    omit?: NewsSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsSymbolInclude<ExtArgs> | null
    /**
     * Filter, which NewsSymbol to fetch.
     */
    where: NewsSymbolWhereUniqueInput
  }

  /**
   * NewsSymbol findFirst
   */
  export type NewsSymbolFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsSymbol
     */
    select?: NewsSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsSymbol
     */
    omit?: NewsSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsSymbolInclude<ExtArgs> | null
    /**
     * Filter, which NewsSymbol to fetch.
     */
    where?: NewsSymbolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NewsSymbols to fetch.
     */
    orderBy?: NewsSymbolOrderByWithRelationInput | NewsSymbolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NewsSymbols.
     */
    cursor?: NewsSymbolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NewsSymbols from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NewsSymbols.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NewsSymbols.
     */
    distinct?: NewsSymbolScalarFieldEnum | NewsSymbolScalarFieldEnum[]
  }

  /**
   * NewsSymbol findFirstOrThrow
   */
  export type NewsSymbolFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsSymbol
     */
    select?: NewsSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsSymbol
     */
    omit?: NewsSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsSymbolInclude<ExtArgs> | null
    /**
     * Filter, which NewsSymbol to fetch.
     */
    where?: NewsSymbolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NewsSymbols to fetch.
     */
    orderBy?: NewsSymbolOrderByWithRelationInput | NewsSymbolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NewsSymbols.
     */
    cursor?: NewsSymbolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NewsSymbols from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NewsSymbols.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NewsSymbols.
     */
    distinct?: NewsSymbolScalarFieldEnum | NewsSymbolScalarFieldEnum[]
  }

  /**
   * NewsSymbol findMany
   */
  export type NewsSymbolFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsSymbol
     */
    select?: NewsSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsSymbol
     */
    omit?: NewsSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsSymbolInclude<ExtArgs> | null
    /**
     * Filter, which NewsSymbols to fetch.
     */
    where?: NewsSymbolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NewsSymbols to fetch.
     */
    orderBy?: NewsSymbolOrderByWithRelationInput | NewsSymbolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing NewsSymbols.
     */
    cursor?: NewsSymbolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NewsSymbols from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NewsSymbols.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NewsSymbols.
     */
    distinct?: NewsSymbolScalarFieldEnum | NewsSymbolScalarFieldEnum[]
  }

  /**
   * NewsSymbol create
   */
  export type NewsSymbolCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsSymbol
     */
    select?: NewsSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsSymbol
     */
    omit?: NewsSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsSymbolInclude<ExtArgs> | null
    /**
     * The data needed to create a NewsSymbol.
     */
    data: XOR<NewsSymbolCreateInput, NewsSymbolUncheckedCreateInput>
  }

  /**
   * NewsSymbol createMany
   */
  export type NewsSymbolCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many NewsSymbols.
     */
    data: NewsSymbolCreateManyInput | NewsSymbolCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NewsSymbol createManyAndReturn
   */
  export type NewsSymbolCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsSymbol
     */
    select?: NewsSymbolSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NewsSymbol
     */
    omit?: NewsSymbolOmit<ExtArgs> | null
    /**
     * The data used to create many NewsSymbols.
     */
    data: NewsSymbolCreateManyInput | NewsSymbolCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsSymbolIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * NewsSymbol update
   */
  export type NewsSymbolUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsSymbol
     */
    select?: NewsSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsSymbol
     */
    omit?: NewsSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsSymbolInclude<ExtArgs> | null
    /**
     * The data needed to update a NewsSymbol.
     */
    data: XOR<NewsSymbolUpdateInput, NewsSymbolUncheckedUpdateInput>
    /**
     * Choose, which NewsSymbol to update.
     */
    where: NewsSymbolWhereUniqueInput
  }

  /**
   * NewsSymbol updateMany
   */
  export type NewsSymbolUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update NewsSymbols.
     */
    data: XOR<NewsSymbolUpdateManyMutationInput, NewsSymbolUncheckedUpdateManyInput>
    /**
     * Filter which NewsSymbols to update
     */
    where?: NewsSymbolWhereInput
    /**
     * Limit how many NewsSymbols to update.
     */
    limit?: number
  }

  /**
   * NewsSymbol updateManyAndReturn
   */
  export type NewsSymbolUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsSymbol
     */
    select?: NewsSymbolSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NewsSymbol
     */
    omit?: NewsSymbolOmit<ExtArgs> | null
    /**
     * The data used to update NewsSymbols.
     */
    data: XOR<NewsSymbolUpdateManyMutationInput, NewsSymbolUncheckedUpdateManyInput>
    /**
     * Filter which NewsSymbols to update
     */
    where?: NewsSymbolWhereInput
    /**
     * Limit how many NewsSymbols to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsSymbolIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * NewsSymbol upsert
   */
  export type NewsSymbolUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsSymbol
     */
    select?: NewsSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsSymbol
     */
    omit?: NewsSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsSymbolInclude<ExtArgs> | null
    /**
     * The filter to search for the NewsSymbol to update in case it exists.
     */
    where: NewsSymbolWhereUniqueInput
    /**
     * In case the NewsSymbol found by the `where` argument doesn't exist, create a new NewsSymbol with this data.
     */
    create: XOR<NewsSymbolCreateInput, NewsSymbolUncheckedCreateInput>
    /**
     * In case the NewsSymbol was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NewsSymbolUpdateInput, NewsSymbolUncheckedUpdateInput>
  }

  /**
   * NewsSymbol delete
   */
  export type NewsSymbolDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsSymbol
     */
    select?: NewsSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsSymbol
     */
    omit?: NewsSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsSymbolInclude<ExtArgs> | null
    /**
     * Filter which NewsSymbol to delete.
     */
    where: NewsSymbolWhereUniqueInput
  }

  /**
   * NewsSymbol deleteMany
   */
  export type NewsSymbolDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NewsSymbols to delete
     */
    where?: NewsSymbolWhereInput
    /**
     * Limit how many NewsSymbols to delete.
     */
    limit?: number
  }

  /**
   * NewsSymbol without action
   */
  export type NewsSymbolDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NewsSymbol
     */
    select?: NewsSymbolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NewsSymbol
     */
    omit?: NewsSymbolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NewsSymbolInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const WatchlistScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WatchlistScalarFieldEnum = (typeof WatchlistScalarFieldEnum)[keyof typeof WatchlistScalarFieldEnum]


  export const WatchlistSymbolScalarFieldEnum: {
    id: 'id',
    watchlistId: 'watchlistId',
    symbol: 'symbol',
    createdAt: 'createdAt'
  };

  export type WatchlistSymbolScalarFieldEnum = (typeof WatchlistSymbolScalarFieldEnum)[keyof typeof WatchlistSymbolScalarFieldEnum]


  export const SectorScalarFieldEnum: {
    id: 'id',
    slug: 'slug',
    name: 'name',
    description: 'description',
    active: 'active',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SectorScalarFieldEnum = (typeof SectorScalarFieldEnum)[keyof typeof SectorScalarFieldEnum]


  export const StockScalarFieldEnum: {
    id: 'id',
    symbol: 'symbol',
    name: 'name',
    exchange: 'exchange',
    active: 'active',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type StockScalarFieldEnum = (typeof StockScalarFieldEnum)[keyof typeof StockScalarFieldEnum]


  export const SectorStockScalarFieldEnum: {
    id: 'id',
    sectorId: 'sectorId',
    stockId: 'stockId',
    weight: 'weight'
  };

  export type SectorStockScalarFieldEnum = (typeof SectorStockScalarFieldEnum)[keyof typeof SectorStockScalarFieldEnum]


  export const SignalScalarFieldEnum: {
    id: 'id',
    symbol: 'symbol',
    sectorId: 'sectorId',
    type: 'type',
    severity: 'severity',
    score: 'score',
    triggerValue: 'triggerValue',
    previousValue: 'previousValue',
    headline: 'headline',
    metadata: 'metadata',
    createdAt: 'createdAt'
  };

  export type SignalScalarFieldEnum = (typeof SignalScalarFieldEnum)[keyof typeof SignalScalarFieldEnum]


  export const SignalOutcomeScalarFieldEnum: {
    id: 'id',
    signalId: 'signalId',
    priceAtSignal: 'priceAtSignal',
    return5m: 'return5m',
    return15m: 'return15m',
    return30m: 'return30m',
    return60m: 'return60m',
    maxFavorable: 'maxFavorable',
    maxAdverse: 'maxAdverse',
    continuedHigher: 'continuedHigher',
    evaluatedAt: 'evaluatedAt',
    createdAt: 'createdAt'
  };

  export type SignalOutcomeScalarFieldEnum = (typeof SignalOutcomeScalarFieldEnum)[keyof typeof SignalOutcomeScalarFieldEnum]


  export const AlertRuleScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    type: 'type',
    sectorId: 'sectorId',
    minSeverity: 'minSeverity',
    threshold: 'threshold',
    enabled: 'enabled',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AlertRuleScalarFieldEnum = (typeof AlertRuleScalarFieldEnum)[keyof typeof AlertRuleScalarFieldEnum]


  export const AlertEventScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    signalId: 'signalId',
    delivered: 'delivered',
    deliveredAt: 'deliveredAt',
    createdAt: 'createdAt'
  };

  export type AlertEventScalarFieldEnum = (typeof AlertEventScalarFieldEnum)[keyof typeof AlertEventScalarFieldEnum]


  export const NewsArticleScalarFieldEnum: {
    id: 'id',
    headline: 'headline',
    source: 'source',
    url: 'url',
    publishedAt: 'publishedAt',
    catalystType: 'catalystType',
    createdAt: 'createdAt'
  };

  export type NewsArticleScalarFieldEnum = (typeof NewsArticleScalarFieldEnum)[keyof typeof NewsArticleScalarFieldEnum]


  export const NewsSymbolScalarFieldEnum: {
    id: 'id',
    newsArticleId: 'newsArticleId',
    symbol: 'symbol',
    sectorId: 'sectorId'
  };

  export type NewsSymbolScalarFieldEnum = (typeof NewsSymbolScalarFieldEnum)[keyof typeof NewsSymbolScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'SignalType'
   */
  export type EnumSignalTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SignalType'>
    


  /**
   * Reference to a field of type 'SignalType[]'
   */
  export type ListEnumSignalTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SignalType[]'>
    


  /**
   * Reference to a field of type 'SignalSeverity'
   */
  export type EnumSignalSeverityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SignalSeverity'>
    


  /**
   * Reference to a field of type 'SignalSeverity[]'
   */
  export type ListEnumSignalSeverityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SignalSeverity[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    watchlists?: WatchlistListRelationFilter
    alertRules?: AlertRuleListRelationFilter
    alertEvents?: AlertEventListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    watchlists?: WatchlistOrderByRelationAggregateInput
    alertRules?: AlertRuleOrderByRelationAggregateInput
    alertEvents?: AlertEventOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    watchlists?: WatchlistListRelationFilter
    alertRules?: AlertRuleListRelationFilter
    alertEvents?: AlertEventListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type WatchlistWhereInput = {
    AND?: WatchlistWhereInput | WatchlistWhereInput[]
    OR?: WatchlistWhereInput[]
    NOT?: WatchlistWhereInput | WatchlistWhereInput[]
    id?: StringFilter<"Watchlist"> | string
    userId?: StringFilter<"Watchlist"> | string
    name?: StringFilter<"Watchlist"> | string
    createdAt?: DateTimeFilter<"Watchlist"> | Date | string
    updatedAt?: DateTimeFilter<"Watchlist"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    symbols?: WatchlistSymbolListRelationFilter
  }

  export type WatchlistOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    symbols?: WatchlistSymbolOrderByRelationAggregateInput
  }

  export type WatchlistWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_name?: WatchlistUserIdNameCompoundUniqueInput
    AND?: WatchlistWhereInput | WatchlistWhereInput[]
    OR?: WatchlistWhereInput[]
    NOT?: WatchlistWhereInput | WatchlistWhereInput[]
    userId?: StringFilter<"Watchlist"> | string
    name?: StringFilter<"Watchlist"> | string
    createdAt?: DateTimeFilter<"Watchlist"> | Date | string
    updatedAt?: DateTimeFilter<"Watchlist"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    symbols?: WatchlistSymbolListRelationFilter
  }, "id" | "userId_name">

  export type WatchlistOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WatchlistCountOrderByAggregateInput
    _max?: WatchlistMaxOrderByAggregateInput
    _min?: WatchlistMinOrderByAggregateInput
  }

  export type WatchlistScalarWhereWithAggregatesInput = {
    AND?: WatchlistScalarWhereWithAggregatesInput | WatchlistScalarWhereWithAggregatesInput[]
    OR?: WatchlistScalarWhereWithAggregatesInput[]
    NOT?: WatchlistScalarWhereWithAggregatesInput | WatchlistScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Watchlist"> | string
    userId?: StringWithAggregatesFilter<"Watchlist"> | string
    name?: StringWithAggregatesFilter<"Watchlist"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Watchlist"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Watchlist"> | Date | string
  }

  export type WatchlistSymbolWhereInput = {
    AND?: WatchlistSymbolWhereInput | WatchlistSymbolWhereInput[]
    OR?: WatchlistSymbolWhereInput[]
    NOT?: WatchlistSymbolWhereInput | WatchlistSymbolWhereInput[]
    id?: StringFilter<"WatchlistSymbol"> | string
    watchlistId?: StringFilter<"WatchlistSymbol"> | string
    symbol?: StringFilter<"WatchlistSymbol"> | string
    createdAt?: DateTimeFilter<"WatchlistSymbol"> | Date | string
    watchlist?: XOR<WatchlistScalarRelationFilter, WatchlistWhereInput>
  }

  export type WatchlistSymbolOrderByWithRelationInput = {
    id?: SortOrder
    watchlistId?: SortOrder
    symbol?: SortOrder
    createdAt?: SortOrder
    watchlist?: WatchlistOrderByWithRelationInput
  }

  export type WatchlistSymbolWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    watchlistId_symbol?: WatchlistSymbolWatchlistIdSymbolCompoundUniqueInput
    AND?: WatchlistSymbolWhereInput | WatchlistSymbolWhereInput[]
    OR?: WatchlistSymbolWhereInput[]
    NOT?: WatchlistSymbolWhereInput | WatchlistSymbolWhereInput[]
    watchlistId?: StringFilter<"WatchlistSymbol"> | string
    symbol?: StringFilter<"WatchlistSymbol"> | string
    createdAt?: DateTimeFilter<"WatchlistSymbol"> | Date | string
    watchlist?: XOR<WatchlistScalarRelationFilter, WatchlistWhereInput>
  }, "id" | "watchlistId_symbol">

  export type WatchlistSymbolOrderByWithAggregationInput = {
    id?: SortOrder
    watchlistId?: SortOrder
    symbol?: SortOrder
    createdAt?: SortOrder
    _count?: WatchlistSymbolCountOrderByAggregateInput
    _max?: WatchlistSymbolMaxOrderByAggregateInput
    _min?: WatchlistSymbolMinOrderByAggregateInput
  }

  export type WatchlistSymbolScalarWhereWithAggregatesInput = {
    AND?: WatchlistSymbolScalarWhereWithAggregatesInput | WatchlistSymbolScalarWhereWithAggregatesInput[]
    OR?: WatchlistSymbolScalarWhereWithAggregatesInput[]
    NOT?: WatchlistSymbolScalarWhereWithAggregatesInput | WatchlistSymbolScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WatchlistSymbol"> | string
    watchlistId?: StringWithAggregatesFilter<"WatchlistSymbol"> | string
    symbol?: StringWithAggregatesFilter<"WatchlistSymbol"> | string
    createdAt?: DateTimeWithAggregatesFilter<"WatchlistSymbol"> | Date | string
  }

  export type SectorWhereInput = {
    AND?: SectorWhereInput | SectorWhereInput[]
    OR?: SectorWhereInput[]
    NOT?: SectorWhereInput | SectorWhereInput[]
    id?: StringFilter<"Sector"> | string
    slug?: StringFilter<"Sector"> | string
    name?: StringFilter<"Sector"> | string
    description?: StringNullableFilter<"Sector"> | string | null
    active?: BoolFilter<"Sector"> | boolean
    createdAt?: DateTimeFilter<"Sector"> | Date | string
    updatedAt?: DateTimeFilter<"Sector"> | Date | string
    stocks?: SectorStockListRelationFilter
    signals?: SignalListRelationFilter
  }

  export type SectorOrderByWithRelationInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    stocks?: SectorStockOrderByRelationAggregateInput
    signals?: SignalOrderByRelationAggregateInput
  }

  export type SectorWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    name?: string
    AND?: SectorWhereInput | SectorWhereInput[]
    OR?: SectorWhereInput[]
    NOT?: SectorWhereInput | SectorWhereInput[]
    description?: StringNullableFilter<"Sector"> | string | null
    active?: BoolFilter<"Sector"> | boolean
    createdAt?: DateTimeFilter<"Sector"> | Date | string
    updatedAt?: DateTimeFilter<"Sector"> | Date | string
    stocks?: SectorStockListRelationFilter
    signals?: SignalListRelationFilter
  }, "id" | "slug" | "name">

  export type SectorOrderByWithAggregationInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SectorCountOrderByAggregateInput
    _max?: SectorMaxOrderByAggregateInput
    _min?: SectorMinOrderByAggregateInput
  }

  export type SectorScalarWhereWithAggregatesInput = {
    AND?: SectorScalarWhereWithAggregatesInput | SectorScalarWhereWithAggregatesInput[]
    OR?: SectorScalarWhereWithAggregatesInput[]
    NOT?: SectorScalarWhereWithAggregatesInput | SectorScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Sector"> | string
    slug?: StringWithAggregatesFilter<"Sector"> | string
    name?: StringWithAggregatesFilter<"Sector"> | string
    description?: StringNullableWithAggregatesFilter<"Sector"> | string | null
    active?: BoolWithAggregatesFilter<"Sector"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Sector"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Sector"> | Date | string
  }

  export type StockWhereInput = {
    AND?: StockWhereInput | StockWhereInput[]
    OR?: StockWhereInput[]
    NOT?: StockWhereInput | StockWhereInput[]
    id?: StringFilter<"Stock"> | string
    symbol?: StringFilter<"Stock"> | string
    name?: StringFilter<"Stock"> | string
    exchange?: StringFilter<"Stock"> | string
    active?: BoolFilter<"Stock"> | boolean
    createdAt?: DateTimeFilter<"Stock"> | Date | string
    updatedAt?: DateTimeFilter<"Stock"> | Date | string
    sectors?: SectorStockListRelationFilter
  }

  export type StockOrderByWithRelationInput = {
    id?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    exchange?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sectors?: SectorStockOrderByRelationAggregateInput
  }

  export type StockWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    symbol?: string
    AND?: StockWhereInput | StockWhereInput[]
    OR?: StockWhereInput[]
    NOT?: StockWhereInput | StockWhereInput[]
    name?: StringFilter<"Stock"> | string
    exchange?: StringFilter<"Stock"> | string
    active?: BoolFilter<"Stock"> | boolean
    createdAt?: DateTimeFilter<"Stock"> | Date | string
    updatedAt?: DateTimeFilter<"Stock"> | Date | string
    sectors?: SectorStockListRelationFilter
  }, "id" | "symbol">

  export type StockOrderByWithAggregationInput = {
    id?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    exchange?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: StockCountOrderByAggregateInput
    _max?: StockMaxOrderByAggregateInput
    _min?: StockMinOrderByAggregateInput
  }

  export type StockScalarWhereWithAggregatesInput = {
    AND?: StockScalarWhereWithAggregatesInput | StockScalarWhereWithAggregatesInput[]
    OR?: StockScalarWhereWithAggregatesInput[]
    NOT?: StockScalarWhereWithAggregatesInput | StockScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Stock"> | string
    symbol?: StringWithAggregatesFilter<"Stock"> | string
    name?: StringWithAggregatesFilter<"Stock"> | string
    exchange?: StringWithAggregatesFilter<"Stock"> | string
    active?: BoolWithAggregatesFilter<"Stock"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Stock"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Stock"> | Date | string
  }

  export type SectorStockWhereInput = {
    AND?: SectorStockWhereInput | SectorStockWhereInput[]
    OR?: SectorStockWhereInput[]
    NOT?: SectorStockWhereInput | SectorStockWhereInput[]
    id?: StringFilter<"SectorStock"> | string
    sectorId?: StringFilter<"SectorStock"> | string
    stockId?: StringFilter<"SectorStock"> | string
    weight?: FloatFilter<"SectorStock"> | number
    sector?: XOR<SectorScalarRelationFilter, SectorWhereInput>
    stock?: XOR<StockScalarRelationFilter, StockWhereInput>
  }

  export type SectorStockOrderByWithRelationInput = {
    id?: SortOrder
    sectorId?: SortOrder
    stockId?: SortOrder
    weight?: SortOrder
    sector?: SectorOrderByWithRelationInput
    stock?: StockOrderByWithRelationInput
  }

  export type SectorStockWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sectorId_stockId?: SectorStockSectorIdStockIdCompoundUniqueInput
    AND?: SectorStockWhereInput | SectorStockWhereInput[]
    OR?: SectorStockWhereInput[]
    NOT?: SectorStockWhereInput | SectorStockWhereInput[]
    sectorId?: StringFilter<"SectorStock"> | string
    stockId?: StringFilter<"SectorStock"> | string
    weight?: FloatFilter<"SectorStock"> | number
    sector?: XOR<SectorScalarRelationFilter, SectorWhereInput>
    stock?: XOR<StockScalarRelationFilter, StockWhereInput>
  }, "id" | "sectorId_stockId">

  export type SectorStockOrderByWithAggregationInput = {
    id?: SortOrder
    sectorId?: SortOrder
    stockId?: SortOrder
    weight?: SortOrder
    _count?: SectorStockCountOrderByAggregateInput
    _avg?: SectorStockAvgOrderByAggregateInput
    _max?: SectorStockMaxOrderByAggregateInput
    _min?: SectorStockMinOrderByAggregateInput
    _sum?: SectorStockSumOrderByAggregateInput
  }

  export type SectorStockScalarWhereWithAggregatesInput = {
    AND?: SectorStockScalarWhereWithAggregatesInput | SectorStockScalarWhereWithAggregatesInput[]
    OR?: SectorStockScalarWhereWithAggregatesInput[]
    NOT?: SectorStockScalarWhereWithAggregatesInput | SectorStockScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SectorStock"> | string
    sectorId?: StringWithAggregatesFilter<"SectorStock"> | string
    stockId?: StringWithAggregatesFilter<"SectorStock"> | string
    weight?: FloatWithAggregatesFilter<"SectorStock"> | number
  }

  export type SignalWhereInput = {
    AND?: SignalWhereInput | SignalWhereInput[]
    OR?: SignalWhereInput[]
    NOT?: SignalWhereInput | SignalWhereInput[]
    id?: StringFilter<"Signal"> | string
    symbol?: StringNullableFilter<"Signal"> | string | null
    sectorId?: StringNullableFilter<"Signal"> | string | null
    type?: EnumSignalTypeFilter<"Signal"> | $Enums.SignalType
    severity?: EnumSignalSeverityFilter<"Signal"> | $Enums.SignalSeverity
    score?: FloatFilter<"Signal"> | number
    triggerValue?: FloatFilter<"Signal"> | number
    previousValue?: FloatNullableFilter<"Signal"> | number | null
    headline?: StringFilter<"Signal"> | string
    metadata?: JsonFilter<"Signal">
    createdAt?: DateTimeFilter<"Signal"> | Date | string
    sector?: XOR<SectorNullableScalarRelationFilter, SectorWhereInput> | null
    alertEvents?: AlertEventListRelationFilter
    outcome?: XOR<SignalOutcomeNullableScalarRelationFilter, SignalOutcomeWhereInput> | null
  }

  export type SignalOrderByWithRelationInput = {
    id?: SortOrder
    symbol?: SortOrderInput | SortOrder
    sectorId?: SortOrderInput | SortOrder
    type?: SortOrder
    severity?: SortOrder
    score?: SortOrder
    triggerValue?: SortOrder
    previousValue?: SortOrderInput | SortOrder
    headline?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    sector?: SectorOrderByWithRelationInput
    alertEvents?: AlertEventOrderByRelationAggregateInput
    outcome?: SignalOutcomeOrderByWithRelationInput
  }

  export type SignalWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SignalWhereInput | SignalWhereInput[]
    OR?: SignalWhereInput[]
    NOT?: SignalWhereInput | SignalWhereInput[]
    symbol?: StringNullableFilter<"Signal"> | string | null
    sectorId?: StringNullableFilter<"Signal"> | string | null
    type?: EnumSignalTypeFilter<"Signal"> | $Enums.SignalType
    severity?: EnumSignalSeverityFilter<"Signal"> | $Enums.SignalSeverity
    score?: FloatFilter<"Signal"> | number
    triggerValue?: FloatFilter<"Signal"> | number
    previousValue?: FloatNullableFilter<"Signal"> | number | null
    headline?: StringFilter<"Signal"> | string
    metadata?: JsonFilter<"Signal">
    createdAt?: DateTimeFilter<"Signal"> | Date | string
    sector?: XOR<SectorNullableScalarRelationFilter, SectorWhereInput> | null
    alertEvents?: AlertEventListRelationFilter
    outcome?: XOR<SignalOutcomeNullableScalarRelationFilter, SignalOutcomeWhereInput> | null
  }, "id">

  export type SignalOrderByWithAggregationInput = {
    id?: SortOrder
    symbol?: SortOrderInput | SortOrder
    sectorId?: SortOrderInput | SortOrder
    type?: SortOrder
    severity?: SortOrder
    score?: SortOrder
    triggerValue?: SortOrder
    previousValue?: SortOrderInput | SortOrder
    headline?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    _count?: SignalCountOrderByAggregateInput
    _avg?: SignalAvgOrderByAggregateInput
    _max?: SignalMaxOrderByAggregateInput
    _min?: SignalMinOrderByAggregateInput
    _sum?: SignalSumOrderByAggregateInput
  }

  export type SignalScalarWhereWithAggregatesInput = {
    AND?: SignalScalarWhereWithAggregatesInput | SignalScalarWhereWithAggregatesInput[]
    OR?: SignalScalarWhereWithAggregatesInput[]
    NOT?: SignalScalarWhereWithAggregatesInput | SignalScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Signal"> | string
    symbol?: StringNullableWithAggregatesFilter<"Signal"> | string | null
    sectorId?: StringNullableWithAggregatesFilter<"Signal"> | string | null
    type?: EnumSignalTypeWithAggregatesFilter<"Signal"> | $Enums.SignalType
    severity?: EnumSignalSeverityWithAggregatesFilter<"Signal"> | $Enums.SignalSeverity
    score?: FloatWithAggregatesFilter<"Signal"> | number
    triggerValue?: FloatWithAggregatesFilter<"Signal"> | number
    previousValue?: FloatNullableWithAggregatesFilter<"Signal"> | number | null
    headline?: StringWithAggregatesFilter<"Signal"> | string
    metadata?: JsonWithAggregatesFilter<"Signal">
    createdAt?: DateTimeWithAggregatesFilter<"Signal"> | Date | string
  }

  export type SignalOutcomeWhereInput = {
    AND?: SignalOutcomeWhereInput | SignalOutcomeWhereInput[]
    OR?: SignalOutcomeWhereInput[]
    NOT?: SignalOutcomeWhereInput | SignalOutcomeWhereInput[]
    id?: StringFilter<"SignalOutcome"> | string
    signalId?: StringFilter<"SignalOutcome"> | string
    priceAtSignal?: FloatFilter<"SignalOutcome"> | number
    return5m?: FloatNullableFilter<"SignalOutcome"> | number | null
    return15m?: FloatNullableFilter<"SignalOutcome"> | number | null
    return30m?: FloatNullableFilter<"SignalOutcome"> | number | null
    return60m?: FloatNullableFilter<"SignalOutcome"> | number | null
    maxFavorable?: FloatNullableFilter<"SignalOutcome"> | number | null
    maxAdverse?: FloatNullableFilter<"SignalOutcome"> | number | null
    continuedHigher?: BoolNullableFilter<"SignalOutcome"> | boolean | null
    evaluatedAt?: DateTimeNullableFilter<"SignalOutcome"> | Date | string | null
    createdAt?: DateTimeFilter<"SignalOutcome"> | Date | string
    signal?: XOR<SignalScalarRelationFilter, SignalWhereInput>
  }

  export type SignalOutcomeOrderByWithRelationInput = {
    id?: SortOrder
    signalId?: SortOrder
    priceAtSignal?: SortOrder
    return5m?: SortOrderInput | SortOrder
    return15m?: SortOrderInput | SortOrder
    return30m?: SortOrderInput | SortOrder
    return60m?: SortOrderInput | SortOrder
    maxFavorable?: SortOrderInput | SortOrder
    maxAdverse?: SortOrderInput | SortOrder
    continuedHigher?: SortOrderInput | SortOrder
    evaluatedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    signal?: SignalOrderByWithRelationInput
  }

  export type SignalOutcomeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    signalId?: string
    AND?: SignalOutcomeWhereInput | SignalOutcomeWhereInput[]
    OR?: SignalOutcomeWhereInput[]
    NOT?: SignalOutcomeWhereInput | SignalOutcomeWhereInput[]
    priceAtSignal?: FloatFilter<"SignalOutcome"> | number
    return5m?: FloatNullableFilter<"SignalOutcome"> | number | null
    return15m?: FloatNullableFilter<"SignalOutcome"> | number | null
    return30m?: FloatNullableFilter<"SignalOutcome"> | number | null
    return60m?: FloatNullableFilter<"SignalOutcome"> | number | null
    maxFavorable?: FloatNullableFilter<"SignalOutcome"> | number | null
    maxAdverse?: FloatNullableFilter<"SignalOutcome"> | number | null
    continuedHigher?: BoolNullableFilter<"SignalOutcome"> | boolean | null
    evaluatedAt?: DateTimeNullableFilter<"SignalOutcome"> | Date | string | null
    createdAt?: DateTimeFilter<"SignalOutcome"> | Date | string
    signal?: XOR<SignalScalarRelationFilter, SignalWhereInput>
  }, "id" | "signalId">

  export type SignalOutcomeOrderByWithAggregationInput = {
    id?: SortOrder
    signalId?: SortOrder
    priceAtSignal?: SortOrder
    return5m?: SortOrderInput | SortOrder
    return15m?: SortOrderInput | SortOrder
    return30m?: SortOrderInput | SortOrder
    return60m?: SortOrderInput | SortOrder
    maxFavorable?: SortOrderInput | SortOrder
    maxAdverse?: SortOrderInput | SortOrder
    continuedHigher?: SortOrderInput | SortOrder
    evaluatedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: SignalOutcomeCountOrderByAggregateInput
    _avg?: SignalOutcomeAvgOrderByAggregateInput
    _max?: SignalOutcomeMaxOrderByAggregateInput
    _min?: SignalOutcomeMinOrderByAggregateInput
    _sum?: SignalOutcomeSumOrderByAggregateInput
  }

  export type SignalOutcomeScalarWhereWithAggregatesInput = {
    AND?: SignalOutcomeScalarWhereWithAggregatesInput | SignalOutcomeScalarWhereWithAggregatesInput[]
    OR?: SignalOutcomeScalarWhereWithAggregatesInput[]
    NOT?: SignalOutcomeScalarWhereWithAggregatesInput | SignalOutcomeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SignalOutcome"> | string
    signalId?: StringWithAggregatesFilter<"SignalOutcome"> | string
    priceAtSignal?: FloatWithAggregatesFilter<"SignalOutcome"> | number
    return5m?: FloatNullableWithAggregatesFilter<"SignalOutcome"> | number | null
    return15m?: FloatNullableWithAggregatesFilter<"SignalOutcome"> | number | null
    return30m?: FloatNullableWithAggregatesFilter<"SignalOutcome"> | number | null
    return60m?: FloatNullableWithAggregatesFilter<"SignalOutcome"> | number | null
    maxFavorable?: FloatNullableWithAggregatesFilter<"SignalOutcome"> | number | null
    maxAdverse?: FloatNullableWithAggregatesFilter<"SignalOutcome"> | number | null
    continuedHigher?: BoolNullableWithAggregatesFilter<"SignalOutcome"> | boolean | null
    evaluatedAt?: DateTimeNullableWithAggregatesFilter<"SignalOutcome"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SignalOutcome"> | Date | string
  }

  export type AlertRuleWhereInput = {
    AND?: AlertRuleWhereInput | AlertRuleWhereInput[]
    OR?: AlertRuleWhereInput[]
    NOT?: AlertRuleWhereInput | AlertRuleWhereInput[]
    id?: StringFilter<"AlertRule"> | string
    userId?: StringFilter<"AlertRule"> | string
    type?: EnumSignalTypeNullableFilter<"AlertRule"> | $Enums.SignalType | null
    sectorId?: StringNullableFilter<"AlertRule"> | string | null
    minSeverity?: EnumSignalSeverityFilter<"AlertRule"> | $Enums.SignalSeverity
    threshold?: FloatFilter<"AlertRule"> | number
    enabled?: BoolFilter<"AlertRule"> | boolean
    createdAt?: DateTimeFilter<"AlertRule"> | Date | string
    updatedAt?: DateTimeFilter<"AlertRule"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type AlertRuleOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrderInput | SortOrder
    sectorId?: SortOrderInput | SortOrder
    minSeverity?: SortOrder
    threshold?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AlertRuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AlertRuleWhereInput | AlertRuleWhereInput[]
    OR?: AlertRuleWhereInput[]
    NOT?: AlertRuleWhereInput | AlertRuleWhereInput[]
    userId?: StringFilter<"AlertRule"> | string
    type?: EnumSignalTypeNullableFilter<"AlertRule"> | $Enums.SignalType | null
    sectorId?: StringNullableFilter<"AlertRule"> | string | null
    minSeverity?: EnumSignalSeverityFilter<"AlertRule"> | $Enums.SignalSeverity
    threshold?: FloatFilter<"AlertRule"> | number
    enabled?: BoolFilter<"AlertRule"> | boolean
    createdAt?: DateTimeFilter<"AlertRule"> | Date | string
    updatedAt?: DateTimeFilter<"AlertRule"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type AlertRuleOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrderInput | SortOrder
    sectorId?: SortOrderInput | SortOrder
    minSeverity?: SortOrder
    threshold?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AlertRuleCountOrderByAggregateInput
    _avg?: AlertRuleAvgOrderByAggregateInput
    _max?: AlertRuleMaxOrderByAggregateInput
    _min?: AlertRuleMinOrderByAggregateInput
    _sum?: AlertRuleSumOrderByAggregateInput
  }

  export type AlertRuleScalarWhereWithAggregatesInput = {
    AND?: AlertRuleScalarWhereWithAggregatesInput | AlertRuleScalarWhereWithAggregatesInput[]
    OR?: AlertRuleScalarWhereWithAggregatesInput[]
    NOT?: AlertRuleScalarWhereWithAggregatesInput | AlertRuleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AlertRule"> | string
    userId?: StringWithAggregatesFilter<"AlertRule"> | string
    type?: EnumSignalTypeNullableWithAggregatesFilter<"AlertRule"> | $Enums.SignalType | null
    sectorId?: StringNullableWithAggregatesFilter<"AlertRule"> | string | null
    minSeverity?: EnumSignalSeverityWithAggregatesFilter<"AlertRule"> | $Enums.SignalSeverity
    threshold?: FloatWithAggregatesFilter<"AlertRule"> | number
    enabled?: BoolWithAggregatesFilter<"AlertRule"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"AlertRule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AlertRule"> | Date | string
  }

  export type AlertEventWhereInput = {
    AND?: AlertEventWhereInput | AlertEventWhereInput[]
    OR?: AlertEventWhereInput[]
    NOT?: AlertEventWhereInput | AlertEventWhereInput[]
    id?: StringFilter<"AlertEvent"> | string
    userId?: StringFilter<"AlertEvent"> | string
    signalId?: StringFilter<"AlertEvent"> | string
    delivered?: BoolFilter<"AlertEvent"> | boolean
    deliveredAt?: DateTimeNullableFilter<"AlertEvent"> | Date | string | null
    createdAt?: DateTimeFilter<"AlertEvent"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    signal?: XOR<SignalScalarRelationFilter, SignalWhereInput>
  }

  export type AlertEventOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    signalId?: SortOrder
    delivered?: SortOrder
    deliveredAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
    signal?: SignalOrderByWithRelationInput
  }

  export type AlertEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_signalId?: AlertEventUserIdSignalIdCompoundUniqueInput
    AND?: AlertEventWhereInput | AlertEventWhereInput[]
    OR?: AlertEventWhereInput[]
    NOT?: AlertEventWhereInput | AlertEventWhereInput[]
    userId?: StringFilter<"AlertEvent"> | string
    signalId?: StringFilter<"AlertEvent"> | string
    delivered?: BoolFilter<"AlertEvent"> | boolean
    deliveredAt?: DateTimeNullableFilter<"AlertEvent"> | Date | string | null
    createdAt?: DateTimeFilter<"AlertEvent"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    signal?: XOR<SignalScalarRelationFilter, SignalWhereInput>
  }, "id" | "userId_signalId">

  export type AlertEventOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    signalId?: SortOrder
    delivered?: SortOrder
    deliveredAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AlertEventCountOrderByAggregateInput
    _max?: AlertEventMaxOrderByAggregateInput
    _min?: AlertEventMinOrderByAggregateInput
  }

  export type AlertEventScalarWhereWithAggregatesInput = {
    AND?: AlertEventScalarWhereWithAggregatesInput | AlertEventScalarWhereWithAggregatesInput[]
    OR?: AlertEventScalarWhereWithAggregatesInput[]
    NOT?: AlertEventScalarWhereWithAggregatesInput | AlertEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AlertEvent"> | string
    userId?: StringWithAggregatesFilter<"AlertEvent"> | string
    signalId?: StringWithAggregatesFilter<"AlertEvent"> | string
    delivered?: BoolWithAggregatesFilter<"AlertEvent"> | boolean
    deliveredAt?: DateTimeNullableWithAggregatesFilter<"AlertEvent"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AlertEvent"> | Date | string
  }

  export type NewsArticleWhereInput = {
    AND?: NewsArticleWhereInput | NewsArticleWhereInput[]
    OR?: NewsArticleWhereInput[]
    NOT?: NewsArticleWhereInput | NewsArticleWhereInput[]
    id?: StringFilter<"NewsArticle"> | string
    headline?: StringFilter<"NewsArticle"> | string
    source?: StringFilter<"NewsArticle"> | string
    url?: StringFilter<"NewsArticle"> | string
    publishedAt?: DateTimeFilter<"NewsArticle"> | Date | string
    catalystType?: StringFilter<"NewsArticle"> | string
    createdAt?: DateTimeFilter<"NewsArticle"> | Date | string
    symbols?: NewsSymbolListRelationFilter
  }

  export type NewsArticleOrderByWithRelationInput = {
    id?: SortOrder
    headline?: SortOrder
    source?: SortOrder
    url?: SortOrder
    publishedAt?: SortOrder
    catalystType?: SortOrder
    createdAt?: SortOrder
    symbols?: NewsSymbolOrderByRelationAggregateInput
  }

  export type NewsArticleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    url?: string
    AND?: NewsArticleWhereInput | NewsArticleWhereInput[]
    OR?: NewsArticleWhereInput[]
    NOT?: NewsArticleWhereInput | NewsArticleWhereInput[]
    headline?: StringFilter<"NewsArticle"> | string
    source?: StringFilter<"NewsArticle"> | string
    publishedAt?: DateTimeFilter<"NewsArticle"> | Date | string
    catalystType?: StringFilter<"NewsArticle"> | string
    createdAt?: DateTimeFilter<"NewsArticle"> | Date | string
    symbols?: NewsSymbolListRelationFilter
  }, "id" | "url">

  export type NewsArticleOrderByWithAggregationInput = {
    id?: SortOrder
    headline?: SortOrder
    source?: SortOrder
    url?: SortOrder
    publishedAt?: SortOrder
    catalystType?: SortOrder
    createdAt?: SortOrder
    _count?: NewsArticleCountOrderByAggregateInput
    _max?: NewsArticleMaxOrderByAggregateInput
    _min?: NewsArticleMinOrderByAggregateInput
  }

  export type NewsArticleScalarWhereWithAggregatesInput = {
    AND?: NewsArticleScalarWhereWithAggregatesInput | NewsArticleScalarWhereWithAggregatesInput[]
    OR?: NewsArticleScalarWhereWithAggregatesInput[]
    NOT?: NewsArticleScalarWhereWithAggregatesInput | NewsArticleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"NewsArticle"> | string
    headline?: StringWithAggregatesFilter<"NewsArticle"> | string
    source?: StringWithAggregatesFilter<"NewsArticle"> | string
    url?: StringWithAggregatesFilter<"NewsArticle"> | string
    publishedAt?: DateTimeWithAggregatesFilter<"NewsArticle"> | Date | string
    catalystType?: StringWithAggregatesFilter<"NewsArticle"> | string
    createdAt?: DateTimeWithAggregatesFilter<"NewsArticle"> | Date | string
  }

  export type NewsSymbolWhereInput = {
    AND?: NewsSymbolWhereInput | NewsSymbolWhereInput[]
    OR?: NewsSymbolWhereInput[]
    NOT?: NewsSymbolWhereInput | NewsSymbolWhereInput[]
    id?: StringFilter<"NewsSymbol"> | string
    newsArticleId?: StringFilter<"NewsSymbol"> | string
    symbol?: StringFilter<"NewsSymbol"> | string
    sectorId?: StringNullableFilter<"NewsSymbol"> | string | null
    newsArticle?: XOR<NewsArticleScalarRelationFilter, NewsArticleWhereInput>
  }

  export type NewsSymbolOrderByWithRelationInput = {
    id?: SortOrder
    newsArticleId?: SortOrder
    symbol?: SortOrder
    sectorId?: SortOrderInput | SortOrder
    newsArticle?: NewsArticleOrderByWithRelationInput
  }

  export type NewsSymbolWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    newsArticleId_symbol?: NewsSymbolNewsArticleIdSymbolCompoundUniqueInput
    AND?: NewsSymbolWhereInput | NewsSymbolWhereInput[]
    OR?: NewsSymbolWhereInput[]
    NOT?: NewsSymbolWhereInput | NewsSymbolWhereInput[]
    newsArticleId?: StringFilter<"NewsSymbol"> | string
    symbol?: StringFilter<"NewsSymbol"> | string
    sectorId?: StringNullableFilter<"NewsSymbol"> | string | null
    newsArticle?: XOR<NewsArticleScalarRelationFilter, NewsArticleWhereInput>
  }, "id" | "newsArticleId_symbol">

  export type NewsSymbolOrderByWithAggregationInput = {
    id?: SortOrder
    newsArticleId?: SortOrder
    symbol?: SortOrder
    sectorId?: SortOrderInput | SortOrder
    _count?: NewsSymbolCountOrderByAggregateInput
    _max?: NewsSymbolMaxOrderByAggregateInput
    _min?: NewsSymbolMinOrderByAggregateInput
  }

  export type NewsSymbolScalarWhereWithAggregatesInput = {
    AND?: NewsSymbolScalarWhereWithAggregatesInput | NewsSymbolScalarWhereWithAggregatesInput[]
    OR?: NewsSymbolScalarWhereWithAggregatesInput[]
    NOT?: NewsSymbolScalarWhereWithAggregatesInput | NewsSymbolScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"NewsSymbol"> | string
    newsArticleId?: StringWithAggregatesFilter<"NewsSymbol"> | string
    symbol?: StringWithAggregatesFilter<"NewsSymbol"> | string
    sectorId?: StringNullableWithAggregatesFilter<"NewsSymbol"> | string | null
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    watchlists?: WatchlistCreateNestedManyWithoutUserInput
    alertRules?: AlertRuleCreateNestedManyWithoutUserInput
    alertEvents?: AlertEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    watchlists?: WatchlistUncheckedCreateNestedManyWithoutUserInput
    alertRules?: AlertRuleUncheckedCreateNestedManyWithoutUserInput
    alertEvents?: AlertEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    watchlists?: WatchlistUpdateManyWithoutUserNestedInput
    alertRules?: AlertRuleUpdateManyWithoutUserNestedInput
    alertEvents?: AlertEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    watchlists?: WatchlistUncheckedUpdateManyWithoutUserNestedInput
    alertRules?: AlertRuleUncheckedUpdateManyWithoutUserNestedInput
    alertEvents?: AlertEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WatchlistCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutWatchlistsInput
    symbols?: WatchlistSymbolCreateNestedManyWithoutWatchlistInput
  }

  export type WatchlistUncheckedCreateInput = {
    id?: string
    userId: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    symbols?: WatchlistSymbolUncheckedCreateNestedManyWithoutWatchlistInput
  }

  export type WatchlistUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutWatchlistsNestedInput
    symbols?: WatchlistSymbolUpdateManyWithoutWatchlistNestedInput
  }

  export type WatchlistUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    symbols?: WatchlistSymbolUncheckedUpdateManyWithoutWatchlistNestedInput
  }

  export type WatchlistCreateManyInput = {
    id?: string
    userId: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WatchlistUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WatchlistUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WatchlistSymbolCreateInput = {
    id?: string
    symbol: string
    createdAt?: Date | string
    watchlist: WatchlistCreateNestedOneWithoutSymbolsInput
  }

  export type WatchlistSymbolUncheckedCreateInput = {
    id?: string
    watchlistId: string
    symbol: string
    createdAt?: Date | string
  }

  export type WatchlistSymbolUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    watchlist?: WatchlistUpdateOneRequiredWithoutSymbolsNestedInput
  }

  export type WatchlistSymbolUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    watchlistId?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WatchlistSymbolCreateManyInput = {
    id?: string
    watchlistId: string
    symbol: string
    createdAt?: Date | string
  }

  export type WatchlistSymbolUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WatchlistSymbolUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    watchlistId?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SectorCreateInput = {
    id?: string
    slug: string
    name: string
    description?: string | null
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    stocks?: SectorStockCreateNestedManyWithoutSectorInput
    signals?: SignalCreateNestedManyWithoutSectorInput
  }

  export type SectorUncheckedCreateInput = {
    id?: string
    slug: string
    name: string
    description?: string | null
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    stocks?: SectorStockUncheckedCreateNestedManyWithoutSectorInput
    signals?: SignalUncheckedCreateNestedManyWithoutSectorInput
  }

  export type SectorUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stocks?: SectorStockUpdateManyWithoutSectorNestedInput
    signals?: SignalUpdateManyWithoutSectorNestedInput
  }

  export type SectorUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stocks?: SectorStockUncheckedUpdateManyWithoutSectorNestedInput
    signals?: SignalUncheckedUpdateManyWithoutSectorNestedInput
  }

  export type SectorCreateManyInput = {
    id?: string
    slug: string
    name: string
    description?: string | null
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SectorUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SectorUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockCreateInput = {
    id?: string
    symbol: string
    name: string
    exchange: string
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    sectors?: SectorStockCreateNestedManyWithoutStockInput
  }

  export type StockUncheckedCreateInput = {
    id?: string
    symbol: string
    name: string
    exchange: string
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    sectors?: SectorStockUncheckedCreateNestedManyWithoutStockInput
  }

  export type StockUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    exchange?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sectors?: SectorStockUpdateManyWithoutStockNestedInput
  }

  export type StockUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    exchange?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sectors?: SectorStockUncheckedUpdateManyWithoutStockNestedInput
  }

  export type StockCreateManyInput = {
    id?: string
    symbol: string
    name: string
    exchange: string
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StockUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    exchange?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    exchange?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SectorStockCreateInput = {
    id?: string
    weight?: number
    sector: SectorCreateNestedOneWithoutStocksInput
    stock: StockCreateNestedOneWithoutSectorsInput
  }

  export type SectorStockUncheckedCreateInput = {
    id?: string
    sectorId: string
    stockId: string
    weight?: number
  }

  export type SectorStockUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
    sector?: SectorUpdateOneRequiredWithoutStocksNestedInput
    stock?: StockUpdateOneRequiredWithoutSectorsNestedInput
  }

  export type SectorStockUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sectorId?: StringFieldUpdateOperationsInput | string
    stockId?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
  }

  export type SectorStockCreateManyInput = {
    id?: string
    sectorId: string
    stockId: string
    weight?: number
  }

  export type SectorStockUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
  }

  export type SectorStockUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sectorId?: StringFieldUpdateOperationsInput | string
    stockId?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
  }

  export type SignalCreateInput = {
    id: string
    symbol?: string | null
    type: $Enums.SignalType
    severity: $Enums.SignalSeverity
    score: number
    triggerValue: number
    previousValue?: number | null
    headline: string
    metadata: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    sector?: SectorCreateNestedOneWithoutSignalsInput
    alertEvents?: AlertEventCreateNestedManyWithoutSignalInput
    outcome?: SignalOutcomeCreateNestedOneWithoutSignalInput
  }

  export type SignalUncheckedCreateInput = {
    id: string
    symbol?: string | null
    sectorId?: string | null
    type: $Enums.SignalType
    severity: $Enums.SignalSeverity
    score: number
    triggerValue: number
    previousValue?: number | null
    headline: string
    metadata: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    alertEvents?: AlertEventUncheckedCreateNestedManyWithoutSignalInput
    outcome?: SignalOutcomeUncheckedCreateNestedOneWithoutSignalInput
  }

  export type SignalUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType
    severity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    score?: FloatFieldUpdateOperationsInput | number
    triggerValue?: FloatFieldUpdateOperationsInput | number
    previousValue?: NullableFloatFieldUpdateOperationsInput | number | null
    headline?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sector?: SectorUpdateOneWithoutSignalsNestedInput
    alertEvents?: AlertEventUpdateManyWithoutSignalNestedInput
    outcome?: SignalOutcomeUpdateOneWithoutSignalNestedInput
  }

  export type SignalUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType
    severity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    score?: FloatFieldUpdateOperationsInput | number
    triggerValue?: FloatFieldUpdateOperationsInput | number
    previousValue?: NullableFloatFieldUpdateOperationsInput | number | null
    headline?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    alertEvents?: AlertEventUncheckedUpdateManyWithoutSignalNestedInput
    outcome?: SignalOutcomeUncheckedUpdateOneWithoutSignalNestedInput
  }

  export type SignalCreateManyInput = {
    id: string
    symbol?: string | null
    sectorId?: string | null
    type: $Enums.SignalType
    severity: $Enums.SignalSeverity
    score: number
    triggerValue: number
    previousValue?: number | null
    headline: string
    metadata: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type SignalUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType
    severity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    score?: FloatFieldUpdateOperationsInput | number
    triggerValue?: FloatFieldUpdateOperationsInput | number
    previousValue?: NullableFloatFieldUpdateOperationsInput | number | null
    headline?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType
    severity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    score?: FloatFieldUpdateOperationsInput | number
    triggerValue?: FloatFieldUpdateOperationsInput | number
    previousValue?: NullableFloatFieldUpdateOperationsInput | number | null
    headline?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalOutcomeCreateInput = {
    id?: string
    priceAtSignal: number
    return5m?: number | null
    return15m?: number | null
    return30m?: number | null
    return60m?: number | null
    maxFavorable?: number | null
    maxAdverse?: number | null
    continuedHigher?: boolean | null
    evaluatedAt?: Date | string | null
    createdAt?: Date | string
    signal: SignalCreateNestedOneWithoutOutcomeInput
  }

  export type SignalOutcomeUncheckedCreateInput = {
    id?: string
    signalId: string
    priceAtSignal: number
    return5m?: number | null
    return15m?: number | null
    return30m?: number | null
    return60m?: number | null
    maxFavorable?: number | null
    maxAdverse?: number | null
    continuedHigher?: boolean | null
    evaluatedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type SignalOutcomeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    priceAtSignal?: FloatFieldUpdateOperationsInput | number
    return5m?: NullableFloatFieldUpdateOperationsInput | number | null
    return15m?: NullableFloatFieldUpdateOperationsInput | number | null
    return30m?: NullableFloatFieldUpdateOperationsInput | number | null
    return60m?: NullableFloatFieldUpdateOperationsInput | number | null
    maxFavorable?: NullableFloatFieldUpdateOperationsInput | number | null
    maxAdverse?: NullableFloatFieldUpdateOperationsInput | number | null
    continuedHigher?: NullableBoolFieldUpdateOperationsInput | boolean | null
    evaluatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    signal?: SignalUpdateOneRequiredWithoutOutcomeNestedInput
  }

  export type SignalOutcomeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalId?: StringFieldUpdateOperationsInput | string
    priceAtSignal?: FloatFieldUpdateOperationsInput | number
    return5m?: NullableFloatFieldUpdateOperationsInput | number | null
    return15m?: NullableFloatFieldUpdateOperationsInput | number | null
    return30m?: NullableFloatFieldUpdateOperationsInput | number | null
    return60m?: NullableFloatFieldUpdateOperationsInput | number | null
    maxFavorable?: NullableFloatFieldUpdateOperationsInput | number | null
    maxAdverse?: NullableFloatFieldUpdateOperationsInput | number | null
    continuedHigher?: NullableBoolFieldUpdateOperationsInput | boolean | null
    evaluatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalOutcomeCreateManyInput = {
    id?: string
    signalId: string
    priceAtSignal: number
    return5m?: number | null
    return15m?: number | null
    return30m?: number | null
    return60m?: number | null
    maxFavorable?: number | null
    maxAdverse?: number | null
    continuedHigher?: boolean | null
    evaluatedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type SignalOutcomeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    priceAtSignal?: FloatFieldUpdateOperationsInput | number
    return5m?: NullableFloatFieldUpdateOperationsInput | number | null
    return15m?: NullableFloatFieldUpdateOperationsInput | number | null
    return30m?: NullableFloatFieldUpdateOperationsInput | number | null
    return60m?: NullableFloatFieldUpdateOperationsInput | number | null
    maxFavorable?: NullableFloatFieldUpdateOperationsInput | number | null
    maxAdverse?: NullableFloatFieldUpdateOperationsInput | number | null
    continuedHigher?: NullableBoolFieldUpdateOperationsInput | boolean | null
    evaluatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalOutcomeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalId?: StringFieldUpdateOperationsInput | string
    priceAtSignal?: FloatFieldUpdateOperationsInput | number
    return5m?: NullableFloatFieldUpdateOperationsInput | number | null
    return15m?: NullableFloatFieldUpdateOperationsInput | number | null
    return30m?: NullableFloatFieldUpdateOperationsInput | number | null
    return60m?: NullableFloatFieldUpdateOperationsInput | number | null
    maxFavorable?: NullableFloatFieldUpdateOperationsInput | number | null
    maxAdverse?: NullableFloatFieldUpdateOperationsInput | number | null
    continuedHigher?: NullableBoolFieldUpdateOperationsInput | boolean | null
    evaluatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertRuleCreateInput = {
    id?: string
    type?: $Enums.SignalType | null
    sectorId?: string | null
    minSeverity?: $Enums.SignalSeverity
    threshold?: number
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutAlertRulesInput
  }

  export type AlertRuleUncheckedCreateInput = {
    id?: string
    userId: string
    type?: $Enums.SignalType | null
    sectorId?: string | null
    minSeverity?: $Enums.SignalSeverity
    threshold?: number
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AlertRuleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: NullableEnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType | null
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
    minSeverity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    threshold?: FloatFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAlertRulesNestedInput
  }

  export type AlertRuleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: NullableEnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType | null
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
    minSeverity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    threshold?: FloatFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertRuleCreateManyInput = {
    id?: string
    userId: string
    type?: $Enums.SignalType | null
    sectorId?: string | null
    minSeverity?: $Enums.SignalSeverity
    threshold?: number
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AlertRuleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: NullableEnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType | null
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
    minSeverity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    threshold?: FloatFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertRuleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: NullableEnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType | null
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
    minSeverity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    threshold?: FloatFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertEventCreateInput = {
    id?: string
    delivered?: boolean
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutAlertEventsInput
    signal: SignalCreateNestedOneWithoutAlertEventsInput
  }

  export type AlertEventUncheckedCreateInput = {
    id?: string
    userId: string
    signalId: string
    delivered?: boolean
    deliveredAt?: Date | string | null
    createdAt?: Date | string
  }

  export type AlertEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    delivered?: BoolFieldUpdateOperationsInput | boolean
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAlertEventsNestedInput
    signal?: SignalUpdateOneRequiredWithoutAlertEventsNestedInput
  }

  export type AlertEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    signalId?: StringFieldUpdateOperationsInput | string
    delivered?: BoolFieldUpdateOperationsInput | boolean
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertEventCreateManyInput = {
    id?: string
    userId: string
    signalId: string
    delivered?: boolean
    deliveredAt?: Date | string | null
    createdAt?: Date | string
  }

  export type AlertEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    delivered?: BoolFieldUpdateOperationsInput | boolean
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    signalId?: StringFieldUpdateOperationsInput | string
    delivered?: BoolFieldUpdateOperationsInput | boolean
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NewsArticleCreateInput = {
    id?: string
    headline: string
    source: string
    url: string
    publishedAt: Date | string
    catalystType: string
    createdAt?: Date | string
    symbols?: NewsSymbolCreateNestedManyWithoutNewsArticleInput
  }

  export type NewsArticleUncheckedCreateInput = {
    id?: string
    headline: string
    source: string
    url: string
    publishedAt: Date | string
    catalystType: string
    createdAt?: Date | string
    symbols?: NewsSymbolUncheckedCreateNestedManyWithoutNewsArticleInput
  }

  export type NewsArticleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    headline?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    publishedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    catalystType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    symbols?: NewsSymbolUpdateManyWithoutNewsArticleNestedInput
  }

  export type NewsArticleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    headline?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    publishedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    catalystType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    symbols?: NewsSymbolUncheckedUpdateManyWithoutNewsArticleNestedInput
  }

  export type NewsArticleCreateManyInput = {
    id?: string
    headline: string
    source: string
    url: string
    publishedAt: Date | string
    catalystType: string
    createdAt?: Date | string
  }

  export type NewsArticleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    headline?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    publishedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    catalystType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NewsArticleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    headline?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    publishedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    catalystType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NewsSymbolCreateInput = {
    id?: string
    symbol: string
    sectorId?: string | null
    newsArticle: NewsArticleCreateNestedOneWithoutSymbolsInput
  }

  export type NewsSymbolUncheckedCreateInput = {
    id?: string
    newsArticleId: string
    symbol: string
    sectorId?: string | null
  }

  export type NewsSymbolUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
    newsArticle?: NewsArticleUpdateOneRequiredWithoutSymbolsNestedInput
  }

  export type NewsSymbolUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    newsArticleId?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type NewsSymbolCreateManyInput = {
    id?: string
    newsArticleId: string
    symbol: string
    sectorId?: string | null
  }

  export type NewsSymbolUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type NewsSymbolUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    newsArticleId?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type WatchlistListRelationFilter = {
    every?: WatchlistWhereInput
    some?: WatchlistWhereInput
    none?: WatchlistWhereInput
  }

  export type AlertRuleListRelationFilter = {
    every?: AlertRuleWhereInput
    some?: AlertRuleWhereInput
    none?: AlertRuleWhereInput
  }

  export type AlertEventListRelationFilter = {
    every?: AlertEventWhereInput
    some?: AlertEventWhereInput
    none?: AlertEventWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type WatchlistOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AlertRuleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AlertEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type WatchlistSymbolListRelationFilter = {
    every?: WatchlistSymbolWhereInput
    some?: WatchlistSymbolWhereInput
    none?: WatchlistSymbolWhereInput
  }

  export type WatchlistSymbolOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WatchlistUserIdNameCompoundUniqueInput = {
    userId: string
    name: string
  }

  export type WatchlistCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WatchlistMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WatchlistMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WatchlistScalarRelationFilter = {
    is?: WatchlistWhereInput
    isNot?: WatchlistWhereInput
  }

  export type WatchlistSymbolWatchlistIdSymbolCompoundUniqueInput = {
    watchlistId: string
    symbol: string
  }

  export type WatchlistSymbolCountOrderByAggregateInput = {
    id?: SortOrder
    watchlistId?: SortOrder
    symbol?: SortOrder
    createdAt?: SortOrder
  }

  export type WatchlistSymbolMaxOrderByAggregateInput = {
    id?: SortOrder
    watchlistId?: SortOrder
    symbol?: SortOrder
    createdAt?: SortOrder
  }

  export type WatchlistSymbolMinOrderByAggregateInput = {
    id?: SortOrder
    watchlistId?: SortOrder
    symbol?: SortOrder
    createdAt?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type SectorStockListRelationFilter = {
    every?: SectorStockWhereInput
    some?: SectorStockWhereInput
    none?: SectorStockWhereInput
  }

  export type SignalListRelationFilter = {
    every?: SignalWhereInput
    some?: SignalWhereInput
    none?: SignalWhereInput
  }

  export type SectorStockOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SignalOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SectorCountOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    description?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SectorMaxOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    description?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SectorMinOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    description?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StockCountOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    exchange?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StockMaxOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    exchange?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StockMinOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    exchange?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type SectorScalarRelationFilter = {
    is?: SectorWhereInput
    isNot?: SectorWhereInput
  }

  export type StockScalarRelationFilter = {
    is?: StockWhereInput
    isNot?: StockWhereInput
  }

  export type SectorStockSectorIdStockIdCompoundUniqueInput = {
    sectorId: string
    stockId: string
  }

  export type SectorStockCountOrderByAggregateInput = {
    id?: SortOrder
    sectorId?: SortOrder
    stockId?: SortOrder
    weight?: SortOrder
  }

  export type SectorStockAvgOrderByAggregateInput = {
    weight?: SortOrder
  }

  export type SectorStockMaxOrderByAggregateInput = {
    id?: SortOrder
    sectorId?: SortOrder
    stockId?: SortOrder
    weight?: SortOrder
  }

  export type SectorStockMinOrderByAggregateInput = {
    id?: SortOrder
    sectorId?: SortOrder
    stockId?: SortOrder
    weight?: SortOrder
  }

  export type SectorStockSumOrderByAggregateInput = {
    weight?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type EnumSignalTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalType | EnumSignalTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSignalTypeFilter<$PrismaModel> | $Enums.SignalType
  }

  export type EnumSignalSeverityFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalSeverity | EnumSignalSeverityFieldRefInput<$PrismaModel>
    in?: $Enums.SignalSeverity[] | ListEnumSignalSeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.SignalSeverity[] | ListEnumSignalSeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumSignalSeverityFilter<$PrismaModel> | $Enums.SignalSeverity
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type SectorNullableScalarRelationFilter = {
    is?: SectorWhereInput | null
    isNot?: SectorWhereInput | null
  }

  export type SignalOutcomeNullableScalarRelationFilter = {
    is?: SignalOutcomeWhereInput | null
    isNot?: SignalOutcomeWhereInput | null
  }

  export type SignalCountOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    sectorId?: SortOrder
    type?: SortOrder
    severity?: SortOrder
    score?: SortOrder
    triggerValue?: SortOrder
    previousValue?: SortOrder
    headline?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type SignalAvgOrderByAggregateInput = {
    score?: SortOrder
    triggerValue?: SortOrder
    previousValue?: SortOrder
  }

  export type SignalMaxOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    sectorId?: SortOrder
    type?: SortOrder
    severity?: SortOrder
    score?: SortOrder
    triggerValue?: SortOrder
    previousValue?: SortOrder
    headline?: SortOrder
    createdAt?: SortOrder
  }

  export type SignalMinOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    sectorId?: SortOrder
    type?: SortOrder
    severity?: SortOrder
    score?: SortOrder
    triggerValue?: SortOrder
    previousValue?: SortOrder
    headline?: SortOrder
    createdAt?: SortOrder
  }

  export type SignalSumOrderByAggregateInput = {
    score?: SortOrder
    triggerValue?: SortOrder
    previousValue?: SortOrder
  }

  export type EnumSignalTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalType | EnumSignalTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSignalTypeWithAggregatesFilter<$PrismaModel> | $Enums.SignalType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSignalTypeFilter<$PrismaModel>
    _max?: NestedEnumSignalTypeFilter<$PrismaModel>
  }

  export type EnumSignalSeverityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalSeverity | EnumSignalSeverityFieldRefInput<$PrismaModel>
    in?: $Enums.SignalSeverity[] | ListEnumSignalSeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.SignalSeverity[] | ListEnumSignalSeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumSignalSeverityWithAggregatesFilter<$PrismaModel> | $Enums.SignalSeverity
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSignalSeverityFilter<$PrismaModel>
    _max?: NestedEnumSignalSeverityFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type SignalScalarRelationFilter = {
    is?: SignalWhereInput
    isNot?: SignalWhereInput
  }

  export type SignalOutcomeCountOrderByAggregateInput = {
    id?: SortOrder
    signalId?: SortOrder
    priceAtSignal?: SortOrder
    return5m?: SortOrder
    return15m?: SortOrder
    return30m?: SortOrder
    return60m?: SortOrder
    maxFavorable?: SortOrder
    maxAdverse?: SortOrder
    continuedHigher?: SortOrder
    evaluatedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type SignalOutcomeAvgOrderByAggregateInput = {
    priceAtSignal?: SortOrder
    return5m?: SortOrder
    return15m?: SortOrder
    return30m?: SortOrder
    return60m?: SortOrder
    maxFavorable?: SortOrder
    maxAdverse?: SortOrder
  }

  export type SignalOutcomeMaxOrderByAggregateInput = {
    id?: SortOrder
    signalId?: SortOrder
    priceAtSignal?: SortOrder
    return5m?: SortOrder
    return15m?: SortOrder
    return30m?: SortOrder
    return60m?: SortOrder
    maxFavorable?: SortOrder
    maxAdverse?: SortOrder
    continuedHigher?: SortOrder
    evaluatedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type SignalOutcomeMinOrderByAggregateInput = {
    id?: SortOrder
    signalId?: SortOrder
    priceAtSignal?: SortOrder
    return5m?: SortOrder
    return15m?: SortOrder
    return30m?: SortOrder
    return60m?: SortOrder
    maxFavorable?: SortOrder
    maxAdverse?: SortOrder
    continuedHigher?: SortOrder
    evaluatedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type SignalOutcomeSumOrderByAggregateInput = {
    priceAtSignal?: SortOrder
    return5m?: SortOrder
    return15m?: SortOrder
    return30m?: SortOrder
    return60m?: SortOrder
    maxFavorable?: SortOrder
    maxAdverse?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumSignalTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalType | EnumSignalTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumSignalTypeNullableFilter<$PrismaModel> | $Enums.SignalType | null
  }

  export type AlertRuleCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    sectorId?: SortOrder
    minSeverity?: SortOrder
    threshold?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AlertRuleAvgOrderByAggregateInput = {
    threshold?: SortOrder
  }

  export type AlertRuleMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    sectorId?: SortOrder
    minSeverity?: SortOrder
    threshold?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AlertRuleMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    sectorId?: SortOrder
    minSeverity?: SortOrder
    threshold?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AlertRuleSumOrderByAggregateInput = {
    threshold?: SortOrder
  }

  export type EnumSignalTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalType | EnumSignalTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumSignalTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.SignalType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumSignalTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumSignalTypeNullableFilter<$PrismaModel>
  }

  export type AlertEventUserIdSignalIdCompoundUniqueInput = {
    userId: string
    signalId: string
  }

  export type AlertEventCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    signalId?: SortOrder
    delivered?: SortOrder
    deliveredAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AlertEventMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    signalId?: SortOrder
    delivered?: SortOrder
    deliveredAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AlertEventMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    signalId?: SortOrder
    delivered?: SortOrder
    deliveredAt?: SortOrder
    createdAt?: SortOrder
  }

  export type NewsSymbolListRelationFilter = {
    every?: NewsSymbolWhereInput
    some?: NewsSymbolWhereInput
    none?: NewsSymbolWhereInput
  }

  export type NewsSymbolOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type NewsArticleCountOrderByAggregateInput = {
    id?: SortOrder
    headline?: SortOrder
    source?: SortOrder
    url?: SortOrder
    publishedAt?: SortOrder
    catalystType?: SortOrder
    createdAt?: SortOrder
  }

  export type NewsArticleMaxOrderByAggregateInput = {
    id?: SortOrder
    headline?: SortOrder
    source?: SortOrder
    url?: SortOrder
    publishedAt?: SortOrder
    catalystType?: SortOrder
    createdAt?: SortOrder
  }

  export type NewsArticleMinOrderByAggregateInput = {
    id?: SortOrder
    headline?: SortOrder
    source?: SortOrder
    url?: SortOrder
    publishedAt?: SortOrder
    catalystType?: SortOrder
    createdAt?: SortOrder
  }

  export type NewsArticleScalarRelationFilter = {
    is?: NewsArticleWhereInput
    isNot?: NewsArticleWhereInput
  }

  export type NewsSymbolNewsArticleIdSymbolCompoundUniqueInput = {
    newsArticleId: string
    symbol: string
  }

  export type NewsSymbolCountOrderByAggregateInput = {
    id?: SortOrder
    newsArticleId?: SortOrder
    symbol?: SortOrder
    sectorId?: SortOrder
  }

  export type NewsSymbolMaxOrderByAggregateInput = {
    id?: SortOrder
    newsArticleId?: SortOrder
    symbol?: SortOrder
    sectorId?: SortOrder
  }

  export type NewsSymbolMinOrderByAggregateInput = {
    id?: SortOrder
    newsArticleId?: SortOrder
    symbol?: SortOrder
    sectorId?: SortOrder
  }

  export type WatchlistCreateNestedManyWithoutUserInput = {
    create?: XOR<WatchlistCreateWithoutUserInput, WatchlistUncheckedCreateWithoutUserInput> | WatchlistCreateWithoutUserInput[] | WatchlistUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WatchlistCreateOrConnectWithoutUserInput | WatchlistCreateOrConnectWithoutUserInput[]
    createMany?: WatchlistCreateManyUserInputEnvelope
    connect?: WatchlistWhereUniqueInput | WatchlistWhereUniqueInput[]
  }

  export type AlertRuleCreateNestedManyWithoutUserInput = {
    create?: XOR<AlertRuleCreateWithoutUserInput, AlertRuleUncheckedCreateWithoutUserInput> | AlertRuleCreateWithoutUserInput[] | AlertRuleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AlertRuleCreateOrConnectWithoutUserInput | AlertRuleCreateOrConnectWithoutUserInput[]
    createMany?: AlertRuleCreateManyUserInputEnvelope
    connect?: AlertRuleWhereUniqueInput | AlertRuleWhereUniqueInput[]
  }

  export type AlertEventCreateNestedManyWithoutUserInput = {
    create?: XOR<AlertEventCreateWithoutUserInput, AlertEventUncheckedCreateWithoutUserInput> | AlertEventCreateWithoutUserInput[] | AlertEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AlertEventCreateOrConnectWithoutUserInput | AlertEventCreateOrConnectWithoutUserInput[]
    createMany?: AlertEventCreateManyUserInputEnvelope
    connect?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
  }

  export type WatchlistUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<WatchlistCreateWithoutUserInput, WatchlistUncheckedCreateWithoutUserInput> | WatchlistCreateWithoutUserInput[] | WatchlistUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WatchlistCreateOrConnectWithoutUserInput | WatchlistCreateOrConnectWithoutUserInput[]
    createMany?: WatchlistCreateManyUserInputEnvelope
    connect?: WatchlistWhereUniqueInput | WatchlistWhereUniqueInput[]
  }

  export type AlertRuleUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AlertRuleCreateWithoutUserInput, AlertRuleUncheckedCreateWithoutUserInput> | AlertRuleCreateWithoutUserInput[] | AlertRuleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AlertRuleCreateOrConnectWithoutUserInput | AlertRuleCreateOrConnectWithoutUserInput[]
    createMany?: AlertRuleCreateManyUserInputEnvelope
    connect?: AlertRuleWhereUniqueInput | AlertRuleWhereUniqueInput[]
  }

  export type AlertEventUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AlertEventCreateWithoutUserInput, AlertEventUncheckedCreateWithoutUserInput> | AlertEventCreateWithoutUserInput[] | AlertEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AlertEventCreateOrConnectWithoutUserInput | AlertEventCreateOrConnectWithoutUserInput[]
    createMany?: AlertEventCreateManyUserInputEnvelope
    connect?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type WatchlistUpdateManyWithoutUserNestedInput = {
    create?: XOR<WatchlistCreateWithoutUserInput, WatchlistUncheckedCreateWithoutUserInput> | WatchlistCreateWithoutUserInput[] | WatchlistUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WatchlistCreateOrConnectWithoutUserInput | WatchlistCreateOrConnectWithoutUserInput[]
    upsert?: WatchlistUpsertWithWhereUniqueWithoutUserInput | WatchlistUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: WatchlistCreateManyUserInputEnvelope
    set?: WatchlistWhereUniqueInput | WatchlistWhereUniqueInput[]
    disconnect?: WatchlistWhereUniqueInput | WatchlistWhereUniqueInput[]
    delete?: WatchlistWhereUniqueInput | WatchlistWhereUniqueInput[]
    connect?: WatchlistWhereUniqueInput | WatchlistWhereUniqueInput[]
    update?: WatchlistUpdateWithWhereUniqueWithoutUserInput | WatchlistUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: WatchlistUpdateManyWithWhereWithoutUserInput | WatchlistUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: WatchlistScalarWhereInput | WatchlistScalarWhereInput[]
  }

  export type AlertRuleUpdateManyWithoutUserNestedInput = {
    create?: XOR<AlertRuleCreateWithoutUserInput, AlertRuleUncheckedCreateWithoutUserInput> | AlertRuleCreateWithoutUserInput[] | AlertRuleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AlertRuleCreateOrConnectWithoutUserInput | AlertRuleCreateOrConnectWithoutUserInput[]
    upsert?: AlertRuleUpsertWithWhereUniqueWithoutUserInput | AlertRuleUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AlertRuleCreateManyUserInputEnvelope
    set?: AlertRuleWhereUniqueInput | AlertRuleWhereUniqueInput[]
    disconnect?: AlertRuleWhereUniqueInput | AlertRuleWhereUniqueInput[]
    delete?: AlertRuleWhereUniqueInput | AlertRuleWhereUniqueInput[]
    connect?: AlertRuleWhereUniqueInput | AlertRuleWhereUniqueInput[]
    update?: AlertRuleUpdateWithWhereUniqueWithoutUserInput | AlertRuleUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AlertRuleUpdateManyWithWhereWithoutUserInput | AlertRuleUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AlertRuleScalarWhereInput | AlertRuleScalarWhereInput[]
  }

  export type AlertEventUpdateManyWithoutUserNestedInput = {
    create?: XOR<AlertEventCreateWithoutUserInput, AlertEventUncheckedCreateWithoutUserInput> | AlertEventCreateWithoutUserInput[] | AlertEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AlertEventCreateOrConnectWithoutUserInput | AlertEventCreateOrConnectWithoutUserInput[]
    upsert?: AlertEventUpsertWithWhereUniqueWithoutUserInput | AlertEventUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AlertEventCreateManyUserInputEnvelope
    set?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    disconnect?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    delete?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    connect?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    update?: AlertEventUpdateWithWhereUniqueWithoutUserInput | AlertEventUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AlertEventUpdateManyWithWhereWithoutUserInput | AlertEventUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AlertEventScalarWhereInput | AlertEventScalarWhereInput[]
  }

  export type WatchlistUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<WatchlistCreateWithoutUserInput, WatchlistUncheckedCreateWithoutUserInput> | WatchlistCreateWithoutUserInput[] | WatchlistUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WatchlistCreateOrConnectWithoutUserInput | WatchlistCreateOrConnectWithoutUserInput[]
    upsert?: WatchlistUpsertWithWhereUniqueWithoutUserInput | WatchlistUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: WatchlistCreateManyUserInputEnvelope
    set?: WatchlistWhereUniqueInput | WatchlistWhereUniqueInput[]
    disconnect?: WatchlistWhereUniqueInput | WatchlistWhereUniqueInput[]
    delete?: WatchlistWhereUniqueInput | WatchlistWhereUniqueInput[]
    connect?: WatchlistWhereUniqueInput | WatchlistWhereUniqueInput[]
    update?: WatchlistUpdateWithWhereUniqueWithoutUserInput | WatchlistUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: WatchlistUpdateManyWithWhereWithoutUserInput | WatchlistUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: WatchlistScalarWhereInput | WatchlistScalarWhereInput[]
  }

  export type AlertRuleUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AlertRuleCreateWithoutUserInput, AlertRuleUncheckedCreateWithoutUserInput> | AlertRuleCreateWithoutUserInput[] | AlertRuleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AlertRuleCreateOrConnectWithoutUserInput | AlertRuleCreateOrConnectWithoutUserInput[]
    upsert?: AlertRuleUpsertWithWhereUniqueWithoutUserInput | AlertRuleUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AlertRuleCreateManyUserInputEnvelope
    set?: AlertRuleWhereUniqueInput | AlertRuleWhereUniqueInput[]
    disconnect?: AlertRuleWhereUniqueInput | AlertRuleWhereUniqueInput[]
    delete?: AlertRuleWhereUniqueInput | AlertRuleWhereUniqueInput[]
    connect?: AlertRuleWhereUniqueInput | AlertRuleWhereUniqueInput[]
    update?: AlertRuleUpdateWithWhereUniqueWithoutUserInput | AlertRuleUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AlertRuleUpdateManyWithWhereWithoutUserInput | AlertRuleUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AlertRuleScalarWhereInput | AlertRuleScalarWhereInput[]
  }

  export type AlertEventUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AlertEventCreateWithoutUserInput, AlertEventUncheckedCreateWithoutUserInput> | AlertEventCreateWithoutUserInput[] | AlertEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AlertEventCreateOrConnectWithoutUserInput | AlertEventCreateOrConnectWithoutUserInput[]
    upsert?: AlertEventUpsertWithWhereUniqueWithoutUserInput | AlertEventUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AlertEventCreateManyUserInputEnvelope
    set?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    disconnect?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    delete?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    connect?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    update?: AlertEventUpdateWithWhereUniqueWithoutUserInput | AlertEventUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AlertEventUpdateManyWithWhereWithoutUserInput | AlertEventUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AlertEventScalarWhereInput | AlertEventScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutWatchlistsInput = {
    create?: XOR<UserCreateWithoutWatchlistsInput, UserUncheckedCreateWithoutWatchlistsInput>
    connectOrCreate?: UserCreateOrConnectWithoutWatchlistsInput
    connect?: UserWhereUniqueInput
  }

  export type WatchlistSymbolCreateNestedManyWithoutWatchlistInput = {
    create?: XOR<WatchlistSymbolCreateWithoutWatchlistInput, WatchlistSymbolUncheckedCreateWithoutWatchlistInput> | WatchlistSymbolCreateWithoutWatchlistInput[] | WatchlistSymbolUncheckedCreateWithoutWatchlistInput[]
    connectOrCreate?: WatchlistSymbolCreateOrConnectWithoutWatchlistInput | WatchlistSymbolCreateOrConnectWithoutWatchlistInput[]
    createMany?: WatchlistSymbolCreateManyWatchlistInputEnvelope
    connect?: WatchlistSymbolWhereUniqueInput | WatchlistSymbolWhereUniqueInput[]
  }

  export type WatchlistSymbolUncheckedCreateNestedManyWithoutWatchlistInput = {
    create?: XOR<WatchlistSymbolCreateWithoutWatchlistInput, WatchlistSymbolUncheckedCreateWithoutWatchlistInput> | WatchlistSymbolCreateWithoutWatchlistInput[] | WatchlistSymbolUncheckedCreateWithoutWatchlistInput[]
    connectOrCreate?: WatchlistSymbolCreateOrConnectWithoutWatchlistInput | WatchlistSymbolCreateOrConnectWithoutWatchlistInput[]
    createMany?: WatchlistSymbolCreateManyWatchlistInputEnvelope
    connect?: WatchlistSymbolWhereUniqueInput | WatchlistSymbolWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutWatchlistsNestedInput = {
    create?: XOR<UserCreateWithoutWatchlistsInput, UserUncheckedCreateWithoutWatchlistsInput>
    connectOrCreate?: UserCreateOrConnectWithoutWatchlistsInput
    upsert?: UserUpsertWithoutWatchlistsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutWatchlistsInput, UserUpdateWithoutWatchlistsInput>, UserUncheckedUpdateWithoutWatchlistsInput>
  }

  export type WatchlistSymbolUpdateManyWithoutWatchlistNestedInput = {
    create?: XOR<WatchlistSymbolCreateWithoutWatchlistInput, WatchlistSymbolUncheckedCreateWithoutWatchlistInput> | WatchlistSymbolCreateWithoutWatchlistInput[] | WatchlistSymbolUncheckedCreateWithoutWatchlistInput[]
    connectOrCreate?: WatchlistSymbolCreateOrConnectWithoutWatchlistInput | WatchlistSymbolCreateOrConnectWithoutWatchlistInput[]
    upsert?: WatchlistSymbolUpsertWithWhereUniqueWithoutWatchlistInput | WatchlistSymbolUpsertWithWhereUniqueWithoutWatchlistInput[]
    createMany?: WatchlistSymbolCreateManyWatchlistInputEnvelope
    set?: WatchlistSymbolWhereUniqueInput | WatchlistSymbolWhereUniqueInput[]
    disconnect?: WatchlistSymbolWhereUniqueInput | WatchlistSymbolWhereUniqueInput[]
    delete?: WatchlistSymbolWhereUniqueInput | WatchlistSymbolWhereUniqueInput[]
    connect?: WatchlistSymbolWhereUniqueInput | WatchlistSymbolWhereUniqueInput[]
    update?: WatchlistSymbolUpdateWithWhereUniqueWithoutWatchlistInput | WatchlistSymbolUpdateWithWhereUniqueWithoutWatchlistInput[]
    updateMany?: WatchlistSymbolUpdateManyWithWhereWithoutWatchlistInput | WatchlistSymbolUpdateManyWithWhereWithoutWatchlistInput[]
    deleteMany?: WatchlistSymbolScalarWhereInput | WatchlistSymbolScalarWhereInput[]
  }

  export type WatchlistSymbolUncheckedUpdateManyWithoutWatchlistNestedInput = {
    create?: XOR<WatchlistSymbolCreateWithoutWatchlistInput, WatchlistSymbolUncheckedCreateWithoutWatchlistInput> | WatchlistSymbolCreateWithoutWatchlistInput[] | WatchlistSymbolUncheckedCreateWithoutWatchlistInput[]
    connectOrCreate?: WatchlistSymbolCreateOrConnectWithoutWatchlistInput | WatchlistSymbolCreateOrConnectWithoutWatchlistInput[]
    upsert?: WatchlistSymbolUpsertWithWhereUniqueWithoutWatchlistInput | WatchlistSymbolUpsertWithWhereUniqueWithoutWatchlistInput[]
    createMany?: WatchlistSymbolCreateManyWatchlistInputEnvelope
    set?: WatchlistSymbolWhereUniqueInput | WatchlistSymbolWhereUniqueInput[]
    disconnect?: WatchlistSymbolWhereUniqueInput | WatchlistSymbolWhereUniqueInput[]
    delete?: WatchlistSymbolWhereUniqueInput | WatchlistSymbolWhereUniqueInput[]
    connect?: WatchlistSymbolWhereUniqueInput | WatchlistSymbolWhereUniqueInput[]
    update?: WatchlistSymbolUpdateWithWhereUniqueWithoutWatchlistInput | WatchlistSymbolUpdateWithWhereUniqueWithoutWatchlistInput[]
    updateMany?: WatchlistSymbolUpdateManyWithWhereWithoutWatchlistInput | WatchlistSymbolUpdateManyWithWhereWithoutWatchlistInput[]
    deleteMany?: WatchlistSymbolScalarWhereInput | WatchlistSymbolScalarWhereInput[]
  }

  export type WatchlistCreateNestedOneWithoutSymbolsInput = {
    create?: XOR<WatchlistCreateWithoutSymbolsInput, WatchlistUncheckedCreateWithoutSymbolsInput>
    connectOrCreate?: WatchlistCreateOrConnectWithoutSymbolsInput
    connect?: WatchlistWhereUniqueInput
  }

  export type WatchlistUpdateOneRequiredWithoutSymbolsNestedInput = {
    create?: XOR<WatchlistCreateWithoutSymbolsInput, WatchlistUncheckedCreateWithoutSymbolsInput>
    connectOrCreate?: WatchlistCreateOrConnectWithoutSymbolsInput
    upsert?: WatchlistUpsertWithoutSymbolsInput
    connect?: WatchlistWhereUniqueInput
    update?: XOR<XOR<WatchlistUpdateToOneWithWhereWithoutSymbolsInput, WatchlistUpdateWithoutSymbolsInput>, WatchlistUncheckedUpdateWithoutSymbolsInput>
  }

  export type SectorStockCreateNestedManyWithoutSectorInput = {
    create?: XOR<SectorStockCreateWithoutSectorInput, SectorStockUncheckedCreateWithoutSectorInput> | SectorStockCreateWithoutSectorInput[] | SectorStockUncheckedCreateWithoutSectorInput[]
    connectOrCreate?: SectorStockCreateOrConnectWithoutSectorInput | SectorStockCreateOrConnectWithoutSectorInput[]
    createMany?: SectorStockCreateManySectorInputEnvelope
    connect?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
  }

  export type SignalCreateNestedManyWithoutSectorInput = {
    create?: XOR<SignalCreateWithoutSectorInput, SignalUncheckedCreateWithoutSectorInput> | SignalCreateWithoutSectorInput[] | SignalUncheckedCreateWithoutSectorInput[]
    connectOrCreate?: SignalCreateOrConnectWithoutSectorInput | SignalCreateOrConnectWithoutSectorInput[]
    createMany?: SignalCreateManySectorInputEnvelope
    connect?: SignalWhereUniqueInput | SignalWhereUniqueInput[]
  }

  export type SectorStockUncheckedCreateNestedManyWithoutSectorInput = {
    create?: XOR<SectorStockCreateWithoutSectorInput, SectorStockUncheckedCreateWithoutSectorInput> | SectorStockCreateWithoutSectorInput[] | SectorStockUncheckedCreateWithoutSectorInput[]
    connectOrCreate?: SectorStockCreateOrConnectWithoutSectorInput | SectorStockCreateOrConnectWithoutSectorInput[]
    createMany?: SectorStockCreateManySectorInputEnvelope
    connect?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
  }

  export type SignalUncheckedCreateNestedManyWithoutSectorInput = {
    create?: XOR<SignalCreateWithoutSectorInput, SignalUncheckedCreateWithoutSectorInput> | SignalCreateWithoutSectorInput[] | SignalUncheckedCreateWithoutSectorInput[]
    connectOrCreate?: SignalCreateOrConnectWithoutSectorInput | SignalCreateOrConnectWithoutSectorInput[]
    createMany?: SignalCreateManySectorInputEnvelope
    connect?: SignalWhereUniqueInput | SignalWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type SectorStockUpdateManyWithoutSectorNestedInput = {
    create?: XOR<SectorStockCreateWithoutSectorInput, SectorStockUncheckedCreateWithoutSectorInput> | SectorStockCreateWithoutSectorInput[] | SectorStockUncheckedCreateWithoutSectorInput[]
    connectOrCreate?: SectorStockCreateOrConnectWithoutSectorInput | SectorStockCreateOrConnectWithoutSectorInput[]
    upsert?: SectorStockUpsertWithWhereUniqueWithoutSectorInput | SectorStockUpsertWithWhereUniqueWithoutSectorInput[]
    createMany?: SectorStockCreateManySectorInputEnvelope
    set?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    disconnect?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    delete?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    connect?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    update?: SectorStockUpdateWithWhereUniqueWithoutSectorInput | SectorStockUpdateWithWhereUniqueWithoutSectorInput[]
    updateMany?: SectorStockUpdateManyWithWhereWithoutSectorInput | SectorStockUpdateManyWithWhereWithoutSectorInput[]
    deleteMany?: SectorStockScalarWhereInput | SectorStockScalarWhereInput[]
  }

  export type SignalUpdateManyWithoutSectorNestedInput = {
    create?: XOR<SignalCreateWithoutSectorInput, SignalUncheckedCreateWithoutSectorInput> | SignalCreateWithoutSectorInput[] | SignalUncheckedCreateWithoutSectorInput[]
    connectOrCreate?: SignalCreateOrConnectWithoutSectorInput | SignalCreateOrConnectWithoutSectorInput[]
    upsert?: SignalUpsertWithWhereUniqueWithoutSectorInput | SignalUpsertWithWhereUniqueWithoutSectorInput[]
    createMany?: SignalCreateManySectorInputEnvelope
    set?: SignalWhereUniqueInput | SignalWhereUniqueInput[]
    disconnect?: SignalWhereUniqueInput | SignalWhereUniqueInput[]
    delete?: SignalWhereUniqueInput | SignalWhereUniqueInput[]
    connect?: SignalWhereUniqueInput | SignalWhereUniqueInput[]
    update?: SignalUpdateWithWhereUniqueWithoutSectorInput | SignalUpdateWithWhereUniqueWithoutSectorInput[]
    updateMany?: SignalUpdateManyWithWhereWithoutSectorInput | SignalUpdateManyWithWhereWithoutSectorInput[]
    deleteMany?: SignalScalarWhereInput | SignalScalarWhereInput[]
  }

  export type SectorStockUncheckedUpdateManyWithoutSectorNestedInput = {
    create?: XOR<SectorStockCreateWithoutSectorInput, SectorStockUncheckedCreateWithoutSectorInput> | SectorStockCreateWithoutSectorInput[] | SectorStockUncheckedCreateWithoutSectorInput[]
    connectOrCreate?: SectorStockCreateOrConnectWithoutSectorInput | SectorStockCreateOrConnectWithoutSectorInput[]
    upsert?: SectorStockUpsertWithWhereUniqueWithoutSectorInput | SectorStockUpsertWithWhereUniqueWithoutSectorInput[]
    createMany?: SectorStockCreateManySectorInputEnvelope
    set?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    disconnect?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    delete?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    connect?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    update?: SectorStockUpdateWithWhereUniqueWithoutSectorInput | SectorStockUpdateWithWhereUniqueWithoutSectorInput[]
    updateMany?: SectorStockUpdateManyWithWhereWithoutSectorInput | SectorStockUpdateManyWithWhereWithoutSectorInput[]
    deleteMany?: SectorStockScalarWhereInput | SectorStockScalarWhereInput[]
  }

  export type SignalUncheckedUpdateManyWithoutSectorNestedInput = {
    create?: XOR<SignalCreateWithoutSectorInput, SignalUncheckedCreateWithoutSectorInput> | SignalCreateWithoutSectorInput[] | SignalUncheckedCreateWithoutSectorInput[]
    connectOrCreate?: SignalCreateOrConnectWithoutSectorInput | SignalCreateOrConnectWithoutSectorInput[]
    upsert?: SignalUpsertWithWhereUniqueWithoutSectorInput | SignalUpsertWithWhereUniqueWithoutSectorInput[]
    createMany?: SignalCreateManySectorInputEnvelope
    set?: SignalWhereUniqueInput | SignalWhereUniqueInput[]
    disconnect?: SignalWhereUniqueInput | SignalWhereUniqueInput[]
    delete?: SignalWhereUniqueInput | SignalWhereUniqueInput[]
    connect?: SignalWhereUniqueInput | SignalWhereUniqueInput[]
    update?: SignalUpdateWithWhereUniqueWithoutSectorInput | SignalUpdateWithWhereUniqueWithoutSectorInput[]
    updateMany?: SignalUpdateManyWithWhereWithoutSectorInput | SignalUpdateManyWithWhereWithoutSectorInput[]
    deleteMany?: SignalScalarWhereInput | SignalScalarWhereInput[]
  }

  export type SectorStockCreateNestedManyWithoutStockInput = {
    create?: XOR<SectorStockCreateWithoutStockInput, SectorStockUncheckedCreateWithoutStockInput> | SectorStockCreateWithoutStockInput[] | SectorStockUncheckedCreateWithoutStockInput[]
    connectOrCreate?: SectorStockCreateOrConnectWithoutStockInput | SectorStockCreateOrConnectWithoutStockInput[]
    createMany?: SectorStockCreateManyStockInputEnvelope
    connect?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
  }

  export type SectorStockUncheckedCreateNestedManyWithoutStockInput = {
    create?: XOR<SectorStockCreateWithoutStockInput, SectorStockUncheckedCreateWithoutStockInput> | SectorStockCreateWithoutStockInput[] | SectorStockUncheckedCreateWithoutStockInput[]
    connectOrCreate?: SectorStockCreateOrConnectWithoutStockInput | SectorStockCreateOrConnectWithoutStockInput[]
    createMany?: SectorStockCreateManyStockInputEnvelope
    connect?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
  }

  export type SectorStockUpdateManyWithoutStockNestedInput = {
    create?: XOR<SectorStockCreateWithoutStockInput, SectorStockUncheckedCreateWithoutStockInput> | SectorStockCreateWithoutStockInput[] | SectorStockUncheckedCreateWithoutStockInput[]
    connectOrCreate?: SectorStockCreateOrConnectWithoutStockInput | SectorStockCreateOrConnectWithoutStockInput[]
    upsert?: SectorStockUpsertWithWhereUniqueWithoutStockInput | SectorStockUpsertWithWhereUniqueWithoutStockInput[]
    createMany?: SectorStockCreateManyStockInputEnvelope
    set?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    disconnect?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    delete?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    connect?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    update?: SectorStockUpdateWithWhereUniqueWithoutStockInput | SectorStockUpdateWithWhereUniqueWithoutStockInput[]
    updateMany?: SectorStockUpdateManyWithWhereWithoutStockInput | SectorStockUpdateManyWithWhereWithoutStockInput[]
    deleteMany?: SectorStockScalarWhereInput | SectorStockScalarWhereInput[]
  }

  export type SectorStockUncheckedUpdateManyWithoutStockNestedInput = {
    create?: XOR<SectorStockCreateWithoutStockInput, SectorStockUncheckedCreateWithoutStockInput> | SectorStockCreateWithoutStockInput[] | SectorStockUncheckedCreateWithoutStockInput[]
    connectOrCreate?: SectorStockCreateOrConnectWithoutStockInput | SectorStockCreateOrConnectWithoutStockInput[]
    upsert?: SectorStockUpsertWithWhereUniqueWithoutStockInput | SectorStockUpsertWithWhereUniqueWithoutStockInput[]
    createMany?: SectorStockCreateManyStockInputEnvelope
    set?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    disconnect?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    delete?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    connect?: SectorStockWhereUniqueInput | SectorStockWhereUniqueInput[]
    update?: SectorStockUpdateWithWhereUniqueWithoutStockInput | SectorStockUpdateWithWhereUniqueWithoutStockInput[]
    updateMany?: SectorStockUpdateManyWithWhereWithoutStockInput | SectorStockUpdateManyWithWhereWithoutStockInput[]
    deleteMany?: SectorStockScalarWhereInput | SectorStockScalarWhereInput[]
  }

  export type SectorCreateNestedOneWithoutStocksInput = {
    create?: XOR<SectorCreateWithoutStocksInput, SectorUncheckedCreateWithoutStocksInput>
    connectOrCreate?: SectorCreateOrConnectWithoutStocksInput
    connect?: SectorWhereUniqueInput
  }

  export type StockCreateNestedOneWithoutSectorsInput = {
    create?: XOR<StockCreateWithoutSectorsInput, StockUncheckedCreateWithoutSectorsInput>
    connectOrCreate?: StockCreateOrConnectWithoutSectorsInput
    connect?: StockWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SectorUpdateOneRequiredWithoutStocksNestedInput = {
    create?: XOR<SectorCreateWithoutStocksInput, SectorUncheckedCreateWithoutStocksInput>
    connectOrCreate?: SectorCreateOrConnectWithoutStocksInput
    upsert?: SectorUpsertWithoutStocksInput
    connect?: SectorWhereUniqueInput
    update?: XOR<XOR<SectorUpdateToOneWithWhereWithoutStocksInput, SectorUpdateWithoutStocksInput>, SectorUncheckedUpdateWithoutStocksInput>
  }

  export type StockUpdateOneRequiredWithoutSectorsNestedInput = {
    create?: XOR<StockCreateWithoutSectorsInput, StockUncheckedCreateWithoutSectorsInput>
    connectOrCreate?: StockCreateOrConnectWithoutSectorsInput
    upsert?: StockUpsertWithoutSectorsInput
    connect?: StockWhereUniqueInput
    update?: XOR<XOR<StockUpdateToOneWithWhereWithoutSectorsInput, StockUpdateWithoutSectorsInput>, StockUncheckedUpdateWithoutSectorsInput>
  }

  export type SectorCreateNestedOneWithoutSignalsInput = {
    create?: XOR<SectorCreateWithoutSignalsInput, SectorUncheckedCreateWithoutSignalsInput>
    connectOrCreate?: SectorCreateOrConnectWithoutSignalsInput
    connect?: SectorWhereUniqueInput
  }

  export type AlertEventCreateNestedManyWithoutSignalInput = {
    create?: XOR<AlertEventCreateWithoutSignalInput, AlertEventUncheckedCreateWithoutSignalInput> | AlertEventCreateWithoutSignalInput[] | AlertEventUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: AlertEventCreateOrConnectWithoutSignalInput | AlertEventCreateOrConnectWithoutSignalInput[]
    createMany?: AlertEventCreateManySignalInputEnvelope
    connect?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
  }

  export type SignalOutcomeCreateNestedOneWithoutSignalInput = {
    create?: XOR<SignalOutcomeCreateWithoutSignalInput, SignalOutcomeUncheckedCreateWithoutSignalInput>
    connectOrCreate?: SignalOutcomeCreateOrConnectWithoutSignalInput
    connect?: SignalOutcomeWhereUniqueInput
  }

  export type AlertEventUncheckedCreateNestedManyWithoutSignalInput = {
    create?: XOR<AlertEventCreateWithoutSignalInput, AlertEventUncheckedCreateWithoutSignalInput> | AlertEventCreateWithoutSignalInput[] | AlertEventUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: AlertEventCreateOrConnectWithoutSignalInput | AlertEventCreateOrConnectWithoutSignalInput[]
    createMany?: AlertEventCreateManySignalInputEnvelope
    connect?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
  }

  export type SignalOutcomeUncheckedCreateNestedOneWithoutSignalInput = {
    create?: XOR<SignalOutcomeCreateWithoutSignalInput, SignalOutcomeUncheckedCreateWithoutSignalInput>
    connectOrCreate?: SignalOutcomeCreateOrConnectWithoutSignalInput
    connect?: SignalOutcomeWhereUniqueInput
  }

  export type EnumSignalTypeFieldUpdateOperationsInput = {
    set?: $Enums.SignalType
  }

  export type EnumSignalSeverityFieldUpdateOperationsInput = {
    set?: $Enums.SignalSeverity
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SectorUpdateOneWithoutSignalsNestedInput = {
    create?: XOR<SectorCreateWithoutSignalsInput, SectorUncheckedCreateWithoutSignalsInput>
    connectOrCreate?: SectorCreateOrConnectWithoutSignalsInput
    upsert?: SectorUpsertWithoutSignalsInput
    disconnect?: SectorWhereInput | boolean
    delete?: SectorWhereInput | boolean
    connect?: SectorWhereUniqueInput
    update?: XOR<XOR<SectorUpdateToOneWithWhereWithoutSignalsInput, SectorUpdateWithoutSignalsInput>, SectorUncheckedUpdateWithoutSignalsInput>
  }

  export type AlertEventUpdateManyWithoutSignalNestedInput = {
    create?: XOR<AlertEventCreateWithoutSignalInput, AlertEventUncheckedCreateWithoutSignalInput> | AlertEventCreateWithoutSignalInput[] | AlertEventUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: AlertEventCreateOrConnectWithoutSignalInput | AlertEventCreateOrConnectWithoutSignalInput[]
    upsert?: AlertEventUpsertWithWhereUniqueWithoutSignalInput | AlertEventUpsertWithWhereUniqueWithoutSignalInput[]
    createMany?: AlertEventCreateManySignalInputEnvelope
    set?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    disconnect?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    delete?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    connect?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    update?: AlertEventUpdateWithWhereUniqueWithoutSignalInput | AlertEventUpdateWithWhereUniqueWithoutSignalInput[]
    updateMany?: AlertEventUpdateManyWithWhereWithoutSignalInput | AlertEventUpdateManyWithWhereWithoutSignalInput[]
    deleteMany?: AlertEventScalarWhereInput | AlertEventScalarWhereInput[]
  }

  export type SignalOutcomeUpdateOneWithoutSignalNestedInput = {
    create?: XOR<SignalOutcomeCreateWithoutSignalInput, SignalOutcomeUncheckedCreateWithoutSignalInput>
    connectOrCreate?: SignalOutcomeCreateOrConnectWithoutSignalInput
    upsert?: SignalOutcomeUpsertWithoutSignalInput
    disconnect?: SignalOutcomeWhereInput | boolean
    delete?: SignalOutcomeWhereInput | boolean
    connect?: SignalOutcomeWhereUniqueInput
    update?: XOR<XOR<SignalOutcomeUpdateToOneWithWhereWithoutSignalInput, SignalOutcomeUpdateWithoutSignalInput>, SignalOutcomeUncheckedUpdateWithoutSignalInput>
  }

  export type AlertEventUncheckedUpdateManyWithoutSignalNestedInput = {
    create?: XOR<AlertEventCreateWithoutSignalInput, AlertEventUncheckedCreateWithoutSignalInput> | AlertEventCreateWithoutSignalInput[] | AlertEventUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: AlertEventCreateOrConnectWithoutSignalInput | AlertEventCreateOrConnectWithoutSignalInput[]
    upsert?: AlertEventUpsertWithWhereUniqueWithoutSignalInput | AlertEventUpsertWithWhereUniqueWithoutSignalInput[]
    createMany?: AlertEventCreateManySignalInputEnvelope
    set?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    disconnect?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    delete?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    connect?: AlertEventWhereUniqueInput | AlertEventWhereUniqueInput[]
    update?: AlertEventUpdateWithWhereUniqueWithoutSignalInput | AlertEventUpdateWithWhereUniqueWithoutSignalInput[]
    updateMany?: AlertEventUpdateManyWithWhereWithoutSignalInput | AlertEventUpdateManyWithWhereWithoutSignalInput[]
    deleteMany?: AlertEventScalarWhereInput | AlertEventScalarWhereInput[]
  }

  export type SignalOutcomeUncheckedUpdateOneWithoutSignalNestedInput = {
    create?: XOR<SignalOutcomeCreateWithoutSignalInput, SignalOutcomeUncheckedCreateWithoutSignalInput>
    connectOrCreate?: SignalOutcomeCreateOrConnectWithoutSignalInput
    upsert?: SignalOutcomeUpsertWithoutSignalInput
    disconnect?: SignalOutcomeWhereInput | boolean
    delete?: SignalOutcomeWhereInput | boolean
    connect?: SignalOutcomeWhereUniqueInput
    update?: XOR<XOR<SignalOutcomeUpdateToOneWithWhereWithoutSignalInput, SignalOutcomeUpdateWithoutSignalInput>, SignalOutcomeUncheckedUpdateWithoutSignalInput>
  }

  export type SignalCreateNestedOneWithoutOutcomeInput = {
    create?: XOR<SignalCreateWithoutOutcomeInput, SignalUncheckedCreateWithoutOutcomeInput>
    connectOrCreate?: SignalCreateOrConnectWithoutOutcomeInput
    connect?: SignalWhereUniqueInput
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type SignalUpdateOneRequiredWithoutOutcomeNestedInput = {
    create?: XOR<SignalCreateWithoutOutcomeInput, SignalUncheckedCreateWithoutOutcomeInput>
    connectOrCreate?: SignalCreateOrConnectWithoutOutcomeInput
    upsert?: SignalUpsertWithoutOutcomeInput
    connect?: SignalWhereUniqueInput
    update?: XOR<XOR<SignalUpdateToOneWithWhereWithoutOutcomeInput, SignalUpdateWithoutOutcomeInput>, SignalUncheckedUpdateWithoutOutcomeInput>
  }

  export type UserCreateNestedOneWithoutAlertRulesInput = {
    create?: XOR<UserCreateWithoutAlertRulesInput, UserUncheckedCreateWithoutAlertRulesInput>
    connectOrCreate?: UserCreateOrConnectWithoutAlertRulesInput
    connect?: UserWhereUniqueInput
  }

  export type NullableEnumSignalTypeFieldUpdateOperationsInput = {
    set?: $Enums.SignalType | null
  }

  export type UserUpdateOneRequiredWithoutAlertRulesNestedInput = {
    create?: XOR<UserCreateWithoutAlertRulesInput, UserUncheckedCreateWithoutAlertRulesInput>
    connectOrCreate?: UserCreateOrConnectWithoutAlertRulesInput
    upsert?: UserUpsertWithoutAlertRulesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAlertRulesInput, UserUpdateWithoutAlertRulesInput>, UserUncheckedUpdateWithoutAlertRulesInput>
  }

  export type UserCreateNestedOneWithoutAlertEventsInput = {
    create?: XOR<UserCreateWithoutAlertEventsInput, UserUncheckedCreateWithoutAlertEventsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAlertEventsInput
    connect?: UserWhereUniqueInput
  }

  export type SignalCreateNestedOneWithoutAlertEventsInput = {
    create?: XOR<SignalCreateWithoutAlertEventsInput, SignalUncheckedCreateWithoutAlertEventsInput>
    connectOrCreate?: SignalCreateOrConnectWithoutAlertEventsInput
    connect?: SignalWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutAlertEventsNestedInput = {
    create?: XOR<UserCreateWithoutAlertEventsInput, UserUncheckedCreateWithoutAlertEventsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAlertEventsInput
    upsert?: UserUpsertWithoutAlertEventsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAlertEventsInput, UserUpdateWithoutAlertEventsInput>, UserUncheckedUpdateWithoutAlertEventsInput>
  }

  export type SignalUpdateOneRequiredWithoutAlertEventsNestedInput = {
    create?: XOR<SignalCreateWithoutAlertEventsInput, SignalUncheckedCreateWithoutAlertEventsInput>
    connectOrCreate?: SignalCreateOrConnectWithoutAlertEventsInput
    upsert?: SignalUpsertWithoutAlertEventsInput
    connect?: SignalWhereUniqueInput
    update?: XOR<XOR<SignalUpdateToOneWithWhereWithoutAlertEventsInput, SignalUpdateWithoutAlertEventsInput>, SignalUncheckedUpdateWithoutAlertEventsInput>
  }

  export type NewsSymbolCreateNestedManyWithoutNewsArticleInput = {
    create?: XOR<NewsSymbolCreateWithoutNewsArticleInput, NewsSymbolUncheckedCreateWithoutNewsArticleInput> | NewsSymbolCreateWithoutNewsArticleInput[] | NewsSymbolUncheckedCreateWithoutNewsArticleInput[]
    connectOrCreate?: NewsSymbolCreateOrConnectWithoutNewsArticleInput | NewsSymbolCreateOrConnectWithoutNewsArticleInput[]
    createMany?: NewsSymbolCreateManyNewsArticleInputEnvelope
    connect?: NewsSymbolWhereUniqueInput | NewsSymbolWhereUniqueInput[]
  }

  export type NewsSymbolUncheckedCreateNestedManyWithoutNewsArticleInput = {
    create?: XOR<NewsSymbolCreateWithoutNewsArticleInput, NewsSymbolUncheckedCreateWithoutNewsArticleInput> | NewsSymbolCreateWithoutNewsArticleInput[] | NewsSymbolUncheckedCreateWithoutNewsArticleInput[]
    connectOrCreate?: NewsSymbolCreateOrConnectWithoutNewsArticleInput | NewsSymbolCreateOrConnectWithoutNewsArticleInput[]
    createMany?: NewsSymbolCreateManyNewsArticleInputEnvelope
    connect?: NewsSymbolWhereUniqueInput | NewsSymbolWhereUniqueInput[]
  }

  export type NewsSymbolUpdateManyWithoutNewsArticleNestedInput = {
    create?: XOR<NewsSymbolCreateWithoutNewsArticleInput, NewsSymbolUncheckedCreateWithoutNewsArticleInput> | NewsSymbolCreateWithoutNewsArticleInput[] | NewsSymbolUncheckedCreateWithoutNewsArticleInput[]
    connectOrCreate?: NewsSymbolCreateOrConnectWithoutNewsArticleInput | NewsSymbolCreateOrConnectWithoutNewsArticleInput[]
    upsert?: NewsSymbolUpsertWithWhereUniqueWithoutNewsArticleInput | NewsSymbolUpsertWithWhereUniqueWithoutNewsArticleInput[]
    createMany?: NewsSymbolCreateManyNewsArticleInputEnvelope
    set?: NewsSymbolWhereUniqueInput | NewsSymbolWhereUniqueInput[]
    disconnect?: NewsSymbolWhereUniqueInput | NewsSymbolWhereUniqueInput[]
    delete?: NewsSymbolWhereUniqueInput | NewsSymbolWhereUniqueInput[]
    connect?: NewsSymbolWhereUniqueInput | NewsSymbolWhereUniqueInput[]
    update?: NewsSymbolUpdateWithWhereUniqueWithoutNewsArticleInput | NewsSymbolUpdateWithWhereUniqueWithoutNewsArticleInput[]
    updateMany?: NewsSymbolUpdateManyWithWhereWithoutNewsArticleInput | NewsSymbolUpdateManyWithWhereWithoutNewsArticleInput[]
    deleteMany?: NewsSymbolScalarWhereInput | NewsSymbolScalarWhereInput[]
  }

  export type NewsSymbolUncheckedUpdateManyWithoutNewsArticleNestedInput = {
    create?: XOR<NewsSymbolCreateWithoutNewsArticleInput, NewsSymbolUncheckedCreateWithoutNewsArticleInput> | NewsSymbolCreateWithoutNewsArticleInput[] | NewsSymbolUncheckedCreateWithoutNewsArticleInput[]
    connectOrCreate?: NewsSymbolCreateOrConnectWithoutNewsArticleInput | NewsSymbolCreateOrConnectWithoutNewsArticleInput[]
    upsert?: NewsSymbolUpsertWithWhereUniqueWithoutNewsArticleInput | NewsSymbolUpsertWithWhereUniqueWithoutNewsArticleInput[]
    createMany?: NewsSymbolCreateManyNewsArticleInputEnvelope
    set?: NewsSymbolWhereUniqueInput | NewsSymbolWhereUniqueInput[]
    disconnect?: NewsSymbolWhereUniqueInput | NewsSymbolWhereUniqueInput[]
    delete?: NewsSymbolWhereUniqueInput | NewsSymbolWhereUniqueInput[]
    connect?: NewsSymbolWhereUniqueInput | NewsSymbolWhereUniqueInput[]
    update?: NewsSymbolUpdateWithWhereUniqueWithoutNewsArticleInput | NewsSymbolUpdateWithWhereUniqueWithoutNewsArticleInput[]
    updateMany?: NewsSymbolUpdateManyWithWhereWithoutNewsArticleInput | NewsSymbolUpdateManyWithWhereWithoutNewsArticleInput[]
    deleteMany?: NewsSymbolScalarWhereInput | NewsSymbolScalarWhereInput[]
  }

  export type NewsArticleCreateNestedOneWithoutSymbolsInput = {
    create?: XOR<NewsArticleCreateWithoutSymbolsInput, NewsArticleUncheckedCreateWithoutSymbolsInput>
    connectOrCreate?: NewsArticleCreateOrConnectWithoutSymbolsInput
    connect?: NewsArticleWhereUniqueInput
  }

  export type NewsArticleUpdateOneRequiredWithoutSymbolsNestedInput = {
    create?: XOR<NewsArticleCreateWithoutSymbolsInput, NewsArticleUncheckedCreateWithoutSymbolsInput>
    connectOrCreate?: NewsArticleCreateOrConnectWithoutSymbolsInput
    upsert?: NewsArticleUpsertWithoutSymbolsInput
    connect?: NewsArticleWhereUniqueInput
    update?: XOR<XOR<NewsArticleUpdateToOneWithWhereWithoutSymbolsInput, NewsArticleUpdateWithoutSymbolsInput>, NewsArticleUncheckedUpdateWithoutSymbolsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedEnumSignalTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalType | EnumSignalTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSignalTypeFilter<$PrismaModel> | $Enums.SignalType
  }

  export type NestedEnumSignalSeverityFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalSeverity | EnumSignalSeverityFieldRefInput<$PrismaModel>
    in?: $Enums.SignalSeverity[] | ListEnumSignalSeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.SignalSeverity[] | ListEnumSignalSeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumSignalSeverityFilter<$PrismaModel> | $Enums.SignalSeverity
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumSignalTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalType | EnumSignalTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSignalTypeWithAggregatesFilter<$PrismaModel> | $Enums.SignalType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSignalTypeFilter<$PrismaModel>
    _max?: NestedEnumSignalTypeFilter<$PrismaModel>
  }

  export type NestedEnumSignalSeverityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalSeverity | EnumSignalSeverityFieldRefInput<$PrismaModel>
    in?: $Enums.SignalSeverity[] | ListEnumSignalSeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.SignalSeverity[] | ListEnumSignalSeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumSignalSeverityWithAggregatesFilter<$PrismaModel> | $Enums.SignalSeverity
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSignalSeverityFilter<$PrismaModel>
    _max?: NestedEnumSignalSeverityFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumSignalTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalType | EnumSignalTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumSignalTypeNullableFilter<$PrismaModel> | $Enums.SignalType | null
  }

  export type NestedEnumSignalTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalType | EnumSignalTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.SignalType[] | ListEnumSignalTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumSignalTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.SignalType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumSignalTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumSignalTypeNullableFilter<$PrismaModel>
  }

  export type WatchlistCreateWithoutUserInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    symbols?: WatchlistSymbolCreateNestedManyWithoutWatchlistInput
  }

  export type WatchlistUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    symbols?: WatchlistSymbolUncheckedCreateNestedManyWithoutWatchlistInput
  }

  export type WatchlistCreateOrConnectWithoutUserInput = {
    where: WatchlistWhereUniqueInput
    create: XOR<WatchlistCreateWithoutUserInput, WatchlistUncheckedCreateWithoutUserInput>
  }

  export type WatchlistCreateManyUserInputEnvelope = {
    data: WatchlistCreateManyUserInput | WatchlistCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AlertRuleCreateWithoutUserInput = {
    id?: string
    type?: $Enums.SignalType | null
    sectorId?: string | null
    minSeverity?: $Enums.SignalSeverity
    threshold?: number
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AlertRuleUncheckedCreateWithoutUserInput = {
    id?: string
    type?: $Enums.SignalType | null
    sectorId?: string | null
    minSeverity?: $Enums.SignalSeverity
    threshold?: number
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AlertRuleCreateOrConnectWithoutUserInput = {
    where: AlertRuleWhereUniqueInput
    create: XOR<AlertRuleCreateWithoutUserInput, AlertRuleUncheckedCreateWithoutUserInput>
  }

  export type AlertRuleCreateManyUserInputEnvelope = {
    data: AlertRuleCreateManyUserInput | AlertRuleCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AlertEventCreateWithoutUserInput = {
    id?: string
    delivered?: boolean
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    signal: SignalCreateNestedOneWithoutAlertEventsInput
  }

  export type AlertEventUncheckedCreateWithoutUserInput = {
    id?: string
    signalId: string
    delivered?: boolean
    deliveredAt?: Date | string | null
    createdAt?: Date | string
  }

  export type AlertEventCreateOrConnectWithoutUserInput = {
    where: AlertEventWhereUniqueInput
    create: XOR<AlertEventCreateWithoutUserInput, AlertEventUncheckedCreateWithoutUserInput>
  }

  export type AlertEventCreateManyUserInputEnvelope = {
    data: AlertEventCreateManyUserInput | AlertEventCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type WatchlistUpsertWithWhereUniqueWithoutUserInput = {
    where: WatchlistWhereUniqueInput
    update: XOR<WatchlistUpdateWithoutUserInput, WatchlistUncheckedUpdateWithoutUserInput>
    create: XOR<WatchlistCreateWithoutUserInput, WatchlistUncheckedCreateWithoutUserInput>
  }

  export type WatchlistUpdateWithWhereUniqueWithoutUserInput = {
    where: WatchlistWhereUniqueInput
    data: XOR<WatchlistUpdateWithoutUserInput, WatchlistUncheckedUpdateWithoutUserInput>
  }

  export type WatchlistUpdateManyWithWhereWithoutUserInput = {
    where: WatchlistScalarWhereInput
    data: XOR<WatchlistUpdateManyMutationInput, WatchlistUncheckedUpdateManyWithoutUserInput>
  }

  export type WatchlistScalarWhereInput = {
    AND?: WatchlistScalarWhereInput | WatchlistScalarWhereInput[]
    OR?: WatchlistScalarWhereInput[]
    NOT?: WatchlistScalarWhereInput | WatchlistScalarWhereInput[]
    id?: StringFilter<"Watchlist"> | string
    userId?: StringFilter<"Watchlist"> | string
    name?: StringFilter<"Watchlist"> | string
    createdAt?: DateTimeFilter<"Watchlist"> | Date | string
    updatedAt?: DateTimeFilter<"Watchlist"> | Date | string
  }

  export type AlertRuleUpsertWithWhereUniqueWithoutUserInput = {
    where: AlertRuleWhereUniqueInput
    update: XOR<AlertRuleUpdateWithoutUserInput, AlertRuleUncheckedUpdateWithoutUserInput>
    create: XOR<AlertRuleCreateWithoutUserInput, AlertRuleUncheckedCreateWithoutUserInput>
  }

  export type AlertRuleUpdateWithWhereUniqueWithoutUserInput = {
    where: AlertRuleWhereUniqueInput
    data: XOR<AlertRuleUpdateWithoutUserInput, AlertRuleUncheckedUpdateWithoutUserInput>
  }

  export type AlertRuleUpdateManyWithWhereWithoutUserInput = {
    where: AlertRuleScalarWhereInput
    data: XOR<AlertRuleUpdateManyMutationInput, AlertRuleUncheckedUpdateManyWithoutUserInput>
  }

  export type AlertRuleScalarWhereInput = {
    AND?: AlertRuleScalarWhereInput | AlertRuleScalarWhereInput[]
    OR?: AlertRuleScalarWhereInput[]
    NOT?: AlertRuleScalarWhereInput | AlertRuleScalarWhereInput[]
    id?: StringFilter<"AlertRule"> | string
    userId?: StringFilter<"AlertRule"> | string
    type?: EnumSignalTypeNullableFilter<"AlertRule"> | $Enums.SignalType | null
    sectorId?: StringNullableFilter<"AlertRule"> | string | null
    minSeverity?: EnumSignalSeverityFilter<"AlertRule"> | $Enums.SignalSeverity
    threshold?: FloatFilter<"AlertRule"> | number
    enabled?: BoolFilter<"AlertRule"> | boolean
    createdAt?: DateTimeFilter<"AlertRule"> | Date | string
    updatedAt?: DateTimeFilter<"AlertRule"> | Date | string
  }

  export type AlertEventUpsertWithWhereUniqueWithoutUserInput = {
    where: AlertEventWhereUniqueInput
    update: XOR<AlertEventUpdateWithoutUserInput, AlertEventUncheckedUpdateWithoutUserInput>
    create: XOR<AlertEventCreateWithoutUserInput, AlertEventUncheckedCreateWithoutUserInput>
  }

  export type AlertEventUpdateWithWhereUniqueWithoutUserInput = {
    where: AlertEventWhereUniqueInput
    data: XOR<AlertEventUpdateWithoutUserInput, AlertEventUncheckedUpdateWithoutUserInput>
  }

  export type AlertEventUpdateManyWithWhereWithoutUserInput = {
    where: AlertEventScalarWhereInput
    data: XOR<AlertEventUpdateManyMutationInput, AlertEventUncheckedUpdateManyWithoutUserInput>
  }

  export type AlertEventScalarWhereInput = {
    AND?: AlertEventScalarWhereInput | AlertEventScalarWhereInput[]
    OR?: AlertEventScalarWhereInput[]
    NOT?: AlertEventScalarWhereInput | AlertEventScalarWhereInput[]
    id?: StringFilter<"AlertEvent"> | string
    userId?: StringFilter<"AlertEvent"> | string
    signalId?: StringFilter<"AlertEvent"> | string
    delivered?: BoolFilter<"AlertEvent"> | boolean
    deliveredAt?: DateTimeNullableFilter<"AlertEvent"> | Date | string | null
    createdAt?: DateTimeFilter<"AlertEvent"> | Date | string
  }

  export type UserCreateWithoutWatchlistsInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    alertRules?: AlertRuleCreateNestedManyWithoutUserInput
    alertEvents?: AlertEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutWatchlistsInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    alertRules?: AlertRuleUncheckedCreateNestedManyWithoutUserInput
    alertEvents?: AlertEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutWatchlistsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutWatchlistsInput, UserUncheckedCreateWithoutWatchlistsInput>
  }

  export type WatchlistSymbolCreateWithoutWatchlistInput = {
    id?: string
    symbol: string
    createdAt?: Date | string
  }

  export type WatchlistSymbolUncheckedCreateWithoutWatchlistInput = {
    id?: string
    symbol: string
    createdAt?: Date | string
  }

  export type WatchlistSymbolCreateOrConnectWithoutWatchlistInput = {
    where: WatchlistSymbolWhereUniqueInput
    create: XOR<WatchlistSymbolCreateWithoutWatchlistInput, WatchlistSymbolUncheckedCreateWithoutWatchlistInput>
  }

  export type WatchlistSymbolCreateManyWatchlistInputEnvelope = {
    data: WatchlistSymbolCreateManyWatchlistInput | WatchlistSymbolCreateManyWatchlistInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutWatchlistsInput = {
    update: XOR<UserUpdateWithoutWatchlistsInput, UserUncheckedUpdateWithoutWatchlistsInput>
    create: XOR<UserCreateWithoutWatchlistsInput, UserUncheckedCreateWithoutWatchlistsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutWatchlistsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutWatchlistsInput, UserUncheckedUpdateWithoutWatchlistsInput>
  }

  export type UserUpdateWithoutWatchlistsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    alertRules?: AlertRuleUpdateManyWithoutUserNestedInput
    alertEvents?: AlertEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutWatchlistsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    alertRules?: AlertRuleUncheckedUpdateManyWithoutUserNestedInput
    alertEvents?: AlertEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type WatchlistSymbolUpsertWithWhereUniqueWithoutWatchlistInput = {
    where: WatchlistSymbolWhereUniqueInput
    update: XOR<WatchlistSymbolUpdateWithoutWatchlistInput, WatchlistSymbolUncheckedUpdateWithoutWatchlistInput>
    create: XOR<WatchlistSymbolCreateWithoutWatchlistInput, WatchlistSymbolUncheckedCreateWithoutWatchlistInput>
  }

  export type WatchlistSymbolUpdateWithWhereUniqueWithoutWatchlistInput = {
    where: WatchlistSymbolWhereUniqueInput
    data: XOR<WatchlistSymbolUpdateWithoutWatchlistInput, WatchlistSymbolUncheckedUpdateWithoutWatchlistInput>
  }

  export type WatchlistSymbolUpdateManyWithWhereWithoutWatchlistInput = {
    where: WatchlistSymbolScalarWhereInput
    data: XOR<WatchlistSymbolUpdateManyMutationInput, WatchlistSymbolUncheckedUpdateManyWithoutWatchlistInput>
  }

  export type WatchlistSymbolScalarWhereInput = {
    AND?: WatchlistSymbolScalarWhereInput | WatchlistSymbolScalarWhereInput[]
    OR?: WatchlistSymbolScalarWhereInput[]
    NOT?: WatchlistSymbolScalarWhereInput | WatchlistSymbolScalarWhereInput[]
    id?: StringFilter<"WatchlistSymbol"> | string
    watchlistId?: StringFilter<"WatchlistSymbol"> | string
    symbol?: StringFilter<"WatchlistSymbol"> | string
    createdAt?: DateTimeFilter<"WatchlistSymbol"> | Date | string
  }

  export type WatchlistCreateWithoutSymbolsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutWatchlistsInput
  }

  export type WatchlistUncheckedCreateWithoutSymbolsInput = {
    id?: string
    userId: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WatchlistCreateOrConnectWithoutSymbolsInput = {
    where: WatchlistWhereUniqueInput
    create: XOR<WatchlistCreateWithoutSymbolsInput, WatchlistUncheckedCreateWithoutSymbolsInput>
  }

  export type WatchlistUpsertWithoutSymbolsInput = {
    update: XOR<WatchlistUpdateWithoutSymbolsInput, WatchlistUncheckedUpdateWithoutSymbolsInput>
    create: XOR<WatchlistCreateWithoutSymbolsInput, WatchlistUncheckedCreateWithoutSymbolsInput>
    where?: WatchlistWhereInput
  }

  export type WatchlistUpdateToOneWithWhereWithoutSymbolsInput = {
    where?: WatchlistWhereInput
    data: XOR<WatchlistUpdateWithoutSymbolsInput, WatchlistUncheckedUpdateWithoutSymbolsInput>
  }

  export type WatchlistUpdateWithoutSymbolsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutWatchlistsNestedInput
  }

  export type WatchlistUncheckedUpdateWithoutSymbolsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SectorStockCreateWithoutSectorInput = {
    id?: string
    weight?: number
    stock: StockCreateNestedOneWithoutSectorsInput
  }

  export type SectorStockUncheckedCreateWithoutSectorInput = {
    id?: string
    stockId: string
    weight?: number
  }

  export type SectorStockCreateOrConnectWithoutSectorInput = {
    where: SectorStockWhereUniqueInput
    create: XOR<SectorStockCreateWithoutSectorInput, SectorStockUncheckedCreateWithoutSectorInput>
  }

  export type SectorStockCreateManySectorInputEnvelope = {
    data: SectorStockCreateManySectorInput | SectorStockCreateManySectorInput[]
    skipDuplicates?: boolean
  }

  export type SignalCreateWithoutSectorInput = {
    id: string
    symbol?: string | null
    type: $Enums.SignalType
    severity: $Enums.SignalSeverity
    score: number
    triggerValue: number
    previousValue?: number | null
    headline: string
    metadata: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    alertEvents?: AlertEventCreateNestedManyWithoutSignalInput
    outcome?: SignalOutcomeCreateNestedOneWithoutSignalInput
  }

  export type SignalUncheckedCreateWithoutSectorInput = {
    id: string
    symbol?: string | null
    type: $Enums.SignalType
    severity: $Enums.SignalSeverity
    score: number
    triggerValue: number
    previousValue?: number | null
    headline: string
    metadata: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    alertEvents?: AlertEventUncheckedCreateNestedManyWithoutSignalInput
    outcome?: SignalOutcomeUncheckedCreateNestedOneWithoutSignalInput
  }

  export type SignalCreateOrConnectWithoutSectorInput = {
    where: SignalWhereUniqueInput
    create: XOR<SignalCreateWithoutSectorInput, SignalUncheckedCreateWithoutSectorInput>
  }

  export type SignalCreateManySectorInputEnvelope = {
    data: SignalCreateManySectorInput | SignalCreateManySectorInput[]
    skipDuplicates?: boolean
  }

  export type SectorStockUpsertWithWhereUniqueWithoutSectorInput = {
    where: SectorStockWhereUniqueInput
    update: XOR<SectorStockUpdateWithoutSectorInput, SectorStockUncheckedUpdateWithoutSectorInput>
    create: XOR<SectorStockCreateWithoutSectorInput, SectorStockUncheckedCreateWithoutSectorInput>
  }

  export type SectorStockUpdateWithWhereUniqueWithoutSectorInput = {
    where: SectorStockWhereUniqueInput
    data: XOR<SectorStockUpdateWithoutSectorInput, SectorStockUncheckedUpdateWithoutSectorInput>
  }

  export type SectorStockUpdateManyWithWhereWithoutSectorInput = {
    where: SectorStockScalarWhereInput
    data: XOR<SectorStockUpdateManyMutationInput, SectorStockUncheckedUpdateManyWithoutSectorInput>
  }

  export type SectorStockScalarWhereInput = {
    AND?: SectorStockScalarWhereInput | SectorStockScalarWhereInput[]
    OR?: SectorStockScalarWhereInput[]
    NOT?: SectorStockScalarWhereInput | SectorStockScalarWhereInput[]
    id?: StringFilter<"SectorStock"> | string
    sectorId?: StringFilter<"SectorStock"> | string
    stockId?: StringFilter<"SectorStock"> | string
    weight?: FloatFilter<"SectorStock"> | number
  }

  export type SignalUpsertWithWhereUniqueWithoutSectorInput = {
    where: SignalWhereUniqueInput
    update: XOR<SignalUpdateWithoutSectorInput, SignalUncheckedUpdateWithoutSectorInput>
    create: XOR<SignalCreateWithoutSectorInput, SignalUncheckedCreateWithoutSectorInput>
  }

  export type SignalUpdateWithWhereUniqueWithoutSectorInput = {
    where: SignalWhereUniqueInput
    data: XOR<SignalUpdateWithoutSectorInput, SignalUncheckedUpdateWithoutSectorInput>
  }

  export type SignalUpdateManyWithWhereWithoutSectorInput = {
    where: SignalScalarWhereInput
    data: XOR<SignalUpdateManyMutationInput, SignalUncheckedUpdateManyWithoutSectorInput>
  }

  export type SignalScalarWhereInput = {
    AND?: SignalScalarWhereInput | SignalScalarWhereInput[]
    OR?: SignalScalarWhereInput[]
    NOT?: SignalScalarWhereInput | SignalScalarWhereInput[]
    id?: StringFilter<"Signal"> | string
    symbol?: StringNullableFilter<"Signal"> | string | null
    sectorId?: StringNullableFilter<"Signal"> | string | null
    type?: EnumSignalTypeFilter<"Signal"> | $Enums.SignalType
    severity?: EnumSignalSeverityFilter<"Signal"> | $Enums.SignalSeverity
    score?: FloatFilter<"Signal"> | number
    triggerValue?: FloatFilter<"Signal"> | number
    previousValue?: FloatNullableFilter<"Signal"> | number | null
    headline?: StringFilter<"Signal"> | string
    metadata?: JsonFilter<"Signal">
    createdAt?: DateTimeFilter<"Signal"> | Date | string
  }

  export type SectorStockCreateWithoutStockInput = {
    id?: string
    weight?: number
    sector: SectorCreateNestedOneWithoutStocksInput
  }

  export type SectorStockUncheckedCreateWithoutStockInput = {
    id?: string
    sectorId: string
    weight?: number
  }

  export type SectorStockCreateOrConnectWithoutStockInput = {
    where: SectorStockWhereUniqueInput
    create: XOR<SectorStockCreateWithoutStockInput, SectorStockUncheckedCreateWithoutStockInput>
  }

  export type SectorStockCreateManyStockInputEnvelope = {
    data: SectorStockCreateManyStockInput | SectorStockCreateManyStockInput[]
    skipDuplicates?: boolean
  }

  export type SectorStockUpsertWithWhereUniqueWithoutStockInput = {
    where: SectorStockWhereUniqueInput
    update: XOR<SectorStockUpdateWithoutStockInput, SectorStockUncheckedUpdateWithoutStockInput>
    create: XOR<SectorStockCreateWithoutStockInput, SectorStockUncheckedCreateWithoutStockInput>
  }

  export type SectorStockUpdateWithWhereUniqueWithoutStockInput = {
    where: SectorStockWhereUniqueInput
    data: XOR<SectorStockUpdateWithoutStockInput, SectorStockUncheckedUpdateWithoutStockInput>
  }

  export type SectorStockUpdateManyWithWhereWithoutStockInput = {
    where: SectorStockScalarWhereInput
    data: XOR<SectorStockUpdateManyMutationInput, SectorStockUncheckedUpdateManyWithoutStockInput>
  }

  export type SectorCreateWithoutStocksInput = {
    id?: string
    slug: string
    name: string
    description?: string | null
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    signals?: SignalCreateNestedManyWithoutSectorInput
  }

  export type SectorUncheckedCreateWithoutStocksInput = {
    id?: string
    slug: string
    name: string
    description?: string | null
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    signals?: SignalUncheckedCreateNestedManyWithoutSectorInput
  }

  export type SectorCreateOrConnectWithoutStocksInput = {
    where: SectorWhereUniqueInput
    create: XOR<SectorCreateWithoutStocksInput, SectorUncheckedCreateWithoutStocksInput>
  }

  export type StockCreateWithoutSectorsInput = {
    id?: string
    symbol: string
    name: string
    exchange: string
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StockUncheckedCreateWithoutSectorsInput = {
    id?: string
    symbol: string
    name: string
    exchange: string
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StockCreateOrConnectWithoutSectorsInput = {
    where: StockWhereUniqueInput
    create: XOR<StockCreateWithoutSectorsInput, StockUncheckedCreateWithoutSectorsInput>
  }

  export type SectorUpsertWithoutStocksInput = {
    update: XOR<SectorUpdateWithoutStocksInput, SectorUncheckedUpdateWithoutStocksInput>
    create: XOR<SectorCreateWithoutStocksInput, SectorUncheckedCreateWithoutStocksInput>
    where?: SectorWhereInput
  }

  export type SectorUpdateToOneWithWhereWithoutStocksInput = {
    where?: SectorWhereInput
    data: XOR<SectorUpdateWithoutStocksInput, SectorUncheckedUpdateWithoutStocksInput>
  }

  export type SectorUpdateWithoutStocksInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    signals?: SignalUpdateManyWithoutSectorNestedInput
  }

  export type SectorUncheckedUpdateWithoutStocksInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    signals?: SignalUncheckedUpdateManyWithoutSectorNestedInput
  }

  export type StockUpsertWithoutSectorsInput = {
    update: XOR<StockUpdateWithoutSectorsInput, StockUncheckedUpdateWithoutSectorsInput>
    create: XOR<StockCreateWithoutSectorsInput, StockUncheckedCreateWithoutSectorsInput>
    where?: StockWhereInput
  }

  export type StockUpdateToOneWithWhereWithoutSectorsInput = {
    where?: StockWhereInput
    data: XOR<StockUpdateWithoutSectorsInput, StockUncheckedUpdateWithoutSectorsInput>
  }

  export type StockUpdateWithoutSectorsInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    exchange?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockUncheckedUpdateWithoutSectorsInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    exchange?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SectorCreateWithoutSignalsInput = {
    id?: string
    slug: string
    name: string
    description?: string | null
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    stocks?: SectorStockCreateNestedManyWithoutSectorInput
  }

  export type SectorUncheckedCreateWithoutSignalsInput = {
    id?: string
    slug: string
    name: string
    description?: string | null
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    stocks?: SectorStockUncheckedCreateNestedManyWithoutSectorInput
  }

  export type SectorCreateOrConnectWithoutSignalsInput = {
    where: SectorWhereUniqueInput
    create: XOR<SectorCreateWithoutSignalsInput, SectorUncheckedCreateWithoutSignalsInput>
  }

  export type AlertEventCreateWithoutSignalInput = {
    id?: string
    delivered?: boolean
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutAlertEventsInput
  }

  export type AlertEventUncheckedCreateWithoutSignalInput = {
    id?: string
    userId: string
    delivered?: boolean
    deliveredAt?: Date | string | null
    createdAt?: Date | string
  }

  export type AlertEventCreateOrConnectWithoutSignalInput = {
    where: AlertEventWhereUniqueInput
    create: XOR<AlertEventCreateWithoutSignalInput, AlertEventUncheckedCreateWithoutSignalInput>
  }

  export type AlertEventCreateManySignalInputEnvelope = {
    data: AlertEventCreateManySignalInput | AlertEventCreateManySignalInput[]
    skipDuplicates?: boolean
  }

  export type SignalOutcomeCreateWithoutSignalInput = {
    id?: string
    priceAtSignal: number
    return5m?: number | null
    return15m?: number | null
    return30m?: number | null
    return60m?: number | null
    maxFavorable?: number | null
    maxAdverse?: number | null
    continuedHigher?: boolean | null
    evaluatedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type SignalOutcomeUncheckedCreateWithoutSignalInput = {
    id?: string
    priceAtSignal: number
    return5m?: number | null
    return15m?: number | null
    return30m?: number | null
    return60m?: number | null
    maxFavorable?: number | null
    maxAdverse?: number | null
    continuedHigher?: boolean | null
    evaluatedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type SignalOutcomeCreateOrConnectWithoutSignalInput = {
    where: SignalOutcomeWhereUniqueInput
    create: XOR<SignalOutcomeCreateWithoutSignalInput, SignalOutcomeUncheckedCreateWithoutSignalInput>
  }

  export type SectorUpsertWithoutSignalsInput = {
    update: XOR<SectorUpdateWithoutSignalsInput, SectorUncheckedUpdateWithoutSignalsInput>
    create: XOR<SectorCreateWithoutSignalsInput, SectorUncheckedCreateWithoutSignalsInput>
    where?: SectorWhereInput
  }

  export type SectorUpdateToOneWithWhereWithoutSignalsInput = {
    where?: SectorWhereInput
    data: XOR<SectorUpdateWithoutSignalsInput, SectorUncheckedUpdateWithoutSignalsInput>
  }

  export type SectorUpdateWithoutSignalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stocks?: SectorStockUpdateManyWithoutSectorNestedInput
  }

  export type SectorUncheckedUpdateWithoutSignalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stocks?: SectorStockUncheckedUpdateManyWithoutSectorNestedInput
  }

  export type AlertEventUpsertWithWhereUniqueWithoutSignalInput = {
    where: AlertEventWhereUniqueInput
    update: XOR<AlertEventUpdateWithoutSignalInput, AlertEventUncheckedUpdateWithoutSignalInput>
    create: XOR<AlertEventCreateWithoutSignalInput, AlertEventUncheckedCreateWithoutSignalInput>
  }

  export type AlertEventUpdateWithWhereUniqueWithoutSignalInput = {
    where: AlertEventWhereUniqueInput
    data: XOR<AlertEventUpdateWithoutSignalInput, AlertEventUncheckedUpdateWithoutSignalInput>
  }

  export type AlertEventUpdateManyWithWhereWithoutSignalInput = {
    where: AlertEventScalarWhereInput
    data: XOR<AlertEventUpdateManyMutationInput, AlertEventUncheckedUpdateManyWithoutSignalInput>
  }

  export type SignalOutcomeUpsertWithoutSignalInput = {
    update: XOR<SignalOutcomeUpdateWithoutSignalInput, SignalOutcomeUncheckedUpdateWithoutSignalInput>
    create: XOR<SignalOutcomeCreateWithoutSignalInput, SignalOutcomeUncheckedCreateWithoutSignalInput>
    where?: SignalOutcomeWhereInput
  }

  export type SignalOutcomeUpdateToOneWithWhereWithoutSignalInput = {
    where?: SignalOutcomeWhereInput
    data: XOR<SignalOutcomeUpdateWithoutSignalInput, SignalOutcomeUncheckedUpdateWithoutSignalInput>
  }

  export type SignalOutcomeUpdateWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    priceAtSignal?: FloatFieldUpdateOperationsInput | number
    return5m?: NullableFloatFieldUpdateOperationsInput | number | null
    return15m?: NullableFloatFieldUpdateOperationsInput | number | null
    return30m?: NullableFloatFieldUpdateOperationsInput | number | null
    return60m?: NullableFloatFieldUpdateOperationsInput | number | null
    maxFavorable?: NullableFloatFieldUpdateOperationsInput | number | null
    maxAdverse?: NullableFloatFieldUpdateOperationsInput | number | null
    continuedHigher?: NullableBoolFieldUpdateOperationsInput | boolean | null
    evaluatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalOutcomeUncheckedUpdateWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    priceAtSignal?: FloatFieldUpdateOperationsInput | number
    return5m?: NullableFloatFieldUpdateOperationsInput | number | null
    return15m?: NullableFloatFieldUpdateOperationsInput | number | null
    return30m?: NullableFloatFieldUpdateOperationsInput | number | null
    return60m?: NullableFloatFieldUpdateOperationsInput | number | null
    maxFavorable?: NullableFloatFieldUpdateOperationsInput | number | null
    maxAdverse?: NullableFloatFieldUpdateOperationsInput | number | null
    continuedHigher?: NullableBoolFieldUpdateOperationsInput | boolean | null
    evaluatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalCreateWithoutOutcomeInput = {
    id: string
    symbol?: string | null
    type: $Enums.SignalType
    severity: $Enums.SignalSeverity
    score: number
    triggerValue: number
    previousValue?: number | null
    headline: string
    metadata: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    sector?: SectorCreateNestedOneWithoutSignalsInput
    alertEvents?: AlertEventCreateNestedManyWithoutSignalInput
  }

  export type SignalUncheckedCreateWithoutOutcomeInput = {
    id: string
    symbol?: string | null
    sectorId?: string | null
    type: $Enums.SignalType
    severity: $Enums.SignalSeverity
    score: number
    triggerValue: number
    previousValue?: number | null
    headline: string
    metadata: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    alertEvents?: AlertEventUncheckedCreateNestedManyWithoutSignalInput
  }

  export type SignalCreateOrConnectWithoutOutcomeInput = {
    where: SignalWhereUniqueInput
    create: XOR<SignalCreateWithoutOutcomeInput, SignalUncheckedCreateWithoutOutcomeInput>
  }

  export type SignalUpsertWithoutOutcomeInput = {
    update: XOR<SignalUpdateWithoutOutcomeInput, SignalUncheckedUpdateWithoutOutcomeInput>
    create: XOR<SignalCreateWithoutOutcomeInput, SignalUncheckedCreateWithoutOutcomeInput>
    where?: SignalWhereInput
  }

  export type SignalUpdateToOneWithWhereWithoutOutcomeInput = {
    where?: SignalWhereInput
    data: XOR<SignalUpdateWithoutOutcomeInput, SignalUncheckedUpdateWithoutOutcomeInput>
  }

  export type SignalUpdateWithoutOutcomeInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType
    severity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    score?: FloatFieldUpdateOperationsInput | number
    triggerValue?: FloatFieldUpdateOperationsInput | number
    previousValue?: NullableFloatFieldUpdateOperationsInput | number | null
    headline?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sector?: SectorUpdateOneWithoutSignalsNestedInput
    alertEvents?: AlertEventUpdateManyWithoutSignalNestedInput
  }

  export type SignalUncheckedUpdateWithoutOutcomeInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType
    severity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    score?: FloatFieldUpdateOperationsInput | number
    triggerValue?: FloatFieldUpdateOperationsInput | number
    previousValue?: NullableFloatFieldUpdateOperationsInput | number | null
    headline?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    alertEvents?: AlertEventUncheckedUpdateManyWithoutSignalNestedInput
  }

  export type UserCreateWithoutAlertRulesInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    watchlists?: WatchlistCreateNestedManyWithoutUserInput
    alertEvents?: AlertEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAlertRulesInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    watchlists?: WatchlistUncheckedCreateNestedManyWithoutUserInput
    alertEvents?: AlertEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAlertRulesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAlertRulesInput, UserUncheckedCreateWithoutAlertRulesInput>
  }

  export type UserUpsertWithoutAlertRulesInput = {
    update: XOR<UserUpdateWithoutAlertRulesInput, UserUncheckedUpdateWithoutAlertRulesInput>
    create: XOR<UserCreateWithoutAlertRulesInput, UserUncheckedCreateWithoutAlertRulesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAlertRulesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAlertRulesInput, UserUncheckedUpdateWithoutAlertRulesInput>
  }

  export type UserUpdateWithoutAlertRulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    watchlists?: WatchlistUpdateManyWithoutUserNestedInput
    alertEvents?: AlertEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAlertRulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    watchlists?: WatchlistUncheckedUpdateManyWithoutUserNestedInput
    alertEvents?: AlertEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutAlertEventsInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    watchlists?: WatchlistCreateNestedManyWithoutUserInput
    alertRules?: AlertRuleCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAlertEventsInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    watchlists?: WatchlistUncheckedCreateNestedManyWithoutUserInput
    alertRules?: AlertRuleUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAlertEventsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAlertEventsInput, UserUncheckedCreateWithoutAlertEventsInput>
  }

  export type SignalCreateWithoutAlertEventsInput = {
    id: string
    symbol?: string | null
    type: $Enums.SignalType
    severity: $Enums.SignalSeverity
    score: number
    triggerValue: number
    previousValue?: number | null
    headline: string
    metadata: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    sector?: SectorCreateNestedOneWithoutSignalsInput
    outcome?: SignalOutcomeCreateNestedOneWithoutSignalInput
  }

  export type SignalUncheckedCreateWithoutAlertEventsInput = {
    id: string
    symbol?: string | null
    sectorId?: string | null
    type: $Enums.SignalType
    severity: $Enums.SignalSeverity
    score: number
    triggerValue: number
    previousValue?: number | null
    headline: string
    metadata: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    outcome?: SignalOutcomeUncheckedCreateNestedOneWithoutSignalInput
  }

  export type SignalCreateOrConnectWithoutAlertEventsInput = {
    where: SignalWhereUniqueInput
    create: XOR<SignalCreateWithoutAlertEventsInput, SignalUncheckedCreateWithoutAlertEventsInput>
  }

  export type UserUpsertWithoutAlertEventsInput = {
    update: XOR<UserUpdateWithoutAlertEventsInput, UserUncheckedUpdateWithoutAlertEventsInput>
    create: XOR<UserCreateWithoutAlertEventsInput, UserUncheckedCreateWithoutAlertEventsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAlertEventsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAlertEventsInput, UserUncheckedUpdateWithoutAlertEventsInput>
  }

  export type UserUpdateWithoutAlertEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    watchlists?: WatchlistUpdateManyWithoutUserNestedInput
    alertRules?: AlertRuleUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAlertEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    watchlists?: WatchlistUncheckedUpdateManyWithoutUserNestedInput
    alertRules?: AlertRuleUncheckedUpdateManyWithoutUserNestedInput
  }

  export type SignalUpsertWithoutAlertEventsInput = {
    update: XOR<SignalUpdateWithoutAlertEventsInput, SignalUncheckedUpdateWithoutAlertEventsInput>
    create: XOR<SignalCreateWithoutAlertEventsInput, SignalUncheckedCreateWithoutAlertEventsInput>
    where?: SignalWhereInput
  }

  export type SignalUpdateToOneWithWhereWithoutAlertEventsInput = {
    where?: SignalWhereInput
    data: XOR<SignalUpdateWithoutAlertEventsInput, SignalUncheckedUpdateWithoutAlertEventsInput>
  }

  export type SignalUpdateWithoutAlertEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType
    severity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    score?: FloatFieldUpdateOperationsInput | number
    triggerValue?: FloatFieldUpdateOperationsInput | number
    previousValue?: NullableFloatFieldUpdateOperationsInput | number | null
    headline?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sector?: SectorUpdateOneWithoutSignalsNestedInput
    outcome?: SignalOutcomeUpdateOneWithoutSignalNestedInput
  }

  export type SignalUncheckedUpdateWithoutAlertEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType
    severity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    score?: FloatFieldUpdateOperationsInput | number
    triggerValue?: FloatFieldUpdateOperationsInput | number
    previousValue?: NullableFloatFieldUpdateOperationsInput | number | null
    headline?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    outcome?: SignalOutcomeUncheckedUpdateOneWithoutSignalNestedInput
  }

  export type NewsSymbolCreateWithoutNewsArticleInput = {
    id?: string
    symbol: string
    sectorId?: string | null
  }

  export type NewsSymbolUncheckedCreateWithoutNewsArticleInput = {
    id?: string
    symbol: string
    sectorId?: string | null
  }

  export type NewsSymbolCreateOrConnectWithoutNewsArticleInput = {
    where: NewsSymbolWhereUniqueInput
    create: XOR<NewsSymbolCreateWithoutNewsArticleInput, NewsSymbolUncheckedCreateWithoutNewsArticleInput>
  }

  export type NewsSymbolCreateManyNewsArticleInputEnvelope = {
    data: NewsSymbolCreateManyNewsArticleInput | NewsSymbolCreateManyNewsArticleInput[]
    skipDuplicates?: boolean
  }

  export type NewsSymbolUpsertWithWhereUniqueWithoutNewsArticleInput = {
    where: NewsSymbolWhereUniqueInput
    update: XOR<NewsSymbolUpdateWithoutNewsArticleInput, NewsSymbolUncheckedUpdateWithoutNewsArticleInput>
    create: XOR<NewsSymbolCreateWithoutNewsArticleInput, NewsSymbolUncheckedCreateWithoutNewsArticleInput>
  }

  export type NewsSymbolUpdateWithWhereUniqueWithoutNewsArticleInput = {
    where: NewsSymbolWhereUniqueInput
    data: XOR<NewsSymbolUpdateWithoutNewsArticleInput, NewsSymbolUncheckedUpdateWithoutNewsArticleInput>
  }

  export type NewsSymbolUpdateManyWithWhereWithoutNewsArticleInput = {
    where: NewsSymbolScalarWhereInput
    data: XOR<NewsSymbolUpdateManyMutationInput, NewsSymbolUncheckedUpdateManyWithoutNewsArticleInput>
  }

  export type NewsSymbolScalarWhereInput = {
    AND?: NewsSymbolScalarWhereInput | NewsSymbolScalarWhereInput[]
    OR?: NewsSymbolScalarWhereInput[]
    NOT?: NewsSymbolScalarWhereInput | NewsSymbolScalarWhereInput[]
    id?: StringFilter<"NewsSymbol"> | string
    newsArticleId?: StringFilter<"NewsSymbol"> | string
    symbol?: StringFilter<"NewsSymbol"> | string
    sectorId?: StringNullableFilter<"NewsSymbol"> | string | null
  }

  export type NewsArticleCreateWithoutSymbolsInput = {
    id?: string
    headline: string
    source: string
    url: string
    publishedAt: Date | string
    catalystType: string
    createdAt?: Date | string
  }

  export type NewsArticleUncheckedCreateWithoutSymbolsInput = {
    id?: string
    headline: string
    source: string
    url: string
    publishedAt: Date | string
    catalystType: string
    createdAt?: Date | string
  }

  export type NewsArticleCreateOrConnectWithoutSymbolsInput = {
    where: NewsArticleWhereUniqueInput
    create: XOR<NewsArticleCreateWithoutSymbolsInput, NewsArticleUncheckedCreateWithoutSymbolsInput>
  }

  export type NewsArticleUpsertWithoutSymbolsInput = {
    update: XOR<NewsArticleUpdateWithoutSymbolsInput, NewsArticleUncheckedUpdateWithoutSymbolsInput>
    create: XOR<NewsArticleCreateWithoutSymbolsInput, NewsArticleUncheckedCreateWithoutSymbolsInput>
    where?: NewsArticleWhereInput
  }

  export type NewsArticleUpdateToOneWithWhereWithoutSymbolsInput = {
    where?: NewsArticleWhereInput
    data: XOR<NewsArticleUpdateWithoutSymbolsInput, NewsArticleUncheckedUpdateWithoutSymbolsInput>
  }

  export type NewsArticleUpdateWithoutSymbolsInput = {
    id?: StringFieldUpdateOperationsInput | string
    headline?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    publishedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    catalystType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NewsArticleUncheckedUpdateWithoutSymbolsInput = {
    id?: StringFieldUpdateOperationsInput | string
    headline?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    publishedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    catalystType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WatchlistCreateManyUserInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AlertRuleCreateManyUserInput = {
    id?: string
    type?: $Enums.SignalType | null
    sectorId?: string | null
    minSeverity?: $Enums.SignalSeverity
    threshold?: number
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AlertEventCreateManyUserInput = {
    id?: string
    signalId: string
    delivered?: boolean
    deliveredAt?: Date | string | null
    createdAt?: Date | string
  }

  export type WatchlistUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    symbols?: WatchlistSymbolUpdateManyWithoutWatchlistNestedInput
  }

  export type WatchlistUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    symbols?: WatchlistSymbolUncheckedUpdateManyWithoutWatchlistNestedInput
  }

  export type WatchlistUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertRuleUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: NullableEnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType | null
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
    minSeverity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    threshold?: FloatFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertRuleUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: NullableEnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType | null
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
    minSeverity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    threshold?: FloatFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertRuleUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: NullableEnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType | null
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
    minSeverity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    threshold?: FloatFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertEventUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    delivered?: BoolFieldUpdateOperationsInput | boolean
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    signal?: SignalUpdateOneRequiredWithoutAlertEventsNestedInput
  }

  export type AlertEventUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalId?: StringFieldUpdateOperationsInput | string
    delivered?: BoolFieldUpdateOperationsInput | boolean
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertEventUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalId?: StringFieldUpdateOperationsInput | string
    delivered?: BoolFieldUpdateOperationsInput | boolean
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WatchlistSymbolCreateManyWatchlistInput = {
    id?: string
    symbol: string
    createdAt?: Date | string
  }

  export type WatchlistSymbolUpdateWithoutWatchlistInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WatchlistSymbolUncheckedUpdateWithoutWatchlistInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WatchlistSymbolUncheckedUpdateManyWithoutWatchlistInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SectorStockCreateManySectorInput = {
    id?: string
    stockId: string
    weight?: number
  }

  export type SignalCreateManySectorInput = {
    id: string
    symbol?: string | null
    type: $Enums.SignalType
    severity: $Enums.SignalSeverity
    score: number
    triggerValue: number
    previousValue?: number | null
    headline: string
    metadata: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type SectorStockUpdateWithoutSectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
    stock?: StockUpdateOneRequiredWithoutSectorsNestedInput
  }

  export type SectorStockUncheckedUpdateWithoutSectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    stockId?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
  }

  export type SectorStockUncheckedUpdateManyWithoutSectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    stockId?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
  }

  export type SignalUpdateWithoutSectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType
    severity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    score?: FloatFieldUpdateOperationsInput | number
    triggerValue?: FloatFieldUpdateOperationsInput | number
    previousValue?: NullableFloatFieldUpdateOperationsInput | number | null
    headline?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    alertEvents?: AlertEventUpdateManyWithoutSignalNestedInput
    outcome?: SignalOutcomeUpdateOneWithoutSignalNestedInput
  }

  export type SignalUncheckedUpdateWithoutSectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType
    severity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    score?: FloatFieldUpdateOperationsInput | number
    triggerValue?: FloatFieldUpdateOperationsInput | number
    previousValue?: NullableFloatFieldUpdateOperationsInput | number | null
    headline?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    alertEvents?: AlertEventUncheckedUpdateManyWithoutSignalNestedInput
    outcome?: SignalOutcomeUncheckedUpdateOneWithoutSignalNestedInput
  }

  export type SignalUncheckedUpdateManyWithoutSectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumSignalTypeFieldUpdateOperationsInput | $Enums.SignalType
    severity?: EnumSignalSeverityFieldUpdateOperationsInput | $Enums.SignalSeverity
    score?: FloatFieldUpdateOperationsInput | number
    triggerValue?: FloatFieldUpdateOperationsInput | number
    previousValue?: NullableFloatFieldUpdateOperationsInput | number | null
    headline?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SectorStockCreateManyStockInput = {
    id?: string
    sectorId: string
    weight?: number
  }

  export type SectorStockUpdateWithoutStockInput = {
    id?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
    sector?: SectorUpdateOneRequiredWithoutStocksNestedInput
  }

  export type SectorStockUncheckedUpdateWithoutStockInput = {
    id?: StringFieldUpdateOperationsInput | string
    sectorId?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
  }

  export type SectorStockUncheckedUpdateManyWithoutStockInput = {
    id?: StringFieldUpdateOperationsInput | string
    sectorId?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
  }

  export type AlertEventCreateManySignalInput = {
    id?: string
    userId: string
    delivered?: boolean
    deliveredAt?: Date | string | null
    createdAt?: Date | string
  }

  export type AlertEventUpdateWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    delivered?: BoolFieldUpdateOperationsInput | boolean
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAlertEventsNestedInput
  }

  export type AlertEventUncheckedUpdateWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    delivered?: BoolFieldUpdateOperationsInput | boolean
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertEventUncheckedUpdateManyWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    delivered?: BoolFieldUpdateOperationsInput | boolean
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NewsSymbolCreateManyNewsArticleInput = {
    id?: string
    symbol: string
    sectorId?: string | null
  }

  export type NewsSymbolUpdateWithoutNewsArticleInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type NewsSymbolUncheckedUpdateWithoutNewsArticleInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type NewsSymbolUncheckedUpdateManyWithoutNewsArticleInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    sectorId?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}