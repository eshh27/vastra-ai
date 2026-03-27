const express = require("express")
const cors = require("cors")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const Replicate = require("replicate")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const app = express()

// Increase JSON payload limit just in case
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

app.use(cors())

// Serve garment images
app.use("/garments", express.static(
  path.join(__dirname, "../client/public/garments")
))

const replicate = new Replicate({ auth: "r8_MXW3VDYeTu4Qn8uPa6yjVSqgr4JAAzb3gB35r" })

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
      console.error("Replicate Error Details:", err)
      const errorMsg = err.response?.data?.detail || err.message || "Unknown error occurred"
      res.status(500).json({ success: false, error: errorMsg })
    }
  }
)

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