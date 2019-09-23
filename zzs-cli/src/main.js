const program = require('commander');
const { version } = require('./constants');
const path = require('path');
console.log(process.argv)

const mapActions = {
  create: {
    alias: 'c',
    description: 'create a project',
    examples: [
      'zzs-cli create <project-name>'
    ]
  },
  config: {
    alias: 'conf',
    description: 'config project variable',
    examples: [
      'zzs-cli config set <k> <v>',
      'zzs-cli config get <k>'
    ]
  },
  "*": {
    alias: '',
    description: 'command not found',
    examples: []
  }
}
// 相比与Object.keys()，可以拿到symbol
Reflect.ownKeys(mapActions).forEach(action=>{
  program
    .command(action)
    .alias(mapActions[action].alias)
    .description(mapActions[action].description)
    .action(()=>{
      if(action==='*'){
        console.log(mapActions[action].description)
      }else{
        console.log(action);
        require(path.resolve(__dirname, action))(...process.argv.slice(3));
      }
    })
})

//监听用户的help事件
program.on('--help',()=>{
  console.log('\nExamples:');
  Reflect.ownKeys(mapActions).forEach(action=>{
    mapActions[action].examples.forEach(example=>{
      console.log(example)
    })
  })
})
// 解析用户传递的参数
program.version(version).parse(process.argv)