import PlayStationGame, { PlayStationGameTrophyProgress } from './PlayStationGame';
import { Page } from 'puppeteer';
var $ = require('jquery');

export default class PlayStationScraper {
    public async ScrapePlayStationGames(psnId: string, page: Page): Promise<PlayStationGame[]> {
        console.log(`Scraping PlayStation games for ${psnId}...`);

        // Attempting to navigate to profile page
        console.log("Attempting to navigate to profile page...");
        let url: string = "https://my.playstation.com/profile/" + psnId + "/trophies";
        await page.goto(url, { waitUntil: 'networkidle0' })
            .catch((reason) => {
                return null;
            });

        let redirectedToLoginPage = !page.url().startsWith(url);
        if (redirectedToLoginPage) {
            // The scraper can NOT log into my.playstation.com automatically because it employs a recaptcha.
            // User must configure the browser to not be headless and log in manually once before this scraper
            // will be able to access PlayStation profile data.
            console.log("Redirected to login page. Manual authentication is required.");
            return null;
        } else {
            console.log("Already logged in with existing session.");
        }

        // Click "View more" button to start loading additional games
        // Subsequent batches of games will load dynamically upon scrolling to the bottom of the page
        await page.click('.load-more-btn');
        
        // Adding jquery script to page so that it can be used in page context
        await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js', content: "text/javascript"});

        // Keep scrolling down the page until games stop loading in
        let previousHeight: number;
        let done: boolean = false;
        while (!done) {
            // Measure height of page
            previousHeight = await page.evaluate('document.body.scrollHeight');

            // Scroll to bottom of page to trigger request
            await page.evaluate(() => {
                console.log("Scrolling...");
                window.scrollTo(0, document.body.scrollHeight);
            });

            // Wait for page length to increase (indicating results returned)
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, {
                timeout: 1000
            }).catch(async () => {
                console.log("Done loading games.");
                done = true;
            });
        }

        let games: PlayStationGame[] = await page.evaluate(() => {        
            let gameElements: HTMLElement[] = $('.game-tile-link').get();
            let games = [];
            for (let gameElement of gameElements) {
                let titleIdUrl: string = $(gameElement).find('.game-tile__link').attr('href');
                let titleIdRegex: RegExp = /\/trophies\/details\/(.*?)\/default/i;
                let titleId: string = titleIdUrl.match(titleIdRegex)[1];
        
                let image: string = $(gameElement).find('.game-tile__image').attr('src');
                let titleName: string = $(gameElement).find('h2.game-tile__title').attr('title');
                let platforms: string[] = $(gameElement).find('.game-platform-list .game-platform').get().map(x => $(x).text());
        
                let trophyProgress: PlayStationGameTrophyProgress = {
                    CompletionPercentage: $(gameElement).find('.progress-bar__progress-bar-element').attr('aria-valuenow'),
                    EarnedBronze: $(gameElement).find('.trophy-count__bronze-tier').text(),
                    EarnedSilver: $(gameElement).find('.trophy-count__silver-tier').text(),
                    EarnedGold: $(gameElement).find('.trophy-count__gold-tier').text(),
                    EarnedPlatinum: $(gameElement).find('.trophy-count__platinum-tier').text()
                };
        
                games.push({
                    Image: image,
                    Name: titleName,
                    TitleId: titleId,
                    Platforms: platforms,
                    TrophyProgress: trophyProgress
                });
            }

            return games;
        });

        console.log(`Returning ${games.length} games...`);
        return games;
    }
}