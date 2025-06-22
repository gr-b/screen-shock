import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mcpRoutes from './routes/mcp.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/api', mcpRoutes)

app.get('/', (req, res) => {
  res.send('🧠 MCP server for Screen Shock is running!')
})

app.listen(port, () => {
  console.log(`MCP listening at http://localhost:${port}`)
})