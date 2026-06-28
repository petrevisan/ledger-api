import { eq } from "drizzle-orm";
import { db } from "../src/infra/database/client.js";
import {
  accountsTable,
  usersTable,
} from "../src/infra/database/schema.js";

/**
 * Seed de desenvolvimento.
 *
 * Insere alguns usuários + suas contas (1:1) para destravar o trabalho no
 * ledger — as entries têm FK para `accounts`, então precisamos de contas
 * existindo antes de qualquer transferência.
 *
 * Auth ainda não existe: o `password` é um placeholder. O hashing real entra
 * junto com o fluxo de cadastro/login. Re-executar é seguro (idempotente por
 * email).
 *
 * Rode com:  pnpm seed
 */
const SEED_USERS = [
  { name: "Alice", email: "alice@ledger.dev" },
  { name: "Bob", email: "bob@ledger.dev" },
  { name: "Carol", email: "carol@ledger.dev" },
];

async function seed() {
  for (const u of SEED_USERS) {
    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, u.email));

      if (existing) {
        console.log(`↩︎  ${u.email} já existe — pulando`);
        return;
      }

      const [user] = await tx
        .insert(usersTable)
        .values({
          name: u.name,
          email: u.email,
          password: "seed-placeholder-no-auth-yet", // TODO: hash real com o auth
        })
        .returning();

      const [account] = await tx
        .insert(accountsTable)
        .values({ userId: user.id })
        .returning();

      console.log(`✅ ${u.name.padEnd(6)} → account ${account.accountId}`);
    });
  }

  // Lista todas as contas do seed — copie os accountId para testar transferências.
  const accounts = await db
    .select({
      name: usersTable.name,
      email: usersTable.email,
      accountId: accountsTable.accountId,
    })
    .from(accountsTable)
    .innerJoin(usersTable, eq(accountsTable.userId, usersTable.id));

  console.log("\nContas disponíveis:");
  console.table(accounts);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed falhou:", err);
    process.exit(1);
  });
