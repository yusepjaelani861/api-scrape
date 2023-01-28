const fs = require('fs')

const errorHandler = (err, req, res, next) => {
    console.log(err)

    let message_error =
        '=====================================' + '\n' +
        'Date: ' + new Date() + '\n' +
        '=====================================' + '\n' +
        'Error Code: ' + err.error?.error_code + '\n' +
        'Error Message: ' + err.message + '\n' +
        'Error Data:' +
        ' \r' +
        err.stack +
        ' \r' +
        '\n' +
        '=====================================' + '\n';
    fs.appendFile('error.log', message_error, function (err) {
        if (err) throw err;
    });

    if (typeof (err) !== 'undefined' && err.error?.error_code == 'VALIDATION_ERROR') {
        let error_validation = {};

        err.error.error_data.forEach((element) => {
            error_validation[element.param] = [element.msg];
        })
        return res.status(err.status || 400).json({
            success: false,
            message: err.message || 'Server Error',
            data: err.data || null,
            error: {
                error_code: err.error?.error_code || 'PROCESS_ERROR',
                error_data: error_validation || null,
            }
        })
    }

    if (typeof (err) !== 'undefined' && err.error?.error_code == 'PROCESS_ERROR') {
        return res.status(err.status || 400).json({
            success: false,
            message: err.message || 'Server Error',
            data: err.data || null,
            error: {
                error_code: err.error?.error_code || 'PROCESS_ERROR',
                error_data: err.error_data || null,
            }
        })
    }

    return res.status(err.status || 400).json({
        success: false,
        message: err.message || 'Server Error',
        data: err.data || null,
        error: {
            error_code: err.error?.error_code || 'PROCESS_ERROR',
            error_data: err.error_data || null,
        }
    })
}

module.exports = errorHandler