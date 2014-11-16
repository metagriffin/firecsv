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

// todo:
//   - allow highlighting of cells ==> auto summation? etc?
//     ==> overload firefox "control-drag"?
//   - auto-detect "isHeader" by looking at all column values... if
//     only the first is non-col-type, then likely it has headers...

//-----------------------------------------------------------------------------
// GLOBALS
//-----------------------------------------------------------------------------

var NullCell = {value: null, parsed: null, types: ['null']};

// todo: generalize this to support any kind of number notation,
// including scientific, etc
var number_cre = new RegExp(/^[+-]?\d+(\.\d+)?$/i);
var email_cre  = new RegExp('^[\\w!#$%&\'*+\-/=?^`{|}~.]+@(?:[a-z0-9][a-z0-9\\-]{0,62}\\.)+(?:[a-z]{2,63}|xn--[a-z0-9\\-]{2,59})$', 'i');
var url_cre    = new RegExp(/^[-+.a-z0-9]{2,}:\/\/[^\s]+$/i);
// var url_cre    = new RegExp(/^(http|https|file):\/\/[^\s]+$/i);

//-----------------------------------------------------------------------------
// HELPERS
//-----------------------------------------------------------------------------

var arrayEqual = function(a, b) {
  return (a.length == b.length) && a.every(function(element, index) {
    return element === b[index];
  });
};

//-----------------------------------------------------------------------------
// PARSING
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
var augment = function(data) {
  var ret = [];
  for ( var ridx=0 ; ridx<data.length ; ridx++ ) {
    var drow = data[ridx];
    var row  = [];
    for ( var cidx=0 ; cidx<drow.length ; cidx++ ) {
      var dcell = drow[cidx];
      var cell  = {value: dcell};
      if ( dcell === null || dcell === '' ) {
        cell.types = ['null'];
      } else if ( number_cre.test(dcell) ) {
        cell.parsed = parseFloat(dcell);
        cell.types = ['number'];
      } else if ( email_cre.test(dcell) ) {
        cell.types = ['email'];
      } else if ( url_cre.test(dcell) ) {
        cell.types = ['url'];
      } else {
        cell.types = ['string'];
      }
      row.push(cell);
    }
    ret.push(row);
  }
  // normalize number of columns
  var ncol = 0;
  for ( var idx=0 ; idx<ret.length ; idx++ )
    ncol = ret[idx].length > ncol ? ret[idx].length : ncol;
  for ( var idx=0 ; idx<ret.length ; idx++ ) {
    while ( ret[idx].length < ncol )
      ret[idx].push(_.clone(NullCell));
  }
  return ret;
};

//-----------------------------------------------------------------------------
var hasHeader = function(data) {
  if ( typeof(FireCsv.options.header) === 'boolean' )
    return FireCsv.options.header;
  if ( FireCsv.options.header !== 'auto' )
    throw 'invalid "options.header" value: ' + FireCsv.options.header;

  if ( data.length <= 0 )
    return false;

  // todo: implement auto-header detection...
  return true;

};

//-----------------------------------------------------------------------------
var prepare = function() {

  // TODO: error-trap all this...

  if ( FireCsv.data === null )
    return false;
  if ( typeof(FireCsv.data) !== 'undefined' )
    return true;
  FireCsv.data = null;

  // parse the data

  var data = $.csv.toArrays($('#RawData').text());

  // augment the data

  data = augment(data);

  // create the header info

  head = [];
  if ( hasHeader(data) ) {
    head = data.slice(0, 1)[0];
    data = data.slice(1);
  }
  if ( data.length > 0 ) {
    while ( head.length < data[0].length )
      head.push(_.clone(NullCell));
  }

  // analyze column data

  for ( var cidx=0 ; cidx<head.length ; cidx++ ) {
    var col = head[cidx];
    delete col.types;
    var types = _.without(_.uniq(_.map(data, function(row) {
      return row[cidx].types[0];
    })), 'null');
    if ( types.length == 0 )
      col.type = 'null';
    else if ( types.length == 1 )
      col.type = types[0];
    else
      col.type = null;
    if ( col.type && col.type !== 'null' ) {
      for ( var ridx=0 ; ridx<data.length ; ridx++ )
      {
        if ( arrayEqual(data[ridx][cidx].types, ['null']) )
          data[ridx][cidx].types.push(col.type);
      }
    } 
  }

  FireCsv.data = data;
  FireCsv.head = head;
  $('#FireCsv').addClass('parsed');
  var table = $('#TabularData').empty();
  var thead = document.createElement('thead');
  thead.appendChild(makeHeadRowElement(FireCsv.head));
  table.append(thead);
  table.append(document.createElement('tbody'));
  return true;
};

