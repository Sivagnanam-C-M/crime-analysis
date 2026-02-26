const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()
console.log("Loaded URI:", process.env.MONGO_URI)
const path = require("path")

console.log("Starting server...")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully")
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:")
    console.error(err.message)
    process.exit(1)
  })
  
const CrimeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now }
})

const Crime = mongoose.model("Crime", CrimeSchema)

app.post("/report", async (req, res) => {
  try {
    const { type, location, description } = req.body

    if (!type || !location || !description) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const crime = new Crime({ type, location, description })
    await crime.save()

    res.status(201).json({ message: "Report submitted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/statistics", async (req, res) => {
  try {
    const total = await Crime.countDocuments()
    const cyber = await Crime.countDocuments({ type: "Cybercrime" })

    res.json({ total, cyber })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})