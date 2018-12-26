// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// auth: metagriffin <mg.github@metagriffin.net>
// date: 2018/12/23
// copy: (C) Copyright 2018-EOT metagriffin -- see LICENSE.txt
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

; (function () {

  'use strict';

  const csvContentType = /^text\/([a-z]+\+)*csv($|;)/;
  const csvUrls = new Set();

  //---------------------------------------------------------------------------
  function htmlEncode(val) {
    if ( val === undefined || val === null )
      return '';
    if ( typeof(val) === 'number' )
      return '' + val;
    if ( typeof(val) !== 'string' )
      val = val.toString();
    return (
      val
        .replace(/&/g, '&amp;')
        .replace(/>/g,  '&gt;')
        .replace(/</g,  '&lt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#39;')
    );
  };

  //---------------------------------------------------------------------------
  function createViewerDocument(url, content, options) {
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1">
    <meta charset="UTF-8">
    <meta name="generator" content="emacs/24.5.1 (yup, proudly hand crafted :)">
    <title>FireCsv (${htmlEncode(url)})</title>
    <link rel="stylesheet" type="text/css" href="${chrome.runtime.getURL("firecsv/viewer.css")}"/>
    <script type="text/javascript" src="${chrome.runtime.getURL("libs/jquery-1.11.1.min.js")}"></script>
    <script type="text/javascript" src="${chrome.runtime.getURL("libs/jquery.csv-0.71.min.js")}"></script>
    <script type="text/javascript" src="${chrome.runtime.getURL("libs/underscore-1.6.0.min.js")}"></script>
    <script type="text/javascript" src="${chrome.runtime.getURL("libs/chart-1.0.1-beta.4.min.js")}"></script>
    <script type="text/javascript" src="${chrome.runtime.getURL("firecsv/viewer.js")}"></script>
    <script type="text/javascript">var FireCsv = ${JSON.stringify({options: options})}</script>
  </head>
  <body id="FireCsv">
    <div id="Clamp">
      <!--div id="InitLoad">FireCsv is rendering the CSV:</div-->
      <pre id="RawData">${htmlEncode(content)}</pre>
      <!--div id="Viewer"-->
        <table id="TabularData" border="0" cellpadding="0" cellspacing="0"></table>
        <div id="GraphData"></div>
      <!--/div-->
    </div>
  </body>
</html>`;
  };

  //---------------------------------------------------------------------------
  function transformResponseToCsv(details) {
    const filter = browser.webRequest.filterResponseData(details.requestId);
    const dec = new TextDecoder("utf-8");
    const enc = new TextEncoder();
    let content = "";
    filter.ondata = (event) => {
      content = content + dec.decode(event.data);
    };
    filter.onstop = (_event) => {
      let outputDoc = '';
      // TODO: pull these from configs...
      let options = {
        header   : 'auto'
      };
      outputDoc = createViewerDocument(details.url, content, options);
      filter.write(enc.encode(outputDoc));
      filter.disconnect();
    };
  }

  //---------------------------------------------------------------------------
  function detectCsv(event) {
    if ( ! event.responseHeaders )
      return;
    for ( const header of event.responseHeaders ) {
      if ( ! header.name || header.name.toLowerCase() !== 'content-type' )
        continue;
      if ( header.value && csvContentType.test(header.value) ) {
        if ( typeof browser !== 'undefined' && 'filterResponseData' in browser.webRequest ) {
          header.value = "text/html";
          transformResponseToCsv(event);
        }
        else {
          csvUrls.add(event.url);
        }
      }
    }
    return {responseHeaders: event.responseHeaders};
  }

  //---------------------------------------------------------------------------
  // LISTENERS

  chrome.webRequest.onHeadersReceived.addListener(
    detectCsv, {
      urls: ["<all_urls>"],
      types: ["main_frame"]
    }, ["blocking", "responseHeaders"]
  );

  chrome.runtime.onMessage.addListener((_message, sender, sendResponse) => {
    if ( sender.url.startsWith("file://") && sender.url.endsWith(".csv") ) {
      sendResponse(true);
      return;
    }
    if ( 'filterResponseData' in chrome.webRequest ) {
      sendResponse(false);
      return;
    }
    sendResponse(csvUrls.has(sender.url));
    csvUrls.delete(sender.url);
  });

}());

//-----------------------------------------------------------------------------
// end of $Id$
// $ChangeLog$
//-----------------------------------------------------------------------------
