/// <reference path="jquery.d.ts" />
/// <reference path="sweetalert.d.ts" />

var apiKey = "4C70C8C5A2D0E11AF59A9CB6BBA60653";

//This is for date.getUTCDay()'s returned number
enum DayOfWeek {
	Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
}

//enum for months for date.getUTCMonth()
enum Month {
	January, February, March, April, May, June, July, August, September, October, November, December
}

//enum for user profile status
enum PersonaStatus {
	"Offline/Private profile", Online, Busy, Away, Snooze, "Looking to trade", "Looking to play"
}

//Let's create a user class...just in case we need to use it...
class User {
	steamId: string;
	userName: string;
	displayName: string;
	lastLogOff: string;
	profileUrl: string;
	avatar32: string;
	avatar64: string;
	avatar184: string;
	status: string;

	constructor(steamId: string, userName: string, displayName: string, lastLogOff: string, profileUrl: string, avatar32: string, avatar64: string, avatar184: string, status: string) {
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
	function() {
		getUserString();
	});
}

//API call to get the search's Steam ID
function getUserString() {
	var string = (<HTMLInputElement>document.getElementById("userSearchInput")).value;

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
		.done(data => {
			if (data.response.message === "No match") {
				swal({
					title: "User " + string + " does not exist",
					type: "error"
				});
				(<HTMLInputElement>document.getElementById("userSearchInput")).value = "";
				return;
			}
			getUserSummaries(data.response, string);
		})
		.fail(() => {
			console.log("fail");
		});
}

//Using the Steam ID, we can now call another API to grab the profile data it is associated with :D
function getUserSummaries(data: any, userName: string) {
	var steamId: string = data.steamid;
	$.ajax({
		url: "http://aleu241-test.apigee.net/getplayersummaries",
		data: {
			key: apiKey,
			steamids: steamId
		},
		method: "GET"
	})
		.done(userData => {
			swal.close();
			createNewUser(userData.response.players[0], userName);
		})
		.fail(() => {
			console.log("fail");
		});
}

//This creates the user from the 2 API calls
function createNewUser(userData: any, userName: string) {

	//Clears the input box
	(<HTMLInputElement>document.getElementById("userSearchInput")).value = "";

	console.log(userData);
	var steamId: string = userData.steamid;
	var displayName: string = userData.personaname;
	var lastLogOff: string;
	var profileUrl: string = userData.profileurl;
	var avatar32: string = userData.avatar;
	var avatar64: string = userData.avatarmedium;
	var avatar184: string = userData.avatarfull;
	var statusNum: number = userData.personastate;
	var status: string = PersonaStatus[statusNum];

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
	var user: User = new User(steamId, userName, displayName, lastLogOff, profileUrl, avatar32, avatar64, avatar184, status);
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

window.onload = () => {
	document.addEventListener("keydown", keyboardInput);
}