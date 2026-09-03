"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zoho_service_1 = require("../services/zoho.service");
const router = (0, express_1.Router)();
/**
 * GET /api/zoho/status
 * Get connection status and configuration
 */
router.get("/status", (req, res) => {
    const isConfigured = Boolean(process.env.ZOHO_ORG_ID &&
        process.env.ZOHO_CLIENT_ID &&
        process.env.ZOHO_CLIENT_SECRET &&
        process.env.ZOHO_REFRESH_TOKEN);
    return res.json({
        success: true,
        connectionName: process.env.ZOHO_CONNECTION_NAME || "fastonmedcrm",
        organizationId: process.env.ZOHO_ORG_ID || null,
        isConfigured,
        service: "zoho_books",
    });
});
/**
 * GET /api/zoho/sync
 * Pull live contacts and invoices from Zoho Books API and return normalized FastonMed records
 */
router.get("/sync", async (req, res) => {
    try {
        const rawContacts = await zoho_service_1.ZohoService.fetchZohoContacts();
        const rawInvoices = await zoho_service_1.ZohoService.fetchZohoInvoices();
        const { clients, people } = zoho_service_1.ZohoService.normalizeContacts(rawContacts);
        const invoices = zoho_service_1.ZohoService.normalizeInvoices(rawInvoices);
        // Calculate revenue per client from invoices
        for (const inv of invoices) {
            const client = clients.find((c) => c.id === inv.clientId);
            if (client) {
                client.totalRevenue += inv.amount;
            }
        }
        return res.json({
            success: true,
            message: `Successfully synced ${clients.length} facilities, ${people.length} people, and ${invoices.length} invoices from Zoho Books`,
            data: {
                clients,
                people,
                invoices,
                stats: {
                    totalClients: clients.length,
                    totalPeople: people.length,
                    totalInvoices: invoices.length,
                    syncedAt: new Date().toISOString(),
                },
            },
        });
    }
    catch (err) {
        console.error("Zoho Sync Error:", err.message);
        return res.status(500).json({
            success: false,
            error: err.message || "Failed to sync from Zoho Books",
            details: err.response?.data || null,
        });
    }
});
/**
 * POST /api/zoho/webhook
 * Receives Webhook / Deluge invokeUrl payloads from Zoho Books Automation
 */
router.post("/webhook", (req, res) => {
    const payload = req.body;
    console.log("Received Zoho Books Webhook Event:", JSON.stringify(payload, null, 2));
    let clients = [];
    let people = [];
    let invoices = [];
    if (payload.contacts) {
        const normalized = zoho_service_1.ZohoService.normalizeContacts(payload.contacts);
        clients = normalized.clients;
        people = normalized.people;
    }
    if (payload.invoices) {
        invoices = zoho_service_1.ZohoService.normalizeInvoices(payload.invoices);
    }
    return res.json({
        success: true,
        message: "Zoho webhook processed successfully",
        imported: {
            clientsCount: clients.length,
            peopleCount: people.length,
            invoicesCount: invoices.length,
        },
        data: { clients, people, invoices },
    });
});
exports.default = router;
