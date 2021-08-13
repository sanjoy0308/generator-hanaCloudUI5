const objectAssignDeep = require("object-assign-deep"),
    yaml = require("yaml"),
    mergedirs = require("merge-dirs").default,
    fs = require("fs");

// overide can be an object or a function that receives the current object
exports.writeJSON = async function (filePath, override) {
    try {
        const fullFilePath = process.cwd() + filePath;
        let oldContent = {};
        if (this.fs.exists(fullFilePath)) {
            oldContent = this.fs.readJSON(fullFilePath);
        }

        const newContent =
            typeof override === "function"
                ? override(oldContent)
                : objectAssignDeep.withOptions(oldContent, [override], { arrayBehaviour: "merge" });

        this.fs.writeJSON(fullFilePath, newContent);
        if (!this.options.isSubgeneratorCall && this.config.get("setupCompleted")) {
            this.log(`Updated file: ${filePath}`);
        }
    } catch (e) {
        this.log(`Error during the manipulation of the ${filePath} file: ${e}`);
        throw e;
    }
};

// overide can be an object or a function that receives the current object
exports.writeYAML = async function (filePath, override) {
    try {
        const fullFilePath = process.cwd() + filePath;
        let oldContent = {};
        if (this.fs.exists(fullFilePath)) {
            oldContent = yaml.parse(this.fs.read(fullFilePath));
        }

        const newContent =
            typeof override === "function"
                ? override(oldContent)
                : objectAssignDeep.withOptions(oldContent, [override], { arrayBehaviour: "merge" });

        this.fs.write(fullFilePath, yaml.stringify(newContent));

        if (!this.options.isSubgeneratorCall && this.config.get("setupCompleted")) {
            this.log(`Updated file: ${filePath}`);
        }
    } catch (e) {
        this.log(`Error during the manipulation of the ${filePath} file: ${e}`);
        throw e;
    }
};

// overide can be an object or a function that receives the current object
exports.manipulateJSON = async function (filePath, override) {
    try {
        const fullFilePath = process.cwd() + filePath;
        const oldContent = this.fs.readJSON(fullFilePath);

        const newContent =
            typeof override === "function"
                ? override(oldContent)
                : objectAssignDeep.withOptions(oldContent, [override], { arrayBehaviour: "merge" });

        this.fs.writeJSON(fullFilePath, newContent);
        if (!this.options.isSubgeneratorCall && this.config.get("setupCompleted")) {
            this.log(`Updated file: ${filePath}`);
        }
    } catch (e) {
        this.log(`Error during the manipulation of the ${filePath} file: ${e}`);
        throw e;
    }
};

// overide can be an object or a function that receives the current object
exports.manipulateYAML = async function (filePath, override) {
    try {
        const fullFilePath = process.cwd() + filePath;
        const oldContent = yaml.parse(this.fs.read(fullFilePath));

        const newContent =
            typeof override === "function"
                ? override(oldContent)
                : objectAssignDeep.withOptions(oldContent, [override], { arrayBehaviour: "merge" });

        this.fs.write(fullFilePath, yaml.stringify(newContent));

        !this.options.isSubgeneratorCall && this.log(`Updated file: ${filePath}`);
    } catch (e) {
        this.log(`Error during the manipulation of the ${filePath} file: ${e}`);
        throw e;
    }
};


// read Component.js javascript file to identify project name and namespace
exports.readJS = async function (filePath) {
    try {
        const fullFilePath = process.cwd() + filePath,
            oldContent = this.fs.read(fullFilePath),
            componentPath = oldContent.substring(oldContent.indexOf("UIComponent.extend(\"") + 20, oldContent.indexOf(".Component\"")),
            componentPathSplit = componentPath.split("."),
            appName = componentPathSplit[componentPathSplit.length - 1];
        let namespace = "";
        for (let index = 0; index < componentPathSplit.length - 1; index++) {
            const element = componentPathSplit[index];
            if (index === componentPathSplit.length - 2) {
                namespace = namespace + element;
            } else {
                namespace = namespace + element + ".";
            }
        }
        this.options.namespaceUI5 = namespace;
        this.options.projectname = appName;
    } catch (e) {
        this.log(`Error during the manipulation of the ${filePath} file: ${e}`);
        throw e;
    }
};

// copy webapp from existing project
exports.copyWebapp = async function (oldPath, newPath) {
    try {
        mergedirs(process.cwd() + oldPath, process.cwd() + newPath, "ask");
    } catch (e) {
        this.log(`Error during the copying of the ${oldPath} file: ${e}`);
        throw e;
    }
};

// delete webapp from existing project
exports.deleteOldWebapp = async function (dir) {
    dir = process.cwd() + dir;
    try {
        fs.rmdirSync(dir, { recursive: true });
        console.log(`${dir} is deleted!`);
    } catch (err) {
        console.error(`Error while deleting ${dir}.`);
    }
};


// delete unnecessary files from existing project
exports.deleteOldFiles = async function () {
    const dir = process.cwd();
    fs.readdir(dir, (err, files) => {
        files.forEach(file => {
          this.log(file);
        });
      });
    /* fs.unlink('path/file.txt', (err) => {
        if (err) throw err;
        console.log('path/file.txt was deleted');
    });
    console.log(`${dir} is deleted!`); */
};


// delete unnecessary files from existing project
exports.deleteOldFiles = async function (appName) {
    const dir = process.cwd();
    fs.readdir(dir, (err, files) => {
        files.forEach(file => {
            if (file === appName + "-approuter"
                || file === appName + "_ui_deployer"
                || file === appName + "-uimodule"
                || file === "xs-security.json"
                || file === ".gitignore"
                || file === ".vscode"
                || file === "package.json"
                || file === "package-lock.json"
                || file === "README.md") {
                this.log("Don't delete " + file);
            } else {
                this.log("delete please " + file);
            }
            /* fs.unlink('path/file.txt', (err) => {
                if (err) throw err;
                console.log('path/file.txt was deleted');
            });
            console.log(`${dir} is deleted!`); */
        });
    });
};