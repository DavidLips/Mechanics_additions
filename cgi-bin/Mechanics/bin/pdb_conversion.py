#!/usr/bin/python

## usage: python test_pdb_conversion.py [pdb code: e.g. 1FAT]

from Bio.PDB import *
from subprocess import Popen, PIPE, STDOUT
import json
import sys

def obtain_pdb_values(filename):

	with open(filename,"r") as pdb_handle:
	    pdb_content=pdb_handle.read()
	    process=Popen(['./convert_structure_test'],stdout=PIPE,stdin=PIPE)
	    stdout_data=process.communicate(input=pdb_content)
	    
	radius = float(stdout_data[0].split("\n")[0])
	collision_extent = float(stdout_data[0].split("\n")[1])
	n_terminus = [float(n) for n in stdout_data[0].split("\n")[2].split()]
	c_terminus = [float(c) for c in stdout_data[0].split("\n")[3].split()]
	position = [float(pos) for pos in stdout_data[0].split("\n")[4].split()]

	return(radius,collision_extent,n_terminus,c_terminus,position)


def main():

	data=json.load(sys.stdin)

	pdbl=PDBList()
	name = data['struct']
	structure = pdbl.retrieve_pdb_file(name)

	# obtain structure-specific variables
	radius,collision_extent,n_terminus_offset,c_terminus_offset,position = obtain_pdb_values(structure)

	pdb_values = {
		'radius': radius,
		'collision_extent': collision_extent,
		'n_terminus_offset': [n_terminus_offset[0], n_terminus_offset[1], n_terminus_offset[2]],
		'c_terminus_offset': [c_terminus_offset[0], c_terminus_offset[1], c_terminus_offset[2]],
		'position': [position[0], position[1], position[2]]
	}

	print 'Content-Type: application/json\n\n'
	json.dump(pdb_values,sys.stdout,indent=4)

if __name__=="__main__":
	main()