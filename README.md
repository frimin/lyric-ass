# ASS Format Lyrics Generator

一个由在线歌词生成至 ASS 字幕文件的命令行工具，依赖 Node.js 框架。

支持 [lyric-dl](https://github.com/frimin/lyric-dl) 所支持的在线地址

安装

	npm install lyric-ass -g

更新

	npm update lyric-ass -g

### 使用

命令格式

	lyric-ass [子命令] [选项] <URL>

不作任何内容修改由原始歌词直接生成 ASS 字幕:

	lyric-ass url <url>
	
你可以使用一系列指令来对歌词时间轴进行简单的编辑:

	lyric-ass url -e "1:-1>1" <url>
	
指令格式为: <区间 | 列表> <操作类型> <参数>

区间可以表示为 **1:10**, 取 1 至 10 条歌词，也可以用负数作索引 **1:-1** 取所有歌词。

列表可以表示为 **1,2,3,4** 甚至可以是 **1,1,1,1** 这样会对第一句歌词做同一个操作四次。

操作类型有如下几种：

  * **r** \<regexp\>,[newstring] : 替换内容
  * **d** : 删除
  * **>** \<second\> : 时间轴后移
  * **<** \<second\> : 时间轴前移
  * **+** \<second\> : 增加显示持续时间
  * **-** \<second\> : 减少显示持续时间

同时也可用符号;来分隔多个操作:

  * "1:-1>2.5;-1d" 所有歌词向后移动 2.5 秒且删除最后一条歌词
  * "1,2,2+1;3d" 把索引 1 和 2 的歌词持续时间增加一秒，且 2 被增加两次并且删除第三句歌词

为了直观地看到歌词索引，可以添加选项 **-E**, 它会在歌词内容中添加当前歌词的初始索引信息

### 修改已生成 ASS 字幕文件

	lyric-ass restyle -e "1:-1>1" <filename>
	
### 修改默认样式

创建一个字幕风格配置文件:

	lyric-ass style-config [stylename]
	
可以修改字体等细节选项，在生成字幕的时候传入配置文件:

	lyric-ass restyle -e "1:-1>1" <filename> [styleConfigFile]