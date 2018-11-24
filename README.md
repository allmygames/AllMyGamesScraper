# AllMyGamesScraper
Node service that uses Puppeteer to scrape game profile data from Xbox Live.

## Setup
Update config/default.json configuration file locally to include any MSA (Microsoft Account) username and password. 
This is required in order to authenticate with the Xbox Live website and access a specified user's profile.

## Usage
npm start

Starts the service, which can then be queries for Xbox Live and PSN profile information. 

In order to retrieve PSN data, you must first log in to a PSN account in the Chromium browser started by the service at my.playstation.com. The browser will then use your session cookie for future requests. Specified PSN ID must be associated with an account configured to allow other users to view their trophies.

The Xbox scraper will log in automatically using any credentials provided in config/default.json. Alternatively, you can log in manually in the Chromium browser and the session cookie will be re-used as in the PSN case described above. Specified gamertag must be associated with an account configured to allow other users to view game and app history.
