"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
let peopleStore = [];
router.get("/", (req, res) => {
    const { search, department, clientId } = req.query;
    let results = [...peopleStore];
    if (search) {
        const q = String(search).toLowerCase();
        results = results.filter((p) => p.name.toLowerCase().includes(q) ||
            p.designation.toLowerCase().includes(q) ||
            (p.clientName && p.clientName.toLowerCase().includes(q)));
    }
    if (department && department !== "All")
        results = results.filter((p) => p.department === department);
    if (clientId && clientId !== "All")
        results = results.filter((p) => p.clientId === clientId);
    return res.json({ success: true, count: results.length, data: results });
});
router.post("/", (req, res) => {
    const newPerson = {
        id: `person-${Date.now()}`,
        status: "Active at Organisation",
        history: [],
        ...req.body,
    };
    peopleStore.unshift(newPerson);
    return res.status(201).json({ success: true, data: newPerson });
});
router.put("/:id", (req, res) => {
    const idx = peopleStore.findIndex((p) => p.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ success: false, error: "Person not found" });
    peopleStore[idx] = { ...peopleStore[idx], ...req.body };
    return res.json({ success: true, data: peopleStore[idx] });
});
router.post("/:id/transfer", (req, res) => {
    const { newClientId, newClientName, newDesignation, notes } = req.body;
    const person = peopleStore.find((p) => p.id === req.params.id);
    if (!person)
        return res.status(404).json({ success: false, error: "Person not found" });
    const prevOrg = person.clientName || "Previous Organisation";
    person.previousOrganisation = prevOrg;
    person.clientId = newClientId;
    person.clientName = newClientName;
    if (newDesignation)
        person.designation = newDesignation;
    person.status = "Changed Organisation";
    person.history = person.history || [];
    person.history.unshift({
        date: new Date().toISOString().split("T")[0],
        action: `Transferred from ${prevOrg} to ${newClientName}. Notes: ${notes || "None"}`,
        fromOrg: prevOrg,
        toOrg: newClientName,
    });
    return res.json({ success: true, message: "Person transferred successfully", data: person });
});
exports.default = router;
