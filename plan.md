# Plan: Bubble Pop

## Project

Bubble Pop is a collaborative, phone-based experience that explores the phone as an unusual communication interface. It allows people to discover, create, alter, and pass along anonymous media created by other people, without necessarily knowing who originally made it.

The larger concept is an anonymous communication system where people can leave something behind for another person to discover. Instead of communicating through conventional messages, participants interact with drawings and prompts through floating bubbles. They can contribute to existing media, create something new, or explore what other people have left behind.

For this development stage, Bubble Pop will have two separate experiences within one application: **Group** and **Worldwide**.

Both experiences will use the same overall visual identity, interface style, and existing p5-phone Share server, but will have separate interactions and separate sections of shared data. Participants will choose which experience they want to enter from an opening screen.

The project is intended for a class playtest and only needs to remain functional for the remainder of the semester. It does not need to become a permanent online platform or support a large number of users.

### Group

The Group version builds on the existing collaborative drawing prototype. Participants use their own phones to contribute to one shared drawing, taking turns adding to what previous participants have created.

The updated version will introduce drawing colours, adjustable brush sizes, zoom controls, a visual version history through floating bubbles, and a collective bubble-pop counter.

The main focus is still one artwork that develops through multiple people's contributions. Previous versions can be explored, but cannot replace the current drawing.

### Worldwide

The Worldwide version develops the original anonymous communication concept further. Participants encounter randomized drawings and written prompts left behind by other people. They can contribute to existing drawings, create something new from a prompt, or explore other artworks through the floating bubbles.

Contributions will be saved as new versions of an artwork. The updated artwork can then be received by another participant, allowing it to continue developing through different people's contributions.

The worldwide collection will be small and limited to drawings and written prompts. It will begin with approximately three to five drawings created by me for testing, with an expected maximum of approximately thirteen artworks during the playtest.

The worldwide version will also include a collective bubble-pop counter that accumulates across all participants.

## The question

How can a phone become a space for anonymous, unexpected communication through shared creative media?

I want to explore how people respond to receiving something created by someone else, whether they choose to build upon it or create something new, and how a piece of media can change as it moves between people.

For the Group version, I want to see how additional tools and the ability to explore previous versions affect collaborative drawing. I also want to see whether floating bubbles give people something meaningful to interact with while waiting for their turn.

For the Worldwide version, I want to explore how people interact with media from an anonymous collection, whether they choose to contribute or leave something new behind, and how the experience of discovering other people's work changes when participants are not necessarily interacting with people they know.

The two experiences explore different forms of collaboration:

- Group: people collectively develop one shared artwork within a particular group.
- Worldwide: people contribute to a larger anonymous collection of artworks and prompts, potentially without ever meeting or knowing who else has contributed.

## The experience

### Opening screen

When someone opens Bubble Pop, they are presented with a starting screen where they can choose between two experiences:

- GROUP — A shared artwork developed by a group of participants.
- WORLDWIDE — An anonymous collection of drawings and prompts contributed to by different people.

Both options lead into their respective experiences while using the same general visual style.

There will only be one public GitHub Pages link. Participants do not need separate links to access the two experiences.

Both experiences use the same p5-phone Share connection, but their shared information must remain separate. Group drawings and counters must never appear in the Worldwide collection, and Worldwide contributions must never alter the Group artwork.

### Group experience

The Group version begins with a mostly black screen, a circular drawing area in the centre, and a collection of small floating bubbles around it.

The main drawing is shared between everyone who enters the Group room. Each participant uses their own phone to view the current drawing and contribute to it when it is their turn.

The existing manual turn-taking system will remain. Participants can start their turn, draw on the shared artwork, finish their contribution, or pass.

The order of participants will continue to be guided manually during the playtest rather than automatically assigned by the application.

#### Drawing interface

When someone starts their turn, the drawing interface becomes available.

Participants can draw inside the main circular canvas using their finger.

The drawing tools will be updated to include:

- A small selection of rainbow-inspired colours, using softer tones that match the visual style of Bubble Pop.
- A brush-size control.
- A zoom-in and zoom-out feature.

The colour palette should be visually clear and easy to select. The colours should be distinct enough that different contributions can be recognized more easily.

