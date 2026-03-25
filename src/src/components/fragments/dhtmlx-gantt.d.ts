declare module "dhtmlx-gantt" {
  interface Gantt {
    init: (container: HTMLElement) => void;
    parse: (data: { data: any[]; links: any[] }) => void;
    clearAll: () => void;
    config: any;
    attachEvent: (name: string, handler: (...args: any[]) => void) => void;
    plugins: any;
    [key: string]: any;
  }

  const gantt: Gantt;

  export default gantt;
}
