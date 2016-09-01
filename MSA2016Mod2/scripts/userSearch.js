/// <reference path="jquery.d.ts" />
/// <reference path="sweetalert.d.ts" />
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
    function User(steamId, userName, displayName, lastLogOff, profileUrl, avatar32, avatar64, avatar184, status) {
        this.steamId = steamId;
        this.userName = userName;
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
function keyboardInput(event) {
    if ($("#userSearchInput").is(":focus")) {
        if (event.keyCode === 13) {
            searchPopup();
        }
    }
}
function searchPopup() {
    swal({
        title: "Searching for user...",
        type: "info",
        showConfirmButton: false,
        showLoaderOnConfirm: true,
        timer: 5
    }, function () {
        getUserString();
    });
}
//API call to get the search's Steam ID
function getUserString() {
    var string = document.getElementById("userSearchInput").value;
    //clears the user information after the search has started
    $("#errorMessage").html("");
    $("#userPageUserName").html("");
    $("#userPageSteamId").html("");
    $("#userPageDisplayName").html("");
    $("#userPageProfileUrl").html("");
    $("#userPageLastLogOff").html("");
    $("#userPageStatus").html("");
    $("#userPageAvatarSml").attr("src", "");
    $("#userPageAvatarMed").attr("src", "");
    $("#userPageAvatarLrg").attr("src", "");
    //Displays if nothing has is in input box but a search has been requested
    if (string.length === 0) {
        swal({
            title: "Please enter a username",
            type: "warning"
        });
        //$("#errorMessage").html("Please enter a username");
        return;
    }
    //The exciting part - the very first API call!
    $.ajax({
        url: "http://aleu241-test.apigee.net/vanityurl",
        data: {
            key: apiKey,
            vanityurl: string
        },
        method: "GET"
    })
        .done(function (data) {
        if (data.response.message === "No match") {
            swal({
                title: "User " + string + " does not exist",
                type: "error"
            });
            document.getElementById("userSearchInput").value = "";
            return;
        }
        getUserSummaries(data.response, string);
    })
        .fail(function () {
        console.log("fail");
    });
}
//Using the Steam ID, we can now call another API to grab the profile data it is associated with :D
function getUserSummaries(data, userName) {
    var steamId = data.steamid;
    $.ajax({
        url: "http://aleu241-test.apigee.net/getplayersummaries",
        data: {
            key: apiKey,
            steamids: steamId
        },
        method: "GET"
    })
        .done(function (userData) {
        swal.close();
        createNewUser(userData.response.players[0], userName);
    })
        .fail(function () {
        console.log("fail");
    });
}
//This creates the user from the 2 API calls
function createNewUser(userData, userName) {
    //Clears the input box
    document.getElementById("userSearchInput").value = "";
    console.log(userData);
    var steamId = userData.steamid;
    var displayName = userData.personaname;
    var lastLogOff;
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
    lastLogOff = utcTime;
    //creates new user, then displays info on page
    var user = new User(steamId, userName, displayName, lastLogOff, profileUrl, avatar32, avatar64, avatar184, status);
    $("#userPageUserName").html("Search query: " + userName);
    $("#userPageSteamId").html("Steam ID: " + steamId);
    $("#userPageDisplayName").html("Current display name: " + displayName);
    $("#userPageProfileUrlWrapper").attr("value", "test");
    $("#userPageProfileUrl").attr("href", profileUrl).html(profileUrl);
    $("#userPageLastLogOff").html("Last seen: " + lastLogOff);
    $("#userPageStatus").html("Current user status: " + status);
    $("#userPageAvatarSml").attr("src", avatar32);
    $("#userPageAvatarMed").attr("src", avatar64);
    $("#userPageAvatarLrg").attr("src", avatar184);
}
window.onload = function () {
    document.addEventListener("keydown", keyboardInput);
};
//# sourceMappingURL=userSearch.js.map