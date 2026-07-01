export function createElement(
  tagName: string,
  options: { className?: string; text?: string } = {},
): HTMLElement {
  const element = document.createElement(tagName);

  if (options.className) {
    element.className = options.className;
  }

  if (options.text) {
    element.textContent = options.text;
  }

  return element;
}
