# Calendar Integration Extension for Google Chrome

This is a course requirements for CS191/192 Software Engineering Courses of the Department of Computer Science, College of Engineering, University of the Philippines, Diliman under the guidance of Ma. Rowena C. Solamo for AY 2020-2021.

Antonio, David Albert G.
Mariñas,  Gabriel Kenneth L.
Morco, Michael Bejamin C.
Rule, Camille P.

## Table of Contents
* [Project Description](#project-description)
* [Project Limitation](#project-limitation)
* [Features Checklist](#features-checklist)
* [Installation and Set Up Guide](#installation-and-set-up-guide)

## Project Description

This extension provides a handy interface to manage and view your Google Calendar events wherever you are in the Web.

## Project Limitation

* This project is currently _Work In Progress_. 
* Google Chrome is _currently_ the only supported web browser by this extension. Support for other web browsers
  can be done once most of the extension's important features are implemented. 
* _Check the [Features Checklist](#features-checklist) to be aware of the other features that are not yet currently 
  supported by this extension._

## Features Checklist
- [ ] Sign-in through Gmail to access the extension.
  - [x] Allow _only_ our group members to sign-in via their Gmail account.
  - [ ] Allow _anyone_ with a Gmail account to sign-in.
- [ ] Retrieve events from user's Google Calendar account.
- [x] Main menu interface.
- [ ] Calendar and Events section.
  - [x] Add Month view.
    - [x] Interface for viewing Monthly calendar.
    - [x] Interface for viewing upcoming events this Month.
  - [ ] Add Week view.
    - [ ] Interface for viewing Weekly calendar.
    - [ ] Interface for viewing upcoming events this Week.
  - [ ] Events handling.
    - [ ] Add new event.
    - [ ] Edit existing event.
    - [ ] Delete existing event.
- [ ] Pomodoro section.
  - [ ] Interface for viewing Pomodoro section.
  - [ ] Pomodoro session handling.
    - [ ] Start new Pomodoro session.
    - [ ] Stop current Pomodoro session.

## Installation and Set Up Guide

1. Run `git clone https://github.com/calendar-integration-extension/Calendar-Integration-Extension.git` to your terminal.
2. Open Google Chrome, run `chrome://extensions` in the search bar to open the _Extensions_ page.
3. Within the _Extensions_ page, toggle On the _Developer mode_ found on the top right corner of the page.
4. Press the _Load unpacked_ button on the upper left, which directs you to your file system.
5. Go to the directory where the repo is cloned (done in step 1) and click the folder named `Calendar-Integration-Extension` 
   and press _Select Folder_ to load its contents as a Google Chrome extension.
6. Pressing the 'puzzle piece' button on the top right will list all the currently-installed extensions in your web browser,
   check that _Google Calendar Extension_ is included.
7. You can now use the extension.
