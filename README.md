# AllMyGamesScraper
Node service that uses Puppeteer to scrape game profile data from providers including PlayStation Network and Xbox Live.

## Setup
npm install
tsc

For PlayStation Network scraping:
The puppeteer user data directory needs to be pre-populated with a logged-in session on my.playstation.com. We can't log in automatically using configured credentials because my.playstation.com requires completion of a recaptcha to log in.
To accomplish this, log in to my.playstation.com manually using the Chromium browser. You can do this easily by starting the AllMyGamesScraper service with 'headless' configured to false. Then, navigate to my.playstation.com to log in.

For Xbox Live scraping:
Update the config/default.json configuration file locally to include any valid MSA (Microsoft Account) username and password. Alternatively, you can log in manually in the Chromium browser and the session cookie will be re-used as in the PSN case described above. (I recommend creating a test account rather than using your personal MSA account.)
This is required in order to authenticate with the Xbox Live website and access any specified user's profile.

## Usage
npm start

Requesting PlayStation Network profile data:
In order to retrieve PSN data, you must first log in to a PSN account in the Chromium browser started by the service at my.playstation.com, as described in the Setup section.
Then, navigate to localhost:3000/playstation/<PSNID> to retrieve games for the specified profile. The given PSN ID must be configured so that their trophies are public.

Requesting Xbox Live profile data:
Navigate to localhost:3000/xbox/<GAMERTAG> to retrieve games for the specified profile.
The specified gamertag must be configured to allow other users to view game and app history.
