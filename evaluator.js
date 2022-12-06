import { context } from "@actions/github";
import { execSync } from "child_process";
import { fileDiff, getApkName, getPascalCase } from "./utils";

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
  console.log(
    execSync(`cd android && ./gradlew assemble${flavorToBuild}`, {
      encoding: "utf-8",
    })
  );

  const sizeOp = execSync(`cd android/${buildPath} && du -k ${apkName}`, {
    encoding: "utf-8",
  });

  console.log(sizeOp);

  const apkSize =
    typeof sizeOp === `string` ? sizeOp.trim().split(/\s+/)[0] : 0;

  return apkSize;
}

function getNativeFeatureBranchSize(apkName, flavorToBuild, buildPath) {
  execSync(`./gradlew assemble${flavorToBuild}`, { encoding: "utf-8" });
  const sizeOp = execSync(`cd ${buildPath} && du -k ${apkName}`, {
    encoding: "utf-8",
  });
  const apkSize =
    typeof sizeOp === `string` ? sizeOp.trim().split(/\s+/)[0] : 0;
  return apkSize;
}

export function getDeltaPayload(masterSize, featSize, context) {
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

  return getFileDiff(payload, context);
}

function getFileDiff(payload, context) {
  const gOut = fileDiff(context).split(/\s+/);

  let temp =
    "\n \n  Filewise diff \n | Info  | Value | \n | ------------- | ------------- |";
  for (let i = 0; i < gOut.length - 1; i += 2) {
    temp += `\n | ${gOut[i + 1]} (in KB) | ${(gOut[i] / 1024).toFixed(2)} |`;
  }
  return payload.toString() + temp.toString();
}
