import { MissingParamError, ServerError, InvalidParamError } from '../../errors'
import { EmailValidator, AddAccount, CreateAccount, Account } from './signup-protocols'
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
    async handle (account: AddAccount): Promise<Account> {
      return await {
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
  it('should return 400 if the name is not provided', async () => {
    const { sut } = SutFactory()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_pass',
        password_confirmation: 'any_pass'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  it('should return 400 if the email is not provided', async () => {
    const { sut } = SutFactory()
    const httpRequest = {
      body: {
        name: 'any name',
        password: 'any_pass',
        password_confirmation: 'any_pass'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  it('should return 400 if the password is not provided', async () => {
    const { sut } = SutFactory()
    const httpRequest = {
      body: {
        name: 'any name',
        email: 'any_email@mail.com',
        password_confirmation: 'any_pass'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  it('should return 400 if the password_confirmation is not provided', async () => {
    const { sut } = SutFactory()
    const httpRequest = {
      body: {
        name: 'any name',
        email: 'any_email@mail.com',
        password: 'any_pass'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.body).toEqual(new MissingParamError('password_confirmation'))
  })

  it('should return 400 if the password_confirmation and password are diferent', async () => {
    const { sut } = SutFactory()
    const httpRequest = {
      body: {
        name: 'any name',
        email: 'any_email@mail.com',
        password: 'any_pass',
        password_confirmation: 'invalid'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('password_confirmation'))
  })

  it('should return 400 if the given e-mail is incorrect', async () => {
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

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
    expect(emailValidatorSpy).toBeCalled()
  })

  it('should ensure that the isValid function is called with the correct param', async () => {
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

    await sut.handle(httpRequest)
    expect(emailValidatorSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  it('should returns a 500 status code when the EmailValidator throws an exception', async () => {
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

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('should call addAcount with correct values', async () => {
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

    await sut.handle(httpRequest)
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any name',
      email: 'any_email@mail.com',
      password: 'any_pass'
    })
  })

  it('should returns a 500 status code when the addAccountUseCase throws an exception', async () => {
    const { sut, addAccountStub } = SutFactory()
    jest.spyOn(addAccountStub, 'handle').mockImplementation(() => {
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

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('should returns a 200 status code when create an account', async () => {
    const { sut } = SutFactory()

    const httpRequest = {
      body: {
        name: 'any name',
        email: 'any_email@mail.com',
        password: 'any_pass',
        password_confirmation: 'any_pass'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(201)
  })
})