Brush size will be controlled through a slider. To activate it, the participant presses a clearly labelled brush-size button or option. This opens the brush-size adjustment interaction.

Once activated, the participant tilts their phone from left to right to move the slider and adjust the brush size. The slider should visually indicate the current size. This incorporates another phone interaction into the experience rather than relying entirely on touchscreen controls.

The brush-size option must clearly communicate that it can be pressed to activate the adjustment. The tilt interaction should only control the slider while this option is active, so it does not interfere with normal drawing.

The selected drawing colour and brush size are shared settings. When a participant changes either setting, the new selection is visible to everyone connected to the Group room.

This means that the settings are part of the shared experience rather than being individual preferences on each phone.

The zoom feature will use plus and minus buttons. Participants can zoom into or out of the main drawing without moving its position. The drawing stays centred, and there will be no panning.

Zooming should only change how the artwork is displayed, not permanently alter the drawing's stored coordinates. The drawing must remain correctly positioned and retain its normalized coordinates when the zoom level changes.

#### Finishing a turn and creating a new version

When a participant presses FINISH, their contribution is added to the existing drawing.

The previous drawing is saved as a version in the artwork's history before the updated drawing becomes the new current version.

Every completed drawing contribution that changes the artwork creates a new version. Passing without adding anything does not create a new artwork version, although it still counts as a completed turn.

The version number displayed at the top of the screen updates when a new version is created.

The updated drawing becomes visible to everyone in the Group room.

After the drawing updates, a few floating bubbles representing previous versions will appear from the bottom of the screen and join the existing floating bubbles.

Not every floating bubble represents a previous version. Most will remain regular empty bubbles that participants can pop while waiting.

#### Version history bubbles

Version history will be represented through some of the floating bubbles surrounding the main drawing.

These bubbles will contain a small glimpse or preview of the drawing from the version they represent. They should be visually distinguishable from the regular empty bubbles without losing the existing bubble aesthetic.

When someone pops a version bubble:

1. The selected bubble grows larger in its current position.
2. The surrounding interface becomes dimmed or blurred.
3. The previous drawing is displayed inside the enlarged bubble as a smaller preview.
4. Text displaying its version number appears above or wrapped around the bubble. For example, "Version 3".
5. The preview remains visible for a few seconds.
6. The bubble then plays its pop animation and disappears.

The preview is individual to the person who popped the bubble. It does not replace the main shared drawing or affect what other participants see.

Previous versions are view-only. Participants cannot restore an earlier version or use it to overwrite the current artwork.

Version bubbles should gradually become available as new versions are created. The number of version bubbles displayed should remain limited so the screen does not become overcrowded.

The floating bubble system should continue to contain regular empty bubbles as well.

#### Regular floating bubbles and group counter

The existing floating bubbles will continue to move around the main drawing and can be popped by tapping them.

These empty bubbles are intended to give participants something to interact with while they wait for their turn.

When a participant pops a regular empty bubble, the existing pop animation plays and another bubble appears to replace it.

A collective Group bubble-pop counter will be added.

The counter increases whenever someone pops an empty bubble. The count is shared across all participants in the Group room, so everyone can see the collective number of bubbles popped.

The counter is not increased by viewing version bubbles or interacting with the main drawing.

The Group counter begins at zero when a new group session starts.

#### Ending a Group session

The Group experience will include an END GROUP SESSION or RESET GROUP option.

This provides a clear way to end a session and prepare the application for the next group.

Ending the session resets the Group data, including:

- The current shared drawing.
- The version history.
- The version number.
- The turn count.
- The Group bubble-pop counter.
- Any temporary group interaction state.

The next group should enter a blank drawing with a counter of zero.

The existing prototype has appeared to reset when everyone leaves during testing. However, the current sketch does not contain an explicit last-participant reset function, and its `keep: true` setting allows room state to be retained. The actual automatic reset behaviour must be verified during development.

The explicit End Group Session action will provide a reliable way to reset the Group experience rather than depending entirely on participants closing their browsers.

The reset must only affect the Group data. It must never clear or modify the Worldwide collection or its counter.

Only one Group session is expected to run at a time, so there is no need for group creation, room codes, or multiple independent group rooms.

### Worldwide experience

