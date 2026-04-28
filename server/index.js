const express = require("express")
const cors = require("cors")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const Replicate = require("replicate")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { GoogleGenerativeAI } = require("@google/generative-ai")
const sharp = require("sharp")
const axios = require("axios")
require("dotenv").config()

const app = express()

// ── Gemini API Logic ───────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)


// Increase JSON payload limit just in case
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

app.use(cors())

// Serve garment images
app.use("/garments", express.static(
  path.join(__dirname, "../client/public/garments")
))

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.fieldname + path.extname(file.originalname))
  }
})
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per image
})

app.post(
  "/tryon",
  upload.fields([
    { name: "user_image", maxCount: 1 },
    { name: "garment_image", maxCount: 1 }
  ]),
  async (req, res) => {
    // Prevent the request from timing out (Node 18+ default is 2 mins)
    req.setTimeout(600000) // 10 minutes
    res.setTimeout(600000)

    try {
      const userImageFile = req.files?.["user_image"]?.[0]
      const garmentImageFile = req.files?.["garment_image"]?.[0]

      if (!userImageFile || !garmentImageFile) {
        return res.status(400).json({ success: false, error: "Both images are required" })
      }

      console.log("Received human image:", userImageFile.filename)
      console.log("Received garment image:", garmentImageFile.filename)

      // Convert images to base64 data URIs
      const humanBase64 = fs.readFileSync(userImageFile.path).toString("base64")
      const garmentBase64 = fs.readFileSync(garmentImageFile.path).toString("base64")
      
      const humanMime = userImageFile.mimetype || "image/jpeg"
      const garmentMime = garmentImageFile.mimetype || "image/jpeg"

      const humanDataUri = `data:${humanMime};base64,${humanBase64}`
      const garmentDataUri = `data:${garmentMime};base64,${garmentBase64}`

      // Clean up files immediately
      fs.unlink(userImageFile.path, () => {})
      fs.unlink(garmentImageFile.path, () => {})

      console.log("Calling Replicate API...")

      const output = await replicate.run("cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4", {
        input: {
          human_img: humanDataUri,
          garm_img: garmentDataUri,
          garment_des: "shirt",
          category: "upper_body",
          crop: false,
          steps: 30,
          seed: 42,
          force_dc: false,
          mask_only: false
        }
      })

      console.log("Replicate output success:", output)

      const resultUrl = Array.isArray(output) ? output[0] : output

      if (!resultUrl) {
        return res.status(500).json({ success: false, error: "Replicate returned empty image" })
      }

      res.json({ success: true, result: resultUrl })

    } catch (err) {
      console.error("Replicate Error Details:", JSON.stringify(err?.response?.data || err.message || err, null, 2))
      // Replicate errors can be nested in various places
      const errorMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.detail ||
        err?.message ||
        "Unknown error from Replicate"
      res.status(500).json({ success: false, error: errorMsg })
    }
  }
)

// ── Gemini Virtual Try-On (Nano Banana Style) ─────────────────────────
app.post(
  "/tryon-gemini",
  upload.fields([
    { name: "user_image",    maxCount: 1 },
    { name: "garment_image", maxCount: 1 }
  ]),
  async (req, res) => {
    // Extended timeout for large images and generation
    req.setTimeout(600000);
    res.setTimeout(600000);

    try {
      const userFile    = req.files?.["user_image"]?.[0]
      const garmentFile = req.files?.["garment_image"]?.[0]

      if (!userFile || !garmentFile) {
        return res.status(400).json({ success: false, error: "Both images are required" })
      }

      console.log(`Processing Gemini Try-On: ${userFile.filename} + ${garmentFile.filename}`);

      // Read images
      const userBuffer    = fs.readFileSync(userFile.path);
      const garmentBuffer = fs.readFileSync(garmentFile.path);

      // Get original metadata for exact resolution matching
      const metadata     = await sharp(userBuffer).metadata();
      const originalW    = metadata.width;
      const originalH    = metadata.height;

      const userBase64    = userBuffer.toString("base64")
      const garmentBase64 = garmentBuffer.toString("base64")
      const userMime      = userFile.mimetype    || "image/jpeg"
      const garmentMime   = garmentFile.mimetype || "image/jpeg"

      // Clean up uploads
      fs.unlink(userFile.path,    () => {})
      fs.unlink(garmentFile.path, () => {})

      console.log("Calling Gemini 2.0 Flash via Vercel AI Gateway (Nano Banana logic)…")

      const projectId = process.env.VERCEL_AI_PROJECT_ID
      const gatewayId = process.env.VERCEL_AI_GATEWAY_ID

      // High-fidelity image generation model (Nano Banana 2)
      const modelName = "gemini-3.1-flash-image-preview"
      
      let gatewayUrl;
      const useGateway = projectId && projectId !== "YOUR_PROJECT_ID_HERE" && gatewayId && gatewayId !== "YOUR_GATEWAY_ID_HERE";

      if (useGateway) {
        gatewayUrl = `https://gateway.ai.vercel.cloud/v1/projects/${projectId}/gateways/${gatewayId}/google-generative-ai/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      } else {
        console.warn("Vercel AI Gateway ID/Project ID not fully configured. Using direct Google API.");
        gatewayUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      }

      const response = await axios.post(gatewayUrl, {
        contents: [{
          role: "user",
          parts: [
            {
              text: `You are a state-of-the-art Virtual Try-On AI (Nano Banana logic). 
Generate a photorealistic fashion photo of the PERSON in Image 1 wearing the GARMENT from Image 2.

STRICT REQUIREMENTS:
- Identity Preservation: The person's face, features, hair, skin tone, and body proportions MUST be 100% IDENTICAL to Image 1.
- Seamless Integration: Replace ONLY their top/clothing with the garment from Image 2.
- Environment: Maintain the exact pose and background from Image 1.
- Realism: Lighting, shadows, and fabric folds must be physically accurate and high-end luxury fashion quality.
- Output: Return ONLY the resulting image. No text, no captions, no watermarks.`
            },
            { inlineData: { mimeType: userMime,    data: userBase64 } },
            { inlineData: { mimeType: garmentMime, data: garmentBase64 } }
          ]
        }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          temperature: 0.4,
        }
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VERCEL_AI_GATEWAY_API_KEY}`
        },
        timeout: 180000 // 3 minutes
      });

      const candidates = response.data?.candidates || []
      const parts = candidates[0]?.content?.parts || []
      const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith("image/"))

      if (!imagePart) {
        const textParts = parts.filter(p => p.text).map(p => p.text).join(" ")
        console.warn("Gemini through Gateway returned no image. Text:", textParts)
        return res.status(500).json({
          success: false,
          error: textParts || "Gemini did not return an image. Please ensure the photos are clear and try again."
        })
      }

      // ── Exact Resolution Matching Logic ──
      const aiImageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
      const matchedBuffer = await sharp(aiImageBuffer)
        .resize(originalW, originalH, { fit: 'fill' }) 
        .toBuffer();

      const dataUri = `data:${imagePart.inlineData.mimeType};base64,${matchedBuffer.toString("base64")}`
      console.log(`Success! Result dimensions matched: ${originalW}x${originalH} (via ${useGateway ? 'Gateway' : 'Direct API'})`);
      
      res.json({ success: true, result: dataUri })

    } catch (err) {
      console.error("Gemini try-on error details:", err.response?.data || err.message)
      const msg = err.response?.data?.error?.message || err.message || "Internal server error"
      res.status(500).json({ success: false, error: msg })
    }
  }
)

