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

  chrome.runtime.sendMessage({}, (response) => {
    if ( ! response )
      return;
    let outputDoc = '';
    outputDoc = 'ERROR: FireCsv background content manipulator did not kick in.';
    document.documentElement.innerHTML = outputDoc;
  });

}());

//-----------------------------------------------------------------------------
// end of $Id$
// $ChangeLog$
//-----------------------------------------------------------------------------
