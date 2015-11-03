
# parsetab.py
# This file is automatically generated. Do not edit.
_tabversion = '3.5'

_lr_method = 'LALR'

_lr_signature = '890E2CC1D1CBBF520F9F4DD34E82705C'
    
_lr_action_items = {'PRINT':([0,13,22,],[1,1,1,]),'ADD_OP':([1,7,8,10,11,12,14,15,16,17,18,19,21,23,24,25,],[9,9,-10,17,-9,9,9,17,-11,9,9,17,17,-12,-13,-8,]),'MUL_OP':([8,10,11,15,16,19,21,23,24,25,],[-10,18,-9,18,-11,18,18,18,-13,-8,]),'BRA_CLOSE':([2,3,6,8,10,11,16,20,21,23,24,25,26,27,],[-1,-4,-3,-10,-5,-9,-11,-2,-7,-12,-13,-8,27,-6,]),'EQUAL':([4,],[14,]),'NUMBER':([1,7,9,12,14,17,18,],[11,11,16,11,11,11,11,]),'PAR_CLOSE':([8,11,16,19,23,24,25,],[-10,-9,-11,25,-12,-13,-8,]),'PAR_OPEN':([1,7,12,14,17,18,],[12,12,12,12,12,12,]),'IDENTIFIER':([0,1,7,12,13,14,17,18,22,],[4,8,8,8,4,8,8,8,4,]),'$end':([2,3,5,6,8,10,11,16,20,21,23,24,25,27,],[-1,-4,0,-3,-10,-5,-9,-11,-2,-7,-12,-13,-8,-6,]),'SEMICOLON':([2,3,6,8,10,11,16,21,23,24,25,27,],[13,-4,-3,-10,-5,-9,-11,-7,-12,-13,-8,-6,]),'BRA_OPEN':([8,11,15,16,23,24,25,],[-10,-9,22,-11,-12,-13,-8,]),'WHILE':([0,13,22,],[7,7,7,]),}

_lr_action = {}
for _k, _v in _lr_action_items.items():
   for _x,_y in zip(_v[0],_v[1]):
      if not _x in _lr_action:  _lr_action[_x] = {}
      _lr_action[_x][_k] = _y
del _lr_action_items

_lr_goto_items = {'program':([0,13,22,],[5,20,26,]),'expression':([1,7,12,14,17,18,],[10,15,19,21,23,24,]),'assignement':([0,13,22,],[6,6,6,]),'statement':([0,13,22,],[2,2,2,]),'structure':([0,13,22,],[3,3,3,]),}

_lr_goto = {}
for _k, _v in _lr_goto_items.items():
   for _x, _y in zip(_v[0], _v[1]):
       if not _x in _lr_goto: _lr_goto[_x] = {}
       _lr_goto[_x][_k] = _y
del _lr_goto_items
_lr_productions = [
  ("S' -> program","S'",1,None,None,None),
  ('program -> statement','program',1,'p_program_statement','parser5.py',14),
  ('program -> statement SEMICOLON program','program',3,'p_program_statement','parser5.py',15),
  ('statement -> assignement','statement',1,'p_statement_exp','parser5.py',23),
  ('statement -> structure','statement',1,'p_statement_exp','parser5.py',24),
  ('statement -> PRINT expression','statement',2,'p_print_statement','parser5.py',29),
  ('structure -> WHILE expression BRA_OPEN program BRA_CLOSE','structure',5,'p_while_structure','parser5.py',34),
  ('assignement -> IDENTIFIER EQUAL expression','assignement',3,'p_assignement','parser5.py',39),
  ('expression -> PAR_OPEN expression PAR_CLOSE','expression',3,'p_expression_par','parser5.py',44),
  ('expression -> NUMBER','expression',1,'p_expression_num','parser5.py',49),
  ('expression -> IDENTIFIER','expression',1,'p_expression_num','parser5.py',50),
  ('expression -> ADD_OP NUMBER','expression',2,'p_expression_unary_num','parser5.py',55),
  ('expression -> expression ADD_OP expression','expression',3,'p_expression_op','parser5.py',72),
  ('expression -> expression MUL_OP expression','expression',3,'p_expression_op','parser5.py',73),
]
