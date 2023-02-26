// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * This sample uses the key-phrase extraction endpoint to determine which
 * words or phrases in a document are of particular importance.
 *
 * @summary extracts key phrases from a piece of text
 */

import { TextAnalysisClient, AzureKeyCredential } from "@azure/ai-language-text";

// Load the .env file if it exists
import * as dotenv from "dotenv";
dotenv.config();

// You will need to set these environment variables or edit the following values
const endpoint = process.env["ENDPOINT"] || "https://audiobook-genre.cognitiveservices.azure.com/";
const apiKey = process.env["LANGUAGE_API_KEY"] || "8e0f3b6cf3e54e04a43598b2ac5dbc3a";

const documents = [
  `ver didn’t say anything for a while. Then, when I thought he was going to give me some deep
  philosophical comment to make me feel better, he said, “Can I have your apple?”
  I didn’t have much of an appetite, so I let him take it.`,

  `I watched the stream of cabs going down Fifth Avenue, and thought about my mom’s apartment,
  only a little ways uptown from where we sat. I hadn’t seen her since Christmas. I wanted so bad to
  jump in a taxi and head home. She’d hug me and be glad to see me, but she’d be disappointed, too.
  She’d send me right back to Yancy, remind me that I had to try harder, even if this was my sixth
  school in six years and I was probably going to be kicked out again. I wouldn’t be able to stand that
  sad look she’d give me.`,

  `Mr. Brunner parked his wheelchair at the base of the handicapped ramp. He ate celery while he
  read a paperback novel. A red umbrella stuck up from the back of his chair, making it look like a
  motorized cafe table.
  I was about to unwrap my sandwich when Nancy Bobofit appeared in front of me with her ugly
  friends-I guess she’d gotten tired of stealing from the tourists-and dumped her half-eaten lunch in
  Grover’s lap.`,

  `Some of the kids were whispering: “Did you see-“
  “-the water-“
  “-like it grabbed her-“
  I didn’t know what they were talking about. All I knew was that I was in trouble again.
  As soon as Mrs. Dodds was sure poor little Nancy was okay, promising to get her a new shirt at
  the museum gift shop, etc., etc., Mrs. Dodds turned on me. There was a triumphant fire in her eyes, as
  if I’d done something she’d been waiting for all semester. “Now, honey-“
  “I know,” I grumbled. “A month erasing workbooks.”`,

  `Nancy Bobofit smirked.
  I gave her my deluxe I’ll-kill-you-later stare. Then I turned to face Mrs. Dodds, but she wasn’t
  there. She was standing at the museum entrance, way at the top of the steps, gesturing impatiently at
  me to come on.
  How’d she get there so fast?
  I have moments like that a lot, when my brain falls asleep or something, and the next thing I know
  I’ve missed something, as if a puzzle piece fell out of the universe and left me staring at the blank
  place behind it. The school counselor told me this was part of the ADHD, my brain misinterpreting
  things.`,
];

let max_topic = "";
let max_value = 0;

async function main() {
  console.log("== Extract Key Phrases Sample ==");

  const client = new TextAnalysisClient(endpoint, new AzureKeyCredential(apiKey));

  const results = await client.analyze("KeyPhraseExtraction", documents);

  const frequencies = new Map();

  for (const result of results) {
    console.log(`- Document ${result.id}`);
    if (!result.error) {
      console.log("\tKey phrases:");
      for (const phrase of result.keyPhrases) {
        console.log(`\t- ${phrase}`);
        if (frequencies.has(phrase)) {
            frequencies.set(phrase, frequencies.get(phrase) + 1);
        } else {
            frequencies.set(phrase, 1);
        }
      }
    } else {
      console.error("  Error:", result.error);
    }
  }

//   console.log(frequencies.size);
//   console.log(frequencies.get("Mrs. Dodds"));


  for (let [key, value] of frequencies.entries()) {
        if (value > max_value) {
            max_topic = key;
            max_value = value;
        }
  }

  console.log(max_topic);
  console.log(max_value);

  const token = "BQA7v50NNqPQHG8hjSlEFhprU8V_IDSVc9hTQ7rcwBJMR45oluf3Uw1qRcwD7pEL3n4Q9MaUQXdVVbjN661_54bRGJ-L4o1U1Jq4PX2I_-nDRugLtOy1vZulucjFdayVxRjyNOOrLgX_R7a_T7MvXgayd0MaWd2103kWHfuOxMJwqLWkOphrgAD5c0e_eXwr";

  const url = `https://api.spotify.com/v1/search?q=${max_topic}&type=track&access_token=${token}`    // pass the token in this string thats it..

  console.log(url);
}


main().catch((err) => {
  console.error("The sample encountered an error:", err);
});





