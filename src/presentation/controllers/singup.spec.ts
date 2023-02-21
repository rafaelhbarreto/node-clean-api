import { MissingParamError } from '../errors/missing-param'
import { SingupController } from './singup'

describe('SingupController tests', () => {
  it('should return 400 if the name is not provided', () => {
    const sut = new SingupController()
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
    const sut = new SingupController()
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
    const sut = new SingupController()
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
    const sut = new SingupController()
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
})
