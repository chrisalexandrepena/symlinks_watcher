const fs = require("fs");
const path = require("path");

module.exports.syncLinks = (CONFIG_PATH) => {
    if (!CONFIG_PATH) throw new Error("No config path specified");
    if (CONFIG_PATH.slice(0, 1) !== "/") throw new Error("Config path must be absolute");
    if (!fs.existsSync(CONFIG_PATH)) throw new Error(`File ${CONFIG_PATH} not found`);
    if (!/\.json$/.test(CONFIG_PATH)) throw new Error("Config file must be of type .json");
    const CONFIGS = require(CONFIG_PATH)

    for (const config of CONFIGS) {
        const { destinationFolder, sourceFolder } = config;
        if (!(fs.existsSync(destinationFolder) && fs.existsSync(sourceFolder))) throw new Error(`source ${sourceFolder} or destination ${destinationFolder} don't exist`);
        if (!(fs.lstatSync(sourceFolder).isDirectory() && fs.lstatSync(destinationFolder).isDirectory())) throw new Error(`source ${sourceFolder} and ${destinationFolder} must be folders`);

        const symlinksInDestination = fs.readdirSync(destinationFolder)
            .map(e => path.join(destinationFolder, e))
            .filter(e => testSymbolicLink(e).isSymbolic)
            .reduce((accumulator, current) => {
                try {
                    fs.statSync(current);
                    accumulator.valid.push(current);
                }
                catch (err) {
                    accumulator.invalid.push(current)
                }
                return accumulator;
            }, { valid: [], invalid: [] });
        for (const symlinkPath of symlinksInDestination.invalid) {
            console.log(`deleting symlink ${symlinkPath} because it is invalid`);
            fs.unlinkSync(symlinkPath);
        }

        const newLinksToCreate = fs.readdirSync(config.sourceFolder)
            .map(e => path.join(config.sourceFolder, e))
            .filter(sourcePath => !symlinksInDestination.valid.find(e => fs.readlinkSync(e) === sourcePath || path.basename(e) === path.basename(sourcePath)));
        for (const newLinkToCreate of newLinksToCreate) {
            console.log(`creating symlink for ${newLinkToCreate} in ${destinationFolder}`);
            fs.symlinkSync(newLinkToCreate, path.join(destinationFolder, path.basename(newLinkToCreate)), "dir");
        }
    };
    console.log("finished running");

    function testSymbolicLink(path) {
        const response = {
            exists: false,
            isSymbolic: false,
            isFolder: false,
            destination: ""
        }
        let stats
        try {
            stats = fs.lstatSync(path);
            response.exists = fs.existsSync(path)
            response.isSymbolic = stats.isSymbolicLink();
            response.isFolder = stats.isDirectory();
        } catch (err) { return response };

        return {
            ...response,
            ...{ destination: response.isSymbolic ? fs.readlinkSync(path) : "" }
        }
    }
}