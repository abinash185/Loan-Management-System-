import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { ROLES, type Role } from "../types";
import mongoose from "mongoose";

const PASSWORD = "Test@1234";

const accounts: { name: string; email: string; role: Role }[] = [
  { name: "Admin User", email: "admin@lms.com", role: ROLES.ADMIN },
  { name: "Sales Exec", email: "sales@lms.com", role: ROLES.SALES },
  { name: "Sanction Exec", email: "sanction@lms.com", role: ROLES.SANCTION },
  { name: "Disbursement Exec", email: "disbursement@lms.com", role: ROLES.DISBURSEMENT },
  { name: "Collection Exec", email: "collection@lms.com", role: ROLES.COLLECTION },
  { name: "Test Borrower", email: "borrower@lms.com", role: ROLES.BORROWER },
];

async function seed() {
  await connectDB();
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  for (const acc of accounts) {
    await User.findOneAndUpdate(
      { email: acc.email },
      { ...acc, passwordHash },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Seeded ${acc.role.padEnd(13)} ${acc.email}`);
  }

  console.log(`\nPassword for all accounts: ${PASSWORD}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});