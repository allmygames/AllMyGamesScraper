export default class Game {
    public Image: string;
    public Name: string;
    public TitleId: string;

    constructor(name: string, titleId: string, image: string) {
        this.Name = name;
        this.TitleId = titleId;
        this.Image = image;
    }
}