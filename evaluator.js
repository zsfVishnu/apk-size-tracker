import { context } from "@actions/github";
import { execSync } from "child_process";
import { fileDiff } from "./utils";

function evaluateDiff(payload, currentSize) {
  const masterSize = payload.masterSize;
  const diff = masterSize - currentSize;
  return diff;
}

export function getFeatureBranchSize(flavorToBuild, buildPath) {
  const apkSuffix = flavorToBuild.toLowerCase();
  execSync(`./gradlew assemble${flavorToBuild}`, { encoding: "utf-8" }); //handle flavor casing
  const apkSize = execSync(`cd ${buildPath} && du -k app-${apkSuffix}.apk`, {
    encoding: "utf-8",
  })
    .trim()
    .split(/\s+/)[0];
  return apkSize;
}

export function getDeltaPayload(masterSize, featSize) {
  const delta = masterSize - featSize;
  const del = delta < 0 ? "Increase" : "Decrease";
  let payload = `

   | Info  | Value | \n | ------------- | ------------- | \n | Master branch size (in MB) | ${
     masterSize / 1024
   }  | \n | Feature branch size (in MB)  | ${
    featSize / 1024
  } | \n| ${del} in size  (in KB)  | ${Math.abs(
    delta
  )} | \n | ${del} in size  (in MB)  | ${Math.abs(delta) / 1024} | `;

  return getFileDiff(payload);
}

function getFileDiff(payload) {
  console.log("current branch : " + context.ref);
  console.log(context.payload.pull_request.head.ref);
  const gOut = fileDiff(context.ref).split(/\s+/);

  let temp = "";
  for (let i = 0; i < gOut.length / 2; i += 2) {
    temp += `\n | ${gOut[i + 1]} (in KB) | ${gOut[i]} |`;
  }
  return payload.toString() + temp.toString();
}
