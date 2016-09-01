/// <reference path="jquery.d.ts" />
/// <reference path="sweetalert.d.ts" />
var apiKey = "4C70C8C5A2D0E11AF59A9CB6BBA60653";
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
        window.location.href = "/profile/userProfile.html#" + data.response.steamid;
    })
        .fail(function () {
        console.log("fail");
    });
}
window.onload = function () {
    document.addEventListener("keydown", keyboardInput);
};
//# sourceMappingURL=userSearch.js.map