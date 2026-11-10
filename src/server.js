const http = require("node:http");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.POSTGRES_DB || "tasksdb",
  user: process.env.POSTGRES_USER || "appuser",
  password: process.env.POSTGRES_PASSWORD || "change-me"
});

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    try {
      await pool.query("SELECT 1");
      return send(res, 200, { status: "ok", database: "connected" });
    } catch {
      return send(res, 503, { status: "unavailable", database: "disconnected" });
    }
  }

  if (req.method === "GET" && req.url === "/api/tasks") {
    try {
      await pool.query("CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, title TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())");
      const result = await pool.query("SELECT id, title, created_at FROM tasks ORDER BY id DESC");
      return send(res, 200, result.rows);
    } catch {
      return send(res, 500, { error: "Could not fetch tasks" });
    }
  }

  if (req.method === "POST" && req.url === "/api/tasks") {
    let raw = "";
    req.on("data", chunk => { raw += chunk; if (raw.length > 10000) req.destroy(); });
    req.on("end", async () => {
      try {
        const body = JSON.parse(raw || "{}");
        if (typeof body.title !== "string" || !body.title.trim()) return send(res, 400, { error: "title is required" });
        await pool.query("CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, title TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())");
        const result = await pool.query("INSERT INTO tasks(title) VALUES($1) RETURNING id, title, created_at", [body.title.trim()]);
        return send(res, 201, result.rows[0]);
      } catch {
        return send(res, 400, { error: "Invalid request or database error" });
      }
    });
    return;
  }

  return send(res, 404, { error: "Not found" });
});

const port = Number(process.env.PORT || 3000);
server.listen(port, "0.0.0.0", () => console.log(`API listening on ${port}`));
