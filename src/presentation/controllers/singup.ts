import { MissingParamError } from '../errors/missing-param'
import { badRequest } from '../helpers/http'
import { HttpResponse, HttpRequest } from '../protocols/http'

export class SingupController {
  handle (httpRequest: HttpRequest): HttpResponse {
    if (!httpRequest.body.name) {
      return badRequest(new MissingParamError('name'))
    }

    if (!httpRequest.body.email) {
      return badRequest(new MissingParamError('email'))
    }

    return {
      statusCode: 400,
      body: new Error('Missing param: email')
    }
  }
}
