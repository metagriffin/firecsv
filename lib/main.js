// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// auth: metagriffin <mg.github@metagriffin.net>
// date: 2014/11/09
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

const { Cc, Ci, components } = require('chrome');
const xpcom                  = require('sdk/platform/xpcom');
const { FireCsv }            = require('./firecsv');
const prefs                  = require('./prefs');

// this component is an implementation of nsIStreamConverter that
// converts text/csv to html
const CSV_EXT      = 'csv';
const CSV_TYPE     = 'text/csv';
const CONTRACT_ID  = '@mozilla.org/streamconv;1?from=' + CSV_TYPE + '&to=*/*';
const CLASS_ID     = '{82f5b918-c88f-4c84-be27-5414900b1bbb}';
const GECKO_VIEWER = 'Gecko-Content-Viewers';

//-----------------------------------------------------------------------------
// create and register the service
var service = xpcom.Service({
  id          : components.ID(CLASS_ID),
  contract    : CONTRACT_ID,
  Component   : FireCsv,
  register    : false,
  unregister  : false
});

//-----------------------------------------------------------------------------
// get a reference to the built-in CSV viewer, if there is one
var categoryManager = Cc['@mozilla.org/categorymanager;1'].getService(Ci.nsICategoryManager);
var geckoViewer     = null;
try {
  geckoViewer = categoryManager.getCategoryEntry(GECKO_VIEWER, CSV_TYPE);
} catch(e) {
  geckoViewer = null;
}

//-----------------------------------------------------------------------------
function onLoad(options, callbacks) {
  console.debug(options.loadReason);
  if (!xpcom.isRegistered(service)) {
    xpcom.register(service);
  }
  // remove built-in CSV viewer
  categoryManager.deleteCategoryEntry(GECKO_VIEWER, CSV_TYPE, false);
  // tell Firefox that .csv files are text/csv
  categoryManager.addCategoryEntry('ext-to-type-mapping', CSV_EXT, CSV_TYPE, false, true);
  prefs.register();
};

//-----------------------------------------------------------------------------
function onUnload(reason) {
  if (xpcom.isRegistered(service)) {
    xpcom.unregister(service);
  }
  // re-add built-in CSV viewer
  if ( geckoViewer != null )
    categoryManager.addCategoryEntry(GECKO_VIEWER, CSV_TYPE, geckoViewer, false, false);
  prefs.unregister();
};

exports.main     = onLoad;
exports.onUnload = onUnload;

//-----------------------------------------------------------------------------
// end of $Id$
//-----------------------------------------------------------------------------
