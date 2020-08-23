import {
   BaseEntity,
   Column,
   Entity,
   JoinTable,
   ManyToOne,
   OneToOne,
   PrimaryGeneratedColumn,
} from "typeorm"
import { Account } from "./Account"

export enum TransactionType {
   ADD_FUNDS = "ADD_FUNDS",
   CHARGE = "CHARGE",
   CREDIT = "CREDIT",
   COMISSION_PAYOUT = "COMISSION_PAYOUT",
   REFUND = "REFUND",
}

@Entity()
export class AccountTransaction extends BaseEntity {
   @PrimaryGeneratedColumn("uuid")
   id: string

   @Column()
   amount: number

   @ManyToOne((type) => Account, (account) => account.transactions, {
      eager: true,
      nullable: false,
   })
   @JoinTable()
   account: Account

   @Column({
      type: "enum",
      enum: TransactionType,
   })
   type: TransactionType

   @OneToOne(() => Account, {
      nullable: true,
   })
   from: Account

   @OneToOne(() => Account, {
      nullable: true,
   })
   to: Account

   @Column({
      nullable: true,
   })
   reference: string
}
