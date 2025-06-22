import express from 'express'
import { deliverStimulus, generateConfig, evaluateCapture, } from '../services/pavlok.js'

const router = express.Router()

router.post('/generate-config', async (req, res)=>{
    // endpoint generate_list_client
    const { description } = req.body
    const config = await generateConfig(description)
    res.json(config)
})
router.post('/evaluate-capture-for-trigger', async (req, res)=>{
    // get_status_client
    const { screenshot, allowlist, blocklist } = req.body
    const result = await evaluateCapture({ screenshot, allowlist, blocklist })
    res.json(result)
})
router.post('/deliver-stimulus', async (req, res)=>{
    // not yet implemented
    const { pavlok_token } = req.body
    const result = await deliverStimulus(pavlok_token)
    res.json(result)
})

export default router