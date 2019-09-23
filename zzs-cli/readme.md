### node
### 背景
* 业务类型多

### 闭备模块
* commander 参数解析
* inquirer 命令交互
* download-git-repo 在git中下载模版
* chalk 控制台颜色
* metalsmith 读取文件，实现模版渲染
* consolidate 统一模版引擎

### 步骤
* sudo npm link 产生快捷方式
* cnpm i eslint -D 校验
  * npx eslint --init 执行 node_modules/bin/eslint, 但是 最后‘airbnb-base’安装失败,mac pro的“钥匙串（app里面搜索）”加上git好像可以免登陆；
  * vscode 配置eslint 保存自动修复
* 拉取git模版，https://developer.github.com/v3/   -> https://developer.github.com/v3/repos/
 -> https://api.github.com/orgs/zhu-cli/repos
* cnpm i axios -D

### 技巧
* mac 打开文件夹 命令行 open /Users/bosszhang/.template

### 包
* metalsmith 遍历文件夹需不需要渲染
* consolidate 把所有的模版整合,统一了所有模版引擎 cnpm i metalsmith consolidate ejs -D;