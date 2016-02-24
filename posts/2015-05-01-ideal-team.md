---
title: My Ideal Tech Team
---

This what I consider to be the perfect software development team for creating products for the web.

##People

- **1 Product Manager and/or 1 Project Manager**   
  These could be two people who manage together, or one person who fills both roles. One should be the product owner with the vision for where the project needs to go. One should be responsible for keeping the team on task, resolving conflicts, and providing the engineers with everything they need to do their jobs well.

- **1 UX Engineer / Designer**   
  This person drives the overall appearance of the application. They provide either mockups or markup for the front-end appearance of the application as part of each major unit (aka, story) of work.

- **1 Lead Engineer / Architect**   
  This person is responsible for the structuring and maintenance of the code being written. They should be spending the majority of their time overseeing the code being written by the other developers, and creating the foundations that the other developers will build against. They should be the most broadly experienced member on the team, with knowledge of the full stack, and they should be the first person writing code on the project. They should be highly pragmatic and open to outside opinions, not afraid to change their mind on best solutions, but also be confident with their choices.

- **1-2 Senior Engineers***   
  The senior engineers should be the Lead's left and right hands. Their primary job is to build the systems that the junior developers don't have the experience or knowledge to properly construct, and to teach the junior developers. They should be comfortable working in both sides of the stack, even if they specialize in one area.  Seniors should be opinionated, but willing to defer to the Lead's judgement.

- **1-3 Junior Engineers**   
  The junior developers will be the most opinionated and the most specialized, but least experienced.  Ideally you want a diversity of opinions here, but that shouldn't keep you from hiring good people.

- **1-2 QA Engineers**

Any more than this and the team starts to experience communication issues. Fewer than this and you will either have some people pulling too much weight, or parts of your infrastructure will be hurting.

This should be the entire team for the project being developed, not a vertically sliced sub-team of a project group working in the same codebase. Vertical slices _always_ result in code confusion and dependency jams between teams.  If a project is too large for a team of this size then it should be divided into smaller distinctly separate project teams (such as separate services layers, or separate sub-applications).

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

- **Ticket Workflow:**   
  1. Backlog
  2. In Progress
  3. Pending Code Review
  4. Ready For QA
  5. Completed
  6. Deployed
  
  Movements between processes should result in automated git merges, if possible

- **CI Process:**   
  At a minimum there should be some kind of automated testing suite running for every release, and test failures should block releases to any environment.

  Travis or Codeship (Jenkins can DIAF, Drone seems to be more trouble than it's worth).

- **Github w/ Pull Requests**   
  Git-flow style workflow. Every PR gets reviewed by at least two other teammates before acceptance. PRs should be connected to the CI process for automated testing.

---

*I'll probably edit this post a few times as I think of new things*