/* eslint-disable max-classes-per-file */

import { dequal } from "dequal";

const codesWarned = new Set<string>();

export class AssertionError extends Error {
  override name = "Assertion" as const;
  code = "ERR_ASSERTION" as const;
  actual: unknown;
  expected: unknown;
  generated: boolean;
  operator: string;

  constructor(
    message: string,
    actual: unknown,
    expected: unknown,
    operator: string,
    generated: boolean
  ) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.actual = actual;
    this.expected = expected;
    this.generated = generated;
    this.operator = operator;
  }
}

export class DeprecationError extends Error {
  override name = "DeprecationWarning" as const;
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Wrap a function or class to show a deprecation message when first called.
 */
export function deprecate<T extends (...args: any[]) => any>(
  fn: T,
  message: string,
  code?: string | null
): T {
  let warned = false;

  const deprecated = function (this: unknown, ...args: unknown[]): unknown {
    if (!warned) {
      warned = true;

      if (typeof code === "string" && codesWarned.has(code)) {
        // do nothing
      } else {
        console.error(new DeprecationError(message, code || undefined));

        if (typeof code === "string") codesWarned.add(code);
      }
    }

    if (new.target) {
      return Reflect.construct(fn, args, new.target);
    }

    return Reflect.apply(fn, this, args);
  };

  Object.setPrototypeOf(deprecated, fn);

  return deprecated as T;
}

/**
 * Assert deep strict equivalence.
 */
export function equal<T>(
  actual: unknown,
  expected: T,
  message?: Error | string | null
): asserts actual is T {
  assert(
    dequal(actual, expected),
    actual,
    expected,
    "equal",
    "Expected values to be deeply equal",
    message
  );
}

/**
 * Assert if value is truthy.
 */
export function ok(
  value: unknown,
  message?: Error | string | null
): asserts value {
  assert(
    Boolean(value),
    false,
    true,
    "ok",
    "Expected value to be truthy",
    message
  );
}

/**
 * Assert that a code path never happens.
 */
export function unreachable(message?: Error | string | null): never {
  assert(false, false, true, "ok", "Unreachable", message);
}

/**
 * Internal assertion function.
 */
function assert(
  bool: boolean,
  actual: unknown,
  expected: unknown,
  operator: string,
  defaultMessage: string,
  userMessage?: Error | string | null
): asserts bool {
  if (!bool) {
    throw userMessage instanceof Error
      ? userMessage
      : new AssertionError(
          userMessage || defaultMessage,
          actual,
          expected,
          operator,
          !userMessage
        );
  }
}
