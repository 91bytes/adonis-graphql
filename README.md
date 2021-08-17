# Adonis GraphQL

This is a thin layer that glues apollo server and Adonis v5. It allows you to have one or more GraphQL endpoints in your
application. I strongly recommend using [TypeGraphQL](https://typegraphql.com/) in combination with this package. While
it's possible to use it in other ways, the documentation here will assume you are going to use TypeGraphQL.

## Installation

```shell
yarn add @91codes/adonis-graphql
# or if you are using npm
npm i @91codes/adonis-graphql
```

## Usage

Build your GraphQL schema. More documentation at https://typegraphql.com/docs/getting-started.html

Generate a GraphQL provider

```shell
node ace make:provider graphql
```

Build the schema, create a GraphQL instance, and attach it as a singleton in the provider's boot method.

```ts
export default class GraphqlProvider {
  constructor(protected app: ApplicationContract) {
  }

  public async boot() {
    // Import all of your resolvers
    const { default: MyResolver } = await import('App/GraphQL/MyResolver')
    const schema = await buildSchema({ resolvers: [MyResolver] })
    const server = new GraphQLServer({ schema })
    await server.start()
    this.app.container.singleton('App/GraphQL/Server', () => server)
  }
}
```

Create `contracts/graphql-server.ts` with the following content to add typings for Adonis IOC
```ts
declare module '@ioc:App/GraphQL/Server' {
  import { GraphQLServer } from '@91codes/adonis-graphql'
  const server: GraphQLServer
  export default server
}
```

Generate a controller

```shell
node ace make:controller GraphQLController
```

Update the controller to serve GraphQL responses

```ts
import server from '@ioc:App/GraphQL/Server'

export default class GraphQLController {
  public async serve(ctx: HttpContextContract) {
    return server.handle(
      ctx,
      ctx.request.method() === 'GET' || ctx.request.types().includes('text/html') // Show landing screen in this case
    )
  }
}
```

Register the route in `start/routes.ts`

```ts
Route.any('graphql', 'GraphQLController.serve')
```