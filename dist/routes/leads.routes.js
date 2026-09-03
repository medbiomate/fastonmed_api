"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
let leadsStore = [];
router.get("/", (req, res) => {
    const { stage, assignedTo } = req.query;
    let results = [...leadsStore];
    if (stage && stage !== "All")
        results = results.filter((l) => l.stage === stage);
    if (assignedTo && assignedTo !== "All")
        results = results.filter((l) => l.assignedTo === assignedTo);
    return res.json({ success: true, count: results.length, data: results });
});
router.post("/", (req, res) => {
    const newLead = {
        id: `lead-${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
        stage: "New Inquiry",
        ...req.body,
    };
    leadsStore.unshift(newLead);
    return res.status(201).json({ success: true, data: newLead });
});
exports.default = router;
