const axios = require('axios');
const ora = require('ora');
const inquirer = require('inquirer');
const { downloadDirectory } = require('./constants')
let downloadGitRepo = require('download-git-repo');
const metalsmith = require('metalsmith'); // 遍历文件夹需不需要渲染
// consolidate 统一所有模版引擎
let { render } = require('consolidate').ejs;
let ncp = require('ncp');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
// 封装成promise
downloadGitRepo = promisify(downloadGitRepo);
ncp = promisify(ncp);
render = promisify(render);

const fetchRepoList = async ()=>{
  // axios 返回promise，前后端通用
  const { data } = await axios.get('https://api.github.com/orgs/zhu-cli/repos');
  return data
}

// 获取版本号
const fetchTagList = async (repo)=>{
  // axios 返回promise，前后端通用
  const { data } = await axios.get(`https://api.github.com/repos/zhu-cli/${repo}/tags`);
  return data
}

// 封装loading
const waitFnloading = (fn, message)=>async(...args)=>{
  const spinner = ora(message);
  spinner.start();
  const res = await fn(...args);
  spinner.succeed();
  return res;
}

const download = async (repo, tag)=>{
  // 固定写法, github 上的组织
  let api = `zhu-cli/${repo}`;
  if(tag){
    api+=`#${tag}`;
  }
  const dest = `${downloadDirectory}/${repo}`;
  await downloadGitRepo(api, dest);
  // 下载的最终目录
  return dest;
}
module.exports = async (projectName)=>{
  console.log('create');
  
  // 获取项目所以模版
  let repos = await waitFnloading(fetchRepoList, 'fetch template...')();
  repos = repos.map(item=>item.name);
  console.log('repos: ',repos);
  const {repo} = await inquirer.prompt({
    name: 'repo',
    type: 'list',
    message: 'please choise a template',
    choices: repos
  });
  console.log('repo: ',repo);
  // 获取对应的版本号
  // https://api.github.com/repos/zhu-cli/vue-template/tags
  let tags = await waitFnloading(fetchTagList, 'fetch tags...')(repo);
  tags = tags.map(item=>item.name);
  console.log('tags: ',tags);
  const {tag} = await inquirer.prompt({
    name: 'tag',
    type: 'list',
    message: 'please choise a tag',
    choices: tags
  });
  console.log(repo,tag);
  // let result = await download(repo, tag);
  let result = await waitFnloading(download, 'download template')(repo, tag);
  console.log('result: ',result);
  // 判断是否有ask.js文件，有就是复杂的，待渲染
  if(!fs.existsSync(path.join(result, 'ask.js'))){
    // 普通模版，直接拷贝 ncp拷贝
    await ncp(result, path.resolve(projectName));
  }else{
     // 复杂的需要渲染，渲染后拷贝
     // 让用户填写信息
     await new Promise((resolve, reject)=>{
        metalsmith(__dirname) // 默认src下
        .source(result) // 遍历模版
        .destination(path.resolve(projectName)) // 模版渲染的地点
        .use(async(files, metal, done)=>{
          const args = require(path.join(result, 'ask.js'));
          const obj = await inquirer.prompt(args); // 让用户输入
          //将obj传递到metal
          const meta = metal.metadata();
          Object.assign(meta, obj); //  输入的结果赋值给meta
          delete files['ask.js'];
          console.log('obj: ',obj)
          done();
        })
        .use((files, metal, done)=>{
          console.log('metal.metadata(): ',metal.metadata())
          const obj = metal.metadata();
          Reflect.ownKeys(files).forEach(async (file)=>{
            if(file.includes('js') || file.includes('json')){
              let content = files[file].contents.toString(); // 文件内容
              if(content.includes('<%')){
                content = await render(content, obj);
                files[file].contents = Buffer.from(content)
              }
            }
          })
          done();
        })
        .build(err=>{
          if(err){
            reject()
          } else {
            resolve()
          }
        })
      // 根据信息渲染
     })
     

  }
}