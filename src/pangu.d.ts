declare module "pangu/dist/browser/pangu.js" {
  type PanguBrowser = {
    spacingElement(element: Element): void;
    default?: PanguBrowser;
  };

  const pangu: PanguBrowser;

  export default pangu;
}
