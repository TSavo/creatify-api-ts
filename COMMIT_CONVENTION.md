# Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for commit messages to ensure consistent versioning and changelog generation.

## Commit Message Format

Each commit message consists of a **header**, a **body**, and a **footer**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and must conform to the [Commit Message Header](#commit-message-header) format.

The **body** is optional but recommended for providing additional context.

The **footer** is optional and can be used to reference issue trackers.

### Commit Message Header

```
<type>(<scope>): <subject>
```

The `type` and `subject` fields are mandatory, the `scope` field is optional.

#### Type

Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests or correcting existing tests
* **build**: Changes that affect the build system or external dependencies
* **ci**: Changes to our CI configuration files and scripts
* **chore**: Other changes that don't modify src or test files
* **revert**: Reverts a previous commit

#### Scope

The scope is optional and should be the name of the npm package affected (as perceived by the person reading the changelog).

#### Subject

The subject contains a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize the first letter
* no dot (.) at the end

### Examples

```
feat(api): add ability to create custom templates
```

```
fix(core): resolve issue with video generation timeout
```

```
docs: update README with new API examples
```

## Commit Types and Versioning

Semantic-release uses the commit messages to determine the type of changes in the codebase and automatically determines the next semantic version number based on the types of commits:

| Commit Type | Version Bump |
|-------------|--------------|
| `feat`      | Minor        |
| `fix`       | Patch        |
| `perf`      | Patch        |
| `revert`    | Patch        |
| `docs`      | None         |
| `style`     | None         |
| `refactor`  | None         |
| `test`      | None         |
| `build`     | None         |
| `ci`        | None         |
| `chore`     | None         |

Additionally, a `BREAKING CHANGE:` in the commit footer will trigger a major version bump.

Example:
```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```
