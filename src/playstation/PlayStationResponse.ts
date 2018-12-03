import PlayStationGame from "./PlayStationGame";

export default class PlayStationResponse {
    public Games: PlayStationGame[];

    constructor(games: PlayStationGame[]) {
        this.Games = games;
    }
}