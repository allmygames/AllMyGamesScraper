export default class XboxGame {
    public Image: string;
    public Name: string;
    public TitleId: string;

    public CurrentGamerscore: number;
    public MaxGamerscore: number;

    constructor(name: string, titleId: string, image: string, currentGamerscore: number, maxGamerscore: number) {
        this.Name = name;
        this.TitleId = titleId;
        this.Image = image;
        this.CurrentGamerscore = currentGamerscore;
        this.MaxGamerscore = maxGamerscore;
    }
}