const fs = require("fs");
const {watch} = require("fs/promises");
const {syncLinks} = require("./sync_links") 

const { CONFIG_PATH } = process.env;
if (!CONFIG_PATH) throw new Error("No config path specified");
if (CONFIG_PATH.slice(0, 1) !== "/") throw new Error("Config path must be absolute");
if (!fs.existsSync(CONFIG_PATH)) throw new Error(`File ${CONFIG_PATH} not found`);
if (!/\.json$/.test(CONFIG_PATH)) throw new Error("Config file must be of type .json");
const CONFIGS = require(CONFIG_PATH);

CONFIGS.forEach(async config=>{
    const { sourceFolder } = config;
    console.log(`new watcher for ${sourceFolder}`);
    const watcher = watch(sourceFolder);
    for await (const event of watcher) {
        syncLinks(CONFIG_PATH);
    }
})