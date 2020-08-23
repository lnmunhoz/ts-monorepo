import faker from "faker"
import "reflect-metadata"
import {
   createConnection,
   getConnection,
   getManager,
   QueryFailedError,
} from "typeorm"
import { v4 as uuid } from "uuid"
import { Account } from "../typeorm/entities/Account"
import {
   AccountTransaction,
   TransactionType,
} from "../typeorm/entities/AccountTransaction"
import { User } from "../typeorm/entities/User"

jest.setTimeout(30000)

beforeAll(async (done) => {
   createConnection({
      type: "postgres",
      url: "postgres://postgres:postgres@localhost:7777/typeorm",
      synchronize: true,
      entities: [User, Account, AccountTransaction],
      // logging: true,
   })
      .then(async (conn) => {
         await getManager().getRepository(AccountTransaction).delete({})
         await getManager().getRepository(Account).delete({})

         done()
      })
      .catch((err) => {
         console.log(err)
         fail(err.message)
      })
})

afterAll(async (done) => {
   setTimeout(async () => {
      await getManager().connection.close()
   }, 3000)

   done()
})

const ALREADY_REFUNDED_ERROR = "Transaction already refunded"

async function refundTransactions(reference: string) {
   return await getManager().transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
         const transactionsRepo = transactionalEntityManager.getRepository(
            AccountTransaction
         )

         const transactionsOfRef = await transactionsRepo.find({
            where: {
               reference: reference,
            },
         })

         const hasRefund = transactionsOfRef.find(
            (t) => t.type === TransactionType.REFUND
         )

         if (hasRefund) {
            throw new Error(ALREADY_REFUNDED_ERROR)
         }

         const refunds = transactionsOfRef.map((t) => {
            return transactionsRepo.create({
               account: t.account,
               reference: reference,
               amount: t.amount * -1,
               type: TransactionType.REFUND,
            })
         })

         await transactionalEntityManager.save(refunds)
      }
   )
}

describe("account", () => {
   let providerAccount: Account
   let agentAccount: Account
   let chargeReference: string

   it("should setup accounts", async (done) => {
      providerAccount = new Account()
      agentAccount = new Account()

      await providerAccount.save()
      await agentAccount.save()

      expect(providerAccount.id).toBeDefined()
      expect(agentAccount.id).toBeDefined()
      done()
   })

   it("should add funds to agent account", async (done) => {
      const accountTransaction = new AccountTransaction()

      accountTransaction.account = agentAccount
      accountTransaction.amount = 2000
      accountTransaction.type = TransactionType.ADD_FUNDS

      await accountTransaction.save()

      agentAccount.transactions = await getConnection()
         .createQueryBuilder()
         .relation(Account, "transactions")
         .of(agentAccount) // you can use just post id as well
         .loadMany()

      expect(agentAccount.transactions).toHaveLength(1)
      done()
   })

   it("should charge agent and give comission", async (done) => {
      const comissionRate = 0.2
      const chargeAmount = 2000

      try {
         await getManager().transaction(async (transactionalEntityManager) => {
            const transactionsRepo = transactionalEntityManager.getRepository(
               AccountTransaction
            )

            const comission = chargeAmount * comissionRate
            const providerAmmount = chargeAmount - comission
            chargeReference = uuid()

            const accountTransactions = transactionsRepo.create([
               {
                  account: agentAccount,
                  amount: chargeAmount * -1,
                  type: TransactionType.CHARGE,
                  reference: chargeReference,
               },
               {
                  account: agentAccount,
                  amount: comission,
                  type: TransactionType.COMISSION_PAYOUT,
                  reference: chargeReference,
               },
               {
                  account: providerAccount,
                  amount: providerAmmount,
                  type: TransactionType.CREDIT,
                  reference: chargeReference,
               },
            ])

            await transactionalEntityManager.save(accountTransactions)

            done()
         })
      } catch (err) {
         console.log(err)
         done(err.message)
      }
   })

   it("should refund the transaction", async (done) => {
      try {
         await refundTransactions(chargeReference)

         const transactionsOfRefReloaded = await AccountTransaction.find({
            where: {
               reference: chargeReference,
            },
         })

         expect(transactionsOfRefReloaded).toHaveLength(6)
         done()
      } catch (err) {
         console.log(err)
         done(err.message)
      }
   })

   it("should fail if transaction already refunded", async (done) => {
      try {
         await refundTransactions(chargeReference)
      } catch (err) {
         expect(err.message).toBe(ALREADY_REFUNDED_ERROR)
         done()
      }
   })

   it.skip("should not perform double refund", async (done) => {
      try {
         await Promise.all([
            refundTransactions(chargeReference),
            refundTransactions(chargeReference),
         ])

         const transactionsOfRefReloaded = await AccountTransaction.find({
            where: {
               reference: chargeReference,
            },
         })

         expect(transactionsOfRefReloaded).toHaveLength(6)
         done()
      } catch (err) {
         expect(err).toBeInstanceOf(QueryFailedError)
         const transactionsOfRefReloaded = await AccountTransaction.find({
            where: {
               reference: chargeReference,
            },
         })

         expect(transactionsOfRefReloaded).toHaveLength(6)
         done()
      }
   })
})

describe("users", () => {
   it.skip("should create a new user in the db", async (done) => {
      const user = new User()

      user.firstName = faker.name.firstName()
      user.lastName = faker.name.lastName()
      user.age = faker.random.number({ min: 18, max: 12 })

      await user.save()

      expect(user.id).toBeDefined()
      done()
   })
})
