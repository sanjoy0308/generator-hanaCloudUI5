const Generator = require("yeoman-generator"),
    fileaccess = require("../../helpers/fileaccess"),
    path = require("path"),
    glob = require("glob");

module.exports = class extends Generator {
    static hidden = true;

    prompting() {
        if (this.options.isSubgeneratorCall) {
            this.destinationRoot(this.options.cwd);
            this.options.oneTimeConfig = this.config.getAll();
            this.options.oneTimeConfig.modulename = this.options.modulename;
            return;
        }
        throw 'This subgenerator is only intended for internal use. Please don"t call it directly.';
    }

    async writing() {
        this.sourceRoot(path.join(__dirname, "templates"));

        const oConfig = this.options.oneTimeConfig;
        const platformIsAppRouter = false; // aka no destination service etc needed
        // Copy approuter module
        glob.sync("**", {
            cwd: this.sourceRoot() + "/approuter",
            nodir: true
        }).forEach((file) => {
            this.fs.copyTpl(
                this.templatePath("approuter/" + file),
                this.destinationPath(oConfig.projectname + "-approuter/" + file.replace(/^_/, "").replace(/\/_/, "/")),
                oConfig
            );
        });

        const welcomeRoute = platformIsAppRouter
            ? oConfig.projectname + "-uimodule/index.html"
            : (oConfig.namespaceUI5 + oConfig.projectname + "/").replace(/\./g, "");

        await fileaccess.manipulateJSON.call(this, "/" + oConfig.projectname + "-approuter/xs-app.json", {
            welcomeFile: welcomeRoute,
            authenticationMethod: "none",
            logout: {
                logoutEndpoint: "/do/logout"
            },
            routes: []
        });

        // Copy deployer module
        glob.sync("**", {
            cwd: this.sourceRoot() + "/deployer",
            nodir: true
        }).forEach((file) => {
            this.fs.copyTpl(
                this.templatePath("deployer/" + file),
                this.destinationPath(oConfig.projectname + "_ui_deployer/" + file.replace(/^_/, "").replace(/\/_/, "/")),
                oConfig
            );
        });
    }

    async addMTA() {
        const oConfig = this.config.getAll();

        let mta = {
            ID: oConfig.projectname,
            "_schema-version": "3.2.0",
            version: "0.0.1",
            parameters: {
                "enable-parallel-deployments": true
            },
            modules: [],
            resources: []
        };

        let approuter;
        approuter = {
            name: oConfig.projectname,
            type: "nodejs",
            path: "approuter",
            parameters: {
                "disk-quota": "512M",
                memory: "512M"
            },
            requires: []
        };
        mta.modules.push(approuter);



        mta.resources.push({
            name: oConfig.projectname + "_destination",
            type: "org.cloudfoundry.managed-service",
            parameters: {
                "service-plan": "lite",
                service: "destination",
                config: {
                    HTML5Runtime_enabled: true,
                    version: "1.0.0"
                }
            }
        });
        if (approuter) {
            approuter.requires.push({ name: oConfig.projectname + "_destination" });
        }

        mta.modules.push({
            name: "webapp_deployer",
            type: "com.sap.application.content",
            path: "deployer",
            requires: [
                {
                    name: oConfig.projectname + "_html5_repo_host",
                    parameters: {
                        "content-target": true
                    }
                }
            ],
            "build-parameters": {
                ["build-result"]: "resources",
                ["requires"]: []
            }
        });

        mta.resources.push({
            name: oConfig.projectname + "_html5_repo_host",
            type: "org.cloudfoundry.managed-service",
            parameters: {
                "service-plan": "app-host",
                service: "html5-apps-repo",
                config: {
                    sizeLimit: 100
                }
            }
        });

        if (approuter) {
            mta.resources.push({
                name: oConfig.projectname + "_html5_repo_runtime",
                type: "org.cloudfoundry.managed-service",
                parameters: {
                    "service-plan": "app-runtime",
                    service: "html5-apps-repo"
                }
            });
            approuter.requires.push({ name: oConfig.projectname + "_html5_repo_runtime" });
        }

        mta.resources.push({
            name: oConfig.projectname + "_uaa",
            type: "org.cloudfoundry.managed-service",
            parameters: {
                path: "./xs-security.json",
                "service-plan": "application",
                service: "xsuaa"
            }
        });
        this.fs.copyTpl(
            this.templatePath("xs-security.json"),
            this.destinationPath("xs-security.json"),
            oConfig
        );
        if (approuter) {
            approuter.requires.push({ name: oConfig.projectname + "_uaa" });
        }

        if (oConfig.platform === "SAP Launchpad service") {
            mta.modules.push({
                name: oConfig.projectname + "destination-content",
                type: "com.sap.application.content",
                "build-parameters": {
                    "no-source": true
                },
                requires: [
                    {
                        name: oConfig.projectname + "_uaa",
                        parameters: {
                            "service-key": {
                                name: oConfig.projectname + "_uaa-key"
                            }
                        }
                    },
                    {
                        name: oConfig.projectname + "_html5_repo_host",
                        parameters: {
                            "service-key": {
                                name: oConfig.projectname + "_html5_repo_host-key"
                            }
                        }
                    },
                    {
                        name: oConfig.projectname + "_destination",
                        parameters: {
                            "content-target": true
                        }
                    }
                ],
                parameters: {
                    content: {
                        instance: {
                            existing_destinations_policy: "update",
                            destinations: [
                                {
                                    Name: oConfig.projectname + "_html5_repo_host",
                                    ServiceInstanceName: oConfig.projectname + "_html5_repo_host",
                                    ServiceKeyName: oConfig.projectname + "_html5_repo_host-key",
                                    "sap.cloud.service": oConfig.projectname + ".service"
                                },
                                {
                                    Name: oConfig.projectname + "_uaa",
                                    Authentication: "OAuth2UserTokenExchange",
                                    ServiceInstanceName: oConfig.projectname + "_uaa",
                                    ServiceKeyName: oConfig.projectname + "_uaa-key",
                                    "sap.cloud.service": oConfig.projectname + ".service"
                                }
                            ]
                        }
                    }
                }
            });
        }

        await fileaccess.writeYAML.call(this, "/mta.yaml", mta);
    }
};
