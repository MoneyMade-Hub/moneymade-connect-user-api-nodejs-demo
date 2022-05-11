module.exports.makeAxiosError = function(status, dataOrMessage, config = {}) {
    const error = new Error();

    Object.assign(error, {
        response: {
            ...config,
            status,
            data: typeof dataOrMessage === 'string' ? { statusCode: status, message: dataOrMessage } : dataOrMessage,
        },
        isAxiosError: true
    })

    return error;
}