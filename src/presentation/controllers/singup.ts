import { MissingParamError } from '../errors/missing-param'
import { badRequest } from '../helpers/http'
import { HttpResponse, HttpRequest } from '../protocols/http'
import { Controller } from '../protocols/controller'

export class SingupController implements Controller {
  handle (httpRequest: HttpRequest): HttpResponse {
    const requiredFields = [
      'name',
      'email',
      'password',
      'password_confirmation'
    ]

    for (const field of requiredFields) {
      if (!httpRequest.body[field]) {
        return badRequest(new MissingParamError(field))
      }
    }

    return {
      statusCode: 400,
      body: new Error('Missing param: email')
    }
  }
}
