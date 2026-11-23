# Plan: Bubble Pop

## Project

Bubble Pop is a collaborative phone-based experience where people contribute to one shared piece of media. Each person uses their own phone to add something to a drawing before it gets passed to the next person.

This version focuses on testing how a drawing changes when it is passed between multiple people. Instead of everyone creating something separate, each person receives the same drawing and adds to what is already there.

The larger idea is still an anonymous communication system where people can interact with and change media created by others without necessarily knowing who originally made it. This version is a smaller test of that idea, focusing on shared drawing and turn-taking.

## The question

Does passing one shared drawing between people create a sense of collaboration? How do people approach adding to something that someone else has already started, and does the drawing naturally develop into something collectively made?

I want to see whether people build on each other's ideas, how much they change the existing drawing, and whether the experience feels collaborative even though everyone is using their own phone.

## The experience

Each participant uses their own phone to access Bubble Pop. All phones connect to the same shared room, so everyone sees the same drawing.

The experience starts with a mostly black screen, a circular drawing area in the centre, and two buttons at the bottom.

The main drawing area is a dark circle with a subtle border and bubble-like highlight. This is where the shared artwork develops.

When someone is ready to contribute, they tap **MY TURN**. This opens drawing mode and allows them to draw inside the circle using their finger.

Once they are finished, they tap **FINISH**. Their drawing is added to the shared artwork, and the updated version becomes visible on everyone's phone.

If someone does not want to add anything, they can tap **PASS** instead.

The next person can then take their turn. For this playtest, I manually guide the order and let participants know when it is their turn. The prototype does not automatically choose or assign the next person.

While someone is waiting, small floating bubbles move around the screen outside the main drawing area. Participants can tap these bubbles to pop them. New bubbles appear to replace the ones that disappear. This is a separate interaction on each phone and does not affect the shared drawing.

As more people contribute, the drawing develops through everyone's additions. The screen also displays the current version number and number of turns.

## Input, transformation, output

- **Input:**
  - Touchscreen interaction on each participant's phone.
  - Tapping MY TURN to start drawing.
  - Drawing with a finger inside the circular canvas.
  - Tapping FINISH to submit a contribution.
  - Tapping PASS to skip a turn.
  - Tapping the floating bubbles while waiting.

- **Transformation:**
  - When someone starts their turn, the drawing interface allows them to add new strokes.
  - Drawing points are saved using normalized coordinates so they can display correctly across different screen sizes.
  - When someone finishes, their strokes are added to the existing shared drawing.
  - The shared version number increases when a new drawing contribution is submitted.
  - The turn count increases when someone finishes or passes.
  - When a floating bubble is tapped, an individual pop animation plays and another bubble appears.

- **Output:**
  - A shared circular drawing displayed on every connected phone.
  - New drawing contributions appearing on all devices.
  - A version number and turn count showing the progress of the drawing.
  - Floating bubbles that move around the screen while participants wait.
  - Individual bubble-pop animations.
  - A connection status showing whether the phone is connected to the shared room.

## How the shared system works

The prototype uses p5.js and JavaScript for the interface and drawing interactions, along with the p5-phone Share system to connect multiple phones.

The current setup uses:

- Share server: `https://p5-phone-share.npuckett.workers.dev`
- Room: `a1-glade`
- App: `bubble-pop`

Each phone connects to the same room through the internet. The shared state contains:

- `strokes`: the drawing data added by everyone.
- `version`: the number of times the drawing has been updated.
- `turnCount`: the number of turns taken, including passes.
- `lastAction`: records whether the latest action was an edit or a pass.

Instead of sending an image of the drawing, the prototype shares the actual drawing strokes as points. Each stroke stores its colour, thickness, and normalized position.

The shared room uses `keep: true`, so the current shared drawing can remain available when someone refreshes their phone. This is not a full archive of every previous version; it keeps the current shared state.

The waiting bubbles are separate from the shared drawing. Each phone creates and pops its own floating bubbles locally.

## Limits

- Keep the prototype focused on one shared drawing and multiple phones.
- Keep the circular drawing area as the main focus.
- The drawing tool currently uses one colour: white.
- Do not add accounts or participant names. The experience should remain anonymous.
- Turn-taking is guided manually rather than automatically assigned by the system.
- The floating bubbles are individual interactions and are not shared between phones.
- The version number tracks drawing updates, but there is not yet a full visual history of previous versions.
- The current prototype uses one shared room rather than separate group and server-wide modes.
- The shared system uses p5-phone Share. It is not yet a larger permanent media database.
- Keep the project focused on testing how people contribute to and change shared media before adding more complicated features.

