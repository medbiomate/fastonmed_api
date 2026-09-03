"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
let invoicesStore = [];
router.get("/invoices", (req, res) => {
    const { status, clientId } = req.query;
    let results = [...invoicesStore];
    if (status && status !== "All")
        results = results.filter((i) => i.status === status);
    if (clientId)
        results = results.filter((i) => i.clientId === clientId);
    return res.json({ success: true, count: results.length, data: results });
});
router.post("/invoices", (req, res) => {
    const newInvoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoicesStore.length + 1).padStart(4, "0")}`,
        createdAt: new Date().toISOString().split("T")[0],
        status: "Pending",
        ...req.body,
    };
    invoicesStore.unshift(newInvoice);
    return res.status(201).json({ success: true, data: newInvoice });
});
router.post("/invoices/:id/remind", (req, res) => {
    const invoice = invoicesStore.find((i) => i.id === req.params.id);
    if (!invoice)
        return res.status(404).json({ success: false, error: "Invoice not found" });
    return res.json({
        success: true,
        message: `Payment reminder dispatched to ${invoice.clientName} for ${invoice.invoiceNumber}`,
    });
});
exports.default = router;
