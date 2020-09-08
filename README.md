# Cubic
## A test repo using my card-game clone project, "Cubic"
----------------------------------------------------

Originally a project to test out ways of implementing click-and-drag and snap-to-grid in JavaScript, now a semi-labor-of-love.

**Code Changes**
To accomodate the addition of adding an AI player, the 'place card' method was added to the main component
- This method contains the actions performed after a valid move was confirmed
- Separating these actions allows the AI player to call the function when it places a card, as it was reviously tied to mouseup
The AI function returns a card to be played, as well as the location to play it on the board.
Current implementation includes only a completely random AI: random card choice, random board placement.
- Movement of the card to be played is animated prior to running the place card method, to simulate a click-and-drag.
- As a result, a timeout is attached to the placeCard call, to ensure animation is finished before the card is attached to the board.

**Completed**
- fix card coloring issues
- split a section off into a child component
- add 'hands'
- add turns
- add victory condition
- added imports for constants and the custom card element
- options like shuffle, reset deck, sound on/off
- add ai

**To-Do**
2. disable options while game is in progress
3. touch
4. add additional AI settings
5. add mp?
