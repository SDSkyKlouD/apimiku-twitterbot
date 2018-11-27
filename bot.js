/*
 *  A Twitter bot sharing the works of Appearance Miku
 *  Main script written in Node.js (JavaScript)
 *
 *  Originally developed by SD SkyKlouD
 *
 *  Copyright ⓒ 2018 SD SkyKlouD, All Rights Reserved.
 *  Licensed under LGPLv3 (see LICENSE)
 */

/* Setup */
// Configurations
const apiConfigs    = require("./config/api_config.js");
const exclusions    = require("./config/exclude_list.js");

// Modules
const fs            = require("fs");
const twitter       = new (require("twit"))(apiConfigs.twitterConfig);
const pixiv         = new (require("node-pixiv"))();
const pixivLogin    = pixiv.login(apiConfigs.pixivConfig);
const niconico      = require("sugoi-search").default;

// Static
const uploadPlaceType        = {
    PIXIV:      0,
    NICOVIDEO:  1,
    NICOILLUST: 2
};

const niconicoOffsetFileName = "niconico.offset";
const niconicoOffsetFullPath = require("path").resolve(__dirname, niconicoOffsetFileName);

const logInfo       = function(section, message) { console.info("[" + section.toUpperCase() + "] " + logInfo.caller.name + ": " + message); };
const logError      = function(section, message) { console.error("[" + section.toUpperCase() + "] " + logError.caller.name + ": " + message); };
/* === */

/* Main */
main();

async function main() {
    logInfo("Startup", "Picking random upload place...");
    let selection = Math.round(Math.random() * (Object.keys(uploadPlaceType).length - 1));
    logInfo("Startup", "Upload place selection : " + selection);


    switch(selection) {
        case uploadPlaceType.PIXIV: {
                logInfo("Startup", "Running on Pixiv...");

                const work = await searchWork(selection);

                if(work) {
                    logInfo("Twitter", "Posting the work to Twitter...");

                    if(await postWork(selection, work)) {
                        logInfo("Twitter", "Posting completed.");
                    } else {
                        logError("Twitter", "There are some errors found while posting a Tweet.");
                    }
                }
            }
            break;
        case uploadPlaceType.NICOVIDEO: {
                // TODO
                logError("Startup", "NicoVideo search is not implemented yet. Restarting...");
                main();
            }
            break;
        case uploadPlaceType.NICOILLUST: {
                logInfo("Startup", "Running on Niconico Illust...");

                const offset = await niconico_LoadOffset();
                const work = await searchWork(selection, offset.illustOffset + 1);

                if(work) {
                    logInfo("Twitter", "Posting the work to Twitter...");

                    if(await postWork(selection, work)) {
                        logInfo("Twitter", "Posting completed.");
                    } else {
                        logError("Twitter", "There are some errors found while posting a Tweet.");
                    }

                    niconico_UpdateOffset(offset.illustOffset + 1, offset.videoOffset);
                }
            }
            break;
    }
}
/* === */

/* Functions */
/**
 * POSTs a Tweet using hardcoded template selected by `workUploadedPlace`
 * @param {number} workUploadedPlace - The place where the work uploaded. Use predefined value from `uploadPlaceType`
 * @param {object} content - An object containing some information of the work. See "Work object structure" comment in `searchWork`
 * @returns {Promise} A **Promise** which represents `twitter.post`.
 */
function postWork(workUploadedPlace, content) {
    switch(workUploadedPlace) {
        case uploadPlaceType.PIXIV: {
                // `content` of pixiv = { title: string, creator: string, creatorId: number, workId: number }
                return twitter.post("statuses/update", {
                    status: "「" + content.title + "」\n\n" +
                            "by " + content.creator + " (pixiv, https://www.pixiv.net/member.php?id=" + String(content.creatorId) + ")\n\n" +
                            "https://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + String(content.workId)
                });
            }
        case uploadPlaceType.NICOVIDEO: {
                // `content` of nicovideo = { title: string, uploadDate: string, workId: number }
                let uploadDate = new Date(content.uploadDate);
                let uploadDateNormalized = uploadDate.getFullYear() + "/" + uploadDate.getMonth() + "/" + uploadDate.getDay() + " " + uploadDate.getHours() + ":" + uploadDate.getMinutes() + " JST/KST";

                return twitter.post("statuses/update", {
                    status: "「" + content.title + "」\n\n" +
                            "(ニコニコ動画, " + uploadDateNormalized + ")\n\n" +
                            "https://www.nicovideo.jp/watch/" + content.workId
                });
            }
        case uploadPlaceType.NICOILLUST: {
                // `content` of nicoillust = { title: string, uploadDate: string, workId: number }
                let uploadDate = new Date(content.uploadDate);
                let uploadDateNormalized = uploadDate.getFullYear() + "/" + uploadDate.getMonth() + "/" + uploadDate.getDay() + " " + uploadDate.getHours() + ":" + uploadDate.getMinutes() + " JST/KST";

                return twitter.post("statuses/update", {
                    status: "「" + content.title + "」\n\n" +
                            "(ニコニコ静画, " + uploadDateNormalized + ")\n\n" +
                            "https://seiga.nicovideo.jp/seiga/" + content.workId
                });
            }
        default:
            logError("Twitter", "Value of `workUploadedPlace` can't be recognized. Exiting...");
            process.exit(1);
    }
}

