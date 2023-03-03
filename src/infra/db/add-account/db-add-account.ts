import { Account } from '@/domain/models/account'
import { AddAccount, CreateAccount } from '@/domain/usecases/create-account'
import { Encrypter } from '../protocols/encrypter'

export class DbAddAccount implements CreateAccount {
  constructor (private readonly encrypter: Encrypter) {}
  async handle (account: AddAccount): Promise<any> {
    await this.encrypter.encrypt(account.password)
    return new Promise((resolve) => resolve(null))
  }
}
