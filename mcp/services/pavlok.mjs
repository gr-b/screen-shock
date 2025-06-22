import axios from 'axios'
const url = 'https://screenshock.me'
/* functions */
async function deliverStimulus(pavlok_token, stimulusType='vibrate', stimulusValue=100){
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
    try {
        const response = await axios.post(
            `https://${ url }/evaluate_capture`,
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
    try {
        const response = await axios.post(
            `https://${ url }/generate_list_client`,
            { description },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        console.log('Response from generate_list_client:', response)
        return response
    } catch(error) {
        console.error('Error calling generate_list_client:', error.message)
    }
}
export {
    deliverStimulus,
    evaluateCapture,
    generateConfig,
}