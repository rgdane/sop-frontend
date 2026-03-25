/* eslint-disable */

import HighlightJs from "highlight.js/lib/core";
import { ok as assert } from "./devlop";
import type { Root, ElementContent, RootData } from "hast";
import type { HLJSApi, LanguageFn } from "highlight.js";

interface HighlightOptions {
  prefix?: string;
  subset?: string[];
}

interface Grammar {
  [key: string]: LanguageFn;
}

type GrammarFn = LanguageFn;

interface ExtendedRootData extends RootData {
  language?: string;
  relevance?: number;
}

interface ExtendedRoot extends Omit<Root, "data"> {
  data?: ExtendedRootData;
}

export function createLowlight(grammars?: Grammar) {
  const high = HighlightJs.newInstance();

  if (grammars) {
    register(grammars);
  }

  return {
    highlight,
    highlightAuto,
    listLanguages,
    register,
    registerAlias,
    registered,
  };

  function highlight(
    language: string,
    value: string,
    options?: HighlightOptions
  ): ExtendedRoot {
    assert(typeof language === "string", "expected `string` as `name`");
    assert(typeof value === "string", "expected `string` as `value`");

    const settings = options || {};
    const prefix =
      typeof settings.prefix === "string" ? settings.prefix : "hljs-";

    if (!high.getLanguage(language)) {
      throw new Error(`Unknown language: ${language} is not registered`);
    }

    high.configure({ __emitter: HastEmitter, classPrefix: prefix });

    const result = high.highlight(value, { ignoreIllegals: true, language });

    if (result.errorRaised) {
      throw new Error("Could not highlight with `Highlight.js`", {
        cause: result.errorRaised,
      });
    }

    const root = (result._emitter as HastEmitter).root;
    const data = root.data as ExtendedRootData;

    data.language = result.language;
    data.relevance = result.relevance;

    return root as ExtendedRoot;
  }

  function highlightAuto(
    value: string,
    options?: HighlightOptions
  ): ExtendedRoot {
    assert(typeof value === "string", "expected `string` as `value`");

    const settings = options || {};
    const subset = settings.subset || listLanguages();

    let relevance = 0;
    let result: ExtendedRoot | undefined;

    for (const name of subset) {
      if (!high.getLanguage(name)) continue;

      const current = highlight(name, value, options);

      if (
        current.data &&
        current.data.relevance !== undefined &&
        current.data.relevance > relevance
      ) {
        relevance = current.data.relevance;
        result = current;
      }
    }

    return (
      result || {
        type: "root",
        children: [],
        data: { language: undefined, relevance },
      }
    );
  }

  function listLanguages(): string[] {
    return high.listLanguages();
  }

  function register(name: string, grammar: LanguageFn): void;
  function register(grammars: Grammar): void;
  function register(arg1: string | Grammar, arg2?: LanguageFn): void {
    if (typeof arg1 === "string") {
      assert(arg2 !== undefined, "expected `grammar`");
      high.registerLanguage(arg1, arg2!);
    } else {
      for (const name in arg1) {
        if (Object.hasOwn(arg1, name)) {
          high.registerLanguage(name, arg1[name]);
        }
      }
    }
  }

  function registerAlias(name: string, alias: string | string[]): void;
  function registerAlias(aliases: Record<string, string | string[]>): void;
  function registerAlias(
    arg1: string | Record<string, string | string[]>,
    arg2?: string | string[]
  ): void {
    if (typeof arg1 === "string") {
      assert(arg2 !== undefined);
      high.registerAliases(Array.isArray(arg2) ? [...arg2] : arg2, {
        languageName: arg1,
      });
    } else {
      for (const key in arg1) {
        if (Object.hasOwn(arg1, key)) {
          const aliases = arg1[key];
          high.registerAliases(
            Array.isArray(aliases) ? [...aliases] : aliases,
            {
              languageName: key,
            }
          );
        }
      }
    }
  }

  function registered(name: string): boolean {
    return Boolean(high.getLanguage(name));
  }
}

class HastEmitter {
  options: { classPrefix: string };
  root: ExtendedRoot;
  stack: Array<any>;

  constructor(options: { classPrefix: string }) {
    this.options = options;
    this.root = {
      type: "root",
      children: [],
      data: { language: undefined, relevance: 0 },
    };
    this.stack = [this.root];
  }

  addText(value: string): void {
    if (value === "") return;

    const current = this.stack[this.stack.length - 1];
    const tail = current.children[current.children.length - 1];

    if (tail && tail.type === "text") {
      tail.value += value;
    } else {
      current.children.push({ type: "text", value });
    }
  }

  startScope(rawName: string): void {
    this.openNode(String(rawName));
  }

  endScope(): void {
    this.closeNode();
  }

  __addSublanguage(other: HastEmitter, name?: string): void {
    const current = this.stack[this.stack.length - 1];
    const results = other.root.children as ElementContent[];

    if (name) {
      current.children.push({
        type: "element",
        tagName: "span",
        properties: { className: [name] },
        children: results,
      });
    } else {
      current.children.push(...results);
    }
  }

  openNode(name: string): void {
    const className = name
      .split(".")
      .map((d, i) => (i ? d + "_".repeat(i) : this.options.classPrefix + d));

    const current = this.stack[this.stack.length - 1];
    const child = {
      type: "element",
      tagName: "span",
      properties: { className },
      children: [],
    };

    current.children.push(child);
    this.stack.push(child);
  }

  closeNode(): void {
    this.stack.pop();
  }

  finalize(): void {
    // no-op
  }

  toHTML(): string {
    return "";
  }
}
