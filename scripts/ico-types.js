const fs = require("fs");
const _path = `${process.cwd()}/assets/icons`;
const selection = require(`${_path}/selection.json`);

const output = `export type IcoMoonNames = ${selection.icons.map(icon => `"${icon.properties.name}"`).join(" | ")};`;

fs.writeFileSync(`${process.cwd()}/__componentsv2/custom_icon/IcoMoonNames.ts`, output, { flag: 'w' });
