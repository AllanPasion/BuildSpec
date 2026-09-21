# Week of: September 19, 2026

## My goal this week

My goal this week was to turn my BuildSpec idea into a clear plan before I started coding. Starting a project from scratch is one of the parts of coding that I struggle with most. I am usually more comfortable when I have a guide to follow, so I wanted to create something that could act as my guide once I begin building the application.

I wanted to decide what the app needs, how the user will move between screens, what data each screen will manage, and how the interface should respond on desktop and mobile. I also wanted the documentation to be honest instead of making the app sound like it was already working.

## What I did

I wrote the BuildSpec proposal and limited the first version to four screens: My Garage, the Vehicle Form, the Vehicle Dashboard, and the Modification Form. I listed the dashboard data, including the selected vehicle, modifications, filters, loading state, and error messages.

Next, I created a screen map and desktop and phone wireframes for every screen. I made sure each form had a way to save, cancel, or return to My Garage. I organized the planned React components into atoms, molecules, organisms, and pages. This showed me which pieces should be reused, including buttons, form fields, cards, status badges, and the shared header and footer.

I created a design system using plain CSS, an 8px spacing system, three text sizes, responsive breakpoints, and an accessibility checklist. The palette went through several versions before I settled on my five chosen colors. I also produced a visual PDF showing the palette, contrast results, components, and responsive layouts.

Finally, I created the weekly report and README. The README says that the project is still in planning and does not include fake installation steps, endpoints, features, or screenshots. No React, Express, Prisma, or PostgreSQL code was written this week.

## What blocked me

The workspace was empty, so there was no starter code or project configuration to document. Git and PostgreSQL's `psql` command were also unavailable through the normal PowerShell path.

The first design-system PDF had buttons, inputs, and cards crossing their panel boundaries. The Add Modification button was also too close to the table. I adjusted the widths and spacing and rendered the PDF again to verify the fixes.

Choosing colors took longer than expected because the first palettes did not match what I wanted. The final blue-grey also lacked enough contrast for normal text, so I limited it to borders and decoration.

## What I learned

I learned that planning state and components first makes React feel less confusing. Instead of thinking about the whole application, I can focus on one page, the data it owns, and the smaller components it needs. I also learned that totals and progress should be calculated from modification data instead of stored separately and possibly becoming outdated.

The PDF problems gave me an example of debugging one issue at a time. I identified the element that was too wide, adjusted it, rendered the document again, and checked the result. I want to follow the same process when I start coding.

I use AI for a lot of coding and planning help, but I am trying to understand why each decision is made instead of only copying the result. This week did not include application coding, but it gave me a path to follow. My next challenge is turning the plan into a working React and Express foundation without trying to build everything at once.
