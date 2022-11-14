import { execSync } from 'child_process';

function evaluateDiff(payload, currentSize) {
    const masterSize = payload.masterSize
    const diff = masterSize - currentSize
    return diff
}


export function getFeatureBranchSize() {
    execSync('./gradlew assemble', { encoding: 'utf-8' });
    execSync('cd app/build/outputs/apk/debug && du -sh app-debug.apk', { encoding: 'utf-8' });
    const apkSize = execSync('cd app/build/outputs/apk/debug && du -sh app-debug.apk', { encoding: 'utf-8' }).trim().split(/\s+/)[0];
    return apkSize
}