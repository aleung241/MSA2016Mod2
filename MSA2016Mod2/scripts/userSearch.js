/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />
/// <reference path="sweetalert.d.ts" />
/// <reference path="es6-shim.d.ts" />
var apiKey = "4C70C8C5A2D0E11AF59A9CB6BBA60653";
window.onload = function () {
    document.addEventListener("keydown", keyboardInput);
    $("#userSearchButton").button();
};
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
        timer: 5
    }, function () {
        getUserString();
    });
}
//Gets the user input and process what to do with it
function getUserString() {
    var string = $.trim(document.getElementById("userSearchInput").value).toLowerCase();
    //Warning if input box is empty
    if (string.length === 0) {
        swal({
            title: "Please enter a username",
            type: "warning"
        });
        return;
    }
    //Warning if input is too short (one character)
    if (string.length <= 1) {
        swal({
            title: "Username is too short",
            type: "warning"
        });
        return;
    }
    getStringType(string);
}
function getStringType(input) {
    var searchQuery;
    //If string is a custom URL
    if (input.startsWith("http://steamcommunity.com/id/") || input.startsWith("https://steamcommunity.com/id/") || input.startsWith("http://www.steamcommunity.com/id/") || input.startsWith("https://www.steamcommunity.com/id/") || input.startsWith("www.steamcommunity.com/id/") || input.startsWith("steamcommunity.com/id/")) {
        searchQuery = input.substring(input.indexOf("/id/") + 4);
        //if url ends in /, remove it
        if (searchQuery.slice(-1) === "/") {
            searchQuery = searchQuery.substr(0, searchQuery.length - 1);
        }
        //we don't want white spaces in the search query
        if (hasWhiteSpaces(searchQuery)) {
            swal({
                title: "Invalid URL",
                text: "There are spaces in the URL",
                type: "warning"
            });
            return;
        }
        getVanityURL(searchQuery);
    }
    else if (input.startsWith("http://steamcommunity.com/profiles/") || input.startsWith("https://steamcommunity.com/profiles/") || input.startsWith("http://www.steamcommunity.com/profiles/") || input.startsWith("https://www.steamcommunity.com/profiles/") || input.startsWith("www.steamcommunity.com/profiles/") || input.startsWith("steamcommunity.com/profiles/")) {
        searchQuery = input.substring(input.indexOf("/profiles/") + 10);
        //if url ends in /, remove it
        if (searchQuery.slice(-1) === "/") {
            searchQuery = searchQuery.substr(0, searchQuery.length - 1);
        }
        //we don't want white spaces in the search query
        if (hasWhiteSpaces(searchQuery)) {
            swal({
                title: "Invalid URL",
                text: "There are spaces in the URL",
                type: "warning"
            });
            return;
        }
        getSteamIdURL(searchQuery);
    }
    else if (input.startsWith("7656119") && input.length === 17) {
        searchQuery = input;
        //if steamID ends in /, remove it
        if (searchQuery.slice(-1) === "/") {
            searchQuery = searchQuery.substr(0, searchQuery.length - 1);
        }
        getSteamIdURL(searchQuery);
    }
    else {
        //we don't want white spaces in the search query
        if (hasWhiteSpaces(input)) {
            swal({
                title: "Invalid username",
                text: "There are spaces in the username",
                type: "warning"
            });
            return;
        }
        getVanityURL(input);
    }
}
//checks if string has white spaces
function hasWhiteSpaces(string) {
    return string.indexOf(" ") >= 0;
}
function getVanityURL(string) {
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
        window.location.href = "/profile/userProfile.html#" + data.response.steamid;
    })
        .fail(function () {
        console.log("fail");
    });
}
function getSteamIdURL(string) {
    $.ajax({
        url: "http://aleu241-test.apigee.net/getplayersummaries",
        data: {
            key: apiKey,
            steamids: string
        },
        method: "GET"
    })
        .done(function (data) {
        if (data.response.players.length <= 0) {
            swal({
                title: "User ID " + string + " does not exist",
                type: "error"
            });
            return;
        }
        window.location.href = "/profile/userProfile.html#" + string;
    })
        .fail(function () {
        console.log("fail");
    });
}
//# sourceMappingURL=userSearch.js.map