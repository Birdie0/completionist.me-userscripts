// ==UserScript==
// @name         Steam Hunters AStats
// @namespace    https://completionist.me/tools
// @icon         https://steamhunters.com/content/img/steam_hunters.svg
// @version      2.10.0
// @description  Steam Hunters integration for AStats
// @author       luchaos
// @match        http://astats.astats.nl/astats/*
// @match        https://astats.astats.nl/astats/*
// @supportUrl   https://completionist.me/feedback
// @updateURL    https://github.com/Birdie0/completionist.me-userscripts/raw/mod/steamhunters-astats.user.js
// @downloadURL  https://github.com/Birdie0/completionist.me-userscripts/raw/mod/steamhunters-astats.user.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @require      https://peterolson.github.io/BigInteger.js/BigInteger.min.js
// @run-at       document-end
// @inject-into  content
// ==/UserScript==

'use strict'
var version = '2.10.0'
var url = new URL(window.location.href.toLowerCase())
var fragment = url.pathname.match(/([^\/]*)\/*$/)[1]
var fragments = url.pathname.split('/')

var steam = (function () {

  var isUserInstanceId = function (profileId) {
    if (profileId > 0 && bigIntCapable()) {
      return bigInt(profileId).toString() === userInstanceProfileId(profileId)
    }
    return true
  }

  var userInstanceProfileId = function (profileId) {
    return bigInt(profileId).and(0xffffffff).add(bigInt('110000100000000', 16)).toString()
  }

  var bigIntCapable = function () {
    return bigInt('110000100000000', 16).toString() === '76561197960265728'
  }

  return {
    isUserIstanceId: isUserInstanceId,
    userInstanceProfileId: userInstanceProfileId,
  }
})()

var steamStore = (function () {

  var id = 'steamstore'
  var name = 'Steam Store'

  var inject = function (provider) {
    var providerKey = provider.id + '-' + id
    if ($('head meta[content="' + providerKey + '"]').length) {
      return
    }
    provider.params({appId: fragments[2]})
    injectHubHeaderAppLink(provider)
    // injectSidebarWidget(provider);
    injectSidebarAchievements(provider)
    $('head').append('<meta name="userscript" content="' + providerKey + '">')
    injectAppsAnalyzer(provider)
  }

  var injectHubHeaderAppLink = function (provider) {
    var steamAppLink = provider.steamAppLink()
    if (!steamAppLink) {
      return
    }
    var providerLink = $('<a class="btnv6_blue_hoverfade btn_medium" style="margin-left: 3px" href="' + steamAppLink + '" title="View on ' + provider.name + '" target="_blank">' +
      '<span data-tooltip-text="View on ' + provider.name + '">' + provider.icon(16) + '</span>' +
      '</a>')
    var linkContainer = $('.apphub_OtherSiteInfo .userscript')
    if (!linkContainer.length) {
      linkContainer = $('<span class="userscript"></span>')
      $('.apphub_OtherSiteInfo').prepend(linkContainer)
      linkContainer = $('.apphub_OtherSiteInfo .userscript')
    }
    linkContainer.append(providerLink)
  }

  var injectSidebarWidget = function (provider) {
    var steamAppLink = provider.steamAppLink()
    if (!steamAppLink) {
      return
    }
    var rightColWidget = $('<div class="block responsive_apppage_details_left"></div>')
    rightColWidget.append('<div class="block_header"><h4>' + provider.icon(28) + ' ' + provider.name + ' <small style="color:#5c5c5c">userscript v' + version + '</small></h4></div>')
    var rightColWidgetContent = $('<div class="block_content"><div class="block_content_inner"></div></div>')
    var linksBlock = $('<div class="details_block"></div>')
    var providerLink = $('<a class="linkbar" target="_blank" href="' + steamAppLink + '" style="display: block; margin-bottom: 6px;">App on ' + provider.name + ' <img src="https://steamstore-a.akamaihd.net/public/images/v5/ico_external_link.gif" border="0" align="bottom"></a>')
    linksBlock.append(providerLink)
    rightColWidgetContent.append(linksBlock)
    rightColWidget.append(rightColWidgetContent)
    $('.page_content > .rightcol.game_meta_data').prepend(rightColWidget)
  }

  var injectSidebarAchievements = function (provider) {
    var steamAppLink = provider.steamAppLink()
    if (!steamAppLink) {
      return
    }
    var providerLink = '<div class="game_area_details_specs">' +
      '<div class="icon" style="padding-left: 10px">' +
      '<a href="' + steamAppLink + '">' + provider.icon(16) + '</a>' +
      '</div>' +
      '<a class="name" href="' + steamAppLink + '" target="_blank">' + provider.name + '</a>' +
      '</div>'
    $('.page_content > .rightcol.game_meta_data #achievement_block').append(providerLink)
  }

  var injectAppsAnalyzer = function (provider) {
    if (provider.id !== 'cme') {
      return
    }
    var g_AccountID = window.eval('window.g_AccountID')
    $.get('https://store.steampowered.com/dynamicstore/userdata/?id=' + g_AccountID, function (data) {
      var content = $('<form class="content" action="https://completionist.me/steam/recover/store" method="post" target="_blank"></form>')
      content.append($('<input type="hidden" name="app_ids" value="' + data.rgOwnedApps.join(',') + '" readonly>'))
      // content.append($('<input type="hidden" name="account_id" value="' + g_AccountID + '" readonly>'));
      var submitButton = $('<button type="submit" class="btn_grey_white_innerfade btn_small" style="width: 100%"><span style="padding: 6px">' + provider.icon(22) + ' Check ' + data.rgOwnedApps.length + ' apps</span></button>')
      content.append(submitButton)
      var analyzer = $('<div></div>')
      analyzer.append(content)
      $('.home_page_gutter').prepend(analyzer)
    })
  }

  return {
    id: id,
    name: name,
    inject: inject
  }
})()

var steamCommunity = (function () {

  var id = 'steamcommunity'
  var name = 'Steam Community'

  var profileId = typeof g_rgProfileData !== 'undefined' ? g_rgProfileData.steamid : false
  if (profileId > 0 && !steam.isUserIstanceId(profileId)) {
    var userInstanceProfileId = steam.userInstanceProfileId(profileId)
    var message = '<div class="userscript-steamid-message" style="position: absolute; top: 30vh;left:0;right:0; background: rgba(0,0,0,0.7); z-index:999; color: white; text-align:center; padding: 50px 20px;">' +
      '<p style="margin-bottom: 6px; color: orange; font-size: 20px"><b>Wrong Steam ID!</b></p>' +
      '<p style="margin-bottom: 6px">' +
      'Should be <code style="color: lightgreen; background: black">' + userInstanceProfileId + '</code> ' +
      'instead of <code style="color: lightcoral;  background: black">' + profileId + '</code>' +
      '</p>' +
      '<p style="margin-bottom: 12px">' +
      '<a style="color: lightblue; text-decoration: underline" href="https://steamcommunity.com/profiles/' + userInstanceProfileId + '">' +
      'Go to the correct one' +
      '</a>' +
      '</p>' +
      '<p style="margin-bottom: 6px; font-style: italic">' +
      'Came here via Discord?<br>' +
      '<a style="color: lightblue; font-style: italic; text-decoration: underline" href="https://github.com/discordapp/discord-api-docs/issues/271" target="_blank">See related issue</a>' +
      '</p>' +
      '</div>'
    if (!$('body > .userscript-steamid-message').length) {
      $('body').prepend(message)
    }
    profileId = userInstanceProfileId
  }

  var fragment = fragments[1] === 'app' ? 'app' : fragment
  var resourceMap = {
    'app': 'app',
    'games': 'profile-apps',
    'wishlist': 'profile-apps'
  }
  var resource = resourceMap[fragment] || 'profile'

  var inject = function (provider) {
    var providerKey = provider.id + '-' + id
    if ($('head meta[content="' + providerKey + '"]').length) {
      return
    }
    provider.banner()
    switch (resource) {
      case 'app':
        provider.params({appId: fragments[2]})
        injectHubHeaderAppLink(provider)
        break
      case 'profile':
        provider.params({profileId: profileId})
        injectProfileCountsLink(provider)
        injectAppsAnalyzer(provider)
        break
      case 'profile-apps':
        provider.params({profileId: profileId})
        injectAppsListLinks(provider)
        break
    }
    $('head').append('<meta name="userscript" content="' + providerKey + '">')
  }

  var injectHubHeaderAppLink = function (provider) {
    var steamAppLink = provider.steamAppLink()
    if (!steamAppLink) {
      return
    }
    var providerLink = $('<a class="btnv6_blue_hoverfade btn_medium" style="margin-left: 3px" ' +
      'href="' + steamAppLink + '" ' +
      'title="View on ' + provider.name + '" target="_blank">' +
      '<span data-tooltip-text="View on ' + provider.name + '">' +
      '<img class="ico16" style="vertical-align:-10px;background: none;" src="' + provider.iconUrl + '">' +
      '</span>' +
      '</a>')
    var linkContainer = $('.apphub_OtherSiteInfo .userscript')
    if (!linkContainer.length) {
      linkContainer = $('<span class="userscript"></span>')
      $('.apphub_OtherSiteInfo').prepend(linkContainer)
      linkContainer = $('.apphub_OtherSiteInfo .userscript')
    }
    linkContainer.append(providerLink)
  }

  var injectProfileCountsLink = function (provider) {
    var linkContainer = $('<div class="profile_count_link"></div>')
    var providerLink = $('<a class="" target="_blank" href="' + provider.steamProfileLink() + '" style="display: block;"><span class="count_link_label">' + provider.name + ' <span class="profile_count_link_total">' + provider.icon(20) + '</span></span></a>')
    linkContainer.append(providerLink)
    $('.profile_item_links').append(linkContainer)
  }

  var injectAppsListLinks = function (provider) {
    var steamAppLink = provider.steamAppLink()
    if (!steamAppLink) {
      return
    }
    $('.gameListRow, .wishlist_row').each(function () {
      var appUrl = new URL($('a.pullup_item', this).attr('href'))
      var appId = appUrl.pathname.match(/([^\/]*)\/*$/)[1]
      var providerLink = $('<a class="pullup_item" target="_blank" style="padding-bottom: 4px" href="' + provider.steamAppLink(appId, profileId) + '"><div class="menu_ico" style="padding: 0 7px 0 6px">' + provider.icon(16) + '</div>' + provider.name + '</a>')
      $('.bottom_controls', this).append(providerLink)
    })
  }

  var injectAppsAnalyzer = function (provider) {
    if (provider.id !== 'cme') {
      return
    }
    var g_rgAchievementShowcaseGamesWithAchievements = window.eval('window.g_rgAchievementShowcaseGamesWithAchievements')
    if (!g_rgAchievementShowcaseGamesWithAchievements) {
      return
    }
    var ids = g_rgAchievementShowcaseGamesWithAchievements.map(function (app) {
      return app.appid
    }).sort(function (a, b) {
      return a - b
    })
    var content = $('<form class="content" action="https://completionist.me/steam/recover/profile" method="post" target="_blank"></form>')
    content.append($('<input type="hidden" name="app_ids" value="' + ids.join(',') + '" readonly>'))
    content.append($('<input type="hidden" name="profile_id" value="' + profileId + '" readonly>'))
    var submitButton = $('<button type="submit" class="btn_grey_white_innerfade btn_small" style="width: 100%"><span>Check ' + ids.length + ' apps on completionist.me</span></button>')
    content.append(submitButton)
    var analyzer = $('<div class="rightbox" style="margin-top:20px"><div class="rightbox_content_header">' + provider.icon(22) + ' completionist.me Apps Analyzer</div></div>')
    analyzer.append(content)
    $('.leftcol').append(analyzer)
  }

  return {
    id: id,
    name: name,
    inject: inject
  }
})()

/**
 * Includes contributions, inspirations and help from: Rudey, Sellyme, SnowyLuma
 * @type {{steamAppLink, name, icon, banner, steamProfileLink, id, iconUrl, params, inject, enhance}}
 */
const astats = (function () {

  const id = 'astats'
  const name = 'AStats'
  const iconUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAMAAAC7m5rvAAABUFBMVEUAAAAAAAAAAAA9PTwAAAAyMjABAQEAAAAAAAAAAAAAAAAVFRIrKyYXFxQICAcBAQEEBAQAAAACAgIpKSYAAAAvLy4kJCDo6Ob39/YAAAAREQ4DAwIAAAAAAAD19fIxMS4AAADz8+/y8u/t7ewmJiP19fMGBgYnJyZgYFspKSj19fJzc3AyMjD29vIAAAADAwLl5eEgIB4cHBldXVrn5+L09PCfn4/q6uZ3d217e3ZCQjy/v7nPz8O8vLL09PDl5dRvb22np5+6uq+SkpCGhnmcnJLPz8azs54tLSspKSeHh4eNjY35+fk4ODfBwcDk5OMkJCOWlpZ3d3WSkpF7e3ofHx+KiorQ0M/d3d3X19Z/f368vLrp6ee3t7akpKOgoJ7T09Ktra1kZGOcnJz09PPKysqoqKhZWVmysrKCgoJQUE/w8PBtbW3s7OvExMTHx8dXNYSiAAAAUHRSTlMAEAb9L/6PAwwiFRvxxUt2UyiXxWrn2RPwfbNjPzR82zhrv82h1FyGwbOf/PVGRaLgjm/zJjVRj05yX+3PYVi2jeGXl9vg2qf//////////rVQSu8AAARmSURBVHjazZUFd+PIEoVjSzIzhpmZcXje223ZYsssMsrs/39wqxVlM2E4tF/QpVtHt+F2T/xHOHO7P9PF/PA7P962zJwc+z/ctcQw5sKs54Nd6UmmmSG2oh+0uc0ww1aP+KDNPYbp83yD/aDNNdzFGzvsqvcDqzDPNPkSUO0R674PzEdzWMKUc+zC4rttbjf7pTJglMd19ui9NvfAYtmwKLaJ5LrjnfPRVIziLa1xhY3POd81H81+udVqjcYtYKya77MJ81FqjUealK2OR6MRJ7LJ0DtsbveV1mhUoyhKHHGAOqC2yDdt7jX7BogligqKHFetVtV2j9rwv2VzrV8CcQ1RqdhPrqoCnQKV3Pe8MR99ZQRSGVHTM1etagfTrr9lMz05NLAQoaRr1v+l2qkBbZGgXo/CxZBXQSjByxJe91eu08ZoEno1CmdgEWQ6fhnoHF/UmqbpmiaaaCv68qwsK2XQaVkaBRPeiQn312JV1/VGo5FhqZkXo7AEFnUgQwdi1tydHhZ10aJOvxiFtKKM9QaQNXv//wu2ZZlXWg0RyOUKPfRSYi+UkiZaqky2Nh5zVa7FablcFn9lYf2fT+ypwqti7hZR1xqgtSkAGZN+PgrLfFG0ZfjLJnOHTNDPReGbUmo/UFZ26vW6aQ4qXYtKHQUijifzcchzWayWehSi8xYCBtUrt8g94anNeb4sdgGZEAQagxAKAKlUXa7IFgP2ic1TvlTrVoB6nk4Fp6cPYi5gKhwOJ/5XqUgWAzb/2OZ3NSdjJFoIHCRCof3ZOZIko16v138pylaTCa4p18M9dr7JsuZAksw8HQyTHo/nfhCevzPyzsBEefAxHX6YIMfiagAR5oDKB2KPjw6/Lg0IeFUg6JqZczx4m9sRjcQRYvNCKvx4r3t+SSgvoGAsvO+13vWwkZyJ45E9XRz/jgD+piJRz3O70ulfDC8Ep0j72Tfnnch5vTAN/nyPmtJL28uqd55ZW1lZOVxZWeM2fM6J08nflqX78viHz4mlOa/Hipl14W5cNLkm0+xXBwSxte+AK39nAy/u/J9lW4pHv8Q0ZTaZXN1YjW8qwzq7EI9vRXxwxdUJPMzz+/LmL1u6CDYm+zwbjE3NLM5F1hWeZQ/C6xESjvRyxro1POR9eWhLo9B2yDXqJ5vXUYfH51NKFBub9fk8y31qd5DFt4b7j/K/UjB5eULIVX3HOrD5MqJcJBzpfYMK/iyau9jmXfmh1BHazKoa2o1A5ktFGj9PrymZVOw3ryHr4LHLD6WwzldGj96dgiOu3BIQPJ9XigTBKUbbPnjs8gPp3vYy34a9E4b/ixx+fsYbt5nr1YXAuu+u/EDqXirrAg3bFO/gKiTARX7XbkM3vYAEBLNplx9Kz4lUCmY1hMcp0XgQ/tWAFbrQcQA0sx67/FDqWUyEZ0KklQhvwuVKeD3RmVgCh853HJ4KeZ12+aHU7YAI23vb4yVJrwc2NRm19p2PxGtklx9In8ftdN//eYZ/AB40QmRSConWAAAAAElFTkSuQmCC'
  let _appId, _gameId, _profileId, _resource
  let _userProfileId

  let displayType
  const gamesQueryState = {
    AchievementsOnly: 0, // show/hide only games with achievements
    CappedFilter: 0,
    CTO: 0, // compare to SteamID64
    DisplayType: 0,
    GTF: 0, // game type filter
    Hidden: 0, // show/hide hidden and completed games
    IncludeAll: 0, // show/hide demos & betas
    Limit: 0, // use/do not use limit
    NotOwnedBy: 0,
    PerfectOnly: 0, // not exposed anywhere - usable for comparison
    Sort: 0,
    SPL: 0, // show/hide playlist
    SPB: 0, // show/hide playlist buttons
    ToPlay: 0, // show/hide playlist
    SteamID64: 0,
  }

  let gameDisplayOptionsState = {
    filterReorder: false,
    gridFlex: false,
    markExpired: false,
    showAllColumns: false,
  }
  const gameDisplayOptions = [
    {
      key: 'gridFlex',
      label: 'Full Grid',
      description: 'Transform Grid to full size and allow reordering by Highlight',
      displayType: 'games-grid',
    },
    {
      key: 'filterReorder',
      label: 'Reorder By Highlight',
      description: 'Highlight games in specific progress stats. Only works with Full Grid Option',
      displayType: 'games-grid',
    },
    {
      key: 'markExpired',
      label: 'Mark Expired',
      description: 'Highlights games with strike-through yellow and add "(expired)"',
      displayType: 'games-list',
      reloadOnChange: true,
    },
    {
      key: 'showAllColumns',
      label: 'Show All Columns',
      description: 'Show/hide hidden columns: Score, Hours to 100%, Last Achievement and Date Completed',
      displayType: 'games-list',
    },
  ]

  let gameProgressFilterState = {
    owned: false,
  }
  const gameProgressFilters = [
    {
      key: 'completed',
      label: 'Completed',
      description: 'Hightlight/Mute completed games',
    },
    {
      key: 'in-progress',
      label: 'In Progress',
      description: 'Hightlight/Mute in-progress games (at least one achievement unlocked, not completed)',
    },
    {
      key: 'untouched',
      label: 'Untouched',
      description: 'Hightlight/Mute untouched games (no achievements and/or no unlocks)',
    },
  ]

  const params = function (params) {
    _appId = params && params.appId
    _gameId = params && params.gameId
    _profileId = params && params.profileId
    _resource = params && params.resource
  }

  const banner = function () {
    // console.log("%c   ", "font-size:57px;background-image:url(" + iconUrl + ");background-size:contain;background-repeat:no-repeat;background-position:center");
    console.log('%c ' + name + ' %c Userscript v' + version + ' ', 'font-size:11px;color:#000000;background:#40A2A5;padding:1px;border-radius:3px 0 0 3px;', 'font-size:11px;color:#FFF;background:#111;padding:1px;border-radius:0 3px 3px 0;')
  }

  const steamAppLink = function (appId, profileId) {
    return 'https://astats.astats.nl/astats/Steam_Game_Info.php?Tab=2' + (profileId ? '&SteamID64' + profileId : '') + '&AppID=' + (appId || _appId) + '&utm_campaign=userscript'
  }

  const steamProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://astats.astats.nl/astats/User_Info.php?' + (linkProfileId ? 'steamID64=' + linkProfileId : '') + '&utm_campaign=userscript'
  }

  const icon = function (size) {
    const iconSize = size || 16
    return '<i class="" style="display:inline-block;width:' + iconSize + 'px;height:' + iconSize + 'px;vertical-align:middle;background-image:url(' + iconUrl + ');background-size: ' + iconSize + 'px ' + iconSize + 'px;"></i>'
  }

  const detectParams = function () {

    const ucUrl = new URL(window.location.href)
    for (let param in gamesQueryState) {
      gamesQueryState[param] = ucUrl.searchParams.get(param)
    }

    const resourceMap = {
      'steam_games.php': 'apps',
      'steam_game_info.php': 'app',
      'steam_achievement_info.php': 'app',
      'user_games.php': 'profile-apps',
      'user_info.php': 'profile',
    }

    _appId = url.searchParams.get('appid')
    _profileId = url.searchParams.get('steamid64')
    _resource = resourceMap[fragment]

    // in case it's a ProfileID address
    _userProfileId = getProfileContextFromFooter()

    if (!parseInt(_profileId)) {
      _profileId = _userProfileId || _profileId
    }

    // default to logged in user
    if (!parseInt(_profileId)) {
      _profileId = getProfileContextFromNavigation() || _profileId
    }

    if (_profileId > 0 && !steam.isUserIstanceId(_profileId)) {
      const userInstanceProfileId = steam.userInstanceProfileId(_profileId)
      const message = '<div class="userscript-steamid-message" style="position: absolute; top: 30vh;left:0;right:0; background: rgba(0,0,0,0.7); z-index:999; color: white; text-align:center; padding: 50px 20px;">' +
        '<p style="margin-bottom: 6px; color: orange; font-size: 20px"><b>Wrong Steam ID!</b></p>' +
        '<p style="margin-bottom: 6px">' +
        'Should be <code style="color: lightgreen; background: black">' + userInstanceProfileId + '</code> ' +
        'instead of <code style="color: lightcoral;  background: black">' + _profileId + '</code>' +
        '</p>' +
        '<p style="margin-bottom: 12px">' +
        '<a style="color: lightblue; text-decoration: underline" href="https://astats.astats.nl/astats/User_Info.php?steamID64=' + userInstanceProfileId + '">' +
        'Go to the correct one' +
        '</a>' +
        '</p>' +
        '<p style="margin-bottom: 6px; font-style: italic">' +
        'Came here via Discord and/or Enhanced Steam?<br> ' +
        '<a style="color: lightblue; font-style: italic; text-decoration: underline" href="https://github.com/discordapp/discord-api-docs/issues/271" target="_blank">See related issue</a>' +
        '</p>' +
        '</div>'
      if (!$('body > .userscript-steamid-message').length) {
        $('body').prepend(message)
      }
      _profileId = userInstanceProfileId
    }
  }

  /**
   * get profile context profile id from footer links
   */
  const getProfileContextFromFooter = function () {
    const footerLink = $('body>center>p>a').attr('href')
    if (footerLink) {
      const footerProfileUrl = new URL(window.location.origin + '/' + footerLink.toLowerCase())
      return footerProfileUrl.searchParams.get('steamid64')
    }
  }

  /**
   * get user context profile id from navigation
   */
  const getProfileContextFromNavigation = function () {
    const navLink = $('.navbar-right .dropdown-menu li:first-child a').attr('href')
    if (navLink) {
      const navProfileUrl = new URL(window.location.origin + '/' + navLink.toLowerCase())
      return navProfileUrl.searchParams.get('steamid64')
    }
  }

  /**
   * enhance
   */
  const enhance = function () {
    const enhanceKey = 'enhanced-' + id
    if ($('head meta[content="' + enhanceKey + '"]').length) {
      return
    }
    $('head').append('<meta name="userscript" content="' + enhanceKey + '">')
    banner()
    detectParams()
    xray()
    /**
     * don't go into uncharted territory. dragons be there
     * userscript nopes out of unknown display types to not mess with untouched pages (vote info etc)
     */
    if (!displayType) {
      return
    }
    applyStyles()
    switch (_resource) {
      case 'profile':
        break
      case 'app':
      case 'profile-app':
        break
      case 'apps':
        enhanceAppsList()
        break
      case 'profile-apps':
        enhanceAppsList()
        break
    }
  }

  const xray = function () {
    switch (_resource) {
      case 'profile':
        break
      case 'app':
      case 'profile-app':
        break
      case 'apps':
        displayType = 'games-grid'
        break
      case 'profile-apps':
        displayType = 'games-' + ((gamesQueryState.DisplayType === '2' || gamesQueryState.DisplayType === 'all') && gamesQueryState.GTF < 1 ? 'grid' : 'list')
        break
    }

    if (!displayType) {
      return
    }

    // mark container tables
    $('table.Default800, table.Default1000').addClass('container-table')
    $('.Pager').first().next().addClass('container-table').addClass(displayType)

    // apps
    $('.Coloured').addClass('container-table').addClass(displayType)

    // profile-apps games-list
    if (_resource === 'profile-apps') {
      $('.tablesorter').addClass(displayType)
    }

    // profile-apps games-grid own
    $('body > center > center > center > center > table:not(.Pager)').addClass('container-table').addClass(displayType)

    // profile-apps games-grid others
    $('body > center > center > center > center > center > table:not(.Pager)').addClass('container-table').addClass(displayType)

    // mark games
    $('.games-grid > tbody > tr > td').addClass('game')
    $('.games-list > tbody > tr').addClass('game')

    // mark game headers
    $('.games-grid .game a > img').addClass('game-header')
      .removeAttr('width')
      .removeAttr('height')

    // mark games progress
    let gameNameSelector = '.game'
    if (displayType === 'games-list') {
      gameNameSelector = '.game > td:nth-child(2)'
    }
    if (displayType === 'games-grid') {
      gameNameSelector = '.game tr:first-child'
    }
    $(gameNameSelector + ' font[color=""]').closest('.game').addClass('game-owned game-untouched')
    $(gameNameSelector + ' font[color="#d1cf31"]').closest('.game').addClass('game-owned game-untouched')
    $(gameNameSelector + ' font[color="#FF0000"]').closest('.game').addClass('game-owned game-untouched')
    $(gameNameSelector + ' font[color="#347C17"]').closest('.game').addClass('game-owned game-in-progress game-in-progress-0')
    $(gameNameSelector + ' font[color="#38d131"]').closest('.game').addClass('game-owned game-in-progress game-in-progress-25')
    $(gameNameSelector + ' font[color="#42a3ff"]').closest('.game').addClass('game-owned game-in-progress game-in-progress-50')
    $(gameNameSelector + ' font[color="#20e2e2"]').closest('.game').addClass('game-owned game-in-progress game-in-progress-75')
    $(gameNameSelector + ' font[color="#B23AEE"]').closest('.game').addClass('game-owned game-completed')
  }

  const applyStyles = function () {
    $('body').append('<style>' +
      '.container-table, .Default800, .Default1000, .tablesorter-blue' +
      '{width: 100% !important; max-width: 1000px; margin: 0 auto}' +
      '.userscript-settings' +
      '{display: flex; flex-wrap: wrap; justify-content: center; margin: 0 auto 15px;}' +
      '.userscript-settings .btn-group' +
      '{margin: 15px 7px 0}' +
      '.tablesorter > thead > tr > *' +
      '{vertical-align: middle !important; padding: 3px 10px; font-weight: bold;}' +
      '.tablesorter > tbody > tr > td:not(:first-child)' +
      '{vertical-align: middle !important; padding: 0 10px}' +
      '.tablesorter > tbody > tr:hover' +
      '{background-color: transparent !important}' +
      '.tablesorter > tbody > tr > td:first-child' +
      '{padding: 0}' +
      '.games-list' +
      '{max-width: 1500px;}' +
      // '.games-list.tablesorter td:nth-child(2)' +
      // '{width: 100%}' +
      '.games-list.tablesorter td:not(:nth-child(2)):not(:nth-child(13))' +
      '{white-space: nowrap}' +
      '.games-grid' +
      '{margin: 20px auto; display: flex; justify-content: center; flex-wrap: wrap}' +
      '.games-grid .game' +
      '{position: relative; width: 200px; margin: 0 4px 8px}' +
      '.games-grid .game-header' +
      '{width: 100%;margin-bottom: 3px; height: 75px; background: #555}' +
      '.game-expired del' +
      '{color: #FFFF00}' +
      '.game-muted' +
      '{opacity: 0.1}' +
      '.game-muted-reorder' +
      '{order: 2}' +
      '.game-muted:hover' +
      '{opacity: 1}' +
      '.game > table > tbody > tr > td' +
      '{padding: 0}' +
      '.btn-default.active' +
      '{color: white;}' +
      '.btn-default.active:hover, .btn-default:active.focus, .btn-default:active:focus, .btn-default:active:hover, .open>.dropdown-toggle.btn-default.focus, .open>.dropdown-toggle.btn-default:focus, .open>.dropdown-toggle.btn-default:hover' +
      '{color: inherit;background-color: inherit;border-color: inherit;}' +
      '</style>')
  }

  const enhanceAppsList = function () {
    addGameSettings()

    if (_resource === 'profile-apps') {
      if (displayType === 'games-grid') {
        /**
         * replace links for profile games grids
         * fixes missing tab param & url encoding issue
         */
        $('.game a[href^="User_Achievements_Per_Game"]').each(function () {
          $(this).attr('href', $(this).attr('href').replace('User_Achievements_Per_Game', 'Steam_Game_Info') + '&Tab=2')
        })
      }

      if (displayType === 'games-list') {
        /**
         * patch games list table when comparing
         * cell for "Date Completed" is missing (never set either)
         */
        if (comparing()) {
          $('.games-list > tbody > tr').append('<td></td>')
        }
      }
    }
  }

  const addGameSettings = function () {
    const $gameSettings = $('<div class="userscript-settings text-center"></div>')

    injectGameQueryOptions($gameSettings)
    injectGameDisplayOptions($gameSettings)
    injectGameProgressFilters($gameSettings)

    applyDisplayOption()
    gameMarkExpired()

    /**
     * inject userscript settings
     */
    if ($('.Pager').length) {
      $('.Pager').first().before($gameSettings)
    } else if ($('.games-list, .games-grid').length) {
      $('.games-list, .games-grid').before($gameSettings)
    } else {
      $('body > center > center > center').prepend($gameSettings)
    }
  }

  /**
   * game query options
   * derived from url
   */
  const injectGameQueryOptions = function ($gameSettings) {
    if (_resource === 'apps') {
      injectGameQueryOptionsForApps($gameSettings)
    }
    if (_resource === 'profile-apps') {
      injectGameQueryOptionsForProfileApps($gameSettings)
    }
  }

  const injectGameQueryOptionsForApps = function ($gameSettings) {
    /**
     * sort options
     */
    const sortOptions = [
      {
        id: 1,
        label: 'Achievements',
      },
      {
        id: 3,
        label: 'App ID',
      },
      {
        id: 7,
        label: 'AStats Score',
      },
      {
        id: 10,
        label: 'Broken Achievements',
        displayType: 'Achievements'
      },
      {
        id: 2,
        label: 'Name',
      },
      {
        id: 5,
        label: 'Owners',
      },
      {
        id: 6,
        label: 'Players',
      },
      {
        id: 8,
        label: 'Playtime Average ',
      },
      {
        id: 4,
        label: 'Points',
        displayType: 'Achievements'
      },
      {
        id: 9,
        label: 'Time to 100%',
        displayType: 'Achievements'
      },
      {
        id: 11,
        label: 'HPCP (100% completion percentage)',
        displayType: 'Achievements'
      },
      {
        id: 12,
        label: 'HPCP + Time to 100% (weighted)',
        displayType: 'Achievements'
      },
    ]
    const selectedSortOption = parseInt(gamesQueryState.Sort || 1)
    let activeSortOption = sortOptions.find(function (sortOptions) {
      return sortOptions.id === selectedSortOption
    })
    if (!activeSortOption) {
      activeSortOption = {
        id: selectedSortOption,
        label: 'Unknown Option',
      }
    }
    const $sortOption = $('<span class="btn-group btn-group-sm game-type"></span>')
    const $sortOptionButton = $('<button type="button" data-toggle="dropdown"' +
      'class="btn btn-default dropdown-toggle btn-game-type active" ' +
      'title="Display Games of specific type"' +
      '>' +
      activeSortOption.label + ' <span class="caret"></span>' +
      '</button>')
    $sortOption.append($sortOptionButton)
    const $sortOptionDropdown = $('<ul class="dropdown-menu"></ul>')
    sortOptions.forEach(function (sortOptions) {
      const $sortOptions = $('<li class="' + (sortOptions.id === activeSortOption.id ? 'active' : '') + '">' +
        '<a href="' + gamesLink({Sort: sortOptions.id}) + '">' +
        sortOptions.label +
        '</a>' +
        '</li>')
      $sortOptionDropdown.append($sortOptions)
    })
    $sortOption.append($sortOptionDropdown)

    const $sortOptionWrap = $('<div></div>')
    $sortOptionWrap.append($sortOption)
    $sortOptionWrap.append('<div><small class="text-muted">Sort</small></div>')
    $gameSettings.append($sortOptionWrap)

    /**
     * filters
     */
    const $gamesFilters = $('<span class="btn-group btn-group-sm game-filters"></span>')

    const $ownedButton = $('<a ' +
      'class="btn btn-default btn-game-owned ' + (gamesQueryState.SteamID64 > 0 ? 'active' : '') + '" ' +
      'title="Show Owned Games only"' +
      'href="' + gamesLink({
        SteamID64: gamesQueryState.SteamID64 > 0 ? 0 : _profileId,
        NotOwnedBy: gamesQueryState.SteamID64 > 0 ? gamesQueryState.NotOwnedBy : 0
      }) + '">' +
      'Owned' +
      '</a>')
    $gamesFilters.append($ownedButton)

    const $notOwnedButton = $('<a ' +
      'class="btn btn-default btn-game-owned ' + (gamesQueryState.NotOwnedBy > 0 ? 'active' : '') + '" ' +
      'title="Show Not Owned Games only"' +
      'href="' + gamesLink({
        SteamID64: 0,
        NotOwnedBy: gamesQueryState.NotOwnedBy > 0 ? 0 : _profileId
      }) + '">' +
      'Not Owned' +
      '</a>')
    $gamesFilters.append($notOwnedButton)

    const $achievementsOnlyButton = $('<a ' +
      'class="btn btn-default btn-game-owned ' + (gamesQueryState.AchievementsOnly > 0 ? 'active' : '') + '" ' +
      'title="Shown Games with Achievements only"' +
      'href="' + gamesLink({AchievementsOnly: gamesQueryState.AchievementsOnly ? 0 : 1}) + '">' +
      'Achievements' +
      '</a>')
    $gamesFilters.append($achievementsOnlyButton)

    const $tradingCardsButton = $('<a ' +
      'class="btn btn-default btn-game-owned ' + (gamesQueryState.DisplayType === 'Cards' ? 'active' : '') + '" ' +
      'title="Shown Games with Trading Cards only"' +
      'href="' + gamesLink({DisplayType: gamesQueryState.DisplayType === 'Cards' ? 'Achievements' : 'Cards'}) + '">' +
      'Trading Cards' +
      '</a>')
    $gamesFilters.append($tradingCardsButton)

    const $gamesFiltersWrap = $('<div></div>')
    $gamesFiltersWrap.append($gamesFilters)
    $gamesFiltersWrap.append('<div><small class="text-muted">Filter (exclusive)</small></div>')
    $gameSettings.append($gamesFiltersWrap)

    /**
     * remove existing elements
     */
    setTimeout(function () {
      if ($('body > h3').length) {
        $('body > h3')
          .nextUntil('.userscript-settings')
          .remove()
      } else {
        $('body > h1')
          .nextUntil('.userscript-settings')
          .remove()
      }
    })
  }

  const injectGameQueryOptionsForProfileApps = function ($gameSettings) {

    /**
     * Compare
     */
    if (comparable()) {
      const $compareGamesFilters = $('<span class="btn-group btn-group-sm game-filters"></span>')

      const $compareButton = $('<a ' +
        'class="btn btn-default btn-game-owned ' + (gamesQueryState.CTO > 0 ? 'active' : '') + '" ' +
        'title="Show only games you have as well"' +
        'href="' + gamesLink({CTO: gamesQueryState.CTO > 0 ? 0 : _userProfileId}) + '">' +
        'Compare' +
        '</a>')
      $compareGamesFilters.append($compareButton)

      const $compareGamesFiltersWrap = $('<div></div>')
      $compareGamesFiltersWrap.append($compareGamesFilters)
      $compareGamesFiltersWrap.append('<div><small class="text-muted">Compare</small></div>')
      $gameSettings.append($compareGamesFiltersWrap)
    }

    /**
     * filters
     */
    const $profileGamesFilters = $('<span class="btn-group btn-group-sm game-filters"></span>')

    const $achievementsButton = $('<a ' +
      'class="btn btn-default btn-game-owned ' + (gamesQueryState.AchievementsOnly > 0 ? 'active' : '') + '" ' +
      'title="Shown Games with Achievements only"' +
      'href="' + gamesLink({AchievementsOnly: gamesQueryState.AchievementsOnly ? 0 : 1}) + '">' +
      'Achievements' +
      '</a>')
    $profileGamesFilters.append($achievementsButton)

    const $profileGamesFiltersWrap = $('<div></div>')
    $profileGamesFiltersWrap.append($profileGamesFilters)
    $profileGamesFiltersWrap.append('<div><small class="text-muted">Filter</small></div>')
    $gameSettings.append($profileGamesFiltersWrap)

    /**
     * include filters
     * not applicable when comparing with another profile
     */
    if (!comparing()) {
      const $includeGamesFilters = $('<span class="btn-group btn-group-sm game-filters"></span>')

      const $demoBetaButton = $('<a ' +
        'class="btn btn-default btn-game-limit ' + (gamesQueryState.IncludeAll > 0 ? 'active' : '') + '" ' +
        'title="Show/Hide Demos and Betas"' +
        'href="' + gamesLink({
          IncludeAll: gamesQueryState.IncludeAll > 0 ? 0 : 1,
        }) + '">' +
        'Demos & Betas' +
        '</a>')
      $includeGamesFilters.append($demoBetaButton)

      const $hiddenCompletedButton = $('<a ' +
        'class="btn btn-default btn-game-limit ' + (gamesQueryState.Hidden > 0 ? 'active' : '') + '" ' +
        'title="Show/Hide Demos and Betas"' +
        'href="' + gamesLink({
          Hidden: gamesQueryState.Hidden > 0 ? 0 : 1,
        }) + '">' +
        'Hidden & Completed' +
        '</a>')
      $includeGamesFilters.append($hiddenCompletedButton)

      const $includeGamesFiltersWrap = $('<div></div>')
      $includeGamesFiltersWrap.append($includeGamesFilters)
      $includeGamesFiltersWrap.append('<div><small class="text-muted">Include</small></div>')
      $gameSettings.append($includeGamesFiltersWrap)
    }

    /**
     * game type filters
     */
    if (displayType === 'games-list') {
      const gameTypeOptions = [
        {
          id: 0,
          label: 'All',
        },
        {
          id: 2,
          label: 'Demo',
        },
        {
          id: 4,
          label: 'Beta',
        },
        {
          id: 16,
          label: 'Steamworks',
        },
        {
          id: 1,
          label: 'Removed',
        },
        {
          id: 512,
          label: 'MP Required',
        },
      ]
      const selectedGameTypeOption = parseInt(gamesQueryState.GTF || 0)
      let activeGameTypeOption = gameTypeOptions.find(function (gameTypeOption) {
        return gameTypeOption.id === selectedGameTypeOption
      })
      if (!activeGameTypeOption) {
        activeGameTypeOption = {
          id: selectedGameTypeOption,
          label: 'Unknown Option',
        }
      }
      const $gameType = $('<span class="btn-group btn-group-sm game-type"></span>')
      const $gameTypeButton = $('<button type="button" data-toggle="dropdown"' +
        'class="btn btn-default dropdown-toggle btn-game-type ' + (gamesQueryState.GTF > 0 ? 'active' : '') + '" ' +
        'title="Display Games of specific type"' +
        '>' +
        activeGameTypeOption.label + ' <span class="caret"></span>' +
        '</button>')
      $gameType.append($gameTypeButton)
      const $gameTypeDropdown = $('<ul class="dropdown-menu"></ul>')
      gameTypeOptions.forEach(function (gameTypeOption) {
        const $gameTypeOption = $('<li class="' + (gameTypeOption.id === activeGameTypeOption.id ? 'active' : '') + '">' +
          '<a href="' + gamesLink({GTF: gameTypeOption.id}) + '">' +
          gameTypeOption.label +
          '</a>' +
          '</li>')
        $gameTypeDropdown.append($gameTypeOption)
      })
      $gameType.append($gameTypeDropdown)

      const $gameTypeWrap = $('<div></div>')
      $gameTypeWrap.append($gameType)
      $gameTypeWrap.append('<div><small class="text-muted">Game Type</small></div>')
      $gameSettings.append($gameTypeWrap)
    }

    /**
     * display type
     */
    const $displayType = $('<span class="btn-group btn-group-sm game-display-type"></span>')

    const $listButton = $('<a ' +
      'class="btn btn-default btn-game-owned ' + (displayType === 'games-list' ? 'active' : '') + '" ' +
      'title="Display Games as List (allows for game type filtering)"' +
      'href="' + gamesLink({DisplayType: 1}) + '">' +
      'List' +
      '</a>')
    $displayType.append($listButton)

    const $gridButton = $('<a ' +
      'class="btn btn-default btn-game-owned ' + (displayType === 'games-grid' ? 'active' : '') + '" ' +
      'title="Display Games as Grid (does not allow for game type filtering)"' +
      'href="' + gamesLink({DisplayType: 2, GTF: 0}) + '">' +
      'Grid' +
      '</a>')
    $displayType.append($gridButton)

    const $displayTypeWrap = $('<div></div>')
    $displayTypeWrap.append($displayType)
    $displayTypeWrap.append('<div><small class="text-muted">Display</small></div>')
    $gameSettings.append($displayTypeWrap)

    /**
     * remove existing elements
     */
    setTimeout(function () {
      let $gtfForm = $('select[name="GTF"]').closest('form')
      // remove text filters
      $gtfForm.prevAll('a').remove()
      // remove debris
      $gtfForm.next('br').remove()
      $gtfForm.parent().contents()
        .filter(function () {
          return this.nodeType == 3 && this.nodeValue === ' - ' //Node.TEXT_NODE
        }).remove()
      // remove form itself
      $gtfForm.remove()

      // remove avatar
      $('center > center > p').remove()

      // remove compare link
      if (comparable()) {
        $('body > center > center > center > a').remove()
      }

      // remove tablesorter column buttons
      $('.userscript-settings').prevAll().remove()

      // // remove debris
      $('.userscript-settings').parent().contents()
        .filter(function () {
          return this.nodeType == 3 // Node.TEXT_NODE
        }).remove()
    })
  }

  /**
   * game display options
   * state stored in local storage
   */
  const injectGameDisplayOptions = function ($gameSettings) {
    const $displayOptions = $('<span class="btn-group btn-group-sm game-display-options"></span>')

    if (_resource === 'profile-apps' && !comparing()) {
      const $limitButton = $('<a ' +
        'class="btn btn-default btn-game-limit ' + (gamesQueryState.Limit === '0' ? '' : 'active') + '" ' +
        'title="Use/do not use limit"' +
        'href="' + gamesLink({
          Limit: gamesQueryState.Limit === null ? '0' : (gamesQueryState.Limit === '0' ? null : 0),
        }) + '">' +
        'Limit' +
        '</a>')
      $displayOptions.append($limitButton)
    }

    gameDisplayOptions.forEach(function (displayOption) {
      const $displayOptionButton = $('<span class="btn btn-default btn-toggle btn-game-' + displayOption.key + '"' +
        'title="' + displayOption.description + '"' +
        '>' + displayOption.label + '</span>')
      $displayOptionButton.on('click', function () {
        toggleGameDisplayOption(displayOption)
      })
      let exclude = false
      exclude = gamesQueryState.NotOwnedBy && displayOption.key === 'filterReorder'
      if (!exclude && displayOption.displayType === displayType) {
        $displayOptions.append($displayOptionButton)
      }
    })

    if (_resource === 'profile-apps' && displayType === 'games-list' && ownProfile()) {
      const $playlistButton = $('<a ' +
        'class="btn btn-default btn-game-limit ' + (gamesQueryState.ToPlay > 0 ? 'active' : '') + '" ' +
        'title="Playlist"' +
        'href="' + gamesLink({
          ToPlay: gamesQueryState.ToPlay > 0 ? 0 : 1,
        }) + '">' +
        'Playlist' +
        '</a>')
      $displayOptions.append($playlistButton)

      // const $playlistButtonsButton = $('<a ' +
      //     'class="btn btn-default btn-game-limit ' + (gamesQueryState.SPB > 0 ? 'active' : '') + '" ' +
      //     'title="Playlist"' +
      //     'href="' + gamesLink({
      //         SPB: gamesQueryState.SPB> 0 ? 0 : 1,
      //     }) + '">' +
      //     'Playlist Buttons' +
      //     '</a>');
      // $profileGamesFilters.append($playlistButtonsButton);
    }

    const $displayOptionsWrap = $('<div></div>')
    $displayOptionsWrap.append($displayOptions)
    $displayOptionsWrap.append('<div><small class="text-muted">' + (displayType === 'games-grid' ? 'Grid' : 'List') + ' Options</small></div>')
    $gameSettings.append($displayOptionsWrap)
    try {
      gameDisplayOptionsState = JSON.parse(localStorage.getItem(getStorageKey('display', true))) || gameDisplayOptionsState
    } catch (exception) {
      localStorage.removeItem(getStorageKey('display', true))
    }
  }

  const toggleGameDisplayOption = function (displayOption) {
    gameDisplayOptionsState[displayOption.key] = !gameDisplayOptionsState[displayOption.key]
    let reloadOnChange = false
    if (gameDisplayOptionsState[displayOption.key]) {
      if (displayOption.key === 'filterReorder' && !gameDisplayOptionsState['gridFlex']) {
        gameDisplayOptionsState['gridFlex'] = gameDisplayOptionsState['filterReorder']
      }
    } else {
      if (displayOption.key === 'gridFlex') {
        gameDisplayOptionsState['filterReorder'] = gameDisplayOptionsState['gridFlex']
        reloadOnChange = true
      }
      if (displayOption.key === 'markExpired') {
        reloadOnChange = true
      }
    }
    applyDisplayOption()
    if (displayOption.reloadOnChange || reloadOnChange) {
      window.location.reload()
    }
  }

  const applyDisplayOption = function () {
    localStorage.setItem(getStorageKey('display', true), JSON.stringify(gameDisplayOptionsState))
    setTimeout(function () {
      $('.game-display-options .btn-toggle').removeClass('active')
      for (let gameDisplayOptionKey in gameDisplayOptionsState) {
        if (gameDisplayOptionsState.hasOwnProperty(gameDisplayOptionKey) && gameDisplayOptionsState[gameDisplayOptionKey]) {
          $('.game-display-options .btn-game-' + gameDisplayOptionKey).addClass('active')
        }
      }
      gameGridFlex()
      gameListShowAllColumns()

      applyGameProgressFilters()
    })
  }

  const gameGridFlex = function () {
    if (!gameDisplayOptionsState.gridFlex || !$('.games-grid').length) {
      return
    }
    breakTable('.games-grid', 'games-grid')
    // cleanup some font sizes
    $('[style^="font-size:xx-small"]').removeAttr('style')
    $('[style^="font-size:x-small"]').removeAttr('style')
    $('[style^="font-size:small"]').removeAttr('style')
  }

  const gameListShowAllColumns = function () {
    if (!$('.games-list').length) {
      return
    }
    if (gameDisplayOptionsState.showAllColumns) {
      $('.games-list td').css({display: 'table-cell'})
    } else {
      $('.games-list td:nth-child(11)').hide()
      $('.games-list td:nth-child(12)').hide()
      $('.games-list td:nth-child(13)').hide()
      $('.games-list td:nth-child(14)').hide()
    }
  }

  const gameMarkExpired = function () {
    if (!gameDisplayOptionsState.markExpired) {
      return
    }
    $('del').append(' (expired)').closest('.game')
      .toggleClass('game-expired', gameDisplayOptionsState.markExpired)
  }

  /**
   * game progress filters
   * state stored in local storage
   */
  const injectGameProgressFilters = function ($gameSettings) {
    if (gamesQueryState.NotOwnedBy) {
      return
    }
    const $gameProgressFilters = $('<span class="btn-group btn-group-sm game-progress-filters"></span>')
    gameProgressFilters.forEach(function (gameProgressFilter) {
      const $filterButton = $('<span class="btn btn-default btn-toggle btn-game-' + gameProgressFilter.key + '"' +
        'title="' + gameProgressFilter.description + '"' +
        '>' + gameProgressFilter.label + '</span>')
      $filterButton.on('click', function () {
        toggleGameProgressFilter(gameProgressFilter)
      })
      let excluded = false
      excluded = _resource === 'profile-apps' && gameProgressFilter.key === 'completed' && gamesQueryState.Hidden < 1 && gamesQueryState.CTO < 1
      if (!excluded) {
        $gameProgressFilters.append($filterButton)
      }
    })
    const $gameProgressFiltersWrap = $('<div></div>')
    $gameProgressFiltersWrap.append($gameProgressFilters)
    $gameProgressFiltersWrap.append('<div><small class="text-muted">Highlight</small></div>')
    $gameSettings.append($gameProgressFiltersWrap)
    try {
      gameProgressFilterState = JSON.parse(localStorage.getItem(getStorageKey('progressFilters', true))) || gameProgressFilterState
    } catch (exception) {
      localStorage.removeItem(getStorageKey('progressFilters', true))
    }
  }

  const toggleGameProgressFilter = function (filter) {
    gameProgressFilterState[filter.key] = !gameProgressFilterState[filter.key]
    applyGameProgressFilters()
  }

  const applyGameProgressFilters = function () {
    localStorage.setItem(getStorageKey('progressFilters', true), JSON.stringify(gameProgressFilterState))
    setTimeout(function () {
      $('.game').removeClass('game-muted game-muted-reorder')
      $('.game-progress-filters .btn-toggle').addClass('active')
      for (var gameProgressFilterKey in gameProgressFilterState) {
        if (gameProgressFilterState.hasOwnProperty(gameProgressFilterKey) && gameProgressFilterState[gameProgressFilterKey]) {
          $('.game-progress-filters .btn-game-' + gameProgressFilterKey).removeClass('active')
          $('.game.game-' + gameProgressFilterKey).addClass('game-muted')
          if (gameDisplayOptionsState.filterReorder) {
            $('.game.game-' + gameProgressFilterKey).addClass('game-muted-reorder')
          }
        }
      }
    })
  }

  /**
   * utils
   */
  const breakTable = function (selector, newClasses) {
    if (!$(selector).length) {
      return
    }
    const classes = newClasses || $(selector).attr('class')
    const $table = $(selector).html()
    $(selector).replaceWith('<div class="' + classes + '">' +
      $table
        .replace(/<tbody>/gi, '')
        .replace(/<\/tbody>/gi, '')
        .replace(/<tr>/gi, '')
        .replace(/<\/tr>/gi, '')
        .replace(/<td/gi, '<div')
        .replace(/<\/td>/gi, '</div>')
      + '</div>'
    )
    $('.lazyload, .lazyloading').removeClass('lazyloading')
  }

  const comparable = function () {
    return _userProfileId && _profileId !== _userProfileId
  }

  const comparing = function () {
    return comparable() && gamesQueryState.CTO > 0
  }

  const ownProfile = function () {
    return _userProfileId && _profileId === _userProfileId
  }

  const gamesLink = function (overrideParams) {
    const currentParams = $.extend({}, gamesQueryState, overrideParams)
    const params = {}
    for (let key in currentParams) {
      if (currentParams.hasOwnProperty(key) && (!!currentParams[key] || (displayType === 'profile-apps' && key === 'Limit' && currentParams[key] < 1))) {
        params[key] = currentParams[key]
      }
    }
    return fragment + '?' + jQuery.param(params)
  }

  const getStorageKey = function (key, resourceContext) {
    return 'userscript.' + id + (resourceContext ? '.' + _resource : '') + '.' + key
  }

  /**
   * inject provider
   */
  const inject = function (provider) {
    const providerKey = provider.id + '-' + id
    if ($('head meta[content="' + providerKey + '"]').length) {
      return
    }
    detectParams()
    provider.params({profileId: _profileId, appId: _appId, resource: _resource})
    provider.banner()
    switch (_resource) {
      case 'profile':
        extendProfile(provider)
        break
      case 'app':
      case 'profile-app':
        extendAppHeader(provider)
        break
      case 'apps':
      case 'profile-apps':
        extendAppsLists(provider)
        break
    }
    $('head').append('<meta name="userscript" content="' + providerKey + '">')
  }

  const extendProfile = function (provider) {
    let linkContainer = $('h2 .userscript')
    if (!linkContainer.length) {
      linkContainer = $('<span class="userscript btn-group btn-group-sm" style="float: right; margin-top:-5px"></span>')
      $('h2').prepend(linkContainer)
      linkContainer = $('h2 .userscript')
    }
    linkContainer.append('<a href="' + provider.steamProfileLink() + '" target="_blank" class="btn btn-default">' + provider.icon(24) + '</a>')
  }

  const extendAppHeader = function (provider) {
    const steamAppLink = provider.steamAppLink()
    if (!steamAppLink) {
      return
    }
    let linkContainer = $('.panel-gameinfo .panel-heading .userscript')
    if (!linkContainer.length) {
      linkContainer = $('<span class="userscript btn-group btn-group-sm" style="float: right; margin-top:-9px; margin-right: -14px"></span>')
      $('.panel-gameinfo .panel-heading').prepend(linkContainer)
      linkContainer = $('.panel-gameinfo .panel-heading .userscript')
    }
    linkContainer.append('<a href="' + steamAppLink + '" target="_blank" class="btn btn-default">' + provider.icon(22) + '</a>')
  }

  const extendAppsLists = function (provider) {
    $('.tablesorter > tbody > tr > td:nth-child(2)').each(function () {
      const appUrl = new URL(window.location.origin + '/' + $('a[href^="Steam_Game_Info"]', $(this)).attr('href').toLowerCase())
      const appId = appUrl.searchParams.get('appid')
      const steamAppLink = provider.steamAppLink(appId)
      if (!steamAppLink) {
        return
      }
      $(this).closest('tr').append('<td style="padding: 0 2px"><a href="' + steamAppLink + '" class="btn btn-sm btn-default" target="_blank">' + provider.icon(20) + '</a></td>')
    })
    $('.games-list > thead > tr').append('<th></th>')
  }

  return {
    id: id,
    name: name,
    iconUrl: iconUrl,
    banner: banner,
    enhance: enhance,
    icon: icon,
    inject: inject,
    params: params,
    steamAppLink: steamAppLink,
    steamProfileLink: steamProfileLink,
  }
})()

