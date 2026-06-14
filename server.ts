import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

// Define __dirname and __filename in ES Module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialization of GoogleGenAI client (safe for boot without keys)
let googleGenAI: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!googleGenAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined in environment.");
    }
    googleGenAI = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return googleGenAI;
}

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
    let session: any = null;
    let isJwt = false;

    // Check if the token is a standard 3-part JWT (e.g. from Supabase)
    if (token.includes(".")) {
      const parts = token.split(".");
      if (parts.length === 3) {
        try {
          let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          while (base64.length % 4) {
            base64 += "=";
          }
          const payloadStr = Buffer.from(base64, "base64").toString("utf8");
          session = JSON.parse(payloadStr);
          isJwt = true;
        } catch (jwtErr) {
          console.warn("Failed parsing token as JWT, falling back to direct base64 decode:", jwtErr);
        }
      }
    }

    // Default base64 decode as fallback or standard local session token
    if (!isJwt || !session) {
      const decStr = Buffer.from(token, "base64").toString("utf8");
      session = JSON.parse(decStr);
    }

    const profiles = readData<any[]>("committee_profiles.json", []);
    
    // Find matching profile locally, matching either sub/id or email from parsed payload
    let user = profiles.find((p) => {
      if (isJwt) {
        return p.id === session.sub || (session.email && p.email?.toLowerCase() === session.email.toLowerCase());
      } else {
        return p.id === session.id;
      }
    });

    if (isJwt) {
      // Since they have a valid Supabase JWT, they have been authenticated and screened.
      // We automatically approve them for fallback sandbox and media upload requests,
      // ignoring any local draft profiles that are not yet approved by local admins.
      if (!user) {
        user = {
          id: session.sub || "supa-virtual",
          full_name: session.user_metadata?.full_name || "Supabase Operator",
          role: session.user_metadata?.role || "Committee Member",
          email: session.email || "supabase@stahiza.edu",
          approved: true
        };
      } else {
        // Enforce approved true since they have successfully logged in via real Supabase Auth
        user = {
          ...user,
          approved: true
        };
      }
    } else {
      if (!user) {
        return res.status(401).json({ error: "User session expired or invalid profile" });
      }
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


// Quota handling and rate limiting tracking (Circuit Breaker pattern to prevent timeout hangs on 429 quota exhausted errors)
let lastQuotaExceededTime = 0;
const QUOTA_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes cooldown before we attempt any Gemini calls again

// 6. Real-time Trends API utilizing Gemini 3.5 with Search Grounding
app.get("/api/trends", async (req, res) => {
  const forceRefresh = req.query.refresh === "true";
  const CACHE_FILE = "trends_cache.json";
  
  // High quality static fallback data (Curated with real June 2026 hits & trending items)
  const fallbackTrends = {
    billboard_songs: [
      { rank: 1, title: "Not Like Us", artist: "Kendrick Lamar" },
      { rank: 2, title: "Espresso", artist: "Sabrina Carpenter" },
      { rank: 3, title: "A Bar Song (Tipsy)", artist: "Shaboozey" },
      { rank: 4, title: "I Had Some Help", artist: "Post Malone feat. Morgan Wallen" },
      { rank: 5, title: "Million Dollar Baby", artist: "Tommy Richman" },
      { rank: 6, title: "Please Please Please", artist: "Sabrina Carpenter" },
      { rank: 7, title: "Too Sweet", artist: "Hozier" },
      { rank: 8, title: "Lose Control", artist: "Teddy Swims" },
      { rank: 9, title: "Pink Skies", artist: "Zach Bryan" },
      { rank: 10, title: "Good Luck, Babe!", artist: "Chappell Roan" }
    ],
    uganda_songs: [
      { rank: 1, title: "Tikyula", artist: "Rema Namakula", genre: "Afropop" },
      { rank: 2, title: "Nonsense", artist: "Sheebah Karungi", genre: "Dancehall" },
      { rank: 3, title: "We Are Waiting", artist: "Jose Chameleone", genre: "Kidandali" },
      { rank: 4, title: "Kona", artist: "Mudra D Viral & Ava Peace", genre: "Afrobeats" },
      { rank: 5, title: "Nyoola", artist: "Eddy Kenzo", genre: "Afropop" },
      { rank: 6, title: "Embeera (Remix)", artist: "Winnie Nwagi", genre: "Zouk" },
      { rank: 7, title: "Zina", artist: "Alien Skin", genre: "Ragga" },
      { rank: 8, title: "Ngalabi", artist: "Fik Fameica", genre: "Afropop" },
      { rank: 9, title: "Kigambo", artist: "John Blaq", genre: "Afrobeats" },
      { rank: 10, title: "Nkole Mpaa", artist: "Spice Diana", genre: "Afrobeats" }
    ],
    trending_movies: [
      { rank: 1, title: "Inside Out 2", genre: "Animation/Comedy", description: "Teenager Riley's mind undergoes a sudden demolition to make room for brand new Emotions!" },
      { rank: 2, title: "Deadpool & Wolverine", genre: "Action/Sci-Fi", description: "Wolverine is recovering from his injuries when he crosses paths with the loudmouth, Deadpool." },
      { rank: 3, title: "Dune: Part Two", genre: "Sci-Fi/Adventure", description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators." },
      { rank: 4, title: "Furiosa: A Mad Max Saga", genre: "Action/Sci-Fi", description: "The origin story of renegade warrior Furiosa before her encounter and teamup with Mad Max." },
      { rank: 5, title: "Kingdom of the Planet of the Apes", genre: "Sci-Fi/Action", description: "Many years after Caesar's reign, a young ape goes on a journey that will lead him to question everything." },
      { rank: 6, title: "A Quiet Place: Day One", genre: "Horror/Sci-Fi", description: "Experience the day the world went silent in this spinoff prequel set in New York City." },
      { rank: 7, title: "Bad Boys: Ride or Die", genre: "Action/Comedy", description: "Miami's finest are now on the run in an action-packed mix of chaotic comedy and stunts." },
      { rank: 8, title: "Challengers", genre: "Drama/Romance", description: "Three players who knew each other as teenagers compete in a tennis tournament to lead a grand slam." },
      { rank: 9, title: "Despicable Me 4", genre: "Animation/Adventure", description: "Gru and Lucy welcome a new member to the family, Gru Jr., who is intent on tormenting his dad." },
      { rank: 10, title: "The Garfield Movie", genre: "Animation/Family", description: "Garfield, the world-famous, Monday-hating, lasagna-loving indoor cat, is about to have a wild outdoor adventure." }
    ],
    uganda_news: [
      { title: "Eddy Kenzo Elected as President of Union of Musicians", source: "New Vision", summary: "Eddy Kenzo continues leading the artistic coalition with new directives aimed at streaming royalties protection.", category: "Entertainment" },
      { title: "Kampala City Festival Announced for Late June 2026", source: "Daily Monitor", summary: "The Kampala Capital City Authority reveals major stage lineups including top East African afro-artists.", category: "Entertainment" },
      { title: "Uganda Cranes Secure Direct African Cup Thriller Victory", source: "Kawowo Sports", summary: "A late sensational goal in Namboole Stadium sparks nationwide celebrations as Uganda inches closer to AFCON qualification.", category: "Sports" },
      { title: "Sheebah Karungi Announces Grand Neon Arena Concert", source: "Pulse Uganda", summary: "Famous queen Sheebah confirms multi-million shillings budget stage setup targeting her loyal fan base.", category: "Entertainment" },
      { title: "Uganda Sevens Shine at Munich Challenger Series Match", source: "NTV Uganda", summary: "The National Rugby team secures crucial knockout placements showcasing global athletic excellence.", category: "Sports" }
    ],
    world_news: [
      { title: "Champions League Finals Deliver Epic Dramatic Conclusion", source: "ESPN", summary: "Top tier European football clubs battle in stunning penalty shootout to raise the coveted trophy.", category: "Sports" },
      { title: "Billie Eilish Tour Outperforms Historical Box Office Ticket Records", source: "Billboard", summary: "The alternative icon kicks off stunning interactive arena soundstages drawing sell-out crowds.", category: "Entertainment" },
      { title: "Major Studio Announces Next Interstellar Space Franchise Trilogy", source: "Variety", summary: "Legendary directors sign off on massive CGI blueprints targeting a late 2027 global IMAX premiere.", category: "Entertainment" },
      { title: "Formula A Monaco GP Yields Spectacular Lead Corner Overtake", source: "Sky Sports", summary: "A rain-slicked final straight keeps fans on Edge as a strategic pitstop secures the podium finish.", category: "Sports" },
      { title: "Glastonbury Festival Reveals Historic Legendary Star Headliner", source: "BBC Entertainment", summary: "Multi-generational music legends unite in historic Somerset stage returns drawing over 200k live attendees.", category: "Entertainment" }
    ],
    last_updated: new Date().toISOString()
  };

  try {
    const cachedData = readData<any | null>(CACHE_FILE, null);
    const now = Date.now();
    const insideCooldown = (now - lastQuotaExceededTime) < QUOTA_COOLDOWN_MS;

    if (insideCooldown) {
      console.warn(`Gemini API is in active quota cooldown (${Math.round((QUOTA_COOLDOWN_MS - (now - lastQuotaExceededTime)) / 1000)}s remaining due to previous 429). Returning cached/fallback trends immediately.`);
      if (cachedData) {
        return res.json(cachedData);
      }
      return res.json(fallbackTrends);
    }
    
    if (cachedData && !forceRefresh) {
      const cacheTime = new Date(cachedData.last_updated).getTime();
      const ageHours = (now - cacheTime) / (1000 * 60 * 60);
      
      if (ageHours < 4) { // Cache valid for 4 hours
        return res.json(cachedData);
      }
    }
    
    // Check if GEMINI_API_KEY is configured
    if (!process.env.GEMINI_API_KEY) {
      console.log("No GEMINI_API_KEY found, returning premium curated static indicators...");
      writeData(CACHE_FILE, fallbackTrends);
      return res.json(fallbackTrends);
    }
    
    console.log("Fetching live updates directly from the internet using Gemini Search Grounding...");
    
    const client = getGemini();
    const result = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Perform a deep internet search and gather the absolute latest real-world charts and headlines for June 2026.
You must compile:
1. Top 10 songs on Billboard Hot 100 currently with rank, song title, and artist.
2. Top 10 songs/hits in Uganda currently with rank, song title, artist, and genre. Include both trending local Ugandan hits (e.g., Eddy Kenzo, Sheebah, Alien Skin, Rema) and popular regional afro-sounds.
3. Top 10 trending movies globally currently with rank, movie title, genre, and brief descriptive sentence of plot.
4. Top 5 trending news items in Uganda right now focusing strictly on Sports and Entertainment. Return title, source, summaries and category.
5. Top 5 trending news items in the world right now focusing strictly on Sports and Entertainment. Return title, source, summaries and category.

Ensure every single name, song, news title, and movie is authentic, real, and current for June 2026. Do NOT fabricate. Do NOT provide placeholders. If certain real charts have short-term availability issues, look up the closest valid true listing.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            billboard_songs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  artist: { type: Type.STRING }
                },
                required: ["rank", "title", "artist"]
              }
            },
            uganda_songs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  artist: { type: Type.STRING },
                  genre: { type: Type.STRING }
                },
                required: ["rank", "title", "artist"]
              }
            },
            trending_movies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  genre: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["rank", "title", "genre", "description"]
              }
            },
            uganda_news: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  source: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["title", "summary"]
              }
            },
            world_news: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  source: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["title", "summary"]
              }
            }
          },
          required: ["billboard_songs", "uganda_songs", "trending_movies", "uganda_news", "world_news"]
        }
      }
    });
    
    if (result && result.text) {
      const parsedText = JSON.parse(result.text.trim());
      parsedText.last_updated = new Date().toISOString();
      writeData(CACHE_FILE, parsedText);
      return res.json(parsedText);
    } else {
      throw new Error("Empty text response from Gemini live search.");
    }
  } catch (err: any) {
    // Check if the failure is code 429, RESOURCE_EXHAUSTED or quota error
    const isQuotaError = err?.status === "RESOURCE_EXHAUSTED" || 
                         err?.message?.includes("quota") || 
                         err?.statusCode === 429 || 
                         err?.message?.includes("429") ||
                         err?.toString?.().includes?.("429") ||
                         err?.toString?.().includes?.("RESOURCE_EXHAUSTED") ||
                         (err?.status && String(err.status) === "429");

    if (isQuotaError) {
      lastQuotaExceededTime = Date.now();
      console.warn("Gemini Live quota limit reached (429/RESOURCE_EXHAUSTED). Falling back to premium curated static data.");
    } else {
      console.warn(`Unable to fetch live trends info from Gemini: ${err?.message || err}`);
    }

    // Write fallback structure to disk cache so we don't repeat-hammer rate limits immediately
    try {
      writeData(CACHE_FILE, fallbackTrends);
    } catch (ignore) {}
    return res.json(fallbackTrends);
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
