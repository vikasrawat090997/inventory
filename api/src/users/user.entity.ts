import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique ID of the user' })
  id: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'Username of the user' })
  username: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'Email address of the user' })
  email: string;

  @Column()
  @ApiProperty({ description: 'Hashed password of the user' })
  password: string;

  @Column()
  @ApiProperty({ description: 'Name of the pharmacy/medical store' })
  pharmacyName: string;
}