const steamhunters = function () {

  const id = 'steamhunters'
  const name = 'Steam Hunters'
  const iconUrl = 'data:image/svg+xml;base64,PHN2ZyBkYXRhLW5hbWU9IkxheWVyIDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDE2IDE2Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIyIiByeT0iMiIgZmlsbD0iIzFiMjgzOCIvPjxnIGRhdGEtbmFtZT0iUGF0aGZpbmRlciBHcm91cCAoMSBwdCkiPjxwYXRoIGZpbGw9IiM3YmI2ZmYiIGQ9Ik0wIDdoMTJWMy41bDQgNC00IDRWOEgwVjd6Ii8+PHBhdGggZD0iTTggOWgydjVIOHptMC03aDJ2NEg4em00IDExdjFoMnYtMy4wMkwxMyAxMmwtMSAxem0yLTguOThWMmgtMmwxIDEgMSAxLjAyek0zIDVhMS4yNCAxLjI0IDAgMCAxIDEtMSAxLjMzIDEuMzMgMCAwIDEgMSAxaDJhMy4yMyAzLjIzIDAgMCAwLTMtMyAzLjE4IDMuMTggMCAwIDAtMyAzIDIuNDIgMi40MiAwIDAgMCAuMTggMWgyLjU3QzMuMzEgNS42NiAzIDUuMzQgMyA1em0yIDUuMDlhMi4zNiAyLjM2IDAgMCAxLS41OCAxLjYzQS43My43MyAwIDAgMSA0IDEyYy0uMzEgMC0xLS42LTEtMUgxYTIuOSAyLjkgMCAwIDAgLjkzIDJBMy4wOSAzLjA5IDAgMCAwIDQgMTRhMi42MSAyLjYxIDAgMCAwIDEuODktLjkzQTQuMzUgNC4zNSAwIDAgMCA3IDkuOTEgMy4yMiAzLjIyIDAgMCAwIDYuNzcgOUg0LjM4QTEuNzQgMS43NCAwIDAgMSA1IDEwLjA5eiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4='
  let _appId, _gameId, _profileId, _resource

  const params = function (params) {
    _appId = params && params.appId
    _gameId = params && params.gameId
    _profileId = params && params.profileId
    _resource = params && params.resource
  }

  const banner = function () {
    // console.log("%c   ", "font-size:57px;background-image:url(" + iconUrl + ");background-size:contain;background-repeat:no-repeat;background-position:center");
    console.log('%c ' + name + ' %c Userscript v' + version + ' ', 'font-size:11px;color:#000000;background:#40A2A5;padding:1px;border-radius:3px 0 0 3px;', 'font-size:11px;color:#FFF;background:#111;padding:1px;border-radius:0 3px 3px 0;')
  }

  const steamAppLink = function (appId, profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://steamhunters.com/' + (linkProfileId ? 'profiles/' + linkProfileId + '/' : '') + 'stats/' + (appId || _appId) + '?utm_campaign=userscript'
  }

  const steamProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://steamhunters.com/' + (linkProfileId ? 'profiles/' + linkProfileId : '') + '?utm_campaign=userscript'
  }

  const icon = function (size) {
    const iconSize = size || 16
    return '<i class="" style="display:inline-block;width:' + iconSize + 'px;height:' + iconSize + 'px;vertical-align:middle;background-image:url(' + iconUrl + ');background-size: ' + iconSize + 'px ' + iconSize + 'px;"></i>'
  }

  return {
    id: id,
    name: name,
    iconUrl: iconUrl,
    banner: banner,
    icon: icon,
    params: params,
    steamAppLink: steamAppLink,
    steamProfileLink: steamProfileLink,
  }
}()

switch (url.hostname) {
  case 'astats.astats.nl':
    astats.inject(steamhunters)
    break
}
