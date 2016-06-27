#!/usr/bin/env python

import json
import sys
import string
from mechanics.flexible_linker import *
from mechanics.association_dissociation_group import *
from mechanics.distribute_bodies import *
from mechanics.make_subunits import *
from mechanics.two_domain_construct import *
import cgi, cgitb
from pprint import pprint
from subprocess import Popen, PIPE, STDOUT, check_output, check_call
import os

# -*- coding: UTF-8 -*-
 
form_input = json.load(sys.stdin)
form_input = json.dumps(form_input)

print "Content-Type: text/plain;charset=utf-8"
print

os.environ['LD_LIBRARY_PATH'] = '.:../External_Libraries/osg/lib/'

process=Popen(['./simulate'],stdout=PIPE,stdin=PIPE, shell=True)
out, err = process.communicate(input=form_input)

print out