import jwt from "jsonwebtoken";
import { config } from "../config.js";
export function signUser(user) {
    return jwt.sign(user, config.jwtSecret, { expiresIn: "8h" });
}
export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) {
        res.status(401).json({ success: false, error: "Missing bearer token" });
        return;
    }
    try {
        req.user = jwt.verify(token, config.jwtSecret);
        next();
    }
    catch {
        res.status(401).json({ success: false, error: "Invalid or expired token" });
    }
}
