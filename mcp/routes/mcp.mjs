import express from 'express'
import {
    deliverStimulus,
    generateConfig,
    evaluateCapture,
} from '../services/pavlok.mjs'
const mcpRoutes = express.Router()

mcpRoutes.get('/', (req, res) => {
    res.send('🧠 MCP server for Screen Shock is running!')
})
mcpRoutes.post('/generate-config', async (req, res)=>{
    const { description } = req.body
    const config = await generateConfig(description)
    res.json(config)
})
mcpRoutes.post('/evaluate-capture', async (req, res)=>{
    const { screenshot, allowlist, blocklist } = req.body
    const result = await evaluateCapture({ screenshot, allowlist, blocklist })
    res.json(result)
})
mcpRoutes.post('/deliver-stimulus', async (req, res)=>{
    const { pavlok_token } = req.body
    const result = await deliverStimulus(pavlok_token)
    res.json(result)
})

export default mcpRoutes