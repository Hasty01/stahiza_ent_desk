import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

// Define __dirname and __filename in ES Module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Set up body parser with large limits for high quality image uploads (base64)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Data directory configuration
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper functions for Database
const getPath = (filename: string) => path.join(DATA_DIR, filename);

function readData<T>(filename: string, defaultValue: T): T {
  const filePath = getPath(filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
    return defaultValue;
  }
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch (e) {
    console.error(`Error reading database file: ${filename}`, e);
    return defaultValue;
  }
}

function writeData<T>(filename: string, data: T): void {
  const filePath = getPath(filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error(`Error writing database file: ${filename}`, e);
  }
}

// Seed helper
function seedData() {
  const defaultProfiles = [
    {
      id: "admin-1",
      full_name: "Joel Hasty",
      username: "joel",
      role: "STAHIZA Entertainment President",
      email: "admin@stahiza.edu",
      password: "admin", // For testing
      approved: true
    },
    {
      id: "comm-2",
      full_name: "Nicoletta Ent",
      username: "nicoletta",
      role: "Graphics Coordinator & DJ Lead",
      email: "hastyjoel1@gmail.com",
      password: "admin", // For testing
      approved: true
    }
  ];

  const defaultEvents = [
    {
      id: "event-1",
      title: "STAHIZA Neon Inferno Bash",
      date: "2026-06-25T20:00:00-07:00",
      description: "Welcome to the ultimate glow-in-the-dark school party of the summer! Features electric light installations, high-voltage bass setups, and strobe showdowns. Dress code: High-contrast neon items.",
      image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "event-2",
      title: "Pulse-X DJ Arena Battle",
      date: "2026-07-15T18:30:00-07:00",
      description: "The official committee-hosted head-to-head sound clash. Our school's finest DJs battle it out with pulse remix frequencies, dynamic loopings, and custom crowd reactions. Winner takes the ultimate Sound Master Cup.",
      image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "event-3",
      title: "Cyber-Vibe Student Talent Night",
      date: "2026-08-01T17:00:00-07:00",
      description: "A digital showcase of singers, bands, rappers, and electronic musicians. Experience raw student talent framed by advanced laser mapping and neon backdrops. Food trucks and custom stage gear provided.",
      image_url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800"
    }
  ];

  const defaultShoutouts = [
    {
      id: "s-1",
      student_name: "Tevin Sparks",
      message: "Shoutout to the STAHIZA DJ committee! The transition between tracks at the pep rally was absolutely out of this world! Let's get more hardstyle next time!",
      song_request: "Strobe - deadmau5",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "s-2",
      student_name: "Amara Geller",
      message: "Ready for the Glow bash! Can someone ask Nicoletta to play some retro synthwave tracks around 9:00 PM?",
      song_request: "Midnight City - M83",
      created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ];

  const defaultGallery = [
    {
      id: "gal-1",
      url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800",
      caption: "Starlight Dance Arena",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "gal-2",
      url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800",
      caption: "DJ Booth in Nitro Glow",
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: "gal-3",
      url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800",
      caption: "Talent Stage Live lasers",
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "gal-4",
      url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
      caption: "Neon laser arches and dancing crowds",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ];

  readData("committee_profiles.json", defaultProfiles);
  readData("events.json", defaultEvents);
  readData("shoutouts.json", defaultShoutouts);
  readData("gallery.json", defaultGallery);
}

// Run initial seed
seedData();

// Serve statically uploaded media files
app.use("/uploads", express.static(UPLOADS_DIR));

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Auth Register Endpoint (Pending admin approval by default)
app.post("/api/auth/register", (req, res) => {
  const { email, username, password, fullName, role } = req.body;
  if (!email || !username || !password || !fullName || !role) {
    return res.status(400).json({ error: "Registration details incomplete. Ensure all fields are filled." });
  }

  const profiles = readData<any[]>("committee_profiles.json", []);
  const emailLower = email.trim().toLowerCase();
  const usernameLower = username.trim().toLowerCase();

  const exists = profiles.some(
    (p) => p.email.toLowerCase() === emailLower || (p.username && p.username.toLowerCase() === usernameLower)
  );

  if (exists) {
    return res.status(400).json({ error: "An account with this email address or username already exists in the system." });
  }

  const newProfile = {
    id: "comm-" + Math.random().toString(36).substring(2, 11),
    full_name: fullName.trim(),
    username: usernameLower,
    role: role.trim(),
    email: email.trim(),
    password: password,
    approved: false // Requires admin check
  };

  profiles.push(newProfile);
  writeData("committee_profiles.json", profiles);

  return res.status(201).json({
    success: true,
    message: "Clearance pending: Your registration is logged. An administrator must verify and approve it before you can log in."
  });
});

// 2. Auth Login Endpoint
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email or username and password are required." });
  }

  const profiles = readData<any[]>("committee_profiles.json", []);
  const searchKey = email.trim().toLowerCase();
  
  const user = profiles.find(
    (p) => 
      (p.email.toLowerCase() === searchKey || (p.username && p.username.toLowerCase() === searchKey)) && 
      p.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email, username, or passcode credentials" });
  }

  // Admin Approval Check
  if (user.approved === false) {
    return res.status(403).json({ error: "Clearance rejected: Your profile is pending Administrator approval." });
  }

  // Generate a mock JWT/Token session
  const token = Buffer.from(JSON.stringify({ id: user.id, email: user.email, time: Date.now() })).toString("base64");
  const userResponse = {
    id: user.id,
    full_name: user.full_name,
    role: user.role,
    email: user.email,
    approved: user.approved !== false
  };

  return res.json({ token, user: userResponse });
});

