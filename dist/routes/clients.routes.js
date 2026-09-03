"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// In-memory store (can be connected to PostgreSQL / MongoDB / Prisma)
let clientsStore = [];
router.get("/", (req, res) => {
    const { search, state, orgType, status } = req.query;
    let results = [...clientsStore];
    if (search) {
        const q = String(search).toLowerCase();
        results = results.filter((c) => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
    }
    if (state && state !== "All")
        results = results.filter((c) => c.state === state);
    if (orgType && orgType !== "All")
        results = results.filter((c) => c.orgType === orgType);
    if (status && status !== "All")
        results = results.filter((c) => c.status === status);
    return res.json({ success: true, count: results.length, data: results });
});
router.post("/", (req, res) => {
    const newClient = {
        id: `client-${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
        contacts: [],
        totalRevenue: 0,
        totalDeals: 0,
        ...req.body,
    };
    clientsStore.unshift(newClient);
    return res.status(201).json({ success: true, data: newClient });
});
router.get("/:id", (req, res) => {
    const client = clientsStore.find((c) => c.id === req.params.id);
    if (!client)
        return res.status(404).json({ success: false, error: "Organisation not found" });
    return res.json({ success: true, data: client });
});
router.put("/:id", (req, res) => {
    const idx = clientsStore.findIndex((c) => c.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ success: false, error: "Organisation not found" });
    clientsStore[idx] = { ...clientsStore[idx], ...req.body };
    return res.json({ success: true, data: clientsStore[idx] });
});
router.delete("/:id", (req, res) => {
    clientsStore = clientsStore.filter((c) => c.id !== req.params.id);
    return res.json({ success: true, message: "Organisation deleted" });
});
exports.default = router;
