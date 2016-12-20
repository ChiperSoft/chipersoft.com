---
title: My Ideal Tech Team
---

This what I consider to be the perfect software development team for creating products for the web. This is a living document, edited regularly as I gain experience and discover what does and doesn't work.

## People

- **1 Product Manager and/or 1 Project Manager**   
  These could be two people who manage together, or one person who fills both roles. One should be the product owner with the vision for where the project needs to go. One should be responsible for keeping the team on task, resolving conflicts, and providing the engineers with everything they need to do their jobs well.

- **1 UX Engineer / Designer**   
  This person drives the overall appearance of the application. They provide either mockups or markup for the front-end appearance of the application as part of each major unit (aka, story) of work.

- **1 Lead Engineer / Architect**   
  This person is responsible for the structuring and maintenance of the code being written. They should be spending the majority of their time overseeing the code being written by the other developers, and creating the foundations that the other developers will build against. They should be the most broadly experienced member on the team, with knowledge of the full stack, and they should be the first person writing code on the project. They should be highly pragmatic and open to outside opinions, not afraid to change their mind on best solutions, but also be confident with their choices.

- **1-2 Senior Engineers**   
  The senior engineers should be the Lead's left and right hands. Their primary job is to build the systems that the junior developers don't have the experience or knowledge to properly construct, and to teach the junior developers. They should be comfortable working in both sides of the stack, even if they specialize in one area.  Seniors should be opinionated, but willing to defer to the Lead's judgement.

- **1-3 Junior Engineers**   
  The junior developers will be the most opinionated and the most specialized, but least experienced.  Ideally you want a diversity of opinions here, but that shouldn't keep you from hiring good people.

- **1-2 QA Engineers**   
  The QA engineers should be responsible for manual QA testing, creating QA acceptance tests & end-to-end tests, and recognizing gaps in mid-level testing. Note, the QA engineers should _not_ be responsible for unit and integration tests. This is a position that may not be needed until an application is launched and receiving customers.

Any more than this and the team starts to experience communication issues. Fewer than this and you will either have some people pulling too much weight, or parts of your infrastructure will be hurting. Depending on the scaling demands of the company it may also be necessary to have a dedicated DevOps Engineer to manage the server environments.

This should be the entire team for the project being developed, not a vertically sliced sub-team of a project group working in the same codebase. Vertical slices _always_ result in code confusion and dependency jams between teams.  If a product is too large for a team of this size then it should be divided into smaller distinctly separate project teams (such as separate services layers, or separate sub-applications).

If this team is formed within an existing organization, at least half of the developers *and the manager* should have been previously part of that organization. This is to ensure that the product meets existing standards within the company, and to avoid duplication of mistakes from previous company projects.  **This is vital for greenfield rebuilds.**

## Organization and Tools

- **Fully remote**   
  Even if some of the members are in the same office, all communication should be done online.  This keeps everyone on the same level and avoids accidental lapses in discussion.

- **Kanban, not Scrum.**   
  Product Manager and UX Designer create tickets in the backlog, ordered by priority. Engineers pull tickets out of the backlog as they complete tasks, according to their availability and experience. *No sprints.*

- **Bi-weekly Update Meetings, not standups**   
  These are not status updates, these meetings are not for the managers. The purpose of these meetings should be to describe the code that has been contributed since the last meeting and to discuss the direction of code to be written in the next few days. Note, these are also not code reviews, descriptions should be general, not specific. Code should only be presented if a detail needs to be discussed.

- **Semi-weekly Backlog Grooming**   
  Entire team meets for a few hours to review the backlog (over lunch if possible). Tickets added since the last meeting get sized, prioritized and fleshed out with details. Some tickets get pre-assigned if it covers an area that certain people are more familiar with.

- **Slack for team communication, Screenhero for pairing, Talky.io for video**   
  Slack is a no brainer, even in fully local teams Slack is critical to workflows. Screenhero was bought by Slack a few years ago and works _wonderfully_ for pair programming and even just voice calls. Talky.io has worked excellently for video conversations every time I've used it, and it supports screen sharing if needed.

  You may be asking why I would not suggest Google Hangouts.  I've been using hangouts for years, and I'd like to say it's an old reliable, but it isn't. Hangouts constantly has problems where it just inexplicably fails to work. The codecs that it uses for video and audio are awful, and if you're running on wifi it frequently fails entirely. The audio processing trips all over itself if more than one participant is making any noise (not just talking), and any echo in a room causes the audio to cancel out completely. Plus it is a massive CPU and memory hog.

- **Github w/ Pull Requests**   
  Git-flow style workflow. Every PR gets reviewed by at least two other teammates before acceptance. PRs should be connected to the CI process for automated testing.

- **Ticket Workflow:**   
  1. Backlog
  2. In Progress
  3. Pending Code Review
  4. Ready For QA
  5. Ready To Deploy
  6. Deployed

  Notably absent is any kind of "Prioritized" step. As there are no sprints, there is no need to mark tickets as being ready to work on. If it's in the backlog, it's ready to be worked on.

- **CI Process:**   
  At a minimum there should be some kind of automated testing suite running for every release, and test failures should block releases.

  Travis or Codeship (Jenkins is meh, Drone is more trouble than it's worth).

- **Testing methodology:**   
  Value integration tests over unit tests. Write unit tests for distinct modules with many inputs and outputs, but if an integration test can fully cover it then a unit test is likely overkill. Code coverage metrics are a tool to show areas not being exercised, not a metric of test quality, and 100% coverage is not time well spent (aim for 90% statement coverage, settle for 85%). If team members wish to use TDD, that is their prerogative, but not a requirement by the team.
