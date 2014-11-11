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

PROCESSED       = package.json src/install.rdf

help:
	@echo "make targets:"
	@echo "  version"
	@echo "  xpi"
	@echo "  run"
	@echo "  clean"

include Makefile.git

version:
	@VERSION=`cat VERSION.txt` make _version --no-print-directory

_version:
	@for target in $(PROCESSED) ; do \
	  echo "creating '$$target'..." ; \
	  cat "$$target.IN" | sed -e "s/{{VERSION}}/$$VERSION/g" > "$$target" ; \
	done

xpi:
	@make --no-print-directory version
	cfx xpi
	@make --no-print-directory clean

clean:
	rm -f $(PROCESSED)

run:
	@make --no-print-directory version
	./server.py -p 8000 &
	cfx run
	@make --no-print-directory clean

font:
	if [ -e "$${HOME}/Downloads/FireCsvIcon.zip" ] ; then \
	  unzip -o -d raw/FireCsvIcon "$${HOME}/Downloads/FireCsvIcon.zip" ; \
	  rm --force "$${HOME}/Downloads/FireCsvIcon.zip" ; \
	fi
	cp --force raw/FireCsvIcon/style.css data/FireCsvIcon/
	cp --force raw/FireCsvIcon/fonts/* data/FireCsvIcon/fonts/

#------------------------------------------------------------------------------
# end of $Id$
#------------------------------------------------------------------------------
