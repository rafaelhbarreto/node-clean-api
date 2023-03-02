import { Account } from '@/domain/models/account'
import { AddAccount, CreateAccount } from '@/domain/usecases/create-account'
import { MissingParamError, ServerError, InvalidParamError } from '../errors'
import { EmailValidator } from '../protocols'
import { SingupController } from './singup'

const emailValidatorStubFactory = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}

const addAccountFactory = (): CreateAccount => {
  class AddAccountStub implements CreateAccount {
    handle (account: AddAccount): Account {
      return {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_pass'
      }
    }
  }

  return new AddAccountStub()
}

interface stubTypes {
  sut: SingupController
  emailValidatorStub: EmailValidator
  addAccountStub: CreateAccount
}

const SutFactory = (): stubTypes => {
  const emailValidatorStub = emailValidatorStubFactory()
  const addAccountStub = addAccountFactory()
  const sut = new SingupController(emailValidatorStub, addAccountStub)

  return {
    sut,
    emailValidatorStub,
    addAccountStub
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

  it('should return 400 if the password_confirmation and password are diferent', () => {
    const { sut } = SutFactory()
    const httpRequest = {
      body: {
        name: 'any name',
        email: 'any_email@mail.com',
        password: 'any_pass',
        password_confirmation: 'invalid'
      }
    }

    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('password_confirmation'))
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
    const { sut, emailValidatorStub } = SutFactory()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementation(() => {
      throw new Error()
    })

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

  it('should call addAcount with correct values', () => {
    const { sut, addAccountStub } = SutFactory()
    const addSpy = jest.spyOn(addAccountStub, 'handle')
    const httpRequest = {
      body: {
        name: 'any name',
        email: 'any_email@mail.com',
        password: 'any_pass',
        password_confirmation: 'any_pass'
      }
    }

    sut.handle(httpRequest)
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any name',
      email: 'any_email@mail.com',
      password: 'any_pass'
    })
  })
})
