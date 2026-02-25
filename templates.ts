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
          },
          style: {
            useBlockStatements: "error",
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

export function sampleIndexContent(): string {
  return `console.log("Hello, world!");\n`;
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
  return `bun run check\n`;
}

export function gitTownConfigContent(): string {
  return `[branches]
main = "main"
`;
}