// Auth Verification middleware
const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access, missing token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decStr = Buffer.from(token, "base64").toString("utf8");
    const session = JSON.parse(decStr);
    
    const profiles = readData<any[]>("committee_profiles.json", []);
    const user = profiles.find((p) => p.id === session.id);

    if (!user) {
      return res.status(401).json({ error: "User session expired or invalid profile" });
    }

    if (user.approved === false) {
      return res.status(403).json({ error: "Account access suspended or unapproved." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid session token format" });
  }
};

// GET current authenticated user profile details
app.get("/api/auth/profile", authMiddleware, (req: any, res) => {
  res.json({
    id: req.user.id,
    full_name: req.user.full_name,
    role: req.user.role,
    email: req.user.email,
    approved: req.user.approved !== false
  });
});

// Profiles Management Endpoints (Only accessible by Authenticated Operators)
app.get("/api/profiles", authMiddleware, (req: any, res) => {
  const profiles = readData<any[]>("committee_profiles.json", []);
  const sanitized = profiles.map(({ password, ...rest }) => rest);
  res.json(sanitized);
});

app.post("/api/profiles/:id/approve", authMiddleware, (req: any, res) => {
  const { id } = req.params;
  const profiles = readData<any[]>("committee_profiles.json", []);
  const idx = profiles.findIndex((p) => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Committee profile not found." });
  }

  profiles[idx].approved = true;
  writeData("committee_profiles.json", profiles);

  res.json({ success: true, message: `Account approval verified for ${profiles[idx].full_name}` });
});

app.post("/api/profiles/:id/reject", authMiddleware, (req: any, res) => {
  const { id } = req.params;
  const profiles = readData<any[]>("committee_profiles.json", []);
  const idx = profiles.findIndex((p) => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Committee profile not found." });
  }

  profiles[idx].approved = false;
  writeData("committee_profiles.json", profiles);

  res.json({ success: true, message: `Account clearance revoked (set to false) for ${profiles[idx].full_name}` });
});

app.delete("/api/profiles/:id", authMiddleware, (req: any, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ error: "Operator safety protocol: You cannot purge your active profile." });
  }

  let profiles = readData<any[]>("committee_profiles.json", []);
  const exists = profiles.some((p) => p.id === id);

  if (!exists) {
    return res.status(404).json({ error: "Committee profile not found." });
  }

  profiles = profiles.filter((p) => p.id !== id);
  writeData("committee_profiles.json", profiles);

  res.json({ success: true, message: "Profile request purged from system log successfully." });
});

// 2. Events Endpoints
// GET list of upcoming events
app.get("/api/events", (req, res) => {
  const events = readData<any[]>("events.json", []);
  // Sort events by date ascending or descending as preferred
  res.json(events);
});

// CREATE dynamic event
app.post("/api/events", authMiddleware, (req, res) => {
  const { title, date, description, image_url } = req.body;
  if (!title || !date || !description) {
    return res.status(400).json({ error: "Missing required event fields (title, date, description)" });
  }

  const events = readData<any[]>("events.json", []);
  const newEvent = {
    id: "event-" + Math.random().toString(36).substr(2, 9),
    title,
    date,
    description,
    image_url: image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800"
  };

  events.push(newEvent);
  writeData("events.json", events);
  res.status(201).json(newEvent);
});

// EDIT/UPDATE existing event
app.put("/api/events/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { title, date, description, image_url } = req.body;

  const events = readData<any[]>("events.json", []);
  const eventIdx = events.findIndex((e) => e.id === id);

  if (eventIdx === -1) {
    return res.status(404).json({ error: "Event not found" });
  }

  const updatedEvent = {
    ...events[eventIdx],
    title: title || events[eventIdx].title,
    date: date || events[eventIdx].date,
    description: description || events[eventIdx].description,
    image_url: image_url || events[eventIdx].image_url
  };

  events[eventIdx] = updatedEvent;
  writeData("events.json", events);
  res.json(updatedEvent);
});

