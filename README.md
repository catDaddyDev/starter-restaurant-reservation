# Capstone: Restaurant Reservation System

> You have been hired as a full stack developer at _Periodic Tables_, a startup that is creating a reservation system for fine dining restaurants.
> The software is used only by restaurant personnel when a customer calls to request a reservation.
> At this point, the customers will not access the system online.
## Existing files

This repository is set up as a *monorepo*, meaning that the frontend and backend projects are in one repository. This allows you to open both projects in the same editor.                                  |

## Database setup

// back-end .env example -> Connects to database
DATABASE_URL=enter-your-production-database-url-here
DATABASE_URL_DEVELOPMENT=enter-your-development-database-url-here
DATABASE_URL_TEST=enter-your-test-database-url-here
DATABASE_URL_PREVIEW=enter-your-preview-database-url-here
LOG_LEVEL=info

// front-end .env example -> Connects to server
REACT_APP_API_BASE_URL=http://localhost:5000
## Installation

1. Fork and clone this repository.
2. Run `npm install` to install project dependencies.
3. Run `npm start` to start server.
#### Screenshots

![Dashboard](/images/dashboard.png "Dashboard")
![Create Reservation](/images/new_reservation.png "Create Reservation")
![Edit Reservation](/images/edit_reservation.png "Edit Reservation")
![New Table](/images/new_table.png "New Table")
![Search](/images/search.png "Search")