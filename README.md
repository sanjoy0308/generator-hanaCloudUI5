# Generator for UI5 projects in MTA folder structure

Generator which use the official UI5 tooling from ui5-community and support multiple deployment targets such as the SAP Business Technology Platform.

## Usage with ui5_to_mta

```bash
$> npm i -g yo
$> yo ui5_to_mta project

     _-----_
    |       |    ╭──────────────────────────────╮
    |--(o)--|    │  Welcome to the ui5_to_mta   │
   `---------´   │        generator!            │
    ( _´U`_ )    ╰──────────────────────────────╯
    /___A___\   /
     |  ~  |
   __'.___.'__
 ´   `  |° ´ Y `
```

Run you can use `npm start` (or `yarn start`) to start the local server for development.

## Standalone usage

Note the different greeting when the generator starts.

```bash
$> npm i -g yo
$> yo ./generator-ui5_to_mta

     _-----_     ╭──────────────────────────────╮
    |       |    │      Welcome to the          │
    |--(o)--|    │     ui5_to_mta-project       │
   `---------´   │        generator!            │
    ( _´U`_ )    ╰──────────────────────────────╯
    /___A___\   /
     |  ~  |
   __'.___.'__
 ´   `  |° ´ Y `
```

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