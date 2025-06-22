import express from 'express'
import cors from 'cors'
import mcpRoutes from './routes/mcp.mjs'
import { McpServer, } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { z } from "zod"
const server = new McpServer({
  name: "shock-me-mcp",
  version: "1.0.0"
})
server.registerTool(
  "generate-config",
  {
    title: "Generate Config",
    description: "Generate a configuration for Screen Shock",
    inputSchema: { description: z.string() }
  },
  async ({ description })=>{
    const config = await generateConfig(description)
    console.log('Generated config:', config)
    result = {
      content: [{ type: "text", text: `${ config }` }]
    }
    return result
  }
)
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
// app.use('/mcp', mcpRoutes)
app.post('/mcp', async (req, res) =>{
  try{
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    })
    
    console.log('Received request on /mcp', transport)
  } catch (error) {
    console.error('Error in /mcp route:', error)
  }
})

app.get('/', (req, res)=>{
  res.send('🧠 MCP server for Screen Shock is running!')
})

app.listen(port, ()=>{
  console.log(`MCP listening at http://localhost:${ port }`)
})