export default class Utils {
  static getCSSVariableAsNum(root, variableName) {
    return parseInt(Utils.getCSSStyleDeclaration(root).getPropertyValue(variableName), 10);
  }

  static setCSSVariable(root, variableName, value) {
    Utils.getCSSStyleDeclaration(root).setProperty(variableName, value);
  }

  static getCSSStyleDeclaration(root) {
    return root.styleSheets[0].rules[0].style;
  }
}
