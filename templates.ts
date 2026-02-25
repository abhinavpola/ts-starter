export interface TemplateOptions {
  name: string;
  typescript: "tsgo" | "tsc";
  nx: boolean;
}

export function packageJsonContent(opts: TemplateOptions): string {
  const devDeps: Record<string, string> = {
    "@biomejs/biome": "latest",
    "@types/bun": "latest",
    "biome-plugin-no-type-assertion": "latest",
    husky: "latest",
    knip: "latest",
  };

  if (opts.typescript === "tsc") {
    devDeps.typescript = "latest";
  } else {
    devDeps["@typescript/native-preview"] = "latest";
  }

  if (opts.nx) {
    devDeps.nx = "latest";
    devDeps["@nx/js"] = "latest";
  }

  const scripts: Record<string, string> = {
    check: "biome check .",
    "check:fix": "biome check --write .",
    knip: "knip",
    prepare: "husky",
    test: "bun test",
    typecheck: opts.typescript === "tsc" ? "tsc --noEmit" : "tsgo --noEmit",
  };

  if (opts.nx) {
    scripts.postinstall = "nx sync";
  }

  return JSON.stringify(
    {
      name: opts.name,
      version: "0.1.0",
      type: "module",
      private: true,
      scripts,
      devDependencies: devDeps,
    },
    null,
    2
  );
}

export function tsconfigContent(opts: TemplateOptions): string {
  const compilerOptions: Record<string, unknown> = {
    lib: ["ESNext"],
    target: "ESNext",
    module: "Preserve",
    moduleDetection: "force",
    moduleResolution: "bundler",
    allowImportingTsExtensions: true,
    verbatimModuleSyntax: true,
    strict: true,
    skipLibCheck: true,
    noFallthroughCasesInSwitch: true,
    noUncheckedIndexedAccess: true,
    noImplicitOverride: true,
  };

  if (opts.nx) {
    compilerOptions.composite = true;
    compilerOptions.declaration = true;
    compilerOptions.declarationMap = true;
    compilerOptions.outDir = "./dist";
  } else {
    compilerOptions.noEmit = true;
  }

  const config: Record<string, unknown> = { compilerOptions };
  if (opts.nx) {
    config.references = [];
  }

  return JSON.stringify(config, null, 2);
}

export function biomeJsonContent(): string {
  return JSON.stringify(
    {
      $schema: "./node_modules/@biomejs/biome/configuration_schema.json",
      plugins: [
        "node_modules/biome-plugin-no-type-assertion/no-type-assertion.grit",
      ],
      linter: {
        enabled: true,
        rules: {
          recommended: true,
          correctness: {
            noUnusedImports: "error",
            noUnusedVariables: "error",
            noUnusedPrivateClassMembers: "error",
          },
          suspicious: {
            noExplicitAny: "error",
            noConsole: "error",
          },
          style: {
            useBlockStatements: "error",
          },
          nursery: {
            noFloatingPromises: "error",
          },
        },
      },
      formatter: {
        enabled: true,
        indentStyle: "space",
        indentWidth: 2,
      },
      javascript: {
        formatter: {
          quoteStyle: "double",
          trailingCommas: "es5",
        },
      },
    },
    null,
    2
  );
}

export function gitignoreContent(): string {
  return `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
.nx/
`;
}

export function nxJsonContent(): string {
  return JSON.stringify(
    {
      $schema: "./node_modules/nx/schemas/nx-schema.json",
      sync: {
        generators: ["@nx/js:typescript-sync"],
      },
    },
    null,
    2
  );
}

export function knipJsonContent(): string {
  return JSON.stringify(
    {
      ignoreDependencies: ["biome-plugin-no-type-assertion"],
    },
    null,
    2
  );
}

