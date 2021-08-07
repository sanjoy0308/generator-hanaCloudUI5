const Generator = require('yeoman-generator'),
  yosay = require("yosay"),
  chalk = require("chalk");

module.exports = class extends Generator {

  initializing() {
    this.log(yosay(`Welcome to the ${chalk.red("HANA Cloud UI5")} generator!`));
    this.composeWith("easy-ui5");
  }

  async prompting() {
    const answers = await this.prompt([
      {
        type: "input",
        name: "username",
        message: "What's your Git username",
        store: true,
        validate: function (value) {
          //Check blank
          if (value.trim() === "") {
            return "Can't be an empty string.";
          }
          return true;
        }
      },
      {
        type: "input",
        name: "name",
        message: "Your on-premise application git repository:",
        validate: function (value) {
          //Check blank
          if (value.trim() === "") {
            return "Can't be an empty string.";
          }
          return true;
        }
      },
      {
        type: "confirm",
        name: "git",
        message: "Please confirm the git repository url",
        validate: function (value) {
          //Check blank
          if (value) {
            return true;
          }
          return false;
        }
      }
    ]);
    this.log("GIT URL:", answers.name);
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('public/index.html'),
      { title: 'Templating with Yeoman' }
    )
  }

};