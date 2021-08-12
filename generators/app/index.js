"use strict";
const Generator = require("yeoman-generator"),
    fileaccess = require("../../helpers/fileaccess"),
    path = require("path"),
    chalk = require("chalk"),
    yosay = require("yosay"),
    glob = require("glob");

module.exports = class extends Generator {
    async initializing() {
        await fileaccess.readJS.call(this, "/webapp/Component.js");
    }

    async prompting() {
        if (!this.options.embedded) {
            this.log(yosay(`Welcome2 to the ${chalk.red("hanacloudui5-project")} generator!`));
        }       

        //this.log("this.config.projectname " + this.config.projectname);
        return this.prompt([
            {
                type: "input",
                name: "projectname",
                message: "What is your on-premise UI5 project name?",
                validate: (s) => {
                    if (/^\d*[a-zA-Z][a-zA-Z0-9]*$/g.test(s)) {
                        return true;
                    }
                    return "Please use alpha numeric characters only for the project name.";
                },
                default: this.options.projectname
            },
            {
                type: "input",
                name: "namespaceUI5",
                message: "Which namespace do you have for your existing project?",
                validate: (s) => {
                    if (/^[a-zA-Z0-9_\.]*$/g.test(s)) {
                        return true;
                    }
                    return "Please use alpha numeric characters and dots only for the namespace.";
                },
                default: this.options.namespaceUI5
            }
        ]).then((answers) => {
            if (answers.newdir) {
                this.destinationRoot(`${answers.namespaceUI5}.${answers.projectname}`);
            }
            this.config.set(answers);
            this.config.set("namespaceURI", answers.namespaceUI5.split(".").join("/"));
        });
    }

    async writing() {
        const oConfig = this.config.getAll();

        this.sourceRoot(path.join(__dirname, "templates"));
        glob.sync("**", {
            cwd: this.sourceRoot(),
            nodir: true
        }).forEach((file) => {
            const sOrigin = this.templatePath(file);
            const sTarget = this.destinationPath(file.replace(/^_/, "").replace(/\/_/, "/"));

            this.fs.copyTpl(sOrigin, sTarget, oConfig);
        });

        const oSubGen = Object.assign({}, oConfig);
        oSubGen.isSubgeneratorCall = true;
        oSubGen.cwd = this.destinationRoot();
        oSubGen.modulename = "uimodule";

        this.composeWith(require.resolve("../additionalmodules"), oSubGen);

        this.composeWith(require.resolve("../newwebapp"), oSubGen);
    }

    async addPackage() {
        const oConfig = this.config.getAll();
        let packge = {
            name: oConfig.projectname,
            version: "0.0.1",
            scripts: {
                start: "ui5 serve --config=uimodule/ui5.yaml  --open index.html",
                "build:ui": "run-s ",
                test: "run-s lint karma",
                "karma-ci": "karma start karma-ci.conf.js",
                clearCoverage: "shx rm -rf coverage",
                karma: "run-s clearCoverage karma-ci",
                lint: "eslint ."
            },
            devDependencies: {
                shx: "^0.3.3",
                "@ui5/cli": "^2.11.2",
                "ui5-middleware-livereload": "^0.5.4",
                karma: "^6.3.4",
                "karma-chrome-launcher": "^3.1.0",
                "karma-coverage": "^2.0.3",
                "karma-ui5": "^2.3.4",
                "npm-run-all": "^4.1.5",
                eslint: "^7.29.0"
            },
            ui5: {
                dependencies: ["ui5-middleware-livereload"]
            }
        };

        packge.devDependencies["ui5-middleware-cfdestination"] = "^0.6.0";
        (packge.devDependencies["ui5-task-zipper"] = "^0.4.3"), (packge.devDependencies["cross-var"] = "^1.1.0");
        packge.devDependencies["mbt"] = "^1.2.1";
        packge.ui5.dependencies.push("ui5-middleware-cfdestination");
        packge.ui5.dependencies.push("ui5-task-zipper");

        packge.scripts["build:mta"] = "mbt build";
        packge.scripts[
            "deploy:cf"
        ] = `cross-var cf deploy mta_archives/${oConfig.projectname}_$npm_package_version.mtar`;
        packge.scripts["deploy"] = "run-s build:mta deploy:cf";
        await fileaccess.writeJSON.call(this, "/package.json", packge);
    }

    install() {
        this.config.set("setupCompleted", true);
        this.installDependencies({
            bower: false,
            npm: true
        });
    }

    end() {
        this.spawnCommandSync("git", ["init", "--quiet"], {
            cwd: this.destinationPath()
        });
        this.spawnCommandSync("git", ["add", "."], {
            cwd: this.destinationPath()
        });
        this.spawnCommandSync(
            "git",
            ["commit", "--quiet", "--allow-empty", "-m", "Initialize repository with MTA project structure"],
            {
                cwd: this.destinationPath()
            }
        );
    }
};
