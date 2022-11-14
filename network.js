import { Octokit } from "octokit";
import axios from 'axios'
import AdmZip from 'adm-zip'
import { context } from '@actions/github';

export async function getMasterSizeFromArtifact(GITHUB_TOKEN) {

    const owner = context.repo.owner
    const repo = context.repo.repo

    const config = {
        method: 'GET',
        url: `https://api.github.com/repos/${owner}/${repo}/actions/artifacts`,
        headers: {
            'accept': 'application/vnd.github+json',
            'authorization': 'Bearer ' + GITHUB_TOKEN
        }
    }

    let res = await axios(config)
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
    var zip = new AdmZip(res2.data);
    var zipEntries = zip.getEntries();
    for (var i = 0; i < zipEntries.length; i++) {
        console.log(zip.readAsText(zipEntries[i]));
    }
    return JSON.parse(zip.readAsText(zipEntries[0])).master_size
}


export async function postComment(featSize, masterSize, GITHUB_TOKEN) {
    const owner = context.repo.owner
    const repo = context.repo.repo
    const config = {
        method: 'POST',
        url: `https://api.github.com/repos/${owner}/${repo}/issues/1/comments`,
        headers: {
            'accept': 'application/vnd.github+json',
            'authorization': 'Bearer ' + GITHUB_TOKEN
        },
        data: { "body": " size of feature branch : " + featSize + "\n size of master branch : " + masterSize + "\n diff in size : " + (featSize - masterSize) }
    }
    axios(config)
}