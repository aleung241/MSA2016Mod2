/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts"/>

var apiKey: string = "4C70C8C5A2D0E11AF59A9CB6BBA60653";

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

//enum for owned games sorting menu
enum SelectedSort {
	"az", "za", "mostPlayed", "leastPlayed"
}

$(document).ready(() => {
	getUserSummaries();
});


//Using the Steam ID, we can now call another API to grab the profile data it is associated with :D
function getUserSummaries() {
	//gets the steamid from url hash
	const steamId: string = window.location.hash.substr(1);

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

//This creates the user from the API call
function createNewUser(userData: any) {

	const steamId: string = userData.steamid;
	const displayName: string = userData.personaname;
	const profileUrl: string = userData.profileurl;
	const avatar32: string = userData.avatar;
	const avatar64: string = userData.avatarmedium;
	const avatar184: string = userData.avatarfull;
	const statusNum: number = userData.personastate;
	const status = PersonaStatus[statusNum];

	//Convert UNIX timestamp to UTC
	//Change to milliseconds, from seconds
	const date = new Date(userData.lastlogoff * 1000);
	//0 just in case single digit. substr -2 to get last 2 digits
	const hours: string = `0${date.getUTCHours()}`;
	const minutes: string = `0${date.getUTCMinutes()}`;
	const seconds: string = `0${date.getUTCSeconds()}`;
	const day: number = date.getUTCDate();
	const month: number = date.getUTCMonth();
	const year: number = date.getUTCFullYear();
	const dayOfWeek: number = date.getUTCDay();

	//Creates the string in the format of [HH:MM:SS Day Date Month Year] for "Last seen"
	const utcTime: string = hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2) + " " + DayOfWeek[dayOfWeek] + " " + day + " " + Month[month] + " " + year;
	const lastLogOff: string = utcTime;

	//Sisplays info on page
	$("#userPageSteamId").html(`Steam ID: ${steamId}`);
	$("#userPageDisplayName").html(displayName);
	$("#userPageProfileUrlWrapper").attr("value", "test");
	$("#userPageProfileUrl").attr("href", profileUrl);
	$("#userPageLastLogOff").html(`Last seen: ${lastLogOff}`);
	$("#userPageStatus").html(`Currently ${status}`);
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
			$("#userSteamLevel").html(`Steam level: ${userData.response.player_level}`);
		})
		.fail(() => {
			console.log("fail");
		});
}

//Get ban status of user and displays it on user page
function loadUserBanStatus(steamId: string) {
	let isBanned: boolean;
	let communityBanned: boolean;
	let lastBanned: number;
	let economyBan: string;
	let vacBanned: boolean;
	let gameBans: number;
	let vacBans: number;

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
			$("#userPageCommunityBan").html(`Community Banned: ${communityBanned}`);
			$("#userPageEconomyBan").html(`Economy Ban: ${economyBan}`);
			$("#userPageVACBanned").html(`VAC Banned: ${vacBanned}`);
			$("#userPageVACBans").html(`Number of VAC Bans on record: ${vacBans}`);
			$("#userPageGameBans").html(`Number of bans in games: ${gameBans}`);
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
			const game: any = userData.response.games;
			let gameCount: number;
			if (typeof (userData.response.game_count) === "undefined") {
				gameCount = 0;
			} else {
				gameCount = userData.response.game_count;
			}
			$("#userOwnedGamesTabTitle").html(`Owned Games (${gameCount})`);
			for (let i = 0; i < game.length; i++) {
				let gameLogo: string;
				if (game[i].img_logo_url === "") {
					gameLogo = "";
				} else {
					gameLogo = "http://media.steampowered.com/steamcommunity/public/images/apps/" + game[i].appid + "/" + game[i].img_logo_url + ".jpg";
				}
				let totalPlaytime: string = Math.floor(game[i].playtime_forever / 60) + " hours " + game[i].playtime_forever % 60 + " minutes on record";
				const lowerCaseGameName: string = game[i].name.toLowerCase();
				if (game[i].playtime_forever === 0) {
					totalPlaytime = "Never played";
				}
				let twoWeeksPlaytime: string = "";
				//only show play time within past 2 weeks if playtime_2weeks exists
				if (typeof game[i].playtime_2weeks !== "undefined") {
					twoWeeksPlaytime = Math.floor(game[i].playtime_2weeks / 60) + " hours " + game[i].playtime_2weeks % 60 + " minutes in the past 2 weeks";
				}

				//only create the game div if game has logo - i.e. official game, not "beta" test games that exist in the steam database
				if (gameLogo !== "") {
					$("#userOwnedGamesList").append(
						`<div class="row" id="${lowerCaseGameName}" data-playtime="${game[i].playtime_forever}">
							<div class="row">
								<div class="col-md-3">
									<img src="${gameLogo}" class="gameLogo" /></div>
								<div class="col-md-4 bold">${game[i].name}</div>
								<div class="col-md-1"></div>
								<div class="col-md-4">
									<div class="row inheritPadding">${totalPlaytime}</div>
									<div class="row inheritPadding">${twoWeeksPlaytime}</div>
								</div>
							</div>
							<div class="row"><hr/></div>
						</div>`
					);
				}
			}
			sortGames();
			startSearchFunction();
		})
		.fail(() => {
			console.log("fail");
		});
}

