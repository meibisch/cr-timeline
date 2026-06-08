# Chasing Reverbs – Release Timeline

Static site deployed via Cloudflare Pages at `timeline.chasingreverbs.com`.

## Local preview

```bash
cd "/Volumes/T7/Chasing Reverbs/Website/Timeline"
python3 -m http.server 8080
# Open: http://localhost:8080
```

## Adding a new release

1. Add an entry to `data/releases.js` at the **top** of the `releases` array (newest first):
   ```js
   {
     "id": "your-release-id",        // kebab-case, used as cover filename
     "title": "Release Title",
     "date": "YYYY-MM-DD",
     "type": "single",               // see types below
     "label": "TSR",
     "newest": true,                 // move from previous latest release
     "tracks": [
       { "title": "Track Title", "spotifyId": "SPOTIFY_TRACK_ID" }
     ]
   }
   ```
2. Download the cover (640×640) from Spotify oEmbed and save as `covers/<id>.jpg`:
   ```bash
   # Get image URL:
   curl -s "https://open.spotify.com/oembed?url=spotify%3Aalbum%3AALBUM_ID" | python3 -c "import sys,json; print(json.load(sys.stdin)['thumbnail_url'].replace('00001e02','0000b273'))"
   # Download (replace URL and id):
   curl -o "covers/your-release-id.jpg" "https://..."
   ```
3. Remove `"newest": true` from the previous latest release in `releases.js`.
4. Commit and push — Cloudflare Pages deploys automatically.

### Release types

| `type` | Description |
|--------|-------------|
| `single` | One track |
| `single-multi` | Multiple versions of one song (tab switcher shown) |
| `ep` | EP (tracklist toggle shown) |
| `album` | Album (tracklist toggle shown) |

### Optional fields

| Field | Description |
|-------|-------------|
| `newest: true` | Shows accent border + "Latest" badge |
| `debut: true` | Shows "Debut" tag |
| `spotifyId` | Album-level Spotify ID (for albums/EPs without a primary track) |
| `fallbackAlbumId` | Spotify album ID to use if no track ID available |
| `collab` | Shows collaboration tag |
| `coverSong` | `{ "original": "Song", "artist": "Artist" }` |

## File structure

```
cr-timeline/
├── index.html          ← Shell
├── timeline.css        ← Styles
├── timeline.js         ← All interactivity (vanilla ES6+)
├── CNAME               ← Custom domain
├── data/
│   └── releases.js     ← Single source of truth for all release data
└── covers/
    └── <id>.jpg        ← 640×640 cover images, named by release id
```
