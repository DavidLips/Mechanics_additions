#!/usr/bin/python

## usage: python two_pdb_multiple_linkers.py [-h] [-s1 PDBstructure1] [-s2 PDBstructure2] [-l comma-separated linker lengths]

from Bio.PDB import *
from subprocess import Popen, PIPE, STDOUT
import json
import sys
from analyte_methods import *
from position_constraints import *
from parse_input_form4 import *
from forces_and_structures import *


def simulate_scene(scene_filename,analyte):

	with open(scene_filename,"r") as scene_file:
		scene=scene_file.read()
		process=Popen(['./complex_simulate.sh'],stdout=PIPE,stdin=PIPE)
		stdout_data=process.communicate(input=scene)
		for data_point in stdout_data[0].split("\n"):
			if data_point: 
				print analyte, "output: ", data_point

def view_simulation(scene_filename):

	with open(scene_filename,"r") as scene_file:
		scene=scene_file.read()
		process=Popen(['./complex_viewer.sh'],stdout=PIPE,stdin=PIPE)
		process.communicate(input=scene)
		print "viewer check"


def add_data_node(eta=3.5):

	data_node={"type": "DATA",
			   "eta": eta}

	return data_node

def main():

	#obtain user input from txt file
	user_input = process_user_input_form(sys.argv[1])

	# scene-file framework
	global data
	data={}

	# header parameter values
	data["output_directory"] = "default"
	data["dt"]= 0.1
	data["last_time"]= 10

	# root node
	data['root']=[]

	# data node with general physical parameteres
	data_node=[add_data_node(eta=3.5)]
	data['root'].extend(data_node)

	# structure node with pdb structures
	pdb_values, structure_nodes = add_rigid_structure_node(user_input)
	data['root'].extend(structure_nodes.values())
	
	# brownian force node
	force_nodes=[add_brownian(user_input.temperature)]
	data['root'].extend(force_nodes)

	# trust region evolution method
	evolution_nodes=[default_evolution()]
	data['root'].extend(evolution_nodes)

	# absolute position constraints
	absolute_position_constraint_node = add_absolute_position_constraint_node(user_input)
	data['root'].extend([absolute_position_constraint_node])

	# volume constraint
	volume_constraint=[add_volume_position_constraint()]
	data['root'].extend(volume_constraint)

	### analyte
	main_analyte_node = add_analyte_node(user_input)
	data['root'].extend(main_analyte_node)

	# generate scene file and simulate for all linker lengths
	for i in range(len(user_input.linker.length)):

		# add flexible linker
		if user_input.linker.length[i] != 0:
			flexible_linker=[add_linker(user_input,i,pdb_values)]
			data['root'].extend(flexible_linker)

		# generate scene file
		with open('test_scenes/example.json','w') as outfile:
			json.dump(data,outfile,indent=4)

		print "Running simulation with linker length", str(user_input.linker.length[i])+'', "while analyzing", user_input.analyte.predicate.main_type[0],'('+user_input.analyte.aggregator.type[0]+')...'

		# simulate & view
		simulate_scene('test_scenes/example.json',user_input.analyte.predicate.main_type[0])
		view_simulation('test_scenes/example.json')

		# delete last linker (to make room for the next iteration when simulating multiple linker lengths)
		data['root'].pop()


if __name__=="__main__":
	main()