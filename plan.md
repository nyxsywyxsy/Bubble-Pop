# Plan: Bubble Pop

## Project

A phone as an unusual communication interface, to experiment with altering and uncovering an anonymous message, for public participants.

This Phase 1 prototype explores an unusual form of communication through a large interactive bubble. The participant is given the instruction "reveal what's hidden" and has to experiment with the phone to discover how the bubble responds.

The larger idea is an anonymous communication system where people can contribute to and change media created by other people without necessarily knowing who originally created it. For this first prototype, I am only testing the interaction with one person and one bubble.

## The question

Does giving the user different options to uncover and interact with the message encourage them to experiment? Will they uncover all the ways of interaction? 
Observing people use this in a playtest and seeing which ways they interacted with the bubble and if they experimented beyond one action  would help me get the evidence to answer this.


## The experience

One person holds a phone with the screen facing them.

The starting screen is mostly occupied by one large, flowy, transparent blue bubble inspired by a real soap bubble. A hidden image of a Minion sits inside the bubble.

The only instruction on the starting screen is:

"reveal what's hidden"

The participant is not told which movement they should use. The goal is for them to experiment with the phone and discover the different responses.

When the phone is slightly tilted, the hidden Minion gradually becomes more visible as its opacity increases.

As the participant tilts the phone further, the Minion becomes increasingly distorted. Its contrast increases significantly and the image begins glitching and dispersing.

If the participant aggressively shakes the phone, the bubble pops and disappears. The Minion also disappears. The remaining output is either the Minion's glasses or a message that says "the bubble is gone." This should make it feel like the Minion itself disappeared with the bubble.

The participant can also tap the screen to contribute something. This opens a drawing interface where they can make a small drawing. If the drawing interface does not work reliably, I will use a text input instead.

After the participant contributes, the prototype displays a message confirming that their contribution has been added. The contribution does not need to actually enter a server or reach another participant in Phase 1.

The people watching should be able to see the participant physically experimenting with the phone and see the bubble respond to their actions.

## Input, transformation, output, fallback

- Input: phone tilt, phone movement/shaking, touch/tap, and drawing or text input.

- Transformation:
  - Slight tilt: gradually increase the image's opacity so it becomes more visible.
  - Further tilt: increase the image contrast and introduce glitching and dispersal.
  - Aggressive shaking: trigger the bubble popping and remove the Minion.
  - Tap: open the contribution interface.
  - Drawing: create a small participant contribution.

- Output:
  - A large transparent blue soap-like bubble.
  - The hidden image gradually becoming visible.
  - Increasing distortion, contrast, glitching, and dispersal as the phone is tilted further.
  - The bubble popping and disappearing after aggressive shaking.
  - "the bubble is gone" after the bubble disappears.
  - A drawing interface and confirmation after the participant contributes.

- Fallback:
  - If motion sensing is unreliable, use a tap interaction as a fallback so the participant can still continue the experience.
  - If the drawing interface does not work reliably, use a simple text input instead.
  - On a laptop, use mouse interaction to mimic movement only where needed for testing. The phone is the main test because the final interaction depends on tilt and shaking.

## References

| File | Use it as | Take | Leave |
|layout-starting.png|a guideline for the starting layout|the overall idea and centering/ layout|the rough lines and writing|
|layout-after-tilt.png|a guideline for how the image will display once revealed|the overall idea and centering/ layout and the mask|the rough lines and text and diagonal lines (will be replaced with the photo - minion.jpg)|
| layout-after-shake.png | a guideline for the animation and text display after an aggressive shake. | the layout and idea as well as text wording | rough lines and writing |


## Limits

- Change only `sketch.js` unless I specifically ask for another file to be changed.
- Keep the prototype focused on one user and one bubble.
- The first prototype does not need a server, database, account system, or real distributed network.
- The participant's contribution does not need to be sent to another person yet.
- Use one pre-made image for the hidden media.
- Keep the main physical interactions to tilt, shaking, and tapping.
- Do not add extra gestures unless they become necessary during testing.
- Drawing is the preferred contribution method. Text is the fallback.
- The larger anonymous communication network is a future development.
- Do not build the full multi-person system for Phase 1.

## How I will check it

- On my laptop:
  - The bubble appears correctly.
  - The image is hidden at the start.
  - The bubble can be interacted with using the available fallback controls.
  - The contribution interface opens.
  - Drawing or text input works.
  - The confirmation message appears.
  - There are no major console errors.

- On my phone:
  - The bubble fills most of the screen and is readable.
  - The bubble looks transparent, blue, flowy, and similar to a soap bubble.
  - Slight tilting gradually reveals the Minion.
  - Further tilting creates stronger contrast, glitching, and dispersal.
  - Aggressive shaking makes the bubble pop and disappear.
  - "the bubble is gone" appears afterward.
  - Tapping opens the contribution interaction.
  - Drawing works, or the text fallback works if necessary.

- During the playtest:
  - Record what participants try first.
  - Record whether they experiment with tilting or shaking.
  - Record whether they discover that different movements have different outcomes.
  - Record whether they understand the instruction "reveal what's hidden."
  - Record whether they try tapping or discover the contribution interaction.
  - Record moments of confusion or unexpected interaction.
  - Record what participants find interesting or unusual.

## Steps


## Changes


## Public Horizon

The larger version of Bubble Pop could become a distributed anonymous communication system.

One participant could create or contribute media to a bubble. The bubble could then be passed to another participant who does not know who originally created it. That person could interact with the bubble, change it, and add something of their own before passing it onward.

Over time, the original media could become changed through multiple people's interactions. Participants would not necessarily know who created the original contribution or what happened to it before they received it.

The system could eventually allow different types of media, such as drawings, text, and voice recordings. A bubble could also potentially circle back to previous participants.

This connects to the idea of *Exquisite Corpse*, where multiple people contribute without seeing the complete work and the final result becomes collectively created.
