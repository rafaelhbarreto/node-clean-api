import { Account } from '../models/account'

export interface AddAccount {
  name: string
  email: string
  password: string
}

export interface CreateAccount {
  handle(account: AddAccount): Account
}
