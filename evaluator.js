import { execSync } from 'child_process';

function evaluateDiff(payload, currentSize) {
    const masterSize = payload.masterSize
    const diff = masterSize - currentSize
    return diff
}


export function getFeatureBranchSize() {
    execSync('./gradlew assemble', { encoding: 'utf-8' });
    execSync('cd app/build/outputs/apk/debug && du -k app-debug.apk', { encoding: 'utf-8' });
    const apkSize = execSync('cd app/build/outputs/apk/debug && du -sh app-debug.apk', { encoding: 'utf-8' }).trim().split(/\s+/)[0];
    return apkSize
}

export function getDeltaPayload(masterSize, featSize) {
    const delta = masterSize - featSize
    const del = delta > 0 ? "Increase" : "Decrease"
    const payload = `master branch size : ${masterSize} \n
                    feature branch size : ${featSize} \n
                    ${del} in size      : ${delta} KB
                    ${del} in size      : ${delta/1024} MB`

    return payload
}