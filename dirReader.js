'use strict';
const Recursive = require('recursive-readdir');
const Path = require('path');
const Yaml = require('js-yaml');
const Fs = require('fs');

const RecursiveAsPromised = function (base) {

    return new Promise((resolve, reject) => {

        Recursive(base, (err, items) => {

            if (err) {
                return reject(err);
            }
            return resolve(items);
        });
    });
};

const readFile = function (fullPath, encoding) {

    encoding = encoding || 'utf8';
    return new Promise((resolve, reject) => {

        Fs.readFile(fullPath, encoding, (err, raw) => {

            if (err) {
                return reject(err);
            }
            if (fullPath.endsWith('.yml')) {
                try {
                    const parsed = Yaml.safeLoad(raw);
                    return resolve(parsed);
                }
                catch (err) {
                    return reject(err);
                }
            }
            else {
                return resolve(raw);
            }
        });
    });
};

module.exports = function (base, encoding) {

    return RecursiveAsPromised(base)
        .then((items) => items.filter((item) => !item.includes('.git')))
        .then((items) => {

            const all = items.map((item) => {

                const splitted = item.split(Path.sep);
                const fileName = splitted.pop();
                const path = splitted.join(Path.sep);
                return Promise.all([path, fileName, readFile(Path.join(item), encoding)]);
            });
            return Promise.all(all);
        })
        .then((fileList) => {

            const result = {};
            fileList.forEach((file) => {

                const keyList = file[0].split(Path.sep);
                let current = result;
                for (let i = 0; i < keyList.length; ++i) {
                    current[keyList[i]] = current[keyList[i]] || {};
                    current = current[keyList[i]];
                }
                current[file[1]] = file[2] || '';

            });
            return result;
        })
        .then((result) => {

            const keysToRemove = base.split(Path.sep).filter((item) => item !== '.');
            let finalResult = result;
            keysToRemove.forEach((key) => {

                finalResult = finalResult[key];
            });
            return finalResult;
        });
};


