import { useLocation } from "react-router-dom"
import { useState } from "react"
import axios from "axios"

function TryOn() {

  const location = useLocation()
  const product = location.state || {}
  const [result, setResult] = useState(null)
  const [userImage, setUserImage] = useState(null)
  const [userPreview, setUserPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUserImage(file)
    setUserPreview(URL.createObjectURL(file))
    setResult(null)
  }

  const handleTryOn = async () => {
    if (!userImage) {
      alert("Please upload your photo first")
      return
    }

    setLoading(true)
    setStatus("Preparing images…")
    setResult(null)

    try {
      // Fetch the selected garment image as a blob from the server static route
      const garmentUrl = product.image
        ? `http://localhost:5000/garments/${product.image.split("/").pop()}`
        : null

      if (!garmentUrl) {
        alert("No garment selected")
        setLoading(false)
        return
      }

      setStatus("Fetching garment image…")
      const garmentResp = await fetch(garmentUrl)
      const garmentBlob = await garmentResp.blob()
      const garmentFile = new File([garmentBlob], "garment.jpg", { type: garmentBlob.type })

      const formData = new FormData()
      formData.append("user_image", userImage)
      formData.append("garment_image", garmentFile)

      setStatus("Generating AI try-on… this may take up to 2 minutes")

      const res = await axios.post("http://localhost:5000/tryon", formData)

      if (res.data.success) {
        setResult(res.data.result)
        setStatus("Done! Here is your AI try-on result.")
      } else {
        setStatus("AI generation failed: " + (res.data.error || "unknown error"))
      }
    } catch (err) {
      console.error("TryOn error:", err)
      setStatus("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      padding: "20px 40px",
      fontFamily: "serif",
      background: "#FAF8F6",
      minHeight: "100vh"
    }}>

      <h1 style={{ letterSpacing: "4px", marginBottom: "10px", fontSize: "32px", fontWeight: 800 }}>AI Virtual Try-On</h1>
      <p style={{ color: "#888", marginBottom: "50px", marginTop: "10px", fontSize: "16px", letterSpacing: "1px" }}>
        Upload your photo and let AI show you wearing <strong style={{color:"#000"}}>{product.name || "this garment"}</strong>
      </p>

      {/* Two-panel preview */}
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", marginBottom: "30px" }}>

        {/* Garment panel */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#555", marginBottom: "10px", fontWeight: "bold" }}>Selected Garment</p>
          <img
            src={product.image || "/garments/demo.png"}
            alt="garment"
            style={{ width: "260px", borderRadius: "20px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
          />
          {product.name && <p style={{ marginTop: "10px", color: "#555" }}>{product.name}</p>}
        </div>

        {/* User photo panel */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#555", marginBottom: "10px", fontWeight: "bold" }}>Your Photo</p>
          {userPreview ? (
            <img
              src={userPreview}
              alt="your photo"
              style={{ width: "260px", borderRadius: "20px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
            />
          ) : (
            <div style={{
              width: "260px",
              height: "320px",
              borderRadius: "20px",
              border: "2px dashed #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#bbb",
              fontSize: "14px"
            }}>
              Upload a photo
            </div>
          )}
        </div>

        {/* Result panel */}
        {(loading || result) && (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#555", marginBottom: "10px", fontWeight: "bold" }}>AI Result</p>
            {loading ? (
              <div style={{
                width: "260px",
                height: "320px",
                borderRadius: "20px",
                border: "2px dashed #ccc",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
                fontSize: "14px",
                gap: "12px"
              }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  border: "3px solid #eee",
                  borderTop: "3px solid #333",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
                Generating…
              </div>
            ) : result ? (
              <img
                src={result}
                alt="AI try-on result"
                style={{ width: "260px", borderRadius: "20px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Upload input */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{
          display: "inline-block",
          padding: "10px 22px",
          borderRadius: "30px",
          background: "white",
          border: "1px solid #ccc",
          cursor: "pointer",
          fontSize: "14px"
        }}>
          Choose Photo
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
        </label>
        {userImage && (
          <span style={{ marginLeft: "12px", color: "#777", fontSize: "13px" }}>
            {userImage.name}
          </span>
        )}
      </div>

      {/* Generate button */}
      <button
        onClick={handleTryOn}
        disabled={loading}
        style={{
          padding: "15px 40px",
          borderRadius: "30px",
          background: loading ? "#999" : "black",
          color: "white",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "15px",
          letterSpacing: "1px"
        }}
      >
        {loading ? "GENERATING…" : "GENERATE TRY-ON"}
      </button>

      {/* Status text */}
      {status && (
        <p style={{ marginTop: "16px", color: "#666", fontSize: "14px" }}>{status}</p>
      )}

      {/* Download button when result is ready */}
      {result && (
        <div style={{ marginTop: "16px" }}>
          <a
            href={result}
            download="vastraverse-tryon.png"
            style={{
              padding: "10px 24px",
              borderRadius: "30px",
              background: "white",
              border: "1px solid #333",
              color: "#333",
              textDecoration: "none",
              fontSize: "13px"
            }}
          >
            Download Result
          </a>
        </div>
      )}

      {/* Spinner keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

    </div>
  )
}

export default TryOn