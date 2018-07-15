const download = require('../lib/download')
const program = require('commander')
const path = require('path')
const fs = require('fs')
const glob = require('glob') // npm i glob -D
const inquirer = require('inquirer')
const generator = require('../lib/generator')
const chalk = require('chalk')
const logSymbols = require('log-symbols')
// 这个模块可以获取node包的最新版本
const latestVersion = require('latest-version')  // npm i latest-version -D
let next = undefined

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
  // rootName = projectName
  next = Promise.resolve(projectName)
  console.log('next: ', next)
} else if (rootName === projectName) {
    // rootName = '.'
    next = inquirer.prompt([
      {
        name: 'buildInCurrent',
        message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
        type: 'confirm',
        default: true
      }
    ]).then(answer => {
      console.log('answer: ',answer)
     return Promise.resolve(answer.buildInCurrent ? '.' : projectName)
    })
} else {
    // rootName = projectName
    next = Promise.resolve(projectName)
}
next && go()
function go () {
  // 预留，处理子命令  
  // console.log('go: ', path.resolve(process.cwd(), path.join('.', rootName)))
  // download(rootName)
  //   .then(target =>console.log('download target: ',target))
  //   .catch(err =>console.log('download err: ',err))
  // next.then(projectRoot => {
  //   if (projectRoot !== '.') {
  //         fs.mkdirSync(projectRoot)
  //   }
  //   return download(projectRoot).then(target => {
  //     return {
  //             projectRoot,
  //             downloadTemp: target
  //           }
  //       })
  //   })
  next.then(projectRoot => {
    if (projectRoot !== '.') {
          fs.mkdirSync(projectRoot)
        }
    return download(projectRoot).then(target => {
      return {
              name: projectRoot,
              root: projectRoot,
              downloadTemp: target
            }
        })
      }).then(context => {
    return inquirer.prompt([
         {
            name: 'projectVersion',
            message: '项目的版本号',
    default: '1.0.0'
          }, {
            name: 'projectDescription',
            message: '项目的简介',
    default: `A project named ${context.name}`
          }
        ]).then(answers => {
    return latestVersion('macaw-ui').then(version => {
            answers.supportUiVersion = version
    return {
              ...context,
              metadata: {
                ...answers
              }
            }
          }).catch(err => {
    return Promise.reject(err)
          })
        })
      }).then(context => {
        // 添加生成的逻辑
        return generator(context)
      }).then(context => {
        // console.log('创建成功:)')
        // 成功用绿色显示，给出积极的反馈
        console.log(logSymbols.success, chalk.green('创建成功:)'))
        console.log()
        console.log(chalk.green('cd ' + context.root + '\nnpm install\nnpm run dev'))
      }).catch(err => {
        // console.error(`创建失败：${err.message}`)
        // 失败了用红色，增强提示
        console.error(logSymbols.error, chalk.red(`创建失败：${err.message}`))
      }) 
}