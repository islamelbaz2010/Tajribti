import { prisma } from "./prisma";

// FOUNDER INNOVATION (OFD-08 auditability + OFD-19 traceability) — NOT
// Benchmark-required. Central writer for access/PII audit events so every
// privileged action leaves the same shaped record. Fire-and-report: audit
// failures are logged, never swallowed silently into the business action's
// success path — the action still completes, but the audit gap is visible
// in logs rather than hidden.
export async function writeAccessAudit(event: {
  actorKind: "ops" | "employee" | "consumer";
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId?: string | null;
}): Promise<void> {
  try {
    await prisma.accessAuditEvent.create({ data: { ...event, targetId: event.targetId ?? null } });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[audit] failed to write AccessAuditEvent", e);
  }
}