// DELETE single event
app.delete("/api/events/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  let events = readData<any[]>("events.json", []);
  const eventExists = events.some((e) => e.id === id);

  if (!eventExists) {
    return res.status(404).json({ error: "Event not found" });
  }

  events = events.filter((e) => e.id !== id);
  writeData("events.json", events);
  res.json({ success: true, message: "Event removed successfully" });
});

// 3. Shoutouts Endpoints
// GET all shoutouts
app.get("/api/shoutouts", (req, res) => {
  const shoutouts = readData<any[]>("shoutouts.json", []);
  // Sort by date descending (newest first)
  const sorted = [...shoutouts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(sorted);
});

// SUBMIT new public shoutout
app.post("/api/shoutouts", (req, res) => {
  const { student_name, message, song_request } = req.body;
  if (!student_name || !message) {
    return res.status(400).json({ error: "Student name and message are required." });
  }

  const shoutouts = readData<any[]>("shoutouts.json", []);
  const newShoutout = {
    id: "shoutout-" + Math.random().toString(36).substr(2, 9),
    student_name: student_name.trim(),
    message: message.trim(),
    song_request: song_request ? song_request.trim() : "",
    created_at: new Date().toISOString()
  };

  shoutouts.push(newShoutout);
  writeData("shoutouts.json", shoutouts);
  res.status(201).json(newShoutout);
});

// DELETE single inappropriate shoutout
app.delete("/api/shoutouts/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  let shoutouts = readData<any[]>("shoutouts.json", []);
  const exists = shoutouts.some((s) => s.id === id);

  if (!exists) {
    return res.status(404).json({ error: "Shoutout not found" });
  }

  shoutouts = shoutouts.filter((s) => s.id !== id);
  writeData("shoutouts.json", shoutouts);
  res.json({ success: true, message: "Shoutout deleted by administrator moderation" });
});

// 4. Gallery Endpoints
// GET list of gallery images
app.get("/api/gallery", (req, res) => {
  const gallery = readData<any[]>("gallery.json", []);
  const sorted = [...gallery].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(sorted);
});

// CREATE/ADD high-quality imagery to public gallery (base64 fallback supported)
app.post("/api/gallery", authMiddleware, (req, res) => {
  const { url, caption } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Image URL or source is required." });
  }

  const gallery = readData<any[]>("gallery.json", []);
  const newImage = {
    id: "gal-" + Math.random().toString(36).substr(2, 9),
    url,
    caption: caption || "Captured Vibe",
    created_at: new Date().toISOString()
  };

  gallery.push(newImage);
  writeData("gallery.json", gallery);
  res.status(201).json(newImage);
});

// DELETE single image from gallery
app.delete("/api/gallery/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  let gallery = readData<any[]>("gallery.json", []);
  const exists = gallery.some((g) => g.id === id);

  if (!exists) {
    return res.status(404).json({ error: "Gallery image not found" });
  }

  gallery = gallery.filter((g) => g.id !== id);
  writeData("gallery.json", gallery);
  res.json({ success: true, message: "Image removed from gallery" });
});

// 5. Secure local base64/binary image uploads mimicking Supabase storage
app.post("/api/upload", authMiddleware, (req, res) => {
  const { base64Data, filename } = req.body;
  
  if (!base64Data) {
    return res.status(400).json({ error: "Missing file payload" });
  }

  try {
    // Sanitize file name
    const cleanFilename = (filename || `upload-${Date.now()}.png`).replace(/[^a-zA-Z0-9.\-_]/g, "");
    const extension = path.extname(cleanFilename) || ".png";
    const baseName = path.basename(cleanFilename, extension);
    const finalFilename = `${baseName}-${Date.now()}${extension}`;
    
    // Extract base64 headers if present
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;

    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(base64Data, "base64");
    }

    const savePath = path.join(UPLOADS_DIR, finalFilename);
    fs.writeFileSync(savePath, buffer);

    const publicUrl = `/uploads/${finalFilename}`;
    res.json({ 
      url: publicUrl, 
      success: true,
      message: "Uploaded locally to active developer sandbox"
    });
  } catch (error: any) {
    console.error("Local file saving error: ", error);
    res.status(500).json({ error: "Server failed to save media file" });
  }
});


// ----------------------------------------------------
// VITE CLIENT/SPA INTEGRATION
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`STAHIZA Ent Desk server booting at local container endpoint: http://0.0.0.0:${PORT}`);
  });
}

startServer();