The Worldwide version uses the same visual identity as the Group version, including the main circular bubble, floating bubbles, dark background, drawing interface, and version counter.

However, instead of one predetermined shared group drawing, participants encounter a small collection of anonymous drawings and written prompts.

The collection will initially contain approximately three to five drawings created by me through testing. Additional drawings and prompts may be created by participants during the experience.

The expected collection will not exceed approximately thirteen artworks for this playtest.

Only drawing strokes and written prompts will be stored. There will be no voice recordings, video, image uploads, or other media types in this development stage.

#### Receiving an artwork

When someone enters Worldwide, the application randomly selects an existing drawing or written prompt from the Worldwide collection.

If a drawing is selected, the participant first sees the artwork inside the main bubble.

They are given two main options:

- CONTRIBUTE — Opens the drawing interface and allows them to add to the existing drawing.
- NEXT — Skips the current artwork and takes them to a prompt where they can create something of their own.

The participant should be able to view the drawing before deciding whether to contribute.

When someone chooses to contribute, the drawing interface appears and they can use the available drawing tools to add something to the existing artwork.

When they press FINISH, their contribution is saved as a new version of the artwork.

The previous version remains part of the artwork's history. The updated version becomes the current version available to future participants.

Each participant can contribute only once to a particular artwork during their visit. After pressing FINISH, they move on rather than being able to repeatedly edit the same artwork during that visit.

#### Creating something new

When someone chooses NEXT instead of contributing to the received drawing, they are taken to a prompt where they can create something of their own.

The prompt can be a short written instruction or an idea left behind by another participant.

They can use the drawing interface to create something based on the prompt.

When they press FINISH, their drawing is saved as a new piece of media in the Worldwide collection.

If the participant finishes without making any marks, the application does not create an empty artwork. Instead, it moves to a simple ending screen with a thank-you message.

This allows people to participate without being forced to contribute something.

#### Leaving something behind

The Worldwide experience is intended to encourage participants to leave something behind for another person.

This can happen through different types of contributions:

- Adding to an existing drawing.
- Creating a new drawing based on a prompt.
- Leaving a written prompt for someone else to respond to.

Written prompts are stored as text and can be selected randomly by another participant.

A participant should be able to encounter either an existing drawing to develop or a written prompt to start something new.

The experience should not require them to identify themselves or explain who they are. Their contribution becomes part of the anonymous collection.

#### Moving between artworks

Floating bubbles will surround the main artwork in the Worldwide version.

Unlike the Group version, these bubbles will not contain previous versions of the current artwork.

Instead, some bubbles will represent other randomized artworks in the Worldwide collection, while the remaining bubbles will be regular empty bubbles that can be popped for fun.

Artwork bubbles should provide a small glimpse of the drawing or indicate that they contain a prompt.

When someone pops an artwork bubble, the selected artwork becomes the new main artwork.

The participant can then view it and choose to contribute or move on, following the same interaction system.

The participant can continue discovering and contributing to different artworks through the floating bubbles.

Popping an artwork bubble does not count towards the Worldwide bubble-pop counter.

The floating bubbles should remain visually consistent with the Group version while making it clear that some contain other pieces of media.

#### Worldwide version history

The Worldwide version will display the version number of the artwork currently being viewed.

Every successful contribution creates a new version.

Previous versions remain saved as part of that artwork's history, but the floating bubbles in the Worldwide version will not be used to display version history.

The version number is the only visible indicator of how many times the artwork has been updated.

The contributor's identity is never displayed.

#### Worldwide bubble-pop counter

A collective Worldwide bubble-pop counter will be displayed.

It counts the number of regular empty bubbles popped by everyone using the Worldwide experience.

The counter is shared across participants and continues accumulating as people enter and leave the experience.

Unlike the Group counter, it does not reset when a participant leaves or when the Worldwide experience is closed.

It remains in the Worldwide shared state for the duration of the room's retention period.

Popping an artwork bubble or selecting another drawing does not increase this counter.

## Input, transformation, output

### Group

**Input:**

