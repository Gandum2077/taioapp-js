# TaioApp JS

本脚本是为了能够在电脑上直接制作出.taioaction 文件。

TaioApp 的动作绝大多数在 JavaScript 都可以完成，**因此只实现 JavaScript 无法完成或者不够完善的那部分功能。**

[文档](#文档)

## 目前实现的功能

1. 注释
2. 文本
3. 显示消息
4. 设置变量
5. 获取变量
6. 运行 Javascript
7. 任意功能——可以直接插入 JSON（不过没有检查）

关于为什么目前只实现这 7 个，请参考 [TaioApp 中 JavaScript 无法取代的功能](<#TaioApp\ 中\ JavaScript\ 无法取代的功能>)

其他功能以后也许会添加。

## 示例

```js
const {
  App,
  presetIconColors,
  comment,
  text,
  setVar,
  getVar,
  uitoast,
  runjs
} = require("taioapp-js");

// 新建一个应用
const app = new App();

// 输入动作
app.actions = [
  comment("这里填评论"),
  text("这里显示文本"),
  setVar(
    "变量名字",
    textWithVariables("ズ𠮷😊${@input}")
  ),
  getVar("变量名字"),
  runjs("js"),
  uitoast("信息"),
  // 直接插入JSON，这里以“显示文本内容”举例
  {
    type: "@ui.render-text",
    parameters: {
      title: {
        value: ""
      },
      text: {
        value: "$",
        tokens: [
          {
            location: 0,
            value: "@input"
          }
        ]
      }
    }
  }
];
// 输入名字
app.name = "Taio应用";
// 输入描述
app.summary = "";
// 更改图标，默认图标为 wand.and.stars
app.icon = "wand.and.stars";
// 更改图标颜色，可以从presetIconColors中选择
app.iconColor = presetIconColors[0];

// 最后输出!
const output = app.output
console.log(output);
```

## 一些小技巧

TaioApp 中部分功能需要一些技巧才能在 JavaScript 中使用

### 特定变量

TaioApp 有一些特定名字的变量，来获取指定的内容

- 上个结果 `@input`
- 剪贴板 `@clipboard.text`
- 当前日期 `@date.style(2,1)` 或者 `@date.format(yyyy)`
- 文件名 `@editor.file-name`
- 扩展名 `@editor.file-extension`
- 全部文本 `@editor.full-text`
- 选中的文本 `@editor.selection-text`
- 选中的位置 `@editor.selection-location`
- 选中的长度 `@editor.selection-length`

### 文件夹位置

```js
// documents位置
const documentsPath =
  $objc("NSFileManager")
    .invoke("defaultManager")
    .invoke("temporaryDirectory")
    .jsValue()
    .path.slice(0, -3) + "Documents";
// 本地文件位置
const editorPath = documentsPath + "/Editor";
// iCloud位置
const icloudPath = "drive://",
// iCloud中的文件位置
const icloudEditorPath = icloudPath + "Editor";
```

通过这些，就可以用 JavaScript 遍历文件或者打开特定文件

## TaioApp 中 JavaScript 无法取代的功能

综上所述，TaioApp 中 JavaScript 无法取代的动作还有：

- 用户界面：全部，不过多数有替代品，没有替代品的是“显示消息”（特殊 UI）、“比较文本内容”
- 剪贴板：全部
- 脚本：运行 JavaScript

以及为了和使用者进行交互，所必须的动作：

- 注释
- 文本
- 设置变量
- 获取变量

至于“用户界面”和“剪贴板”中的其他内容，暂时用不着。更何况以后也许会增加诸如 `$clips` 的 API。

## 文档

### 类

- App

  最核心的类。

  拥有属性`actions`, `name`, `icon`, `iconColor`, `summary`

- TextWithVariables

  用于将文本和变量组合起来，在 `text`, `setVar`, `getVar`, `uitoast` 中均可用。输入文本的地方可以用这个替代，从而加入变量。

  不过并不直接使用它，而是通过方法 `textWithVariables()` 来创建

- Component

  用于动作列表中的方法均是为了创建此类。

  不直接使用。不过通过继承这个类，可以扩展支持更多的动作。

### 方法

- `textWithVariables(value: string, tokens: {location: numer, values: string}[]): TextWithVariables` 或者 `textWithVariables(value: string): TextWithVariables`

  创建 `TextWithVariables` 的实例。

  第一种用法例如 `textWithVariables("ズ𠮷😊$", [{ location: 6, value: "@input" }])`。
  这种用法只会帮你检查错误，然后全部照搬进json。
  在 value 中用`$`代表变量。另外 location 需要使用 js 内置方法来计算，所以`ズ𠮷😊`的长度为 6，而不是 3。

  第二种用法例如 `textWithVariables("ズ𠮷😊${@input}")`。
  这种用法可以自动帮你填写tokens。
  不过这会带来两个限制，第一不能在使用变量以外的情况中连用`${`这两个字符，第二不能在变量中使用`}`字符。


- `comment(text: string): Component `

  注释

- `text(text: string | TextWithVariables): Component`

  文本

- `setVar(name: string, value: string | TextWithVariables): Component`

  设置变量，变量名只能为字符串

- `getVar(name: string | TextWithVariables, fallback: number): Component`

  获取变量

  fallback 可选0, 1，分别代表返回空白文本、停止运行

- `uitoast(title: string | TextWithVariables, style: number, waitUntilDone: boolean): Component`

  显示消息，支持 3 个参数：

  - title 标题
  - style 可选 0, 1, 2，分别代表文本、成功、失败。默认 0
  - waitUntilDone 等待直到结束。默认 false

- `runjs(js: string| {path: string}): Component`

  运行 JavaScript，可以直接传入字符串，也可以通过 `{path: string}` 指定文件位置以供读取
