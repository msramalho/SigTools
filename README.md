
<p align="center">
 <img src="https://github.com/msramalho/SigToCa/blob/master/icons/icon-512.png" width="128"/>
</p>
<h1 align="center"> SigToCa - Sigarra To Calendar</h1>

Automatically add Sigarra Timetables to your Calendar Apps

### Install via:
 - [WebStore](https://chrome.google.com/webstore/detail/sigarra-to-calendar/piefgbacnljenipiifjopkfifeljjkme)
 - [Source code](https://developer.chrome.com/extensions/getstarted#unpacked) in this repo
 - from [.crx]() see how [here](https://www.wikihow.com/Add-Blocked-Extensions-in-Google-Chrome) (not necessarily blocked as the link says)

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
 1. Navigate to any Sigarra (Moodle) page with a timetable and, if it is recognized by SigToCal, a blue button (📆) will appear next to the table 
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
It was developed to be as intrusive as possible, requires no permission, only executes processes when it needs to and all the scripts are loaded after the pages are ready so as to minimize any interface performance impact!


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
