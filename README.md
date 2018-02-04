
**Important Note:** Since some bugs were found and fixed, an updated version of the extension on the webstore had to be submited, if you don't have the most current version (**1.8.1**) see how to manually update it [here](https://gadgets.ndtv.com/apps/features/how-to-manually-update-google-chrome-extensions-661907). You can also look at the [Changelog](https://github.com/msramalho/SigToCa#changelog) to see the improvements made.

<p align="center">
 <a href="https://chrome.google.com/webstore/detail/sigarra-to-calendar/piefgbacnljenipiifjopkfifeljjkme">
  <img src="https://github.com/msramalho/SigToCa/blob/master/icons/icon-512.png" width="128"/>
 </a>
</p>
<h1 align="center"> SigToCa - Sigarra To Calendar</h1>

Automatically add Sigarra Timetables to your Calendar Apps (using *.ics* format and one-click Google Calendar Event)

### Install via:
 - [WebStore](https://chrome.google.com/webstore/detail/sigarra-to-calendar/piefgbacnljenipiifjopkfifeljjkme)
 - [Add-on for Firefox](https://addons.mozilla.org/en-US/firefox/addon/sigarra-to-calendar/) Thanks a bunch to [@afonsobspinto](https://github.com/afonsobspinto)
 - [Source code](https://developer.chrome.com/extensions/getstarted#unpacked) in this repo
 - From [.crx](https://github.com/msramalho/SigToCa/blob/master/extra/SigToCa.crx) see how [here](https://www.wikihow.com/Add-Blocked-Extensions-in-Google-Chrome) (not necessarily blocked as the link says)

### Works on:

#### Timetable Extractor
 - Personal schedule
 - Teacher schedule, try ... [Ademar](https://sigarra.up.pt/feup/pt/hor_geral.docentes_view?pv_doc_codigo=231081)
 - Subject schedule, try ... [RCOM](https://sigarra.up.pt/feup/pt/hor_geral.ucurr_view?pv_ocorrencia_id=399898)
 - Any other schedule (from sigarra, not just feup) that respects the major formats found

#### Exams Extractor
 - Exams page, try ... [MIEIC](https://sigarra.up.pt/feup/pt/exa_geral.mapa_de_exames?p_curso_id=741)
 - Any other exams page (from sigarra, not just feup) that respects the major formats found

#### Moodle Extractor
 - Hover over a moodle event on the calendar and an option to add to Google Calendar (with One click) becomes available
 - Moodle already has functionality to export events in the iCal format [here](https://moodle.up.pt/calendar/export.php)


### Exports to
[iCalendar](https://en.wikipedia.org/wiki/ICalendar) *.ics* format which means most applications handle it pretty well:
 - [Google Calendar](https://support.google.com/calendar/answer/37118?hl=en)
 - [Apple Calendar](https://support.apple.com/guide/calendar/import-or-export-calendars-icl1023/mac)
 - IBM Lotus Notes
 - Yahoo! Calendar
 - Evolution (software)
 - eM Client
 - Lightning extension for Mozilla Thunderbird and SeaMonkey
 - [partially] by Microsoft Outlook and Novell GroupWise

## Instructions
Here's the general flow of this extension:
 1. Navigate to any Sigarra (Moodle) page with a timetable and, if it is recognized by SigToCa, a blue button (📆) will appear next to the table
 2. Click that button and choose, from the list of detected events, the ones you want to save
 3. Click the Download button and an *.ics* file will be downloaded to your computer
 4. Go to your calendar app and upload that file to any calendar and that's it!

**OR**
 1. Same but where you see the Google Calendar button (<img src="https://github.com/msramalho/SigToCa/blob/master/icons/gcalendar.png" width="24"/>) you can click it to add that event directly to your Google Calendar on the browser.


**Important**: This extension not only identifies the events in the page but, in the case of recurring events like classes, generates the *.ics* file in accordance to the time range specified in the page!

### Prints

<h3 align="center">TimeTable</h3>
<p align="center">
 <img  align="center" src="https://github.com/msramalho/SigToCa/blob/master/extra/imgs/print_timetable_01.png" width="80%" height="80%">
</p>

<h3 align="center">Exams</h3>
<p align="center">
 <img  align="center" src="https://github.com/msramalho/SigToCa/blob/master/extra/imgs/print_exames_01.png" width="80%" height="80%">
</p>


<h3 align="center">Moodle</h3>
<p align="center">
 <img align="center" src="https://github.com/msramalho/SigToCa/blob/master/extra/imgs/print_moodle_01.png" width="35%" height="35%">
</p>


### Performance
It was developed to be as non-intrusive as possible, requires no permission, only executes processes when it needs to and all the scripts are loaded after the pages are ready so as to minimize any interface performance impact!


#### A thanks to...
 - [ics.js](https://github.com/nwcell/ics.js)
 - [FileSaver.js](https://github.com/eligrey/FileSaver.js)
 - [Blob.js](https://github.com/eligrey/Blob.js)

For saving me a lot of time


# Contribute
You can contribute by:
 - Identifying and reporting [issues](https://github.com/msramalho/SigToCa/issues)
 - Fixing bugs - fork + branch + pull request
 - Adding more [modules/extractors](https://github.com/msramalho/SigToCa/tree/master/js/extractors) each module should address a different calendar need
 - Sharing this Extension

# Changelog
 - V1.0
    - MVP, timetable + exams + mooodle
 - V1.1
    - Multiple exam tables on the same page support
 - V1.2
    - Fixed exam pages with wrong exam dates. Thanks to [@G-Pereira](https://github.com/G-Pereira)
 - V1.3
    - Fixed problem in the encoding of html (both on the download and direct links). Thanks to [@G-Pereira](https://github.com/G-Pereira)
 - V1.4
    - Fixed Timetable bug in the first occurrence of a subject that does not start at 8h30. Thanks to [@sergioalmeida13](https://github.com/sergioalmeida13)
    - Fixed GMT problems in chrome import - by using ZULU time
    - Noticed that moodle extractor **only** has information on the day (and not time) of the event
 - V1.5
    - Adapted to sigarra (fuzzy) way of using classes in tables for the exam extractor
    - Only displat exam tables if they have at least one event
    - Make one-click link (for the timetable extractor) obey recurrence of events specified in the page (previously the event was non-recurring even if it actually was). Thanks to [@sergioalmeida13](https://github.com/sergioalmeida13)
    - Icons have been properly defined in the manifest
 - V1.6
    - Fixed date parsing in text string like "Semanas de X a Y", most likely to appear in POST requests to https://sigarra.up.pt/feup/pt/hor_geral.estudantes_view (when there is no side-table with the time intervals)
 - V1.7
    - Detection for overlaping classes in the timetable extractor. Thanks to [@Dannyps](https://github.com/Dannyps)
 - V1.8
    - Minor updates on the overlaping classes
    - One-click Outlook.com integration for all extractors 🎉 (only for non-beta Outlook). All props go to [@fabiodrg666](https://github.com/fabiodrg666)
    - .1 - bug fix in overlaping classes
