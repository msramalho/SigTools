# SigToCa - Sigarra To Calendar
Automatically add Sigarra Timetables to your Calendar Apps

### Install via:
 - [WebStore]()
 - [Source code](https://developer.chrome.com/extensions/getstarted#unpacked) in this repo
 - [from .crx](https://www.wikihow.com/Add-Blocked-Extensions-in-Google-Chrome) (not necessarily blocked as the link says)
 
 ### Works on:
  - Personal schedule 
  - Teacher schedule, try ... [Ademar](https://sigarra.up.pt/feup/pt/hor_geral.docentes_view?pv_doc_codigo=231081)
  - Subject schedule, try ... [RCOM](https://sigarra.up.pt/feup/pt/hor_geral.ucurr_view?pv_ocorrencia_id=399898)
  - Any other schedule (from sigarra, not just feup) that respects the major formats found
 
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
 1. Navigate to any Sigarra page with a timetable and, if it is recognized by SigToCal, a button will appear next to the table
 2. Click that button and choose, from the list of detected events, the ones you want to save
 3. Click the Download button and an *.ics* file will be downloaded to your computer
 4. Go to your calendar app and upload that file to any calendar and that's it!

**Important**: This extension not only identifies the events in the page but, in the case of recurring events like classes, generates the *.ics* file in accordance to the time range specified in the page!
 
### Prints


### Performance
It was developed to be as intrusive as possible, requires no permission, only executes processes when it needs to and all the scripts are loaded after the pages are ready so as to minimize any interface performance impact!


#### Props go to...
 - [ics.js](https://github.com/nwcell/ics.js)
 - [FileSaver.js](https://github.com/eligrey/FileSaver.js)
 - [Blob.js](https://github.com/eligrey/Blob.js)
