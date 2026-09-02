import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

// TAJRIBTI Admin identity (Founder ruling W-2, 2026-09-02): a real
// authenticated operator, replacing the sole reliance on the static
// `x-admin-secret` header as the final product model. The secret is kept
// working as a migration/emergency mechanism only (see
// admin.controller.ts's checkAdminAuth()) — every route it gates now also
// accepts a valid AdminUser JWT, and the secret is what bootstraps the
// first AdminUser (POST /admin/auth/bootstrap), not a parallel
// steady-state auth model.
//
// No role/permission field — every AdminUser has full cross-Company
// operator access, matching the one operator role the repository's
// governance documents actually describe ("Tajribti Admin/Ops... approves
// campaigns; manages brands; monitors platform health"). Adding a
// role/permission matrix beyond that would be the generic RBAC framework
// this task's own governance explicitly forbids.
@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