- Touchscreen interaction on each participant's phone.
- MY TURN, FINISH, and PASS buttons.
- Drawing with a finger inside the circular canvas.
- Selecting a colour from the shared colour palette.
- Pressing the brush-size option to activate adjustment.
- Tilting the phone from left to right to adjust brush size.
- Plus and minus buttons to zoom.
- Popping regular floating bubbles.
- Popping version history bubbles.
- END GROUP SESSION or RESET GROUP.

**Transformation:**

- Drawing strokes are stored using normalized coordinates.
- New contributions are added to the existing drawing.
- Each successful contribution creates a saved version.
- The current version number increases.
- The updated artwork is shared with all connected phones.
- Brush colour and brush size are shared settings.
- Phone tilt adjusts the brush-size slider only when the brush-size interaction is active.
- Zoom changes the displayed size of the drawing without changing its stored coordinates.
- New version bubbles are introduced after a drawing update.
- Popping a version bubble opens an individual preview without changing the shared artwork.
- Popping a regular bubble increases the shared Group counter.
- Ending the group resets the Group data.

**Output:**

- One shared circular drawing displayed on every connected phone.
- A version counter and turn counter.
- Shared colour and brush-size settings.
- A centred drawing area with zoom controls.
- Floating empty bubbles.
- Floating version bubbles showing previous artwork.
- Individual version previews with a dimmed or blurred background.
- A collective Group bubble-pop counter.
- A blank starting state after a group reset.

### Worldwide

**Input:**

- Touchscreen interaction.
- Selecting CONTRIBUTE or NEXT.
- Drawing with a finger inside the circular canvas.
- Selecting drawing colours and adjusting brush size.
- Plus and minus zoom controls.
- Popping empty floating bubbles.
- Popping artwork bubbles.
- Creating a drawing based on a written prompt.
- Pressing FINISH.

**Transformation:**

- The application randomly selects an existing drawing or written prompt.
- Existing drawings can be viewed before deciding whether to contribute.
- Contributions are stored as new versions of the selected artwork.
- The current artwork is updated for future participants.
- NEXT moves the participant to a new creation prompt.
- New drawings are added to the Worldwide collection.
- Written prompts are stored as text for future participants.
- Artwork bubbles open other existing artworks.
- Empty bubble pops increase the Worldwide counter.
- No participant identity is stored or displayed publicly.

**Output:**

- Randomized existing drawings and written prompts.
- A circular drawing interface.
- A visible version number.
- Floating artwork bubbles and regular empty bubbles.
- New anonymous contributions.
- A thank-you ending screen when someone finishes without contributing.
- A collective Worldwide bubble-pop counter.
- An evolving collection of anonymous drawings and prompts.

## How the shared system works

The application will use p5.js and JavaScript for its interface and drawing interactions, along with p5-phone Share for synchronization between phones.

The existing connection must be preserved.

Current setup:

- Share server: `https://p5-phone-share.npuckett.workers.dev`
- Room: `a1-glade`
- App: `bubble-pop`
- Existing connection: `shareSetup()`
- Existing retention option: `keep: true`

There will be no additional server, external database, Firebase, Supabase, account system, or other storage service.

Both experiences will use the same room and connection. Their data will be separated through clearly named sections of the shared state.

The shared state should be organized conceptually into:

- `group`: contains all Group artwork, versions, turn information, drawing settings, and Group bubble counter.
- `worldwide`: contains the Worldwide artwork collection, version histories, written prompts, and Worldwide bubble counter.

The exact object structure can be finalized during implementation, but the separation must be maintained throughout development.

Switching between Group and Worldwide should not erase either experience's data.

### Group data

The Group section should contain:

- Current drawing strokes.
- Saved previous drawing versions.
- Current version number.
- Turn count.
- Last action.
- Shared brush colour.
- Shared brush size.
- Group bubble-pop counter.
- Group session state.

### Worldwide data

The Worldwide section should contain:

- A collection of artwork records.
- The current drawing for each artwork.
- Previous versions of each artwork.
- Written prompts.
- Artwork identifiers.
- Version numbers.
- Current artwork selection information where needed.
- Worldwide bubble-pop counter.

Each artwork should have its own identifier so that the application can distinguish one drawing from another.

A drawing record should conceptually contain:

- A unique artwork ID.
- Its current strokes.
- Its version history.
- Its current version number.
- Its artwork type.
- Any associated written prompt.
- Its contribution history where needed.

