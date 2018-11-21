const puppeteer = require('puppeteer');
import XboxGame from './XboxGame';
import { Page, Browser } from 'puppeteer';
var $ = require('jquery');

export default class XboxScraper {
    private browser: any;
    
    public Username: string;
    public Password: string;

    constructor(username: string, password: string, browser: Browser) {
        this.Username = username;
        this.Password = password;

        this.browser = browser;
    }

    public async ScrapeXboxGames(gamertag: string): Promise<XboxGame[]> {
        let url: string = "https://account.xbox.com/en-us/profile?gamertag=" + gamertag + "&activetab=main:mainTab2";

        // Create browser page
        const page: Page = await this.browser.newPage();

        // Attempting to navigate to profile page
        await page.goto(url, { waitUntil: 'networkidle0' })
            .catch((reason) => {
                return null;
            });

        // If we haven't already logged in in this browser session, we'll be redirected to the login page
        let redirectedToLoginPage = !page.url().startsWith(url);
        if (redirectedToLoginPage) {
            console.log("Logging in...");

            // Enter username
            console.log("Entering username...");
            await page.type("#i0116", this.Username);
            await page.click("#idSIButton9");

            // Wait for UI to update after click
            await page.waitForSelector("#i0118", {
                visible: true
            });

            await page.waitFor(1000);

            // Enter password and submit form
            console.log("Entering password...");
            await page.type("#i0118", this.Password);

            // Wait for redirect to profile page
            // Proceed once we have clicked, been redirected, and network traffic has quieted down
            console.log("Waiting for page navigation...");
            await Promise.all([
                page.click("#idSIButton9"),
                page.waitForNavigation({ waitUntil: 'networkidle2' })
            ]).catch((reason) => {
                console.log("Navigation failed. Reason: " + reason);
            });
        }
        else {
            console.log("Already logged in with existing session.");
        }

        // Wait for gamesList element to be loaded into the DOM
        console.log("Waiting for DOM elements to load...");
        await page.waitForSelector("#gamesList").catch((reason: any) => {
            console.log("Waiting for gamesList failed. Reason: " + reason);
            return;
        }).catch((reason) => {
            return null;
        });

        // Redirect console logging calls in page context
        page.on('console', msg => {
            console.log(msg.text());
        });

        // Execute script on page to scrape game elements from achievements tab
        console.log("Evaluating...");
        let games: XboxGame[] = await page.evaluate(() => {
            let gameElements: HTMLElement[] = $('xbox-title-item').get();
            
            let games: XboxGame[] = [];
            for (let gameElement of gameElements) {
                let titleIdUrl = $(gameElement).find('a.recentProgressLinkWrapper').attr('href');
                let titleIdRegex = /titleid=(.*?)&/i;
                let titleId = titleIdUrl.match(titleIdRegex)[1];
    
                let gamerscoreInfoValues: string[] = $(gameElement).find(".gamerscoreinfo").text().trim().split("/");
                let currentGamerscore: number = parseInt(gamerscoreInfoValues[0]);
                let maxGamerscore: number = parseInt(gamerscoreInfoValues[1]);
                let image: string = $(gameElement).find(".xboxprofileimage > img").attr('src');
                let titleName: string = $(gameElement).find('p.recentProgressItemTitle').text();
                games.push({
                    Name: titleName,
                    TitleId: titleId,
                    Image: image,
                    CurrentGamerscore: currentGamerscore,
                    MaxGamerscore: maxGamerscore
                });
            }

            return games;
        });

        console.log("Filtering games list...");
        games = games.filter(x => x.MaxGamerscore > 0);

        page.close();

        console.log("Done.");
        return games;
    }
}