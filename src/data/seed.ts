import type { Database, User } from "../types.js";

export const demoUsers: User[] = [
  { id: "u-fuhad", name: "Fuhad", email: "fuhad@fastonmed.com", password: "growth123", role: "Super Admin" },
  { id: "u-hashim", name: "Hashim", email: "hashim@fastonmed.com", password: "hashim123", role: "Operations Manager" },
  { id: "u-riyas", name: "Riyas", email: "riyas@fastonmed.com", password: "riyas123", role: "Sales Executive" },
  { id: "u-fidha", name: "Fidha", email: "fidha@fastonmed.com", password: "fidha123", role: "Client Relations" },
  { id: "u-user1", name: "User 1", email: "user1@fastonmed.com", password: "user123", role: "Staff" }
];

export const seedDatabase: Database = {
  employees: [],
  clients: [],
  people: [],
  leads: [],
  products: [],
  services: [],
  maintenanceContracts: [],
  tasks: [],
  invoices: []
};
