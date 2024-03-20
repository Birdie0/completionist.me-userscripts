// ==UserScript==
// @name         MetaGamerScore SteamDB
// @namespace    https://completionist.me/tools
// @icon         https://d2llvuv5f1qa0o.cloudfront.net/images/favicon.png
// @version      2.10.3
// @description  MetaGamerScore integration for SteamDB
// @author       luchaos
// @match        https://steamdb.info/app/*
// @match        https://steamdb.info/calculator/*
// @supportUrl   https://completionist.me/feedback
// @updateURL    https://raw.githubusercontent.com/Birdie0/completionist.me-userscripts/mod/mgs-steamdb.user.js
// @downloadURL  https://raw.githubusercontent.com/Birdie0/completionist.me-userscripts/mod/mgs-steamdb.user.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @run-at       document-end
// ==/UserScript==

'use strict'
var version = '2.10.3'
var url = new URL(window.location.href.toLowerCase())
var fragment = url.pathname.match(/([^\/]*)\/*$/)[1]
var fragments = url.pathname.split('/')

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

const steamdb = (function () {

  const id = 'steamdb'
  const name = 'SteamDB'
  const iconUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cGF0aCBkPSJNNjMuOSAwQzMwLjUgMCAzLjEgMTEuOS4xIDI3LjFsMzUuNiA2LjdjMi45LS45IDYuMi0xLjMgOS42LTEuM2wxNi43LTEwYy0uMi0yLjUgMS4zLTUuMSA0LjctNy4yIDQuOC0zLjEgMTIuMy00LjggMTkuOS00LjggNS4yLS4xIDEwLjUuNyAxNSAyLjIgMTEuMiAzLjggMTMuNyAxMS4xIDUuNyAxNi4zLTUuMSAzLjMtMTMuMyA1LTIxLjQgNC44bC0yMiA3LjljLS4yIDEuNi0xLjMgMy4xLTMuNCA0LjUtNS45IDMuOC0xNy40IDQuNy0yNS42IDEuOS0zLjYtMS4yLTYtMy03LTQuOEwyLjUgMzguNGMyLjMgMy42IDYgNi45IDEwLjggOS44QzUgNTMgMCA1OSAwIDY1LjVjMCA2LjQgNC44IDEyLjMgMTIuOSAxNy4xQzQuOCA4Ny4zIDAgOTMuMiAwIDk5LjYgMCAxMTUuMyAyOC42IDEyOCA2NCAxMjhjMzUuMyAwIDY0LTEyLjcgNjQtMjguNCAwLTYuNC00LjgtMTIuMy0xMi45LTE3IDguMS00LjggMTIuOS0xMC43IDEyLjktMTcuMSAwLTYuNS01LTEyLjYtMTMuNC0xNy40IDguMy01LjEgMTMuMy0xMS40IDEzLjMtMTguMiAwLTE2LjUtMjguNy0yOS45LTY0LTI5Ljl6bTIyLjggMTQuMmMtNS4yLjEtMTAuMiAxLjItMTMuNCAzLjMtNS41IDMuNi0zLjggOC41IDMuOCAxMS4xIDcuNiAyLjYgMTguMSAxLjggMjMuNi0xLjhzMy44LTguNS0zLjgtMTFjLTMuMS0xLTYuNy0xLjUtMTAuMi0xLjV6bS4zIDEuN2M3LjQgMCAxMy4zIDIuOCAxMy4zIDYuMiAwIDMuNC01LjkgNi4yLTEzLjMgNi4ycy0xMy4zLTIuOC0xMy4zLTYuMmMwLTMuNCA1LjktNi4yIDEzLjMtNi4yek00NS4zIDM0LjRjLTEuNi4xLTMuMS4yLTQuNi40bDkuMSAxLjdhMTAuOCA1IDAgMSAxLTguMSA5LjNsLTguOS0xLjdjMSAuOSAyLjQgMS43IDQuMyAyLjQgNi40IDIuMiAxNS40IDEuNSAyMC0xLjVzMy4yLTcuMi0zLjItOS4zYy0yLjYtLjktNS43LTEuMy04LjYtMS4zek0xMDkgNTF2OS4zYzAgMTEtMjAuMiAxOS45LTQ1IDE5LjktMjQuOSAwLTQ1LTguOS00NS0xOS45di05LjJjMTEuNSA1LjMgMjcuNCA4LjYgNDQuOSA4LjYgMTcuNiAwIDMzLjYtMy4zIDQ1LjItOC43em0wIDM0LjZ2OC44YzAgMTEtMjAuMiAxOS45LTQ1IDE5LjktMjQuOSAwLTQ1LTguOS00NS0xOS45di04LjhjMTEuNiA1LjEgMjcuNCA4LjIgNDUgOC4yczMzLjUtMy4xIDQ1LTguMnoiIGZpbGw9IiNGRkYiLz48L3N2Zz4='
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
    return 'https://steamdb.info/app/' + (appId || _appId) + '?utm_campaign=userscript'
  }

  const steamProfileLink = function (profileId) {
    const linkProfileId = profileId || _profileId
    return 'https://steamdb.info/calculator/' + (linkProfileId ? linkProfileId : '') + '?utm_campaign=userscript'
  }

  const icon = function (size) {
    const iconSize = size || 16
    return '<i class="" style="display:inline-block;width:' + iconSize + 'px;height:' + iconSize + 'px;vertical-align:middle;background-image:url(' + iconUrl + ');background-size: ' + iconSize + 'px ' + iconSize + 'px;"></i>'
  }

  /**
   * inject provider
   */
  const fragment = fragments[1]
  const resourceMap = {
    'app': 'app',
    'calculator': 'profile'
  }
  const resource = resourceMap[fragment]

  const inject = function (provider) {
    const providerKey = provider.id + '-' + id
    if ($('head meta[content="' + providerKey + '"]').length) {
      return
    }
    switch (resource) {
      case 'app':
        provider.params({appId: fragments[2]})
        injectAppNavListLink(provider)
        break
      case 'profile':
        provider.params({profileId: fragments[2]})
        injectProfileHeaderLink(provider)
        break
    }
    $('head').append('<meta name="userscript" content="' + providerKey + '">')
  }

  const injectAppNavListLink = function (provider) {
    const steamAppLink = provider.steamAppLink()
    if (!steamAppLink) {
      return
    }
    const providerLink = $('<a class="tooltipped tooltipped-n" target="_blank" href="' + steamAppLink + '" aria-label="View app on ' + provider.name + '">' + provider.icon(16) + '</a>')
    $('.app-links').append(providerLink)
  }

  const injectProfileHeaderLink = function (provider) {
    const providerLink = $('<a target="_blank" style="margin-left: 4px" href="' + provider.steamProfileLink() + '" title="View profile on ' + provider.name + '">' + provider.icon(24) + '</a>')
    $('.header-title').append(providerLink)
  }

  return {
    id: id,
    name: name,
    iconUrl: iconUrl,
    banner: banner,
    icon: icon,
    params: params,
    inject: inject,
    steamAppLink: steamAppLink,
    steamProfileLink: steamProfileLink,
  }
})()

switch (url.hostname) {
  case 'steamdb.info':
    steamdb.inject(mgs)
    break
}
