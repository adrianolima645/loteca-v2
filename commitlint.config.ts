import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allowed types — covers all standard + project-specific needs
    'type-enum': [
      2,
      'always',
      [
        'feat',     // new feature
        'fix',      // bug fix
        'chore',    // tooling, deps, config
        'ci',       // CI/CD changes
        'docs',     // documentation only
        'style',    // formatting, no logic change
        'refactor', // neither fix nor feature
        'perf',     // performance improvement
        'test',     // adding or fixing tests
        'revert',   // revert a previous commit
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 100],
  },
}

export default config
