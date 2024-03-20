// ==UserScript==
// @name         MetaGamerScore Steam
// @namespace    https://completionist.me/tools
// @icon         https://d2llvuv5f1qa0o.cloudfront.net/images/favicon.png
// @version      2.10.0
// @description  MetaGamerScore integration for Steam
// @author       luchaos
// @match        http://store.steampowered.com/*
// @match        https://store.steampowered.com/*
// @match        http://steamcommunity.com/*
// @match        https://steamcommunity.com/*
// @supportUrl   https://completionist.me/feedback
// @updateURL    https://github.com/Birdie0/completionist.me-userscripts/raw/mod/mgs-steam.user.js
// @downloadURL  https://github.com/Birdie0/completionist.me-userscripts/raw/mod/mgs-steam.user.js
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

const mgs = function () {

  const id = 'mgs'
  const name = 'MetaGamerScore.com'
  const iconUrl = 'data:image/png;base64,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'
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
    return null
    // const linkProfileId = profileId || _profileId;
    // return 'https://metagamerscore.com/steam' + (linkProfileId ? '/id/' + linkProfileId : '') + '/app/' + (appId || _appId) + '?utm_campaign=userscript';
  }

  const steamProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://metagamerscore.com/steam' + (linkProfileId ? '/id/' + linkProfileId : '') + '?utm_campaign=userscript'
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
    steamStore.inject(mgs)
    break
  case 'steamcommunity.com':
    steamCommunity.inject(mgs)
    break
}
