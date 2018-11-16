# AllMyGamesScraper
Node service that uses Puppeteer to scrape game profile data from Xbox Live.

## Setup
Update config/default.json configuration file locally to include any MSA (Microsoft Account) username and password. 
This is required in order to authenticate with the Xbox Live website and access a specified user's profile.

## Usage
npm start -- <GAMERTAG>
Retrieves the list of game's from the user's profile and print them to the console in JSON format.
Specified gamertag must be associated with an account configured to allow other users to view game and app history.
