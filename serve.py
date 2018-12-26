#!/usr/bin/env python
# -*- coding: utf-8 -*-
#------------------------------------------------------------------------------
# file: $Id$
# auth: metagriffin <mg.github@metagriffin.net>
# date: 2018/12/26
# copy: (C) Copyright 2018-EOT metagriffin -- see LICENSE.txt
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

import argparse
import contextlib
import SimpleHTTPServer, SocketServer
import random
import sys
import threading
import subprocess
import pipes
import os

from aadict import aadict

#------------------------------------------------------------------------------
@contextlib.contextmanager
def run_http_server(options):
  '''
  Start HTTP server at current directory
  '''
  class TcpServer(SocketServer.TCPServer):
    allow_reuse_address = True
    def start(self):
      self.thread = threading.Thread(target=self.serve_forever)
      self.thread.start()
    def stop(self):
      self.shutdown()
      self.thread.join()
  # todo: put this in a loop until an open port is found...
  host = 'localhost'
  # port = 30000 + random.randrange(0, 1000)
  port = 30001
  server = TcpServer((host, port), SimpleHTTPServer.SimpleHTTPRequestHandler)
  server.start()
  url  = 'http://{host}:{port}'.format(host=host, port=port)
  sys.stderr.write('started HTTP server on %s\n' % (url,))
  yield aadict(host=host, port=port, url=url, server=server)
  sys.stderr.write('stopping HTTP server...\n')
  server.stop()

#------------------------------------------------------------------------------
def main(args=None):
  cli = argparse.ArgumentParser()
  cli.add_argument(
    'command', metavar='COMMAND',
    nargs='+',
    help='the command to execute while the HTTP server is running',
  )
  options = cli.parse_args(args)
  with run_http_server(options) as server:
    env = dict(
      os.environ,
      HTTP_HOST = server.host,
      HTTP_PORT = str(server.port),
      HTTP_URL  = server.url,
    )
    cmd = ' '.join([pipes.quote(arg) for arg in options.command])
    subprocess.call(cmd, shell=True, env=env)
  return 0

#------------------------------------------------------------------------------
if __name__ == "__main__":
  sys.exit(main(sys.argv[1:]))

#------------------------------------------------------------------------------
# end of $Id$
# $ChangeLog$
#------------------------------------------------------------------------------
