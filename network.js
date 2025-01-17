import axios from "axios";
import AdmZip from "adm-zip";
import { context } from "@actions/github";
import { noArtifactFoundError } from "./error";

export async function getMasterSizeFromArtifact(GITHUB_TOKEN, metricType) {
  const artifacts = await fetchArtifacts(GITHUB_TOKEN);

  if (!artifacts.length) {
    noArtifactFoundError();
  }

  for (const artifact of artifacts) {
    if (artifact.name === "metric-artifact-new") {
      const artifactSize = await extractArtifactSize(artifact.archive_download_url, GITHUB_TOKEN, metricType);
      if (artifactSize !== null) {
        return artifactSize;
      }
    }
  }

  noArtifactFoundError();
}

async function fetchArtifacts(GITHUB_TOKEN) {
  const config = {
    method: "GET",
    url: `https://api.github.com/repos/${context.repo.owner}/${context.repo.repo}/actions/artifacts?name=metric-artifact-new`,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${GITHUB_TOKEN}`,
    },
  };

  const response = await axios(config);
  console.log("Artifacts size:", response.data.artifacts.length);
  return response.data.artifacts;
}

async function extractArtifactSize(downloadUrl, GITHUB_TOKEN, metricType) {
  const zipData = await downloadArtifact(downloadUrl, GITHUB_TOKEN);
  const zip = new AdmZip(zipData);

  for (const zipEntry of zip.getEntries()) {
    console.log("Zip entry name:", zipEntry.entryName);
    if (zipEntry.entryName === "metric.json") {
      const metrics = JSON.parse(zip.readAsText(zipEntry));
      const sizeKey = metricType === "apk" ? "apk_size" : "bundle_size";
      console.log(`${metricType.toUpperCase()} SIZE:`, metrics[sizeKey]);
      return metrics[sizeKey] || null;
    }
  }

  return null;
}

async function downloadArtifact(downloadUrl, GITHUB_TOKEN) {
  const config = {
    method: "GET",
    url: downloadUrl,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${GITHUB_TOKEN}`,
    },
    responseType: "arraybuffer",
  };

  const response = await axios(config);
  return response.data;
}

export async function postComment(deltaPayload, GITHUB_TOKEN) {
  const config = {
    method: "POST",
    url: `https://api.github.com/repos/${context.repo.owner}/${context.repo.repo}/issues/${context.payload.number}/comments`,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${GITHUB_TOKEN}`,
    },
    data: { body: deltaPayload },
  };

  await axios(config);
}
