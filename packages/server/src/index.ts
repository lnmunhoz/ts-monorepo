import express from "express"
import { CommonModule } from "@monorepo/common"

const app = express()

app.listen(4000, () => {
   console.log(`The answer is ${CommonModule}`)
})
