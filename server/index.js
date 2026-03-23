const express = require("express")
const cors = require("cors")
const multer = require("multer")
const axios = require("axios")
const FormData = require("form-data")
const fs = require("fs")

const app = express()

app.use(cors())
app.use(express.json())

const upload = multer({ dest: "uploads/" })

app.post("/tryon", upload.single("image"), async (req, res) => {

  try {

    console.log("Image received")

    const form = new FormData()

    // user image
    form.append(
      "human_image",
      fs.createReadStream(req.file.path)
    )

    // demo garment image (put inside server folder)
    form.append(
      "garm_image",
      fs.createReadStream("demo-garment.png")
    )

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/yisol/IDM-VTON",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: "Bearer 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"
        },
        responseType: "arraybuffer"
      }
    )

    const base64 = Buffer.from(response.data).toString("base64")

    const result = `data:image/png;base64,${base64}`

    res.json({
      success: true,
      result
    })

  } catch (err) {

    console.log(err)

    res.json({
      success: false
    })

  }

})

app.listen(5000, () => {
  console.log("Server running on port 5000")
})