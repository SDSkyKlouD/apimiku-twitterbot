/*
 *  Configurations for API modules
 *
 *  Copyright ⓒ 2018 SD SkyKlouD, All Rights Reserved.
 */

// This script is an example of configurations of API modules.
// You should fill these empty fields with your API information.
// If you're done with filling empty fields, change this file name to `api_config.js` (remove `.example` in file name) to make the bot work properly.

module.exports = {
    // Twitter API configurations (for module `twit`)
    // The bot will tweet the works using this API configurations.
    twitterConfig: {
      consumer_key:        "",    // Consumer Key
      consumer_secret:     "",    // Consumer Secret
      access_token:        "",    // Access Token
      access_token_secret: ""     // Access Token Secret
    },

    // Pixiv API configurations (for module `node-pixiv`)
    // This configuration will be used when searching some illustration on Pixiv.
    pixivConfig: {
      username: "",   // Pixiv username(ID)
      password: ""    // Pixiv password of account (in plain text)
    }
}