const puppeteer = require('puppeteer');
import PlayStationGame, { PlayStationGameTrophyProgress } from './PlayStationGame';
import * as fs from 'fs';
import { Page } from 'puppeteer';
var $ = require('jquery');

export default class PlayStationScraper {
    private browser: any;

    constructor(browser: any) {
        this.browser = browser;
    }

    public async ScrapePlayStationGames(psnId: string): Promise<PlayStationGame[]> {
        let url: string = "https://my.playstation.com/profile/" + psnId + "/trophies";

        // Create browser page
        const page: Page = await this.browser.newPage();

        // Attempting to navigate to profile page
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
        }
        
        console.log("Already logged in with existing session.");

        // Redirect console logging calls in page context
        page.on('console', msg => {
            console.log(msg.text());
        });

        // Execute script on page to scrape game elements from achievements tab
        await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'});
        let games: PlayStationGame[] = await page.evaluate(() => {
            let gameElements: HTMLElement[] = $('.game-tile-link').get();
            console.log(`Found ${gameElements.length} game elements.`);

            let games: PlayStationGame[] = [];
            for (let gameElement of gameElements) {
                let titleIdUrl = $(gameElement).find('.game-tile__link').attr('href');
                let titleIdRegex = /\/trophies\/details\/(.*?)\/default/i;
                let titleId = titleIdUrl.match(titleIdRegex)[1];

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

        // Log list of games to the console
        console.log(JSON.stringify(games));

        return games;
    }
}