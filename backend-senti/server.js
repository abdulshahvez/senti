const express = require('express');
const puppeteer = require('puppeteer');
const vader = require('vader-sentiment');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/tweets', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://x.com/${username}`, { waitUntil: 'networkidle2' });
    await autoScroll(page);

    const tweets = await page.evaluate(() => {
      const tweetElements = document.querySelectorAll('article'); // Ensure this is the correct selector
      return Array.from(tweetElements).map(tweet => {
        const textElement = tweet.querySelector('div[data-testid="tweetText"]');
        const dateElement = tweet.querySelector('time'); // Ensure this selector is correct
        
        // Extract tweet text and date/time
        const text = textElement ? textElement.innerText : 'No text';
        const dateTime = dateElement ? dateElement.getAttribute('datetime') : 'No date';

        return {
          text,
          dateTime
        };
      });
    });

    const analyzedTweets = tweets.map(tweet => {
      const sentimentResult = vader.SentimentIntensityAnalyzer.polarity_scores(tweet.text);
      const compound = sentimentResult.compound;

      let overallSentiment;
      if (compound > 0.05) {
        overallSentiment = 'positive';
      } else if (compound < -0.05) {
        overallSentiment = 'negative';
      } else {
        overallSentiment = 'neutral';
      }

      return {
        text: tweet.text,
        dateTime: tweet.dateTime,
        sentiment: overallSentiment
      };
    });

    await browser.close();
    res.json(analyzedTweets);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching tweets' });
  }
});

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
