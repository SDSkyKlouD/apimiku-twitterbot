apimiku-twitterbot
===
**The project is not maintained anymore. Here will be no new features or improvements.**
A [Node.js](https://nodejs.org) based Twitter bot sharing the works like illustrations and videos of [Appearance Miku](https://piapro.jp/t/KPU3)!

Hmm. What's the deal?
---
**Appearance Miku** is one of MMD models based on [**Hatsune Miku**](https://www.crypton.co.jp/cv01), and you ~~should~~ must know Appearance Miku is *kawaii-est* MMD model ever.  
You can see some nice pictures(illustrations) or video works on [pixiv](https://www.pixiv.net/search.php?s_mode=s_tag&word=あぴミク), [Niconico Video](https://www.nicovideo.jp/search/あぴミク), [Niconico Illust](http://seiga.nicovideo.jp/search/あぴミク), and somewhere more! ~~ignore R-18 and NSFW works, yay.~~  
... Okay, you're back here. First, I'm not responsible even if you \*addicted\* to her. Second, if you so, then why don't you follow [up and running bot on Twitter](https://twitter.com/AppearanceMiku)? This bot will make your life more *ApiMiku-ful*, absolutely and without a doubt!

Tell me how can I run this anyway ;(
---
Easy and stay cool, bro. Let's take a simple but awesome journey.

### Requirements
  + [Node.js](https://nodejs.org) (Tested on v8.x LTS, v10.x LTS)
  + Stable Internet connection. 100Gb/s is recommended if you feel dizzy easily.
  + Some awesomeness-in-your-brain? uwu

### Clone this repository
Let's give Appearance Miku a comfortable house!

  1. Install `git` if you haven't installed before.  
	`$ sudo apt-get install git` on Ubuntu/Debian  
	`# yum install git` on CentOS/Fedora

  2. Now clone this repository using following command :  
	`$ git clone https://gitlab.com/SDSkyKlouD/apimiku-twitterbot.git`
      > To reduce storage space consumption, add `--depth 1` option at the end of the command.

  3. You're done with making a house for Appearance Miku! yeah!

### Pre-setup
But our Appearance Miku says, she needs to take a rest while she charge herself.  
That's okay, moving house is not easy to do. She fell asleep, and we can prepare some basic stuffs for her, right?

  1. Check for example configuration files in cloned repository.
```bash
$ cd apimiku-twitterbot
$ cd config
$ ls
... api_config.examples.js exclude_list.examples.js ...
```

  2. Open and edit `api_config.examples.js` and fill out every empty fields.
      > There will be enough explanations available in these example configuration files.  
      > ~~Creating a Twitter app is not too hard. Just google it ;)~~ If you didn't apply for Twitter developer account before, it'll make you painful, a little. damn.

  3. Rename or copy `api_config.examples.js` to `api_config.js`.

  4. Open and edit `exclude_list.examples.js` if you want to manipulate some exclusion list.
      > You can trust me, the explanations in the file are not some lies.

  5. Rename or copy `exclude_list.examples.js` to `exclude_list.js`.

  6. Let some furnitures in!
```bash
$ cd ..   # if you are not in the root of the cloned repository
$ npm install
```

  7. You're done! now wake our girl up!

### Run!
Our Appearance Miku seems fully charged and she says she is ready to do everything. Okay then, let's give her a work.

```bash
# in the root of the cloned repository
$ node bot.js
```

You'll see some processing sequence. Now check your Twitter account which has been configured for this bot.  
If you feel everything went correctly, then why don't you hug our girl XD

<small>~~??? : SIMPLE? HUH.~~</small>

### Extra : Cron, cron, cron!
You can let Appearance Miku to do work periodically by setting a cronjob. Below is an example of cronjob(crontab) setting.

```bash
# min hour dom mon dow command
  0   */2  *   *   *   node <path-to-cloned-repository>/bot.js
```

This will run the bot script every two hours.  

※ **NOTE** that this crontab setting will not work on some systems.  
※ **NOTE** that this script DOESN'T REQUIRE administrator permission because our Appearance Miku doesn't need any help from master to do this. Please edit crontab with `$ crontab -e`, not `$ sudo crontab -e` or `# crontab -e`.

Conclusion?
---
I like Appearance Miku. uwu

License
---
Under the ~~sea~~ [LGPLv3](LICENSE)

Contribute
---
If you create a/some pull request, I will review it unconditionally and make decision to merge or deny.  
Your contribution will be applied to [up and running bot](https://twitter.com/AppearanceMiku), and a small icon of your profile image will be shown in the file page(s) what you've contributed as well.

Copyright?
---
Copy<small>~~right~~</small>left 🄯 2018 [SD SkyKlouD](https://twitter.com/_SDSkyKlouD)  
Coded with 💖, README made with 🍸

Appearance Miku, あぴミク ⓒ ままま, ANGEL Project  
Hatsune Miku, 初音ミク ⓒ Crypton Future Media, Inc.
