
const response = (res, message, code, data = [], anyOtherData = {}) => {
    res.send({
        "EncryptedResponse":
        {
            status_code: code,
            message: message,
            data: data,
            ...anyOtherData
        }
    }
    );
}
module.exports = response;
