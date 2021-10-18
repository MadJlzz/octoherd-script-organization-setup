# octoherd-script-organization-setup

> This script configure default settings for a repositories within an organization.

## Usage

Minimal usage

```bash
npx octoherd-script-organization-setup \
  --template MadJlzz/octoherd-template
```

Pass all options as CLI flags to avoid user prompts

```bash
npx octoherd-script-organization-setup \
  --template MadJlzz/octoherd-template \
  -T ghp_0123456789abcdefghjklmnopqrstuvwxyzA \
  -R "MadJlzz/*" 
```

## Options

| option                       | type             | description                                                                                                                                                                                                                                 |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--template`                 | string           | **(required)** this is the repo you want the settings to be copied from                                                                                                                                                                     |
| `--copy-labels`              | boolean          | **(optional)** a flag used to trigger label copying                                                                                                                                                                                         |
| `--copy-merge-options`       | boolean          | **(optional)** a flag used to trigger merge options strategy copying                                                                                                                                                                        |
| `--octoherd-token`, `-T`     | string           | A personal access token ([create](https://github.com/settings/tokens/new?scopes=repo)). Script will create one if option is not set                                                                                                         |
| `--octoherd-repos`, `-R`     | array of strings | One or multiple space-separated repositories in the form of `repo-owner/repo-name`. `repo-owner/*` will find all repositories for one owner. `*` will find all repositories the user has access to. Will prompt for repositories if not set |
| `--octoherd-bypass-confirms` | boolean          | Bypass prompts to confirm mutating requests                                                                                                                                                                                                 |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## About Octoherd

[@octoherd](https://github.com/octoherd/) is project to help you keep your GitHub repositories in line.
