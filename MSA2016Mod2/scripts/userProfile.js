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
//Let's create a user class...just in case we need to use it...
var User = (function () {
    function User(steamId, displayName, lastLogOff, profileUrl, avatar32, avatar64, avatar184, status) {
        this.steamId = steamId;
        this.displayName = displayName;
        this.lastLogOff = lastLogOff;
        this.profileUrl = profileUrl;
        this.avatar32 = avatar32;
        this.avatar64 = avatar64;
        this.avatar184 = avatar184;
        this.status = status;
    }
    return User;
}());
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
//This creates the user from the 2 API calls
function createNewUser(userData) {
    console.log(userData);
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
    //creates new user, then displays info on page
    var user = new User(steamId, displayName, lastLogOff, profileUrl, avatar32, avatar64, avatar184, status);
    $("#userPageSteamId").html("Steam ID: " + steamId);
    $("#userPageDisplayName").html(displayName);
    $("#userPageProfileUrlWrapper").attr("value", "test");
    $("#userPageProfileUrl").attr("href", profileUrl);
    $("#userPageLastLogOff").html("Last seen: " + lastLogOff);
    $("#userPageStatus").html("Currently " + status);
    $("#userPageAvatarSml").attr("src", avatar32);
    $("#userPageAvatarMed").attr("src", avatar64);
    $("#userPageAvatarLrg").attr("src", avatar184);
    loadUserBanStatus(steamId);
}
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
//# sourceMappingURL=userProfile.js.map