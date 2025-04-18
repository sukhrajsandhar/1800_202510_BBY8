
# StreetSmart

## Overview

StreetSmart is a community-driven navigation web application that enables users to report, view, and share municipal issues and emergency incidents in real time. It aims to enhance commuter safety and efficiency by connecting users with local government services and emergency responders.

StreetSmart addresses the lack of real-time, crowd-sourced reporting on road conditions, hazards, and municipal issues such as potholes, broken streetlights, and traffic incidents. It empowers users to stay informed and avoid dangerous or inconvenient routes by displaying community-submitted reports on a live map.

Developed for the BCIT CST 1800 Projects 1 course, applying User-Centred Design practices, agile project management processes, integrating a Live Map API, and Firebase backend services.

---

## Features

Live Map Integration: Real-time updates of user-submitted reports using the Mapbox API.

Live Location Tracking: Allows users to view their current position and nearby reports.

Report Creation: Users can submit incidents including traffic, police activity, hazards, and infrastructure issues.

Report Sharing: Enables report sharing through copied links and social media.

User Authentication: Secure login with Firebase to manage accounts and personalize experiences.

Profile Customization: Includes features like profile picture updates and report history.

---

## Technologies Used

Frontend: HTML5, CSS, Bootstrap, JavaScript

Design: Figma (UI/UX prototyping)

Backend: Firebase (authentication, database)

Project Management: Trello (task tracking), Discord (team communication)

API: MapBox API (live maps, location tracking)

---

## Usage

1. Open your browser and visit `https://streetsmartbcit.web.app/`.
2. Proceed to Sign In or Sign Up for StreetSmart.
3. View the Live Map with Home Page with Road Problem Report Icons displayed.
4. View the Profile Page to customize User Account Information.
5. View Reports Page for list of all Road Report and informative details.
6. Create a New Road Report: Report Title, Location, Date, Time, Road Problem Type, Road Problem Summary.
7. View your new Road Report on the Live Map.
8. Share Report with Community by clicking the Share button on given Report.

---

## Project Structure

```
1800_202510_BBY8/
├── .firebase/
│   └── hosting..cache
├── .history/
├── images/
├── node_modules/
│   └── (various packages and dependencies)
├── pages/
│   ├── auth/
│   │   ├── css/
│   │   │   ├── bootstrap/
│   │   │   ├── bootstrap.min.css
│   │   │   └── style.css
│   │   ├── fonts/
│   │   ├── images/
│   │   ├── js/
│   │   ├── scss/
│   │   ├── login.html
│   │   └── signup.html
│   ├── profile/
│   │   ├── Profile.html
│   │   └── update-profile.html
│   └── reports/
│       ├── Reports.html
│       ├── Share-report.html
│       ├── shared-report.html
│       └── view-report.html
├── scripts/
│   ├── config.js
│   ├── firebaseAPI_TEAM08.js
│   ├── location-autofill.js
│   ├── map-markers.js
│   ├── profile-update.js
│   ├── profile-view.js
│   ├── profile.js
│   ├── report.js
│   ├── Reports.js
│   ├── shared-report.js
│   └── view-report.js
├── styles/
│   ├── styles2.css
│   ├── styles3.css
│   ├── styles4.css
│   └── styles5.css
├── .env
├── .firebaserc
├── .gitignore
├── 404.html
├── cors.json
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── index.html
├── main.html
├── package-lock.json
├── package.json
└── README.md
```

---

## Contributors

The project is being developed by a four-member team (Sydney, Sukhraj, Jaden, Wonjun) following Agile methodology with weekly sprints and task management via Trello. Regular meetings with the project client and 1800 Projects 1 Instructor, Carly Orr, helped refine scope, prioritize features, and overcome technical obstacles.

Team Members:

- Sukhraj Sandhar - BCIT CST Student with a passionate about technology and software development, eager to explore coding and programming while building skills for the tech industry.
    
- Jaden Zhang - BCIT CST Student with a passion for software and web development.

- Sydney Jennings - BCIT CST Student who is passionate about technology and balancing problem-solving with creativity.

- Wonjun Jung - IVE PLAYED THESE GAMES BEFORE!!!!!!!!!!!!

---

## Acknowledgments

Example:
- Pages designed with [Bootstrap](https://getbootstrap.com/).
- Icons sourced from [Google](https://fonts.google.com/icons).
- Interactive Map provided by [Mapbox](https://www.mapbox.com/).

---

## Limitations and Future Work
### Limitations

Incomplete Features: Editable and updatable Reports currently not supported.

Limited Social Sharing: Only X integration is currently available.

Web-Only App: Not yet available as a native mobile app.

Scalability Concerns: Free-tier tools may not support long-term growth.

### Future Work

Complete Key Features: Finalize dark mode, navigation, filtering, and safety resources.

Expand Social Integration: Add support for more platforms beyond X.

Enhance UX: Add route history, and bookmarking.

Improve Moderation: Implement tools to verify or filter reports.

Plan for Growth: Upgrade hosting and infrastructure to scale with user base.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
