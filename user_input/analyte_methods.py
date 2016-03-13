def add_vector_analyte(vector,evolution_method='evolution',aggregator='average'):

	analyte_method={'type':"ANALYTE",
					'prerequisites':evolution_method,
					'predicate':{
						'type': "vector",
						'vector':vector},
					'aggregator': {'type':aggregator}}



	return analyte_method


def add_vector_predicate(vector):

	predicate={'type':"vector",
				"vector":vector}

	return predicate

def add_scalar_analyte(scalar,evolution_method='evolution',aggregator='average'):

	analyte_method={'type':"ANALYTE",
					'prerequisites':evolution_method,
					'predicate':{
						'type': "scalar",
						'scalar':scalar},
					'aggregator': {'type':aggregator}}



	return analyte_method

def add_separate_scalar_predicate(scalar):

	predicate={'type':"scalar",
				"scalar":scalar}

	return predicate	

def add_rigid_structure_position_analyte(structure_name,
										 evolution_method='evolution',
				   						 offset=[0,0,0],
				    					 aggregator='average'):

	analyte_method={'type':"ANALYTE",
					'prerequisites':evolution_method,
					'predicate':{
						'type':"rigid_structure_position",
						'name':structure_name,
						'offset':offset},
					'aggregator':{'type':aggregator}}

	return analyte_method



# defines a simple analyte method tracking the average structure position
def add_rigid_structure_position_predicate(name,offset=[0,0,0]):

	predicate={'type':"rigid_structure_position",
			   'name':name,
	   		   'offset':offset}

	return predicate

# first and second are function calls to addRigidStructurePositionPredicate, addScalarPredicate, or addVectorPredicate
def add_distance_analyte(first={}, second={},evolution_method='evolution',aggregator='average'):

	analyte_method={'type':"ANALYTE",
					'prerequisites':evolution_method,
					'predicate':{
						'type': "distance",
						'first': first,
						'second': second},
					'aggregator': {'type':aggregator}}

	return analyte_method

# define a timestep predicate 
def add_timestep_analyte(evolution_method='evolution', aggregator='average'):

	analyte_method={'type':"ANALYTE",
					'prerequisites':evolution_method,
					'predicate':{
						'type': "dt"},
					'aggregator': {'type':aggregator}}

	return analyte_method

def add_analyte_node(user_input):

	if user_input.analyte.predicate.main_type[0] == "rigid_structure position":

		main_analyte_node = [add_rigid_structure_position_analyte(structure_name=user_input.analyte.predicate.rigid_structure_position.name[0],
											 offset=user_input.analyte.predicate.rigid_structure_position.offset[0])]

	elif user_input.analyte.predicate.main_type[0] == 'distance':

		main_analyte_node = [add_distance_analyte()]

		# add predicates to first and second
		if user_input.analyte.predicate.distance.first_type[0] == "vector": 
			main_analyte_node[0]['predicate']['first'].update(add_vector_predicate(vector=user_input.analyte.predicate.distance.first_vector.values[0]))

		else:
			main_analyte_node[0]['predicate']['first'].update(add_rigid_structure_position_predicate(name=user_input.analyte.predicate.distance.first_structure.name[0]))

		if user_input.analyte.predicate.distance.second_type[0] == "vector":
			main_analyte_node[0]['predicate']['second'].update(add_vector_predicate(vector=user_input.analyte.predicate.distance.second_vector.values[0]))

		else:
			main_analyte_node[0]['predicate']['second'].update(add_rigid_structure_position_predicate(name=user_input.analyte.predicate.distance.second_structure.name[0]))
			
	elif user_input.analyte.predicate.main_type[0] == "vector":

		main_analyte_node = [add_vector_analyte(vector=user_input.analyte.predicate.vector.values)]

	elif user_input.analyte.predicate.main_type[0] == "scalar":

		main_analyte_node = [add_scalar_analyte(vector=user_input.analyte.predicate.scalar.value)]

	elif user_input.analyte.predicate.main_type[0] == "dt":

		main_analyte_node = [add_timestep_analyte(aggregator='sum')]

	return main_analyte_node