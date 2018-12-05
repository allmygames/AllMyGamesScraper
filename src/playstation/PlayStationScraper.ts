import PlayStationGame, { PlayStationGameTrophyProgress } from './PlayStationGame';
import { Page } from 'puppeteer';
import PlayStationResponse from './PlayStationResponse';
var $ = require('jquery');

export default class PlayStationScraper {
    public async ScrapePlayStationGames(psnId: string, page: Page): Promise<PlayStationResponse> {
        console.log(`Scraping PlayStation games for ${psnId}...`);

        // Attempting to navigate to profile page
        console.log("Attempting to navigate to profile page...");
        let navigationSuccessful: boolean = await this.navigateToProfilePage(psnId, page);
        if (!navigationSuccessful) {
            console.log("Failed to navigate to profile page.")
            return null;
        }

        await this.addJqueryScript(page);

        // Determine verification status for profile
        console.log("Determining profile verification status...");
        let verificationStatus: string = await this.verifyPlayStationProfile(page);
        console.log(`VerificationStatus: ${verificationStatus}`);

        if (verificationStatus != "Verified") {
            console.log("Returning failure response");
            return new PlayStationResponse(null, verificationStatus);
        }
        
        let games: PlayStationGame[] = await this.scrapeGamesFromProfilePage(page);

        console.log(`Returning ${games.length} games...`);
        return new PlayStationResponse(games, "Verified");
    }

    public async VerifyPlayStationProfile(psnId: string, page: Page): Promise<PlayStationResponse> {
        console.log(`Scraping PlayStation games for ${psnId}...`);

        // Attempting to navigate to profile page
        console.log("Attempting to navigate to profile page...");
        let navigationSuccessful: boolean = await this.navigateToProfilePage(psnId, page);
        if (!navigationSuccessful) {
            console.log("Failed to navigate to profile page.")
            return null;
        }

        await this.addJqueryScript(page);

        let verificationStatus: string = await this.verifyPlayStationProfile(page);
        return new PlayStationResponse(null, verificationStatus);
    }

    private async addJqueryScript(page: Page): Promise<void> {
        await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js', content: "text/javascript"});
    }

    private async navigateToProfilePage(psnId: string, page: Page): Promise<boolean> {
        // Attempting to navigate to profile page
        console.log("Attempting to navigate to profile page...");
        let url: string = "https://my.playstation.com/profile/" + psnId + "/trophies";
        await page.goto(url, { waitUntil: 'networkidle0' })
            .catch((reason) => {
                console.log("Failed to navigate to profile page.")
                return false;
            });

        let redirectedToLoginPage = !page.url().startsWith(url);
        if (redirectedToLoginPage) {
            // The scraper can NOT log into my.playstation.com automatically because it employs a recaptcha.
            // User must configure the browser to not be headless and log in manually once before this scraper
            // will be able to access PlayStation profile data.
            console.log("Redirected to login page. Manual authentication is required.");
            return false;
        }

        return true;
    }

    private async scrapeGamesFromProfilePage(page: Page): Promise<PlayStationGame[]> {
        console.log("Scraping games from profile page...");
        
        // Click "View more" button to start loading additional games
        // Subsequent batches of games will load dynamically upon scrolling to the bottom of the page
        await page.click('.load-more-btn');

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

        return await page.evaluate(() => {        
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
    }

    private async verifyPlayStationProfile(page: Page): Promise<string> {
        // Determine verification status for profile
        console.log("Determining profile verification status...");
        let verificationStatus: string = await page.evaluate(() => {
            // If the profile doesn't exist, return null immediately
            if ($('.not-found-page__container').length > 0) {
                console.log("Does not exist.")
                return "DoesNotExist";
            }

            let noTrophies: boolean = $('.no-trophy__label--primary').length;
            if (!noTrophies) {
                return "Verified";
            }

            let noTrophiesText: string = $('.no-trophy__label--primary').first().text();
            if (noTrophiesText.includes("hasn’t earned any trophies yet.")) {
                console.log("NoGames");
                return "NoGames";
            } else if (noTrophiesText.includes("Not public.")) {
                console.log("Private");
                return "Private";
            } else {
                console.log("VerificationFailed");
                return "VerificationFailed";
            }
        }).catch((reason) => {
            console.log(`Failed with reason: ${reason}`);
        });

        console.log(`VerificationStatus: ${verificationStatus}`);
        return verificationStatus;
    }
}