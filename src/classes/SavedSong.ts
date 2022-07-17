export default class SavedSong implements Song {
    type: string;
    id: string;
    attributes: SongAttributes;
    links: Links;
    arrangements: Arrangements;
    attachments: Attachments;
    tags: Tags;

    constructor(song: Song, arrangements: Arrangements, attachments: Attachments, tags: Tags) {
        this.type = song.type;
        this.id = song.id;
        this.attributes = song.attributes;
        this.links = song.links;
        this.arrangements = arrangements;
        this.attachments = attachments;
        this.tags = tags;
    }
}