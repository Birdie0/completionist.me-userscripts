// ==UserScript==
// @name         Exophase Steam
// @namespace    https://completionist.me/tools
// @icon         https://www.exophase.com/assets/zeal/_icons/android-chrome-192x192.png
// @version      2.10.0
// @description  Exophase integration for Steam
// @author       luchaos
// @match        http://store.steampowered.com/*
// @match        https://store.steampowered.com/*
// @match        http://steamcommunity.com/*
// @match        https://steamcommunity.com/*
// @supportUrl   https://completionist.me/feedback
// @updateURL    https://completionist.me/userscript/exophase-steam.user.js
// @downloadURL  https://completionist.me/userscript/exophase-steam.user.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @require      https://peterolson.github.io/BigInteger.js/BigInteger.min.js
// @run-at       document-end
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
    $('.rightcol').append(analyzer)
  }

  return {
    id: id,
    name: name,
    inject: inject
  }
})()

const exophase = function () {

  const id = 'exophase'
  const name = 'Exophase.com'
  const iconUrl = 'data:image/svg+xml;base64,PHN2ZyBkYXRhLW5hbWU9IkxheWVyIDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDUyIDUyIj48cGF0aCBmaWxsPSIjNmNmIiBkPSJNOSA5aDE0djE0SDl6Ii8+PHBhdGggZmlsbD0iI2Q3ZmZmZiIgZD0iTTI5IDloMTR2MTRIMjl6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTkgMjloMTR2MTRIOXoiLz48cGF0aCBmaWxsPSIjZjJmZmZmIiBkPSJNMjkgMjloMTR2MTRIMjl6Ii8+PC9zdmc+'
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
    const linkAppId = appId || _appId
    const linkProfileId = profileId || _profileId
    return 'https://exophase.com/steam/game/id/' + linkAppId + (linkProfileId ? '/stats/' + linkProfileId : '') + '?utm_campaign=userscript'
  }

  const steamProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://exophase.com/steam' + (linkProfileId ? '/id/' + linkProfileId : '') + '?utm_campaign=userscript'
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
    // retroGameLink: retroGameLink,
    // retroProfileLink: retroProfileLink,
    steamAppLink: steamAppLink,
    steamProfileLink: steamProfileLink
  }
}()

switch (url.hostname) {
  case 'store.steampowered.com':
    steamStore.inject(exophase)
    break
  case 'steamcommunity.com':
    steamCommunity.inject(exophase)
    break
}
