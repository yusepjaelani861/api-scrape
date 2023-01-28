class sendResponse {
    success = true
    message = 'Success getting data'
    data = []
    error = {
        error_code: '',
        error_data: []
    }
    pagination = {}

    constructor (data, message = 'Success getting data', pagination = {}) {
        this.data = data
        this.message = message
        this.pagination = pagination
    }
}

class sendError {
    success = false
    message = 'Error getting data'
    data = []
    error = {
        error_code: '',
        error_data: []
    }
    pagination = {}

    constructor (error_data = [], message = 'Error getting data', error_code = 'PROCESS_ERROR', status = 400) {
        this.message = message
        this.error.error_code = error_code
        this.error.error_data = error_data
    }
}

module.exports = {
    sendResponse,
    sendError
}