=======
FireCsv
=======


View pretty CSV directly from within Firefox (done) and Thunderbird
(coming). For example, the following CSV:

.. code-block:: text

  Name,Email,Age
  Joe Schmoe,joe@example.com,38
  "Doe, Jane",jane@example.com,72
  "Little One
  (aka ""babyface"")",baby@example.com,0.25

is rendered as:

.. image:: https://raw.github.com/metagriffin/firecsv/master/raw/screenshot.png
  :alt: CSV rendered inline with FireCsv


Current Features
================

* Parsing of almost any kind of CSV via jquery-csv
* Column-based sorting
* Auto-detection of numbers, emails, and URLs 
* Data is never altered; only the rendering may be enhanced


Future Features
===============

* Auto-collation/summation/processing of selected cells
* Custom CSS (and it to be defined using less/sass)
* Implement Thunderbird integration
* Add options, e.g. "headers enabled", etc.
* URL and/or header signature based memoization of options


Contributing
============

* Fork the `FireCsv <http://github.com/metagriffin/firecsv>`_ project
* Install `Add-on SDK <https://developer.mozilla.org/en-US/Add-ons/SDK>`_
* Make awesome changes
* Run ``make run`` to test in Firefox
* Run ``make xpi`` to create an XPI
* Commit & submit a pull request (PR)


Credits
=======

* FireCsv is heavily based on Benjamin Hollis'
  `JSONView <http://github.com/bhollis/jsonview/>`_
