"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoService = void 0;
const axios_1 = __importDefault(require("axios"));
class ZohoService {
    static cachedAccessToken = null;
    static tokenExpiresAt = 0;
    /**
     * Get an active access token using Refresh Token from Zoho Accounts
     */
    static async getAccessToken() {
        const clientId = process.env.ZOHO_CLIENT_ID;
        const clientSecret = process.env.ZOHO_CLIENT_SECRET;
        const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
        const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com";
        if (!clientId || !clientSecret || !refreshToken) {
            throw new Error("Zoho OAuth credentials (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN) not configured in .env");
        }
        // Return cached token if valid for at least 60 seconds
        if (this.cachedAccessToken && Date.now() < this.tokenExpiresAt - 60000) {
            return this.cachedAccessToken;
        }
        const tokenUrl = `${accountsUrl}/oauth/v2/token`;
        const params = new URLSearchParams({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "refresh_token",
        });
        const res = await axios_1.default.post(tokenUrl, params.toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        if (res.data.error) {
            throw new Error(`Zoho Token Error: ${res.data.error}`);
        }
        this.cachedAccessToken = res.data.access_token;
        this.tokenExpiresAt = Date.now() + (res.data.expires_in || 3600) * 1000;
        return this.cachedAccessToken;
    }
    /**
     * Fetch all contacts from Zoho Books
     */
    static async fetchZohoContacts() {
        const orgId = process.env.ZOHO_ORG_ID;
        const apiUrl = process.env.ZOHO_BOOKS_API_URL || "https://www.zohoapis.com/books/v3";
        const token = await this.getAccessToken();
        const response = await axios_1.default.get(`${apiUrl}/contacts`, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` },
            params: { organization_id: orgId },
        });
        return response.data.contacts || [];
    }
    /**
     * Fetch all invoices from Zoho Books
     */
    static async fetchZohoInvoices() {
        const orgId = process.env.ZOHO_ORG_ID;
        const apiUrl = process.env.ZOHO_BOOKS_API_URL || "https://www.zohoapis.com/books/v3";
        const token = await this.getAccessToken();
        const response = await axios_1.default.get(`${apiUrl}/invoices`, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` },
            params: { organization_id: orgId },
        });
        return response.data.invoices || [];
    }
    /**
     * Normalize Zoho Books Contacts into FastonMed Clients and People
     */
    static normalizeContacts(zohoContacts) {
        const clients = [];
        const people = [];
        for (const zc of zohoContacts) {
            const orgName = zc.company_name || zc.contact_name;
            const lower = orgName.toLowerCase();
            let orgType = "Clinic";
            if (lower.includes("hospital"))
                orgType = "Hospital";
            else if (lower.includes("government") || lower.includes("ministry") || lower.includes("authority"))
                orgType = "Government Institution";
            else if (lower.includes("diagnostic") || lower.includes("lab"))
                orgType = "Diagnostic Center";
            else if (lower.includes("surgery"))
                orgType = "Day Surgery Center";
            else if (lower.includes("pharmacy"))
                orgType = "Pharmacy Group";
            let state = "Dubai";
            const address = zc.billing_address?.state || zc.billing_address?.city || "";
            const stateLower = address.toLowerCase();
            if (stateLower.includes("abu dhabi"))
                state = "Abu Dhabi";
            else if (stateLower.includes("sharjah"))
                state = "Sharjah";
            else if (stateLower.includes("ajman"))
                state = "Ajman";
            else if (stateLower.includes("ras al khaimah"))
                state = "Ras Al Khaimah";
            else if (stateLower.includes("fujairah"))
                state = "Fujairah";
            else if (stateLower.includes("umm al quwain"))
                state = "Umm Al Quwain";
            const clientContacts = [];
            if (zc.contact_persons && zc.contact_persons.length > 0) {
                for (const cp of zc.contact_persons) {
                    const personName = [cp.first_name, cp.last_name].filter(Boolean).join(" ") || "Contact";
                    const person = {
                        id: cp.contact_person_id,
                        name: personName,
                        designation: cp.designation || "Staff",
                        department: this.mapDepartment(cp.department || cp.designation || ""),
                        phone: cp.phone || cp.mobile || zc.phone || zc.mobile || "+971",
                        whatsapp: cp.mobile || cp.phone,
                        email: cp.email || zc.email || "",
                        status: "Active at Organisation",
                        clientId: zc.contact_id,
                        clientName: orgName,
                        isPrimary: cp.is_primary_contact || false,
                    };
                    clientContacts.push(person);
                    people.push(person);
                }
            }
            else {
                const primaryPerson = {
                    id: `person-${zc.contact_id}`,
                    name: zc.contact_name,
                    designation: "Authorized Contact",
                    department: "Purchase",
                    phone: zc.phone || zc.mobile || "+971",
                    whatsapp: zc.mobile || zc.phone,
                    email: zc.email || "",
                    status: "Active at Organisation",
                    clientId: zc.contact_id,
                    clientName: orgName,
                    isPrimary: true,
                };
                clientContacts.push(primaryPerson);
                people.push(primaryPerson);
            }
            const client = {
                id: zc.contact_id,
                name: orgName,
                orgType,
                city: zc.billing_address?.city || state,
                state,
                phone: zc.phone || zc.mobile || "+971",
                email: zc.email || "",
                status: "Existing Customer",
                source: "Zoho Books",
                contacts: clientContacts,
                totalRevenue: 0,
                totalDeals: clientContacts.length,
                createdAt: new Date().toISOString().split("T")[0],
            };
            clients.push(client);
        }
        return { clients, people };
    }
    /**
     * Normalize Zoho Books Invoices into FastonMed Invoices
     */
    static normalizeInvoices(zohoInvoices) {
        return zohoInvoices.map((zi) => {
            let status = "Pending";
            const s = (zi.status || "").toLowerCase();
            if (s === "paid")
                status = "Paid";
            else if (s === "overdue")
                status = "Overdue";
            else if (s === "draft")
                status = "Draft";
            const items = (zi.line_items || []).map((li) => ({
                product: li.name || "Medical Equipment / Service",
                quantity: li.quantity || 1,
                unitPrice: li.rate || 0,
                amount: li.item_total || (li.quantity || 1) * (li.rate || 0),
            }));
            return {
                id: zi.invoice_id,
                invoiceNumber: zi.invoice_number || `INV-${zi.invoice_id}`,
                clientId: zi.customer_id,
                clientName: zi.customer_name || "Facility",
                amount: zi.total || 0,
                status,
                items,
                dueDate: zi.due_date || zi.date,
                createdAt: zi.date,
            };
        });
    }
    static mapDepartment(text) {
        const l = text.toLowerCase();
        if (l.includes("biomedical") || l.includes("engineer"))
            return "Biomedical Engineering";
        if (l.includes("purchase") || l.includes("procurement"))
            return "Purchase";
        if (l.includes("doctor") || l.includes("dr") || l.includes("physician") || l.includes("surgeon"))
            return "Doctor";
        if (l.includes("admin"))
            return "Administration";
        if (l.includes("finance") || l.includes("account"))
            return "Finance";
        if (l.includes("manage") || l.includes("director") || l.includes("ceo"))
            return "Management";
        if (l.includes("it") || l.includes("tech"))
            return "IT";
        return "Purchase";
    }
}
exports.ZohoService = ZohoService;
