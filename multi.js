import { AzureKeyCredential, TextAnalysisClient } from "@azure/ai-language-text";
import fetch from "node-fetch";

// Load the .env file if it exists
import * as dotenv from "dotenv";
dotenv.config();

// You will need to set these environment variables or edit the following values
const endpoint = process.env["AZURE_LANGUAGE_ENDPOINT"] || "https://audiobook-genre.cognitiveservices.azure.com/";
const apiKey = process.env["AZURE_LANGUAGE_KEY"] || "8e0f3b6cf3e54e04a43598b2ac5dbc3a";
const deploymentName = process.env["MULTI_LABEL_CLASSIFY_DEPLOYMENT_NAME"] || "audiobook-deployment";
const projectName = process.env["MULTI_LABEL_CLASSIFY_PROJECT_NAME"] || "audiobook";

const documents = [
  "Set in today’s Mumbai, Barah Aana revolves around three friends: Shukla, a driver, Yadav, a watchman, and Aman, a waiter. Shukla is an older man, stoic and steady. Yadav, in his 30s, is meek and something of a pushover at work, but exhibits an underlying mischievous nature. Aman, on the other hand, is young, dynamic, and ambitious. In typical Mumbai fashion, the three are roommates, and the clash of their personalities regularly results in humorous, tongue-in-cheek banter. Things take a turn when the watchman becomes prey to misfortune; a series of chance events results in him stumbling on to a crime. The discovery changes his perspective, boosting his self-confidence enough to make him think that he had a found a new, low-risk way to make money. He then tries to sell the idea to his roommates, to get them to join him in executing a series of such crimes. As they get more and more mired in the spiral of events that follow, the three characters go through several changes as they are pushed more and more against the wall.",
];

let max_confidence = 0;
let genre = "";
const token = "BQC5h0UXawym79sEgAqqBXFyeBs1q66HamxEXoVABzMnyDORj_ATsVL-F-aSAzVDSiovlHVInmI-tjcB29qGi0U5-fdnF18BJuKztp4_wR_2AvnniaE0oeYxEffOGsaCq7kGh-pzNEXf9VryfDSROiQHNhioJAowP4uTQiTmC79oNf-JWaNLKQAGHceYQGRN";


async function main() {
  console.log("== Custom Entity Recognition Sample ==");

  const client = new TextAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
  const actions = [
    {
      kind: "CustomMultiLabelClassification",
      deploymentName,
      projectName,
    },
  ];
  const poller = await client.beginAnalyzeBatch(actions, documents, "en");
  const results = await poller.pollUntilDone();

  for await (const actionResult of results) {
    if (actionResult.kind !== "CustomMultiLabelClassification") {
      throw new Error(
        `Expected a CustomMultiLabelClassification results but got: ${actionResult.kind}`
      );
    }
    if (actionResult.error) {
      const { code, message } = actionResult.error;
      throw new Error(`Unexpected error (${code}): ${message}`);
    }
    for (const result of actionResult.results) {
      console.log(`- Document ${result.id}`);
      if (result.error) {
        const { code, message } = result.error;
        throw new Error(`Unexpected error (${code}): ${message}`);
      }
      console.log(`\tClassification:`);
      for (const classification of result.classifications) {
        console.log(`\t\t-category: ${classification.category}`);
        console.log(classification.confidenceScore);

        if (classification.confidenceScore > max_confidence) {
          genre = classification.category;
          max_confidence = classification.confidenceScore;
        }

      }
    }
  }


  // Get request to search for genre
  var searchParameters = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  }
  var trackID = await fetch('https://api.spotify.com/v1/search?q=genre%3A' + genre + '&type=track&limit=50', searchParameters)
    .then(response => response.json())
    .then(data => { 
      let current_name = data.tracks.items[Math.floor(Math.random() * 50)].name; 
      while (current_name.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/)) {
        current_name = data.tracks.items[Math.floor(Math.random() * 50)].name;
      }
      return current_name;
    })

    console.log("Spotify recommends: " + trackID);
}




main().catch((err) => {
  console.error("The sample encountered an error:", err);
});


