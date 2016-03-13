#!/usr/bin/python

## Parses an input of format and stores the variables needed to 
## generate a scene file:

# //STRUCTURES
# contains <1FAT>
# contains <3INS>

# //FORCES
# brownian force at <300>K

# //LINEAR ABSOLUTE POSITION CONSTRAINTS
# constrain <1FAT> in direction <[0,0,1]> at magnitude <0>

# //ANGULAR ABSOLUTE POSITION CONSTRAINTS
# constrain <1FAT> along axis <[1,0,0]> at angle <-90>

# //RELATIVE POSITION CONSTRAINTs (if #structures > 1)
# keep distance <10> between <1FAT> and <3INS>

# //LINKER
# add linker of length <10> between <1FAT> <N-terminal> and <3INS C-terminal>

import re
import ast

class userInput(object):

	def __init__(self):
		self.structure_list = []
		self.linear_absolute_position_constraints = userLinearConstraints()
		self.angular_absolute_position_constraints = userAngularConstraints()
		self.relative_position_constraints = userRelativeConstraints()
		self.linker = userLinkers()
		self.analyte = userAnalyte()
		self.temperature = 0

class userLinearConstraints(userInput):

	def __init__(self):
		self.struct = []
		self.direction = []
		self.magnitude = []

class userAngularConstraints(userInput):

	def __init__(self):
		self.struct = []
		self.axis = []
		self.angle = []

class userRelativeConstraints(userInput):

	def __init__(self):
		self.distance = []
		self.struct1 = []
		self.struct2 = []

class userLinkers(userInput):

	def __init__(self):
		self.length = []
		self.struct1 = []
		self.site1 = []
		self.struct2 = []
		self.site2 = []

class userAnalyte(userInput):

	def __init__(self):
		self.prerequisite = ["evolution"]
		self.predicate = userPredicate()
		self.aggregator = userAggregator()
		self.condition = userCondition

class userPredicate(userAnalyte):

	def __init__(self):
		self.rigid_structure_position = userRigidStructure()
		self.distance = userDistance() 
		self.dt = userTimestep()
		self.scalar = userScalar()
		self.vector = userVector()
		self.less_than = userLessThan()
		self.main_type = []

class userRigidStructure(userPredicate):

	def __init__(self):
		self.type = ["rigid_structure_position"]
		self.name = []
		self.offset = []

class userDistance(userPredicate):

	def __init__(self):
		self.type = ["distance"]
		self.first_type = []
		self.first_structure = userRigidStructure()
		self.first_vector = userVector()
		self.second_type = []
		self.second_structure = userRigidStructure()
		self.second_vector = userVector()

class userVector(userPredicate):

	def __init__(self):
		self.type = ["vector"]
		self.values = []

class userScalar(userPredicate):

	def __init__(self):
		self.type = ["scalar"]
		self.value = []

class userTimestep(userPredicate):

	def __init__(self):
		self.type = ["dt"]


class userLessThan(userPredicate):

	def __init__(self):
		self.type = ["less_than"]
		self.a_distance = userDistance()
		self.a_scalar = userScalar()
		self.b_distance = userDistance()
		self.b_scalar = userScalar()

class userCondition(userAnalyte):

	def __init__(self):
		self.type = ["less than"]
		self.a = userPredicate()
		self.b = userPredicate()

class userAggregator(userAnalyte):

	def __init__(self):
		self.type = ["sum"]
		self.min = []
		self.max = []
		self.bins = []

def add_distance_objects(user_input, input_variables):

	# first is vector
	if isinstance(input_variables[1],list):

		user_input.analyte.predicate.distance.first_type.append("vector")
		user_input.analyte.predicate.distance.first_vector.values.append(input_variables[1])
	
	# first is structure
	else: 

		user_input.analyte.predicate.distance.first_type.append("rigid_structure_position")
		user_input.analyte.predicate.distance.first_structure.name.append(input_variables[1])
		user_input.analyte.predicate.distance.first_structure.offset.append([0,0,0])

	# second is vector
	if isinstance(input_variables[2],list):

		user_input.analyte.predicate.distance.second_type.append("vector")
		user_input.analyte.predicate.distance.second_vector.values.append(input_variables[2])

	# second is structure
	else:

		user_input.analyte.predicate.distance.second_type.append("rigid_structure_position")
		user_input.analyte.predicate.distance.second_structure.name.append(input_variables[2])
		user_input.analyte.predicate.distance.second_structure.offset.append([0,0,0])

