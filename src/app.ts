const express = require('express');
const { Cluster } = require('puppeteer-cluster');
const resolve = require('path').resolve;

import XboxScraper from "./xbox/XboxScraper";
import XboxGame from "./xbox/XboxGame";
import PlayStationScraper from "./playstation/PlayStationScraper";
import PlayStationResponse from "./playstation/PlayStationResponse";
import XboxResponse from "./xbox/XboxResponse";

var config = require('config');

const app = express();

const port: number = 3000;
const userAgentString: string = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36";

const redirectPageContextLogging: boolean = false;

(async () => {
    let absoluteUserDataDir = resolve(config.get('puppeteerUserDataDir'));
    let cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 5,
        puppeteerOptions: {
            headless: config.get('headless'), 
            userDataDir: absoluteUserDataDir
        }
    });

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });
    
    app.get('/gog/:gogid', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
    });

    app.get('/playstation/:psnid', (req, res) => {
        let startTime: number = new Date().getTime();
        res.setHeader('Content-Type', 'application/json');

        var psnid = req.params.psnid;
        if (!psnid) {
            res.send(JSON.stringify({
                message: "'psnid' route parameter is required."
            }));
        }
    
        (async () => {
            await cluster.queue(async ({ page }) => {
                page.setUserAgent(userAgentString);

                // Redirect console logging calls in page context
                if (redirectPageContextLogging) {
                    page.on('console', msg => {
                        console.log(msg.text());
                    });
                }

                let scraper = new PlayStationScraper();
                let response: PlayStationResponse = await scraper.ScrapePlayStationGames(psnid, page);
    
                let endTime: number = new Date().getTime();
                console.log(`Response time: ${endTime-startTime}ms`)

                res.send(JSON.stringify(response));
            });
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
            res.send(JSON.stringify({
                message: "'gamertag' route parameter is required."
            }));
        }
    
        (async () => {
            console.log("Getting page from cluster...");
            await cluster.queue(async ({ page }) => {               
                page.setUserAgent(userAgentString);
                
                // Redirect console logging calls in page context
                page.on('console', msg => {
                    console.log(msg.text());
                });

                let scraper = new XboxScraper(config.get('MSA.username'), config.get('MSA.password'));
                let games: XboxGame[] = await scraper.ScrapeXboxGames(gamertag, page);
    
                let endTime: number = new Date().getTime();
                console.log(`Response time: ${endTime-startTime}ms`)
                res.send(JSON.stringify(new XboxResponse(games)));
            });
        })();
    });
    
    app.listen(port, () => console.log(`Listening on port: ${port}`));
})();