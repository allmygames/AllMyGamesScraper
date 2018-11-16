const puppeteer = require('puppeteer');
import XboxScraper from "./xbox/XboxScraper";

var config = require('config');

console.log("Starting...");

if (process.argv.length <= 2) {
    console.log("Provide a Gamertag as a parameter.");
}
else {
    var gamertag = process.argv[2];

    (async () => {
        let scraper = new XboxScraper(config.get('MSA.username'), config.get('MSA.password'));
    
        console.log("Launching...");
        console.log(puppeteer);
        const browser = await puppeteer.launch();
        console.log("Launched");

        await scraper.ScrapeXboxGames(gamertag);

        console.log("Done");

        process.exit();
    })();
}