def process_user_input_form(filename):

	# define user input pattern (specified between <>)
	input_pattern = re.compile("(?<=<)(?P<user_input>.*?)(?=>)")

	# object to hold user input
	user_input = userInput()
	
	# open input form
	with open(filename, "r") as f:
		lines = f.readlines()

	for i in range(len(lines)):

		lines[i] = lines[i].strip('\n')

		# declare input section
		if lines[i].startswith('//'): 
			input_section = lines[i][2:]
		else: 
			input_section = False

		# stop when END is reached
		if input_section == "END": 
			break

		# start at next line
		j = i+1

		# parse until next section
		while lines[j].startswith('//') == False and input_section:

			# find input pattern
			input_variables = input_pattern.findall(lines[j])

			if input_variables:	

				for n in range(len(input_variables)):

					try: input_variables[n] = ast.literal_eval(input_variables[n])
					except: pass

				if input_section.startswith("STRUCTURES"):

					user_input.structure_list.extend(input_variables)

				elif input_section.startswith("FORCES"):

					user_input.temperature = int(input_variables[0])

				elif input_section.startswith("LINEAR"):

					user_input.linear_absolute_position_constraints.struct.append(input_variables[0])
					user_input.linear_absolute_position_constraints.direction.append(input_variables[1])
					user_input.linear_absolute_position_constraints.magnitude.append(input_variables[2])

				elif input_section.startswith("ANGULAR"):

					user_input.angular_absolute_position_constraints.struct.append(input_variables[0])
					user_input.angular_absolute_position_constraints.axis.append(input_variables[1])
					user_input.angular_absolute_position_constraints.angle.append(input_variables[2])

				elif input_section.startswith("RELATIVE"):

					user_input.relative_position_constraints.distance.append(input_variables[0])
					user_input.relative_position_constraints.struct1.append(input_variables[1])
					user_input.relative_position_constraints.struct2.append(input_variables[2])

				elif input_section.startswith("LINKER"):

					user_input.linker.length = list(input_variables[0]) if type(input_variables[0]) is tuple else [input_variables[0]]
					user_input.linker.struct1.append(input_variables[1])
					user_input.linker.site1.append(input_variables[2])
					user_input.linker.struct2.append(input_variables[3])
					user_input.linker.site2.append(input_variables[4])

				elif input_section.startswith("ANALYTE"):

					# analyte predicate is rigid structure position
					if input_variables[0] == "position" or input_variables[0] == "rigid structure position":

						user_input.analyte.predicate.main_type.append("rigid_structure_position")
						user_input.analyte.predicate.rigid_structure_position.name.append(input_variables[1])
						user_input.analyte.predicate.rigid_structure_position.offset.append(input_variables[2])

					# analyte predicate is distance
					if input_variables[0] == "distance":

						user_input.analyte.predicate.main_type.append("distance")						
						add_distance_objects(user_input, input_variables)

					# analyte predicate is dt
					if input_variables[0] == "timestep" or input_variables[0] == "time step" or input_variables[0] == "time":
						user_input.analyte.predicate.main_type.append("dt")
						

					# analyte predicate is vector
					if input_variables[0] == "vector":

						user_input.analyte.predicate.main_type.append("vector")
						user_input.analyte.predicate.vector.values.append(input_variables[1])

					# analyte predicate is scalar
					if input_variables[0] == "scalar":
						user_input.analyte.predicate.main_type.append("scalar")
						user_input.analyte.predicate.scalar.value.append(input_variables[1])

			# move to next line
			j+=1

	return user_input

