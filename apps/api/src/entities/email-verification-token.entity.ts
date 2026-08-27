import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

// Server-generated, single-use, expiring token proving a Consumer controls
// the email address on their account. Deliberately not attached to the
// Consumer as a relation - AuthService looks it up by the opaque token
// value alone, exactly like a password-reset token would be.
@Entity('email_verification_tokens')
export class EmailVerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'consumer_id', type: 'uuid' })
  consumerId: string;

  @Column({ unique: true, length: 128 })
  token: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  // Set the first (and only) time the token is successfully consumed.
  // A present usedAt makes the token permanently rejected, even if it
  // hasn't technically expired yet.
  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
