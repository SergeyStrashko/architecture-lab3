'use strict';

const path = require('path');
const fs = require('fs');

function encodeBase64(filename, pathToSourceDir, pathToDestinationDir) {
  return new Promise((resolve, reject) => {
    const pathToFile = `${pathToSourceDir}/${filename}`;
    let result = '';
    fs.readFile(pathToFile, "utf8",
                (err, data) => {
                    result += data;
    });
    
    result = atob(result);
    
    fs.writeFile(pathToOutputFile, result, (err) => {
        if (err) reject(err);
        resolve();
    });
  });
}

// Generate promises
function* generator(filenames, pathToSourceDir, pathToDestinationDir) {
  for (const filename of filenames) {
    yield encodeBase64(
      filename, 
      pathToSourceDir, 
      pathToDestinationDir
    );
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

  const sourceDirPathExists = fs.existsSync(pathToSourceDir);
  if (!sourceDirPathExists) {
    console.error('Source directory path does not exist!');
    process.exit(1);
  }

  const destinationDirPathExists = fs.existsSync(pathToDestinationDir);
  // Create destination dir if it does not exist
  if (!destinationDirPathExists) {
    try {
      fs.mkdirSync(pathToDestinationDir, { recursive: true });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  // Array of input file names
  const inputFiles = fs.readdirSync(pathToSourceDir);
  // Run in parallel 
  Promise.all(
    generator(inputFiles, pathToSourceDir, pathToDestinationDir)
  ).then(result => console.log(`Total number of processed files: ${result.length}`));
})();