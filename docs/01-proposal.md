# 1. App Proposal — Current BuildSpec

## Purpose and audience

BuildSpec is a personal automotive build archive. A car owner can track several vehicles, plan and record modifications, see what has been paid for and installed, and publish completed builds into a showcase. The current interface uses Philippine peso amounts and is built around one owner's garage; it has no login or separate user accounts.

## Current routes

| Route | Screen | Main task |
| --- | --- | --- |
| `/` | My Garage | View vehicles, installed progress, status counts, spent amount, and next action; add a vehicle. |
| `/showcase` | Completed Builds | Browse explicitly published finished vehicles and open their dashboards. |
| `/vehicles/new`, `/vehicles/:id/edit` | Vehicle Form | Create or edit a vehicle and upload its garage photo. |
| `/vehicles/:id` | Vehicle Dashboard | Review costs and progress, search and manage parts, add a final photo, publish or remove a completed build. |
| `/vehicles/:id/modifications/new`, `/modifications/:modificationId/edit` | Modification Form | Record or revise a part, cost, status, dates, installer, notes, and installed-part photo. |

Unknown client routes redirect to My Garage. The shared header links to Garage and Showcase, shows paid and total parts cost across all builds, and offers a light/dark toggle. On phones, navigation opens in a drawer.

## Data and state

| Data | Current shape or rule | Owner |
| --- | --- | --- |
| Vehicle | `id`, `year`, `make`, `model`, `variant`, `engine`, `transmission`, `color`, `nickname`, `imageUrl`, `finalImageUrl`, publication fields | PostgreSQL through Express API |
| Modification | `id`, `vehicleId`, `name`, `category`, `brand`, `price`, `status`, `purchaseDate`, `installDate`, `installer`, `installImageUrl`, `notes` | PostgreSQL through Express API |
| Status | `PLANNED`, `PURCHASED`, `INSTALLED` | Modification record |
| Loaded results and loading/error state | Garage list or selected dashboard data | Respective React page |
| Dashboard view controls | Search, status, category, sort, expanded phone filters | Vehicle Dashboard component |
| Unsent new-form drafts | Vehicle draft or per-vehicle modification draft | Browser local storage |
| Theme | Light or dark; saved choice or system preference | Browser local storage and root `data-theme` |

Counts, current cost, projected cost, and completion eligibility are derived from modifications. **Current/paid cost** sums Purchased and Installed prices; **projected/all parts cost** sums every price. Installed progress is installed count divided by total count, or 0% when no parts exist. Dashboard results are refetched after changes; the shared header refreshes when a data-change event is sent.

## Main experience

1. Add a vehicle with make, model, and year. Other specifications and a garage photo are optional.
2. Add parts to that vehicle. Name, category, price, and status are required; installed parts also need an installation date. New parts start as Planned.
3. Move a part from Planned to Purchased or from Purchased to Installed directly on its dashboard card. The Installed action opens a dialog for the required date and an optional photo. The edit form can revise any status or detail.
4. Use search, status and category filters, and sorting by recent addition, name, or price. The result counter and Clear filters action reflect the current view.
5. When at least one modification exists, every tracked modification is Installed, and a final build portrait has been saved, publish the vehicle to Completed Builds. Publishing is explicit and reversible. Adding, editing, or deleting a modification removes a published build from the showcase; changing the final portrait also removes it until republished.

The dashboard also supports deleting a modification or vehicle through a confirmation dialog. Deleting a vehicle deletes its related modifications. Loading, empty, error, validation, and success feedback are shown in the interface.

## Implementation and operating context

The current client is React with React Router and plain CSS. It calls an Express API. Prisma stores vehicles and modifications in PostgreSQL; the current private server configuration points to a Supabase PostgreSQL database. Photo uploads are currently files under `server/uploads/`, with their `/uploads/...` paths stored in database records. Accepted formats are JPG, PNG, and WebP, up to 8 MB. Local drafts and the theme preference remain in the browser.

## Current constraint

The server has no user authentication or API authorization. Uploaded photo files have not been moved into Supabase Storage, so a different server must receive those files and use persistent upload storage before a public deployment can reliably display them. This document describes the implemented site, not a claim that it is production ready.
