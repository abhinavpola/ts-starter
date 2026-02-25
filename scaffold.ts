import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  biomeJsonContent,
  ciWorkflowContent,
  gitignoreContent,
  gitTownConfigContent,
  huskyPreCommitContent,
  nxJsonContent,
  packageJsonContent,
  sampleIndexContent,
  sampleTestContent,
  type TemplateOptions,
  tsconfigContent,
} from "./templates.ts";

type ScaffoldOptions = TemplateOptions;

export async function scaffold(opts: ScaffoldOptions): Promise<void> {
  const dir = join(process.cwd(), opts.name);

  if (existsSync(dir)) {
    throw new Error(`Directory already exists: ${opts.name}`);
  }

  const srcDir = join(dir, "src");
  const huskyDir = join(dir, ".husky");
  const workflowsDir = join(dir, ".github", "workflows");

  await Promise.all([
    mkdir(srcDir, { recursive: true }),
    mkdir(huskyDir, { recursive: true }),
    mkdir(workflowsDir, { recursive: true }),
  ]);

  const preCommitPath = join(huskyDir, "pre-commit");

  const writes: Promise<number>[] = [
    Bun.write(join(dir, "package.json"), packageJsonContent(opts)),
    Bun.write(join(dir, "tsconfig.json"), tsconfigContent(opts)),
    Bun.write(join(dir, "biome.json"), biomeJsonContent()),
    Bun.write(join(dir, ".gitignore"), gitignoreContent()),
    Bun.write(join(dir, "git-town.toml"), gitTownConfigContent()),
    Bun.write(join(srcDir, "index.ts"), sampleIndexContent()),
    Bun.write(join(srcDir, "index.test.ts"), sampleTestContent()),
    Bun.write(join(workflowsDir, "ci.yml"), ciWorkflowContent()),
    Bun.write(preCommitPath, huskyPreCommitContent()).then(async (n) => {
      await Bun.$`chmod +x ${preCommitPath}`.quiet();
      return n;
    }),
  ];

  if (opts.nx) {
    writes.push(Bun.write(join(dir, "nx.json"), nxJsonContent()));
  }

  await Promise.all(writes);

  await Bun.$`git -C ${dir} init`.quiet();
}
