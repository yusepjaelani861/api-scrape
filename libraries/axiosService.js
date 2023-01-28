const axios = require('axios');

const axiosService = async (url) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(url)
            
            if (response.status === 200) {
                resolve(response.data)
            }
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = axiosService