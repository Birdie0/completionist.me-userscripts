// ==UserScript==
// @name         Steam Hunters SteamDB
// @namespace    https://completionist.me/tools
// @icon         https://steamhunters.com/content/img/steam_hunters.svg
// @version      2.10.1
// @description  Steam Hunters integration for SteamDB
// @author       luchaos
// @match        https://steamdb.info/app/*
// @match        https://steamdb.info/calculator/*
// @supportUrl   https://completionist.me/feedback
// @updateURL    https://github.com/Birdie0/completionist.me-userscripts/raw/mod/steamhunters-steamdb.user.js
// @downloadURL  https://github.com/Birdie0/completionist.me-userscripts/raw/mod/steamhunters-steamdb.user.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @run-at       document-end
// @inject-into  content
// ==/UserScript==

'use strict'
var version = '2.10.1'
var url = new URL(window.location.href.toLowerCase())
var fragment = url.pathname.match(/([^\/]*)\/*$/)[1]
var fragments = url.pathname.split('/')

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
    steamdb.inject(steamhunters)
    break
}
