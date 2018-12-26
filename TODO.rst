======
TODO's
======

* re-enable:
    "preferences"  : [{
      "name"         : "csvHttpAccept",
      "type"         : "bool",
      "value"        : true,
      "title"        : "Include \"text/csv\" in the \"Accept\" header",
      "description"  : "Indicates to remote servers that CSV can be rendered natively"
    }]

* add record number on hover of record

* make empty lines same height as non-empty lines

* UI BUG: when there's a lot of data, the margin-right collapses...

* sort-cycling should cycle through asc/desc without shiftkey. with
  shiftkey, it should cycle through asc/desc/none.

* minify all data/*.(css|js)

* optimize the data passing from addon to embedded HTML... as it stands,
  its disgusting.

* add support for CURRENCY auto-detection
  ==> all currency symbols: ₳฿₵¢₡₢$₫₯₠€ƒ₣₲₴₭₺ℳ₥₦₧₱₰£៛₹₨₪৳₸₮₩¥... more?
  ==> support all locales: 100,000.00 and 100.000,00... more?

* add support for DATE auto-detection

* when there is data that is graphed, and the tabular data is
  re-sorted, should it re-draw the graphs? probably. or at the
  very least that should be an option...

* when no-header mode is supported (i.e. the data does not hav a header
  record), then the auto-generated graph labels need to account for
  that in the numbering.

* make it responsive!

* auto-select the data if there is only one apparent record

* allow "pinning" of graphs, so that a change in selection does not
  replace it.

* currently, if you "save page as..." using type "web page, html only",
  it saves the original CSV. perfect.
  the issue is that type "web page, complete" and "text files" don't.
  fix that to either include a (hidden) warning or figure out how to
  always force it to save the CSV.

* when a selection is made, but no pure-numeric series can be found,
  perhaps try to find a series that has *mostly* numeric, and ignore
  the non-numeric?...

* add captions to the graphs.

* if the selection has a non-numeric column and a non-numeric row,
  then use one of them as the series label.

* figure out how to dynamically update the install.rdf with the values
  from https://addons.mozilla.org/en-US/firefox/pages/appversions/
