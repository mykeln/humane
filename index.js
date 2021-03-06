// setting variables from dotenv file
require('dotenv').config({path: __dirname + '/.env'})

var apiKey = process.env.APIKEY;

// adding modules
const puppeteer = require('puppeteer');
const IFTTTMaker = require('iftttmaker')(apiKey);


(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']})
  const page = await browser.newPage();
  await page.goto('https://humanesocietytampa.org/adopt-a-doggie/');

  // timed delay because waiting for an element is inconsistent
  await page.waitFor(2000);

  // scrape all dog-related meta content on page
  const textsArray = await page.evaluate(
    () => [...document.querySelectorAll('.cmsms_project_header')].map(elem => elem.innerText)
  );

  // converting all results to lower case so we can consistently check for 'mastiff'
  var sortedText = textsArray.join('|').toLowerCase().split('|');

  // defining the string we want to search the scraped text for
  const matchOn = 'mastiff';

  // find any matches
  let matches = sortedText.filter(s => s.includes(matchOn));

  // if matches found, text someone via ifttt with the results. otherwise do nothing.
  if(matches.length > 0) {
   console.log(matches.length + ' dogs found'); 

   // trimming line breaks and sanitizing for send
   var cleanText = matches.toString().trim();
   console.log('mastiff is here!\n\n' + cleanText);

   // assigning results to ifttt-friendly value
   var request = {
     event: 'mastiff',
     values: {
       value1: cleanText
     }
   };

   // sending request to ifttt
    IFTTTMaker.send(request, function (error) {
      if (error) {
        console.log('The request could not be sent:', error);
      } else {
        console.log('Request was sent');
      }
    });
  } else { // no matches found
    console.log('mastiff is not here');
  }

  browser.close();
})();