//-----------------------------------------------------------------------------
// RENDERING
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
var renderUrl = function(value) {
  value = _.escape(value);
  var label = value;
  // todo: do shortening at a "convenient" location, i.e. before the last path segment
  // todo: make a hover over the url expand the value
  // if ( label.length > FireCsv.options.maxUrlLength )
  //   label = ( label.slice(0, ( FireCsv.options.maxUrlLength - 3 ) / 2)
  //             + '...'
  //             + label.slice(label.length - ( FireCsv.options.maxUrlLength - 3 ) / 2) );
  return '<a href="' + value + '">' + label + '</a>';
};

//-----------------------------------------------------------------------------
var makeCellElement = function(column, item) {
  item = item || {value: '', types: ['null']};
  var el = document.createElement('div');
  el.className = 'cell';
  if ( item.types.length ) {
    el.className += ' type-' + item.types.join(' type-');
  }
  if ( column.type && _.contains(item.types, column.type) )
    el.className += ' column-type';
  value = '' + item.value;
  // todo: this can never be "schmart" enough...
  if ( arrayEqual(item.types, ['email']) ) {
    value = '<a href="mailto:' + _.escape(value) + '">' + _.escape(value) + '</a>';
  } else if ( arrayEqual(item.types, ['url']) ) {
    value = renderUrl(value);
  } else {
    value = _.escape(value);
  }
  $(el).html(value);
  return el;
};

//-----------------------------------------------------------------------------
var makeDataRowElement = function(columns, items) {
  var el = document.createElement('tr');
  for ( var idx=0 ; idx<columns.length ; idx++ )
  {
    var cel = document.createElement('td');
    cel.appendChild(makeCellElement(
      columns[idx], items.length > idx ? items[idx] : null));
    el.appendChild(cel);
  }
  return el;
};

//-----------------------------------------------------------------------------
var makeHeadRowElement = function(columns) {
  var el = document.createElement('tr');
  for ( var idx=0 ; idx<columns.length ; idx++ )
  {
    var col = columns[idx];
    var cel = document.createElement('th');
    // todo: i18n...
    $(cel).data('column-index', idx).attr(
      'title',
      'Click to cycle through sorting by this column alone\nShift-click to prefix this column to the current sorted columns');
    var div = document.createElement('div');
    div.className = 'cell';
    if ( col.type )
      div.className += ' column-type type-' + col.type;
    $(div).text(col.value != null ? col.value : 'Column ' + ( idx + 1 ));
    cel.appendChild(div);
    var ctl = document.createElement('div');
    ctl.className = 'control';
    $(ctl).html(
      '<i class="sort icon icon-arrow-updown"></i>'
    );
    cel.appendChild(ctl);
    el.appendChild(cel);
  }
  return el;
};

//-----------------------------------------------------------------------------
// SORTING
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
var cellCompare = function(a, b, col) {
  a = a.length > col ? ( a[col].parsed === undefined ? a[col].value : a[col].parsed ) : null;
  b = b.length > col ? ( b[col].parsed === undefined ? b[col].value : b[col].parsed ) : null;
  if ( a === b )
    return 0;
  if ( a === null )
    return 1;
  if ( b === null )
    return -1;
  return ( a < b ? -1 : 1 );
};

