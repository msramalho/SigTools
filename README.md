<p align="center">
 <a href="https://chrome.google.com/webstore/detail/sigarra-to-calendar/piefgbacnljenipiifjopkfifeljjkme">
  <img src="src/icons/icon-512.png" width="128"/>
 </a>
</p>
<h1 align="center">SigTools - Sigarra Tools</h1>

**Sigarra on Steroids**: export calendar events (timetables, events, book renewal, payments, ...); infinite scroll; export, filter and sort data-tables; statistical analysis on grades; library book renewal; configurable behaviour and more. *SigToCa's heir*

### Install via:
 - [Chrome WebStore](https://chrome.google.com/webstore/detail/sigarra-to-calendar/piefgbacnljenipiifjopkfifeljjkme)
 - [Firefox Addons](https://addons.mozilla.org/en-US/firefox/addon/sigtools/) Thanks a bunch to [@afonsobspinto](https://github.com/afonsobspinto)
 - [Source code](https://developer.chrome.com/extensions/getstarted#unpacked) in this repo
 - From [.crx](https://github.com/msramalho/SigTools/releases/) see how [here](https://www.wikihow.com/Add-Blocked-Extensions-in-Google-Chrome)

### Features
Most features are customizable and can be turned off in the options page.

<p align="center"><img  src="https://i.imgur.com/To7F74T.gif" height="300px"></p>

<details>
<summary>Timetable Extractor</summary>
<p>
<ul>
    <li>Personal schedule</li>
    <li>Teacher schedule, try ... <a href="https://sigarra.up.pt/feup/pt/hor_geral.docentes_view?pv_doc_codigo=231081">Ademar</a></li>
    <li>Subject schedule, try ... <a href="(https://sigarra.up.pt/feup/pt/hor_geral.ucurr_view?pv_ocorrencia_id=399898">RCOM</a></li>
    <li>Any other schedule (from sigarra, not just feup) that respects the major formats found</li>
</ul>
</p>
</details>

<details>
<summary>Exams Extractor</summary>
<p>
<ul>
    <li>Exams page, try ... <a href="https://sigarra.up.pt/feup/pt/exa_geral.mapa_de_exames?p_curso_id=741">MIEIC</a></li>
    <li>Any other exams page (from sigarra, not just feup) that respects the major formats found</li>
</ul>
</p>
</details>

<details>
<summary>Moodle Extractor</summary>
<p>
<ul>
    <li>Hover over a moodle event on the calendar and an option to add to Google Calendar (with One click) becomes available</li>
    <li>Moodle already has functionality to export events in the iCal format <a href="https://moodle.up.pt/calendar/export.php">here</a></li>
</ul>
 -
 -
</p>
</details>

<details>
<summary>Datatables</summary>
<p>
Any Sigarra data-table is now:
<ul>
    <li>exportable (copy-paste, csv, excel, pdf)</li>
    <li>sortable by any column</li>
    <li>searchable by a query box</li>
</ul>
</p>
</details>

<details>
<summary>Infinite Scroll</summary>
<p>
<ul>
    <li>Any page that has paginated tables now has infinite scroll (example: search for MIEIC students)</li>
</ul>
</p>
</details>

<details>
<summary>Grades</summary>
<p>
<ul>
    <li>Every time a teacher releases grades for a subject, you can go to that page and check statistics over your grades and how they compare with the rest of the students.</li>
</ul>
</p>
</details>

<details>
<summary>Bills</summary>
<p>
<ul>
    <li>If you are fast enough, you can go to your 🏃running 💸account (Conta Corrente) and add those debts with their deadline to your calendar, so you don't forget to pay what you own (pagar o que deves)</li>
</ul>
</p>
</details>

<details>
<summary>Book Renewal</summary>
<p>
<ul>
 <li>Never forget to return books again, by going to <a href="https://catalogo.up.pt">catalogo.up.pt</a> and checking that you are not late on those, as it costs 0.50€ per day...</li>
</ul>
</p>
</details>



### Exporting Calendar Events
SigTools exports to [iCalendar](https://en.wikipedia.org/wiki/ICalendar) *.ics* format which means most applications handle it pretty well, namely
<details>
<summary>Compatible Calendar Apps</summary>
<p>
<ul>
    <li><a href="https://support.google.com/calendar/answer/37118?hl=en">Google Calendar</a></li>
    <li><a href="https://support.apple.com/guide/calendar/import-or-export-calendars-icl1023/mac">Apple Calendar</a></li>
    <li>IBM Lotus Notes</li>
    <li>Yahoo! Calendar</li>
    <li>Evolution (software)</li>
    <li>eM Client</li>
    <li>Lightning extension for Mozilla Thunderbird and SeaMonkey</li>
    <li>[partially] by Microsoft Outlook and Novell GroupWise</li>
</ul>
</p>
</details>


### Performance
It was developed to be as non-intrusive as possible, requires minimal permissions, only executes processes when it needs to, and all the scripts are loaded after the pages are ready so as to minimize any interface performance impact!


# Contribute to SigTools
You can contribute by:
 - Identifying and reporting [issues](https://github.com/msramalho/SigTools/issues)
 - Fixing bugs - fork + branch + pull request
 - Adding more [modules/extractors](https://github.com/msramalho/SigTools/tree/master/js/extractors) each module should address a different calendar need
 - Sharing this Extension



<details>
<summary>Contribution guide</summary>
<p>


## Developing with gulp.js and npm
1. fork project
2. run `npm install`
3. run `npm run chrome-watch` or `npm run firefox-watch` or `npm run opera-watch` during development
   1. the way to upload development extensions will vary depending on the browser see below
   2. point it to the correct folder that is maintained with live-reload inside the `build/` folder
4. run `npm run build` when ready for final tests followed by `npm run zip` to create all the zip files (this step is optional in PRs)
5. pull-request once ready (do not include `/build` or `/dist`)



##### Load the extension in Chrome & Opera
1. Open Chrome/Opera browser and navigate to chrome://extensions
2. Select "Developer Mode" and then click "Load unpacked extension..."
3. From the file browser, choose to `my-slack-workspaces/build/chrome` or (`my-slack-workspaces/build/opera`)


##### Load the extension in Firefox
1. Open Firefox browser and navigate to about:debugging
2. Click "Load Temporary Add-on" and from the file browser, choose `my-slack-workspaces/build/firefox/manifest.json`


### Packaging
Run `npm run build` + `npm run zip` to create a zipped, production-ready extension for each browser (atm there seems to be a [strange issue](https://github.com/msramalho/SigTools/issues/76) with `npm run dist`). 
 


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
By default, each extractor that inherits from `Extractor` already has the `storage.boolean.apply` and `storage.text.exclude_urls_csv` options.

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
After developing a new extractor, it should be added to the [options.html](options.html) page as `<script src="js/extractors/NAME.js"></script>` next to the ones already there.

<!-- same for tests and <script></script> -->

### Tests
Testing a browser extension is hard. Nonetheless, we try. Tests are located in the [test](test/) folder and we use [mocha](https://mochajs.org/) and [chai](https://www.chaijs.com/) along with some [improvised magic](tests/setup.js).

To run tests open the [tests.html](tests.html) file on the browser (we advise [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VSCode), this was the only way as chrome extensions cannot be fully developed as ES6 modules, as of now. This system works fairly well.

To create a new test, check the previous ones. If you need to load html as the current jquery context (you will for every test with jquery selectors) you can do:
```javascript
describe('what the test is about', function() {
    it('should return some results', function(done) {
        updatejQueryContext("new_context.html").then(() => {
            // your tests
            done()
        }).catch(done)
    })
})
```
or, for the context to be global:

```javascript
describe('what the test is about', function() {
    before(() => {
        return new Promise((resolve)=>{
            updatejQueryContext("new_context.html").then(resolve)
        })
    })
    it('should return some results', function(done) {
        // your tests
    })
})
describe(...
```

After developing a new test, it should be added to the [options.html](options.html) page as `<script src="test/extractors/NAME.js"></script>` next to the ones already there.

</p>
</details>


### Credits

A thanks to...  [ics.js](https://github.com/nwcell/ics.js) | [FileSaver.js](https://github.com/eligrey/FileSaver.js) | [Blob.js](https://github.com/eligrey/Blob.js) | [mustache](https://github.com/janl/mustache.js/) | [chart.js](https://github.com/chartjs/Chart.js) | [math.js](https://github.com/josdejong/mathjs/) for saving us a lot of time!

Credits to [Paomedia](https://www.iconfinder.com/icons/285665/calendar_icon) for the flat calendar icon! ![](icons/calendar.svg)


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
    - Complete refactor
    - Each extractor describes itself
    - Options page is dynamic and varies according to extractors
    - Simplified manifest
    - Better organization of scripts into folders
    - Started using [mustache](https://github.com/janl/mustache.js/) templates
    - Options page
    - Changelog page when installed or updated
- V3.0
    - Improved Readme and contribution instructions
    - Started Unit Testing
    - Fixed UI bugs
    - Fixed non-minified JS files for mozilla chrome extension
    - Moodle 2019 is alive
    - Erasmus Datatables are working
    - Every extractor has "exclude pages" for custom pages where you don't want it
    - Every extractor has "apply" setting by default (boolean defaults to true)
    - Improved Contribution guidelines (extractors, tests, ...)
    - Mozilla problem with minified files
 - V3.1
    - Minimalist changelog page
    - Fixed `exclude_urls_csv` bug that disabled all extractors
    - Updates to satisfy Firefox's restrictions
 - V3.1.1
    - Closed issues [#52](https://github.com/msramalho/SigTools/issues/52), [#45](https://github.com/msramalho/SigTools/issues/45)
 - V3.1.2
   - Fixed Broken Grades [#62](https://github.com/msramalho/SigTools/issues/62)
   - Fixed Bad Exam Acronym parsing [#59](https://github.com/msramalho/SigTools/issues/59)
   - Handled Firefox Add-ons problems with 3rd party libraries...
 - V3.1.3
   - Fixed UI problem in "Conta corrente" page
 - V4.0.0
   - Revamp the way the extension is designed, introducing faster development and deployments with [gulp.js](https://gulpjs.com/)
   - Fix issues that led the extension to be blocked on Firefox
