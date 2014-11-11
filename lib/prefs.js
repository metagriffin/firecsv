// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// auth: metagriffin <mg.github@metagriffin.net>
// date: 2014/11/11
// copy: (C) Copyright 2014-EOT metagriffin -- see LICENSE.txt
//-----------------------------------------------------------------------------
// This software is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This software is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see http://www.gnu.org/licenses/.
//-----------------------------------------------------------------------------

const prefs             = require('sdk/simple-prefs');
const prefsService      = require('sdk/preferences/service');

const ACCEPT_FRAGMENT   = ',text/csv;q=0.9';
const ACCEPT_PREF_NAME  = 'csvHttpAccept';
const BROWSER_ACCEPT    = 'network.http.accept.default';

//-----------------------------------------------------------------------------
function applyAcceptPref(enabled) {
  var httpAcceptPref = prefsService.get(BROWSER_ACCEPT);
  // todo: this should be smarter: it should split on ','...
  httpAcceptPref = httpAcceptPref.replace(ACCEPT_FRAGMENT, '');
  if ( enabled )
    httpAcceptPref = httpAcceptPref + ACCEPT_FRAGMENT;
  prefsService.set(BROWSER_ACCEPT, httpAcceptPref);
}

//-----------------------------------------------------------------------------
function onPrefChange(prefName) {
  if ( prefName == ACCEPT_PREF_NAME )
    applyAcceptPref(prefs.prefs[ACCEPT_PREF_NAME]);
}

//-----------------------------------------------------------------------------
function register() {
  prefs.on('', onPrefChange);
  applyAcceptPref(prefs.prefs[ACCEPT_PREF_NAME]);
}

//-----------------------------------------------------------------------------
function unregister() {
  prefs.removeListener('', onPrefChange);
  if ( prefs.prefs[ACCEPT_PREF_NAME] )
    applyAcceptPref(false);
}

//-----------------------------------------------------------------------------
exports.register   = register;
exports.unregister = unregister;

//-----------------------------------------------------------------------------
// end of $Id$
//-----------------------------------------------------------------------------