A version record should preserve the drawing strokes and version number at the time the contribution was completed.

The drawing data should remain vector-based. The application should store stroke points, colours, and brush weights rather than rendering and storing screenshots of the drawings.

### Simultaneous Worldwide contributions

More than one participant may receive the same artwork at the same time.

The application should attempt to preserve contributions as separate versions rather than allowing one person's work to automatically erase another person's contribution.

Where possible, each submitted contribution should be stored as its own record with a unique identifier. This reduces the likelihood of two participants writing to exactly the same shared data location.

If two participants receive the same starting version, their contributions can be treated as separate branches from that version. Each should remain identifiable through its version record, even though the application does not display contributor identities.

The current version pointer should update to the newest accepted contribution.

If simultaneous updates conflict, the application may use the last accepted update as the current version. The p5-phone Share system uses last-write-wins synchronization, so fully transactional conflict resolution cannot be assumed.

Occasional overwriting is an acceptable fallback for this class playtest, but the implementation should prioritize preserving separate contributions where possible.

The application does not need a complicated locking system or a system that prevents multiple people from receiving the same artwork.

### Retention and storage limits

The room only needs to remain functional for the remaining weeks of the semester.

The existing `keep: true` option should be retained. According to the p5-phone Share documentation, room state can be kept after the last phone leaves for up to 30 days after the last change.

This is suitable for the project timeframe, but it is not permanent storage.

The Worldwide collection will initially contain approximately three to five seed drawings, with a target maximum of approximately thirteen artworks during the playtest.

The exact maximum supported payload size for the existing Share room has not been established. The collection should therefore remain lightweight.

To keep the shared state manageable:

- Store drawing strokes as coordinate data.
- Store written prompts as plain text.
- Avoid storing image files or rendered screenshots.
- Keep the initial artwork collection small.
- Avoid unnecessary copies of identical drawing data.
- Preserve only the version history needed for the experience.
- Test the actual shared-state size using the completed seed drawings and realistic contributions.

The room's retention is sufficient for the class project, even if the collection eventually expires.

### Anonymous participation

Neither experience requires participants to create an account or enter a username.

No public contributor names or identities will be displayed.

The Group version only needs to know the shared drawing and session information.

The Worldwide version only needs enough information to manage contributions, versions, and artwork selection.

If internal identifiers are required to distinguish simultaneous contributions, they should not be presented as public identities.

### Important synchronization distinction

Not every interaction needs to be shared.

The main artwork, version history, counters, and shared drawing settings must synchronize through p5-phone Share.

Temporary visual interactions, such as the individual preview when someone pops a version bubble, can remain local to that phone.

The position and movement of ordinary floating bubbles can also remain local. The collective counter is shared, so each successful empty-bubble pop updates the shared count.

The same principle applies to Worldwide artwork bubbles: their visual positions can be local, while the artwork they open must come from the shared Worldwide collection.

## Limits

- Use only the existing p5-phone Share server and `a1-glade` room.
- Do not introduce another server, external database, or third-party storage service.
- Keep one public GitHub Pages link with a Group/Worldwide selection screen.
- Keep the Group and Worldwide shared data completely separate.
- There will only be one Group room and one active group at a time.
- Do not introduce group creation, room codes, or multiple group sessions.
- Do not add accounts, usernames, or public contributor identities.
- The project only needs to remain functional for the remainder of the semester.
- The Worldwide collection should remain small, with approximately thirteen artworks or fewer expected.
- Only drawings and written prompts are included in the Worldwide version.
- Do not add voice recordings, videos, image uploads, or other media types.
- The Group version should continue using manual turn-taking.
- Do not automatically assign participants or introduce a complicated turn-management system.
- Group version bubbles are for viewing previous versions only. They cannot restore or overwrite the current drawing.
- Worldwide floating bubbles represent other artworks or empty popping bubbles, not version history.
- The Group and Worldwide counters must remain separate.
- The Group counter resets when a new group session starts.
- The Worldwide counter accumulates and does not reset when individual participants leave.
- The Group End Session action must not clear Worldwide data.
- The drawing should continue using normalized stroke coordinates.
- Zoom must not permanently modify the artwork.
- The drawing remains centred when zoomed. Do not add panning.
- Brush colour and brush size are shared settings in the Group experience.
- Phone tilt only adjusts brush size while the brush-size adjustment interaction is active.
- The Worldwide version should allow multiple people to receive the same artwork.
- Prioritize preserving separate contributions, but accept last-write-wins conflicts if they cannot be avoided with the existing Share system.
- Keep the code understandable and commented so I can follow and troubleshoot it.
- Preserve existing working functionality wherever possible.
- Do not make unrelated visual or structural changes.
- Work in small, testable steps. Complete one step, explain the changes, and wait for me to test before moving to the next.
- I will manually copy, paste, test, and upload all code to GitHub. Do not commit or upload anything on my behalf.

