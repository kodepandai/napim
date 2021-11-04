<a name="unreleased"></a>
## [Unreleased]

### Bug Fixes
- fix error from getDb that return transaction

### Features
- **service:** service rule can access input


<a name="v4.0.3"></a>
## [v4.0.3] - 2021-07-03

<a name="v4.0.2"></a>
## [v4.0.2] - 2021-07-02

<a name="v4.0.1"></a>
## [v4.0.1] - 2021-07-02
### Bug Fixes
- configure package.json for support cjs


<a name="v4.0.0"></a>
## [v4.0.0] - 2021-07-01

<a name="v4.0.0-rc1.2"></a>
## [v4.0.0-rc1.2] - 2021-07-01
### Bug Fixes
- change package.json exports to module because it breaks on cjs
- require knex with esm import


<a name="v4.0.0-rc1"></a>
## [v4.0.0-rc1] - 2021-06-30

<a name="v4.0.0-beta"></a>
## [v4.0.0-beta] - 2021-06-10

<a name="v4.0.0-beta3"></a>
## [v4.0.0-beta3] - 2021-06-10
### Bug Fixes
- require knex with esm import


<a name="v4.0.0-beta2"></a>
## [v4.0.0-beta2] - 2021-06-08
### Bug Fixes
- listen always true because of || operator


<a name="v4.0.0-beta1"></a>
## [v4.0.0-beta1] - 2021-05-22
### Bug Fixes
- fix Logger and router

### Code Refactoring
- change to esmodule


<a name="v3.0.0"></a>
## [v3.0.0] - 2021-05-21
### Bug Fixes
- remove env.SERVERLESS, change to simple config.listen, env.LOG=false to disable Logger, env.DB_DESTROY to destroy db after service exec

### Code Refactoring
- update to match polka[@next](https://github.com/next) typing

### Features
- return Polka instance on napim.start


<a name="v2.0.4"></a>
## [v2.0.4] - 2020-11-15

<a name="v2.0.4-beta"></a>
## [v2.0.4-beta] - 2020-11-15

<a name="v2.0.3"></a>
## [v2.0.3] - 2020-11-14

<a name="v2.0.2"></a>
## [v2.0.2] - 2020-11-14

<a name="v2.0.1"></a>
## [v2.0.1] - 2020-11-14

<a name="v2.0.0"></a>
## [v2.0.0] - 2020-11-06
### Bug Fixes
- can use both mongoose and knex


<a name="v1.1.1-beta"></a>
## [v1.1.1-beta] - 2020-10-04

<a name="v1.1.0-beta"></a>
## [v1.1.0-beta] - 2020-09-30

<a name="v1.0.1-beta.4"></a>
## [v1.0.1-beta.4] - 2020-08-21

<a name="v1.0.1-beta.3"></a>
## v1.0.1-beta.3 - 2020-08-10

[Unreleased]: https://github.com/axmad386/napim/compare/v4.0.3...HEAD
[v4.0.3]: https://github.com/axmad386/napim/compare/v4.0.2...v4.0.3
[v4.0.2]: https://github.com/axmad386/napim/compare/v4.0.1...v4.0.2
[v4.0.1]: https://github.com/axmad386/napim/compare/v4.0.0...v4.0.1
[v4.0.0]: https://github.com/axmad386/napim/compare/v4.0.0-rc1.2...v4.0.0
[v4.0.0-rc1.2]: https://github.com/axmad386/napim/compare/v4.0.0-rc1...v4.0.0-rc1.2
[v4.0.0-rc1]: https://github.com/axmad386/napim/compare/v4.0.0-beta...v4.0.0-rc1
[v4.0.0-beta]: https://github.com/axmad386/napim/compare/v4.0.0-beta3...v4.0.0-beta
[v4.0.0-beta3]: https://github.com/axmad386/napim/compare/v4.0.0-beta2...v4.0.0-beta3
[v4.0.0-beta2]: https://github.com/axmad386/napim/compare/v4.0.0-beta1...v4.0.0-beta2
[v4.0.0-beta1]: https://github.com/axmad386/napim/compare/v3.0.0...v4.0.0-beta1
[v3.0.0]: https://github.com/axmad386/napim/compare/v2.0.4...v3.0.0
[v2.0.4]: https://github.com/axmad386/napim/compare/v2.0.4-beta...v2.0.4
[v2.0.4-beta]: https://github.com/axmad386/napim/compare/v2.0.3...v2.0.4-beta
[v2.0.3]: https://github.com/axmad386/napim/compare/v2.0.2...v2.0.3
[v2.0.2]: https://github.com/axmad386/napim/compare/v2.0.1...v2.0.2
[v2.0.1]: https://github.com/axmad386/napim/compare/v2.0.0...v2.0.1
[v2.0.0]: https://github.com/axmad386/napim/compare/v1.1.1-beta...v2.0.0
[v1.1.1-beta]: https://github.com/axmad386/napim/compare/v1.1.0-beta...v1.1.1-beta
[v1.1.0-beta]: https://github.com/axmad386/napim/compare/v1.0.1-beta.4...v1.1.0-beta
[v1.0.1-beta.4]: https://github.com/axmad386/napim/compare/v1.0.1-beta.3...v1.0.1-beta.4
