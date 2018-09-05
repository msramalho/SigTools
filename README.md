<p align="center">
 <a href="https://chrome.google.com/webstore/detail/sigarra-to-calendar/piefgbacnljenipiifjopkfifeljjkme">
  <img src="icons/icon-512.png" width="128"/>
 </a>
</p>
<h1 align="center"> <strike>SigToCa</strike> SigTools- Sigarra Tools</h1>

**Sigarra on Steroids**: export calendar events (timetables, events, book renewal, payments, ...); infinite scroll; export, filter and sort data-tables; statistical analysis on grades; library book renewal; configurable behaviour and more. *SigToCa's heir*

### Install via:
 - [Chrome WebStore](https://chrome.google.com/webstore/detail/sigarra-to-calendar/piefgbacnljenipiifjopkfifeljjkme)
 - [Firefox Addons](https://addons.mozilla.org/en-US/firefox/addon/sigarra-to-calendar/) Thanks a bunch to [@afonsobspinto](https://github.com/afonsobspinto)
 - [Source code](https://developer.chrome.com/extensions/getstarted#unpacked) in this repo
 - From [.crx](https://github.com/msramalho/SigTools/blob/master/extra/SigTools.crx) see how [here](https://www.wikihow.com/Add-Blocked-Extensions-in-Google-Chrome) (not necessarily blocked as the link says)

### Features:
Most features are customizable and can be turned off in the options page.

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

#### Datatables
Any Sigarra data-table is now:
 - exportable (copy-paste, csv, excel, pdf)
 - sortable by any column
 - searchable by a query box

#### Infinite Scroll
 - Any page that has paginated tables now has infinite scroll (example: search for MIEIC students)


### Calendars are exported to
[iCalendar](https://en.wikipedia.org/wiki/ICalendar) *.ics* format which means most applications handle it pretty well:
 - [Google Calendar](https://support.google.com/calendar/answer/37118?hl=en)
 - [Apple Calendar](https://support.apple.com/guide/calendar/import-or-export-calendars-icl1023/mac)
 - IBM Lotus Notes
 - Yahoo! Calendar
 - Evolution (software)
 - eM Client
 - Lightning extension for Mozilla Thunderbird and SeaMonkey
 - [partially] by Microsoft Outlook and Novell GroupWise


### Prints

<h3 align="center">TimeTable</h3>
<p align="center">
 <img align="center" src="https://i.imgur.com/txYvHyI.png" width="80%" height="80%">
</p>

<h3 align="center">Exams</h3>
<p align="center">
 <img align="center" src="https://i.imgur.com/nIDrtKb.png" width="80%" height="80%">
</p>

<h3 align="center">Moodle</h3>
<p align="center">
 <img align="center" src="https://i.imgur.com/dL5wsY7.png" width="35%" height="35%">
</p>

<h3 align="center">Datatable</h3>
<p align="center">
 <img align="center" src="https://i.imgur.com/OpOzlic.png" width="80%" height="80%">
</p>

<h3 align="center">Infinite Scroll</h3>
<p align="center">
 <img align="center" src="https://i.imgur.com/A5okMWU.png" width="80%" height="80%">
</p>

<h3 align="center">Grades Statistics</h3>
<p align="center">
 <img align="center" src="https://i.imgur.com/55phyYC.png" width="80%" height="80%">
</p>

### Performance
It was developed to be as non-intrusive as possible, requires no permission, only executes processes when it needs to and all the scripts are loaded after the pages are ready so as to minimize any interface performance impact!

A thanks to...  [ics.js](https://github.com/nwcell/ics.js) | [FileSaver.js](https://github.com/eligrey/FileSaver.js) | [Blob.js](https://github.com/eligrey/Blob.js) | [mustache](https://github.com/janl/mustache.js/) | [chart.js](https://github.com/chartjs/Chart.js) | [math.js](https://github.com/josdejong/mathjs/) for saving us a lot of time!


# Contribute to SigTools
You can contribute by:
 - Identifying and reporting [issues](https://github.com/msramalho/SigTools/issues)
 - Fixing bugs - fork + branch + pull request
 - Adding more [modules/extractors](https://github.com/msramalho/SigTools/tree/master/js/extractors) each module should address a different calendar need
 - Sharing this Extension

## Code structure
 * `extractors` for all the scripts that extract information from a page and act accordingly
 * `lib` for external scripts
 * `scripts` for the JS scripts that are atomic or that are used for an `hmtl` page
 * `utils` for functions that are reused among the `extractors` and other scripts

In the [manifest.json](manifest.json) file, in the `content_scripts` section, there is an initial match to load all the global scripts and then, for each page, each extractor is loaded.

### Extractors code
```javascript
class NewExtractor extends Extractor{
    constructor() {
        super();
        ...
        this.ready(); // this will trigger init and then attachIfPossible
    }
    //must implement: structure, attachIfPossible
    structure() { return {...} }
    attachIfPossible() {...}
    ...
}
// All the functions that are used by this script but do not
// belong to the class definition should follow the above line
...
```
The `structure()` method should return an object that describes the extractor, following this stub:
```javascript
{
    extractor: "the name of the extractor", // must be unique among extractors
    description: "a simple description of what it does",
    parameters: [{//a list of the parameters that can be used ny users
            name: "name of the parameter",
            description: "either describe or exemplify"
        }
        //... other parameters
    ],
    storage: { // the variables to save for this extractor (in the local storage)
        text: [ //variables that should be displayed and edited in <input type="text">
            {
                name: "the name of the variable, eg: title",
                default: "The default value, eg: [${acronym}] - ${room.name}"
            }
        ],
        textarea: [ //variables that should be displayed and edited in <textarea></textarea>
            {
                name: "description",
                default: "another description - can have <strong>HTML</strong> inside"
            }
        ],
        boolean: [ //variables that should be displayed and edited in <input type="checkbox">
            {
                name: "isHTML",
                default: true
            }
        ]
    }
}
```

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
    - Adapted to sigarra's (fuzzy) way of using classes in tables for the exam extractor
    - Only display exam tables if they have at least one event
    - Make one-click link (for the timetable extractor) obey recurrence of events specified in the page (previously the event was non-recurring even if it actually was). Thanks to [@sergioalmeida13](https://github.com/sergioalmeida13)
    - Icons have been properly defined in the manifest
 - V1.6
    - Fixed date parsing in text string like "Semanas de X a Y", most likely to appear in POST requests to https://sigarra.up.pt/feup/pt/hor_geral.estudantes_view (when there is no side-table with the time intervals)
 - V1.7
    - Detection for overlapping classes in the timetable extractor. Thanks to [@Dannyps](https://github.com/Dannyps)
 - V1.8
    - Minor updates on the overlapping classes
    - One-click Outlook.com integration for all extractors 🎉 (only for non-beta Outlook). All props go to [@fabiodrg666](https://github.com/fabiodrg666)
    - .1 - bug fix in overlapping classes
 - V2.0
    - ~SigToCa~ -> SigTools
    - complete refactor
    - each extractor describes itself
    - options page is dynamic and varies according to extractors
    - simplified manifest
    - better organization of scripts into folders
    - started using [mustache](https://github.com/janl/mustache.js/) templates
    - options page
    - changelog page when installed or updated