## How I will check it

### On my laptop

- The opening screen displays correctly.
- GROUP and WORLDWIDE lead to the correct experiences.
- Both experiences use the same public link.
- The Group and Worldwide data remain separate.
- The shared room connects successfully.
- The Group drawing appears correctly.
- The version counter and turn count update.
- The drawing tools appear and function.
- The colour selection works.
- The brush-size button opens the adjustment interaction.
- The zoom buttons work.
- Previous version bubbles display the correct drawings.
- Version previews show the correct version number.
- Regular bubbles pop and get replaced.
- The Group counter increases.
- The End Group Session button resets the Group data.
- Worldwide artwork selection works.
- Written prompts appear correctly.
- Contributions create new versions.
- New drawings can be added to the collection.
- Artwork bubbles open the correct drawings.
- The Worldwide counter increases.
- The thank-you ending screen appears when someone finishes without contributing.
- There are no major console errors.

### On multiple phones

**Group:**

- All phones connect to the same `a1-glade` room.
- Everyone sees the same current drawing.
- New contributions appear on every phone.
- Version numbers update consistently.
- The shared colour and brush-size settings update across phones.
- Zoom works without permanently altering the drawing.
- Phone tilt changes brush size only when the adjustment interaction is active.
- Version history bubbles appear after new versions are created.
- Popping a version bubble only displays a preview on the phone that popped it.
- Other participants continue seeing the current artwork.
- Regular bubble pops update the collective counter.
- Ending the Group session clears Group data without affecting Worldwide data.

**Worldwide:**

- Multiple phones receive artworks from the same Worldwide collection.
- Participants can receive the same artwork.
- Existing drawings can be viewed and contributed to.
- Contributions are saved as new versions.
- New drawings can be created from prompts.
- Written prompts can be received by other participants.
- Artwork bubbles open the correct artwork.
- Participants can move between artworks.
- Contributions do not require usernames.
- The version number updates correctly.
- The Worldwide bubble counter is consistent across phones.
- The Worldwide collection remains available when participants leave and rejoin during the retention period.

### During the playtest

**Group:**

- Observe whether people understand the drawing tools.
- See whether participants use the colour options to distinguish contributions.
- Observe whether the brush-size adjustment using phone tilt is intuitive.
- See whether people use zoom to find more room to contribute.
- Observe whether participants notice and pop previous version bubbles.
- Ask whether seeing previous versions changes how they approach the current drawing.
- Observe whether people continue using regular bubbles while waiting.
- Record the collective bubble-pop counter and whether it encourages interaction.

**Worldwide:**

- Observe what participants do when they first receive a randomized drawing.
- See whether they choose to contribute or move on.
- Observe how they respond to written prompts.
- See whether they create new drawings or prefer building on existing ones.
- Observe whether people discover and open other artworks through floating bubbles.
- Record whether the idea of leaving something behind is understandable.
- See whether participants understand the anonymous nature of the experience.
- Observe whether the version counter helps communicate the history of an artwork.
- Record any technical issues involving simultaneous contributions or shared data.

## Current implementation

The existing repository is a p5.js phone project using p5-phone 1.15.0.

The main current files include:

- `index.html` — Loads the p5.js environment and sketch.
- `sketch.js` — Contains the current collaborative drawing prototype.
- `plan.md` — Project description, decisions, limits, and development steps.
- `references/` — Reference images and visual material.
- `AGENTS.md` — Instructions for coding agents.

The current `sketch.js` already includes:

