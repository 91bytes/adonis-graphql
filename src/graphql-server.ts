import {
  ApolloServerBase,
  convertNodeHttpToRequest,
  GraphQLOptions,
  runHttpQuery,
} from 'apollo-server-core'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class GraphQLServer extends ApolloServerBase {
  public async handle(ctx: HttpContextContract, shouldUseLandingPage?: boolean) {
    const landingPage = this.getLandingPage()
    if (landingPage && shouldUseLandingPage) {
      ctx.response.header('Content-Type', 'text/html')
      ctx.response.send(landingPage.html, true)
      return
    }

    const { graphqlResponse, responseInit } = await runHttpQuery([ctx], {
      method: ctx.request.method(),
      options: () => this.createGraphQLServerOptions(ctx),
      query: ctx.request.all(),
      request: convertNodeHttpToRequest(ctx.request.request),
    })
    if (responseInit.headers) {
      Object.entries(responseInit.headers).forEach(([headerName, value]) =>
        ctx.response.header(headerName, value)
      )
    }
    ctx.response.status(responseInit.status || 200)
    ctx.response.send(graphqlResponse)
  }

  private createGraphQLServerOptions(ctx: HttpContextContract): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ ctx })
  }
}
