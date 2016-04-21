'use strict';
const Git = require('./git');
const ReadRole = require('./roleReader');

const repo = 'git@github.com:STEAMULO/ansible-role-mysql.git';
const workingDir = './roles';

const checkoutAndReadTag = function (repoName, tag) {

    return Git.checkout(repoName, tag)
        .then(() => ReadRole.readRole(workingDir + '/' + Git.getRepoName(repoName)));
};

const readAllTaggedRoles = function (repoName, tagList) {

    const result = {};
    return new Promise((resolve, reject) => {

        let promise = Promise.resolve();
        tagList.forEach((tag) => {

            promise = promise.then(() => checkoutAndReadTag(repoName, tag))
                .then((role) => {

                    result[tag] = role;
                });
        });
        promise.then(() => resolve(result))
            .catch((err) => reject(err));
    });
};

Git.clone(repo)
    .then(Git.listTags)
    .then((tags) => readAllTaggedRoles(Git.getRepoName(repo), tags))
    .then((done) => console.log(JSON.stringify(done)));

