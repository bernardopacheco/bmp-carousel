const root = document.documentElement;
const computedStyle = getComputedStyle(document.body);

export default class Utils {
  static getCSSVariableAsNum(variableName) {
    return parseInt(computedStyle.getPropertyValue(variableName), 10);
  }

  static setCSSVariable(variableName, value) {
    root.style.setProperty(variableName, value);
  }
}
