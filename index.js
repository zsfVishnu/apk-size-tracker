import { getInput, setOutput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import { execSync } from 'child_process';
import { Octokit } from "octokit";

const core = require('@actions/core');
const github = require('@actions/github');
const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
// const octokit = github.getOctokit(GITHUB_TOKEN);
const octokit = new Octokit({ auth: GITHUB_TOKEN });


try {
    const flavorToBuild = getInput('flavor');
    console.log(`Building flavor:  ${flavorToBuild}!`);
    const time = (new Date()).toTimeString();
    setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(context.payload, undefined, 2)
    // console.log(`The event payload: ${payload}`);
    console.log("APK size")
    console.log("%%%%%%%%%%%%%%%%%%%%%%")
    // execSync('pwd && ls && ./gradlew assemble', { encoding: 'utf-8' });
    // console.log(execSync('cd app/build/outputs/apk/debug && du -sh app-debug.apk', { encoding: 'utf-8' }));
    // console.log(execSync('cd app/build/outputs/apk/debug && du -sh app-debug.apk', { encoding: 'utf-8' }));

    const owner = context.owner
    const repo = context.repo

    console.log("Owner")
    console.log(owner)
    console.log("Repo")
    console.log(repo)

    execSync(' curl -L \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    https://api.github.com/repos/zsfVishnu/ModernApp/actions/artifacts/428930352/zip -o b.zip')

    console.log("%%%%%%%%%%%%%%%%%%%%%%")

} catch (error) {
    setFailed(error.message);
}



async function run() {
    console.log("inside run function")
    await octokit.rest.actions.listArtifactsForRepo({
        ...context.owner,
        ...context.repository
    });
}

console.log("&&&&&&&&&&&&&&&&&&")
run();
console.log("&&&&&&&&&&&&&&&&&&")