import { MissingParamError, ServerError, InvalidParamError } from '../errors'
import { EmailValidator } from '../protocols'
import { SingupController } from './singup'

interface stubTypes {
  sut: SingupController
  emailValidatorStub: EmailValidator
}

const emailValidatorStubFactoryWithError = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      throw new Error()
    }
  }

  return new EmailValidatorStub()
}

const emailValidatorStubFactory = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}

const SutFactory = (): stubTypes => {
  const emailValidatorStub = emailValidatorStubFactory()
  const sut = new SingupController(emailValidatorStub)

  return {
    sut,
    emailValidatorStub
  }
}

describe('SingupController tests', () => {
  it('should return 400 if the name is not provided', () => {
    const { sut } = SutFactory()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_pass',
        password_confirmation: 'any_pass'
      }
    }

    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  it('should return 400 if the email is not provided', () => {
    const { sut } = SutFactory()
    const httpRequest = {
      body: {
        name: 'any name',
        password: 'any_pass',
        password_confirmation: 'any_pass'
      }
    }

    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  it('should return 400 if the password is not provided', () => {
    const { sut } = SutFactory()
    const httpRequest = {
      body: {
        name: 'any name',
        email: 'any_email@mail.com',
        password_confirmation: 'any_pass'
      }
    }

    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  it('should return 400 if the password_confirmation is not provided', () => {
    const { sut } = SutFactory()
    const httpRequest = {
      body: {
        name: 'any name',
        email: 'any_email@mail.com',
        password: 'any_pass'
      }
    }

    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.body).toEqual(new MissingParamError('password_confirmation'))
  })

  it('should return 400 if the given e-mail is incorrect', () => {
    const { sut, emailValidatorStub } = SutFactory()
    const emailValidatorSpy = jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const httpRequest = {
      body: {
        name: 'any name',
        email: 'any_email@mail.com',
        password: 'any_pass',
        password_confirmation: 'any_pass'
      }
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
    expect(emailValidatorSpy).toBeCalled()
  })

  it('should ensure that the isValid function is called with the correct param', () => {
    const { sut, emailValidatorStub } = SutFactory()
    const emailValidatorSpy = jest.spyOn(emailValidatorStub, 'isValid')

    const httpRequest = {
      body: {
        name: 'any name',
        email: 'any_email@mail.com',
        password: 'any_pass',
        password_confirmation: 'any_pass'
      }
    }

    sut.handle(httpRequest)
    expect(emailValidatorSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  it('should returns a 500 status code when the EmailValidator throws an exception', () => {
    const emailValidatorStub = emailValidatorStubFactoryWithError()
    const sut = new SingupController(emailValidatorStub)

    const httpRequest = {
      body: {
        name: 'any name',
        email: 'any_email@mail.com',
        password: 'any_pass',
        password_confirmation: 'any_pass'
      }
    }

    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
})
