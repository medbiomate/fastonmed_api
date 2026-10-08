import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
// Historical sample signatures: modified or real employee records are retained.
const samples = [
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
];
function canonical(value) {
    if (Array.isArray(value))
        return `[${value.map(canonical).join(",")}]`;
    if (value && typeof value === "object")
        return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
    return JSON.stringify(value);
}
const dataFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../data/db.json");
const raw = await readFile(dataFile, "utf8");
const db = JSON.parse(raw);
const signatures = new Set(samples.map(canonical));
const removable = db.employees.filter(employee => signatures.has(canonical(employee)));
console.log(`Unchanged sample employee profiles: ${removable.length}. Other records will be retained.`);
if (process.argv.includes("--apply") && removable.length) {
    const backup = `${dataFile}.before-demo-cleanup-${Date.now()}.bak`;
    await writeFile(backup, raw, { flag: "wx", mode: 0o600 });
    db.employees = db.employees.filter(employee => !signatures.has(canonical(employee)));
    await writeFile(dataFile, JSON.stringify(db, null, 2));
    console.log(`Removed ${removable.length} sample profiles. Backup: ${backup}`);
}
else {
    console.log("Dry run only. Stop the API, then rerun with --apply to back up and remove exact sample matches.");
}