// Background Removal Endpoint
app.post("/api/remove-bg", async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "Image URL is required" });

    // Handle relative paths for local garments
    const fullUrl = imageUrl.startsWith('http') || imageUrl.startsWith('data:') 
      ? imageUrl 
      : `${req.protocol}://${req.get('host')}${imageUrl}`;

    console.log("Removing background for:", fullUrl);

    const output = await replicate.run(
      "cjwbw/rembg:fb8a57bb2118969796f75c40cba45a76c024c000c0a4425633cb9cea4240751e",
      {
        input: {
          image: fullUrl
        }
      }
    );

    console.log("BG removed successfully");
    res.json({ success: true, result: output });
  } catch (err) {
    console.error("Remove BG error:", err);
    res.status(500).json({ error: err.message || "Failed to remove background" });
  }
});

// Demos Endpoints
const DEMOS_FILE = path.join(__dirname, "demos.json")

// load demos
let demos = []
try {
  if (fs.existsSync(DEMOS_FILE)) {
    demos = JSON.parse(fs.readFileSync(DEMOS_FILE, "utf-8"))
  }
} catch (e) {
  console.error("Error reading demos.json", e)
}

app.get("/demos", (req, res) => {
  res.json(demos)
})

app.post("/demos", (req, res) => {
  try {
    const newDemo = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
    demos.push(newDemo)
    fs.writeFileSync(DEMOS_FILE, JSON.stringify(demos, null, 2))
    res.json({ success: true, demo: newDemo })
  } catch (err) {
    console.error("Failed to save demo", err)
    res.status(500).json({ success: false, error: "Failed to save demo" })
  }
})

// Authentication Endpoints
const JWT_SECRET = "vastra_luxury_secret_key_2026"
const USERS_FILE = path.join(__dirname, "users.json")

let users = []
try {
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"))
  }
} catch (e) {
  console.error("Error reading users.json", e)
}

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" })
    if (users.find(u => u.email === email)) return res.status(400).json({ error: "Email already exists" })

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = { id: Date.now().toString(), name, email, password: hashedPassword, createdAt: new Date().toISOString() }
    
    users.push(newUser)
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email }, token })
  } catch (err) {
    console.error("Signup error", err)
    res.status(500).json({ error: "Server error during signup" })
  }
})

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = users.find(u => u.email === email)
    if (!user) return res.status(400).json({ error: "Invalid credentials" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" })

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, token })
  } catch (err) {
    console.error("Login error", err)
    res.status(500).json({ error: "Server error during login" })
  }
})

app.get("/api/me", (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" })
    
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = users.find(u => u.id === decoded.id)
    
    if (!user) return res.status(401).json({ error: "User not found" })
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(401).json({ error: "Invalid token" })
  }
})

const PORT = 5000
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Set global timeout on the server to prevent Express dropping the connection
server.timeout = 600000 // 10 minutes
server.keepAliveTimeout = 600000
server.headersTimeout = 600000
// Trigger nodemon hot-reload