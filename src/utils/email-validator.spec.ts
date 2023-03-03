import { EmailValidatorAdapter } from './email-validator-adapter'
import validator from 'validator'

describe('Email validator unit tests', () => {
  it('should be invalid if the email validator returns false', () => {
    const emailValidator = new EmailValidatorAdapter()
    jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false)
    const isValid = emailValidator.isValid('some_email@mail.com')

    expect(isValid).toBeFalsy()
  })

  it('should be valid when the email is correct', () => {
    const emailValidator = new EmailValidatorAdapter()
    const isValid = emailValidator.isValid('some_email@mail.com')

    expect(isValid).toBeTruthy()
  })

  it('should be valid when the spy is called with the correct param', () => {
    const emailValidator = new EmailValidatorAdapter()
    emailValidator.isValid('some_email@mail.com')
    const validatorSpy = jest.spyOn(validator, 'isEmail')

    expect(validatorSpy).toHaveBeenCalledWith('some_email@mail.com')
  })
})
