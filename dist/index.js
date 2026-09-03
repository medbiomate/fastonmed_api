"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const zoho_routes_1 = __importDefault(require("./routes/zoho.routes"));
const clients_routes_1 = __importDefault(require("./routes/clients.routes"));
const people_routes_1 = __importDefault(require("./routes/people.routes"));
const sales_routes_1 = __importDefault(require("./routes/sales.routes"));
const leads_routes_1 = __importDefault(require("./routes/leads.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// CORS setup
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:3002")
    .split(",")
    .map((url) => url.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Deluge webhook)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            return callback(null, true);
        }
        return callback(null, true); // Permissive in dev
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Health Check
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "FastonMed CRM API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
});
// Mount Routes
app.use("/api/zoho", zoho_routes_1.default);
app.use("/api/clients", clients_routes_1.default);
app.use("/api/people", people_routes_1.default);
app.use("/api/sales", sales_routes_1.default);
app.use("/api/leads", leads_routes_1.default);
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.url}` });
});
app.listen(PORT, () => {
    console.log(`🚀 FastonMed API Service running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`⚡ Zoho Sync: http://localhost:${PORT}/api/zoho/sync`);
});
