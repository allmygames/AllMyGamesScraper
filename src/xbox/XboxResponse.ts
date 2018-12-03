import XboxGame from "./XboxGame";

export default class XboxResponse {
    public Games: XboxGame[];

    constructor(games: XboxGame[]) {
        this.Games = games;
    }
}