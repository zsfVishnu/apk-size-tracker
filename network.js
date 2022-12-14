import axios from "axios";
import AdmZip from "adm-zip";
import { context } from "@actions/github";
import { noArtifactFoundError } from "./error";

export async function getMasterSizeFromArtifact(GITHUB_TOKEN) {
  const config = {
    method: "GET",
    url: `https://api.github.com/repos/${context.repo.owner}/${context.repo.repo}/actions/artifacts`,
    headers: {
      accept: "application/vnd.github+json",
      authorization: "Bearer " + GITHUB_TOKEN,
    },
  };

  const artifacts = await (await axios(config)).data.artifacts;

  if (artifacts.length === 0) {
    noArtifactFoundError();
  } else {
    for (let i = 0; i < artifacts.length; i++) {
      const red_url = artifacts[i].archive_download_url;

      const config2 = {
        method: "GET",
        url: red_url,
        headers: {
          accept: "application/vnd.github+json",
          authorization: "Bearer " + GITHUB_TOKEN,
        },
        responseType: "arraybuffer",
      };

      let res2 = await axios(config2);
      var zip = new AdmZip(res2.data);
      var zipEntries = zip.getEntries();
      for (let i = 0; i < zipEntries.length; i++) {
        if (zipEntries[i].entryName === `apk-metric.json`) {
          return JSON.parse(zip.readAsText(zipEntries[i]))[`master_size`];
        }
      }
      noArtifactFoundError();
    }
  }
}

export async function postComment(deltaPayload, GITHUB_TOKEN) {
  const config = {
    method: "POST",
    url: `https://api.github.com/repos/${context.repo.owner}/${context.repo.repo}/issues/${context.payload.number}/comments`,
    headers: {
      accept: "application/vnd.github+json",
      authorization: "Bearer " + GITHUB_TOKEN,
    },
    data: { body: deltaPayload },
  };
  axios(config);
}
