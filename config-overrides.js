const { override, addDecoratorsLegacy} = require("customize-cra") //提供webpack插件,重写webpack配置项

module.exports = override(
  addDecoratorsLegacy() //把Decorator加到babel中了
)