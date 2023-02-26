import { AzureKeyCredential, TextAnalysisClient } from "@azure/ai-language-text";

// Load the .env file if it exists
import * as dotenv from "dotenv";
dotenv.config();

// You will need to set these environment variables or edit the following values
const endpoint = process.env["AZURE_LANGUAGE_ENDPOINT"] || "https://audiobook-genre.cognitiveservices.azure.com/";
const apiKey = process.env["AZURE_LANGUAGE_KEY"] || "8e0f3b6cf3e54e04a43598b2ac5dbc3a";
const deploymentName = process.env["MULTI_LABEL_CLASSIFY_DEPLOYMENT_NAME"] || "audiobook-deployment";
const projectName = process.env["MULTI_LABEL_CLASSIFY_PROJECT_NAME"] || "audiobook";

const documents = [
  "The plot begins with a large group of characters where everyone thinks that the two main ones should be together but foolish things keep them apart. Misunderstandings, miscommunication, and confusion cause a series of humorous situations.",
];

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

  let max_confidence = 0;
  let genre = "";

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
        }

      }
    }
  }

  console.log(genre);

  const token = "BQA7v50NNqPQHG8hjSlEFhprU8V_IDSVc9hTQ7rcwBJMR45oluf3Uw1qRcwD7pEL3n4Q9MaUQXdVVbjN661_54bRGJ-L4o1U1Jq4PX2I_-nDRugLtOy1vZulucjFdayVxRjyNOOrLgX_R7a_T7MvXgayd0MaWd2103kWHfuOxMJwqLWkOphrgAD5c0e_eXwr";

  const url = `https://api.spotify.com/v1/search?q=genre%3A${genre}&type=track&access_token=${token}`;

  console.log(url);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
