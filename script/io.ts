import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import path = require('path');

import {
    BIN_OUTPUT_PATH,
    CONTRACT_FILE
} from "./constants";

export const print = (text) => {
    process.stdout.write(text);
};

export const println = (text) => {
    process.stdout.write(text + '\n');
};

export const readText = (filePath) => {
    return fs.readFileSync(filePath).toString();
};

export const readJSON = (filePath) => {
    return JSON.parse(readText(filePath));
};

export const rmrf = (pth) => {
    if (fs.existsSync(pth)) {
        fs.readdirSync(pth).forEach((file) => {
            const curPath = pth + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                rmrf(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(pth);
    }
};

export const ensureAndClear = (dir) => {
    rmrf(dir);
    mkdirp.sync(dir);
};

export const getContractFile = () => {
    return readJSON(CONTRACT_FILE);
};

export const parseSigFile = (testName) => {
    const hashes = fs.readFileSync(path.join(BIN_OUTPUT_PATH, testName + ".signatures")).toString();
    const lines = hashes.split(/\r\n|\r|\n/);
    const funcs = {};
    for (let line of lines) {

        line = line.trim();
        if (line.length === 0) {
            continue;
        }
        const tokens = line.split(':');
        if (tokens.length !== 2) { // Should never happen with well formed signature files.
            throw new Error(`No ':' separator in line: '${line}' in signatures: ${testName}`);
        }
        const hash = tokens[0].trim();
        funcs[hash] = tokens[1].trim();
    }
    return funcs;
};