import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Cart } from "./cart.entity";
import * as Validator from 'class-validator';

@Index("uq_user_email", ["email"], { unique: true })
@Index("uq_user_phone_number", ["phoneNumber"], { unique: true })
@Entity("user")
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "user_id", unsigned: true })
  userId: number;

  @Column({
    type: "varchar",
    name: "email",
    unique: true,
    length: 255,
    default: () => "'0'",
  })
  @Validator.IsNotEmpty()
  @Validator.IsEmail({
    // eslint-disable-next-line @typescript-eslint/camelcase
    allow_utf8_local_part: true,
  })
  email: string;

  @Column({
    type: "varchar",
    name: "password_hash",
    length: 128,
    default: () => "'0'",
  })
  @Validator.IsNotEmpty()
  @Validator.IsHash('sha512')
  passwordHash: string;

  @Column({ type: "varchar", name: "firstname", length: 64, default: () => "'0'" })
  @Validator.IsNotEmpty()
  @Validator.IsString()
  @Validator.Length(2, 64)
  firstname: string;

  @Column({ type: "varchar", name: "lastname", length: 64, default: () => "'0'" })
  @Validator.IsNotEmpty()
  @Validator.IsString()
  @Validator.Length(2, 64)
  lastname: string;

  @Column({
    type: "varchar",
    name: "phone_number",
    unique: true,
    length: 24,
    default: () => "'0'",
  })
  @Validator.IsNotEmpty()
  @Validator.IsPhoneNumber(null)
  phoneNumber: string;

  @Column({ type: "text", name: "postal_address" })
  @Validator.IsNotEmpty()
  @Validator.IsString()
  @Validator.Length(10, 512)
  postalAddress: string;

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];
}
