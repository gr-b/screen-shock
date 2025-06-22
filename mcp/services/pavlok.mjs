import axios from 'axios'
const url = 'https://screenshock.me/api'
/* functions */
async function deliverStimulus(pavlok_token, stimulusType='beep', stimulusValue=100){
    const url = 'https://api.pavlok.com/api/v5/stimulus/send'
    try {
        const response = await axios.post(
            url,
            {
                stimulus: {
                    stimulusType, // 'beep', 'vibrate', or 'zap'
                    stimulusValue, // 1–100 intensity
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${ pavlok_token }`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        )
        return {
            success: true,
            message: 'Stimulus delivered',
            data: response.data
        }
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || error.message,
            error: error.response?.data || null
        }
    }
}
async function evaluateCapture({ screenshot, allowlist, blocklist }){
    const localUrl = url + '/evaluate-capture-for-trigger'
    try {
        const response = await axios.post(
            localUrl,
            { screenshot, allowlist, blocklist },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        console.log('Response from evaluateCapture:', response)
        return response
    } catch(error) {
        console.error('Error calling evaluateCapture:', error.message)
    }
}
async function generateConfig(description){
    const localUrl = url + '/generate_config'
    try {
        const response = await axios.post(
            localUrl,
            { description },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        console.log('Response from generateConfig:', response.data)
        return response.data
    } catch(error) {
        console.error('Error calling generateConfig:', error.message)
    }
}
export {
    deliverStimulus,
    evaluateCapture,
    generateConfig,
}