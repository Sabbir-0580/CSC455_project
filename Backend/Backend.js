const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = 3000;
const DATA_FILE = path.join(__dirname, "tasks.json");
const PUBLIC_DIR = path.join(__dirname, "public");

// ------------------------------------------------------------
// "Database" helpers — just reading/writing a JSON file.
// In a real app, these would be SQL queries instead.
// ------------------------------------------------------------

function readTasks() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  return raw.trim() ? JSON.parse(raw) : [];
}

function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// ------------------------------------------------------------
// Small helper to send a JSON response with the right headers.
// ------------------------------------------------------------

function sendJSON(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

// ------------------------------------------------------------
// Helper to read the request body (POST/PATCH send JSON in the
// body, but Node gives it to you in small chunks — you have to
// collect them yourself when not using a framework).
// ------------------------------------------------------------

function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = "";
    req.on("data", (chunk) => (chunks += chunk));
    req.on("end", () => {
      if (!chunks) return resolve({});
      try {
        resolve(JSON.parse(chunks));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

// ------------------------------------------------------------
// Serve static files (our HTML/CSS/JS) from ./public
// A real app might use nginx or a CDN for this part instead.
// ------------------------------------------------------------

function serveStatic(req, res) {
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(PUBLIC_DIR, filePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    const ext = path.extname(filePath);
    const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(content);
  });
}

// ------------------------------------------------------------
// The actual server: this function runs ONCE PER REQUEST.
// Routing = "if the URL/method matches this, do that."
// ------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  const url = req.url;
  const method = req.method;

  console.log(`${method} ${url}`); // simple request log, handy while learning

  try {
    // ---- GET /api/tasks — return the full list ----
    if (method === "GET" && url === "/api/tasks") {
      const tasks = readTasks();
      return sendJSON(res, 200, tasks);
    }

    // ---- POST /api/tasks — create a new task ----
    if (method === "POST" && url === "/api/tasks") {
      const body = await readBody(req);
      if (!body.text || !body.text.trim()) {
        return sendJSON(res, 400, { error: "text is required" });
      }
      const tasks = readTasks();
      const newTask = {
        id: crypto.randomUUID(),
        text: body.text.trim(),
        subject: body.subject || "Other",
        due: body.due || null,
        done: false,
        createdAt: Date.now(),
      };
      tasks.unshift(newTask);
      writeTasks(tasks);
      return sendJSON(res, 201, newTask);
    }

    // ---- PATCH /api/tasks/:id — update a task (e.g. toggle done) ----
    const patchMatch = url.match(/^\/api\/tasks\/([^/]+)$/);
    if (method === "PATCH" && patchMatch) {
      const id = patchMatch[1];
      const updates = await readBody(req);
      const tasks = readTasks();
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) return sendJSON(res, 404, { error: "task not found" });
      tasks[idx] = { ...tasks[idx], ...updates };
      writeTasks(tasks);
      return sendJSON(res, 200, tasks[idx]);
    }

    // ---- DELETE /api/tasks/:id — remove a task ----
    const deleteMatch = url.match(/^\/api\/tasks\/([^/]+)$/);
    if (method === "DELETE" && deleteMatch) {
      const id = deleteMatch[1];
      let tasks = readTasks();
      const before = tasks.length;
      tasks = tasks.filter((t) => t.id !== id);
      if (tasks.length === before) return sendJSON(res, 404, { error: "task not found" });
      writeTasks(tasks);
      return sendJSON(res, 204, {});
    }

    // ---- anything else: try to serve it as a static file ----
    return serveStatic(req, res);
  } catch (err) {
    console.error("Server error:", err);
    return sendJSON(res, 500, { error: "internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Task Manager backend running at http://localhost:${PORT}`);
  console.log(`API base: http://localhost:${PORT}/api/tasks`);
});