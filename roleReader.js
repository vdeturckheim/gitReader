'use strict';
const Yaml = require('js-yaml');
const Fs   = require('fs');

// Get document, or throw exception on error

const readYAML = function (path, encoding) {

    encoding = encoding || 'utf8';

    return new Promise((resolve, reject) => {

        try {
            const raw = Fs.readFileSync(path, encoding);
            const doc = Yaml.safeLoad(raw);
            return resolve(doc);
        }
        catch (err) {
            return reject(err);
        }
    });
};

const isYAML = function (name) {

    return name.split('.').pop() === 'yml';
};

const readYAMLDir = function (dir) {

    return new Promise((resolve, reject) => {

        Fs.readdir(dir, (err, items) => {

            if (err) {
                return reject(err);
            }

            const toRead = items.filter((item) => isYAML(item));
            const ReadAllPromise = toRead.map((file) => readYAML(dir + '/' + file));
            Promise.all(ReadAllPromise)
                .then((documents) => {

                    const result = {};
                    toRead.forEach((fileName, index) => {

                        result[fileName] = documents[index];
                    });
                    return result;
                })
                .then((result) => resolve(result))
                .catch((err) => reject(err));
        });
    });
};

const readFile = function (path, encoding) {

    encoding = encoding || 'utf8';
    return new Promise((resolve, reject) => {

        Fs.readFile(path, encoding, (err, file) => {

            if (err) {
                return reject(err);
            }
            return resolve(file);
        });
    });
};

const readDir = function (path) {

    return new Promise((resolve, reject) => {

        Fs.readdir(path, (err, files) => {

            if (err) {
                return reject(err);
            }
            return resolve(files);
        });
    });
};

const readTemplates = function (templateRoot) {

    let fileList = [];
    return readDir(templateRoot)
        .then((files) => {

            fileList = files;
            const readAll = files.map((file) => readFile(templateRoot + '/' + file));
            return Promise.all(readAll);
        })
        .then((allRead) => {

            const result = {};
            fileList.forEach((fileName, index) => {

                result[fileName] = allRead[index];
            });
            return result;
        });
};

module.exports.readRole = function (path) {

    const expectedDirectories = ['defaults', 'handlers', 'meta', 'tasks', 'vars']; // TODO: be more flexible
    const paths = expectedDirectories.map((dir) => path + '/' + dir);
    const readPaths = paths.map((pathToRead) => readYAMLDir(pathToRead));
    return Promise.all(readPaths)
        .then((allRead) => {

            const result = {};
            expectedDirectories.forEach((dirName, index) => {

                result[dirName] = allRead[index];
            });
            return result;
        })
        .then((result) => Promise.all([result, readFile(path + '/' + 'README.md')]))
        .then((withReadme) => Object.assign(withReadme[0], { README: withReadme[1] }))
        .then((result) => Promise.all([result, readTemplates(path + '/' + 'templates')]))
        .then((withtemplates) => Object.assign(withtemplates[0], { templates: withtemplates[1] }));
};


