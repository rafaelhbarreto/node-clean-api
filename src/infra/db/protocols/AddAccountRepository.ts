import { Account } from '@/domain/models/account'
import { AddAccount } from '@/domain/usecases/create-account'

export interface AddAccountRepository {
  add(account: AddAccount): Promise<Account>
}
