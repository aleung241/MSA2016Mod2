/// <reference path="jquery.d.ts" />
/// <reference path="sweetalert.d.ts" />

var apiKey = "4C70C8C5A2D0E11AF59A9CB6BBA60653";

//enum for type of input
enum searchType {
	"fullVanityURL", "vanityId", "communityURL", "communityId"
}

function keyboardInput(event: KeyboardEvent) {
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
	},
		function () {
			getUserString();
		});
}

//API call to get the search's Steam ID
function getUserString() {
	var string = (<HTMLInputElement>document.getElementById("userSearchInput")).value;

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
		.done(data => {
			if (data.response.message === "No match") {
				swal({
					title: "User " + string + " does not exist",
					type: "error"
				});
				(<HTMLInputElement>document.getElementById("userSearchInput")).value = "";
				return;
			}
			window.location.href = "/profile/userProfile.html#" + data.response.steamid;
		})
		.fail(() => {
			console.log("fail");
		});
}

function getStringType(input: string) {
	var string;
}

window.onload = () => {
	document.addEventListener("keydown", keyboardInput);
}