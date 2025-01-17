import {apkNameError, buildPathError, noFlavorFoundError, thresholdExceededError} from "./error";
import { postComment } from "./network";

export function getPascalCase(s) {
  s = s.trim();
  if (s.toLowerCase() === "debug") {
    return "Debug";
  }

  if (s.includes("Debug")) {
    return capitalizeFlavor(s, "Debug");
  }
  noFlavorFoundError();
}

export function getBuildPath(s) {
  const outputPath = "app/build/outputs/apk/";
  s = s.trim();
  if (s.toLowerCase() === "debug") {
    return `${outputPath}debug/`;
  }

  if (s.includes("Debug")) {
    return `${outputPath}${extractFlavor(s, "Debug")}/debug/`;
  }

  if (s.toLowerCase() === "release") {
    return `${outputPath}release/`;
  }

  if (s.includes("Release")) {
    return `${outputPath}${extractFlavor(s, "Release")}/release/`;
  }

  buildPathError();
}

export function getBundlePath() {
  return "android/infra/react/src/main/assets/";
}

export function getApkName(s) {
  s = s.trim();
  if (s.toLowerCase() === "debug") {
    return "app-debug.apk";
  }

  if (s.includes("Debug")) {
    return `app-${extractFlavor(s, "Debug")}-debug.apk`;
  }

  apkNameError();
}

export async function handleThreshold(masterSize, featSize, threshold, GITHUB_TOKEN) {
  const diff = calculateSizeDifference(masterSize, featSize);
  if (diff > threshold) {
    const payload = createThresholdPayload(threshold, diff);
    await postComment(payload, GITHUB_TOKEN);
    console.log(payload);
    thresholdExceededError();
  }
}

function capitalizeFlavor(s, keyword) {
  const flavor = s.split(keyword)[0];
  return flavor.charAt(0).toUpperCase() + flavor.slice(1) + keyword;
}

function extractFlavor(s, keyword) {
  return s.split(keyword)[0];
}

function calculateSizeDifference(masterSize, featSize) {
  return (featSize - masterSize) / 1024;
}

function createThresholdPayload(threshold, diff) {
  return `WORKFLOW FAILED DUE TO EXCEEDING THRESHOLD!!! \n \n \n 

| Threshold  | Actual Delta | \n| ------------- | ------------- | \n| ${threshold} MB | ${diff} MB |`;
}
