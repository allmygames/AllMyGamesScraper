import PlayStationGame from "./PlayStationGame";

export default class PlayStationResponse {
    public Games: PlayStationGame[];
    public PsnId: string;
    public VerificationStatus: string;

    constructor(games: PlayStationGame[], psnId: string, verificationStatus: string) {
        this.Games = games;
        this.PsnId = psnId;
        this.VerificationStatus = verificationStatus;
    }
}