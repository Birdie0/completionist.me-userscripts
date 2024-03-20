// ==UserScript==
// @name         completionist.me Steam
// @namespace    https://completionist.me/tools
// @icon         https://completionist.me/images/completionist-logo-120.png
// @version      2.10.0
// @description  completionist.me integration for Steam
// @author       luchaos
// @match        https://completionist.me/steam/*
// @match        http://store.steampowered.com/*
// @match        https://store.steampowered.com/*
// @match        http://steamcommunity.com/*
// @match        https://steamcommunity.com/*
// @supportUrl   https://completionist.me/feedback
// @updateURL    https://completionist.me/userscript/cme-steam.user.js
// @downloadURL  https://completionist.me/userscript/cme-steam.user.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @require      https://peterolson.github.io/BigInteger.js/BigInteger.min.js
// @run-at       document-end
// ==/UserScript==

'use strict'
var version = '2.10.0'
var url = new URL(window.location.href.toLowerCase())
var fragment = url.pathname.match(/([^\/]*)\/*$/)[1]
var fragments = url.pathname.split('/')

const cme = function () {

  const id = 'cme'
  const name = 'completionist.me'
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

  const retroGameLink = function (gameId, profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://completionist.me/retro' + (linkProfileId ? '/profile/' + linkProfileId : '') + '/game/' + (gameId || _gameId) + '?utm_campaign=userscript'
  }

  const retroProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://completionist.me/retro' + (linkProfileId ? '/profile/' + linkProfileId : '') + '?utm_campaign=userscript'
  }

  const steamAppLink = function (appId, profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://completionist.me/steam' + (linkProfileId ? '/profile/' + linkProfileId : '') + '/app/' + (appId || _appId) + '?utm_campaign=userscript'
  }

  const steamProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://completionist.me/steam' + (linkProfileId ? '/profile/' + linkProfileId : '') + '?utm_campaign=userscript'
  }

  const icon = function (size) {
    const iconSize = size || 16
    return '<i class="" style="display:inline-block;width:' + iconSize + 'px;height:' + iconSize + 'px;vertical-align:middle;background-image:url(' + iconUrl + ');background-size: ' + iconSize + 'px ' + iconSize + 'px;"></i>'
  }

  /**
   * register on completionist.me
   */
  const register = function (userscript) {
    $('.userscript-' + userscript + '-installed').css('display', 'block')
    $('.userscript-' + userscript + '-not-installed').remove()
    banner()
  }

  return {
    id: id,
    name: name,
    iconUrl: iconUrl,
    banner: banner,
    icon: icon,
    params: params,
    register: register,
    retroGameLink: retroGameLink,
    retroProfileLink: retroProfileLink,
    steamAppLink: steamAppLink,
    steamProfileLink: steamProfileLink
  }
}()

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

switch (url.hostname) {
  case 'store.steampowered.com':
    steamStore.inject(cme)
    break
  case 'steamcommunity.com':
    steamCommunity.inject(cme)
    break
  case 'completionist-web.test':
  case 'completionist.me':
    cme.register('cme-steam')
    break
}
