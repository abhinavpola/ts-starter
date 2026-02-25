# ts-starter

Interactive CLI to scaffold a new TypeScript project.

## Usage

```sh
bunx ts-starter my-app
```

Or run interactively:

```sh
bunx ts-starter
```

## Prompts

| Prompt | Options | Default |
|--------|---------|---------|
| Project name | any valid package name | — |
| TypeScript compiler | `tsgo` (Go-based, ~10x faster) · `tsc` | `tsgo` |
| NX | TypeScript project references + sync generator | no |

## What gets scaffolded

Every project includes:

- **[Biome](https://biomejs.dev)** — linter + formatter with strict rules
- **[Knip](https://knip.dev)** — dead code / unused exports detector
- **[Husky](https://typicode.github.io/husky)** — pre-commit hook running `bun run check`
- **[Git Town](https://www.git-town.com)** — `git-town.toml` config
- **GitHub Actions** — CI workflow: lint → typecheck → knip → test
- **Bun test** — placeholder test in `src/index.test.ts`

### With NX

Adds `nx` + `@nx/js`, enables the `typescript-sync` generator, and configures `tsconfig.json` with `composite: true` for project references.

## Scripts (in scaffolded project)

```sh
bun run check        # biome lint + format check
bun run check:fix    # biome lint + format fix
bun run typecheck    # tsgo --noEmit  (or tsc --noEmit)
bun run knip         # dead code check
bun test             # run tests
```
