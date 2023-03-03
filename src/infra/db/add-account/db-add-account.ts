import { Account } from '@/domain/models/account'
import { AddAccount, CreateAccount } from '@/domain/usecases/create-account'
import { AddAccountRepository } from '../protocols/AddAccountRepository'
import { Encrypter } from '../protocols/encrypter'

export class DbAddAccount implements CreateAccount {
  constructor (
    private readonly encrypter: Encrypter,
    private readonly addAccountRepository: AddAccountRepository
  ) {}

  async handle (account: AddAccount): Promise<any> {
    const hashedPassword = await this.encrypter.encrypt(account.password)
    const createdAccount = await this.addAccountRepository.add(Object.assign({}, account, { password: hashedPassword }))

    return createdAccount
  }
}
