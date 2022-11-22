import { execSync } from "child_process";

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
  const del = delta > 0 ? "Increase" : "Decrease";
  const payload = `master branch size (in MB) : ${masterSize / 1024} \n
                    feature branch size (in MB) : ${featSize / 1024} \n
                    ${del} in size      : ${delta} KB
                    ${del} in size      : ${delta / 1024} MB`;

  return payload;
}
