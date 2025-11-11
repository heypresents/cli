import * as cheerio from 'cheerio';
import color from 'picocolors';
import open from 'open';

import {
  intro,
  outro,
  log,
  confirm,
  select,
} from '@clack/prompts';

const rootUrl = 'https://heypresents.com/';
const talksUrl = `${rootUrl}/talks/`;

// Fetch a bunch of talks from the web
// and extract their titles and urls
const gatherTalks = async () => {
  const $ = await cheerio.fromURL(talksUrl);
  return $.extract({
    talks: [
      {
        selector: 'main div.grid div',
        value: {
          name: {
            selector: 'h3',
            value: (el) => {
              const talkTitle = $(el).next("h3").text().trim();
              return `${$(el).text().trim()} - ${talkTitle}`
            },
          },
          url: {
            selector: 'a',
            value: (el) => {
              return $(el).attr('href') || '';
            },
          },
        },
      },
    ],
  });
};


// rest here a while
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Offer a random selection of nuggets to explore
const offerTalks = async () => {
  
  const talks = await gatherTalks();

  // Prompt the user to select a talk
  const talk = await select({
    message: "We've had such wonderful speakers and talks over the years",
    options: talks.talks.map((el) => ({
      value: el.url,
      label: el.name,
    })),
  });

  // Ask if the user wants to visit the talk on the Hey! website
  const shouldVisit = await confirm({
    message: 'This talk is available to watch on the Hey! website. Shall we take a look?',
  });
  if (shouldVisit) {
    await open(`${rootUrl}${String(talk)}`);
    log.info(`Ok! Pointing your browser at ${color.cyan(rootUrl + String(talk))}`);
  }

  // Ask if the user wants to see some other talks
  const more = await confirm({
    message: 'Want to see some other talks?',
  });
  if (more) {
    offerTalks();
  } else {
    outro(color.yellow(color.inverse('  All Day Hey! May 7th, 2026. Leeds, UK  ')) + '\n\n' + color.yellow(`Get tickets and more information about All Day Hey! at ${rootUrl}`));
  }

};

// Show a simple CLI for browsing the talks and information from All Day Hey!
const main = async () => {
  console.log(`
  👋 Hey!
  `);
  intro(color.yellow(color.inverse(' Hey Presents, All Day Hey! ')));
  log.info(`All Day Hey 2026 is coming!\nWant to explore some of the previous talks from All Day Hey?`);
  await sleep(1000);
  offerTalks();
};

main();