//sorts the games
function sortGames() {

	//the list is sorted by game time by default
	sortByTime();

	//This monitors the select menu for sorting
	$("#sortButton").selectmenu({
		change: (event, data) => {
			const item = SelectedSort[$(data.item).attr("value")];
			getMenuItem(item);
		}
	});

	//calls each sorting algorithm depending on which menu item was selected
	function getMenuItem(item: number) {
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
		const obtainedGames: any = $("#userOwnedGamesList").children();
		obtainedGames.sort((a, b) => {
			return $(a).attr("id") > $(b).attr("id") ? 1 : ($(a).attr("id") < $(b).attr("id") ? -1 : 0);
		});

		//this puts the sorted array of game divs into the container div
		$("#userOwnedGamesList").html(obtainedGames);
	}

	//sort by alphabetical order, numerals first
	function sortByZA() {
		const obtainedGames: any = $("#userOwnedGamesList").children();
		obtainedGames.sort((a, b) => {
			return $(a).attr("id") < $(b).attr("id") ? 1 : ($(a).attr("id") > $(b).attr("id") ? -1 : 0);
		});

		//this puts the sorted array of game divs into the container div
		$("#userOwnedGamesList").html(obtainedGames);
	}

	//sort by play time
	function sortByTime() {
		const obtainedGames: any = $("#userOwnedGamesList").children();
		obtainedGames.sort((a: number, b: number) => {
			return Number($(a).attr("data-playtime")) < Number($(b).attr("data-playtime")) ? 1 : (Number($(a).attr("data-playtime")) > Number($(b).attr("data-playtime")) ? -1 : 0);
		});

		//this puts the sorted array of game divs into the container div
		$("#userOwnedGamesList").html(obtainedGames);
	}

	//sort by reverse play time
	function sortByReverseTime() {
		const obtainedGames: any = $("#userOwnedGamesList").children();
		obtainedGames.sort((a: number, b: number) => {
			return Number($(a).attr("data-playtime")) > Number($(b).attr("data-playtime")) ? 1 : Number($(a).attr("data-playtime")) < Number($(b).attr("data-playtime")) ? -1 : 0;
		});

		//this puts the sorted array of game divs into the container div
		$("#userOwnedGamesList").html(obtainedGames);
	}
}

//Starts the search function
function startSearchFunction() {
	$("#searchBar").button();
	$("#searchBar").keyup(() => {
		const searchQuery: string = $.trim($("#searchBar").val()).toLowerCase();
		const obtainedDivs: JQuery = $(`div[id*='${searchQuery}']`);
		//hide everything when something typed, then start showing results
		$("#userOwnedGamesList").children().hide();
		//if nothing in search bar, show all
		if (searchQuery.length < 1) {
			$("#userOwnedGamesList").children().show();
		}
		for (let i = 0; i < obtainedDivs.length; i++) {
			if ($(obtainedDivs[i]).parent().attr("id") === "userOwnedGamesList") {
				$(obtainedDivs[i]).show();
			}
		}
	});
}
