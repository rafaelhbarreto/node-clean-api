import { DbAddAccount } from './db-add-account'

describe('Add account database unit tests', () => {
  it('should be valid when the encrypter is called with the correct value', async () => {
    class EncrypterStub {
      async encrypt (value: string): Promise<string> {
        return new Promise((resolve) => resolve('hashed_pass'))
      }
    }

    const encrypterStub = new EncrypterStub()
    const sut = new DbAddAccount(encrypterStub)
    const encrypterSpy = jest.spyOn(encrypterStub, 'encrypt')
    const accountInputData = {
      name: 'some name',
      email: 'someemail@mail.com',
      password: 'somepass'
    }

    await sut.handle(accountInputData)
    expect(encrypterSpy).toHaveBeenCalledWith('somepass')
  })
})