## How I will check it

- On my laptop:
  - The main drawing circle displays correctly.
  - The shared room connects successfully.
  - The drawing appears and updates when someone finishes a turn.
  - The version number and turn count update correctly.
  - MY TURN, FINISH, and PASS work.
  - Floating bubbles move, pop, and get replaced.
  - The layout adjusts to different screen sizes.

- On multiple phones:
  - Each phone can connect to the same room.
  - Everyone sees the same shared drawing.
  - A drawing made on one phone appears on the others.
  - New contributions are added without removing previous ones.
  - The drawing stays in the shared room if someone refreshes their phone.
  - Touch interactions work properly on mobile.
  - Participants can take turns without needing repeated explanations.

- During the playtest:
  - Record how people approach adding to an existing drawing.
  - See whether people build on the previous person's contribution or try to change its direction.
  - Notice whether people consider how much space is left for others.
  - See whether the first person's contribution influences the rest of the drawing.
  - Notice whether people feel like they are working together, even though they are using separate phones.
  - Record moments of surprise, laughter, hesitation, or confusion.
  - Ask what participants would change or add to the experience.

## Current implementation

The current `sketch.js` already includes:

- A responsive phone-sized interface.
- A circular shared drawing area.
- Shared drawing data through p5-phone Share.
- Drawing with a finger on a phone.
- MY TURN, FINISH, and PASS buttons.
- Shared version and turn counters.
- A connection status.
- Floating bubbles that move around the screen.
- Individual bubble-popping interactions.
- Persistent shared room state.

The main interaction has been tested with five participants using their own phones. Everyone successfully received and added to the same drawing, and the drawing transferred between all five devices.

## Changes and next steps

Based on the playtest, there are a few things I want to explore:

- Add multiple drawing colours so participants have more creative freedom and can tell which parts were added by different people.
- Consider a bubble-pop counter since participants enjoyed popping the floating bubbles while waiting.
- Explore ways to give the first person a starting point without having their drawing completely determine the direction of everyone else's contributions.
- Look at ways to make the different contributions more visually distinguishable.
- Continue testing how the drawing changes as more people add to it.
- Explore a way to show more of the drawing's history, rather than only displaying the current version number.
- Keep the shared drawing interaction as the foundation before adding more types of media or more complicated systems.

## Steps

**Step 1 — Set up the shared room**

Connect each phone to the same p5-phone Share server, room, and app. Make sure the shared state is available across devices.

**Step 2 — Create the shared drawing area**

Set up the responsive circular canvas where everyone will contribute. Make sure the drawing stays inside the circle and displays correctly on different screen sizes.

**Step 3 — Add shared drawing**

Allow participants to draw with their fingers. Store the strokes as shared drawing data so they can be displayed on every connected phone.

**Step 4 — Add turn-taking**

Add MY TURN, FINISH, and PASS buttons so participants can control when they contribute. For this version, the order is guided manually during the playtest.

**Step 5 — Add the waiting interaction**

Create the floating bubbles around the main drawing. Let participants tap them to pop them while they wait for their turn.

**Step 6 — Add shared progress information**

Display the version number and turn count so participants can see how the drawing has developed.

**Step 7 — Test across multiple phones**

Check that the shared drawing updates correctly, that the room stays connected, and that the experience works on actual phones rather than only on a laptop.

**Step 8 — Playtest with a group**

Have multiple people use their own phones to contribute to the same drawing. Observe how they interact with the existing artwork and what happens as it gets passed around.

## Public Horizon

The larger version of Bubble Pop could become a distributed anonymous communication system where people create, receive, and change media made by others.

Instead of only working with drawings, the system could eventually include text, images, and voice recordings. Someone could contribute something new, while another person could receive an existing piece of media and choose to edit it or simply observe it.

Participants could potentially choose between a smaller group-based experience and a larger server-wide pool of media from other people using the prototype.

The system could also keep track of how a piece of media changes over time, without necessarily showing who originally created it. This would allow people to see how something has developed through multiple contributions.

The current shared drawing is a small version of this idea. It tests how one piece of media can move between people and become something different through everyone's additions.

This connects to the idea of *Exquisite Corpse*, where multiple people contribute to one creative work and the final result becomes something that no single person made on their own.
