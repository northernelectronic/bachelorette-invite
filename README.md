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
