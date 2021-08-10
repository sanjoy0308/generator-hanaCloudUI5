# Generator for UI5 projects in MTA folder structure

[![Build Status][test-image]][test-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![License Status][license-image]][license-url]

Generator which use the official UI5 tooling from ui5-community and support multiple deployment targets such as the SAP Business Technology Platform.

## Usage with hanacloudui5

```bash
$> npm i -g yo
$> yo hanacloudui5 project

     _-----_
    |       |    ╭──────────────────────────────╮
    |--(o)--|    │  Welcome to the hanacloudui5 │
   `---------´   │        generator!            │
    ( _´U`_ )    ╰──────────────────────────────╯
    /___A___\   /
     |  ~  |
   __'.___.'__
 ´   `  |° ´ Y `
```

![generation flow](./docs/embeddedUsage.gif)

Run you can use `npm start` (or `yarn start`) to start the local server for development.

## Standalone usage

Note the different greeting when the generator starts.

```bash
$> npm i -g yo
$> yo ./generator-ui5-project

     _-----_     ╭──────────────────────────────╮
    |       |    │      Welcome to the          │
    |--(o)--|    │     hanacloudui5-project     │
   `---------´   │        generator!            │
    ( _´U`_ )    ╰──────────────────────────────╯
    /___A___\   /
     |  ~  |
   __'.___.'__
 ´   `  |° ´ Y `
```

![generation flow](./docs/standaloneUsage.gif)

## Target platforms

During the prompting phase, the generator will ask on which target platform your app should run. Currently, the following options are available:

### SAP HTML5 Application Repository service for SAP BTP

This option is a more sophisticate way to serve the web app from Cloud Foundry-based environments. 

## Deployment

Depending on your target platform you'll need to install additional tools:

### Cloud Foundry

Deployment steps:

Call this command from the root directory to deploy the application to Cloud Foundry

```
npm run deploy
```

## Embedded Technologies

This project leverages (among others) the following Open Source projects:

-   [UI5 Build and Development Tooling](https://github.com/SAP/ui5-tooling)
-   [OpenUI5. Build Once. Run on any device.](https://github.com/SAP/openui5)

## Support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

We welcome any type of contribution (code contributions, pull requests, issues) to this generator equally.