- Responsive phone-sized canvas.
- Shared circular drawing area.
- p5-phone Share connection.
- Shared drawing strokes.
- Normalized drawing coordinates.
- Finger drawing on mobile.
- MY TURN, FINISH, and PASS buttons.
- Shared version and turn counters.
- Connection status.
- Floating bubbles that move around the screen.
- Individual bubble-pop animations.
- Persistent room configuration through `keep: true`.

The existing shared setup is:

- Host: `https://p5-phone-share.npuckett.workers.dev`
- Room: `a1-glade`
- App: `bubble-pop`

The current shared state contains:

- `strokes`
- `version`
- `turnCount`
- `lastAction`

The existing drawing system stores points, colours, and stroke thickness rather than rendered images.

The current waiting bubbles are generated locally on each phone. Their positions and pop animations are not shared, although the updated version will introduce shared counters.

The current prototype has been tested with five participants using their own phones. They successfully received and contributed to the same drawing.

The previous playtest revealed that participants were conscious of the amount of space remaining in the drawing, adapted to the first person's contribution, and wanted more drawing options. Participants also suggested version history, different artwork bubbles, and a collective bubble-pop counter.

These findings are the basis for the next development stage.

The current sketch does not yet include the two-mode entry screen, the separate Worldwide collection, brush controls, zoom, visual version history, or the new counters.

## Changes and next steps

The next development stage will focus on completing both versions without making the system unnecessarily complicated.

### Group changes

- Add a starting screen or mode selection that leads into the Group experience.
- Preserve the existing shared drawing and manual turn-taking system.
- Add a selection of coordinated rainbow drawing colours.
- Add shared brush-size controls.
- Add a brush-size button and tilt-controlled slider.
- Add plus and minus zoom buttons.
- Preserve normalized coordinates and centred drawing behaviour.
- Save a snapshot of the artwork after each successful contribution.
- Add previous version bubbles to the floating bubble system.
- Add individual version previews with a version label and temporary background dimming or blur.
- Keep ordinary empty bubbles alongside version bubbles.
- Add the collective Group bubble-pop counter.
- Add an End Group Session button.
- Ensure the Group reset does not affect Worldwide data.

### Worldwide changes

- Add the Worldwide entry option.
- Create a small initial collection of approximately three to five seed drawings.
- Support approximately thirteen artworks or fewer during the playtest.
- Add artwork identifiers and separate version histories.
- Add randomized drawing selection.
- Add randomized written prompt selection.
- Add CONTRIBUTE and NEXT options.
- Add the drawing interface for contributing to existing artwork.
- Allow participants to create new drawings based on prompts.
- Add the ability to save new drawings and written prompts.
- Add floating artwork bubbles that open other pieces of media.
- Keep empty popping bubbles alongside artwork bubbles.
- Display the current artwork's version number.
- Add the collective Worldwide bubble-pop counter.
- Add a thank-you ending screen for participants who finish without contributing.
- Handle simultaneous contributions as safely as possible using the existing Share system.

### Shared application changes

- Add one opening screen with Group and Worldwide options.
- Organize shared state into separate Group and Worldwide sections.
- Preserve the existing Share host, room, and app identifiers.
- Ensure switching experiences does not clear the other experience's data.
- Keep the overall interface consistent between the two modes.
- Maintain anonymous participation.
- Keep the project compatible with GitHub Pages and the existing phone setup.

## Steps

Development should happen one step at a time. After each step, the code should be tested before moving forward. I will manually copy and paste the code into my project and upload it to GitHub.

### Step 1 — Inspect and establish the existing code

Read the current `sketch.js`, `index.html`, and relevant p5-phone Share documentation.

Understand the existing drawing system, shared state, turn-taking, bubble animations, and layout before making changes.

Preserve the working Group prototype as the starting point.

Do not replace working functionality unnecessarily.

### Step 2 — Establish the two-mode application

Create the opening screen with GROUP and WORLDWIDE options.

Set up separate code paths and shared-state sections for the two experiences.

Keep the existing server, room, and app identifiers.

Test that switching between modes works and that neither experience interferes with the other.

### Step 3 — Update the Group drawing tools

Add the rainbow-inspired colour palette.

Add the brush-size button and tilt-controlled slider.

