import axios from "axios";
import AdmZip from "adm-zip";
import { context } from "@actions/github";
import { noArtifactFoundError } from "./error";

export async function getMasterSizeFromArtifact(GITHUB_TOKEN, metricType) {
  console.log("Metric type ::", metricType)
  const config = {
    method: "GET",
    url: `https://api.github.com/repos/${context.repo.owner}/${context.repo.repo}/actions/artifacts?name=metric-artifact-new`,
    headers: {
      accept: "application/vnd.github+json",
      authorization: "Bearer " + GITHUB_TOKEN,
    },
  };

  const artifacts = await (await axios(config)).data.artifacts;
  console.log('Artifacts size ::', artifacts.length)
  if (artifacts.length === 0) {
    noArtifactFoundError();
  } else {
    for (let i = 0; i < artifacts.length; i++) {
      const red_url = artifacts[i].archive_download_url;
      console.log("Artifact name :: ", artifacts[i].name)
      if (artifacts[i].name === 'metric-artifact-new') {
        console.log('Inside if condition')
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
          console.log('Zip entry name ::', zipEntries[i].entryName)
          if (metricType === 'apk' && zipEntries[i].entryName === `metric.json`) {
            console.log('APK SIZE ::', JSON.parse(zip.readAsText(zipEntries[i]))[`apk_size`])
            return JSON.parse(zip.readAsText(zipEntries[i]))[`apk_size`];
          }
          if (metricType === 'bundle' && zipEntries[i].entryName === `metric.json`) {
            console.log('BUNDLE SIZE ::', JSON.parse(zip.readAsText(zipEntries[i]))[`bundle_size`])
            return JSON.parse(zip.readAsText(zipEntries[i]))[`bundle_size`];
          }
        }
      }
    }
    noArtifactFoundError();
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
