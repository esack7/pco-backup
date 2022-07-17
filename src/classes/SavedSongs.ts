import SavedSong from "./SavedSong";

export default class SavedSongs implements Songs {
    links: Links;
    included: [];
    meta: Meta;
    data: SavedSong[] = [];
    
    constructor(request: SongsRequest) {
        this.links = request.links;
        this.included = request.included;
        this.meta = request.meta;
    }

    async SetSongToSavedSongData(song: SavedSong) {
        this.data.push(song);
    }
}