Make brush colour and brush size shared settings.

Add plus and minus zoom controls.

Test the drawing tools on actual phones, including the tilt interaction.

### Step 4 — Add Group version history

Save the current drawing before each successful contribution updates it.

Keep previous versions available as view-only records.

Add version history bubbles to the existing floating bubble system.

Create the preview interaction with the enlarged bubble, background dimming or blur, version number, timed display, and pop animation.

Test that previews are individual and never replace the current shared drawing.

### Step 5 — Add Group bubble counter and session reset

Add a shared Group bubble-pop counter.

Make sure only regular empty bubble pops increase the count.

Add an End Group Session button that clears the Group section of shared data.

Test that the next session starts with a blank drawing, no previous versions, and a counter of zero.

Ensure Worldwide data remains unchanged.

### Step 6 — Build the Worldwide collection

Create the initial Worldwide artwork collection using a small number of seed drawings.

Organize the shared data so each artwork has its own ID, current drawing, version number, and saved versions.

Add written prompt records.

Keep the collection small and lightweight.

Test that the collection can be accessed from multiple phones through the existing Share room.

### Step 7 — Build the Worldwide starting experience

Add randomized artwork and prompt selection.

Create the initial artwork viewing screen.

Add CONTRIBUTE and NEXT.

Make sure the participant can view an artwork before deciding whether to contribute.

Test the different entry paths.

### Step 8 — Add Worldwide contributions

Allow participants to add to an existing drawing.

Save each contribution as a new version.

Make the newest accepted version available to future participants.

Add the option to create a new drawing from a written prompt.

Allow participants to leave written prompts for others.

Test blank submissions and the thank-you ending screen.

### Step 9 — Add Worldwide floating bubbles

Create floating bubbles containing other randomized artworks.

Allow participants to pop these bubbles and open another artwork.

Keep ordinary empty bubbles as a separate type of interaction.

Do not display version history inside Worldwide floating bubbles.

Test moving between multiple artworks.

### Step 10 — Add Worldwide bubble counter

Create a shared Worldwide counter.

Increase it whenever someone pops a regular empty bubble.

Ensure the count is visible across multiple phones and is not reset when individual participants leave.

Keep it completely separate from the Group counter.

### Step 11 — Test both experiences together

Test both modes using the same public link and shared room.

Check that:

- Group and Worldwide data remain separate.
- Both experiences can be entered and used.
- Switching modes does not clear saved data.
- Group resets do not affect Worldwide.
- Worldwide contributions do not affect Group.
- Both counters behave correctly.
- Artwork and versions synchronize across phones.
- The collection remains within a manageable shared-state size.
- The experience works on actual phones, not just a laptop.

### Step 12 — Final playtest preparation

Prepare the final GitHub Pages link.

Create the initial Worldwide drawings and written prompts.

Test the opening screen, both experiences, drawing tools, bubble interactions, counters, and reset behaviour.

Make sure the application is understandable without extensive instructions.

Record any limitations that remain, particularly around simultaneous Worldwide contributions and shared-state retention.

## Public Horizon

The larger idea behind Bubble Pop is an anonymous communication system where people can leave something behind for another person to discover.

Instead of communicating through direct messages or conventional social media, participants interact with pieces of media that move between people and change over time.

The Group version explores how people can collectively develop one piece of media, even when they are using separate phones and taking turns.

The Worldwide version explores how this idea can extend beyond a particular group, allowing people to discover and contribute to an anonymous collection of drawings and prompts.

The project is inspired by the idea of *Exquisite Corpse*, where multiple people contribute to a creative work that develops beyond the intentions of any one individual.

However, Bubble Pop also introduces the idea of discovering existing work, choosing whether to contribute, leaving something behind, and exploring other pieces of media through unexpected interactions.

The floating bubbles are an important part of this experience. They create a playful way of discovering previous versions or completely different pieces of media, while the act of popping them becomes another form of interaction.

The project does not need to become a permanent or large-scale communication platform for this stage. The goal is to test the core experience with a manageable group and a small worldwide collection, using the existing p5-phone Share infrastructure.

Ultimately, Bubble Pop explores how something small left behind by one person can become something different through the contributions and discoveries of others.
