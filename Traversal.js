var fs = require('fs');
var path = require('path');
var config = require('./config');
var root = path.resolve(config.root);
var hooks = require('./hooks');
// 目录队列
var dirQueue = [root];
// 文件队列
var fileQueue = [];
// 当前需要遍历的目录节点
var node;
var matcherQueue = [];
var exclude = config.exclude || [];
while(node = dirQueue.shift()) {
    // 读出该目录的所有文件，包括目录
    var files = fs.readdirSync(node);
    files.forEach(function(filename) {
        var currentFile = path.resolve(node + '/' + filename);
        var stat = fs.statSync(currentFile);
        if (stat.isFile()) {
            fileQueue.push(currentFile);
        }
        if (stat.isDirectory()) {
            if (exclude.includes(filename) || exclude.includes(currentFile)) {
                return;
            } else {
                dirQueue.push(currentFile);
            }
            
        }
    })
}
config.echo && console.log(fileQueue);

fileQueue.forEach(function(filename) {
    var fileContent = fs.readFileSync(filename, 'utf-8');
    hooks.forEach(function(fn) {
        var matcher = fn(fileContent);
        if (matcher) {
            matcherQueue = matcherQueue.concat(matcher);
        }
        // fileContent = fn(fileContent);
        // if (fileContent) {
        //     matcherQueue = matcherQueue.concat(fileContent);
        // }
    });
    
})

if (config.output) {
    fs.writeFileSync(config.output, matcherQueue.join('\n'), 'utf-8')
    // var outputFile = path.resolve(config.output);
    // var isExsit = fs.existsSync(outputFile);
    // var outputFileStat = fs.statSync(outputFile)
    // if (isExsit && outputFileStat && outputFileStat.isFile()) {
    //     fs.writeFileSync(outputFile, matcherQueue.join('\n'), 'utf-8')
    // } else {
    //     console.error(`${outputFile} not found`);
    // }
    
}
