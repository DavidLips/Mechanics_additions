from Bio.PDB import *
from subprocess import Popen, PIPE, STDOUT
import math

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


def add_rigid_structure_node(user_input):

	pdbl=PDBList()
	structures = []
	names = []
	pdb_values = {}
	structure_nodes = {}

	for i in range(len(user_input.structure_list)):

		# retrieve structures and store data
		names.append(user_input.structure_list[i])	
		structures.append(pdbl.retrieve_pdb_file(names[i]))

		# obtain structure-specific variables
		radius,collision_extent,n_terminus_offset,c_terminus_offset,position = obtain_pdb_values(structures[i])

		# project c- and n-terminus to surface if needed (to position linkers properly)
		if math.sqrt(c_terminus_offset[0]**2 + c_terminus_offset[1]**2) < radius:
 
			scale = radius / math.sqrt(c_terminus_offset[0]**2 + c_terminus_offset[1]**2)

			c_terminus_offset[0] *= scale
			c_terminus_offset[1] *= scale

		if math.sqrt(n_terminus_offset[0]**2 + n_terminus_offset[1]**2) < radius:

			scale = radius / math.sqrt(n_terminus_offset[0]**2 + n_terminus_offset[1]**2)

			n_terminus_offset[0] *= scale
			n_terminus_offset[1] *= scale

		# shrinking protein to amplify brownian force effect
		c_terminus_offset = [pos/100 for pos in c_terminus_offset]
		n_terminus_offset = [pos/100 for pos in n_terminus_offset]

		# store values for later use
		pdb_values[names[i]]={'radius':radius/10,
						  	  'collision_extent':collision_extent/10,
						   	  'n_terminus_offset':n_terminus_offset,
						  	  'c_terminus_offset':c_terminus_offset,
						  	  'position':position}



		structure_nodes[names[i]]={'type': 'RIGID_STRUCTURE',
	                           	   'radius': radius/100,
	                           	   'collision_extent': collision_extent/100,
	                           	   'name': names[i],
	                           	   'position': position}

	return pdb_values, structure_nodes
    
def add_linker(user_input,i,pdb_values,link_radius=0.2,link_offset=[1.2,0,0]):
	
	# only add linker if length > 0
	if user_input.linker.length[i] != 0:

		# determine what terminal to attach linker to
		if user_input.linker.site1[0].startswith("N") or user_input.linker.site1[0].startswith("n"):
			struct1_offset = 'n_terminus_offset'
		if user_input.linker.site1[0].startswith("C") or user_input.linker.site1[0].startswith("c"):
			struct1_offset = 'c_terminus_offset'
		if user_input.linker.site2[0].startswith("N") or user_input.linker.site2[0].startswith("n"):
			struct2_offset = 'n_terminus_offset'
		if user_input.linker.site2[0].startswith("C") or user_input.linker.site2[0].startswith("c"):
			struct2_offset = 'c_terminus_offset'

	# create linker node
	flexible_linker={'type':'FLEXIBLE_LINKER',
					 'structure1':user_input.linker.struct1[0],
					 'offset1':pdb_values[user_input.linker.struct1[0]][struct1_offset],
					 'structure2':user_input.linker.struct2[0],
					 'offset2':pdb_values[user_input.linker.struct2[0]][struct2_offset],
					 'links':user_input.linker.length[i],
					 'link_radius':link_radius,
					 'link_offset':link_offset}

	return flexible_linker

# defines a brownian force at a default temperature of 300
def add_brownian(temp=30000):
	brownian_force ={'type':"BROWNIAN_FORCE",
					 'temperature':temp}
	return brownian_force


# defines default evolution method using trust regions
def default_evolution(evolution_type="TRUST_REGION",name="evolution"):
	evolution_method={'type':evolution_type,
					  'name':name}
	return evolution_method
