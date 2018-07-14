// const program = require('commander')  // npm i commander -D
// program.version('1.0.0')
//     .usage('<command> [项目名称]')
//     .command('hello', 'description') // 什么吗？必须是hello,第二个参数是描述？
//     .parse(process.argv)
const program = require('commander')
program.version('1.0.0')
    .usage('<command> [项目名称]')
    .command('hello', '创建新项目')
    .command('init', '创建新项目')
    .parse(process.argv)


