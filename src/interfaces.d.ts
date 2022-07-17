interface MainVariables {
  cookieString: string,
  callCount: number,
  currentTime: number,
};

interface CookieInterface {
    name: string,
    value: string,
    domain: string,
    path: string,
    expires: number,
    size: number,
    httpOnly: boolean,
    secure: boolean,
    session: boolean,
    sameSite: string,
    sameParty: boolean,
    sourceScheme: string,
    sourcePort: number
}

interface Links {
    self: string,
    next?: string
}

interface SongAttributes {
    admin: string,
    author: string,
    ccli_number: number,
    copyright: string,
    created_at: string,
    hidden: boolean,
    last_scheduled_at?: string,
    last_scheduled_short_dates?: string,
    notes?: string,
    themes: string,
    title: string,
    updated_at: string
}

interface Song {
    type: string,
    id: string,
    attributes: SongAttributes,
    links: SongLinks
}

interface ArrangementAttributes {
    archived_at?: string,
    bpm?: number,
    chord_chart?: string,
    chord_chart_chord_color: number,
    chord_chart_columns: number,
    chord_chart_font: string,
    chord_chart_font_size: number,
    chord_chart_key?: string,
    created_at: string,
    has_chord_chart: boolean,
    has_chords: boolean,
    isrc?: string,
    length: number,
    lyrics?: string,
    lyrics_enabled: boolean,
    meter?: string,
    mtid?: string,
    name: string,
    notes?: string,
    number_chart_enabled: boolean,
    numeral_chart_enabled: boolean,
    print_margin: string,
    print_orientation: string,
    print_page_size: string,
    rehearsal_mix_id?: string,
    sequence: [],
    sequence_full: [],
    sequence_short: [],
    updated_at?: string
}

interface Relationship {
    data: Role
}

interface Relationships {
    updated_by: Relationship,
    created_by: Relationship,
    song: Relationship
}

interface Arrangement {
    type: string,
    id: string,
    attributes: ArrangementAttributes,
    relationships: Relationships,
    links: Links
}

interface Arrangements {
    links: Links,
    data: Arrangement[],
    included: [],
    meta: Meta
}

interface Attachments {
    links: Links,
    data: [],
    included: [],
    meta: Meta
}

interface Tags {
    links: Links,
    data: [],
    included: [],
    meta: Meta
}

// interface SavedSong extends Song {
//     arrangements: Arrangements,
//     attachments: Attachments,
//     tags: Tags
// }

interface Offset {
    offset: number
}

interface Role {
    id: string,
    type: string
}

interface Meta {
    total_count: number,
    count: number,
    next?: Offset,
    can_include?: string[],
    can_order_by?: string [],
    can_query_by?: string [],
    parent: Role
}

interface Songs {
    links: Links,
    included: [],
    meta: Meta
}

interface SongsRequest extends Songs {
    data: Song [],
}
