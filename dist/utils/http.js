export function ok(res, data, status = 200) {
    return res.status(status).json({ success: true, data });
}
export function fail(res, status, error, details) {
    return res.status(status).json({ success: false, error, details });
}
export function today() {
    return new Date().toISOString().slice(0, 10);
}
