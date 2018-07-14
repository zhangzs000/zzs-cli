const download = require('../lib/download')
const program = require('commander')
const path = require('path')
const fs = require('fs')
const glob = require('glob') // npm i glob -D
console.log('process.argv: ',process.argv)
console.log('program.args: ',program.args)
program.usage('<project-name>').parse(process.argv)
console.log('program.args: ',program.args)
// 根据输入，获取项目名称
let projectName = program.args[0]
if (!projectName) {  // project-name 必填
// 相当于执行命令的--help选项，显示help信息，这是commander内置的一个命令选项
  program.help() 
  return
}
const list = glob.sync('*')  // 遍历当前目录
console.log('list: ', list)
let rootName = path.basename(process.cwd())
console.log('process.cwd(): ', process.cwd())
console.log('rootName: ', rootName)
console.log('path.join(, rootName): ', path.join('.', rootName))
if (list.length) {  // 如果当前目录不为空
  if (list.filter(name => {
  const fileName = path.resolve(process.cwd(), path.join('.', name))
  // 可能node更换api了stat => lstatSync
  const isDir = fs.lstatSync(fileName).isDirectory()
  console.log('name: ',name)
  console.log('fileName: ',fileName)
  console.log('isDir: ',isDir)
  console.log('name.indexOf(projectName): ',name.indexOf(projectName))
  return name.indexOf(projectName) !== -1 && isDir
      }).length !== 0) {
    console.log(`项目${projectName}已经存在`)
    return
  }
  rootName = projectName
} else if (rootName === projectName) {
    rootName = '.'
} else {
    rootName = projectName
}
go()
function go () {
  // 预留，处理子命令  
  console.log('go: ', path.resolve(process.cwd(), path.join('.', rootName)))
  download(rootName)
    .then(target =>console.log('download target: ',target))
    .catch(err =>console.log('download err: ',err))
}