/**
 * Searches an Appearance Miku illustration
 * @param {number} workUploadedPlace - The place where the work uploaded. Use predefined value from `uploadPlaceType`
 * @param {number} currentPosition - Current position of search. (When **Pixiv** : this argument will become only for internal use, so **DO NOT SPECIFY THIS ARGUMENT IF YOU CALL THIS!**)
 * @returns {Promise<object>} (Async) Normalized work **object**.
 *                                    If search process goes fail, this will return **null**.
 */
async function searchWork(workUploadedPlace, currentPosition = -1) {
    /*
     * Work object structure
     *
     * {
     *      uploadPlace: number (uploadPlaceType),
     *      uploadDate: string,
     *      workId: number,
     *      title: string,
     *      creator: string,        <- `null` if Niconico search
     *      creatorId: number       <- `null` if Niconico search
     * }
     */
    switch(workUploadedPlace) {
        case uploadPlaceType.PIXIV: {
                await pixivLogin;

                let totalCount = await pixiv_GetTotalIllustrationCount();

                if(currentPosition == -1) {
                    // If it is the first time calling, randomize current position
                    currentPosition = Math.round(Math.random() * totalCount);
                }

                logInfo("Pixiv", "Random-picking an Appearance Miku illustration. Current position is " + currentPosition);

                // Search for illustrations which contains "あぴミク" tag on Pixiv.
                const data = await pixiv.search({
                    q: "あぴミク",
                    page: currentPosition,
                    per_page: 1,
                    mode: "tag",
                    period: "all",
                    order: "desc",
                    sort: "date",
                    types: "illustration"
                });

                if(data) {
                    logInfo("Pixiv", "Got data from Pixiv");

                    if(isToBeExcluded(workUploadedPlace, data.response[0].tags, data.response[0].user.id)) {
                        logInfo("Pixiv", "This work should be excluded. Skipping to the next one.");

                        // If the illustration should be excluded, search for random another one and try again.
                        return searchWork(workUploadedPlace, Math.round(Math.random() * totalCount));
                    } else {
                        logInfo("Pixiv", "This work will not going to be excluded.");

                        if(data.status === "success" && data.response && data.pagination.current === currentPosition) {
                            logInfo("Pixiv", "Data looks good, returning it (work id : " + data.response[0].id + ")");

                            return {
                                uploadPlace: workUploadedPlace,
                                uploadDate: data.response[0].created_time,
                                workId: data.response[0].id,
                                title: data.response[0].title,
                                creator: data.response[0].user.name,
                                creatorId: data.response[0].user.id
                            };
                        }
                    }
                } else {
                    logInfo("Pixiv", "Something went wrong while searching. returning null.");
                    return null;
                }
            }
            break;
        case uploadPlaceType.NICOVIDEO: {
                /* TODO: search within NicoVideo */
                return null;
            }
        case uploadPlaceType.NICOILLUST: {
                logInfo("NicoIllust", "Getting an Appearance Miku illustration, offset " + currentPosition);

                const nicoillustQuery = niconico.tag("あぴミク").service("illust").page(currentPosition).sort("+startTime");
                nicoillustQuery._size = 1;      // Specify that query should return only one work
                const data = await nicoillustQuery.then((work) => { return work; }).catch((error) => {
                    if(error.response) {
                        logError("NicoIllust", "API Response : " + error.response.status + " " + error.response.statusText);

                        if(error.response.status === 400) {
                            logInfo("NicoIllust", "Seems like the requested position is exceeding maximum.");
                            logInfo("NicoIllust", "So going back and search from first work again.");

                            return searchWork(workUploadedPlace, 1);
                        }
                    }
                });

                if(data) {
                    logInfo("NicoIllust", "Got data from Niconico Illust");

                    if(isToBeExcluded(workUploadedPlace, data[0].tags)) {
                        logInfo("NicoIllust", "This work should be excluded. Skipping to the next one.");

                        // If the illustration should be excluded, search for random another one and try again.
                        return searchWork(workUploadedPlace, currentPosition + 1);
                    } else {
                        logInfo("NicoIllust", "This work will not going to be excluded.");

                        if(data[0].id.startsWith("im") && data[0].title) {
                            logInfo("NicoIllust", "Data looks fine, returning it (work id : " + data[0].id + ")");

                            return {
                                uploadPlace: workUploadedPlace,
                                uploadDate: data[0].created_at,
                                workId: data[0].id,
                                title: data[0].title,
                                creator: null,
                                creatorId: null
                            };
                        }
                    }
                } else {
                    logInfo("NicoIllust", "Something went wrong while searching. returning null.");
                    return null;
                }
            }
            break;
        default:
            logError("Search", "Value of `workUploadedPlace` can't be recognized. Exiting...");
            process.exit(1);
    }
}

/**
 * (Pixiv specific function) Gets total count of Appearance Miku illustration works
 * @returns {Promise<number>} (Async) Total count of illustrations
 */
