const {
  presetIconColors,
  App,
  textWithVariables,
  comment,
  text,
  setVar,
  getVar,
  uitoast,
  runjs
} = require(".");

// 新建一个应用
const app = new App();

// 输入动作
app.actions = [
  comment("这里填评论"),
  text("这里显示文本"),
  setVar("变量名字", textWithVariables("ズ𠮷😊${@input}")),
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
const output = app.output;
console.log(output);

// const fs = require("fs");
// const { homedir } = require("os");
// const path = require("path");
// fs.writeFileSync(path.join(homedir(), "test.taioactions"), output);
