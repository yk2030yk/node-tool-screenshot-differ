require('date-utils');
const fs = require('fs');
const url = require('url');
const compareImages = require("resemblejs/compareImages");

/* 実行時間 */
const nowtime        = (new Date()).toFormat("YYYYMMDDHH24MISS");
/* スクリーンショットディレクトリ */
const screenshotsDir = 'screenshots';
/* レポートの出力先 */
const outputDir      = `output/report_${nowtime}`;
/* 差分画像出力先 */
const outputDiffDir  = `${outputDir}/diff`;
/* レポートファイル名 */
const reportFile     = `${outputDir}/report.txt`;
/* レポート項目 */
const reportItem = [
    "比較ファイル1",
    "比較ファイル2",
    "比較結果",
    "不一致率(%)",
    "差分画像ファイル"
];
/* 差分ファイル名用ユニークindex
    TODO:あとでいい感じにする */
let index = 0;

/* 画像の比較 */
async function compareDiff(filePath1, filePath2) {
    const data = await compareImages(
        fs.readFileSync(filePath1), 
        fs.readFileSync(filePath2),
        {
            output: {
                errorColor: { red: 255, green: 255, blue: 0 },
                errorType: "movement",
                transparency: 0.2,
                largeImageThreshold: 1200,
                useCrossOrigin: false,
                outputDiff: true
            },
            scaleToSameSize: true,
            ignore: "antialiasing"
        }
    );
    return data;
}

/* レポートの書き出し */
async function createReport(data, filePath1, filePath2) {
    let report = [];
    report[0] = filePath1;
    report[1] = filePath2;
    report[2] = 0;
    report[3] = 0;
    report[4] = '';

    if (data.misMatchPercentage > 0) {
        report[2] = 1;
        report[3] = data.misMatchPercentage;
        report[4] = `${outputDiffDir}/${index++}.png`;
        fs.writeFileSync(report[4], data.getBuffer());
    }
    fs.appendFileSync(reportFile, report.join("\t") + "\n");
}

/* チェック処理
    TODO:forEachの中でawait使えない問題 */
async function check(filePath1, filePath2) {
    const data = await compareDiff(filePath1, filePath2);
    createReport(data, filePath1, filePath2);
}

/* ディレクトリなどの準備 */
function prepare() {
    fs.mkdirSync(outputDir);
    fs.mkdirSync(outputDiffDir);
    fs.writeFileSync(reportFile, "");
    fs.appendFileSync(reportFile, reportItem.join("\t") + "\n");
}

/* メイン処理 */
function main() {
    if (process.argv.length < 4) {
        console.log("引数を2つ指定してください。");
        process.exit();
    }

    const dir1 = `${screenshotsDir}/${process.argv[2]}`;
    const dir2 = `${screenshotsDir}/${process.argv[3]}`;
    if (!fs.existsSync(dir1)) {
        console.log(`指定ディレクトリが存在しません。${dir1}`);
        process.exit();
    }
    if (!fs.existsSync(dir2)) {
        console.log(`指定ディレクトリが存在しません。${dir2}`);
        process.exit();
    }

    const fileList = fs.readdirSync(dir1);
    if (fileList.length == 0) {
        console.log(`ディレクトリにデータが存在しません ${dir1}`);
    }

    prepare();
    fileList.forEach((fileName) => {
        check(`${dir1}/${fileName}`, `${dir2}/${fileName}`);
    });
    console.log(`チェックが完了しました！ => ${outputDir}`);
};

main();