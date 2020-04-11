This a semi-personal project for supporting amateur theater, which I am part of. We prepared a play based on the movie
 [Perfetti sconosciuti](https://www.imdb.com/title/tt4901306/).

The premier took place on 15 of October 2019 in Pułtusk
(recordings: [act I](https://www.youtube.com/watch?v=_-d4HWAjEjE), [act II](https://www.youtube.com/watch?v=TTNW4rbHQo4)).

The plot is full of interactions with mobile devices (messages, calls) and other sounds (radio, doorbells, music).
These need to be very precisely synced and timed.

There are 3 components to support audio / sounds syncing:
 - server - supports real-time communication between apps and serves static content
 - control panel app - run on external device; based on parsed screenplay; hitting arrow-down moves to next event; an event is propagated via the server to actor's app to be played there or fallbacks to control panel's audio output
 - actor's app - upon event / command produces sound and optionally vibrates;

Additionally there is a visual presentation app which displays devices status (calls, messages, photos).
One scene is about taking a selfie, so actor's app streams _video_ (as a sequence of images) which is then displayed by presentation app.
As a help for us on scene: actor's app displays current and few next subsequent sentences and actor's sentences highlighted.

Apart from play needs themselves - I implemented few auxiliary tools for learning the roles and practice.
The screenplay was easily accessible and navigable (by scenes); with role's parts highlighted.
Each actor was asked to record their sentences one by one.
If we met for practice and someone was absent we used their recorded version - it is easily set in control panel.
Finally, there is a script for generating - for each actor - parts of the play with their sentences as a single audio file.
By hearing to this file I learnt my role in a quite effortless manner.
