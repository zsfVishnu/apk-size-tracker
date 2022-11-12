import { getInput, setOutput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import { execSync } from 'child_process';
import { Octokit } from "octokit";

const core = require('@actions/core');
const github = require('@actions/github');
const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
// const octokit = github.getOctokit(GITHUB_TOKEN);
// const octokit = new Octokit({ auth: GITHUB_TOKEN });


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

    const owner = context.repo.owner
    const repo = context.repo.repo

    console.log("Owner")
    console.log(owner)
    console.log("Repo")
    console.log(repo)

    const octokit = new Octokit({
        auth: GITHUB_TOKEN
    })

    console.log(await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}', {
        owner: owner,
        repo: repo,
        artifact_id: '428930352',
        archive_format: 'zip'
    }))

    console.log('before exec')
    console.log(execSync(
        'ls',
        { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
    ).toString());
    console.log('after exec')
    // const p = bufferFromBufferString(execSync('ls').toString())
    // console.log(execSync('ls && pwd'))
    // console.log(p)



    // const az = execSync(' curl -L \
    // -H "Accept: application/vnd.github+json" \
    // -H "Authorization: Bearer $GITHUB_TOKEN" \
    // https://api.github.com/repos/$owner/$repo/actions/artifacts')

    // console.log(az)
    // console.log(execSync(' curl -L \
    // -H "Accept: application/vnd.github+json" \
    // -H "Authorization: Bearer $GITHUB_TOKEN" \
    // https://api.github.com/repos/$owner/$repo/actions/artifacts/428930352/zip '))

    // console.log(execSync('ls && pwd'))
    // console.log(execSync('unzip b.zip && ls'))
    // console.log(execSync(' cat *.txt'))

    console.log("%%%%%%%%%%%%%%%%%%%%%%")

} catch (error) {
    setFailed(error.message);
}



function bufferFromBufferString(bufferStr) {
    return Buffer.from(
        bufferStr
            .replace(/[<>]/g, '') // remove < > symbols from str
            .split(' ') // create an array splitting it by space
            .slice(1) // remove Buffer word from an array
            .reduce((acc, val) =>
                acc.concat(parseInt(val, 16)), [])  // convert all strings of numbers to hex numbers
    )
}