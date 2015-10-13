sap-calculator
==============
JavaScript Satisfactory Academic Progress Calculator

We have an [example](http://www.lanecc.edu/finaid/sap-calculator) on our site.

Be sure to update the text in the sap.html file to reflect your needs, as well as look through the sap.js file to make sure the grades reflect those at your institution. In particular, in addition to updating any text that's Lane specific, be sure to properly set the noscript text, as there's a potential for an accessibility issue if someone is unable to access this via JavaScript.

Though we've licensed this project under the MIT License, we'd appreciate attribution!

Building & Deploying
--------------------
The `src` directory contains all the source files for this application. Make sure to make changes here, as during the build process, the files in `dist` (created on first build) are wiped out every time you rebuild this application.

Make sure your system has node, compass, and SASS installed, then install node packages with `node install`.

This project builds using gulp. Simply run `gulp build` and gulp will take care of compliling the SCSS files, minifying the JS and CSS files, and copying everything together into `dist`. 