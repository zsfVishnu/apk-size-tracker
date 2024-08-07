import { context } from "@actions/github";
import { execSync } from "child_process";
import {fileDiff, getApkName, getPascalCase} from "./utils";
import fs from 'fs'
import path from 'path'

function evaluateDiff(payload, currentSize) {
  const masterSize = payload.masterSize;
  const diff = masterSize - currentSize;
  return diff;
}

export function getFeatureBranchSize(fb, buildPath, isRN) {
  const apkName = getApkName(fb);
  const flavorToBuild = getPascalCase(fb);

  return isRN === "true"
    ? getRNFeatureBranchSize(apkName, flavorToBuild, buildPath)
    : getNativeFeatureBranchSize(apkName, flavorToBuild, buildPath);
}

function getRNFeatureBranchSize(apkName, flavorToBuild, buildPath) {
  console.log(`apkname :: ${apkName}`)
  console.log(`flavourToBuild :: ${flavorToBuild}`)
  console.log(`buildPath :: ${buildPath}`)

  console.log(
    execSync(`cd android && ./gradlew assemble${flavorToBuild}`, {
      encoding: "utf-8",
    })
  );

  const apkPath = path.join(process.cwd(),buildPath, apkName)
  const stats = fs.statSync(apkPath)
  const apkSize = stats.size / 1024
  console.log(apkSize);
  return apkSize
}

function getNativeFeatureBranchSize(apkName, flavorToBuild, buildPath) {
  console.log(`apkname :: ${apkName}`)
  console.log(`flavourToBuild :: ${flavorToBuild}`)
  console.log(`buildPath :: ${buildPath}`)

  execSync(`./gradlew assemble${flavorToBuild}`, { encoding: "utf-8" });
  const apkPath = path.join(process.cwd(),buildPath, apkName)
  console.log(`apkPath :: ${apkPath}`)
  const stats = fs.statSync(apkPath)
  const apkSize = stats.size / 1024
  console.log(apkSize);
  return apkSize
}

export function getBundleFeatureSize(bundleCommand, bundlePath) {
  console.log("inside get bundle size method")
  const bundleName = "index.android.bundle"
  console.log(
      execSync(`${bundleCommand}`, {
        encoding: "utf-8",
      })
  );

  const bp = path.join(bundlePath, bundleName)
  const stats = fs.statSync(bp)
  const bundleSize = stats.size / 1024
  console.log(bundleSize);
  return bundleSize
}

export function getDeltaPayload(masterSize, featSize, context) {
  const delta = (masterSize - featSize).toFixed(2);
  const del = delta < 0 ? "Increase" : "Decrease";
  const sym = delta < 0 ? "&#x1F53A;" : "&#10055;";
  let payload = `

   | Info  | Value | \n | ------------- | ------------- | \n | Master branch size | ${(
     masterSize / 1024
   ).toFixed(2)} MB  | \n | Feature branch size  | ${(featSize / 1024).toFixed(
    2
  )} MB | \n| ${del} in size  | ${Math.abs(
    delta
  )} KB ${sym}| \n | ${del} in size  | ${(Math.abs(delta) / 1024).toFixed(
    2
  )} MB ${sym}| `;

  // return getFileDiff(payload, context); // Not calculating filewise diff
  return payload.toString();
}

function getFileDiff(payload, context) {
  const gOut = fileDiff(context).split(/\s+/);

  let temp =
    "\n \n  Filewise diff \n | Info  | Value | \n | ------------- | ------------- |";
  for (let i = 0; i < gOut.length - 1; i += 2) {
    temp += `\n | ${gOut[i + 1]} | ${formatSize(gOut[i])} |`;
  }
  return payload.toString() + temp.toString();
}

function formatSize(n) {
  if (n < 1024) {
    return Number(n).toFixed(2) + ` B`;
  } else if ((Number(n) / 1024).toFixed(2) < 1024) {
    return (Number(n) / 1024).toFixed(2) + ` KB`;
  } else {
    return (Number(n) / (1024 * 1024)).toFixed(2) + ` MB`;
  }
}
