/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts"/>

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
	displayName: string;
	lastLogOff: string;
	profileUrl: string;
	avatar32: string;
	avatar64: string;
	avatar184: string;
	status: string;

	constructor(steamId: string, displayName: string, lastLogOff: string, profileUrl: string, avatar32: string, avatar64: string, avatar184: string, status: string) {
		this.steamId = steamId;
		this.displayName = displayName;
		this.lastLogOff = lastLogOff;
		this.profileUrl = profileUrl;
		this.avatar32 = avatar32;
		this.avatar64 = avatar64;
		this.avatar184 = avatar184;
		this.status = status;
	}
}

$(document).ready(() => {
	getUserSummaries();
});


//Using the Steam ID, we can now call another API to grab the profile data it is associated with :D
function getUserSummaries() {
	//gets the steamid from url hash
	var steamId: string = window.location.hash.substr(1);

	$.ajax({
		url: "http://aleu241-test.apigee.net/getplayersummaries",
		data: {
			key: apiKey,
			steamids: steamId
		},
		method: "GET"
	})
		.done(userData => {
			createNewUser(userData.response.players[0]);
		})
		.fail(() => {
			console.log("fail");
		});
}

//This creates the user from the 2 API calls
function createNewUser(userData: any) {

	var steamId: string = userData.steamid;
	var displayName: string = userData.personaname;
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
	var lastLogOff = utcTime;

	//creates new user, then displays info on page
	var user: User = new User(steamId, displayName, lastLogOff, profileUrl, avatar32, avatar64, avatar184, status);
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
function loadUserSteamLevel(steamId: string) {
	$.ajax({
		url: "http://aleu241-test.apigee.net/getsteamlevel",
		data: {
			key: apiKey,
			steamid: steamId
		},
		method: "GET"
	})
		.done(userData => {
			$("#userSteamLevel").html("Steam level: " + userData.response.player_level);
		})
		.fail(() => {
			console.log("fail");
		});
}

//Get ban status of user and displays it on user page
function loadUserBanStatus(steamId: string) {
	var isBanned: boolean;
	var communityBanned: boolean;
	var lastBanned: number;
	var economyBan: string;
	var vacBanned: boolean;
	var gameBans: number;
	var vacBans: number;

	$.ajax({
		url: "http://aleu241-test.apigee.net/getplayerbans",
		data: {
			key: apiKey,
			steamids: steamId
		},
		method: "GET"
	})
		.done(userData => {
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
			} else {
				$("#userBanStatus").html("Ban Status: All clear");
			}
			$("#userPageCommunityBan").html("Community Banned: " + communityBanned);
			$("#userPageEconomyBan").html("Economy Ban: " + economyBan);
			$("#userPageVACBanned").html("VAC Banned: " + vacBanned);
			$("#userPageVACBans").html("Number of VAC Bans on record: " + vacBans);
			$("#userPageGameBans").html("Number of bans in games: " + gameBans);
		})
		.fail(() => {
			console.log("fail");
		});
	$("#tabs").tabs();
}

//Get user owned games
function loadUserOwnedGames(steamId: string) {
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
		.done(userData => {
			var game = userData.response.games;
			$("#userOwnedGamesTabTitle").html("Owned Games (" + userData.response.game_count + ")");
			for (var i = 0; i < game.length; i++) {
				var gameLogo: string = "http://media.steampowered.com/steamcommunity/public/images/apps/" + game[i].appid + "/" + game[i].img_logo_url + ".jpg";
				var totalPlaytime: string = Math.floor(game[i].playtime_forever / 60) + " hours " + game[i].playtime_forever % 60 + " minutes on record";
				if (game[i].playtime_forever === 0) {
					totalPlaytime = "Never played";
				}
				var twoWeeksPlaytime: string = "";
				if (typeof game[i].playtime_2weeks !== "undefined") {
					twoWeeksPlaytime = Math.floor(game[i].playtime_2weeks / 60) + " hours " + game[i].playtime_2weeks % 60 + " minutes in the past 2 weeks";
				}

				//$("#userOwnedGamesTable").append(
				//	"<tr class=\"gamesTableBorderBottom\">" +
				//	"<td><img src=\"" + gameLogo + "\" /></td>" +
				//	"<td class=\"bold\">" + game[i].name + "</td>" +
				//	"<td>" + totalPlaytime + "</td>" +
				//	"<td>" + twoWeeksPlaytime + "</td>" +
				//	"</tr>"
				//);

				$("#userOwnedGamesList").append(
					"<div class=\"row\">" +
					"<div class=\"col-md-3\"><img src=\"" + gameLogo + "\" /></div>" +
					"<div class=\"col-md-4 bold\">" + game[i].name + "</div>" +
					"<div class=\"col-md-1\"></div>" +
					"<div class=\"col-md-4\">" +
					"<div class=\"row\">" + totalPlaytime + "</div>" +
					"<div class=\"row\">" + twoWeeksPlaytime + "</div>" +
					"</div></div><hr/>"
				);
			}
		})
		.fail(() => {
			console.log("fail");
		});
}

//Get user badges
function loadUserBadges(steamId: string) {
	$.ajax({
		url: "http://aleu241-test.apigee.net/getbadges",
		data: {
			key: apiKey,
			steamid: steamId
		},
		method: "GET"
	})
		.done(userData => {
			console.log(userData);
		})
		.fail(() => {
			console.log("fail");
		});
}