const fs = require("fs");

const presetIconColors = [
  "#FCBD4D",
  "#FF8C59",
  "#FB6666",
  "#FA78B6",
  "#AB87C7",
  "#6DB3BF",
  "#65AE76",
  "#307ABC",
  "#568195",
  "#956A56"
];

class TextWithVariables {
  constructor(value = "", tokens) {
    if (tokens) this._output = { value, tokens };
    

    else this._output = this._parse(value);
  }

  _parse(value) {
    const startIndexes = [...value.matchAll(/\${/g)].map(n => n.index);
    const endIndexes = [...value.matchAll(/}/g)].map(n => n.index);
    const pairs = [];
    startIndexes.forEach(n => {
      const endIndex = endIndexes.find(m => m > n);
      if (endIndex) pairs.push({ start: n, end: endIndex });
    });
    let text = "";
    let lastEnd = 0
    const tokens = []
    pairs.forEach(({ start, end }) => {
      text += value.slice(lastEnd, start)
      tokens.push({location: text.length, value: value.slice(start + 2, end)})
      text += "$"
      lastEnd = end + 1
    });
    text += value.slice(lastEnd)
    return {value: text, tokens}

  }

  get output() {
    return this._output;
  }
}

class Component {
  constructor(type, parameters) {
    this._type = type;
    this._parameters = parameters;
  }

  get output() {
    return {
      type: this._type,
      parameters: this._parameters
    };
  }
}

class App {
  constructor() {
    this._name = "未命名";
    this._summary = "";
    this._icon = "wand.and.stars";
    this._iconColor = presetIconColors[0];
    this.actions = [];

    this.buildVersion = 1;
    this.clientMinVersion = 1;
    this.clientVersion = 29;
  }

  set actions(params) {
    this._actions = params.map(n => {
      if (n instanceof Component) return n.output;
      else return n;
    });
  }

  get actions() {
    return this._actions;
  }

  set name(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  set summary(text) {
    this._summary = text;
  }

  get summary() {
    return this._summary;
  }

  set icon(symbol) {
    this._icon = symbol;
  }

  get icon() {
    return this._icon;
  }

  set iconColor(hexcode) {
    this._iconColor = hexcode;
  }

  get iconColor() {
    return this._iconColor;
  }

  get output() {
    const output = {
      buildVersion: this.buildVersion,
      clientMinVersion: this.clientMinVersion,
      clientVersion: this.clientVersion,
      name: this.name,
      summary: this.summary,
      icon: {
        glyph: this.icon,
        color: this.iconColor
      },
      actions: this.actions
    };
    return JSON.stringify(output, null, 2)
  }
  
}

function textWithVariables(value, tokens) {
  return new TextWithVariables(value, tokens);
}

function comment(text = "") {
  const type = "@comment";
  const parameters = {
    text: {
      value: text
    }
  };
  return new Component(type, parameters);
}

function text(text = "") {
  const type = "@text";
  const parameters = {};
  if (text instanceof TextWithVariables) {
    parameters.text = text.output;
  } else {
    parameters.text = { value: text };
  }
  return new Component(type, parameters);
}

function setVar(name, value = "") {
  const type = "@flow.set-variable";
  const parameters = {
    name: {
      value: name
    }
  };
  if (value instanceof TextWithVariables) {
    parameters.value = value.output;
  } else {
    parameters.value = { value };
  }
  return new Component(type, parameters);
}

function getVar(name, fallback = 0) {
  const type = "@flow.get-variable";
  const parameters = { fallback };
  if (name instanceof TextWithVariables) {
    parameters.name = name.output;
  } else {
    parameters.name = { value: name };
  }
  return new Component(type, parameters);
}

function uitoast(title = "", style = 0, waitUntilDone = false) {
  const type = "@ui.toast";
  const parameters = { style, waitUntilDone };
  if (title instanceof TextWithVariables) {
    parameters.title = title.output;
  } else {
    parameters.title = { value: title };
  }
  return new Component(type, parameters);
}

function runjs(params) {
  const type = "@flow.javascript";
  let js;
  if (typeof params === "object") {
    const path = params.path;
    if (!fs.existsSync(path)) throw new Error("文件不存在！");
    js = fs.readFileSync(path).toString();
  } else {
    js = params;
  }
  const parameters = {
    script: {
      value: js
    }
  };
  return new Component(type, parameters);
}

module.exports = {
  presetIconColors,
  TextWithVariables,
  Component,
  App,
  textWithVariables,
  comment,
  text,
  setVar,
  getVar,
  uitoast,
  runjs
};
