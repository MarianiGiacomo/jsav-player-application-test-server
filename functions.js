pako = require('pako');

const deflateBinData = (inflatedBinData) => {
  try{
    var binValue = pako.deflate(inflatedBinData);
  }catch(err){ throw err }
  return binValue;
}

const deflateToBase64 = buffer =>
  new Buffer(deflateBinData(buffer,'binary')).toString('base64')

module.exports = {
  toBase64: deflateToBase64,
}
