import Game from "../shared/Game";

export default class XboxGame extends Game {
    public CurrentGamerscore: number;
    public MaxGamerscore: number;

    constructor(name: string, titleId: string, image: string, currentGamerscore: number, maxGamerscore: number) {
        super(name, titleId, image);
        this.CurrentGamerscore = currentGamerscore;
        this.MaxGamerscore = maxGamerscore;
    }
}