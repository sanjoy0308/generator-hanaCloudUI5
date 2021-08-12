const Generator = require("yeoman-generator"),
    fileaccess = require("../../helpers/fileaccess"),
    path = require("path"),
    glob = require("glob");

module.exports = class extends Generator {
    prompting() {
        if (this.options.isSubgeneratorCall) {
            return this.prompt([
                {
                    type: "input",
                    name: "tilename",
                    message: "What name should be displayed on the Fiori Launchpad tile?",
                    default: "Fiori App",
                    when: this.options.platform === "SAP Launchpad service"
                }
            ]).then((answers) => {
                this.destinationRoot(this.options.cwd);
                this.options.oneTimeConfig = Object.assign({}, this.config.getAll(), this.options);
                this.options.oneTimeConfig.modulename = this.options.modulename;
                this.options.oneTimeConfig.tilename = answers.tilename;
                this.options.oneTimeConfig.viewname = "MainView";
                this.options.oneTimeConfig.appId =
                    this.options.oneTimeConfig.namespaceUI5 +
                    "." +
                    (this.options.modulename === this.options.oneTimeConfig.projectname + "-uimodule"
                        ? this.options.oneTimeConfig.projectname
                        : this.options.modulename);
                this.options.oneTimeConfig.appURI =
                    this.options.oneTimeConfig.namespaceURI +
                    "/" +
                    (this.options.modulename === this.options.oneTimeConfig.projectname + "-uimodule"
                        ? this.options.oneTimeConfig.projectname
                        : this.options.modulename);
            });
        }

        var aPrompt = [
            {
                type: "input",
                name: "modulename",
                message: "What is the name of the module?",
                validate: (s) => {
                    if (/^\d*[a-zA-Z][a-zA-Z0-9]*$/g.test(s)) {
                        return true;
                    }
                    return "Please use alpha numeric characters only for the module name.";
                }
            },
            {
                type: "input",
                name: "tilename",
                message: "What name should be displayed on the Fiori Launchpad tile?",
                default: "Fiori App",
                when: this.config.get("platform") === "SAP Launchpad service"
            }
        ];

        if (!this.config.getAll().viewtype) {
            aPrompt = aPrompt.concat([
                {
                    type: "input",
                    name: "projectname",
                    message:
                        "Seems like this project has not been generated with ui5_to_mta. Please enter the name your project.",
                    validate: (s) => {
                        if (/^\d*[a-zA-Z][a-zA-Z0-9]*$/g.test(s)) {
                            return true;
                        }
                        return "Please use alpha numeric characters only for the project name.";
                    },
                    default: "oldUI5App"
                },
                {
                    type: "input",
                    name: "namespaceUI5",
                    message: "Please enter the namespace you use currently",
                    validate: (s) => {
                        if (/^[a-zA-Z0-9_\.]*$/g.test(s)) {
                            return true;
                        }
                        return "Please use alpha numeric characters and dots only for the namespace.";
                    },
                    default: "com.orgName"
                },
                {
                    type: "list",
                    name: "viewtype",
                    message: "Which view type do you use?",
                    choices: ["XML", "JSON", "JS", "HTML"],
                    default: "XML"
                }
            ]);
        }        
    }

    async writing() {
        const sModuleName = this.options.oneTimeConfig.modulename;
        
        const platformIsAppRouter = false;
        const netweaver = false;

        // Write files in new module folder
        this.sourceRoot(path.join(__dirname, "templates"));
        glob.sync("**", {
            cwd: this.sourceRoot(),
            nodir: true
        }).forEach((file) => {
            const sOrigin = this.templatePath(file);
            const sTarget = this.destinationPath(this.options.oneTimeConfig.projectname + "-uimodule/" + file.replace(/^_/, "").replace(/\/_/, "/"));

            const isUnneededFlpSandbox = false;
            const isUnneededXsApp =
                sTarget.includes("xs-app") &&
                !(
                    this.options.oneTimeConfig.platform === "SAP Launchpad service" ||
                    this.options.oneTimeConfig.platform === "SAP HTML5 Application Repository service for SAP BTP"
                );

            if (isUnneededXsApp || isUnneededFlpSandbox) {
                return;
            }

            this.fs.copyTpl(sOrigin, sTarget, this.options.oneTimeConfig);
        });

        // Append to Main package.json
        await fileaccess.manipulateJSON.call(this, "/package.json", function (packge) {
            packge.scripts["serve:" + sModuleName] = "ui5 serve --config=" + sModuleName + "/ui5.yaml";
            packge.scripts["build:ui"] += " build:" + sModuleName;
            let buildCommand = "ui5 build --config=" + sModuleName + "/ui5.yaml --clean-dest";
            
            if (platformIsAppRouter) {
                buildCommand += ` --dest approuter/${sModuleName}/webapp`;
            } else if (!netweaver) {
                buildCommand += ` --dest ${sModuleName}/dist`;
                buildCommand += " --include-task=generateManifestBundle";
            } else {
                buildCommand += " --dest dist/" + sModuleName;
            }
            packge.scripts["build:" + sModuleName] = buildCommand;
            return packge;
        });

        await fileaccess.writeYAML.call(this, "/mta.yaml", (mta) => {
            const deployer = mta.modules.find((module) => module.name === "webapp_deployer");

            deployer["build-parameters"]["requires"].push({
                name: sModuleName,
                artifacts: [`dist/${sModuleName}.zip`],
                ["target-path"]: "resources/"
            });

            mta.modules.push({
                name: sModuleName,
                type: "html5",
                path: sModuleName,
                "build-parameters": {
                    builder: "custom",
                    commands: [`npm run build:${sModuleName} --prefix ..`],
                    "supported-platforms": []
                }
            });
            return mta;
        });

        const modules = this.config.get("uimodules") || [];
        modules.push(this.options.oneTimeConfig.modulename);
        this.config.set("uimodules", modules);
    }
};
