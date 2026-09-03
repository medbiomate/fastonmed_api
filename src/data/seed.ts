import type { Database, User } from "../types.js";

export const demoUsers: User[] = [
  { id: "u-fuhad", name: "Fuhad", email: "fuhad@fastonmed.com", password: "growth123", role: "Super Admin" },
  { id: "u-hashim", name: "Hashim", email: "hashim@fastonmed.com", password: "hashim123", role: "Operations Manager" },
  { id: "u-riyas", name: "Riyas", email: "riyas@fastonmed.com", password: "riyas123", role: "Sales Executive" },
  { id: "u-fidha", name: "Fidha", email: "fidha@fastonmed.com", password: "fidha123", role: "Client Relations" },
  { id: "u-user1", name: "User 1", email: "user1@fastonmed.com", password: "user123", role: "Staff" }
];

export const seedDatabase: Database = {
  employees: [
    {
      id: "emp-fuhad",
      name: "Fuhad",
      role: "Super Admin",
      department: "Management",
      phone: "+971 50 000 0001",
      email: "fuhad@fastonmed.com",
      joiningDate: "2020-01-01",
      assignedClients: [],
      performance: { leadsAssigned: 0, dealsClosed: 0, revenue: 0, serviceTickets: 0, rating: 5.0 },
      status: "Active"
    },
    {
      id: "emp-hashim",
      name: "Hashim",
      role: "Operations Manager",
      department: "Management",
      phone: "+971 50 789 1234",
      email: "hashim@fastonmed.com",
      joiningDate: "2021-06-01",
      assignedClients: [],
      performance: { leadsAssigned: 0, dealsClosed: 0, revenue: 0, serviceTickets: 0, rating: 5.0 },
      status: "Active"
    },
    {
      id: "emp-riyas",
      name: "Riyas",
      role: "Sales Executive",
      department: "Sales",
      phone: "+971 50 890 2345",
      email: "riyas@fastonmed.com",
      joiningDate: "2022-01-15",
      assignedClients: [],
      performance: { leadsAssigned: 0, dealsClosed: 0, revenue: 0, serviceTickets: 0, rating: 5.0 },
      status: "Active"
    },
    {
      id: "emp-fidha",
      name: "Fidha",
      role: "Client Relations",
      department: "Administration",
      phone: "+971 50 901 3456",
      email: "fidha@fastonmed.com",
      joiningDate: "2022-04-10",
      assignedClients: [],
      performance: { leadsAssigned: 0, dealsClosed: 0, revenue: 0, serviceTickets: 0, rating: 5.0 },
      status: "Active"
    },
    {
      id: "emp-user1",
      name: "User 1",
      role: "Staff",
      department: "Sales",
      phone: "+971 50 111 2233",
      email: "user1@fastonmed.com",
      joiningDate: "2023-01-01",
      assignedClients: [],
      performance: { leadsAssigned: 0, dealsClosed: 0, revenue: 0, serviceTickets: 0, rating: 5.0 },
      status: "Active"
    }
  ],
  clients: [],
  people: [],
  leads: [],
  products: [],
  services: [],
  maintenanceContracts: [],
  tasks: [],
  invoices: []
};