//-----------------------------------------------------------------------------
var rowCompare = function(a, b, sortspec, index) {
  if ( index >= sortspec.length )
    return 0;
  var ret = cellCompare(a.data, b.data, sortspec[index].col);
  if ( ret == 0 )
    return rowCompare(a, b, sortspec, index + 1);
  if ( sortspec[index].dir == 'asc' )
    return ret;
  return -1 * ret;
};

//-----------------------------------------------------------------------------
var sortedData = function(rows, sortspec) {
  if ( ! sortspec || sortspec.length <= 0 )
    return rows;
  // todo: this is not a "stable" sort... use a stable sort!
  //       ==> can't use _.sortBy, because it does not allow custom asc/desc...
  return rows.slice().sort(function(a, b) {
    return rowCompare(a, b, sortspec, 0);
  });
};

//-----------------------------------------------------------------------------
var redraw = function() {
  if ( ! prepare() )
    // there was an error...
    return;
  if ( ! FireCsv.rows ) {
    FireCsv.rows = [];
    for ( var idx=0 ; idx<FireCsv.data.length ; idx++ )
    {
      var row = FireCsv.data[idx];
      FireCsv.rows.push({
        data : row,
        el   : makeDataRowElement(FireCsv.head, row)
      });
    }
  }
  var items = sortedData(FireCsv.rows, FireCsv.sort);
  var tbody = $('#TabularData tbody');
  tbody.empty();
  for ( var idx=0 ; idx<items.length ; idx++ )
    tbody.append(items[idx].el);
  if ( items.length <= 0 )
    // todo: i18n...
    tbody.html(
      '<tr class="empty"><td colspan="'
        + ( FireCsv.head.length + 1 )
        + '" class="empty"><div class="cell">No data.</div></td></tr>');
};

//-----------------------------------------------------------------------------
var pushSort = function (col, dir, clear) {
  if ( clear )
    FireCsv.sort = [];
  FireCsv.sort = _.filter(FireCsv.sort, function(item) {
    return item.col != col;
  });
  if ( dir )
    FireCsv.sort.unshift({col: col, dir: dir});
  redraw();
};

//-----------------------------------------------------------------------------
// INTEGRATION
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
$(document).ready(function() {
  redraw();
  $('th').click(function(event) {
    // todo: on double- and shift-click, make this not highlight the
    //       column name...  this does not seem to help:
    // $.Event(event).preventDefault();
    // $.Event(event).stopPropagation();
    // $.Event(event).stopImmediatePropagation();
    var col   = $(this);
    var head  = col.parent();
    var icon  = col.find('.control .sort');
    var sort  = null;
    var clear = ! event.shiftKey;
    if ( ! col.hasClass('sorted') )
      sort = 'asc';
    else
      sort = col.hasClass('sorted-asc') ? 'desc' : null;
    pushSort(parseInt(col.data('column-index')), sort, clear);
    // clear all sort indicators
    head.find('th')
      .removeClass('sorted sorted-desc sorted-asc');
    head.find('th .control .sort')
      .addClass('icon-arrow-updown').removeClass('icon-arrow-up icon-arrow-down');
    // add enabled sort columns
    for ( var idx=0 ; idx<FireCsv.sort.length ; idx++ )
    {
      var item = FireCsv.sort[idx];
      if ( ! item.dir ) // paranoia -- this should never happen
        continue;
      var $item = head.find('th:nth-child(' + ( item.col + 1 ) + ')');
      $item.addClass('sorted sorted-' + item.dir).attr('sorted-index', idx);
      $item.find('.control .sort')
        .removeClass('icon-arrow-updown').addClass('icon-arrow-' + ( item.dir == 'asc' ? 'down' : 'up') );
    }
  });
});

//-----------------------------------------------------------------------------
// end of $Id$
//-----------------------------------------------------------------------------
