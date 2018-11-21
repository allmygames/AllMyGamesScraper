const express = require('express');
const puppeteer = require('puppeteer');
import XboxScraper from "./xbox/XboxScraper";
import XboxGame from "./xbox/XboxGame";
import PlayStationScraper from "./playstation/PlayStationScraper";
import PlayStationGame from "./playstation/PlayStationGame";
import { Browser } from "puppeteer";
var config = require('config');

const app = express();
const port = 3000;

const HEADLESS = false;

console.log("Configuring server...");

(async () => {
    let browser: Browser = await puppeteer.launch({ headless: HEADLESS, userDataDir: './puppeteer_user_data/' });

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });
    
    app.get('/gog/:gogid', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
    });

    app.get('/playstation/:psnid', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        
        let startTime: number = new Date().getTime();

        var psnid = req.params.psnid;
        if (!psnid) {
            let error: any = {
                message: "'psnid' route parameter is required."
            }
            res.send(JSON.stringify(error));
        }
    
        (async () => {
            let scraper = new PlayStationScraper(browser);
            let games: PlayStationGame[] = await scraper.ScrapePlayStationGames(psnid);

            let endTime: number = new Date().getTime();
            console.log("Sending response...");
            console.log(`Response time: ${endTime-startTime}ms`)
            res.send(JSON.stringify(games));
        })();
    });
    
    app.get('/steam/:steamcommunityid', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
    });

    app.get('/xbox/:gamertag', (req, res) => {
        let startTime: number = new Date().getTime();

        res.setHeader('Content-Type', 'application/json');

        var gamertag = req.params.gamertag;
        if (!gamertag) {
            let error: any = {
                message: "'gamertag' route parameter is required."
            }
            res.send(JSON.stringify(error));
        }
    
        (async () => {
            let scraper = new XboxScraper(config.get('MSA.username'), config.get('MSA.password'), browser);
            let games: XboxGame[] = await scraper.ScrapeXboxGames(gamertag);

            let endTime: number = new Date().getTime();
            console.log("Sending response...");
            console.log(`Response time: ${endTime-startTime}ms`)
            res.send(JSON.stringify(games));
        })();
    });
    
    console.log("Starting server...");
    app.listen(port, () => console.log(`Listening on port: ${port}`));
})();