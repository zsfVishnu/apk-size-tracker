import { getInput, setOutput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import { execSync } from 'child_process';
import { Octokit } from "octokit";
import axios from 'axios'
import AdmZip from 'adm-zip'


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

    // console.log("Owner")
    // console.log(owner)
    // console.log("Repo")
    // console.log(repo)


    // // console.log('before exec')
    // execSync(' curl -L \
    // -H "Accept: application/vnd.github+json" \
    // -H "Authorization: Bearer $GITHUB_TOKEN" \
    // https://api.github.com/repos/$owner/$repo/actions/artifacts/428930352/zip -o a.zip', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 })



    // console.log(execSync(
    //     'ls',
    //     { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
    // ).toString());
    // console.log('after exec')


    // console.log(execSync('unzip a.zip', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }))
    // // execSync('ditto -x -k a.zip ./')

    // const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));

    // const stats = loadJSON('sizeArtifact.json');

    // console.log(stats)

    // console.log("%%%%%%%%%%%%%%%%%%%%%%")




    async function makeRequest() {

        const config = {
            method: 'GET',
            url: 'https://api.github.com/repos/zsfVishnu/ModernApp/actions/artifacts',
            headers: {
                'accept': 'application/vnd.github+json',
                'authorization': 'Bearer ' + GITHUB_TOKEN
            }
        }

        let res = await axios(config)

        console.log("%%%%%%%%%%%%%%%%%%%%%% first request")
        // console.log(res.request._header);
        console.log(res.data.artifacts)
        // console.log(res.data.artifacts.length)
        const red_url = res.data.artifacts[0].archive_download_url

        const config2 = {
            method: 'GET',
            url: red_url,
            headers: {
                'accept': 'application/vnd.github+json',
                'authorization': 'Bearer ' + GITHUB_TOKEN
            },
            responseType: "arraybuffer"
        }

        let res2 = await axios(config2)
        // console.log(res2.request._header);
        // console.log(res2)
        // console.log(res2.data)



        var zip = new AdmZip(res2.data);
        var zipEntries = zip.getEntries();

        console.log(zip)
        console.log("***")
        console.log(zip.getEntries()[0])
        console.log("***")
        console.log(zip.getEntries().length)
        console.log(zip.readAsText(zipEntries[0]))

        // search for "index.html" which should be there
        for (var i = 0; i < zipEntries.length; i++) {
            console.log(zip.readAsText(zipEntries[i]));
        }

        const p = JSON.parse(zip.readAsText(zipEntries[0])).master_size

        console.log("Size of master : " + p)
        return p;

    }

    async function postComment(p) {
        const config = {
            method: 'POST',
            url: 'https://api.github.com/repos/zsfVishnu/ModernApp/issues/1/comments',
            headers: {
                'accept': 'application/vnd.github+json',
                'authorization': 'Bearer ' + GITHUB_TOKEN
            },
            data: { "body": " size of master branch : " + p }
        }
    }


    const feat_s = await makeRequest();
    postComment(feat_s);



} catch (error) {
    setFailed(error.message);
}

