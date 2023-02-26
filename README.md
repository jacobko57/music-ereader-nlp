# Text to Genre NLP Model

## Created Using Microsoft Azure's Congnitive Services and Language Studio

Using Microsoft Azure, we trained a Multi-Label Classification model using the provided Movies datset. After training, the model provides genres (Thriller, Comedy, Action, etc.) that fit the style of a given piece text. Additionally, it provides a confidence score from 0.0-1.0 that shows how close each label is to the style of the text.

That label is then used with Spotify's API in order to recommend a song based on the sentiment of the text.

# How to Use:

1. Clone the git repository

2. Run npm install to install dependencies
    ```
    npm install
    ```

3. Add new text documents
    * For most accurate results make sure each document is less than 500 words

4. Run model using node multi.js
    ```
    node multi.js
    ```