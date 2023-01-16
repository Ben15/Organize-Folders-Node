const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const options = yargs
  .usage('Usage: -p <path> -a <action>')
  .option('p', { alias: 'path', describe: 'Path to the directory', type: 'string', demandOption: true })
  .option('a', { alias: 'action', describe: 'Action to perform (organize or flatten)', type: 'string', demandOption: true })
  .help()
  .argv;

  function flattenDirectory(directory) {
    // Get a list of all files and directories in the specified directory
    fs.readdir(directory, (err, items) => {
        if (err) {
            console.error(err);
            return;
        }

        items.forEach(item => {
            const itemPath = path.join(directory, item);
            // Check if the item is a directory
            if (fs.lstatSync(itemPath).isDirectory()) {
                // If it's a directory, recursively flatten its contents
                flattenDirectory(itemPath);
                // Get all files in the directory
                const files = fs.readdirSync(itemPath).filter(file => !fs.lstatSync(path.join(itemPath, file)).isDirectory());
                // Move all files to the parent directory
                files.forEach(file => {
                    fs.renameSync(path.join(itemPath, file), path.join(directory, file));
                });
                // remove the empty directory
                fs.rmdirSync(itemPath);
            }
        });
    });
}

  function organizeDirectory(directory) {
    // Get a list of all files in the directory
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }

        files.forEach(file => {
            // Get the file extension
            const fileExt = path.extname(file);         
            // Create a new directory for the file extension if it doesn't already exist
            let newDir;
            if(fileExt === '.mp4' || fileExt === '.mkv' || fileExt === '.avi' || fileExt === '.mov'){
                newDir = path.join(directory, 'Video');
            }else if(fileExt === '.mp3' || fileExt === '.ogg' || fileExt === '.flac'){
                newDir = path.join(directory, 'Audio');
            }else if(fileExt === '.jpg' || fileExt === '.jpeg' || fileExt === '.png'  || fileExt === '.PNG' || fileExt === '.webp'){
                newDir = path.join(directory, 'Images');
            }else {
                newDir = path.join(directory, fileExt.substring(1));
            }

            if (!fs.existsSync(newDir)) {
                fs.mkdirSync(newDir);
            }

            // Move the file to the new directory
            const oldPath = path.join(directory, file);
            const newPath = path.join(newDir, file);
            fs.rename(oldPath, newPath, err => {
                if (err) {
                    console.error(err);
                }
            });
        });
    });
}


if(options.action === 'organize') {
    organizeDirectory(options.path);
    } else if(options.action === 'flatten') {
    flattenDirectory(options.path);
    } else {
    console.log("Invalid action provided. Please use 'organize' or 'flatten'");
    }