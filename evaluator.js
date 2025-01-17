import { execSync } from 'child_process';
import { getApkName, getPascalCase } from './utils';
import fs from 'fs';
import path from 'path';

// Calculates the difference between master and current branch size
function evaluateDiff(payload, currentSize) {
  return payload.masterSize - currentSize;
}

// Gets the feature branch APK size
export function getFeatureBranchSize(dir, fb, buildPath, isRN, streamOutputMaxBuffer) {
  const apkName = getApkName(fb);
  const flavorToBuild = getPascalCase(fb);

  return isRN === 'true'
      ? getRNFeatureBranchSize(dir, apkName, flavorToBuild, buildPath, streamOutputMaxBuffer)
      : getNativeFeatureBranchSize(dir, apkName, flavorToBuild, buildPath, streamOutputMaxBuffer);
}

// Handles React Native feature branch APK size
function getRNFeatureBranchSize(dir, apkName, flavorToBuild, buildPath, streamOutputMaxBuffer) {
  console.log(`Building React Native APK: ${apkName}, Flavor: ${flavorToBuild}`);

  execSync(`cd android && ./gradlew assemble${flavorToBuild}`, {
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * streamOutputMaxBuffer,
  });

  return getApkSize(dir, buildPath, apkName);
}

// Handles Native feature branch APK size
function getNativeFeatureBranchSize(dir, apkName, flavorToBuild, buildPath, streamOutputMaxBuffer) {
  console.log(`Building Native APK: ${apkName}, Flavor: ${flavorToBuild}`);

  execSync(`./gradlew assemble${flavorToBuild}`, {
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * streamOutputMaxBuffer,
  });

  return getApkSize(dir, buildPath, apkName);
}

// Retrieves APK size from path
function getApkSize(dir, buildPath, apkName) {
  const apkPath = path.join(dir, buildPath, apkName);
  const stats = fs.statSync(apkPath);
  const apkSize = stats.size / 1024; // Convert bytes to KB
  console.log(`APK Size: ${apkSize} KB`);
  return apkSize;
}

// Gets the size of the bundled feature
export function getBundleFeatureSize(bundleCommand, bundlePath, streamOutputMaxBuffer) {
  console.log('Generating feature bundle...');

  execSync(bundleCommand, {
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * streamOutputMaxBuffer,
  });

  const bundleName = 'index.android.bundle';
  const bp = path.join(bundlePath, bundleName);
  const stats = fs.statSync(bp);
  const bundleSize = stats.size / 1024; // Convert bytes to KB
  console.log(`Bundle Size: ${bundleSize} KB`);
  return bundleSize;
}

// Generates the delta payload for size comparison
export function getDeltaPayload(masterSize, featSize) {
  const delta = (masterSize - featSize).toFixed(2);
  const changeType = delta < 0 ? 'Increase' : 'Decrease';
  const symbol = delta < 0 ? '&#x1F53A;' : '&#10055;';

  return `
| Info                  | Value           |
|-----------------------|-----------------|
| Master branch size    | ${(masterSize / 1024).toFixed(2)} MB |
| Feature branch size   | ${(featSize / 1024).toFixed(2)} MB  |
| ${changeType} in size | ${Math.abs(delta)} KB ${symbol} |
| ${changeType} in size | ${(Math.abs(delta) / 1024).toFixed(2)} MB ${symbol} |`;
}