export function loggerContent(): string {
  return `export function iLog(...args: unknown[]): void {
  // biome-ignore lint/suspicious/noConsole: logger module is the only place allowed to use console
  console.log(...args);
}

export function wLog(...args: unknown[]): void {
  // biome-ignore lint/suspicious/noConsole: logger module is the only place allowed to use console
  console.warn(...args);
}

export function eLog(...args: unknown[]): void {
  // biome-ignore lint/suspicious/noConsole: logger module is the only place allowed to use console
  console.error(...args);
}
`;
}

export function sampleIndexContent(): string {
  return `import { iLog } from "./logger.ts";

iLog("Hello, world!");
`;
}

export function sampleTestContent(): string {
  return `import { expect, test } from "bun:test";

test("placeholder", () => {
  expect(true).toBe(true);
});
`;
}

export function ciWorkflowContent(): string {
  return `name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run check
        name: Lint
      - run: bun run typecheck
        name: Typecheck
      - run: bun run knip
        name: Knip
      - run: bun test
        name: Test
`;
}

export function huskyPreCommitContent(): string {
  return `bun run check
bun run typecheck
bun run knip
bun test
`;
}

export function gitTownConfigContent(): string {
  return `[branches]
main = "main"
`;
}

export function vscodeSettingsContent(opts: TemplateOptions): string {
  const settings: Record<string, unknown> = {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "quickfix.biome": "explicit",
      "source.organizeImports.biome": "explicit",
    },
  };

  if (opts.typescript === "tsgo") {
    settings["typescript.validate.enable"] = false;
    settings["javascript.validate.enable"] = false;
  }

  return JSON.stringify(settings, null, 2);
}

export function vscodeExtensionsContent(): string {
  return JSON.stringify(
    {
      recommendations: ["biomejs.biome"],
    },
    null,
    2
  );
}

export function vscodeLaunchContent(): string {
  return JSON.stringify(
    {
      version: "0.2.0",
      configurations: [
        {
          type: "bun",
          request: "launch",
          name: "Debug index.ts",
          program: "${workspaceFolder}/src/index.ts",
        },
      ],
    },
    null,
    2
  );
}

export function bunfigTomlContent(): string {
  return `[test]
preload = ["./src/test-setup.ts"]
`;
}

export function testSetupContent(): string {
  return `// Stub environment variables for tests
// Add your env var stubs here, e.g.:
// process.env.DATABASE_URL = "postgres://localhost/test";
`;
}

export function claudeCodeStyleContent(): string {
  return `---
paths:
  - "**/*.{ts,tsx}"
---

# Code Style Rules

- When validating external data (API responses, user input, stored state), use Zod schemas with \`safeParse\` instead of type assertions (\`as\`) or manually written type guards.
- Prefer \`neverthrow\` \`Result\`/\`ResultAsync\` over \`try\`/\`catch\`. Use \`Result.fromThrowable\` or \`ResultAsync.fromPromise\` at boundaries where exceptions can occur, and propagate errors via \`.map\`/\`.andThen\`/\`.match\` chains instead of catching them imperatively.
- When exhaustively switching on a discriminated union, always add a \`default\` branch that uses \`satisfies never\` to catch unhandled cases at compile time:
  \`\`\`ts
  default: {
    const _exhaustive: never = value;
    _exhaustive satisfies never;
    break;
  }
  \`\`\`
- Functions must not take more than 2 positional parameters. When a function needs more than 2 inputs, use a named-argument object instead:
  \`\`\`ts
  // ✗ too many positional params
  function run(id: string, message: string, apiKey: string) {}

  // ✓ named arguments
  function run({ id, message, apiKey }: { id: string; message: string; apiKey: string }) {}
  \`\`\`
- Always use the package.json scripts for linting, fixing, and typechecking — never invoke \`biome\`, \`tsc\`, or \`tsgo\` directly:
  - Lint: \`bun run check\`
  - Lint + autofix: \`bun run check:fix\`
  - Typecheck: \`bun run typecheck\`
  - Knip: \`bun run knip\`
- Never let an error go silent. Every error must either be logged or returned as a value and handled.
`;
}
