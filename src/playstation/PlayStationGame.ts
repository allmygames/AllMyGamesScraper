import Game from "../shared/Game";

export class PlayStationGameTrophyProgress {
    CompletionPercentage: number;
    EarnedBronze: number;
    EarnedSilver: number;
    EarnedGold: number;
    EarnedPlatinum: number;
}

export default class PlayStationGame extends Game {
    public Platforms: string[];
    public TrophyProgress: PlayStationGameTrophyProgress;

    constructor(name: string, titleId: string, image: string, platforms: string[],
        trophyProgress: PlayStationGameTrophyProgress) {
        super(name, titleId, image);
        this.Platforms = platforms;
        this.TrophyProgress = trophyProgress;
    }
}