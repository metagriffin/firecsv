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

// this component provides a stream converter that can translate from
// JSON to HTML.
const { Class }         = require("sdk/core/heritage");
const { Unknown }       = require("sdk/platform/xpcom");
const { Cc, Ci }        = require("chrome");
const addonData         = require("sdk/self").data;
const _                 = require("sdk/l10n").get;

//-----------------------------------------------------------------------------
// this defines an object that implements our converter, and is set up
// to be XPCOM-ified by XPCOMUtils
var FireCsv = Class({

  extends : Unknown,

  interfaces : [
    "nsIStreamConverter",
    "nsIStreamListener",
    "nsIRequestObserver"
  ],

  get wrappedJSObject() this,

  // constructor
  initialize : function() {
  },

  // Encode a string to be used in HTML
  // todo: is this *really* not available in gecko?...
  htmlEncode : function(str) {
    if ( ! str )
      return '';
    return str.toString()
      .replace(/&/g,  '&amp;')
      .replace(/\"/g, '&quot;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;');
  },

  // nsIStreamConverter::convert
  convert : function(aFromStream, aFromType, aToType, aCtxt) {
    return aFromStream;
  },

  // nsIStreamConverter::asyncConvertData
  asyncConvertData : function(aFromType, aToType, aListener, aCtxt) {
    // Store the listener passed to us
    this.listener = aListener;
  },

  // nsIStreamListener::onDataAvailable
  onDataAvailable : function(aRequest, aContext, aInputStream, aOffset, aCount) {
    // From https://developer.mozilla.org/en/Reading_textual_data
    var is = Cc['@mozilla.org/intl/converter-input-stream;1'].createInstance(Ci.nsIConverterInputStream);
    is.init(aInputStream, this.charset, -1, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

    // This used to read in a loop until readString returned 0, but it caused it to
    // crash Firefox on OSX/Win32 (but not Win64)
    // It seems just reading once with -1 (default buffer size) gets the file done.
    // However, *not* reading in a loop seems to cause problems with Firebug
    // So I read in a loop, but do whatever I can to avoid infinite-looping.
    var totalBytesRead = 0;
    var bytesRead = 1; // Seed it with something positive

    while (totalBytesRead < aCount && bytesRead > 0) {
      var str = {};
      bytesRead = is.readString(-1, str);
      totalBytesRead += bytesRead;
      this.data += str.value;
    }
  },

  // nsIRequestObserver::onStartRequest
  onStartRequest : function(aRequest, aContext) {
    this.data = '';
    this.uri = aRequest.QueryInterface(Ci.nsIChannel).URI.spec;
    // Sets the charset if it is available. (For documents loaded from the
    // filesystem, this is not set.)
    this.charset = aRequest.QueryInterface(Ci.nsIChannel).contentCharset || 'UTF-8';
    this.channel = aRequest;
    this.channel.contentType = 'text/html';
    // All our data will be coerced to UTF-8
    this.channel.contentCharset = 'UTF-8';
    this.listener.onStartRequest(this.channel, aContext);
  },

  // nsIRequestObserver::onStopRequest
  onStopRequest : function(aRequest, aContext, aStatusCode) {

    // TODO: pull these from prefs / memoizations / etc ...
    var options = {
      header        : 'auto',
      // maxUrlLength  : 30,
      styles        : [
        'default.css'
      ],
      scripts       : [
        'jquery-1.11.1.min.js',
        'jquery.csv-0.71.min.js',
        'underscore-1.7.0.min.js',
        'chart-1.0.1-beta.4.min.js',
        'default.js'
      ]
    };

    var outputDoc = this.renderWrappedHtml(this.data, this.uri, options);

    // I don't really understand this part, but basically it's a way to get our UTF-8 stuff
    // spit back out as a byte stream
    // See http://www.mail-archive.com/mozilla-xpcom@mozilla.org/msg04194.html
    var storage = Cc['@mozilla.org/storagestream;1'].createInstance(Ci.nsIStorageStream);

    // I have no idea what to pick for the first parameter (segments)
    storage.init(4, 0xffffffff, null);
    var out = storage.getOutputStream(0);

    var binout = Cc['@mozilla.org/binaryoutputstream;1']
      .createInstance(Ci.nsIBinaryOutputStream);
    binout.setOutputStream(out);
    binout.writeUtf8Z(outputDoc);
    binout.close();

    // I can't explain it, but we need to trim 4 bytes off the front or else it includes random crap
    var trunc = 4;
    var instream = storage.newInputStream(trunc);

    // pass the data to the main content listener
    this.listener.onDataAvailable(this.channel, aContext, instream, 0, storage.length - trunc);
    this.listener.onStopRequest(this.channel, aContext, aStatusCode);
  },

  renderWrappedHtml : function(csv, title, options) {
    // TODO: this should be moved into a template!... use `_.template()`?
    var struct = {options: options};
    var ret = '<!DOCTYPE html>\n<html><head><title>' + this.htmlEncode(title) + '</title>';
    for ( var idx=0 ; idx<options.styles.length ; idx++ )
      ret += '<link rel="stylesheet" type="text/css" href="' + addonData.url(options.styles[idx]) + '">';
    for ( var idx=0 ; idx<options.scripts.length ; idx++ )
      ret += '<script type="text/javascript" src="' + addonData.url(options.scripts[idx]) + '"></script>'
    return ret
      + '<script type="text/javascript">var FireCsv = ' + JSON.stringify(struct) + ';</script>'
      + '</head><body id="FireCsv"><div id="Clamp">'
      + '<pre id="RawData">' + this.htmlEncode(csv) + '</pre>'
      + '<table id="TabularData" border="0" cellpadding="0" cellspacing="0"></table>'
      + '<div id="GraphData"></div>'
      + '</div></body></html>';
  }

});

exports.FireCsv = FireCsv;

//-----------------------------------------------------------------------------
// end of $Id$
//-----------------------------------------------------------------------------
