# -*- coding: utf-8 -*-
#------------------------------------------------------------------------------
# file: $Id$
# auth: metagriffin <mg.github@metagriffin.net>
# date: 2014/11/09
# copy: (C) Copyright 2014-EOT metagriffin -- see LICENSE.txt
#------------------------------------------------------------------------------
# This software is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
# 
# This software is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program. If not, see http://www.gnu.org/licenses/.
#------------------------------------------------------------------------------

PROCESSED       = manifest.json
DISTFILE        = dist/firecsv-$(shell cat VERSION.txt).zip

help:
	@echo "make targets:"
	@echo "  clean"
	@echo "  version"
	@echo "  run"
	@echo "  build"

include Makefile.git

version:
	@VERSION=`cat VERSION.txt` make _version --no-print-directory

_version:
	@for target in $(PROCESSED) ; do \
	  echo "creating '$$target'..." ; \
	  cat "$$target.IN" | sed -e "s/{{VERSION}}/$$VERSION/g" > "$$target" ; \
	done

build:
	@make --no-print-directory version
	web-ext build --artifacts-dir dist --overwrite-dest \
	  --ignore-files src dist raw tests envdev Makefile* build.py *.IN
	@make --no-print-directory clean

clean:
	rm -f $(PROCESSED)

run:
	@make --no-print-directory version
	./serve.py -- /bin/bash -c 'web-ext run --start-url $$HTTP_URL/tests/launch.html'
	@make --no-print-directory clean

run-local:
	@make --no-print-directory version
	web-ext run --start-url file://$(shell pwd)/tests/simple.csv
	@make --no-print-directory clean

font:
	if [ -e "$${HOME}/Downloads/FireCsvIcon.zip" ] ; then \
	  unzip -o -d raw/FireCsvIcon "$${HOME}/Downloads/FireCsvIcon.zip" ; \
	  rm --force "$${HOME}/Downloads/FireCsvIcon.zip" ; \
	fi
	cp --force raw/FireCsvIcon/style.css firecsv/FireCsvIcon/
	cp --force raw/FireCsvIcon/fonts/* firecsv/FireCsvIcon/fonts/

#------------------------------------------------------------------------------
# end of $Id$
# $ChangeLog$
#------------------------------------------------------------------------------
