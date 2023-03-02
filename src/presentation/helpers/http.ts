import { Account } from '../controllers/signup/signup-protocols'
import { HttpResponse } from '../protocols/http'

export const badRequest = (error: Error): HttpResponse => ({
  statusCode: 400,
  body: error
})

export const created = (account: Account): HttpResponse => ({
  statusCode: 201,
  body: account
})
