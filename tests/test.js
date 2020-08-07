require('date-utils');
const fs = require('fs');
const url = require('url');

module.exports = {
    '@tags': ['screenshots'],
    // スクリーンショットテストケース
    'screenshots' : async function (browser) {
        // 出力先ディレクトリ
        const time      = (new Date()).toFormat("YYYYMMDDHH24MISS");
        const outputDir = `screenshots/test_${time}`;

        // URL一覧取得
        const data = fs.readFileSync('urls.txt', "utf8");
        const urls = data.split("\n").filter((item) => {
            return url.parse(item).protocol; // URLチェック(プロトコルがあるのものだけ)
        });

        if (urls.length == 0) process.exit();

        // スクリーンショットの出力
        fs.mkdirSync(outputDir);
        urls.forEach(function(targetUrl, index) {
            browser
            .url(targetUrl)
            .saveScreenshot(`${outputDir}/fileName${index}.png`);
        });
        browser.end();
    }
};