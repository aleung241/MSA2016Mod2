/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts"/>
var apiKey = "4C70C8C5A2D0E11AF59A9CB6BBA60653";
//This is for date.getUTCDay()'s returned number
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek[DayOfWeek["Sunday"] = 0] = "Sunday";
    DayOfWeek[DayOfWeek["Monday"] = 1] = "Monday";
    DayOfWeek[DayOfWeek["Tuesday"] = 2] = "Tuesday";
    DayOfWeek[DayOfWeek["Wednesday"] = 3] = "Wednesday";
    DayOfWeek[DayOfWeek["Thursday"] = 4] = "Thursday";
    DayOfWeek[DayOfWeek["Friday"] = 5] = "Friday";
    DayOfWeek[DayOfWeek["Saturday"] = 6] = "Saturday";
})(DayOfWeek || (DayOfWeek = {}));
//enum for months for date.getUTCMonth()
var Month;
(function (Month) {
    Month[Month["January"] = 0] = "January";
    Month[Month["February"] = 1] = "February";
    Month[Month["March"] = 2] = "March";
    Month[Month["April"] = 3] = "April";
    Month[Month["May"] = 4] = "May";
    Month[Month["June"] = 5] = "June";
    Month[Month["July"] = 6] = "July";
    Month[Month["August"] = 7] = "August";
    Month[Month["September"] = 8] = "September";
    Month[Month["October"] = 9] = "October";
    Month[Month["November"] = 10] = "November";
    Month[Month["December"] = 11] = "December";
})(Month || (Month = {}));
//enum for user profile status
var PersonaStatus;
(function (PersonaStatus) {
    PersonaStatus[PersonaStatus["Offline/Private profile"] = 0] = "Offline/Private profile";
    PersonaStatus[PersonaStatus["Online"] = 1] = "Online";
    PersonaStatus[PersonaStatus["Busy"] = 2] = "Busy";
    PersonaStatus[PersonaStatus["Away"] = 3] = "Away";
    PersonaStatus[PersonaStatus["Snooze"] = 4] = "Snooze";
    PersonaStatus[PersonaStatus["Looking to trade"] = 5] = "Looking to trade";
    PersonaStatus[PersonaStatus["Looking to play"] = 6] = "Looking to play";
})(PersonaStatus || (PersonaStatus = {}));
//enum for owned games sorting menu
var SelectedSort;
(function (SelectedSort) {
    SelectedSort[SelectedSort["az"] = 0] = "az";
    SelectedSort[SelectedSort["za"] = 1] = "za";
    SelectedSort[SelectedSort["mostPlayed"] = 2] = "mostPlayed";
    SelectedSort[SelectedSort["leastPlayed"] = 3] = "leastPlayed";
})(SelectedSort || (SelectedSort = {}));
$(document).ready(function () {
    getUserSummaries();
});
//Using the Steam ID, we can now call another API to grab the profile data it is associated with :D
function getUserSummaries() {
    //gets the steamid from url hash
    var steamId = window.location.hash.substr(1);
    $.ajax({
        url: "http://aleu241-test.apigee.net/getplayersummaries",
        data: {
            key: apiKey,
            steamids: steamId
        },
        method: "GET"
    })
        .done(function (userData) {
        createNewUser(userData.response.players[0]);
    })
        .fail(function () {
        console.log("fail");
    });
}
//This creates the user from the API call
function createNewUser(userData) {
    var steamId = userData.steamid;
    var displayName = userData.personaname;
    var profileUrl = userData.profileurl;
    var avatar32 = userData.avatar;
    var avatar64 = userData.avatarmedium;
    var avatar184 = userData.avatarfull;
    var statusNum = userData.personastate;
    var status = PersonaStatus[statusNum];
    //Convert UNIX timestamp to UTC
    //Change to milliseconds, from seconds
    var date = new Date(userData.lastlogoff * 1000);
    //0 just in case single digit. substr -2 to get last 2 digits
    var hours = "0" + date.getUTCHours();
    var minutes = "0" + date.getUTCMinutes();
    var seconds = "0" + date.getUTCSeconds();
    var day = date.getUTCDate();
    var month = date.getUTCMonth();
    var year = date.getUTCFullYear();
    var dayOfWeek = date.getUTCDay();
    //Creates the string in the format of [HH:MM:SS Day Date Month Year] for "Last seen"
    var utcTime = hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2) + " " + DayOfWeek[dayOfWeek] + " " + day + " " + Month[month] + " " + year;
    var lastLogOff = utcTime;
    //Sisplays info on page
    $("#userPageSteamId").html("Steam ID: " + steamId);
    $("#userPageDisplayName").html(displayName);
    $("#userPageProfileUrlWrapper").attr("value", "test");
    $("#userPageProfileUrl").attr("href", profileUrl);
    $("#userPageLastLogOff").html("Last seen: " + lastLogOff);
    $("#userPageStatus").html("Currently " + status);
    $("#userPageAvatarSml").attr("src", avatar32);
    $("#userPageAvatarMed").attr("src", avatar64);
    $("#userPageAvatarLrg").attr("src", avatar184);
    loadUserSteamLevel(steamId);
    loadUserBanStatus(steamId);
    loadUserOwnedGames(steamId);
}
//Get user steam level
function loadUserSteamLevel(steamId) {
    $.ajax({
        url: "http://aleu241-test.apigee.net/getsteamlevel",
        data: {
            key: apiKey,
            steamid: steamId
        },
        method: "GET"
    })
        .done(function (userData) {
        $("#userSteamLevel").html("Steam level: " + userData.response.player_level);
    })
        .fail(function () {
        console.log("fail");
    });
}
//Get ban status of user and displays it on user page
function loadUserBanStatus(steamId) {
    var isBanned;
    var communityBanned;
    var lastBanned;
    var economyBan;
    var vacBanned;
    var gameBans;
    var vacBans;
    $.ajax({
        url: "http://aleu241-test.apigee.net/getplayerbans",
        data: {
            key: apiKey,
            steamids: steamId
        },
        method: "GET"
    })
        .done(function (userData) {
        communityBanned = userData.players[0].CommunityBanned;
        economyBan = userData.players[0].EconomyBan;
        lastBanned = userData.players[0].DaysSinceLastBan;
        vacBanned = userData.players[0].VACBanned;
        gameBans = userData.players[0].NumberOfGameBans;
        vacBans = userData.players[0].NumberOfVACBans;
        if (communityBanned || economyBan !== "none" || vacBanned) {
            isBanned = true;
            $("#userBanStatus").html("Ban Status: Currently banned somewhere");
            $("#userPageBanDays").html("Days since last ban: " + lastBanned);
        }
        else {
            $("#userBanStatus").html("Ban Status: All clear");
        }
        $("#userPageCommunityBan").html("Community Banned: " + communityBanned);
        $("#userPageEconomyBan").html("Economy Ban: " + economyBan);
        $("#userPageVACBanned").html("VAC Banned: " + vacBanned);
        $("#userPageVACBans").html("Number of VAC Bans on record: " + vacBans);
        $("#userPageGameBans").html("Number of bans in games: " + gameBans);
    })
        .fail(function () {
        console.log("fail");
    });
    $("#tabs").tabs();
}
//Get user owned games
function loadUserOwnedGames(steamId) {
    $.ajax({
        url: "http://aleu241-test.apigee.net/getownedgames",
        data: {
            key: apiKey,
            steamid: steamId,
            include_appinfo: 1,
            include_played_free_games: 1
        },
        method: "GET"
    })
        .done(function (userData) {
        var game = userData.response.games;
        var gameCount;
        if (typeof (userData.response.game_count) === "undefined") {
            gameCount = 0;
        }
        else {
            gameCount = userData.response.game_count;
        }
        $("#userOwnedGamesTabTitle").html("Owned Games (" + gameCount + ")");
        for (var i = 0; i < game.length; i++) {
            var gameLogo = void 0;
            if (game[i].img_logo_url === "") {
                gameLogo = "";
            }
            else {
                gameLogo = "http://media.steampowered.com/steamcommunity/public/images/apps/" + game[i].appid + "/" + game[i].img_logo_url + ".jpg";
            }
            var totalPlaytime = Math.floor(game[i].playtime_forever / 60) + " hours " + game[i].playtime_forever % 60 + " minutes on record";
            var lowerCaseGameName = game[i].name.toLowerCase();
            if (game[i].playtime_forever === 0) {
                totalPlaytime = "Never played";
            }
            var twoWeeksPlaytime = "";
            //only show play time within past 2 weeks if playtime_2weeks exists
            if (typeof game[i].playtime_2weeks !== "undefined") {
                twoWeeksPlaytime = Math.floor(game[i].playtime_2weeks / 60) + " hours " + game[i].playtime_2weeks % 60 + " minutes in the past 2 weeks";
            }
            //only create the game div if game has logo - i.e. official game, not "beta" test games that exist in the steam database
            if (gameLogo !== "") {
                $("#userOwnedGamesList").append("<div class=\"row\" id=\"" + lowerCaseGameName + "\" data-playtime=\"" + game[i].playtime_forever + "\">\n\t\t\t\t\t\t\t<div class=\"row\">\n\t\t\t\t\t\t\t\t<div class=\"col-md-3\">\n\t\t\t\t\t\t\t\t\t<img src=\"" + gameLogo + "\" class=\"gameLogo\" /></div>\n\t\t\t\t\t\t\t\t<div class=\"col-md-4 bold\">" + game[i].name + "</div>\n\t\t\t\t\t\t\t\t<div class=\"col-md-1\"></div>\n\t\t\t\t\t\t\t\t<div class=\"col-md-4\">\n\t\t\t\t\t\t\t\t\t<div class=\"row inheritPadding\">" + totalPlaytime + "</div>\n\t\t\t\t\t\t\t\t\t<div class=\"row inheritPadding\">" + twoWeeksPlaytime + "</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"row\"><hr/></div>\n\t\t\t\t\t\t</div>");
            }
        }
        sortGames();
        startSearchFunction();
    })
        .fail(function () {
        console.log("fail");
    });
}
//sorts the games
function sortGames() {
    //the list is sorted by game time by default
    sortByTime();
    //This monitors the select menu for sorting
    $("#sortButton").selectmenu({
        change: function (event, data) {
            var item = SelectedSort[$(data.item).attr("value")];
            getMenuItem(item);
        }
    });
    //calls each sorting algorithm depending on which menu item was selected
    function getMenuItem(item) {
        switch (item) {
            case 0:
                sortByAZ();
                break;
            case 1:
                sortByZA();
                break;
            case 2:
                sortByTime();
                break;
            case 3:
                sortByReverseTime();
                break;
            default:
                console.log("default");
        }
    }
    //sort by alphabetical order, numerals first
    function sortByAZ() {
        var obtainedGames = $("#userOwnedGamesList").children();
        obtainedGames.sort(function (a, b) {
            return $(a).attr("id") > $(b).attr("id") ? 1 : ($(a).attr("id") < $(b).attr("id") ? -1 : 0);
        });
        //this puts the sorted array of game divs into the container div
        $("#userOwnedGamesList").html(obtainedGames);
    }
    //sort by alphabetical order, numerals first
    function sortByZA() {
        var obtainedGames = $("#userOwnedGamesList").children();
        obtainedGames.sort(function (a, b) {
            return $(a).attr("id") < $(b).attr("id") ? 1 : ($(a).attr("id") > $(b).attr("id") ? -1 : 0);
        });
        //this puts the sorted array of game divs into the container div
        $("#userOwnedGamesList").html(obtainedGames);
    }
    //sort by play time
    function sortByTime() {
        var obtainedGames = $("#userOwnedGamesList").children();
        obtainedGames.sort(function (a, b) {
            return Number($(a).attr("data-playtime")) < Number($(b).attr("data-playtime")) ? 1 : (Number($(a).attr("data-playtime")) > Number($(b).attr("data-playtime")) ? -1 : 0);
        });
        //this puts the sorted array of game divs into the container div
        $("#userOwnedGamesList").html(obtainedGames);
    }
    //sort by reverse play time
    function sortByReverseTime() {
        var obtainedGames = $("#userOwnedGamesList").children();
        obtainedGames.sort(function (a, b) {
            return Number($(a).attr("data-playtime")) > Number($(b).attr("data-playtime")) ? 1 : Number($(a).attr("data-playtime")) < Number($(b).attr("data-playtime")) ? -1 : 0;
        });
        //this puts the sorted array of game divs into the container div
        $("#userOwnedGamesList").html(obtainedGames);
    }
}
//Starts the search function
function startSearchFunction() {
    $("#searchBar").button();
    $("#searchBar").keyup(function () {
        var searchQuery = $.trim($("#searchBar").val()).toLowerCase();
        var obtainedDivs = $("div[id*='" + searchQuery + "']");
        //hide everything when something typed, then start showing results
        $("#userOwnedGamesList").children().hide();
        //if nothing in search bar, show all
        if (searchQuery.length < 1) {
            $("#userOwnedGamesList").children().show();
        }
        for (var i = 0; i < obtainedDivs.length; i++) {
            if ($(obtainedDivs[i]).parent().attr("id") === "userOwnedGamesList") {
                $(obtainedDivs[i]).show();
            }
        }
    });
}
//# sourceMappingURL=userProfile.js.map