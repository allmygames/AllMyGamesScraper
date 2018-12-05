import PlayStationGame from "./PlayStationGame";

export default class PlayStationResponse {
    public Games: PlayStationGame[];
    public VerificationStatus: string;

    constructor(games: PlayStationGame[], verificationStatus: string) {
        this.Games = games;
        this.VerificationStatus = verificationStatus;
    }
}