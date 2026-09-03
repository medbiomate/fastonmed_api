import { Router } from "express";
import { nanoid } from "nanoid";
import { readDb, writeDb } from "../store/jsonStore.js";
import { fail, ok, today } from "../utils/http.js";
export function createCrudRouter(collection) {
    const router = Router();
    router.get("/", async (req, res) => {
        const db = await readDb();
        const search = String(req.query.search || "").toLowerCase();
        let rows = db[collection];
        if (search) {
            rows = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search));
        }
        ok(res, rows);
    });
    router.get("/:id", async (req, res) => {
        const db = await readDb();
        const item = db[collection].find((row) => row.id === req.params.id);
        if (!item)
            return fail(res, 404, "Record not found");
        return ok(res, item);
    });
    router.post("/", async (req, res) => {
        const db = await readDb();
        const item = {
            id: req.body.id || `${String(collection).slice(0, 3)}-${nanoid(8)}`,
            createdAt: req.body.createdAt || today(),
            ...req.body
        };
        db[collection].unshift(item);
        await writeDb(db);
        ok(res, item, 201);
    });
    router.put("/:id", async (req, res) => {
        const db = await readDb();
        const index = db[collection].findIndex((row) => row.id === req.params.id);
        if (index < 0)
            return fail(res, 404, "Record not found");
        const updated = { ...db[collection][index], ...req.body, id: req.params.id };
        db[collection][index] = updated;
        await writeDb(db);
        return ok(res, updated);
    });
    router.delete("/:id", async (req, res) => {
        const db = await readDb();
        const before = db[collection].length;
        const remaining = db[collection].filter((row) => row.id !== req.params.id);
        if (remaining.length === before)
            return fail(res, 404, "Record not found");
        db[collection] = remaining;
        await writeDb(db);
        return ok(res, { id: req.params.id });
    });
    return router;
}
