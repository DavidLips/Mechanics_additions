# functions for imposing absolute and relative 
# position constraints on proteins in a simulation. 

def add_linear_absolute_position_constraint(structure_name, direction, magnitude):

	absolute_position_constraint = {'type':'linear',
									'structure': structure_name,
									'direction': direction,
									'magnitude': magnitude}

	return absolute_position_constraint


def add_angular_absolute_position_constraint(structure_name, axis, angle):

	angular_position_constraint = {'type':'angular',
								   'structure':structure_name,
								   'orientation':{
								   		'axis': axis,
								   		'angle': angle}}

	return angular_position_constraint

def add_absolute_position_constraint_node(user_input):

	# umbrella constraints node
	absolute_position_constraint_node = {'type': 'ABSOLUTE_POSITION_CONSTRAINT',
												 'constraints': []}

	linear_constraint_list = []
	angular_constraint_list = []

	# apply all linear position constraints
	for i in range(len(user_input.linear_absolute_position_constraints.struct)):

		linear_constraint_list.append([add_linear_absolute_position_constraint(user_input.linear_absolute_position_constraints.struct[i],
																			   user_input.linear_absolute_position_constraints.direction[i],
																			   user_input.linear_absolute_position_constraints.magnitude[i])])

		absolute_position_constraint_node['constraints'].extend(linear_constraint_list[i])

	# apply all angular position constraints
	for i in range(len(user_input.angular_absolute_position_constraints.struct)):

		angular_constraint_list.append([add_angular_absolute_position_constraint(user_input.angular_absolute_position_constraints.struct[i],
																			     user_input.angular_absolute_position_constraints.axis[i],
																			     user_input.angular_absolute_position_constraints.angle[i])])

		absolute_position_constraint_node['constraints'].extend(angular_constraint_list[i])

	return absolute_position_constraint_node

def add_relative_position_constraint_node():


	relative_position_constraint_node = {'type': 'RELATIVE_POSITION_CONSTRAINT',
								    	 'constraints': []}

	return relative_position_constraint_node

def add_relative_position_constraint(structure_1, offset_1, structure_2, offset_2, distance):

	relative_position_constraint = {'structure1':structure_1,
									'offset1': offset_1,
									'structure2':structure_2,
									'offset2':offset_2,
									'distance':distance}

	return relative_position_constraint									
 
def add_volume_position_constraint():
	volume_constraint={'type':'VOLUME_EXCLUSION_CONSTRAINT'}
	return volume_constraint


