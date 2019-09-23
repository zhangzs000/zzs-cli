const { version } = require('../package.json');

// 存放模版的位置
const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.template`
console.log('downloadDirectory: ',downloadDirectory)
module.exports = {
  version,
  downloadDirectory
} 