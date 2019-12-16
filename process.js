'use strict';

const path = require('path');
const fs = require('fs');

function encodeBase64(filename, pathToSourceDir, pathToDestinationDir) {
    return new Promise((resolve, reject) => {
        const pathToFile = `${pathToSourceDir}/${filename}`;
        const pathToOutputFile = `${pathToDestinationDir}/${filename}.res`;
        let result = '';
        fs.readFile(pathToFile, "utf8",
                    (err, data) => {
                        fs.writeFile(pathToOutputFile, Buffer.from(data, 'binary').toString('base64'), (err) => {
                            if (err) reject(err);
                            resolve();
                        });
        });
    });
}

function* generator(filenames, pathToSourceDir, pathToDestinationDir) {
    for (const filename of filenames) {
        yield encodeBase64(filename, pathToSourceDir, pathToDestinationDir);
    }
}

(async function main() {
    let pathToSourceDir;
    let pathToDestinationDir;

    // Try to make an absolute paths from relative
    try {
        pathToSourceDir = path.resolve(process.argv[2]);
    } catch (err) {
        console.error('Wrong source directory path!');
        process.exit(1);
    }

    try {
        pathToDestinationDir = path.resolve(process.argv[3]);
    } catch (err) {
        console.error('Wrong destination directory path!');
        process.exit(1);
    }

    const inputFiles = fs.readdirSync(pathToSourceDir);

    Promise.all(generator(inputFiles, pathToSourceDir, pathToDestinationDir)).then(result => console.log(`Total number of processed files: ${result.length}`));

})();