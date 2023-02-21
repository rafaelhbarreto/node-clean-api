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
  })
})
