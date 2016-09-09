/// <reference path="jquery.d.ts" />
/// <reference path="sweetalert.d.ts" />
var apiKey = "4C70C8C5A2D0E11AF59A9CB6BBA60653";
//enum for type of input
var searchType;
(function (searchType) {
    searchType[searchType["fullVanityURL"] = 0] = "fullVanityURL";
    searchType[searchType["vanityId"] = 1] = "vanityId";
    searchType[searchType["communityURL"] = 2] = "communityURL";
    searchType[searchType["communityId"] = 3] = "communityId";
})(searchType || (searchType = {}));
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
//API call to get the search's Steam ID
function getUserString() {
    var string = document.getElementById("userSearchInput").value;
    //Warning if input box is empty
    if (string.length === 0) {
        swal({
            title: "Please enter a username",
            type: "warning"
        });
        return;
    }
    getStringType(string);
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
        window.location.href = "/profile/userProfile.html#" + data.response.steamid;
    })
        .fail(function () {
        console.log("fail");
    });
}
function getStringType(input) {
    var string;
}
window.onload = function () {
    document.addEventListener("keydown", keyboardInput);
};
//# sourceMappingURL=userSearch.js.map