import { MissingParamError, InvalidParamError, ServerError } from '../../errors'
import { badRequest, created } from '../../helpers/http'
import { HttpResponse, HttpRequest, Controller, EmailValidator, CreateAccount } from './signup-protocols'

export class SingupController implements Controller {
  constructor (
    private readonly emailValidator: EmailValidator,
    private readonly addAccount: CreateAccount
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
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

      const { name, email, password, password_confirmation } = httpRequest.body

      if (password !== password_confirmation) {
        return badRequest(new InvalidParamError('password_confirmation'))
      }

      if (!this.emailValidator.isValid(httpRequest.body.email)) {
        return badRequest(new InvalidParamError('email'))
      }

      const account = await this.addAccount.handle({
        name,
        email,
        password
      })

      return created(account)
    } catch (error) {
      return {
        statusCode: 500,
        body: new ServerError()
      }
    }
  }
}
