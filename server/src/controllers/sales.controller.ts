import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/User";
import { Loan } from "../models/Loan";
import { BorrowerProfile } from "../models/BorrowerProfile";
import { ROLES } from "../types";

export const listLeads = asyncHandler(async (_req, res) => {
  const appliedBorrowers = await Loan.distinct("borrower");

  const users = await User.find({ role: ROLES.BORROWER, _id: { $nin: appliedBorrowers } })
    .sort({ createdAt: -1 })
    .lean();

  const profiles = await BorrowerProfile.find({ user: { $in: users.map((u) => u._id) } }).lean();
  const profileByUser = new Map(profiles.map((p) => [String(p.user), p]));

  const leads = users.map((u) => {
    const p = profileByUser.get(String(u._id));
    const stage = !p ? "REGISTERED" : p.salarySlip?.path ? "SLIP_UPLOADED" : "DETAILS_SAVED";
    return { id: u._id, name: u.name, email: u.email, registeredAt: u.createdAt, stage };
  });

  res.json({ success: true, data: { count: leads.length, leads } });
});