# Bachelorette invite "Protect the Bride" (SAMPLE): Playfair Fun & Games

"You're Invited to Play." This is a sample invitation game. You play the Maid of Honour on bodyguard duty in a first-person neon nightclub. Bride Jess dances her way from the dance floor to the bar, the karaoke stage and finally the VIP booth. Cartoon hunks (shirtless, bow ties, tear-away pants) try to sweep her off her feet, and you slap them away. Margaritas restore health. Pink champagne gives 5 seconds of champagne-spray frenzy with double-speed slaps. Mr. Sexy guards the VIP velvet rope. Win the level and the invite is revealed.

- Opening cinematic: a fly-over of the club that lands on Jess with her "PROTECT ME" heart. Tap to skip.
- Hunk types: regular, dashers (fast), smooth talkers (take several slaps) and grabbers (carry the bride off). The boss is Mr. Sexy.
- If you fail, you get a cheeky "morning after" gag ("You had ONE job.") and retry from the last checkpoint. After 3 fails, easy mode turns on and "Skip to invite" appears.
- Voices are short MP3s in `audio/`, generated offline with the open-source Kokoro-82M TTS model (Apache-2.0). No accounts or online services were used. They play through WebAudio after the first tap (iOS unlock) and follow the mute toggle.

All names, dates and the venue in `config.json` are placeholders. `"sample": true` shows a "Sample invite" badge.
`rsvpEndpoint` is set to `"local"`, so RSVPs are saved only on the guest's device (localStorage key `playfair-bachelorette-sample-rsvp`). Set an HTTPS endpoint to receive JSON POSTs instead. Each POST carries guestName, attending, stayingOver, message, eventName, date, time, location, hostName and submittedAt.

`?q=0|1|2` forces a quality tier. Without it, the game drops a tier automatically when frames run slow.

Run locally with `python3 -m http.server 8781`. The page is noindex/nofollow, with no ads, no tracking and no third-party requests.

## v2: dancing + house music

- Hunks now dance on the beat while they approach and while they hang around: hip sways, body rolls, finger points, shoulder shimmies and the disco point. Each hunk switches moves every 8 beats. Clothed background clubbers dance around the club too.
- A 16-bar, 124 BPM four-on-the-floor house loop (kick, clap, hats, off-beat bass, chord stabs with sidechain pump) is synthesised on the device, so there are no audio files and nothing to license. It's rendered while the landing screen is up and starts after the first tap (iOS unlock). It plays low under the SFX and voices, dips during the fail gag and on the reveal, and follows the mute toggle. Dancers, dance-floor tiles and lights all sync to the music clock.
- The service worker cache is bumped to `bachelorette-invite-v2`.

## v3: ending fix

- Fixed a softlock that stopped the game from ever ending. If you lost at the last checkpoint (Jess heading for the VIP rope) and retried, Mr. Sexy was never spawned again. He used to appear only when the karaoke hold finished, so Jess danced at the rope forever. He now spawns any time Jess is heading for the VIP rope and the rope is still closed.
- The service worker cache is bumped to `bachelorette-invite-v3`.
