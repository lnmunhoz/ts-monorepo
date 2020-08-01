import express from "express"
import { CommonModule } from "@monorepo/common"

const app = express()
const PORT = process.env.PORT || 4000

app.get("/hello", (req, res) => {
   res.status(200).send(`${CommonModule}`)
})

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`)
})
