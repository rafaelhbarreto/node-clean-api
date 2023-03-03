import { Account } from '@/domain/models/account'
import { AddAccount } from '@/domain/usecases/create-account'
import { rejects } from 'assert'
import { resolve } from 'path'
import { AddAccountRepository } from '../protocols/AddAccountRepository'
import { Encrypter } from '../protocols/encrypter'
import { DbAddAccount } from './db-add-account'

describe('Add account database unit tests', () => {
  const makeEncrypter = (): Encrypter => {
    class EncrypterStub implements Encrypter {
      async encrypt (value: string): Promise<string> {
        return new Promise((resolve) => resolve('hashed_password'))
      }
    }

    return new EncrypterStub()
  }

  const makeAddAccountRepository = (): AddAccountRepository => {
    class AddAccountRepositoryStub implements AddAccountRepository {
      async add (account: AddAccount): Promise<Account> {
        const fakeAccount: Account = {
          id: 'valid_id',
          name: 'valid_name',
          email: 'valid_email',
          password: 'hashed_password'
        }

        return new Promise(resolve => resolve(fakeAccount))
      }
    }

    return new AddAccountRepositoryStub()
  }

  interface SutTypes {
    sut: DbAddAccount
    encrypterStub: Encrypter
    addAccountRepositoryStub: AddAccountRepository
  }

  const makeSut = (): SutTypes => {
    const encrypterStub = makeEncrypter()
    const addAccountRepositoryStub = makeAddAccountRepository()
    const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub)
    return {
      sut,
      encrypterStub,
      addAccountRepositoryStub
    }
  }

  it('should be valid when the encrypter is called with the correct value', async () => {
    const { sut, encrypterStub } = makeSut()
    const encrypterSpy = jest.spyOn(encrypterStub, 'encrypt')
    const accountInputData = {
      name: 'some name',
      email: 'someemail@mail.com',
      password: 'somepass'
    }

    await sut.handle(accountInputData)
    expect(encrypterSpy).toHaveBeenCalledWith('somepass')
  })

  it('should throw an exception when the encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut()
    const enscripterSpy = jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const accountInputData = {
      name: 'some name',
      email: 'someemail@mail.com',
      password: 'somepass'
    }

    const promise = sut.handle(accountInputData)
    await expect(promise).rejects.toThrow()
  })

  it('should ensure that the addAccountRepository is called with correct data', async () => {
    const { sut, addAccountRepositoryStub } = makeSut()
    const addAccountRepositorySpy = jest.spyOn(addAccountRepositoryStub, 'add')

    const accountInputData = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    }

    await sut.handle(accountInputData)
    expect(addAccountRepositorySpy).toHaveBeenCalledWith({
      name: 'valid_name',
      email: 'valid_email',
      password: 'hashed_password'
    })
  })

  it('should throw an exception when the addAccountRepository throws', async () => {
    const { sut, addAccountRepositoryStub } = makeSut()
    const addAccountRepositorySpy = jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const accountInputData = {
      name: 'some name',
      email: 'someemail@mail.com',
      password: 'somepass'
    }

    const promise = sut.handle(accountInputData)
    await expect(promise).rejects.toThrow()
  })

  it('should create and return a account', async () => {
    const { sut } = makeSut()

    const accountInputData = {
      name: 'some name',
      email: 'someemail@mail.com',
      password: 'somepass'
    }

    const account = await sut.handle(accountInputData)
    expect(account).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email',
      password: 'hashed_password'
    })
  })
})
