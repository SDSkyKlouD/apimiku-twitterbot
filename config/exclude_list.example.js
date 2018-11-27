/*
 *  Tag & author exclusion list
 *
 *  Copyright ⓒ 2018 SD SkyKlouD, All Rights Reserved.
 */

// This script is an example of tag and author list to be exclueded when sharing the work.
// Add or remove some items in these lists if you want.
// If you're done with manipulating these lists, change this file name to `exclude_list.js` (remove `.example` in file name) to make it work.

module.exports = {
  // Tag list to be excluded.
  // Tags listed below are NSFW(Not Safe For Work) and R-18 tags to prevent erotic works as possible.
  excludedTags: [
    // R-18
    "R-18",
    "R-18G",
    "エッチ",
    "えっち",
    "Ecchi",
    "Ero",
    "エロ",

    // Sex
    "セックス",
    "せっくす",
    "Sex",
    "XXX",

    // Masturbation
    "オナニー",
    "オナニ",
    "角オナ",
    "角オナニー",
    "角オナニ",
    "かくオナ",
    "かくオナニー",
    "かくオナニ",
    "カクオナ",
    "カクオナニ",
    "カクオナニー",
    "Onani",
    "Masturbation",

    // Panties
    "MMDパンツリンク",
    "ＭＭＤパンツリンク",
    "パンツ",
    "パンチラ",
    "Panty",
    "Pantsu",
    "Panties",
    "Panchira",

    // Breast
    "乳頭",
    "おっぱい",
    "巨乳",
    "Oppai",
    "Nipple",
    "Nipples",
    "Big Breasts",

    // Fetishes
    "足フェチ",

    // Butt
    "お尻",
    "おしり"
  ],

  // Pixiv creator ID list to be excluded.
  // You can explicitly add some creators' ID in this list. Listed creator will be ignored while searching the work.
  //
  // The purpose of this exclusion is prevent more erotic works.
  // Some creator don't add proper tags with sincerity, even their works are absolutely erotic ones.
  // We DON'T have to share dishonest creators' works, right?
  //
  // ID should be integer number. (NOT SCREEN(USER) NAME!!)
  excludedPixivCreators: [ ]
}