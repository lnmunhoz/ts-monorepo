import {
   BaseEntity,
   Entity,
   JoinTable,
   OneToMany,
   PrimaryGeneratedColumn,
} from "typeorm"
import { AccountTransaction } from "./AccountTransaction"

@Entity()
export class Account extends BaseEntity {
   @PrimaryGeneratedColumn()
   id: number

   @OneToMany(
      (type) => AccountTransaction,
      (transaction) => transaction.account
   )
   @JoinTable()
   transactions: AccountTransaction[]
}
