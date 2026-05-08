# Chasing Reverbs – Release Timeline

Static GitHub Pages site. Deployed at `timeline.chasingreverbs.com`.

## Local preview

```bash
cd "/Volumes/T7/Chasing Reverbs/chasing-reverbs-timeline"
python3 -m http.server 8080
# Open: http://localhost:8080
```

## Deploy to GitHub Pages

1. Create a new GitHub repo (e.g. `chasing-reverbs-timeline`)
2. Push this directory as the repo root:
   ```bash
   git init
   git add .
   git commit -m "Initial release timeline"
   git remote add origin https://github.com/YOUR_USER/chasing-reverbs-timeline.git
   git push -u origin main
   ```
3. In repo Settings → Pages → Source: **Deploy from branch** → `main` / `(root)`
4. Add a CNAME DNS record at your registrar:
   - Type: `CNAME`
   - Name: `timeline`
   - Value: `YOUR_USER.github.io`
5. GitHub Pages will pick up `CNAME` automatically and serve on `timeline.chasingreverbs.com`

## Adding a new release

1. Add an entry to `data/releases.json` at the **top** of the `releases` array (newest first):
   ```json
   {
     "id": "your-release-id",
     "title": "Release Title",
     "date": "YYYY-MM-DD",
     "type": "single",
     "label": "SVR/TSR",
     "coverHash": "SPOTIFY_COVER_HASH",
     "tracks": [
       { "title": "Track Title", "spotifyId": "SPOTIFY_TRACK_ID" }
     ]
   }
   ```
2. Download the cover image:
   ```bash
   curl -o "covers/HASH.jpg" "https://i.scdn.co/image/ab67616d0000b273HASH"
   ```
3. Move `"newest": true` from the previous latest release to this one.
4. Commit and push.

### Finding the Spotify cover hash

Open Spotify Web → right-click cover → "Copy image address". The URL looks like:
`https://i.scdn.co/image/ab67616d0000b273XXXXXXXXXXXXXXXXXXXXXXXX`
The 40-char hex after `ab67616d0000b273` is the hash.

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
| `collab` | Shows collaboration tag |
| `coverSong` | `{ "original": "Song", "artist": "Artist" }` |
| `fallbackAlbumId` | Spotify album ID to use if no track ID available |

## File structure

```
chasing-reverbs-timeline/
├── index.html          ← Shell
├── timeline.css        ← CR Style Guide v1.1
├── timeline.js         ← All interactivity (vanilla ES6+)
├── CNAME               ← GitHub Pages custom domain
├── data/
│   └── releases.json   ← All release data
└── covers/
    └── *.jpg           ← 640×640 Spotify CDN covers (named by hash)
```