async function pixiv_GetTotalIllustrationCount() {
    logInfo("Pixiv", "Getting the total count of Appearance Miku illustrations...");

    await pixivLogin;
    const data = await pixiv.search({
        q: "あぴミク",
        page: 1,
        per_page: 1,
        mode: "tag",
        period: "all",
        order: "desc",
        sort: "date",
        types: "illustration"
    });
    return data.pagination.total;
}

/**
 * Checks if the work should be excluded or not
 * @param {number} workUploadedPlace - The place where the work uploaded. Use predefined value from `uploadPlaceType`
 * @param {string[]} tagArray - A string array of tags of the work
 * @param {number} creatorId - \* **PIXIV ONLY** \* ID of creator of the work
 * @returns {boolean} **true** if the work should be excluded, **false** if not
 */
function isToBeExcluded(workUploadedPlace, tagArray, creatorId = -1) {
    for(let excLen = exclusions.excludedTags.length - 1; excLen >= 0; excLen--) {
        for(let tagLen = tagArray.length - 1; tagLen >= 0; tagLen--) {
            if(tagArray[tagLen].toLowerCase() === exclusions.excludedTags[excLen].toLowerCase()) {
                return true;
            }
        }
    }

    if(workUploadedPlace === uploadPlaceType.PIXIV && creatorId !== -1) {
        for(let excLen = exclusions.excludedPixivCreators.length - 1; excLen >= 0; excLen--) {
            if(creatorId === exclusions.excludedPixivCreators[excLen]) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Load Niconico search offsets from predefined file path
 * @returns {Promise<object>} A **Promise** with `resolve(illustOffset: number, videoOffset: number)`
 */
function niconico_LoadOffset() {
    return new Promise((resolve, reject) => {
        logInfo("Niconico", "Loading last offset...");

        let nicoIllustOffset = 0, nicoVideoOffset = 0;
        let fileAccessible = false;

        try {
            fs.accessSync(niconicoOffsetFullPath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
            fileAccessible = true;
        } catch(error) {
            fileAccessible = false;
        }

        if(fileAccessible) {
            logInfo("Niconico", "Offset file already exists. trying to read it...");

            const lineReader = require("readline").createInterface({
                input: fs.createReadStream(niconicoOffsetFullPath)
            });
            let lineCount = 0;

            lineReader.on("line", (line) => {
                try {
                    if(lineCount === 0) {
                        nicoIllustOffset = Number(line);
                    } else if(lineCount === 1) {
                        nicoVideoOffset = Number(line);
                    }
                } catch(error) {
                    logError("Niconico", "Can't parse line(s) into number. Ignoring.");
                } finally {
                    lineCount++;
                }
            }).on("close", () => {
                logInfo("Niconico", `Reading ended. returning - illustOffset: ${nicoIllustOffset}, videoOffset: ${nicoVideoOffset}`);

                resolve({
                    illustOffset: nicoIllustOffset,
                    videoOffset: nicoVideoOffset
                });
            });
        } else {
            logInfo("Niconico", "Offset file seems not exist. Creating it with default value(0)...");

            if(niconico_UpdateOffset(0, 0)) {
                try {
                    fs.accessSync(niconicoOffsetFullPath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
                    fileAccessible = true;
                } catch(error) {
                    fileAccessible = false;
                }

                if(fileAccessible) {
                    logInfo("Niconico", "Offset file created with default value. Also returning offset object.");
                    resolve({
                        illustOffset: 0,
                        videoOffset: 0
                    })
                } else {
                    logInfo("Niconico", "Offset file can't be created. Please check for read/write permission. Exiting...");
                    process.exit(1);
                }
            }
        }
    });
}

/**
 * Update Niconico search offsets to predefined file path
 * @param {number} nicoIllustOffset - Offset of Niconico Illust
 * @param {number} nicoVideoOffset - Offset of Niconico Video
 * @returns {boolean} **true** if offset data update sequence has done, **false** if something goes wrong.
 */
function niconico_UpdateOffset(nicoIllustOffset, nicoVideoOffset) {
    try {
        logInfo("Niconico", "Creating write stream for offset file (also creating the file if not exists)...");
        logInfo("Niconico", `illustOffset: ${nicoIllustOffset}, videoOffset: ${nicoVideoOffset}`);

        const fileStream = fs.createWriteStream(niconicoOffsetFullPath, {
            encoding: "utf8",
            flags: "w"
        });

        if(fileStream) {
            logInfo("Niconico", "Write stream created successfully.");

            logInfo("Niconico", "Writing offfset data into file...");
            fileStream.write(String(nicoIllustOffset));
            fileStream.write('\n');
            fileStream.write(String(nicoVideoOffset));
            fileStream.end();
            logInfo("Niconico", "Offset data update sequence done.");

            return true;
        } else {
            logError("Niconico", "Failed to create write stream. Write stream is null.");
            return false;
        }
    } catch(error) {
        logError("Niconico", "Failed to update Niconico offset.");
        logError("Niconico", error);

        return false;
    }
}
/* === */