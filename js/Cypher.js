/*
* Cypher.js graph query engine for Javascript. https://github.com/niclasko/Cypher.js.
* Copyright (c) 2024 "Niclas Kjall-Ohlsson"
* 
* This file is part of Cypher.js.
* 
* Cypher.js is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Cypher.js is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Cypher.js.  If not, see <https://www.gnu.org/licenses/>.
*/
function CypherJS() {
	
	Data: {
		
		function StringRecoder() {
			var TrieNode = function() {
				return [{}, null];
			};
			var root = TrieNode();
			var code_factory = 1;
			var CHARS = 0;
			var CODE = 1;
			this.recode = function(_val) {
				if(!_val) return _val;
				var val = _val;
				if(!val.charAt) {
					val = ''+_val;
				}
				var n = root, char;
				for(var i=0; i<val.length; i++) {
					char = val.charAt(i);
					if(!n[CHARS][char]) {
						n[CHARS][char] = TrieNode();
					}
					n = n[CHARS][char];
				}
				return n[CODE] || (n[CODE] = code_factory++);
			};
		};

		function IDFactory() {
			var ID = -1;
			this.getId = function() {
				return ID++;
			};
		};
		
		function DB(engine) {
			var self = this;
			var engine;
			var nodes = [];
			var NODE_ID_FACTORY = 0;
			var nodeIdLookup = {};
			var labelNodeIdLookup = {};
			
			var relationships = [];
			var RELATIONSHIP_ID_FACTORY = 0;
			var relationshipLookup = {};
			var relationshipIdsByNodeIdLookup = {};
			var relationshipIdsByNodeIdLookupIncoming = {};
			var relationshipIdLookup = {};
			var typeRelationshipIdLookup = {};

			var tables = {};
			
			var stringRecoder = new StringRecoder();
			
			var recode = function(val) {
				return stringRecoder.recode(val);
			};
			var initializeRelationshipLookup = function(fromNodeId, toNodeId) {
				if(fromNodeId != undefined) {
					if(!relationshipLookup[fromNodeId]) {
						relationshipLookup[fromNodeId] = {};
					}
					if(toNodeId != undefined) {
						if(!relationshipLookup[fromNodeId][toNodeId]) {
							relationshipLookup[fromNodeId][toNodeId] = [];
						}
					}
				}
			};
			var lookupRelationships = function(fromNodeId, toNodeId) {
				initializeRelationshipLookup(fromNodeId, toNodeId);
				if(fromNodeId != undefined) {
					if(toNodeId != undefined) {
						return relationshipLookup[fromNodeId][toNodeId];
					} else if(toNodeId == undefined) {
						var relationshipIds = [];
						for(nodeId in relationshipLookup[fromNodeId]) {
							relationshipIds = relationshipIds.concat(
								relationshipLookup[fromNodeId][nodeId]
							);
						}
						return relationshipIds;
					}
				}
				return [];
			};
			var addLookupRelationship = function(fromNodeId, toNodeId, relationshipId) {
				initializeRelationshipLookup(fromNodeId, toNodeId);
				relationshipLookup[fromNodeId][toNodeId].push(relationshipId);
				addLookupRelationshipIdsByNodeId(fromNodeId, relationshipId);
				addLookupRelationshipIdsByNodeIdIncoming(toNodeId, relationshipId);
			};
			var initializeRelationshipIdsByNodeIdLookup = function(nodeId) {
				if(!relationshipIdsByNodeIdLookup[nodeId]) {
					relationshipIdsByNodeIdLookup[nodeId] = [];
				}
			};
			var lookupRelationshipIdsByNodeId = function(nodeId) {
				initializeRelationshipIdsByNodeIdLookup(nodeId);
				return relationshipIdsByNodeIdLookup[nodeId];
			};
			var addLookupRelationshipIdsByNodeId = function(nodeId, relationshipId) {
				initializeRelationshipIdsByNodeIdLookup(nodeId);
				relationshipIdsByNodeIdLookup[nodeId].push(relationshipId);
			};
			var initializeRelationshipIdsByNodeIdLookupIncoming = function(nodeId) {
				if(!relationshipIdsByNodeIdLookupIncoming[nodeId]) {
					relationshipIdsByNodeIdLookupIncoming[nodeId] = [];
				}
			};
			var lookupRelationshipIdsByNodeIdIncoming = function(nodeId) {
				initializeRelationshipIdsByNodeIdLookupIncoming(nodeId);
				return relationshipIdsByNodeIdLookupIncoming[nodeId];
			};
			var addLookupRelationshipIdsByNodeIdIncoming = function(nodeId, relationshipId) {
				initializeRelationshipIdsByNodeIdLookupIncoming(nodeId);
				relationshipIdsByNodeIdLookupIncoming[nodeId].push(relationshipId);
			};
			var initializeNodeIdLookup = function(key, value) {
				if(!nodeIdLookup[key]) {
					nodeIdLookup[key] = {};
				}
				if(!nodeIdLookup[key][value]) {
					nodeIdLookup[key][value] = [];
				}
			};
			var lookupNodeIds = function(_key, _value) {
				var key = recode(_key),
					value = recode(_value);
				initializeNodeIdLookup(key, value);
				return nodeIdLookup[key][value];
			};
			var initializeRelationshipIdLookup = function(key, value) {
				if(!relationshipIdLookup[key]) {
					relationshipIdLookup[key] = {};
				}
				if(!relationshipIdLookup[key][value]) {
					relationshipIdLookup[key][value] = [];
				}
			};
			var addLookupNodeId = function(_key, _value, nodeId) {
				var key = recode(_key),
					value = recode(_value);
				initializeNodeIdLookup(key, value);
				nodeIdLookup[key][value].push(nodeId);
			};
			var addLookupRelationshipId = function(_key, _value, relationshipId) {
				var key = recode(_key),
					value = recode(_value);
				initializeRelationshipIdLookup(key, value);
				relationshipIdLookup[key][value].push(relationshipId);
			};
			var initializeLabelNodeIdLookup = function(label) {
				if(!labelNodeIdLookup[label]) {
					labelNodeIdLookup[label] = [];
				}
			};
			var lookupLabelNodeIds = function(_label) {
				var label = recode(_label);
				initializeLabelNodeIdLookup(label);
				return labelNodeIdLookup[label];
			};
			var initializeTypeRelationshipIdLookup = function(type) {
				if(!typeRelationshipIdLookup[type]) {
					typeRelationshipIdLookup[type] = [];
					return false;
				}
			};
			var addLabelNodeIdLookup = function(_label, nodeId) {
				var label = recode(_label);
				initializeLabelNodeIdLookup(label);
				var equalsNodeIdCheck = function(el) {
					return el == nodeId;
				};
				if(nodeId != undefined && !labelNodeIdLookup[label].find(equalsNodeIdCheck)) {
					labelNodeIdLookup[label].push(nodeId);
				}
			};
			this._addLabelNodeIdLookup = function(_label, nodeId) {
				addLabelNodeIdLookup(_label, nodeId);
			};
			var addTypeRelationshipIdLookup = function(_type, relationshipId) {
				if(relationshipId == undefined) {
					return;
				}
				var type = recode(_type);
				initializeTypeRelationshipIdLookup(type);
				var equalsRelationshipIdCheck = function(el) {
					return el == relationshipId;
				};
				if(!typeRelationshipIdLookup[type].find(equalsRelationshipIdCheck)) {
					typeRelationshipIdLookup[type].push(relationshipId);
					relationships[relationshipId].setStoredType(_type);
				}
			};
			this._addTypeRelationshipIdLookup = function(_type, relationshipId) {
				addTypeRelationshipIdLookup(_type, relationshipId);
			};
			var getFreeNodeId = function() {
				while(nodes[NODE_ID_FACTORY]) {
					NODE_ID_FACTORY++;
				}
				return NODE_ID_FACTORY;
			};
			var addNode = function(node, givenId) {
				if(!givenId) {
					node.setId(getFreeNodeId());
					nodes[node.id()] = node;
				} else if(givenId) {
					if(nodes[givenId]) {
						throw "Node with ID " + givenId + " already exists in the database.";
					}
					node.setId(givenId);
					nodes[givenId] = node;
				}
				for(key in node.getRawProperties()) {
					addLookupNodeId(
						key,
						node.getLocalProperty(key),
						node.id()
					);
				}
				for(label in node.labels()) {
					addLabelNodeIdLookup(
						label,
						node.id()
					);
				}
				engine.statement().setNodesAdded(
					engine.statement().getNodesAdded()+1
				);
			};
			var getFreeRelationshipId = function() {
				while(relationships[RELATIONSHIP_ID_FACTORY]) {
					RELATIONSHIP_ID_FACTORY++;
				}
				return RELATIONSHIP_ID_FACTORY;
			};
			var addRelationship = function(relationship, givenId) {
				var relationshipId = null;
				if(!givenId) {
					relationshipId = getFreeRelationshipId();
				} else if(givenId) {
					if(nodes[givenId]) {
						throw "Relationship with ID " + givenId + " already exists in the database.";
					}
					relationshipId = givenId;
				}
				relationship.setId(relationshipId);
				relationships[relationshipId] = relationship;
				
				addLookupRelationship(
					relationship.getFromNode().id(),
					relationship.getToNode().id(),
					relationship.id()
				);
				
				if(relationship.getToNode().id() != relationship.getFromNode().id()) {
					addLookupRelationship(
						relationship.getToNode().id(),
						relationship.getFromNode().id(),
						relationship.id()
					);
				}
				
				for(key in relationship.getProperties()) {
					addLookupRelationshipId(
						key,
						relationship.getProperty(key),
						relationship.id()
					);
				}
				addTypeRelationshipIdLookup(
					relationship.getType(),
					relationship.id()
				);
				relationship.setIsAdded();
				engine.statement().setRelationshipsAdded(
					engine.statement().getRelationshipsAdded()+1
				);
			};
			
			// Does the specified relationship exist between
			// fromNode and toNode?
			var relationshipMatch = function(relationship, fromNode, toNode) {
				var relationshipIds = [];
				var relationshipIdsFromLookup;
				
				if(!relationship.isReferred()) {

					if(fromNode && toNode) {
						relationshipIdsFromLookup = lookupRelationships(
							fromNode.id(),
							toNode.id()
						);
						relationshipIds = relationshipIds.concat(
							relationshipIdsFromLookup
						);
					} else if(fromNode && !toNode) {
						relationshipIdsFromLookup =
							lookupRelationshipIdsByNodeId(fromNode.id());
						if(relationship.uniDirectional()) {
							relationshipIdsFromLookup.concat(
								lookupRelationshipIdsByNodeIdIncoming(fromNode.id())
							);
						}
						relationshipIds = relationshipIds.concat(
							relationshipIdsFromLookup
						);
					}

				} else if(relationship.isReferred()) {
					var referredRelationship = relationship.getReferredRelationship().getData();
					if(referredRelationship) {
						if(!(referredRelationship.constructor == Relationship ||
							referredRelationship.constructor == RelationshipReference)) {
							throw "Expected relationship.";
						}
					} else {
						throw "Expected relationship.";
					}
					relationshipIds.push(
						referredRelationship.id()
					);
				}
					
				if(relationshipIds.length==0) {
					// There is no relationship between fromNode and toNode
					return false;
				}

				var matcher = new Matcher();
				matcher.setMatchingSet(relationshipIds, 0);
				
				// Does the relationship have a direction
				if(relationship.leftDirection() || relationship.rightDirection()) {
					matcher.incrementToMatchCount(); // Match direction
				}
				// Does the pattern have a type?
				if(relationship.getType()) { // If so, then
					matcher.incrementToMatchCount(); // Match type
				}
				for(key in relationship.getProperties()) {
					matcher.incrementToMatchCount();
				}

				if(matcher.toMatchCount() > 0) {
					var dbRelationship;
					for(var i=0; i<relationshipIds.length; i++) {
						dbRelationship = relationships[relationshipIds[i]];

						// Does the relationship have a direction
						if(relationship.leftDirection() || relationship.rightDirection()) {
							// Match direction if any
							if(relationship.leftDirection() == dbRelationship.leftDirection(fromNode.id()) ||
								relationship.rightDirection() == dbRelationship.rightDirection(fromNode.id())) {
								matcher.keepMatchTally(relationshipIds[i]);
							}
						}
						
						// Does the pattern have a type?
						if(relationship.getType()) { // If so, then
							// Match type if any
							if(dbRelationship.getType() && 
								dbRelationship.getType() == relationship.getType()) {
								matcher.keepMatchTally(relationshipIds[i]);
							}
						}
						// Match relationship pattern properties, if any
						for(key in relationship.getProperties()) {
							if(relationship.getLocalProperty(key) == dbRelationship.getLocalProperty(key)) {
								matcher.keepMatchTally(relationshipIds[i]);
							}
						}
						
					}
					matcher.updateMatchingSet();
				}
				
				if(matcher.matchingSetSize() == 0) {
					return false;
				}
				return matcher.matchingSet();
			};

			this.createNode = function(node) {

				var nodeInstance;

				if(node.isReferred()) {
					nodeInstance =
						node.getReferredNode().getData();
					if(nodeInstance.constructor == Unwind) {
						nodeInstance = nodeInstance.value();
					}
					if(nodeInstance.constructor == NodeReference) {
						nodeInstance = db.getNodeById(nodeInstance.nodeId());
					}
				} else {
					node.bindProperties();
					nodeInstance = node.copy();
					addNode(nodeInstance);
					node.addMatchedNode(nodeInstance); // Add to matched nodes set
				}

				if(node.outgoingRelationship()) {
					node.outgoingRelationship().setFromNode(nodeInstance);
				}
				
				if(node.incomingRelationship()) {
					node.incomingRelationship().bindProperties();
					node.incomingRelationship().setToNode(nodeInstance);
					var relationshipToAdd = node.incomingRelationship().copy();
					addRelationship(relationshipToAdd);
					node.incomingRelationship().addMatchedRelationship(
						relationshipToAdd
					);
				}

				if(node.nextNode()) {
					node.nextNode().create();
				} else if(!node.nextNode()) {
					node.nextAction();
				}

			};

			function Matcher() {
				var toMatchCount = 0;
                var idsMatchCount = [];
				var matchingSet = [];
				this.setMatchingSet = function(_matchingSet, initialMatchCount) {
					matchingSet = _matchingSet;
					idsMatchCount =
						new Array(
							matchingSet.length
						).fill(
							initialMatchCount != undefined ?
								initialMatchCount : 1
						);
				};
				this.addToMatchingSet = function(id) {
					matchingSet.push(parseInt(id));
					idsMatchCount.push(0);
				};
				this.updateMatchingSet = function() {
					var carryOverCount = 0;
					for(var i=0; i<matchingSet.length; i++) {
						if(idsMatchCount[i] == toMatchCount) {
							carryOverCount++;
						}
					}
					var newMatchingSet = new Array(carryOverCount);
					var new_i = 0;
					for(var i=0; i<matchingSet.length; i++) {
						if(idsMatchCount[i] == toMatchCount) {
							newMatchingSet[new_i++] = matchingSet[i];
						}
					}
					matchingSet = newMatchingSet;
					idsMatchCount = new Array(matchingSet.length).fill(toMatchCount);
				};
				this.incrementToMatchCount = function() {
					toMatchCount++;
				};
				this.keepMatchTally = function(id) {
					for(var i=0; i<matchingSet.length; i++) {
						if(matchingSet[i] == id) {
							idsMatchCount[i] = (idsMatchCount[i] + 1 || 1);
						}
					}
				};
				this.toMatchCount = function() {
					return toMatchCount;
				};
				this.matchingSet = function() {
					return matchingSet;
				};
				this.matchingSetSize = function() {
					return matchingSet.length;
				};
			};

			var matchNodeProperties = function(node, matcher) {
				var nodeIds;
				// For all property keys in the node pattern
				for(key in node.getProperties()) {
                         
					node.bindProperty(key);
					 
					// This is the first pattern criteria to match
					// so get all node ids that match
					if(matcher.toMatchCount() == 0 && matcher.matchingSetSize() == 0) {
						 
						nodeIds =
							lookupNodeIds(
								key,
								node.getLocalProperty(key)
							);
						if(nodeIds) {
							matcher.setMatchingSet(nodeIds);
						}
					 
					// There are matching node ids that match given patterns so far
					// Only work with those node ids going forward
					} else if(matcher.matchingSetSize() > 0) {
						 
						// For each of the node ids that match given patterns so far
						for(var i=0; i<matcher.matchingSetSize(); i++) {
							if(node.getLocalProperty(key) == nodes[matcher.matchingSet()[i]].getLocalProperty(key)) {
								matcher.keepMatchTally(matcher.matchingSet()[i]);
							}
						}
					 
					}
					 
					matcher.incrementToMatchCount();
					matcher.updateMatchingSet();
				 
				}
			};

			var matchNodeLabels = function(node, matcher) {
				var nodeIds;
				for(label in node.labels()) {
                         
					// This is the first pattern criteria to match
					// so get all node ids that match
					if(matcher.toMatchCount() == 0 && matcher.matchingSetSize() == 0) {
						// Labels are also part of the merging candidate matching set
						// Same algorithm as for node properties above,
						// but for labels
						nodeIds = lookupLabelNodeIds(label);
						if(nodeIds) {
							matcher.setMatchingSet(nodeIds);
						}
					 
					// There are matching node ids that match given patterns so far
					// Only work with those node ids going forward
					} else if(matcher.matchingSetSize() > 0) {
						// For each of the node ids that match given patterns so far
						for(var i=0; i<matcher.matchingSetSize(); i++) {
							if(nodes[matcher.matchingSet()[i]].hasLabel(label)) {
								matcher.keepMatchTally(matcher.matchingSet()[i]);
							}
						}
						 
					}
					 
					matcher.incrementToMatchCount();
					matcher.updateMatchingSet();
					 
				}
			};

			var conveyorBelt = function(node, merge, _pathExpansionDepth) {
				if(node.nextNode()) {
					if(node.getPattern().usedAsCondition()) {
						return node.nextNode().convey(merge, _pathExpansionDepth);
					} else {
						node.nextNode().convey(merge, _pathExpansionDepth);
					}
				} else if(!node.nextNode()) {
					// Last node in pattern
					// So push everything matched in pattern
					// to the next operation on the conveyor belt
					if(node.getPattern().usedAsCondition()) {
						return node.nextAction();
					} else {
						node.nextAction();
					}
				}
			};

			var processNodeMatcher = function(matcher) {
				var nodeIdsForConveyorBelt = [];
				if(matcher.matchingSetSize() > 0) {
					// There is at least one node id that matches
					// everything from the merging candidate (labels and properties)
				 
					// Todo: Add code here to set labels and/or properties, i.e.
					// from "set" clause

					// Add all nodes that match everything to matched nodes set
					nodeIdsForConveyorBelt = matcher.matchingSet();
				} else if(matcher.toMatchCount() == 0) {
					// Match any node so add all nodes from database to matched nodes
					nodeIdsForConveyorBelt = new Array(nodes.length);
					for(var i=0; i<nodes.length; i++) {
						nodeIdsForConveyorBelt[i] = nodes[i].id();
					}
				}
				return nodeIdsForConveyorBelt;
			};

			var getMatchingNodeIds = function(node, merge) {
				var nodeIdsForConveyorBelt = [];
				
				if(!node.isExpanded()) {
					var matcher = new Matcher();
 
                    if(node.isReferred()) {
						var referredNode = node.getReferredNode().getData();
						if(referredNode.constructor == Unwind) {
							referredNode = referredNode.value();
						}
						if(referredNode) {
							if(!(referredNode.constructor == Node ||
								referredNode.constructor == NodeReference)) {
								throw "Expected node.";
							}
						} else {
							throw "Expected node.";
						}
                        matcher.addToMatchingSet(
                            referredNode.id()
                        );
                    }
 
                    // There is an incoming relationship pattern
                    if(node.incomingRelationship()) {
						if(node.incomingRelationship().hasExpandedEndNode() && !node.isReferred()) {
							matcher.addToMatchingSet(
								node.incomingRelationship().getExpandedEndNode().id()
							);
						}
                    }
					
					matchNodeProperties(node, matcher);
					matchNodeLabels(node, matcher);

					nodeIdsForConveyorBelt = processNodeMatcher(matcher);

					if(nodeIdsForConveyorBelt.length == 0 && merge) {
						if(node.getPattern().usedAsCondition()) {
							return false;
						} else {
							node.getPattern().create();
							return;
						}
					}
                 
                } else if(node.isExpanded()) {
					nodeIdsForConveyorBelt = [node.getExpandedNode().id()];
				}
				return nodeIdsForConveyorBelt;
			};

			var processNodeWithoutRelationships = function(node, nodeId, merge, pathExpansionDepth) {
				if(!node.incomingRelationship() && !node.outgoingRelationship()) {
					node.addMatchedNode(nodes[nodeId]);
					if(node.getPattern().usedAsCondition()) {
						return conveyorBelt(node, merge, pathExpansionDepth);
					} else {
						conveyorBelt(node, merge, pathExpansionDepth);
					}
				}
			};

			var processNodeWithOutgoingRelationship = function(node, nodeIdIndex, nodeId, merge, pathExpansionDepth) {
				var returnValue;
				if(node.outgoingRelationship()) {
					var matchingRelationshipIds =
						getMatchingRelationshipIds(node, nodeIdIndex, nodeId, pathExpansionDepth);
					if(!matchingRelationshipIds && merge) {
						node.getPattern().create();
						returnValue = -1;
					} else if(matchingRelationshipIds.length > 0) {
						returnValue = processMatchingRelationships(node, nodeId, merge, pathExpansionDepth, matchingRelationshipIds);
						if(returnValue != undefined) return returnValue;
						// Breadth-first path expansion
						returnValue = pathExpansion(node, nodeId, pathExpansionDepth, matchingRelationshipIds);
						if(returnValue != undefined) return returnValue;
					}
				}
				return returnValue;
			};

			var processNodeWithIncomingRelationship = function(node, nodeId, merge, pathExpansionDepth) {
				var returnValue;
				// Check if there is an incoming relationship
				if(node.incomingRelationship()) {
					node.addMatchedNode(nodes[nodeId]);

					if(node.incomingRelationship().hasExpandedEndNode()) {

						var convey = true;

						if(node.isReferred()) {
							if(node.getReferredNode().getData().id() != node.incomingRelationship().getExpandedEndNode().id()) {
								convey = false;
							}
						}

						if(convey) {
							if(node.getPattern().usedAsCondition()) {
								returnValue = conveyorBelt(node, merge, pathExpansionDepth);
								if(returnValue != undefined) return returnValue;
							} else {
								conveyorBelt(node, merge, pathExpansionDepth);
							}
						}

					}
				}
			};

			var getMatchingRelationshipIds = function(node, nodeIdIndex, nodeId, pathExpansionDepth) {
				if(!pathExpansionDepth && node.outgoingRelationship().expandPath() && nodeIdIndex > 0) {
					node.outgoingRelationship().resetExpandedPath();
				}

				if(!node.isExpanded()) {
					// Start node in path expansion (if any)
					node.addMatchedNode(nodes[nodeId]);
					node.outgoingRelationship().setFromNode(nodes[nodeId]);
				}

				var toNode = null;

				if(node.outgoingRelationship().getNextObject().isReferred() &&
					!node.outgoingRelationship().hasVariablePathLength()) {
					toNode = node.outgoingRelationship().getNextObject().getReferredNode().getData();
				}
				
				node.outgoingRelationship().bindProperties();

				return relationshipMatch(
					node.outgoingRelationship(),
					nodes[nodeId],
					toNode
				);
			};

			var processMatchingRelationships = function(node, nodeId, merge, pathExpansionDepth, matchingRelationshipIds) {
				var returnValue;
				var relationship;
				for(var relationshipIdIdx=0; relationshipIdIdx<matchingRelationshipIds.length; relationshipIdIdx++) {
					relationship = relationships[[matchingRelationshipIds[relationshipIdIdx]]];

					if(node.outgoingRelationship().pathLengthSatisfied()) {
						
						node.outgoingRelationship().setExpandedEndNode(
							relationship.getToNode(nodeId)
						);

						node.outgoingRelationship().setMatchedRelationship(relationship);
						node.outgoingRelationship().addMatchedRelationship(
							relationship,
							{fromNodeId: nodeId, toNodeId: relationship.getToNode(nodeId).id()}
						);

						if(node.getPattern().usedAsCondition()) {
							returnValue = conveyorBelt(node, merge, pathExpansionDepth);
							if(returnValue != undefined) return returnValue;
						} else {
							conveyorBelt(node, merge, pathExpansionDepth);
						}

						node.outgoingRelationship().setExpandedEndNode(null);

					}

				}
			};

			var pathExpansion = function(node, nodeId, pathExpansionDepth, matchingRelationshipIds) {
				if(node.outgoingRelationship().expandPath()) {
					for(var relationshipIdIdx=0; relationshipIdIdx<matchingRelationshipIds.length; relationshipIdIdx++) {
						relationship = relationships[[matchingRelationshipIds[relationshipIdIdx]]];
	
						/*node.outgoingRelationship().addMatchedRelationship(
							relationship,
							{fromNodeId: nodeId, toNodeId: relationship.getToNode(nodeId).id()}
						);*/
	
						if(node.outgoingRelationship().visitedBefore(relationship.getToNode(nodeId).id())) {
							node.outgoingRelationship().backTrackExpandedPath();
							continue;
						}
	
						// Path expansion code
						if(node.outgoingRelationship().pathLengthSatisfied()) {
	
							node.setExpandedNode(
								relationship.getToNode(nodeId)
							);
							
							self.matchNode(
								node,
								false,
								(pathExpansionDepth || 0) + 1
							); // Path expansion is only allowed for match
	
							//node.outgoingRelationship().backTrackExpandedPath();
							node.setExpandedNode(
								null
							);
	
						}
	
						if(node.outgoingRelationship().expandPath() && !pathExpansionDepth) {
							node.outgoingRelationship().backTrackExpandedPath();
						}
	
					}
				}
			};

			this.matchNode = function(node, merge, pathExpansionDepth) {
				var returnValue;

				var nodeIdsForConveyorBelt =
					getMatchingNodeIds(node, merge);

				if(nodeIdsForConveyorBelt && nodeIdsForConveyorBelt.length) {
					for(var nodeIdIndex=0; nodeIdIndex<nodeIdsForConveyorBelt.length; nodeIdIndex++) {
						var nodeId = nodeIdsForConveyorBelt[nodeIdIndex];
						
						returnValue = processNodeWithoutRelationships(node, nodeId, merge, pathExpansionDepth);
						if(returnValue != undefined) return returnValue;
						returnValue = processNodeWithOutgoingRelationship(node, nodeIdIndex, nodeId, merge, pathExpansionDepth);
						if(returnValue != undefined) return returnValue;
						returnValue = processNodeWithIncomingRelationship(node, nodeId, merge, pathExpansionDepth);
						if(returnValue != undefined) return returnValue;
	
					}
				}

				if(node.getPattern().usedAsCondition()) {
					return false;
				}
				
			};
			
			this.getNodeById = function(id) {
				return nodes[id];
			};
			this.getRelationshipById = function(id) {
				return relationships[id];
			};
			
			this.addNode = function(node) {
				var n = new Node(this);
				n.setProperties(node.properties);
				n.setLabels(node.labels);
				addNode(n, node.id);
			};
			this.addRelationship = function(relationship) {
				var r = new Relationship(db);
				r.setFromNode(this.getNodeById(relationship.from));
				r.setToNode(this.getNodeById(relationship.to));
				r.setProperties(relationship.properties);
				r.setType(relationship.type);
				addRelationship(r, relationship.id);
			};

			this.addTable = function(table) {
				tables[table.name()] = table;
			};
			this.getTable = function(tableName) {
				if(!(tableName in tables)) {
					throw "Table \"" + tableName + "\" does not exist.";
				}
				return tables[tableName];
			};
		};
		
		function Node(_db) {
			
			var db = _db;
			var id;
			var labels = {};
			var propertyExpressions = {};
			var properties = {};

			var variableKey;
			var referredNode = null;
			var expandedNode = null;
			var me = this;
			
			var previousObject;
			var nextObject;

			var pattern;

			var expandedIsMatched = false;
			
			this.setPreviousObject = function(object) {
				previousObject = object;
			};
			this.getPreviousObject = function() {
				return previousObject;
			};
			this.setNextObject = function(object) {
				nextObject = object;
			};
			this.getNextObject = function() {
				return nextObject;
			};
			this.setPattern = function(_pattern) {
				pattern = _pattern;
			};
			this.getPattern = function() {
				return pattern;
			};
			this.nextNode = function() {
				if(me.getNextObject()) {
					if(me.getNextObject().isRelationship()) {
						return me.getNextObject().getNextObject();
					} else if(me.getNextObject().isNode()) {
						return me.getNextObject();
					}
				}
				return null;
			};
			this.previousNode = function() {
				if(me.getPreviousObject()) {
					if(me.getPreviousObject().isRelationship()) {
						return me.getPreviousObject().getPreviousObject();
					} else if(me.getPreviousObject().isNode()) {
						return me.getPreviousObject();
					}
				}
				return null;
			};
			this.incomingRelationship = function() {
				if(me.getPreviousObject()) {
					if(me.getPreviousObject().isRelationship()) {
						return me.getPreviousObject();
					}
				}
				return null;
			};
			this.outgoingRelationship = function() {
				if(me.getNextObject()) {
					if(me.getNextObject().isRelationship()) {
						return me.getNextObject();
					}
				}
				return null;
			};
			
			this.setId = function(_id) {
				id = _id;
			};
			this.id = function() {
				return id;
			};
			this.getId = this.id;
			this.setProperty = function(key, expression) {
				properties[key] = null;
				propertyExpressions[key] = expression.value;
			};
			this.setProperties = function(_properties) {
				for(var key in _properties) {
					properties[key] = _properties[key];
				}
			};
			this.bindProperty = function(key) {
				properties[key] = propertyExpressions[key]();
			};
			this.bindProperties = function() {
				for(var key in properties) {
					this.bindProperty(key);
				}
			};
			this.setLabel = function(labelName, nodeId) {
				labels[labelName] = true;
				db._addLabelNodeIdLookup(labelName, nodeId);
			};
			this.hasLabel = function(labelName) {
				return labels[labelName];
			};
			this.setLabels = function(_labels) {
				for(var label in _labels) {
					labels[label] = _labels[label];
				}
			};
			this.setVariableKey = function(_variableKey) {
				variableKey = _variableKey;
			};
			this.getVariableKey = function() {
				return variableKey;
			};
			this.hasVariableKey = function() {
				return variableKey != undefined;
			};
			this.getProperties = function() {
				return Object.create(properties);
			};
			this.getRawProperties = function() {
				return properties;
			};
			this.labels = function() {
				return labels;
			};
			this.getLabels = function() {
				return Object.keys(labels);
			};
			this.hasLabels = function() {
				return Object.keys(labels).length > 0;
			};
			this.hasProperties = function() {
				return Object.keys(properties).length > 0;
			};

			var NodeInstance = function(nodeInstance) {
				var self = this;
				for(var key in nodeInstance) {
					this[key] = nodeInstance[key];
				}
				this.getId = function() {
					return self.id;
				};
				this.getData = function() {
					return self;
				};
				this.getObject = function() {
					return self;
				};
				this.groupByKey = function() {
					return self.id;
				};
				this.groupByValue = function() {
					return self;
				};
			};
			this.get = function(asKey) {
				if(asKey) {
					return id;
				}
				/*return new NodeInstance({
					id: id,
					labels: this.getLabels(),
					properties: properties,
					getProperty: function() { return properties[key]; }
				});*/
				return new NodeReference(db, id);
			};
			this.toObject = function() {
				return new NodeInstance({
					id: id,
					labels: this.getLabels(),
					properties: addAssociativeArrayFunctions(properties),
					getProperty: function() { return properties[key]; },
					getProperties: function() { return this.properties; },
					getLabels: function() { return this.labels; },
					getKeys: function() {
						return this.properties.getKeys();
					}
				});
			};
			this.toString = function() {
				return JSON.stringify(this.get());
			};
			this.type = function() {
				return this.constructor.name;
			};
			
			this.isRelationship = function() {
				return false;
			};
			this.isNode = function() {
				return true;
			};
			this.setReferredNode = function(_referredNode) {
				referredNode = _referredNode;
			};
			this.isReferred = function() {
				return referredNode != null;
			};
			this.getReferredNode = function() {
				return referredNode;
			};

			this.setExpandedIsMatched = function() {
				expandedIsMatched = true;
			};
			this.expandedIsMatched = function() {
				if(expandedIsMatched) {
					expandedIsMatched = false;
					return true;
				}
				return false;
			};
			this.setExpandedNode = function(_expandedNode) {
				expandedNode = _expandedNode;
			};
			this.isExpanded = function() {
				return expandedNode != null;
			};
			this.getExpandedNode = function() {
				return expandedNode;
			};
			
			this.nextAction = function() {
				;
			};
			this.setNextAction = function(f) {
				this.nextAction = f;
			};
			this.convey = function(merge, pathExpansionDepth) {
				return db.matchNode(
					me,
					merge,
					// match: merge == false
					// merge: merge == true
					pathExpansionDepth
				);
			};
			this.create = function() {
				return db.createNode(me);
			};
			this.merge = function() {
				return db.mergeNode(me);
			};
			this.match = function() {
				return db.matchNodes(me);
			};
			
			var matchedNode;
			var matchedIncomingRelationshipIds = {};
			
			this.addMatchedNode = function(node) {
				matchedNode = node.id();
			};
			this.getMatchedNode = function() {
				return this.getData();
			};
			this.addMatchedIncomingRelationshipId = function(nodeId, matchedIncomingRelationshipId) {
				if(!matchedIncomingRelationshipIds[nodeId]) {
					matchedIncomingRelationshipIds[nodeId] = [];
				}
				matchedIncomingRelationshipIds[nodeId].push(matchedIncomingRelationshipId);
			};
			this.getMatchedIncomingRelationshipIds = function(nodeId) {
				if(!matchedIncomingRelationshipIds[nodeId]) {
					return null;
				}
				var _matchedIncomingRelationshipIds = matchedIncomingRelationshipIds[nodeId];
				matchedIncomingRelationshipIds[nodeId] = [];
				return _matchedIncomingRelationshipIds;
			};
			
			this.getData = function() {
				return db.getNodeById(matchedNode);
			};
			this.getLocalProperty = function(key) {
				return properties[key] || null;
			};
			this.getProperty = function(key) {
				if(!db.getNodeById(matchedNode)) return null;
				return db.getNodeById(matchedNode).getLocalProperty(key);
			};
			this.groupByKey = function() {
				return this.getData().id();
			};
			this.groupByValue = function() {
				return this.getData().get();
			};
			
			this.copy = function() {
				var n = new Node(db);
				n.setLabels(labels);
				n.setProperties(properties);
				return n;
			};

			this.mappable = function() {
				if(referredNode) {
					if(referredNode.mappable && !referredNode.mappable()) {
						return false;
					}
				}
				for(var propertyKey in properties) {
					if(!propertyExpressions[propertyKey].mappable()) {
						return false;
					}
				}
				return true;
			};
		};
		
		function Relationship(_db) {
			var db = _db;
			var id;
			var relationshipType;
			var properties = {};
			var propertyExpressions = {};
			var fromNode;
			var toNode;
			var leftDirection;
			var rightDirection;
			var variableKey;
			
			var previousObject;
			var nextObject;
			
			var isAdded = false;
			
			var hasVariablePathLength = false;
			var pathLengthFrom = 1;
			var pathLengthTo = 1;

			var pattern;

			var referredRelationship = null;
			
			this.setPreviousObject = function(object) {
				previousObject = object;
			};
			this.getPreviousObject = function() {
				return previousObject;
			};
			this.setNextObject = function(object) {
				nextObject = object;
			};
			this.getNextObject = function() {
				return nextObject;
			};
			this.setPattern = function(_pattern) {
				pattern = _pattern;
			};
			this.getPattern = function() {
				return pattern;
			};
			
			this.setId = function(_id) {
				id = _id;
			};
			this.id = function() {
				return id;
			};
			this.setStoredType = function(_type) {
				relationshipType = _type;
			};
			this.setType = function(_type, relationshipId) {
				relationshipType = _type;
				//db._addTypeRelationshipIdLookup(relationshipType, relationshipId);
			};
			this.getType = function() {
				return relationshipType;
			};
			this.setProperty = function(key, expression) {
				properties[key] = null;
				propertyExpressions[key] = expression.value;
			};
			this.bindProperty = function(key) {
				properties[key] = propertyExpressions[key]();
			};
			this.bindProperties = function() {
				for(var key in properties) {
					this.bindProperty(key);
				}
			};
			this.setProperties = function(_properties) {
				for(var key in _properties) {
					properties[key] = _properties[key];
				}
			};
			this.getProperty = function(key) {
				return properties[key];
			};
			this.getProperties = function() {
				return properties;
			};
			this.getRelationshipProperties = function() {
				return properties;
			};
			this.setFromNode = function(node) {
				fromNode = node;
			};
			this.setToNode = function(node) {
				toNode = node;
			};
			this.getFromNode = function(fromNodeId) {
				if(fromNodeId != undefined) {
					if(fromNodeId != fromNode.id()) {
						return toNode;
					}
				}
				return fromNode;
			};
			this.getToNode = function(fromNodeId) {
				if(fromNodeId != undefined) {
					if(fromNodeId != fromNode.id()) {
						return fromNode;
					}
				}
				return toNode;
			};
			this.setLeftDirection = function(_leftDirection) {
				leftDirection = _leftDirection;
			};
			this.setRightDirection = function(_rightDirection) {
				rightDirection = _rightDirection;
			};
			this.leftDirection = function(fromNodeId) {
				if(fromNodeId != undefined) {
					if(fromNodeId != fromNode.id()) {
						return !leftDirection && rightDirection;
					}
				}
				return leftDirection && !rightDirection;
			};
			this.rightDirection = function(fromNodeId) {
				if(fromNodeId != undefined) {
					if(fromNodeId != fromNode.id()) {
						return !rightDirection && leftDirection;
					}
				}
				return rightDirection && !leftDirection;
			};
			this.uniDirectional = function() {
				return (rightDirection && leftDirection) || (!leftDirection && !rightDirection);
			};
			this.noDirection = function() {
				return !leftDirection && !rightDirection;
			};
			this.direction = function() {
				var l = this.leftDirection();
				var r = this.rightDirection();
				if(l && !r) {
					return "left";
				}
				if(!l && r) {
					return "right";
				}
				if(l && r) {
					return "both";
				}
				return "none";
			};
			this.type = function() {
				return this.constructor.name;
			};
			
			this.isRelationship = function() {
				return true;
			};
			this.isNode = function() {
				return false;
			};

			this.setReferredRelationship = function(_referredRelationship) {
				referredRelationship = _referredRelationship;
			};
			this.isReferred = function() {
				return referredRelationship != null;
			};
			this.getReferredRelationship = function() {
				return referredRelationship;
			};

			this.isAdded = function() {
				return isAdded;
			};
			this.setIsAdded = function() {
				isAdded = true;
			};
			this.setHasVariablePathLength = function() {
				hasVariablePathLength = true;
				pathLengthFrom = null;
				pathLengthTo = null;
			};
			this.hasVariablePathLength = function() {
				return hasVariablePathLength;
			};
			this.setPathLengthFrom = function(_pathLengthFrom) {
				pathLengthFrom = _pathLengthFrom;
			};
			this.pathLengthFrom = function() {
				return pathLengthFrom;
			};
			this.setPathLengthTo = function(_pathLengthTo) {
				pathLengthTo = _pathLengthTo;
			};
			this.pathLengthTo = function() {
				return pathLengthTo;
			};
			this.expandPath = function() {
				return hasVariablePathLength;
			};

			var RelationshipInstance = function(relationshipInstance) {
				for(var key in relationshipInstance) {
					this[key] = relationshipInstance[key];
				}
				this.getId = function() {
					return this.id;
				};
				this.getData = function() {
					return this;
				};
				this.getObject = function() {
					return this;
				};
				this.groupByKey = function() {
					return this.id;
				};
				this.groupByValue = function() {
					return this;
				};
			};		
			this.get = function() {
				return new RelationshipReference(db, id);
			};
			this.toObject = function() {
				return new RelationshipInstance({
					id: id,
					type: relationshipType,
					properties: addAssociativeArrayFunctions(properties),
					fromNode: (fromNode ? fromNode.get() : null),
					toNode: (toNode ? toNode.get() : null),
					direction: this.direction(),
					getProperty: function() { return properties[key]; },
					getProperties: function() { return properties; },
					getKeys: function() { return properties.getKeys(); },
					getType: function() { return relationshipType; }
				});
			};
			this.toString = function() {
				var direction = "none";
				if(this.leftDirection()) {
					direction = "left";
				} else if(this.rightDirection()) {
					direction = "right";
				}
				return "id: " + id +
					". type: " + relationshipType +
					". properties: " + JSON.stringify(properties) +
					". fromNodeId: " + (fromNode ? fromNode.id() : null) +
					". toNodeId: " + (toNode ? toNode.id() : null) +
					". direction: " + direction;
			};
			this.value = function() {
				return this.get();
			};
			this.setVariableKey = function(_variableKey) {
				variableKey = _variableKey;
			};
			this.getVariableKey = function() {
				return variableKey;
			};
			this.hasVariableKey = function() {
				return variableKey != undefined;
			};
			this.nextAction = function() {
				;
			};
			this.setNextAction = function(f) {
				this.nextAction = f;
			};
			
			var matchedRelationship;

			var expandedPath = [];
			var pathList = [];
			var visitedNodes = {};
			
			var matchingRelationshipsIds;
			var expandedEndNode = null;
			
			var updateVisitedNodes = function(nodeId) {
				visitedNodes[nodeId] = (visitedNodes[nodeId] || 0) + 1;
			};
			var updateVisitedRelationships = function(path) {
				if(expandedPath.length == 0) {
					updateVisitedNodes(path.fromNodeId);
				}
				updateVisitedNodes(path.toNodeId);
			};
			this.visitedBefore = function(nodeId) {
				if(expandedPath.length > 1) {
					if(expandedPath[expandedPath.length-1] == expandedPath[expandedPath.length-2]) {
						return true;
					}
				}
				return visitedNodes[nodeId] >= 2;
			};
			this.setMatchedRelationship = function(relationship) {
				matchedRelationship = relationship.id();
			};
			this.addMatchedRelationship = function(relationship, path) {
				if(hasVariablePathLength) {
					expandedPath.push(relationship.id());
					pathList.push(path);
					updateVisitedRelationships(path);
				} else if(!hasVariablePathLength) {
					this.setMatchedRelationship(relationship);
				}
			};
			this.getMatchedRelationship = function() {
				return this.getData();
			};
			this.hasExpandedEndNode = function() {
				return expandedEndNode != null;
			};
			this.setExpandedEndNode = function(_expandedEndNode) {
				expandedEndNode = _expandedEndNode;
			};
			this.getExpandedEndNode = function() {
				return expandedEndNode;
			};
			this.setMatchingRelationshipIds = function(relationshipIds) {
				matchingRelationshipsIds = relationshipIds;
			};
			this.getMatchingRelationshipIds = function() {
				var matchingRelationshipsIdsToReturn = null;
				if(matchingRelationshipsIds) {
					matchingRelationshipsIdsToReturn =
						matchingRelationshipsIds.slice();
				}
				matchingRelationshipsIds = null;
				return matchingRelationshipsIdsToReturn;
			};
			this.expandedPathLastItem = function() {
				return expandedPath[expandedPath.length-1];
			};
			this.backTrackExpandedPath = function() {
				if(expandedPath.length == 0) {
					return;
				}
				expandedPath.pop();
				var path = pathList.pop();
				if(expandedPath.length == 0) {
					visitedNodes = {};
				} else {
					visitedNodes[path.toNodeId]--;
				}
			};
			this.resetExpandedPath = function() {
				expandedPath = [];
				pathList = [];
				visitedNodes = {};
			};
			this.pathLengthFromSatisfied = function() {
				return !this.expandPath() || (pathLengthFrom == null) || (pathLengthFrom && expandedPath.length >= pathLengthFrom);
			};
			this.pathLengthToSatisfied = function() {
				return !this.expandPath() || (pathLengthTo == null) || (pathLengthTo && expandedPath.length <= pathLengthTo);
			};
			this.pathLengthSatisfied = function() {
				return this.pathLengthFromSatisfied() && this.pathLengthToSatisfied();
			};

			this.getExpandedPath = function() {
				return expandedPath;
			};

			this.setShortestPath = function(shortestPath) {
				expandedPath = shortestPath;
			};
			
			this.getData = function() {
				if(hasVariablePathLength) {
					//return new List(expandedPath.toArray());
					return new List(
						expandedPath,
						(function(relationshipId) {
							return db.getRelationshipById(relationshipId).value();
						})
					);
				}
				return db.getRelationshipById(matchedRelationship);
			};
			this.getLocalProperty = function(key) {
				return properties[key] || null;
			};
			this.getProperty = function(key) {
				if(!db.getRelationshipById(matchedRelationship)) return null;
				return db.getRelationshipById(matchedRelationship).getLocalProperty(key);
			};
			this.groupByKey = function() {
				return this.getData().id();
			};
			this.groupByValue = function() {
				return this.getData().get();
			};
			
			this.copy = function() {
				var r = new Relationship(db);
				r.setType(relationshipType);
				r.setProperties(properties);
				r.setLeftDirection(leftDirection);
				r.setRightDirection(rightDirection);
				r.setFromNode(fromNode);
				r.setToNode(toNode);
				return r;
			};
			
			this.mappable = function() {
				if(referredRelationship) {
					if(referredRelationship.mappable && !referredRelationship.mappable()) {
						return false;
					}
				}
				for(var propertyKey in properties) {
					if(!propertyExpressions[propertyKey].mappable()) {
						return false;
					}
				}
				return true;
			};

		};
		
		function Pattern() {
			var objects = [];
			var nodes = [];
			var relationships = [];
			var me = this;

			var usedAsCondition = false;
			var findShortestPath = false;
			var shortestPathLength = Number.MAX_SAFE_INTEGER;
			var shortestPath;
			
			var addObject = function(object) {
				if(!me.empty()) {
					me.lastObject().setNextObject(object);
					object.setPreviousObject(me.lastObject());
				}
				object.setPattern(me);
				objects.push(object);
			};
			var processShortestPath = function() {
				if(relationships[0].getExpandedPath().length < shortestPathLength) {
					shortestPathLength = relationships[0].getExpandedPath().length;
					shortestPath = relationships[0].getExpandedPath().slice();
				}
			};
			this.shortestpath = function() {
				findShortestPath = true;
			};
			this.addNode = function(node) {
				nodes.push(node);
				addObject(node);
			};
			this.addRelationship = function(relationship) {
				relationships.push(relationship);
				addObject(relationship);
			};

			this.nodeCount = function() {
				return this.nodes.length;
			};
			this.relationshipCount = function() {
				return this.relationships.length;
			};
			
			this.getData = function() {
				var d = [], r, relationshipList;
				var groupByKey = [];
				for(var i=0; i<relationships.length; i++) {
					if(!relationships[i].hasVariablePathLength()) {
						r = relationships[i].getData().value().getRelationship();
						d.push(
							r.getFromNode().get(),
							r.get(),
							r.getToNode().get()
						);
						groupByKey.push(r.id());
					} else if(relationships[i].hasVariablePathLength()) {
						relationshipList = relationships[i].getData().value();
						for(var j=0; j<relationshipList.length; j++) {
							r = relationshipList[j].getRelationship();
							d.push(
								r.getFromNode().get(),
								r.get(),
								r.getToNode().get()
							);
							groupByKey.push(r.id());
						}
					}
				}
				d = addArrayFunctions(d);
				d.getNodes = function() {
					var nodes = [];
					for(var i=0; i<d.length; i+=3) {
						if(i==0) {
							nodes.push(d[i]);
						}
						nodes.push(d[i+2]);
					}
					return addArrayFunctions(nodes);
				};
				d.getRelationships = function() {
					var relationships = [];
					for(var i=0; i<d.length; i+=3) {
						relationships.push(d[i+1]);
					}
					return addArrayFunctions(relationships);
				};
				this.groupByKey = function() { return groupByKey; };
				this.groupByValue = function() { return d; };
				return d;
			};
			this.objects = function() {
				return objects;
			};
			this.getObject = function(index) {
				return objects[index];
			};
			this.lastObject = function() {
				return objects[objects.length-1];
			};
			this.getLast = this.lastObject;
			this.empty = function() {
				return objects.length == 0;
			};
			this.setNextAction = function(f) {
				nextAction = f;
			};
			var nextAction = function() {
				;
			};
			this.finish = function() {
				if(findShortestPath) {
					relationships[0].setShortestPath(shortestPath);
					nextAction();
				}
			};
			var initialiseConveyorBelt = function() {
				me.lastObject().setNextAction(
					function() {
						if(!findShortestPath) {
							nextAction();
						} else if(findShortestPath) {
							processShortestPath();
						}
					}
				);
			};
			this.useAsCondition = function() {
				usedAsCondition = true;
				me.lastObject().setNextAction(
					function() {
						return true;
					}
				);
			};
			this.usedAsCondition = function() {
				return usedAsCondition;
			};
			this.value = function() {
				return nodes[0].convey(false);
			};
			this.match = function() {
				initialiseConveyorBelt();
				nodes[0].convey(false); // match: merge == false
			};
			this.merge = function() {
				initialiseConveyorBelt();
				nodes[0].convey(true); // merge: merge == true
			};
			this.create = function() {
				initialiseConveyorBelt();
				nodes[0].create();
			};

			this.mappable = function() {
				for(var i=0; i<objects.length; i++) {
					if(!objects[i].mappable()) {
						return false;
					}
				}
				return true;
			}
		};

		function AssociativeArray() {
			var associativeArray = {};
			var boundAssociativeArray = {};
			var keys = [];
			var me = this;
			var bind = function() {
				for(var key in associativeArray) {
					boundAssociativeArray[key] =
						associativeArray[key].value();
				}
			};
			this.addEntry = function(key, element) {
				if(key in associativeArray) {
					throw "Key \"" + key + "\" already exists in associative array.";
				}
				associativeArray[key] = element;
				boundAssociativeArray[key] = null;
				keys.push(key);
			};
			this.get = function(_addAssociativeArrayFunctions = true) {
				bind();
				var boundAssociativeArrayCopy = {};
				for(var key in boundAssociativeArray) {
					boundAssociativeArrayCopy[key] = boundAssociativeArray[key];
						//JSON.parse(JSON.stringify(boundAssociativeArray[key]));
					if(boundAssociativeArrayCopy[key]) {
						boundAssociativeArrayCopy[key].constructor =
							boundAssociativeArray[key].constructor;
					}
				}
				if(_addAssociativeArrayFunctions) {
					return addAssociativeArrayFunctions(
						boundAssociativeArrayCopy
					);
				}
				return boundAssociativeArray;
			};
			this.getProperty = function(key) {
				bind();
				return boundAssociativeArray[key];
			};
			this.getProperties = function() {
				return Object.keys(associativeArray);
			};
			this.getValues = function() {
				return Object.values(associativeArray);
			};
			this.setValue = function(index, element) {
				associativeArray[keys[index]] = element;
			};
			this.next = function() {
				return false;
			};
			this.hasNext = function() {
				return true;
			};
			this.reset = function() {
				;
			};
			this.getData = function() {
				return me;
			};
			this.getObject = function() {
				return me;
			};
			this.value = function(_addAssociativeArrayFunctions = true) {
				return me.get(_addAssociativeArrayFunctions);
			};
			this.type = function() {
				return me.constructor.name;
			};
			this.toString = function() {
				bind();
				return JSON.stringify(boundAssociativeArray);
			};
			this.groupByKey = function() {
				return me.toString();
			};
			this.groupByValue = function() {
				return me.get();
			};
		};
		
		function List(list, bindFunction) {
			var list = (list && (list.constructor == Array) && list) || [];
			var boundList = addArrayFunctions([]);
			var me = this;
			var bind = function() {
				if(!bindFunction) {
					for(var i=0; i<list.length; i++) {
						boundList[i] = list[i].value();
					}
				} else if(bindFunction) {
					for(var i=0; i<list.length; i++) {
						boundList[i] = bindFunction(list[i]);
					}
				}
			};
			this.add = function(expression) {
				if(!expression) {
					return;
				}
				list.push(expression);
				boundList.push(null);
			};
			this.get = function() {
				bind();
				var boundListCopy = new Array(boundList.length);
				for(var i=0; i<boundList.length; i++) {
					if(boundList[i].constructor == NodeReference ||
						boundList[i].constructor == RelationshipReference) {
						boundListCopy[i] = boundList[i];
						continue;
					}
					//boundListCopy[i] = JSON.parse(JSON.stringify(boundList[i]));
					boundListCopy[i] = boundList[i];
					boundListCopy[i].constructor = boundList[i].constructor;
					for(var key in boundList[i]) {
						if(boundListCopy[i][key]) {
							boundListCopy[i][key].constructor =
								boundList[i][key].constructor;
						}
					}
				}
				return addArrayFunctions(boundListCopy);
			};
			this.setElement = function(elementIndex, element) {
				list[elementIndex] = element;
			};
			this.getElements = function() {
				return list;
			};
			this.next = function() {
				return false;
			};
			this.hasNext = function() {
				return true;
			};
			this.reset = function() {
				;
			};
			this.getData = function() {
				return me;
			};
			this.value = function() {
				return me.get();
			};
			this.type = function() {
				return me.constructor.name;
			};
			this.groupByKey = function() {
				return me.get();
			};
			this.groupByValue = function() {
				return me.get();
			};
		};

		function Case() {
			var me = this;
			var whens = [];
			var thens = [];
			var _else;
			this.when = function(expression) {
				whens.push(expression);
			};
			this.whenCount = function() {
				return whens.length;
			};
			this.then = function(expression) {
				thens.push(expression);
			};
			this.else = function(expression) {
				_else = expression;
			};
			this.get = function() {
				return this.value();
			};
			this.next = function() {
				return false;
			};
			this.hasNext = function() {
				return true;
			};
			this.reset = function() {
				;
			};
			this.getData = function() {
				return me;
			};
			this.value = function() {
				for(var i=0; i<whens.length; i++) {
					if(whens[i].value()) {
						return thens[i].value();
					}
				}
				return _else.value();
			};
			this.type = function() {
				return me.constructor.name;
			};
			this.groupByKey = function() {
				return me.get();
			};
			this.groupByValue = function() {
				return me.get();
			};
		};

		function Predicate() {
			var me = this;
			var predicateFunctionName = null;
			var _variable = null;
			var list = null;
			var where = null;
			this.setPredicateFunctionName = function(_predicateFunctionName) {
				predicateFunctionName = _predicateFunctionName;
			};
			this.variable = function(_variableName) {
				_variable = new Variable(null, _variableName);
			};
			this.list = function(_list) {
				list = _list;
			};
			this.where = function(_where) {
				where = _where;
				if("setLocalVariable" in where && _variable) {
					where.setLocalVariable(_variable.getObjectKey(), _variable);
				}
			};
			this.get = function() {
				return this.value();
			};
			this.next = function() {
				return false;
			};
			this.hasNext = function() {
				return true;
			};
			this.reset = function() {
				;
			};
			this.getData = function() {
				return me;
			};
			this.value = function() {
				var _list = list.value();
				if(_list.constructor != Array) {
					throw "Predicate list must be an array.";
				}
				var trues = 0;
				for(var i=0; i<_list.length; i++) {
					_variable.setOverriddenValue(_list[i]);
					if(where.value()) {
						trues++;
					}
				}
				if(predicateFunctionName == "all") {
					return trues == _list.length;
				} else if(predicateFunctionName == "any") {
					return trues > 0;
				} else if(predicateFunctionName == "sum") {
					return trues;
				}
				return false;
			};
			this.type = function() {
				return me.constructor.name;
			};
			this.groupByKey = function() {
				return me.get();
			};
			this.groupByValue = function() {
				return me.get();
			};
		};

		function FString() {
			var parts = [];
			this.string = function(_string) {
				parts.push(_string);
			};
			this.expression = function(expression) {
				parts.push(expression);
			};
			this.get = function() {
				return this.value();
			};
			this.next = function() {
				return false;
			};
			this.hasNext = function() {
				return true;
			};
			this.reset = function() {
				;
			};
			this.getData = function() {
				return me;
			};
			this.value = function() {
				var combined = '';
				for(var i=0; i<parts.length; i++) {
					if(parts[i].value) {
						combined += parts[i].value();
					} else {
						combined += parts[i];
					}
				}
				return combined;
			};
			this.type = function() {
				return me.constructor.name;
			};
			this.groupByKey = function() {
				return me.get();
			};
			this.groupByValue = function() {
				return me.get();
			};
		};
		
		function Constant(_value) {
			var value = _value;
			this.get = function() {
				return value;
			};
			this.next = function() {
				return false;
			};
			this.hasNext = function() {
				return true;
			};
			this.reset = function() {
				;
			};
			this.getData = function() {
				return this;
			};
			this.getObject = function() {
				return value;
			};
			this.value = function() {
				return value;
			};
			this.id = function() {
				return value.id;
			};
			this.setValue = function(_value) {
				value = _value;
			};
			this.type = function() {
				return this.constructor.name;
			};
			this.groupByKey = function() {
				return value;
			};
			this.groupByValue = function() {
				return value;
			};
		};

		function Table(_db, _tableName) {
			var me = this;
			var db = _db;
			var tableName = _tableName;
			var tableColumns = {};

			this.addColumn = function(columnName) {
				tableColumns[columnName] = new TableColumn(this, columnName);
				return tableColumns[columnName];
			};
			this.addValue = function(columnName, value) {
				tableColumns[columnName].addValue(value);
			};
			this.getColumn = function(columnName) {
				return tableColumns[columnName];
			};
			this.name = function() {
				return tableName;
			};

			init: {
				db.addTable(me);
			};
		};

		function TableColumn(_table, _columnName) {
			var table = _table;
			var columnName = _columnName;
			var runLengths = [];
			var values = [];
			var valueIndex = 0;
			var runLengthIndex = 0;
			this.addValue = function(value) {
				if(values.length > 0) {
					if(values[values.length-1] == value) {
						runLengths[runLengths.length-1]++;
					} else if(values[values.length-1] != value) {
						values.push(value);
						runLengths.push(1);
					}
				} else if(values.length == 0) {
					values.push(value);
					runLengths.push(1);
				}
			};
			this.value = function() {
				if(runLengthIndex > runLengths[valueIndex]) {
					runLengthIndex = 0;
					valueIndex++;
				}
				runLengthIndex++;
				return values[valueIndex];
			}
			this.reset = function() {
				valueIndex = 0;
				runLengthIndex = 0;
			};
			this.name = function() {
				return columnName;
			};
		}
	};
	
	Network: {

		function XMLHttpRequestFactory() {
			try {
				// Web browser
				return new XMLHttpRequest();
			} catch(e) {
				;
			}
			// Node.js below
			return new (function() {
		
				// readyStates
				this.UNSENT = 0;
				this.OPENED = 1;
				this.HEADERS_RECEIVED = 2;
				this.LOADING = 3;
				this.DONE = 4;
				
				this.readyState = this.UNSENT;
				this.status = null;
				this.responseText = null;
				this.response = null;
				this.responseType = null;
				
				this.method = null;
				this.url = null;
				this.async = true;

				this.headers = {};
				
				this.onreadystatechange = function() {};
				this.onload = function() {};

				this.setRequestHeader = function(header, value) {
					this.headers[header] = value;
				};
				
				this.open = function(method, url, async) {
					
					this.method = method.toUpperCase();
					this.url = url;
					this.async = async;
					
					this.readyState = this.OPENED;
					
				}
				
				this.send = function(payload) {
					var response = null;
					
					var http = null;
					var urlLib = null;
					var ssl_url = (this.url.indexOf("https") == 0 ? true : false);
					
					try {
						http = (ssl_url ? require('https') : require('http'));
						urlLib = require('url');
					} catch(e) {
						;
					}

					var me = this;

					var processResponse = function(resp) {
						var data = '';

						// A chunk of data has been recieved.
						resp.on('data', function(chunk) {
							data += chunk;
						});

						// The whole response has been received. Print out the result.
						resp.on('end', function() {
							me.responseText = data;
							me.response = data;
								
							me.readyState = me.DONE;
							if(resp.statusCode >= 200 && resp.statusCode < 300) {
								me.status = 200;
								me.onreadystatechange();
								me.onload();
							} else {
								me.status = resp.statusCode;
								me.onreadystatechange();
								me.onload();
							}
						});

					};

					var handleError = function(err) {
						console.log("Error: " + err);
						me.status = 0;
						me.onreadystatechange();
					};

					var parsedUrl = new urlLib.URL(this.url);
					var options = {
						hostname: parsedUrl.hostname,
						port: (parsedUrl.port ? parsedUrl.port : (ssl_url ? 443 : 80)),
						path: parsedUrl.pathname + parsedUrl.search,
					};
					if(this.headers) {
						options["headers"] = this.headers;
					}
					if(me.method == "GET") {
						http.get(options, processResponse).on("error", handleError);
						this.onload(this);
					} else if(me.method == "POST") {
						http.post(options, payload, processResponse).on("error", handleError);
						this.onload(this);
					}
					
				}
			
			});
		}

		function HTTP() {
			var processResponse = function(xhr, successCallback, errorCallback) {
				if(xhr.readyState == 4) {
					if(xhr.status == 200) {
						successCallback(xhr.responseText);
					} else if(xhr.status != 200) {
						errorCallback(xhr.status + ": " + xhr.responseText);
					}
				}
			};
			this.get = function(url, successCallback, errorCallback, headers) {
				var xhr = XMLHttpRequestFactory();
				xhr.onreadystatechange = function() {
					processResponse(xhr, successCallback, errorCallback);
				};
				
				try {
					xhr.open("GET", url, true);
					if(headers) {
						for(var key in headers) {
							xhr.setRequestHeader(key, headers[key]);
						}
					}
					xhr.send();
				} catch(e) {
					errorCallback(e);
				}
			};
			this.post = function(url, payload, successCallback, errorCallback, headers) {
				var xhr = XMLHttpRequestFactory();
				xhr.onreadystatechange = function() {
					processResponse(xhr, successCallback, errorCallback);
				};
				
				try {
					xhr.open("POST", url, true);
					if(headers) {
						for(var key in headers) {
							xhr.setRequestHeader(key, headers[key]);
						}
					}
					if(payload.constructor == Object) {
						var encoded = new TextEncoder().encode(JSON.stringify(payload));
						xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
						xhr.setRequestHeader("Content-Length", encoded.length);
						xhr.send(encoded);
					} else {
						xhr.send(payload);
					}
				} catch(e) {
					errorCallback(e);
				}
			};
		};
		var http = new HTTP();
	};
	
	Query: {
		function Expression(_root, _alias, _aggregationFunctions, _context, _variableReferences, _non_deterministic) {
			var root = _root;
			var alias = (root.element ? (root.element().getKey ? root.element().getKey() : _alias) : _alias);
			var aggregationFunctions = _aggregationFunctions;
			var context = _context;
			var variableReferences = _variableReferences;
			var childrenHasVariableReferences = false;
			var localVariables = {};
			var me = this;
			
			if(aggregationFunctions) {
				context.addReduceExpression(this);
				for(var i=0; i<aggregationFunctions.length; i++) {
					aggregationFunctions[i].setGroupBy(
						context.getGroupBy()
					);
					aggregationFunctions[i].setReducer(
						context.getGroupBy().addReducer()
					);
					aggregationFunctions[i].initialize();
				}
			}

			var _childrenHasVariableReferences = function(children) {
				if(!children) {
					return false;
				}
				for(var i=0; i<children.length; i++) {
					if(children[i].element().hasReferredVariables && children[i].element().hasReferredVariables()) {
						return true;
					} else {
						return _childrenHasVariableReferences(children[i].p);	
					}
				}
				return false;
			};
			childrenHasVariableReferences = _childrenHasVariableReferences(root.p);

			this.root = function() {
				return root;
			};
			this.rootObject = function() {
				if(root.element().getObject) {
					return root.element().getObject();
				}
				return root.element();
			};
			this.value = function() {
				return root.value();
			};
			this.getData = function() {
				return this.value();
			};
			this.getAlias = function() {
				return alias;
			};
			this.variableReferences = function() {
				return variableReferences;
			};
			this.hasReferredVariables = function() {
				return (variableReferences && (variableReferences.length > 0)) || childrenHasVariableReferences;
			};
			this.setAlias = function(alias) {
				alias = alias;
			};
			this.hasKey = function() {
				return root.hasKey && root.hasKey();
			};
			this.isReduceExpression = function() {
				return (aggregationFunctions != undefined);
			};
			this.aggregate = function() {
				if(aggregationFunctions) {
					for(var i=0; i<aggregationFunctions.length; i++) {
						aggregationFunctions[i].aggregate();
					}
					return;
				}
				context.getGroupBy().map(root);
			};
			this.hasAggregateFunctions = function() {
				return aggregationFunctions != undefined;
			};
			this.isArray = function() {
				return root.element().constructor == List;
			};
			this.isAssociativeArray = function() {
				return root.element().constructor == AssociativeArray;
			};
			this.getAggregateFunctions = function() {
				return aggregationFunctions;
			};
			this.type = function() {
				return this.constructor.name;
			};

			if(root.element().constructor == List) {
				var me = this;
				var elements = root.element().getElements();
				for(var i=0; i<elements.length; i++) {
					if(elements[i].hasAggregateFunctions) {
						me.hasAggregateFunctions = function() {
							return true;
						}
					}
					return;
				}
			}

			root.non_deterministic = function() {
				return _non_deterministic;
			};

			this.mappable = function() {
				return root.mappable();
			};

			this.setLocalVariable = function(key, value) {
				localVariables[key] = value;
			};

			this.getLocalVariable = function(key) {
				return localVariables[key];
			};

		};
		function Variable(_object, key) {
			var object = _object;
			var objectKey = key;
			var overriddenValue = null;
			this.getObjectKey = function() {
				return objectKey;
			};
			this.getObject = function() {
				if(overriddenValue) {
					return overriddenValue;
				}
				if(object.constructor == Constant) {
					return object.getObject();
				}
				return object;
			};
			this.value = function(asKey) {
				if(overriddenValue) {
					return overriddenValue;
				}
				try {
					return object.getData().get(asKey);
				} catch(e) {
					;
				}
				return null;
			};
			this.setOverriddenValue = function(_overriddenValue) {
				overriddenValue = _overriddenValue;
			};
		};
		function Statement(_engine) {
			var engine = _engine;
			var operations = [];
			var variables = {};
			var lastVariable;
			var lastPropertyKey;
			var output = [];
			var graph = {
				nodes: {},
				relationships: {}
			};
			var nodesAdded = 0;
			var relationshipsAdded = 0;
			var overriddenContextStack = [];
			var overriddenContext = undefined;

			this.addOperation = function(operation) {
				if(this.context() && this.context().type() == 'Return') {
					throw "There can only be one return statement and it must be last in the query.";
				}
				if(this.context()) {
					this.context().setNextOperation(operation);
				}
				operations.push(operation);
			};
			this.operations = function() {
				return operations;
			};
			this.context = function() {
				return overriddenContext || operations[operations.length-1];
			};
			this.setContext = function(context) {
				if(overriddenContext) {
					overriddenContextStack.push(overriddenContext);
				}
				overriddenContext = context;
			};
			this.resetContext = function() {
				overriddenContext = overriddenContextStack.pop();
			};
			this.addVariable = function(key, object) {
				lastVariable = new Variable(object, key);
				if(variables[key]) {
					throw "Variable `" + key + "` already declared.";
				}
				variables[key] = lastVariable;
			};
			this.debugVariables = function() {
				for(var key in variables) {
					console.log("Variable \"" + key + "\":");
					console.log(JSON.stringify(variables[key].value()));
				}
			};
			this.variables = function() {
				return Object.values(variables);
			};
			this.getVariable = function(key) {
				if(variables[key] == undefined) {
					try {
						if(window != undefined && key in window) {
							return {value: function() { return window[key]; }};
						}
					} catch(e) {
						;
					}
					throw "Variable `" + key + "` has not been declared.";
				}
				return variables[key];
			};
			this.hasVariable = function(key) {
				return variables[key] != undefined;
			};
			this.getLastVariable = function() {
				return lastVariable;
			};
			this.setPropertyKey = function(key) {
				lastPropertyKey = key;
			};
			this.getPropertyKey = function() {
				return lastPropertyKey;
			};
			this.clear = function() {
				operations = [];
				variables = {};
				variableList = [];
				lastVariable = undefined;
				lastPropertyKey = undefined;
				output = [];
				nodesAdded = 0;
				relationshipsAdded = 0;
				graph = {
					nodes: {},
					relationships: {}
				};
			};
			this.engine = function() {
				return engine;
			};
			this.results = function() {
				checkGraphConsistency();
				return {
					output: output,
					graph: {
						nodes: Object.values(graph.nodes),
						links: Object.values(graph.relationships)
					},
					stats: {
						nodesAdded: nodesAdded,
						relationshipsAdded: relationshipsAdded
					}
				};
			};
			this.addOutputRecord = function() {
				output.push({});
			};
			this.addOutputEntry = function(key, value, id) {
				var _key = key;
				if(output[output.length-1][_key] != undefined) {
					_key += id;
				}
				this.addOutputEntryToGraph(value);
				output[output.length-1][_key] = clean(value);
			};
			var checkGraphConsistency = function() {
				var rel, relIdsToDelete = [];
				for(var relationshipId in graph.relationships) {
					rel = graph.relationships[relationshipId];
					if(!graph.nodes[rel.source] || !graph.nodes[rel.target]) {
						relIdsToDelete.push(relationshipId);
					}
				}
				for(var i=0; i<relIdsToDelete.length; i++) {
					delete graph.relationships[relIdsToDelete[i]];
				}
			};
			this.addOutputEntryToGraph = function(entry) {
				if(entry && entry.constructor == NodeReference) { // Node
					if(graph.nodes[entry.id()] == undefined) {
						graph.nodes[entry.id()] = clean(entry);
					}
				} else if(entry && entry.constructor == RelationshipReference) { // Relationship
					if(graph.relationships[entry.id()] == undefined) {
						var e = entry.getObject().toObject()
						e.source = e.fromNode.id();
						e.target = e.toNode.id();
						graph.relationships[entry.id()] = clean(e);
					}
				} else if(entry && entry.constructor == Array) { // Array
					for(var i=0; i<entry.length; i++) {
						this.addOutputEntryToGraph(entry[i]);
					}
				}
			};
			this.setNodesAdded = function(value) {
				nodesAdded = value;
			};
			this.setRelationshipsAdded = function(value) {
				relationshipsAdded = value;
			};
			this.getNodesAdded = function() {
				return nodesAdded;
			};
			this.getRelationshipsAdded = function() {
				return relationshipsAdded;
			};
			this.setSuccessCallback = function(_successCallback) {
				successCallback = _successCallback;
			};
			this.success = function() {
				successCallback(this.results());
			};
		};
		function Where(_expression) {
			var expression = _expression;
			this.evaluate = function() {
				return expression.value() == true;
			};
		};
		function Inserter(_db, _tableName) {
			var db = _db;
			var tableName = _tableName;
			var tableColumns = [];

			var table = new Table(
				db,
				tableName
			);

			var previousOperation;
			var nextOperation;

			this.setPreviousOperation = function(_previousOperation) {
				previousOperation = _previousOperation;
				var variable;
				for(var i=0; i<previousOperation.variables().length; i++) {
					variable = previousOperation.variables()[i];
					tableColumns.push(
						table.addColumn(variable.getObjectKey())
					);
				}
			};
			this.setNextOperation = function(_nextOperation) {
				nextOperation = _nextOperation;
				nextOperation.setPreviousOperation(this);
			};
			this.variables = function() {
				return previousOperation.variables();
			};

			this.doIt = function() {
				var variable;
				for(var i=0; i<previousOperation.variables().length; i++) {
					variable = previousOperation.variables()[i];
					tableColumns[i].addValue(
						tableColumns[i].name(),
						variable.value()
					);
				}
				if(nextOperation) {
					nextOperation.doIt();
				}
			};
			this.finish = function() {
				if(nextOperation) {
					nextOperation.finish();
				}
			};
			this.run = function() {
				throw "Into-operation cannot be first in statement.";
			};
			this.type = function() {
				return this.constructor.name;
			};
		};
		function Setter() {
			var setters;

			var previousOperation;
			var nextOperation;

			function SetterEntry(_variable, _propertyKey, _expression) {
				var variable = _variable;
				var propertyKey = _propertyKey;
				var expression = _expression;
				
				this.set = function() {
					var o = variable.getObject();
					var assignee;

					if(o.constructor == Unwind) {
						o = o.value();		
					}

					if(o.constructor == NodeReference) {
						assignee = o.getObject();
					} else if(o.constructor == Node) {
						assignee = o.getData();
					} else if(o.constructor == RelationshipReference) {
						assignee = o.getObject();
					} else if(o.constructor == Relationship) {
						assignee = o.getData();	
					} else {
						throw "Cannot assign to object of type \"" + o.constructor.name + "\".";
					}
					try {
						assignee.setProperty(
							propertyKey,
							expression
						);
						assignee.bindProperty(propertyKey);
					} catch(e) {
						;
					}
				}
			};
			function MapSetterEntry(_variable, _mapExpression) {
				var variable = _variable;
				var mapExpression = _mapExpression;
				
				this.set = function() {
					var o = variable.getObject();
					var assignee;

					if(o.constructor == Unwind) {
						o = o.value();		
					}

					if(o.constructor == NodeReference || o.constructor == RelationshipReference) {
						assignee = o.getObject();
					} else if(o.constructor == Node || o.constructor == Relationship) {
						assignee = o.getData();
					} else {
						throw "Cannot assign to object of type \"" + o.constructor.name + "\".";
					}
					assignee.setProperties(
						mapExpression.value()
					);
				}
			};
			function LabelSetterEntry(_variable, _labelExpression) {
				var variable = _variable;
				var labelExpression = _labelExpression;
				
				this.set = function() {
					var o = variable.getObject();
					var assignee;

					if(o.constructor == Unwind) {
						o = o.value();		
					}

					if(o.constructor == NodeReference) {
						assignee = o.getObject();
					} else if(o.constructor == Node) {
						assignee = o.getData();
					} else {
						throw "Cannot assign to object of type \"" + o.constructor.name + "\".";
					}
					assignee.setLabel(
						labelExpression.value(),
						assignee.getId()
					);
				}
			};
			function TypeSetterEntry(_variable, _typeExpression) {
				var variable = _variable;
				var typeExpression = _typeExpression;
				
				this.set = function() {
					var o = variable.getObject();
					var assignee;

					if(o.constructor == Unwind) {
						o = o.value();		
					}

					if(o.constructor == RelationshipReference) {
						assignee = o.getObject();
					} else if(o.constructor == Relationship) {
						assignee = o.getData();
					} else {
						throw "Cannot assign to object of type \"" + o.constructor.name + "\".";
					}
					try {
						assignee.setType(
							typeExpression.value(),
							assignee.id()
						);
					} catch(e) {
						;
					}
				}
			};

			this.addSetter = function(variable, propertyKey, expression) {
				if(!setters) {
					setters = [];
				}
				setters.push(
					new SetterEntry(variable, propertyKey, expression)
				);
			};
			this.addLabelSetter = function(variable, labelExpression) {
				if(!setters) {
					setters = [];
				}
				setters.push(
					new LabelSetterEntry(variable, labelExpression)
				);
			};
			this.addMapSetter = function(variable, mapExpression) {
				if(!setters) {
					setters = [];
				}
				setters.push(
					new MapSetterEntry(variable, mapExpression)
				);
			};
			this.addTypeSetter = function(variable, typeExpression) {
				if(!setters) {
					setters = [];
				}
				setters.push(
					new TypeSetterEntry(variable, typeExpression)
				);
			};
			this.setPreviousOperation = function(_previousOperation) {
				previousOperation = _previousOperation;
			};
			this.setNextOperation = function(_nextOperation) {
				nextOperation = _nextOperation;
				nextOperation.setPreviousOperation(this);
			};
			this.variables = function() {
				return previousOperation.variables();
			};

			this.doIt = function() {
				for(var i=0; i<setters.length; i++) {
					setters[i].set();
				}
				if(nextOperation) {
					nextOperation.doIt();
				}
			};
			this.finish = function() {
				if(nextOperation) {
					nextOperation.finish();
				}
			};
			this.run = function() {
				throw "Set-operation cannot be first in statement.";
			};
			this.type = function() {
				return this.constructor.name;
			};

		};
		function Create(_statement) {
			var statement = _statement;
			var patterns = [];
			//var objects = [];
			var previousOperation;
			var nextOperation;

			var whereCondition;
			
			this.where = function(expression) {
				whereCondition = new Where(expression);
			};
			this.addPattern = function() {
				patterns.push(new Pattern());
			};
			var lastPattern = function() {
				return patterns[patterns.length-1];
			};
			this.getPattern = function() {
				return lastPattern();
			};
			this.addNode = function(node) {
				lastPattern().addNode(node);
			};
			this.addRelationship = function(relationship) {
				lastPattern().addRelationship(relationship);
			};
			this.variable = function(key) {
				statement.addVariable(key, this.getLast());
			};
			this.getLast = function(node) {
				return lastPattern().lastObject();
			};
			this.setPreviousOperation = function(_previousOperation) {
				previousOperation = _previousOperation;
			};
			this.setNextOperation = function(_nextOperation) {
				nextOperation = _nextOperation;
				nextOperation.setPreviousOperation(this);
			};
			this.previousOperation = function() {
				return previousOperation;
			};
			var initialiseConveyorBelt = function() {
				if(nextOperation) {
					lastPattern().setNextAction(
						function() {
							if(!whereCondition || whereCondition.evaluate()) {
								nextOperation.doIt();
							}
						}
					);
				}
			};
			this.doIt = function() {
				if(previousOperation.constructor == Merge) {
					throw "WITH is required between MERGE and CREATE";
				}
				initialiseConveyorBelt();
				this.doIt = function() {
					for (var patternIdx=0; patternIdx < patterns.length; patternIdx++) {
						patterns[patternIdx].create();
					}
				};
				this.doIt();
			};
			this.finish = function() {
				if(nextOperation) {
					nextOperation.finish();
				} else if(!nextOperation) {
					statement.success();
				}
			};
			this.run = function() {
				initialiseConveyorBelt();
				for (var patternIdx=0; patternIdx < patterns.length; patternIdx++) {
					patterns[patternIdx].create();
				}
				if(nextOperation) {
					nextOperation.finish();
				}
			};
			this.type = function() {
				return this.constructor.name;
			};
			
			this.variables = function() {
				return statement.variables();
			};
			
		};
		function Match(_statement) {
			var statement = _statement;
			var patterns = [];
			//var objects = [];
			var previousOperation;
			var nextOperation;

			var whereCondition;
			
			this.where = function(expression) {
				whereCondition = new Where(expression);
			};
			this.addPattern = function() {
				patterns.push(new Pattern());
			};
			var lastPattern = function() {
				return patterns[patterns.length-1];
			};
			this.getPattern = function() {
				return lastPattern();
			};
			this.addNode = function(node) {
				lastPattern().addNode(node);
			};
			this.addRelationship = function(relationship) {
				lastPattern().addRelationship(relationship);
			};
			this.variable = function(key) {
				statement.addVariable(key, this.getLast());
			};
			this.getLast = function(node) {
				return lastPattern().lastObject();
			};
			this.setPreviousOperation = function(_previousOperation) {
				previousOperation = _previousOperation;
			};
			this.setNextOperation = function(_nextOperation) {
				nextOperation = _nextOperation;
				nextOperation.setPreviousOperation(this);
			};
			this.previousOperation = function() {
				return previousOperation;
			};
			var initialiseConveyorBelt = function() {
				if(nextOperation) {
					lastPattern().setNextAction(
						function() {
							if(!whereCondition || whereCondition.evaluate()) {
								nextOperation.doIt();
							}
						}
					);
				}
			};
			this.doIt = function() {
				if(previousOperation.constructor == Merge) {
					throw "WITH is required between MERGE and MATCH";
				}
				initialiseConveyorBelt();
				this.doIt = function() {
					for (var patternIdx=0; patternIdx < patterns.length; patternIdx++) {
						patterns[patternIdx].match();
					}
				};
				this.doIt();
			};
			this.finish = function() {
				if(nextOperation) {
					for (var patternIdx=0; patternIdx < patterns.length; patternIdx++) {
						patterns[patternIdx].finish();
					}
					nextOperation.finish();
				} else if(!nextOperation) {
					statement.success();
				}
			};
			this.run = function() {
				initialiseConveyorBelt();
				for (var patternIdx=0; patternIdx < patterns.length; patternIdx++) {
					patterns[patternIdx].match();
				}
				if(nextOperation) {
					for (var patternIdx=0; patternIdx < patterns.length; patternIdx++) {
						patterns[patternIdx].finish();
					}
					nextOperation.finish();
				}
			};
			this.type = function() {
				return this.constructor.name;
			};
			
			this.variables = function() {
				return statement.variables();
			};
			
		};
		function Merge(_statement) {
			var statement = _statement;
			var patterns = [];
			
			var previousOperation;
			var nextOperation;
			
			var whereCondition;
			
			this.where = function(expression) {
				whereCondition = new Where(expression);
			};
			this.addPattern = function() {
				patterns.push(new Pattern());
			};
			var lastPattern = function() {
				return patterns[patterns.length-1];
			};
			this.addNode = function(node) {
				lastPattern().addNode(node);
			};
			this.addRelationship = function(relationship) {
				lastPattern().addRelationship(relationship);
			};
			this.getLast = function(node) {
				return lastPattern().lastObject();
			};
			
			this.variable = function(key) {
				this.getLast().setVariableKey(key);
				statement.addVariable(key, this.getLast());
			};
			this.setPreviousOperation = function(_previousOperation) {
				previousOperation = _previousOperation;
			};
			this.setNextOperation = function(_nextOperation) {
				nextOperation = _nextOperation;
				nextOperation.setPreviousOperation(this);
			};
			this.previousOperation = function() {
				return previousOperation;
			};
			var initialiseConveyorBelt = function() {
				if(nextOperation) {
					lastPattern().setNextAction(
						function() {
							if(!whereCondition || whereCondition.evaluate()) {
								nextOperation.doIt();
							}
						}
					);
				}
			};
			this.doIt = function() {
				initialiseConveyorBelt();
				this.doIt = function() {
					lastPattern().merge();
				};
				this.doIt();
			};
			this.finish = function() {
				if(nextOperation) {
					nextOperation.finish();
				} else if(!nextOperation) {
					statement.success();
				}
			};
			this.run = function() {
				initialiseConveyorBelt();
				lastPattern().merge();
				if(nextOperation) {
					nextOperation.finish();
				}
			};
			this.type = function() {
				return this.constructor.name;
			};
			
			this.variables = function() {
				return statement.variables();
			};
		};
		function GroupBy(context) {
			var context = context;
			var trieRoot = null;
			var currentTrieNode;
			var reducersCount = 0;
			var stringRecoder = new StringRecoder();
			var newNode = function(value) {
				return {
					value: value,
					map: {}
				};
			};
			var recode = function(val) {
				if(val == undefined || val == null) {
					return val;
				}
				if(val.constructor == NodeReference || val.constructor == RelationshipReference ) {
					return val.id();
				} else if(val.constructor == Array || val.constructor == Object) {
					return JSON.stringify(val);
				}
				return stringRecoder.recode(val);
			};
			this.getTrieRoot = function() {
				return trieRoot;
			};
			this.beginMap = function() {
				if(trieRoot == null) {
					trieRoot = newNode();
				}
				currentTrieNode = trieRoot;
			};
			this.beginMap();
			this.map = function(element) {
				if(element.non_deterministic()) {
					element.precalculate();
				}
				var groupByKey = recode(element.groupByKey()); 
				var groupByValue = element.groupByValue();
				if(!currentTrieNode.map[groupByKey]) {
					currentTrieNode.map[groupByKey] = newNode(groupByValue);
				}
				currentTrieNode = currentTrieNode.map[groupByKey];
			};
			this.getReducer = function(reducerIdx) {
				if(!currentTrieNode.reducers) {
					currentTrieNode.reducers = new Array(reducersCount)
				}
				if(!currentTrieNode.reducers[reducerIdx]) {
					currentTrieNode.reducers[reducerIdx] = {};
				}
				return currentTrieNode.reducers[reducerIdx];
			};
			this.addReducer = function() {
				return reducersCount++;
			};
			this.print = function() {
				printTrie(trieRoot);
			};
			var printTrie = function(trieNode) {
				var key;
				for(key in trieNode.map) {
					context.setNextMapValue(
						trieNode.map[key].value
					);
					printTrie(trieNode.map[key]);
					context.moveToPreviousMapValue();
				}
				if(!key) {
					currentTrieNode = trieNode;
					context.addAggregateOutputRecord();
				}
			};
		};
		function ReturnValue(_expression, _statement, _parent, isHidden) {
			var expression = _expression;
			var statement = _statement;
			var alias = expression.getAlias();
			var id = 0;
			var groupByValue;
			var me = this;
			var hidden = isHidden;
			var parent = _parent;

			this.getAlias = function() {
				return alias;
			};
			this.setAlias = function(_alias) {
				alias = _alias;
				
				statement.addVariable(
					alias,
					this
				);
			};
			this.hasKey = function() {
				return expression.hasKey();
			};
			this.setId = function(_id) {
				id = _id;
			};
			this.getId = function() {
				return id;
			};
			this.value = function() {
				if(groupByValue != undefined) {
					return groupByValue;
				}
				return expression.value();
			};
			this.groupByKey = function() {
				return this.value();
			};
			this.groupByValue = function() {
				return this.value();
			};
			this.get = function() {
				return me.value();
			};
			this.getData = function() {
				return me;
			};
			this.getExpression = function() {
				return expression;
			};
			this.setGroupByValue = function(_groupByValue) {
				if(expression.isArray() && expression.hasAggregateFunctions()) {
					// Means this is a consumer of map-reducers
					// so do not override
					return;
				}
				groupByValue = _groupByValue;
			};
			this.nextAction = function() {
				;
			};
			this.setNextAction = function(f) {
				this.nextAction = f;
			};
			this.hidden = function() {
				return hidden;
			};
			this.parent = function() {
				return parent;
			};
			this.type = function() {
				return this.constructor.name;
			};
		};
		function Return(_statement) {
			var statement = _statement;
			var returnValues = [];
			var groupBy;
			var mapReturnValues;
			var mapReturnValuesIterator = 0;
			var reduceExpressions;
			var previousOperation;
			var nextOperation;
			
			var isIntermediary = false, hasReferredVariables = false, hasConstants = false;
			
			var me = this;
			
			var whereCondition;
			var limitExpression;
			
			var recordCount = 0;
			
			var doItCount = 0;
			
			this.where = function(expression) {
				whereCondition = new Where(expression);
			};
			this.limit = function(expression) {
				limitExpression = expression;
			};
			this.expression = function(expression) {
				addReturnValue(expression);
			};
			this.getLast = function() {
				return returnValues[lastIndex()];
			};
			this.getGroupBy = function() {
				if(groupBy == undefined) {
					groupBy = new GroupBy(this);
				}
				return groupBy;
			};
			this.hasGroupBy = function() {
				return groupBy != undefined;
			};
			this.hasMapKeys = function() {
				return mapReturnValues && (mapReturnValues.length > 0);
			};
			this.doItCount = function() {
				return doItCount;
			};
			var hasLimit = function() {
				return limitExpression != undefined;
			};
			var limitReached = function() {
				return (hasLimit() && recordCount >= limitExpression.value());
			};
			var whereConditionMet = function() {
				return !whereCondition || whereCondition.evaluate();
			};
			this.addReduceExpression = function(reduceExpression) {
				if(!reduceExpressions) {
					reduceExpressions = [];
				}
				reduceExpressions.push(reduceExpression);
			};
			this.setNextMapValue = function(mapValue) {
				mapReturnValues[mapReturnValuesIterator++].setGroupByValue(
					mapValue
				);
			};
			this.moveToPreviousMapValue = function() {
				mapReturnValuesIterator--;
			};
			this.addAggregateOutputRecord = function() {
				if(!whereConditionMet()) {
					return;
				}
				if(this.doItCount() == 0 && this.hasMapKeys()) {
					return;
				}
				if(limitReached()) {
					return;
				}
				for(var i=0; i<returnValues.length; i++) {
					returnValues[i].nextAction();
				}
				recordCount++;
				if(nextOperation) {
					nextOperation.doIt();
				}
			};
			this.setReturnValueNextAction = function(returnValue) {
				returnValue.setNextAction(
					function() {
						if(returnValue.getId() == 0) {
							statement.addOutputRecord();
						}
						
						if(returnValue.hidden()) {
							return;
						}
						statement.addOutputEntry(
							returnValue.getAlias(),
							returnValue.value(),
							returnValue.getId()
						);
					}
				);
			};
			var addReturnValue = function(expression, isHidden) {
				var hasHiddenReturnValues = false;
				if(expression.isArray()) {
					var array = expression.root().element();
					for(var i=0; i<array.getElements().length; i++) {
						var hiddenReturnValue = addReturnValue(array.getElements()[i], true);
						array.setElement(i, hiddenReturnValue);
						hasHiddenReturnValues = true;
					}
				} else if(expression.isAssociativeArray()) {
					var associativeArray = expression.root().element();
					var values = associativeArray.getValues();
					for(var i=0; i<values.length; i++) {
						var hiddenReturnValue = addReturnValue(values[i], true);
						associativeArray.setValue(i, hiddenReturnValue);
						hasHiddenReturnValues = true;
					}
				}
				var returnValue = new ReturnValue(expression, statement, me, isHidden);
				returnValues.push(returnValue);
				returnValues[lastIndex()].setId(lastIndex());
				if(!returnValue.getExpression().isReduceExpression() &&
					!hasHiddenReturnValues &&
					returnValue.getExpression().mappable()) {
					if(!mapReturnValues) {
						mapReturnValues = [];
					}
					mapReturnValues.push(returnValue);
				}
				me.setReturnValueNextAction(returnValue);
				hasReferredVariables = hasReferredVariables || expression.hasReferredVariables();
				hasConstants = !hasReferredVariables;
				return returnValue;
			};
			this.setIsIntermediary = function() {
				isIntermediary = true;
			};
			this.conveyorBeltEnd = function() {
				return !hasReferredVariables && isIntermediary && !reduceExpressions && !hasConstants;
			};
			var lastIndex = function() {
				return returnValues.length-1;
			};
			this.setPreviousOperation = function(_previousOperation) {
				previousOperation = _previousOperation;
			};
			this.setNextOperation = function(_nextOperation) {
				nextOperation = _nextOperation;
				nextOperation.setPreviousOperation(this);
			};
			this.previousOperation = function() {
				return previousOperation;
			};
			this.nextOperation = function() {
				return nextOperation;
			};
			this.variables = function() {
				if(!nextOperation && previousOperation) { // Last operation
					return previousOperation.variables();
				}
				var variableList = [];
				for(var i=0; i<returnValues.length; i++) {
					if(returnValues[i].hidden()) {
						continue;
					}
					variableList.push(
						statement.getVariable(
							returnValues[i].getAlias()
						)
					);
				}
				return variableList;
			};
			this.type = function() {
				return this.constructor.name;
			};
			var internalDoIt = function() {
				doItCount++;
				if(!me.hasGroupBy()) {
					if(!whereConditionMet()) {
						return;
					}
					if(limitReached()) {
						return;
					}
					for(var i=0; i<returnValues.length; i++) {
						returnValues[i].nextAction();
					}
					recordCount++;
					if(nextOperation) {
						nextOperation.doIt();
					}
				} else if(me.hasGroupBy()) {
					// Map
					groupBy.beginMap();
					
					/*for(var i=0; i<returnValues.length; i++) {
						if(!returnValues[i].getExpression().isReduceExpression()) {
							returnValues[i].getExpression().aggregate();
						}
					}*/
					if(mapReturnValues) {
						for(var i=0; i<mapReturnValues.length; i++) {
							mapReturnValues[i].getExpression().aggregate();
						}
					}
					// Reduce
					for(var i=0; i<reduceExpressions.length; i++) {
						reduceExpressions[i].aggregate();
					}
				}
			};
			this.doIt = function() {
				if(!this.conveyorBeltEnd()) {
					internalDoIt();
				}
			};
			this.finish = function() {
				if(this.conveyorBeltEnd()) {
					internalDoIt();
				}
				if(this.hasGroupBy()) {
					// Read aggregated results
					groupBy.print();
				}
				if(nextOperation) {
					nextOperation.finish();
				} else if(!nextOperation) {
					statement.success();
				}
			};
			this.run = function() {
				internalDoIt();
				if(nextOperation) {
					nextOperation.finish();
				} else if(!nextOperation) {
					this.finish();
				}
			};
		};
		function With(_statement) { // Extends Return
			
			var extendedObject = new Return(_statement);
			var descendentClassName = this.constructor.name; // With
			
			extendedObject.setReturnValueNextAction = function(returnValue) {
				if(returnValue.hidden()) {
					return;
				}
				returnValue.setNextAction(
					function() {
						if(extendedObject.hasGroupBy()) {
							statement.getVariable(
								returnValue.getAlias()
							).setOverriddenValue(
								returnValue.value()
							);
						}
					}
				);
			};
			extendedObject.type = function() {
				return descendentClassName;
			};
			extendedObject.setIsIntermediary();
			
			return extendedObject;
		};
		function Unwind(_statement) {
			var statement = _statement;
			var previousOperation;
			var nextOperation;
			var expressionToUnwind;
			var collectionToUnwind;
			var unwindedVariableKey;
			var index = 0;
			
			this.doIt = function() {
				if(nextOperation) {
					collectionToUnwind = expressionToUnwind.value();
					if(!collectionToUnwind) {
						return;
					}
					if(!Array.isArray(collectionToUnwind)) {
						throw "Unwind expects list expression.";
					}
					for(index=0; index<collectionToUnwind.length; index++) {
						nextOperation.doIt();
					}
				}
			};
			this.finish = function() {
				if(nextOperation) {
					nextOperation.finish();
				}
			};
			this.run = function() {
				this.doIt();
				if(nextOperation) {
					nextOperation.finish();
				}
			};
			
			this.variable = function(key) {
				unwindedVariableKey = key;
				statement.addVariable(key, this);
			};
			this.variables = function() {
				return [statement.getVariable(unwindedVariableKey)];
			};
			this.expression = function(expression) {
				expressionToUnwind = expression;
			};
			
			this.setPreviousOperation = function(_previousOperation) {
				previousOperation = _previousOperation;
			};
			this.setNextOperation = function(_nextOperation) {
				nextOperation = _nextOperation;
				nextOperation.setPreviousOperation(this);
			};
			this.previousOperation = function() {
				return previousOperation;
			};
			this.nextOperation = function() {
				return nextOperation;
			};
			this.value = function() {
				return collectionToUnwind[index];
			};
			this.groupByKey = this.value;
			this.groupByValue = this.value;
			this.get = function() {
				return this.value();
			};
			this.getData = function() {
				return this;
			};
			
			this.type = function() {
				return this.constructor.name;
			};
			this.id = function() {
				return this.value().id();
			};
			this.collection = function() {
				return collectionToUnwind;
			};
			this.index = function() {
				return index;
			};
		};
		function Load(_statement) {
			var statement = _statement;
			var loadType = null;
			var requestType = "GET";
			var payload = null;
			var withHeaders = false;
			var httpHeaders = null;
			var fieldTerminator = ",";
			var from = null;
			var csvData = null;
			var data;
			var previousOperation;
			var nextOperation = null;

			var runCount = 0;
			var runIdFactory = 0;

			var HTTP_PROXY =
				statement.engine().getDataDownloadProxy();

			this.runCount = function() {
				return runCount;
			};
			this.increaseRunCount = function() {
				runCount++;
			};
			this.getRunId = function() {
				return ++runIdFactory;
			};
			this.csv = function() {
				loadType = "CSV";
			};
			this.json = function() {
				loadType = "JSON";
			};
			this.text = function() {
				loadType = "TEXT";
			};
			this.post = function() {
				requestType = "POST";
			};
			this.loadType = function() {
				return loadType;
			};
			this.getRequestType = function() {
				return requestType;
			};
			this.getPayload = function() {
				if(payload) {
					return payload.value();
				}
				return null;
			};
			this.headers = function() {
				withHeaders = true;
			};
			this.setHTTPHeaders = function(_httpHeaders) {
				httpHeaders = _httpHeaders;
			};
			this.getHTTPHeaders = function() {
				return httpHeaders;
			};
			this.setFieldTerminator = function(_fieldTerminator) {
				if(_fieldTerminator.length > 1 || _fieldTerminator.length == 0) {
					throw "Field terminator must be one char.";
				}
				fieldTerminator = _fieldTerminator;
			};
			this.fieldTerminator = function() {
				return fieldTerminator;
			};
			this.expression = function(expression) {
				if(from == null) {
					from = expression;
				} else if(payload == null) {
					payload = expression;
				}
			};
			this.getLast = function() {
				return from;
			};
			this.variable = function(key) {
				statement.addVariable(key, this);
			};
			this.getProperty = function(key) {
				return data[key];
			};
			this.from = function() {
				if(HTTP_PROXY) {
					return HTTP_PROXY + from.value();
				}
				return from.value();
			};
			this.get = function() {
				return data;
			};
			this.value = function() {
				return this.get();
			};
			this.groupByKey = function() {
				return data;
			};
			this.groupByValue = function() {
				return this.get();
			};
			this.getData = function() {
				return this;
			};
			this.statement = function() {
				return statement;
			};
			this.setPreviousOperation = function(_previousOperation) {
				previousOperation = _previousOperation;
			};
			this.setNextOperation = function(_nextOperation) {
				nextOperation = _nextOperation;
				nextOperation.setPreviousOperation(this);
			};
			this.previousOperation = function() {
				return previousOperation;
			};
			
			this.variables = function() {
				return statement.variables();
			};
			
			var parseCSV = function(_fieldSeparator, nextOperation) {
				
				var fieldNames = [], fieldNumber = 0;
				var record = {};
				var lineNumber = 0;
	
				var c = '', i=0;
				var inDoubleQuotes = false;
	
				var fieldSeparator = _fieldSeparator || ',';
	
				var next = function() {
					pc = c;
					c = csvData.charAt(i++);
					if(doubleQuote()) {
						inDoubleQuotes = !inDoubleQuotes;
						next();
					}
				};
	
				var consume = function() {
					if(isQuoteInQuote()) {
						c = csvData.charAt(++i);
						return '""';
					}
					return c;
				};
	
				var nextChar = function() {
					if(eof()) {
						return '\0';
					}
					return csvData.charAt(i);
				};
	
				var isQuoteInQuote = function() {
					if(doubleQuoted) {
						if(c == '"' && nextChar() == '"') return true;
					}
					return false;
				};
	
				var doubleQuote = function() {
					return !isQuoteInQuote() && c == '"';
				};
	
				var doubleQuoted = function() {
					return inDoubleQuotes;
				};
	
				var isFieldSeparator = function() {
					return c == fieldSeparator;
				};
	
				var newLine = function() {
					if(c == '\r' && nextChar() == '\n') {
						next();
					}
					return c == '\n';
				};
	
				var eof = function() {
					return i >= (csvData.length);
				};
	
				var more = function() {
					return !(isFieldSeparator() || newLine() || eof());
				};
	
				var addRecord = function() {
					if(lineNumber++ > 0) {
						data = record;
						record = {};
						fieldNumber = 0;
						nextOperation();
					}
				};
	
				var field = function() {
					var field = "";
					while(more() || doubleQuoted()) {
						field += consume();
						next();
					}
					if(lineNumber == 0) {
						if(withHeaders) {
							fieldNames.push(field);
						} else if(!withHeaders) {
							fieldNames.push(fieldNames.length);
						}
					}
					if((lineNumber > 0 && withHeaders) || !withHeaders) {
						record[fieldNames[fieldNumber++]] = field;
					}

					if(isFieldSeparator()) {
						next(); // Skip field separator
					}
				};
	
				while(!eof()) {
					while(!newLine() && !eof()) {
						field();
					}
					addRecord();
					next(); // Skip new line or last character
				}
			};
			var processJSON = function(jsonData, nextOperation) {
				if(jsonData.constructor == Array) {
					for(var i=0; i<jsonData.length; i++) {
						data = addAssociativeArrayFunctions(
							jsonData[i]
						);
						nextOperation();
					}
				} else if(jsonData.constructor == Object) {
					data = addAssociativeArrayFunctions(jsonData);
					nextOperation();
				}
			};
			this.doIt = function() {
				this.run();
			};
			this.finish = function() {
				;
			}
			this.run = function() {
				var me = this;
				var from = me.from();
				me.increaseRunCount();
				var handleResponse = function(responseText) { // Success
					var runId = me.getRunId();
					if(me.loadType() == "CSV") {
						csvData = responseText;
						parseCSV(
							me.fieldTerminator(),
							function() {
								nextOperation.doIt();
							}
						);
					} else if(me.loadType() == "JSON") {
						processJSON(
							JSON.parse(responseText),
							function() {
								nextOperation.doIt();
							}
						);
					} else if(me.loadType() == "TEXT") {
						data = responseText;
						nextOperation.doIt();
					}
					if(runId == me.runCount()) {
						nextOperation.finish();
					}
				};
				var handleError = function(statusText) { // Error
					var error = "Error loading data from " + from + ": " + statusText;
					try {
						self.onerror(error);
					} catch(e) {
						throw error;
					}
				};
				if(from.constructor == String) {
					try {
						if(me.getRequestType() == "GET") {
							http.get(
								me.from(),
								handleResponse,
								handleError,
								me.getHTTPHeaders() ? me.getHTTPHeaders().value(false) : null
							);
						} else if(me.getRequestType() == "POST") {
							http.post(
								me.from(),
								me.getPayload(),
								handleResponse,
								handleError,
								me.getHTTPHeaders() ? me.getHTTPHeaders().value(false) : null
							);
						}
					} catch(e) {
						handleError(e);
					}
				} else if(from.constructor != String) {
					if(me.loadType() == "JSON") {
						var runId = me.getRunId();
						processJSON(
							from,
							function() {
								nextOperation.doIt();
							}
						);
						if(runId == me.runCount()) {
							nextOperation.finish();
						}
					}
				}
			};
			this.type = function() {
				return this.constructor.name;
			};
		};
	};
	
	Parse: {
		var Trie = {
			buildTrie: function(f) {
				var trie = {};
				var char;
				for(key in f) {
					var displayValue = f[key].displayValue();
		
					var trieNode = trie;
		
					for(var i=0; i<displayValue.length; i++) {
						char = displayValue.charAt(i).toUpperCase();
						if(!trieNode[char]) {
							trieNode[char] = {};
						}
						trieNode = trieNode[char];
					}
					trieNode.isF = true;
					trieNode.f = f[key];
				}
				return trie;
			},
			isF: function(what, trie, expression, position, noEndOfKeyWordCheck) {
				var trieNode = trie;
				var i=position;
				var get = function(ix) {
					return expression.charAt(ix).toUpperCase();
				};
				var endOfKeyWord = function(ix) {
					if(noEndOfKeyWordCheck) {
						return true;
					}
					return get(ix) == " " ||
						get(ix) == "(" ||
						get(ix) == ")" ||
						get(ix) == "," ||
						get(ix) == "" ||
						get(ix) == "}" ||
						get(ix) == "\t" ||
						get(ix) == "\n" ||
						get(ix) == "\r" ||
						(get(ix) == "/" && get(ix+1) == "/");
				};
				for(;;) {
					if(trieNode[get(i)]) {
						trieNode = trieNode[get(i)];
						if(trieNode.isF && !trieNode[get(i+1)] && endOfKeyWord(i+1)) {
							what.latestParsed = trieNode.f;
							return (i-position)+1;
						}
						i++;
					} else {
						return 0;
					}
				}
			}
		};
		
		KeyWord: {
			function KeyWord(displayValue, actionFunction) {
				var displayValue = displayValue;
				this.action = actionFunction;
				this.displayValue = function() {
					return displayValue;
				};
			};
			KeyWord.f = {};
			KeyWord.f.CREATE = new KeyWord("CREATE", function(e) { e.create(); });
			KeyWord.f.MATCH = new KeyWord("MATCH", function(e) { e.match(); });
			KeyWord.f.MERGE = new KeyWord("MERGE", function(e) { e.merge(); });
			KeyWord.f.WITH = new KeyWord("WITH", function(e) { e._with(); });
			KeyWord.f.RETURN = new KeyWord("RETURN", function(e) { e._return(); });
			KeyWord.f.INTO = new KeyWord("INTO", function(e) { e.into(); });
			KeyWord.f.LIMIT = new KeyWord("LIMIT", function(e) { ; });
			KeyWord.f.UNWIND = new KeyWord("UNWIND", function(e) { e.unwind(); });
			KeyWord.f.WHERE = new KeyWord("WHERE", function(e) { ; });
			KeyWord.f.LOAD = new KeyWord("LOAD", function(e) { e.load(); });
			KeyWord.f.CSV = new KeyWord("CSV", function(e) { e.csv(); });
			KeyWord.f.JSON = new KeyWord("JSON", function(e) { e.json(); });
			KeyWord.f.TEXT = new KeyWord("TEXT", function(e) { e.text(); });
			KeyWord.f.HEADERS = new KeyWord("HEADERS", function(e) { ; });
			KeyWord.f.FROM = new KeyWord("FROM", function(e) { ; });
			KeyWord.f.POST = new KeyWord("POST", function(e) { e.post(); });
			KeyWord.f.AS = new KeyWord("AS", function(e) { ; });
			KeyWord.f.FIELDTERMINATOR = new KeyWord("FIELDTERMINATOR", function(e) { ; });
			KeyWord.f.SET = new KeyWord("SET", function(e) { ; });
			KeyWord.f.DISTINCT = new KeyWord("DISTINCT", function(e) { ; });
			KeyWord.f.TRUE = new KeyWord("TRUE", function(e) { ; });
			KeyWord.f.FALSE = new KeyWord("FALSE", function(e) { ; });
			KeyWord.f.NULL = new KeyWord("NULL", function(e) { ; });
			KeyWord.f.CASE = new KeyWord("CASE", function(e) { ; });
			KeyWord.f.WHEN = new KeyWord("WHEN", function(e) { ; });
			KeyWord.f.THEN = new KeyWord("THEN", function(e) { ; });
			KeyWord.f.ELSE = new KeyWord("ELSE", function(e) { ; });
			KeyWord.f.END = new KeyWord("END", function(e) { ; });
			KeyWord.f.SHORTESTPATH = new KeyWord("SHORTESTPATH", function(e) { ; });
			KeyWord.f.IN = new KeyWord("IN", function(e) { ; });
			KeyWord.trie = Trie.buildTrie(KeyWord.f);
			KeyWord.isKeyWord = function(statementText, position) {
				return Trie.isF(KeyWord, KeyWord.trie, statementText, position);
			};
		};
		
		Operator: {
			function Operator(displayValue, precedence, leftAssociativity, valueFunction) {
				var displayValue = displayValue;
				var precedence = precedence;
				var leftAssociativity = leftAssociativity;
			
				this.value = valueFunction;

				this.isOperator = true;
				this.displayValue = function() {
					return displayValue;
				};
				this.precedence = function() {
					return precedence;
				};
				this.leftAssociativity = function() {
					return leftAssociativity;
				};
				this.rightAssociativity = function() {
					return !leftAssociativity;
				};
			};
			Operator.f = {};
			Operator.f.POWER = new Operator("^", 11, false, function() { return Math.pow(this.lhs.value(), this.rhs.value()); });
			Operator.f.MULTIPLY = new Operator("*", 10, true, function() { return this.lhs.value()*this.rhs.value(); });
			Operator.f.DIVIDE = new Operator("/", 10, true, function() { return this.lhs.value()/this.rhs.value(); });
			Operator.f.MODULO = new Operator("%", 10, true, function() { return this.lhs.value()%this.rhs.value(); });
			Operator.f.SET_UNION = new Operator("|", 10, true, function() {
				try {
					return Array.from(new Set(this.lhs.value().concat(this.rhs.value())));
				} catch (error) {
					console.log(error);
					return null;	
				}
			});
			Operator.f.SET_INTERSECT = new Operator("&", 10, true, function() {
				try {
					var A = new Set(this.lhs.value());
					var B = new Set(this.rhs.value());
					var intersect = new Set();
					for (let e of B) {
						if(A.has(e)) {
							intersect.add(e);
						}
					}
					return Array.from(intersect);
				} catch (error) {
					console.log(error);
					return null;	
				}
			});
			Operator.f.PLUS = new Operator("+", 9, true, function() {
				if(this.lhs.value().constructor == Array) {
					return this.lhs.value().concat(this.rhs.value());
				}
				if(this.rhs.value().constructor == Array) {
					return [this.lhs.value()].concat(this.rhs.value());
				}
				return this.lhs.value()+this.rhs.value();
			});
			Operator.f.MINUS = new Operator("-", 9, true, function() {
				var lhs = this.lhs.value(),
					rhs = this.rhs.value();
				if(lhs.constructor == Array && rhs.constructor == Array) {
					var _difference = new Set(lhs);
					var rhs_set = new Set(rhs);
					for (let e of rhs_set) {
						_difference.delete(e)
					}
					return Array.from(_difference);
				}
				return lhs-rhs;
			});

			Operator.f.GREATER_THAN = new Operator(">", 8, true, function() { return this.lhs.value()>this.rhs.value(); });
			Operator.f.LESS_THAN = new Operator("<", 8, true, function() { return this.lhs.value()<this.rhs.value(); });
			Operator.f.GREATER_THAN_OR_EQUALS = new Operator(">=", 8, true, function() { return this.lhs.value()>=this.rhs.value(); });
			Operator.f.LESS_THAN_OR_EQUALS = new Operator("<=", 8, true, function() { return this.lhs.value()<=this.rhs.value(); });
			Operator.f.EQUALS = new Operator("=", 7, true, function() { return this.lhs.value()==this.rhs.value(); });
			Operator.f.NOT_EQUALS = new Operator("<>", 7, true, function() { return this.lhs.value()!=this.rhs.value(); });
			Operator.f.IN = new Operator("IN", 7, true, function() {
				(this.rhs.value().constructor != Array && (function() {throw "Not a list expression.";})());
				return this.rhs.value().indexOf(this.lhs.value()) > -1;
			});
			Operator.f.IS = new Operator("IS", 7, true, function() { return this.lhs.value()==this.rhs.value(); });
			Operator.f.AND = new Operator("AND", 6, true, function() { return this.lhs.value()&&this.rhs.value(); });
			Operator.f.OR = new Operator("OR", 5, true, function() { return this.lhs.value()||this.rhs.value(); });
			Operator.f.NONE = new Operator("NONE", -1, true, null);

			Operator.trie = Trie.buildTrie(Operator.f);
			Operator.latestParsed = null;
			Operator.isOperator = function(expression, position) {
				return Trie.isF(Operator, Operator.trie, expression, position, true);
			};
		};
		
		_Function: {
			function _Function(_displayValue, _minimumExpectedParameterCount, _maximumExpectedParameterCount, _valueFunction, _returnType) {
				var displayValue = _displayValue;
				var minimumExpectedParameterCount = _minimumExpectedParameterCount;
				var maximumExpectedParameterCount = _maximumExpectedParameterCount;
				var returnType = _returnType;
				this.value = _valueFunction;
				this.getObject = _valueFunction;
				this.groupByKey = _valueFunction;
				this.groupByValue = _valueFunction;
				this.isFunction = true;
				this.displayValue = function() {
					return displayValue;
				};
				this.parametric = function() {
					return minimumExpectedParameterCount > 0;
				};
				this.precedence = function() {
					return 12;
				};
				this.leftAssociativity = function() {
					return true;
				};
				this.rightAssociativity = function() {
					return !this.leftAssociativity;
				};
				this.verifyParsedParameterCount = function(_parsedParameterCount) {
					if(_parsedParameterCount < minimumExpectedParameterCount) {
						throw "Too few parameters for function \"" + displayValue + "\".";
					} else if(_parsedParameterCount > maximumExpectedParameterCount) {
						throw "Too many parameters for function \"" + displayValue + "\".";
					}
				};
				this.returnType = function() {
					return returnType;
				};
			};

			_Function.f = {};
			_Function.f.PI = new _Function("PI", 0, 0, function() { return Math.PI; });
			_Function.f.E = new _Function("E", 0, 0, function() { return Math.E; });
			_Function.f.exp = new _Function("exp", 1, 1, function() { return Math.pow(Math.E, this.p[0].value()); });
			_Function.f.sqrt = new _Function("sqrt", 1, 1, function() { return Math.sqrt(this.p[0].value()); });
			_Function.f.log = new _Function("log", 2, 2, function() { return Math.log(this.p[0].value())/(this.p[1].value() ? Math.log(this.p[1].value()) : 1); });
			_Function.f.ln = new _Function("ln", 1, 1, function() { return Math.log(this.p[0].value()); });
			_Function.f.sin = new _Function("sin", 1, 1, function() { return Math.sin(this.p[0].value()); });
			_Function.f.cos = new _Function("cos", 1, 1, function() { return Math.cos(this.p[0].value()); });
			
			_Function.f.id = new _Function("id", 1, 1, function() {
				return this.p[0].value().id();
			});
			_Function.f.labels = new _Function("labels", 1, 1, function() {
				return this.p[0].value().getLabels();
			});
			_Function.f.type = new _Function("type", 1, 1, function() {
				return this.p[0].value().getType();
			});
			_Function.f.startnode = new _Function("startnode", 1, 1, function() {
				return this.p[0].value().startNode();
			});
			_Function.f.endnode = new _Function("endnode", 1, 1, function() {
				return this.p[0].value().endNode();
			});
			_Function.f.properties = new _Function("properties", 1, 1, function() {
				return this.p[0].value().getProperties();
			});
			_Function.f.exists = new _Function("exists", 1, 1, function() {
				return (this.p[0].value() != undefined);
			});
			_Function.f.keys = new _Function("keys", 1, 1, function() {
				try {
					return this.p[0].value().getKeys();
				} catch(e) {
					;
				}
				return Object.keys(this.p[0].value());
			});
			_Function.f.nodes = new _Function("nodes", 1, 1, function() {
				return this.p[0].value().getNodes();
			});
			_Function.f.relationships = new _Function("relationships", 1, 1, function() {
				return this.p[0].value().getRelationships();
			});
			_Function.f.head = new _Function("head", 1, 1, function() { return (this.p[0].value().shift ? this.p[0].value().shift() : null); });
			_Function.f.last = new _Function("last", 1, 1, function() { return (this.p[0].value().length>0 ? this.p[0].value()[this.p[0].value().length-1] : null); });
			_Function.f.size = new _Function("size", 1, 1, function() { return this.p[0].value().length; });

			_Function.f.object_lookup = new _Function("object_lookup", 2, 2, function() {
				if(this.p[0].value().getProperty) {
					return this.p[0].value().getProperty(this.p[1].value());
				}
				try {
					return this.p[0].value()[this.p[1].value()];
				} catch(e) {
					;
				}
				return null;
			});
			_Function.f.array_lookup = new _Function("array_lookup", 2, 2, function() {
				try {
					var lookup = this.p[1].value();
					if(lookup.constructor == Number || lookup.constructor == String) {
						return this.p[0].value()[lookup];
					} else if(lookup.constructor == Array) {
						var a = [];
						for(var i=0; i<lookup.length; i++) {
							a.push(this.p[0].value()[lookup[i]]);
						}
						return a;
					}
				} catch(e) {
					;
				}
				return null;
			});

			_Function.f.split = new _Function("split", 2, 2, function() {
				var list = addArrayFunctions(
					this.p[0].value().split(this.p[1].value())
				);
				return list;
			}, List);
			_Function.f.join = new _Function("join", 1, 2, function() {
				var joinBy = ((this.p[1] != undefined) && this.p[1].value()) || ",";
				return this.p[0].value().join(joinBy);
			});

			_Function.f.trim = new _Function("trim", 1, 1, function() {
				return this.p[0].value().trim();
			});

			_Function.f.range = new _Function(
				"range",
				2,
				3,
				function() {
					var start = parseInt(this.p[0].value());
					var end = parseInt(this.p[1].value());
					var step = ((this.p[2] != undefined) && parseInt(this.p[2].value())) || 1;
					if(step == 0) {
						throw "Zero step-size not allowed";
					} else if(step < 0 && end > 0 && end > start) {
						throw "Negative step-size and positive end of range not allowed.";
					} else if(step > 0 && end < 0) {
						throw "Positive step-size and negative end of range not allowed.";
					} else if(end < start && step > 0) {
						throw "End of range smaller than start of range and positive step-size not allowed.";
					}
					var a = [];
					for(var i=start; i != end; i += step) {
						a.push(i);
					}
					return addArrayFunctions(a);
				},
				List
			);
			
			_Function.f.lower = new _Function("lower", 1, 1, function() { return this.p[0].value().toLowerCase(); });
			_Function.f.upper = new _Function("upper", 1, 1, function() { return this.p[0].value().toUpperCase(); });
			_Function.f.replace = new _Function("replace", 3, 3, function() {
				var s = this.p[0].value();
				if(s.replace) {
					return s.replace(new RegExp(this.p[1].value(), "g"), this.p[2].value());
				} else {
					return s;
				}
			});			
			_Function.f.toint = new _Function("toint", 1, 1, function() {
				return parseInt(this.p[0].value());
			});
			_Function.f.tofloat = new _Function("tofloat", 1, 1, function() { return parseFloat(this.p[0].value()); });
			_Function.f.tostring = new _Function("tostring", 1, 1, function() {
				try {
					return this.p[0].value().toString();
				} catch(e) {
					;
				}
				return this.p[0].value()+"";
			});
			_Function.f.stringify = new _Function("stringify", 2, 2, function() {
				try {
					return JSON.stringify(this.p[0].value(), null, this.p[1].value());
				} catch(e) {
					;
				}
				return null;
			});
			_Function.f.todate = new _Function("todate", 1, 1, function() { return new Date(this.p[0].value()); });
			_Function.f.tojson = new _Function(
				"tojson",
				1,
				1,
				function() {
					return JSON.parse(this.p[0].value());
				}
			);
			
			_Function.f.coalesce = new _Function("coalesce", 2, 2, function() { return (this.p[0].value() == null ? this.p[1].value() : this.p[0].value()); });
			
			_Function.f.round = new _Function("round", 1, 1, function() {
				return Math.round(this.p[0].value());
			});

			_Function.f.rand = new _Function("rand", 0, 0, function() {
				return Math.random();
			});
			_Function.f.rand.non_deterministic = true;

			_Function.f.timestamp = new _Function("timestamp", 0, 0, function() {
				return new Date();
			});
			
			_Function.f.not = new _Function("not", 1, 1, function() { return !this.p[0].value(); });
		
			_Function.trie = Trie.buildTrie(_Function.f);
			_Function.latestParsed = null;
			_Function.isFunction = function(expression, position) {
				return Trie.isF(_Function, _Function.trie, expression, position);
			};
		};
		
		AggregateFunction: {
			function AggregateFunction(_displayValue, _minimumExpectedParameterCount, _maximumExpectedParameterCount, _initFunction, _valueFunction, _aggregateFunction, _returnType) {
				var displayValue = _displayValue;
				var parsedParameterCount = 0;
				var minimumExpectedParameterCount = _minimumExpectedParameterCount;
				var maximumExpectedParameterCount = _maximumExpectedParameterCount;
				var returnType = _returnType;
				this.initialize = _initFunction;
				this.value = _valueFunction;
				this.getObject = _valueFunction;
				this.aggregate = _aggregateFunction;
				this.isFunction = true;

				this.initializeIfNecessary = function() {
					this.initialize();
				};

				this.displayValue = function() {
					return displayValue;
				};
				this.precedence = function() {
					return 12;
				};
				this.leftAssociativity = function() {
					return true;
				};
				this.rightAssociativity = function() {
					return !this.leftAssociativity;
				};
				this.parametric = function() {
					return minimumExpectedParameterCount > 0;
				};
				this.parsedParameterCount = function() {
					return parsedParameterCount;
				};
				this.verifyParsedParameterCount = function(_parsedParameterCount) {
					parsedParameterCount = _parsedParameterCount;
					if(parsedParameterCount < minimumExpectedParameterCount) {
						throw "Too few parameters for function \"" + displayValue + "\".";
					} else if(parsedParameterCount > maximumExpectedParameterCount) {
						throw "Too many parameters for function \"" + displayValue + "\".";
					}
				};
				this.returnType = function() {
					return returnType;
				};
			}
			AggregateFunction.f = {};
			AggregateFunction.f.sum =
				new AggregateFunction(
					"sum",
					1, 1,
					function() {
						if(!this.getGroupBy().getReducer(this.getReducerId()).result) {
							this.getGroupBy().getReducer(this.getReducerId()).result = 0;
						}
					},
					function() {
						return this.getGroupBy().getReducer(this.getReducerId()).result || (new Number(0));
					},
					function() {
						this.initializeIfNecessary();
						this.getGroupBy().getReducer(this.getReducerId()).result += this.p[0].value();
					}
				);
			AggregateFunction.f.barchart =
				new AggregateFunction(
					"barchart",
					1, 1,
					function() {
						if(!this.getGroupBy().getReducer(this.getReducerId()).result) {
							this.getGroupBy().getReducer(this.getReducerId()).result = {};
						}
					},
					function() {
						return addAssociativeArrayFunctions(
							this.getGroupBy().getReducer(this.getReducerId()).result
						);
					},
					function() {
						this.initializeIfNecessary();
						var key = (this.p[0].value().groupByKey &&
							this.p[0].value().groupByKey()) || this.p[0].value();
						if(this.getGroupBy().getReducer(this.getReducerId()).result[key] == undefined) {
							this.getGroupBy().getReducer(this.getReducerId()).result[key] = 0;
						};
						this.getGroupBy().getReducer(this.getReducerId()).result[key]++;
					}
				);
			AggregateFunction.f.histogram =
				new AggregateFunction(
					"histogram",
					1, 2,
					function() {
						if(!this.getGroupBy().getReducer(this.getReducerId()).result) {
							this.getGroupBy().getReducer(this.getReducerId()).result = {
								values: [],
								histogram: null
							};
						}
					},
					function() {
						var r = this.getGroupBy().getReducer(this.getReducerId()).result;
						if(r.histogram == null) {
							var bins = (this.p[1] && this.p[1].value()) || 10;
							var min = r.values[0], max = r.values[0];
							var histogram = new Array(bins).fill(0);
							for(var i=0; i<r.values.length; i++) {
								if(r.values[i] < min) {
									min = r.values[i];
								}
								if(r.values[i] > max) {
									max = r.values[i];
								}
							}
							var step = (max-min)/bins;
							for(var i=0; i<r.values.length; i++) {
								histogram[Math.floor(r.values[i]/step)]++;
							}
							r.histogram = new Array(bins);
							var from = min;
							for(var i=0; i<bins; i++) {
								r.histogram[i] = {
									label: "[" + from + ", " + (from + step) + ">",
									value: histogram[i],
									from: from,
									to: from + step
								};
								from += step;
							}
						}
						return addArrayFunctions(r.histogram);
					},
					function() {
						this.initializeIfNecessary();
						this.getGroupBy().getReducer(this.getReducerId()).result.values.push(
							this.p[0].value()
						);
					}
				);
			AggregateFunction.f.min =
				new AggregateFunction(
					"min",
					1, 1,
					function() {
						;
					},
					function() {
						return this.getGroupBy().getReducer(this.getReducerId()).result;
					},
					function() {
						if((this.getGroupBy().getReducer(this.getReducerId()).result == undefined) ||
							this.p[0].value() < this.getGroupBy().getReducer(this.getReducerId()).result) {
							this.getGroupBy().getReducer(this.getReducerId()).result = this.p[0].value();
						}
					}
				);
			AggregateFunction.f.max =
				new AggregateFunction(
					"max",
					1, 1,
					function() {
						;
					},
					function() {
						return this.getGroupBy().getReducer(this.getReducerId()).result;
					},
					function() {
						if((this.getGroupBy().getReducer(this.getReducerId()).result == undefined) ||
							this.p[0].value() > this.getGroupBy().getReducer(this.getReducerId()).result) {
							this.getGroupBy().getReducer(this.getReducerId()).result = this.p[0].value();
						}
					}
				);
			AggregateFunction.f.count =
				new AggregateFunction(
					"count",
					1, 1,
					function() {
						if(!this.getGroupBy().getReducer(this.getReducerId()).result) {
							if(!this.distinct()) {
								this.getGroupBy().getReducer(this.getReducerId()).result = 0;
							} else if(this.distinct()) {
								this.getGroupBy().getReducer(this.getReducerId()).result = {};
							}
						}
					},
					function() {
						if(!this.distinct()) {
							return this.getGroupBy().getReducer(this.getReducerId()).result || (new Number(0));
						} else if(this.distinct()) {
							return Object.keys(this.getGroupBy().getReducer(this.getReducerId()).result).length;
						}
					},
					function() {
						this.initializeIfNecessary();
						if(!this.distinct()) {
							this.getGroupBy().getReducer(this.getReducerId()).result += 1;
						} else if(this.distinct()) {
							var key = (this.p[0].value().groupByKey &&
								this.p[0].value().groupByKey()) || this.p[0].value();
							key = JSON.stringify(key);
							if(this.getGroupBy().getReducer(this.getReducerId()).result[key] == undefined) {
								this.getGroupBy().getReducer(this.getReducerId()).result[key] = true;
							};
						}
					}
				);
			AggregateFunction.f.stdev =
				new AggregateFunction(
					"stdev",
					1, 1,
					function() {
						if(!this.getGroupBy().getReducer(this.getReducerId()).result) {
							this.getGroupBy().getReducer(this.getReducerId()).result = [];
						}
					},
					function() {
						var sum = 0, avg, values = this.getGroupBy().getReducer(this.getReducerId()).result;
						for(var i=0; i<values.length; i++) {
							sum += values[i];
						}
						avg = sum/values.length;
						sum = 0;
						for(var i=0; i<values.length; i++) {
							sum += Math.pow(values[i]-avg, 2);
						}
						return Math.sqrt(sum/(values.length-1));
					},
					function() {
						this.initializeIfNecessary();
						this.getGroupBy().getReducer(this.getReducerId()).result.push(
							this.p[0].value()
						);
					}
				);
			AggregateFunction.f.collect =
				new AggregateFunction(
					"collect",
					1, 1,
					function() {
						if(!this.getGroupBy().getReducer(this.getReducerId()).result) {
							if(!this.distinct()) {
								this.getGroupBy().getReducer(this.getReducerId()).result = addArrayFunctions([]);
							} else if(this.distinct()) {
								this.getGroupBy().getReducer(this.getReducerId()).result = {};
							}
						}
					},
					function() {
						if(!this.distinct()) {
							return this.getGroupBy().getReducer(this.getReducerId()).result || addArrayFunctions([]);
						} else if(this.distinct()) {
							return addArrayFunctions(Object.values(this.getGroupBy().getReducer(this.getReducerId()).result));
						}
						
					},
					function() {
						this.initializeIfNecessary();
						var val = this.p[0].value();
						if(val == null && val == undefined) {
							return;
						}
						if(!this.distinct()) {
							this.getGroupBy().getReducer(this.getReducerId()).result.push(this.p[0].value());
						} else if(this.distinct()) {
							var key = (this.p[0].value().groupByKey &&
								this.p[0].value().groupByKey()) || this.p[0].value();
							key = JSON.stringify(key);
							if(this.getGroupBy().getReducer(this.getReducerId()).result[key] == undefined) {
								this.getGroupBy().getReducer(this.getReducerId()).result[key] = this.p[0].value();
							};
						}
					},
					List
				);
		
			AggregateFunction.trie = Trie.buildTrie(AggregateFunction.f);
			AggregateFunction.latestParsed = null;
			AggregateFunction.isAggregateFunction = function(expression, position) {
				return Trie.isF(AggregateFunction, AggregateFunction.trie, expression, position);
			};
		};

		PredicateFunctionLookup: {
			function PredicateFunctionLookup(_displayValue) {
				var displayValue = _displayValue;
				this.displayValue = function() {
					return displayValue;
				};
			}
			PredicateFunctionLookup.f = {};
			PredicateFunctionLookup.f.sum = new PredicateFunctionLookup("sum");
			PredicateFunctionLookup.f.all = new PredicateFunctionLookup("all");
			PredicateFunctionLookup.f.any = new PredicateFunctionLookup("any");
		
			PredicateFunctionLookup.trie = Trie.buildTrie(PredicateFunctionLookup.f);
			PredicateFunctionLookup.latestParsed = null;
			PredicateFunctionLookup.isPredicateFunction = function(expression, position) {
				return Trie.isF(PredicateFunctionLookup, PredicateFunctionLookup.trie, expression, position);
			};
		};
		
		function Parser(_engine) {
			var engine = _engine;
			var statementText;
			var rollbackPosition = undefined; 
			var position = 0;
			var token = '';
			var inQuotes = false;
			
			var forbiddenCharsList = '(): {}"\',.\n\r\t+-/*^[]=<>!';
			var forbiddenChars = {};

			// Used to flag whether a parsed element is optional
			var optional = false;

			var setOptional = function() {
				optional = true;
			};
			var isOptional = function() {
				var _optional = optional;
				optional = false;
				return _optional;
			};
			this.statementText = function() {
				return statementText;
			};
			this.position = function() {
				return position;
			};

			// Used to prevent nesting of aggregation functions
			var aggregationFunctionLevel = 0;

			var nestedAggregationFunction = function() {
				return aggregationFunctionLevel > 0;
			};
			var increaseAggregationFunctionLevel = function() {
				aggregationFunctionLevel++;
			};
			var decreaseAggregationFunctionLevel = function() {
				aggregationFunctionLevel--;
			};

			var setupForbiddenChars = function() {
				for(var i=0; i<forbiddenCharsList.length; i++) {
					forbiddenChars[forbiddenCharsList[i]] = true;
				}
			};
			setupForbiddenChars();
			
			this.parse = function(_statementText) {
				statementText = _statementText;
				position = 0;
				token = '';
				optional = false;
				aggregationFunctionLevel = 0;
				parseToken();
			};
			var parseToken = function() {
				ignoreWhiteSpaceAndComments();
				if(parseLoad() || parseCreate() || parseMerge() || parseMatch() || parseWith() || parseReturn() || parseUnwind()) {
					parseToken();
				}
				if(more()) {
					throw exception("Expected keyword.");
				}
			};
			var parseUnwind = function() {
				ignoreWhiteSpaceAndComments();
				if(unwind()) {
					parseExpression();
					engine.expression();
					parseUnwindAlias();
					parseSetter();
					return true;
				}
				return false;
			};
			var parseLoad = function() {
				ignoreWhiteSpaceAndComments();
				if(load()) {
					ignoreWhiteSpaceAndComments();
					if(csv()) {
						ignoreWhiteSpaceAndComments();
						if(_with(true)) {
							ignoreWhiteSpaceAndComments();
							if(!headers()) {
								throw exception("Expected HEADERS-keyword.");
							}
							engine.statement().context().headers();
						}
						ignoreWhiteSpaceAndComments();
						if(from()) {
							parseLoadFrom();
							parseFieldTerminator();
							ignoreWhiteSpaceAndComments();
							if(!parseLoadAlias()) {
								throw exception("Expected alias.");
							}
						} else {
							throw exception("Expected FROM-keyword.");
						}
					} else if(json() || text()) {
						ignoreWhiteSpaceAndComments();
						if(from()) {
							parseLoadFrom();
						} else {
							throw exception("Expected FROM-keyword.");
						}
						ignoreWhiteSpaceAndComments();
						var headersParsed = false;
						if(headers()) {
							parseHeaders();
							headersParsed = true;
						}
						ignoreWhiteSpaceAndComments();
						if(post()) {
							parsePost();
						}
						ignoreWhiteSpaceAndComments();
						if(!headersParsed && headers()) {
							parseHeaders();
						}
						ignoreWhiteSpaceAndComments();
						if(!parseLoadAlias()) {
							throw exception("Expected alias.");
						}
					} else {
						throw exception("Expected CSV-, JSON-, or TEXT-keyword.");
					}
					return true;
				}
				return false;
			};
			var parseLoadFrom = function() {
				parseExpression();
				engine.expression();
			};
			var parsePost = function() {
				parseExpression();
				engine.expression();
			};
			var parseHeaders = function() {
				var array = parseAssociativeArray();
				if(array) {
					engine.statement().context().setHTTPHeaders(array);
				} else {
					throw exception("Expected associative array.");
				}
			};
			var parseFieldTerminator = function() {
				ignoreWhiteSpaceAndComments();
				if(fieldterminator()) {
					ignoreWhiteSpaceAndComments();
					if(parseString()) {
						engine.statement().context().setFieldTerminator(
							getAndResetToken()
						);
					} else {
						throw exception("Expected single- or doublequoted string.");
					}
				}
			};
			var parseWith = function() {
				ignoreWhiteSpaceAndComments();
				if(_with()) {
					if(parseWithOrReturnBody(true)) {
						parseSetter();
						return true;
					}
				}
				return false;
			};
			var parseReturn = function() {
				ignoreWhiteSpaceAndComments();
				if(_return()) {
					return parseWithOrReturnBody();
				}
				return false;
			};
			var parseWithOrReturnBody = function(expressionMustHaveAlias) {
				do {
					ignoreWhiteSpaceAndComments();
					if(star()) {
						addAllVariables();
					} else {
						parseExpression();
						engine.expression();
						if(!parseAlias() && expressionMustHaveAlias && !engine.lastObject().hasKey()) {
							throw exception("Expression in WITH must be aliased (use AS).");
						}
					}
				} while(comma());
				parseWhere();
				ignoreWhiteSpaceAndComments();
				parseLimit();

				ignoreWhiteSpaceAndComments();
				if(into()) {
					ignoreWhiteSpaceAndComments();
					if(!parseTableName()) {
						throw exception("Expected table name.");
					}
					engine.insertInto(
						getAndResetToken()
					);
				}
				return true;
			};
			var parseNodePattern = function(addPattern) {
				if(openingParentheses()) {
					if(addPattern) {
						engine.pattern();
					}
					engine.node();
					if(parseVariable(true)) {
						var variableKey = getAndResetToken();
						var parsedLabel = parseLabel();
						var parsedProperties = parseProperties();
						if(parsedLabel || parsedProperties) {
							if(engine.variableExists(variableKey)) {
								throw "It is not allowed to create a new node in this context.";
							}
							// Variable does not exist so add it
							engine.variable(variableKey);
						} else {
							if(engine.variableExists(variableKey)) {
								// Variable is just being referred to
								var referredObject = engine.getVariable(variableKey).getObject();
								if(referredObject.constructor != Unwind && !referredObject.isNode()) {
									throw "Variable `" + variableKey + "` is bound to a " + referredObject.type() + ".";
								}
								engine.lastObject().setReferredNode(referredObject);
							} else {
								// Variable does not exist so add it
								engine.variable(variableKey);
							}
						}
					} else {
						parseLabel();
						parseProperties();
					}
					if(!closingParentheses()) {
						throw exception('Expecting closing parentheses.');
					}
					return true;
				}
				return false;
			};
			var parsePathLengthConstraints = function() {
				if(star()) {
					if(engine.operation() == "Merge" || engine.operation() == "Create") {
						throw 'Variable path length not supported in this context.';
					}
					engine.context().setHasVariablePathLength();
					if(parsePositiveInteger()) {
						engine.context().setPathLengthFrom(
							parseInt(getAndResetToken())
						);
					}
					if(dot()) {
						if(dot()) {
							if(parsePositiveInteger()) {
								engine.context().setPathLengthTo(
									parseInt(getAndResetToken())
								);
							}
						} else {
							throw exception('Expected "."');
						}
					}
					return true;
				}
				return false;
			};
			var parseRelationshipPattern = function() {
				var _relationshipLeftDirection = relationshipLeftDirection();
				if(relationshipLine()) {
					engine.relationship();
					if(_relationshipLeftDirection) {
						engine.leftDirection();
					}
					if(openingSquareBracket()) {
						if(parseVariable(true)) {
							var variableKey = getAndResetToken();
							var parsedType = parseType();
							var parsedProperties = parseProperties();
							var parsedPathLengthConstraints = parsePathLengthConstraints();
							if(parsedType || parsedProperties || parsedPathLengthConstraints) {
								if(engine.variableExists(variableKey)) {
									throw "It is not allowed to create a new relationship in this context.";
								}
								// Variable does not exist so add it
								engine.variable(variableKey);
							} else {
								if(engine.variableExists(variableKey)) {
									// Variable is just being referred to
									var referredObject = engine.getVariable(variableKey).getObject();
									if(!referredObject.isRelationship()) {
										throw "Variable `" + variableKey + "` is bound to a " + referredObject.type() + ".";
									}
									engine.lastObject().setReferredRelationship(referredObject);
								} else {
									// Variable does not exist so add it
									engine.variable(variableKey);
								}
							}
						} else {
							parseType();
							parseProperties();
							parsePathLengthConstraints();
						}
						if(!closingSquareBracket()) {
							throw exception("Expected closing square bracket.");
						}
						if(!relationshipLine()) {
							throw exception("Expected relationship line.");
						}
						if(relationshipRightDirection()) {
							engine.rightDirection();
						}
						return true;
					} else {
						throw exception("Expected opening square bracket.");
					}
				}
				return false;
			};
			var parseGraphPatternExpression = function() {
				setRollbackPosition();
				/*if(parseVariable(true)) {
					ignoreWhiteSpaceAndComments();
					if(equals()) {
						throw exception("Path variable not allowed in this context.");
					}
					rollback();
				}*/
				if(!openingParentheses()) {
					return false;
				} else {
					position--;
				}
				var resetContext = false;
				try {
					var patternExpressionElement = parseNodePatternExpression();
					
					if(patternExpressionElement) {
						while(parseRelationshipPatternExpression(patternExpressionElement)) {
							if(!parseNodePatternExpression(patternExpressionElement)) {
								throw exception("Expecting node pattern.");
							}
						}
	
						patternExpressionElement.element().useAsCondition();
	
						statement.resetContext();
	
						return patternExpressionElement;
					}

				} catch(e) {
					resetContext = true;
					statement.resetContext();
					throw e;
				}
				if(!resetContext) {
					statement.resetContext();
				}
				return false;
			};
			var parseNodePatternExpression = function(_patternExpressionElement) {
				var patternExpressionElement = _patternExpressionElement;
				var referredObject;
				var parsedPattern = false;
				setRollbackPosition();
				if(openingParentheses()) {
					setOptional();
					referredObject = parseExpressionLayer();
					if(!patternExpressionElement) {
						patternExpressionElement = addPattern(new Pattern());
						statement.setContext(patternExpressionElement.element());
					}
					patternExpressionElement.element().addNode(new Node(db));
					if(referredObject && isNode(referredObject)) {
						// Variable is just being referred to
						patternExpressionElement.element().lastObject().setReferredNode(
							referredObject
						);
						parsedPattern = true;
					}
					if(parseLabel()) {
						parsedPattern = true;
					};
					if(parseProperties()) {
						parsedPattern = true;
					}
					if(!closingParentheses()) {
						if(parsedPattern) {
							throw exception('Expecting closing parentheses.');
						}
						rollback();
						removeLastPattern();
						return false;
					}
					if(!isNodeExpression(patternExpressionElement.element().lastObject())) {
						rollback();
						removeLastPattern();
						return false;
					}
					return patternExpressionElement;
				}
				return false;
			};
			var isNode = function(o) {
				return o.rootObject().constructor == Node;
			};
			var isNodeExpression = function(node) {
				if(node.getLabels().length > 0) {
					return true;
				}
				if(node.getProperties().length > 0) {
					return true;
				}
				if(node.getReferredNode()) {
					return true;
				}
				if(node.getLabels().length == 0 &&
					node.getProperties().length == 0 &&
					!node.getReferredNode()) {
					return true;
				}
				return false;
			};
			var parseRelationshipPatternExpression = function(patternExpressionElement) {
				var _relationshipLeftDirection = relationshipLeftDirection();
				if(relationshipLine()) {
					patternExpressionElement.element().addRelationship(new Relationship(db));
					if(_relationshipLeftDirection) {
						patternExpressionElement.element().leftDirection();
					}
					if(openingSquareBracket()) {
						var referredObject;
						if(parseVariable(true)) {
							var variableKey = getAndResetToken();
							if(!engine.variableExists(variableKey)) {
								throw "Variable \"" + variableKey + "\" does not exist.";
							}
							// Variable is just being referred to
							referredObject = engine.getVariable(variableKey).getObject();
							if(!referredObject.isRelationship()) {
								throw "Variable `" + variableKey + "` is bound to a " + referredObject.type() + ".";
							}
							patternExpressionElement.element().lastObject().setReferredRelationship(
								engine.getVariable(variableKey).getObject()
							);
						}
						parseType();
						parseProperties();
						if(parsePathLengthConstraints() && referredObject) {
							throw "Path expansion not allowed for referred relationship.";
						}
						if(!closingSquareBracket()) {
							throw exception("Expected closing square bracket.");
						}
						if(!relationshipLine()) {
							throw exception("Expected relationship line.");
						}
						if(relationshipRightDirection()) {
							engine.rightDirection();
						}
						return true;
					} else {
						throw exception("Expected opening square bracket.");
					}
				}
				return false;
			};
			var parseGraphPattern = function(pathVariableNotAllowed) {
				var pathVariableName = undefined;
				if(parseVariable(true)) {
					ignoreWhiteSpaceAndComments();
					if(pathVariableNotAllowed && equals()) {
						throw exception("Path variable not allowed in this context.");
					}
					pathVariableName = getAndResetToken();
					if(!equals()) {
						throw exception("Expected variable assignment.");
					}
					ignoreWhiteSpaceAndComments();
				}
				var shortestPath = false;
				var nodeCount = 0;
				var relationshipCount = 0;
				if(shortestpath()) {
					shortestPath = true;
					getAndResetToken();
					if(!openingParentheses()) {
						throw exception("Expected opening parentheses.");
					}
				}
				if(parseNodePattern(true)) {
					nodeCount++;
					if(pathVariableName) {
						statement.addVariable(
							pathVariableName,
							statement.context().getLast().getPattern()
						);
					}
					while(parseRelationshipPattern()) {
						if(!parseNodePattern()) {
							throw exception("Expecting node pattern.");
						}
						nodeCount++;
						relationshipCount++;
					}
				}
				if(shortestPath && (relationshipCount == 0 || relationshipCount > 1)) {
					throw "Expected single relationship pattern.";
				}
				if(shortestPath && !closingParentheses()) {
					throw exception("Expected closing parentheses.");
				}
				if(shortestPath) {
					statement.context().getPattern().shortestpath();
				}
				if(nodeCount > 0) {
					return true;
				}
				return false;
			};
			var parseMerge = function() {
				ignoreWhiteSpaceAndComments();
				if(merge()) {
					ignoreWhiteSpaceAndComments();
					if(!parseGraphPattern()) {
						throw exception('Expecting graph pattern.');
					}
					parseWhere();
					parseSetter();
					return true;
				}
				return false;
			};
			var parseCreate = function() {
				ignoreWhiteSpaceAndComments();
				if(create()) {
					do {
						ignoreWhiteSpaceAndComments();
						if(!parseGraphPattern()) {
							throw exception('Expecting graph pattern.');
						}
					} while(comma());
					parseWhere();
					parseSetter();
					return true;
				}
				return false;
			};
			var parseMatch = function() {
				ignoreWhiteSpaceAndComments();
				if(match()) {
					do {
						ignoreWhiteSpaceAndComments();
						if(!parseGraphPattern()) {
							throw exception('Expecting graph pattern.');
						}
					} while(comma());
					parseWhere();
					parseSetter();
					return true;
				}
				return false;
			};
			var parseWhere = function() {
				if(where()) {
					parseExpression();
					engine.where(parser.getExpression());
				}
			};
			var parseSetter = function() {
				ignoreWhiteSpaceAndComments();
				if(set()) {
					engine.setter();
					do {
						if(!parseVariable(true)) {
							throw exception('Expected variable.');
						}
						var variable = engine.getVariable(
							getAndResetToken()
						);
						if(dot()) {
							// Setting property of variable
							var propertyKey;
							if(parsePropertyKey()) {
								propertyKey = getAndResetToken();
							} else {
								throw exception("Expected property key.");
							}
							ignoreWhiteSpaceAndComments();
							if(!equals()) {
								throw exception('Expected equals character (=).');
							}
							ignoreWhiteSpaceAndComments();
							parseExpression();
							var expression = parser.getExpression();
							engine.operationContext().addSetter(
								variable, propertyKey, expression
							);
						} else {
							var variableType = variable.getObject().constructor;
							if(variableType != Node && variableType != Relationship) {
								throw "Can't assign a label/type to a \"" + variable.getObject().getType() + "\".";
							}
							if(colon()) {
								if(!parseExpression()) {
									throw "Expected expression.";
								}
								var expression = parser.getExpression();
								if(variableType == Node) {
									engine.operationContext().addLabelSetter(
										variable, expression
									);
								} else if(variableType == Relationship) {
									engine.operationContext().addTypeSetter(
										variable, expression
									);
								}
							} else if(plus_equals()) {
								if(!parseExpression()) {
									throw "Expected expression.";
								}
								var expression = parser.getExpression();
								if(variableType == Node || variableType == Relationship) {
									engine.operationContext().addMapSetter(
										variable, expression
									);
								}
							}
						}
					} while(comma());
				}
			};
			var parseLimit = function() {
				if(limit()) {
					parseExpression(true); // variablesNotAllowed = true
					engine.limit(parser.getExpression());
				}
			};
			var parseExpression = function(variablesNotAllowed) {
				var parsedConstruct; // To hold parsed constructs
				var allowLookup = true, element; 
				
				if((element = parseGraphPatternExpression())) {
					allowLookup = false;
				} else if(openingParentheses()) {
					addOpeningParentheses();
					element = parseExpression(variablesNotAllowed);
					if(!closingParentheses()) {
						throw exception("Expected closing parentheses.");
					}
					addClosingParentheses();
				} else if( (parsedConstruct = parsePredicateFunction()) ) {
					element = addPredicateFunction(parsedConstruct);
					allowLookup = false;
				} else if(_function()) {
					element = parseFunction();
				} else if(aggregateFunction()) {
					element = parseAggregateFunction();
				} else if(parseConstant()) {
					element = addConstant(getAndResetToken());
				} else if( (parsedConstruct = parseCase()) ) {
					addCase(parsedConstruct);
					allowLookup = false;
				} else if( (parsedConstruct = parseFString()) ) {
					addFString(parsedConstruct);
				} else if(parseVariable(true)) {
					if(variablesNotAllowed) {
						throw exception("Variables not allowed within this context.");
					}
					element = addVariable(getAndResetToken());
				} else if( (parsedConstruct = parseList()) ) {
					element = addList(parsedConstruct);
				} else if( (parsedConstruct = parseAssociativeArray()) ) {
					element = addAssociativeArray(parsedConstruct);
				} else {
					if(!isOptional()) {
						throw exception("Expected expression");
					}
				}
				if(element && allowLookup) {
					parseLookup(element);
				}
				ignoreWhiteSpaceAndComments();
				if(operator()) {
					addOperator(Operator.latestParsed);
					ignoreWhiteSpaceAndComments();
					parseExpression();
				}
				return element;
			};
			var parseExpressionLayer = function() {
				parser.addLayer();
				parseExpression();
				var expression = parser.getExpression();
				parser.finishLayer();
				return expression;
			};
			var parseLookup = function(element) {
				while(1) {
					if(dot()) {
						if(parsePropertyKey()) {
							addObjectLookup(element, getAndResetToken());
						} else {
							throw exception("Expected property key.");
						}
					} else if(parseListIndex(element)) {
						;
					} else {
						noLookup();
						break;
					}
				}
			};
			var parseListIndex = function(element) {
				if(openingSquareBracket()) {
					addListLookup(element, parseExpressionLayer());
					if(!closingSquareBracket()) {
						throw exception("Expected closing square bracket.");
					}
					return true;
				}
				return false;
			};
			var parseCase = function() {
				if(_case()) {
					ignoreWhiteSpaceAndComments();
					var caseStatement = new Case();
					while(when()) {
						caseStatement.when(parseExpressionLayer());
						ignoreWhiteSpaceAndComments();
						if(_then()) {
							caseStatement.then(parseExpressionLayer());
						} else {
							throw exception("Expected THEN keyword");
						}
						ignoreWhiteSpaceAndComments();
					}
					if(caseStatement.whenCount() == 0) {
						throw exception("Expected WHEN keyword");
					}
					ignoreWhiteSpaceAndComments();
					if(_else()) {
						caseStatement.else(parseExpressionLayer());
					}
					ignoreWhiteSpaceAndComments();
					if(!end()) {
						throw exception("Expected END keyword");
					}
					return caseStatement;
				}
				return false;
			};
			var parseAssociativeArray = function() {
				if(openingCurlyBrackets()) {
					var associativeArray = new AssociativeArray();
					do {
						if(parsePropertyKey()) {
							var key = getAndResetToken();
							if(!colon()) {
								throw exception("Expected colon.");
							}
							associativeArray.addEntry(
								key,
								parseExpressionLayer()
							);
						}
					} while(comma());
					if(!closingCurlyBrackets()) {
						throw exception("Expected closing curly bracket.");
					}
					return associativeArray;
				}
				return false;
			};
			var parseList = function() {
				if(openingSquareBracket()) {
					var list = new List();
					do {
						setOptional();
						list.add(parseExpressionLayer());
					} while(comma());
					if(!closingSquareBracket()) {
						throw exception("Expected closing bracket.");
					}
					return list;
				}
				return false;
			};
			var parseAggregateFunction = function() {
				if(nestedAggregationFunction()) {
					throw exception("Not allowed to nest aggregation functions.");
				}
				if(openingParentheses()) {
					var aggregateExpressionElement =
						addAggregateFunction(
							AggregateFunction.latestParsed
						);
					addOpeningParentheses();
					increaseAggregationFunctionLevel();
					ignoreWhiteSpaceAndComments();
					if(distinct()) {
						aggregateExpressionElement.setDistinct();
					}
					ignoreWhiteSpaceAndComments();
					if(AggregateFunction.latestParsed.parametric()) {
						var parameterCount = 0;
						do {
							parseFunctionParameter();
							parameterCount++;
						} while(comma());
						try {
							aggregateExpressionElement.verifyParsedParameterCount(
								parameterCount
							);
						} catch(e) {
							throw exception(e);
						};

					}
					if(closingParentheses()) {
						addClosingParentheses();
						decreaseAggregationFunctionLevel();
					} else {
						throw exception("Expected closing parentheses.");
					}
					return aggregateExpressionElement;
				} else {
					throw exception("Expected opening parentheses.");
				}
			};
			var parseFunction = function() {
				if(openingParentheses()) {
					var functionElement =
						addFunction(_Function.latestParsed);
					addOpeningParentheses();
					if(_Function.latestParsed.parametric()) {
						var parameterCount = 0;
						do {
							parseFunctionParameter();
							parameterCount++;
						} while(comma());
						try {
							functionElement.verifyParsedParameterCount(
								parameterCount
							);
						} catch(e) {
							throw exception(e);
						};

					}
					if(closingParentheses()) {
						addClosingParentheses();
					} else {
						throw exception("Expected closing parentheses.");
					}
					return functionElement;
				} else {
					throw exception("Expected opening parentheses.");
				}
			};
			var parseFunctionParameter = function() {
				addExpression(parseExpressionLayer());
			};
			var parsePredicateFunction = function() {
				var initialPosition = position;
				if((charsToAccumulate = PredicateFunctionLookup.isPredicateFunction(statementText, position)) > 0) {
					position += charsToAccumulate;
					if(openingParentheses(false, true)) {
						var predicate = new Predicate();
						predicate.setPredicateFunctionName(PredicateFunctionLookup.latestParsed.displayValue());
						ignoreWhiteSpaceAndComments();
						if(parseVariable(true)) {
							var variableKey = getAndResetToken();
							predicate.variable(variableKey);
							ignoreWhiteSpaceAndComments();
							if(_in()) {
								ignoreWhiteSpaceAndComments();
								var listExpression = parseExpressionLayer();
								if(!listExpression) {
									throw exception("Expected list.");
								}
								predicate.list(listExpression);
								ignoreWhiteSpaceAndComments();
								if(!where()) {
									throw exception("Expected WHERE-keyword.");
								}
								ignoreWhiteSpaceAndComments();
								var expression = parseExpressionLayer();
								predicate.where(expression);
								ignoreWhiteSpaceAndComments();
								if(!closingParentheses()) {
									throw exception("Expected closing parentheses.");
								}
								return predicate;
							}
						};
					}
				}
				position = initialPosition;
				return false;
			};
			var parseVariable = function(dontAddToEngine) {
				var addToEngine = !dontAddToEngine;
				ignoreWhiteSpaceAndComments();
				if(isNumeric(currentChar())) return false;
				if(backTickQuote()) {
					while(more() && !backTickQuote()) {
						token += currentChar();
						position++;
					}
				} else if(!backTickQuote()) {
					while(more() && !forbiddenChars[currentChar()]) {
						token += currentChar();
						position++;
					}
				}
				if(token.length > 0 && validVariableName()) {
					if(addToEngine) {
						engine.variable(getAndResetToken());
					}
					return true;
				}
				return false;
			};
			var parseAliasLabel = function() {
				return parseVariable(true);
			};
			var parseLoadAliasLabel = function() {
				return parseVariable(false);
			};
			var parseUnwindAliasLabel = function() {
				return parseVariable(false);
			};
			var parseTableName = function() {
				return parseVariable(true);
			};
			var parseLabel = function() {
				ignoreWhiteSpaceAndComments();
				if(!colon()) return false;
				var labelName = '';
				if(backTickQuote()) {
					while(more() && !backTickQuote()) {
						labelName += currentChar();
						position++;
					}
				} else if(!backTickQuote()) {
					while(more() && !forbiddenChars[currentChar()]) {
						labelName += currentChar();
						position++;
					}
				}
				if(labelName == '') {
					throw exception('Expecting label name.');
				}
				engine.label(labelName);
				parseLabel();
				return true;
			};
			var parseType = function() {
				ignoreWhiteSpaceAndComments();
				if(!colon()) return false;
				var typeName = '';
				if(backTickQuote()) {
					while(more() && !backTickQuote()) {
						typeName += currentChar();
						position++;
					}
				} else if(!backTickQuote()) {
					while(more() && !forbiddenChars[currentChar()]) {
						typeName += currentChar();
						position++;
					}
				}
				if(typeName == '') {
					throw exception('Expecting type name.');
				}
				engine.type(typeName);
				return true;
			};
			var parseProperties = function() {
				ignoreWhiteSpaceAndComments();
				if(openingCurlyBrackets()) {
					if(!parseProperty()) {
						throw exception('Expecting at least one property.');
					}
					if(!closingCurlyBrackets()) {
						throw exception('Expecting closing curly brackets.');
					}
					return true;
				}
				return false;
			};
			var parseProperty = function() {
				if(parsePropertyKey()) {
					engine.propertyKey(getAndResetToken());
				} else {
					return false;
				}
				if(!colon()) {
					throw exception("Expected colon.");
				}
				engine.propertyValue(parseExpressionLayer());
				if(comma()) {
					return parseProperty();
				}
				return true;
			};
			var parsePropertyKey = function() {
				ignoreWhiteSpaceAndComments();
				if(isNumeric(currentChar())) return false;
				if(backTickQuote()) {
					while(more() && !backTickQuote()) {
						token += currentChar();
						position++;
					}
				} else if(!backTickQuote()) {
					while(more() && !forbiddenChars[currentChar()]) {
						token += currentChar();
						position++;
					}
				}
				if(token.length == 0) {
					return false;
				}
				return true;
			};
			var parseString = function() {
				var quoteFunction = null;
				if(singleQuote()) {
					quoteFunction = singleQuote;
				} else if(doubleQuote()) {
					quoteFunction = doubleQuote;
				} else if(backTickQuote()) {
					quoteFunction = backTickQuote;
				} else {
					return false;
				}
				inQuotes = true;
				while(!quoteFunction()) {
					if(!more()) {
						throw exception("Expected closing quote.");
					}
					escape();
					token += currentChar();
					position++;
				}
				inQuotes = false;
				return true;
			};
			var parseFString = function() {
				if(currentChar() != 'f') {
					return false;
				}
				position++;
				var quoteFunction = null;
				if(singleQuote()) {
					quoteFunction = singleQuote;
				} else if(doubleQuote()) {
					quoteFunction = doubleQuote;
				} else if(backTickQuote()) {
					quoteFunction = backTickQuote;
				} else {
					position--;
					return false;
				}
				var fstring = new FString();
				inQuotes = true;
				while(!quoteFunction()) {
					if(!more()) {
						throw exception("Expected closing quote.");
					}
					escape();
					if(openingDoubleCurlyBrackets()) {
						token += "{";
						while(more() && !closingDoubleCurlyBrackets()) {
							escape();
							token += currentChar();
							position++;
						}
						if(!more()) {
							throw exception("Expected closing double curly bracket.");
						}
						token += "}";
					}
					if(openingCurlyBrackets(true)) {
						var substring = getAndResetToken();
						var expression = parseExpressionLayer();
						if(!expression) {
							throw exception("Expected expression.");
						}
						if(!closingCurlyBrackets(true)) {
							throw exception("Expected closing curly bracket.");
						}
						if(substring.length > 0) {
							fstring.string(substring);
						}
						fstring.expression(expression);
					}
					if(quoteFunction()) {
						break;
					}
					token += currentChar();
					position++;
				}
				inQuotes = false;
				if(token.length > 0) {
					fstring.string(getAndResetToken());
				}
				return fstring;
			};
			var parseConstant = function() {
				if(parseString()) {
					;
				} else if(parseNumber()) {
					token = parseFloat(token);
				} else if(_true()) {
					token = true;
				} else if(_false()) {
					token = false;
				} else if(_null()) {
					token = null;
				}else {
					return false;
				}
				return true;
			};
			var parseAlias = function() {
				ignoreWhiteSpaceAndComments();
				if(as()) {
					if(!parseAliasLabel()) {
						throw exception("Expected alias variable key.");
					}
					engine.as(getAndResetToken());
					return true;
				}
				return false;
			};
			var parseLoadAlias = function() {
				ignoreWhiteSpaceAndComments();
				if(as()) {
					if(!parseLoadAliasLabel()) {
						throw exception("Expected alias variable key.");
					}
					engine.as(getAndResetToken());
					return true;
				}
				return false;
			};
			var parseUnwindAlias = function() {
				ignoreWhiteSpaceAndComments();
				if(as()) {
					if(!parseUnwindAliasLabel()) {
						throw exception("Unwinded collection must be aliased.");
					}
					return true;
				}
				return false;
			};
			
			ExpressionTreeBuilder: {
				
				function VariableReference(engine, variableKey) {
					var _engine = engine;
					var _variableKey = variableKey;
					var me = this;

					var getVariable = function() {
						if(me.parent && me.parent.getLocalVariable) {
							var value = me.parent.getLocalVariable(_variableKey);
							if(value) {
								return value;
							}
						}
						return _engine.statement().getVariable(_variableKey);
					};
					this.getObject = function() {
						return getVariable().getObject();
					};
					this.value = function(asKey) {
						return getVariable().value(asKey);
					};
					this.getKey = function() {
						return _variableKey;
					};
					this.type = function() {
						return getVariable().getObject().type();
					};
					this.groupByKey = function() {
						var o = getVariable().getObject();
						return (o.groupByKey && o.groupByKey()) || o;
					};
					this.groupByValue = function() {
						var o = getVariable().getObject();
						return (o.groupByValue && o.groupByValue()) || o;
					};
				};
				
				function ExpressionElement(_element) {
					var element = _element;
					var precalculatedReadCount = 0;
					var precalculatedValue = undefined;
					var originalValueFunction = undefined;
					var me = this;
					var elementValueContext = this;
					var parsedParameterCount = 0;
					var expression = undefined;

					element.parent = me;

					this.element = function() {
						return element;
					};
					this.precalculate = function() {
						precalculatedReadCount = 0;
						precalculatedValue = this.value();
						originalValueFunction = this.value;
						setValueFunction(consumePrepalculatedValue);
					};
					var consumePrepalculatedValue = function() {
						if(precalculatedValue && precalculatedReadCount == 0) {
							precalculatedReadCount++;
							return precalculatedValue;
						} else if(precalculatedValue && precalculatedReadCount == 1) {
							var tmpPrepalculatedValue = precalculatedValue;
							precalculatedValue = undefined;
							precalculatedReadCount = 0;
							setValueFunction(originalValueFunction);
							return tmpPrepalculatedValue;
						}
						return undefined;
					};
					var setValueFunction = function(valueFunction) {
						me.value = valueFunction;
						me.groupByKey = me.value;
						me.groupByValue = me.value;
					};
					this.elementValueContext = function() {
						return elementValueContext;
					};
					this.elementValue = function() {
						return element.value.call(elementValueContext);
					};
					this.type = element.type;
					this.value = this.elementValue;
					this.groupByKey = element.groupByKey || this.elementValue;
					this.groupByValue = element.groupByValue || this.elementValue;
					this.hasKey = function() {
						return element.getKey && element.getKey();
					};
					this.parsedParameterCount = function() {
						return parsedParameterCount;
					};
					this.verifyParsedParameterCount = function(_parsedParameterCount) {
						if(element.constructor == _Function || element.constructor == AggregateFunction) {
							parsedParameterCount = _parsedParameterCount;
							element.verifyParsedParameterCount(
								parsedParameterCount
							);
						}
					};
					this.non_deterministic = function() {
						return element.non_deterministic();
					};
					this.mappable = function() {
						if(element.mappable && !element.mappable()) {
							return false;
						}
						if(this.p) {
							for(var i=0; i<this.p.length; i++) {
								if(this.p[i].mappable && !this.p[i].mappable()) {
									return false;
								}
							}
						}
						return true;
					};
					this.setExpression = function(_expression) {
						expression = _expression;
					};
					this.getLocalVariable = function(key) {
						if(expression) {
							return expression.getLocalVariable(key);
						}
						return undefined;
					};
				};
				
				function AggregateExpressionElement(_element) {
					ExpressionElement.call(this, _element);

					var distinct = false;

					var groupBy;
					var reducerId;

					this.setReducer = function(_reducerId) {
						//this.element().setReducer.call(this.elementValueContext(), _reducerId);
						reducerId = _reducerId;
					};
					this.setGroupBy = function(_groupBy) {
						//this.element().setGroupBy.call(this.elementValueContext(), _groupBy);
						groupBy = _groupBy;
					};
					this.getGroupBy = function() {
						//return this.element().getGroupBy.call(this.elementValueContext());
						return groupBy;
					};
					this.getReducerId = function() {
						//return this.element().getReducerId.call(this.elementValueContext());
						return reducerId;
					};
					
					this.initializeIfNecessary = function() {
						this.initialize();
					};
					this.initialize = function() {
						return this.element().initialize.call(this.elementValueContext());
					};
					this.aggregate = function() {
						return this.element().aggregate.call(this.elementValueContext());
					};
					this.value = function() {
						return this.element().value.call(this.elementValueContext());
					};
					
					this.groupByKey = function() {
						return this.element().groupByKey.call(this.elementValueContext());
					};
					this.groupByValue = function() {
						return this.element().groupByValue.call(this.elementValueContext());
					};
					this.hasKey = function() {
						return this.element().getKey && this.element().getKey();
					};

					this.distinct = function() {
						return distinct;
					};
					this.setDistinct = function() {
						distinct = true;
					};
					this.mappable = function() {
						return false;
					};
				};
				AggregateExpressionElement.prototype =
					Object.create(ExpressionElement.prototype);
				AggregateExpressionElement.prototype.constructor = AggregateExpressionElement;
				
				// For Shunting Yard Algorithm
				var layers = [];
				
				var output = [];
				var operators = [];

				var expressionElements = [];
				
				var recordExpressionElement = function(element) {
					expressionElements.push(element);
					return element;
				};

				var reset = function() {
					output = [];
					operators = [];
					expressionElements = [];
				};
				
				var lastOutput = function() {
					if(output.length == 0) return null;
					return output[output.length-1];
				};
				var lastOperator = function() {
					if(operators.length == 0) return null;
					return operators[operators.length-1];
				};
				
				this.addLayer = function() {
					layers.push({
						output: output,
						operators: operators,
						expressionElements: expressionElements,
						rollbackPosition: rollbackPosition
					});
					reset();
				};
				this.finishLayer = function() {
					var layer = layers.pop();
					output = layer.output;
					operators = layer.operators;
					expressionElements = layer.expressionElements;
					rollbackPosition = layer.rollbackPosition;
				};

				var addOutput = function(o) {
					output.push(o);
					return lastOutput();
				};
				var addToOperators = function(o) {
					operators.push(o);
					return lastOperator();
				};
				
				var precedenceConditionIsMet = function(op1, op2) {
					if(op1.leftAssociativity() && op1.precedence() <= op2.precedence()) {
						return true;
					} else if(op1.rightAssociativity() && op1.precedence() < op2.precedence()) {
						return true;
					}
					return false;
				};
				var addObjectLookup = function(element, key) {
					if(!element.lookups) {
						element.lookups = [];
					}
					element.lookups.push({
						function: _Function.f.object_lookup,
						index: recordExpressionElement(new ExpressionElement(new Constant(key)))
					});
				};
				var addListLookup = function(element, expression) {
					if(!element.lookups) {
						element.lookups = [];
					}
					element.lookups.push({
						function: _Function.f.array_lookup,
						index: recordExpressionElement(new ExpressionElement(expression))
					});
				};
				var noLookup = function() {
					;
				};
				var addConstant = function(value) {
					return addOutput({
						isAtom: true,
						v: recordExpressionElement(new ExpressionElement(new Constant(value)))
					}).v;
				};
				var addAllVariables = function() {
					var vars = engine.statement().context().variables();
					for(var i=0; i<vars.length; i++) {
						addVariable(vars[i].getObjectKey());
						engine.expression();
					}
				};
				var addVariable = function(key) {
					return addOutput({
						isAtom: true,
						isVariable: true,
						v: recordExpressionElement(
							new ExpressionElement(
								new VariableReference(
									engine,
									key
								)
							)
						)
					}).v;
				};
				var addPattern = function(pattern) {
					return addOutput({
						isAtom: true,
						v: recordExpressionElement(new ExpressionElement(pattern))
					}).v;
				};
				var removeLastPattern = function() {
					if(lastOutput().v.element().constructor == Pattern) {
						output.pop();
					}
				};
				var addExpression = function(expression) {
					return addOutput({
						isAtom: true,
						v: recordExpressionElement(new ExpressionElement(expression))
					}).v;
				};
				var addList = function(list) {
					return addOutput({
						isAtom: true,
						v: recordExpressionElement(new ExpressionElement(list))
					}).v;
				};
				var addAssociativeArray = function(associativeArray) {
					return addOutput({
						isAtom: true,
						v: recordExpressionElement(new ExpressionElement(associativeArray))
					}).v;
				};
				var addCase = function(_case) {
					return addOutput({
						isAtom: true,
						v: recordExpressionElement(new ExpressionElement(_case))
					}).v;
				};
				var addPredicateFunction = function(predicateFunction) {
					return addOutput({
						isAtom: true,
						v: recordExpressionElement(new ExpressionElement(predicateFunction))
					}).v;
				};
				var addFString = function(fstring) {
					return addOutput({
						isAtom: true,
						v: recordExpressionElement(new ExpressionElement(fstring))
					}).v;
				};
				var addFunction = function(__function) {
					return addToOperators({
						isFunction: true,
						v: recordExpressionElement(new ExpressionElement(__function))
					}).v;
				};
				var addAggregateFunction = function(_aggregateFunction) {
					return addToOperators({
						isAggregateFunction: true,
						isFunction: true,
						v: recordExpressionElement(new AggregateExpressionElement(_aggregateFunction))
					}).v;
				};
				var addOperator = function(operator) {
					while(operators.length > 0 && ((operators.slice(-1)[0].isOperator || operators.slice(-1)[0].isFunction) &&
							precedenceConditionIsMet(operator, operators.slice(-1)[0].v.element()))) {
						output.push(operators.pop());
					}
					return addToOperators({
						isOperator: true,
						v: recordExpressionElement(new ExpressionElement(operator))
					}).v;
				};
				var addOpeningParentheses = function() {
					addToOperators({leftParentheses: true});
				};
				var addClosingParentheses = function() {
					while(operators.length > 0 && !operators.slice(-1)[0].leftParentheses) {
						output.push(operators.pop());
					}
					operators.pop();
				};
				var finish = function() {
					while(operators.length > 0) {
						output.push(operators.pop());
					}
					// Build expression tree
					var expressionTreeNodes = addArrayFunctions([]), aggregationFunctions, variableReferences = [];
					var currentOutput, non_deterministic = false;
					while(output.length > 0) {
						currentOutput = output.shift();
						if(currentOutput.isOperator) {
							currentOutput.v.rhs = expressionTreeNodes.pop().v;
							currentOutput.v.lhs = expressionTreeNodes.pop().v;
						} else if(currentOutput.isFunction) {
							currentOutput.v.p = [];
							for(var j=0; j<currentOutput.v.parsedParameterCount(); j++) {
								currentOutput.v.p.unshift(expressionTreeNodes.pop().v);
							}
							if(currentOutput.isAggregateFunction) {
								if(!aggregationFunctions) {
									aggregationFunctions = [];
								}
								currentOutput.v.p = currentOutput.v.p;
								aggregationFunctions.push(currentOutput.v);
							}
							if(currentOutput.v.element().non_deterministic) {
								non_deterministic = true;
							}
						}
						
						if(currentOutput.isVariable) {
							variableReferences.push(
								currentOutput.v.element().getKey()
							);
						}

						if(currentOutput.v.lookups) {
							var lookup, lookups = currentOutput.v.lookups, tmpElement;
							while(lookups && lookups.length > 0) {
								tmpElement = currentOutput.v;
								lookup = lookups.shift();
								currentOutput.v = new ExpressionElement(lookup.function);
								currentOutput.v.p = [tmpElement, lookup.index];
							}
						}
						
						expressionTreeNodes.push(currentOutput);

					}
					if(expressionTreeNodes.length == 0) {
						return null;
					}
					var expression = new Expression(
						expressionTreeNodes.pop().v,
						"expr",
						aggregationFunctions,
						engine.statement().context(),
						variableReferences,
						non_deterministic
					);
					for(var i=0; i<expressionElements.length; i++) {
						expressionElements[i].setExpression(expression);
					}
					reset();
					return expression;
				};
				this.getExpression = function() {
					return finish();
				};
			};
			
			var create = function() {
				return keyword(KeyWord.f.CREATE);
			};
			var match = function() {
				return keyword(KeyWord.f.MATCH);
			};
			var merge = function() {
				return keyword(KeyWord.f.MERGE);
			};
			var shortestpath = function() {
				return keyword(KeyWord.f.SHORTESTPATH);
			};
			var _function = function() {
				var charsToAccumulate = 0;
				if((charsToAccumulate = _Function.isFunction(statementText, position)) > 0) {
					position += charsToAccumulate;
					if(openingParentheses(true, true)) {
						return true;
					}
					position -= charsToAccumulate;
					return false;
				}
				return false;
			};
			var aggregateFunction = function() {
				var charsToAccumulate = 0;
				if((charsToAccumulate = AggregateFunction.isAggregateFunction(statementText, position)) > 0) {
					position += charsToAccumulate;
					return true;
				}
				return false;
			};
			var _with = function(noAction) {
				return keyword(KeyWord.f.WITH, noAction);
			};
			var _return = function() {
				return keyword(KeyWord.f.RETURN);
			};
			var into = function() {
				return keyword(KeyWord.f.INTO);
			};
			var limit = function() {
				return keyword(KeyWord.f.LIMIT);
			};
			var _return = function() {
				return keyword(KeyWord.f.RETURN);
			};
			var where = function() {
				return keyword(KeyWord.f.WHERE);
			};
			var load = function() {
				return keyword(KeyWord.f.LOAD);
			};
			var unwind = function() {
				return keyword(KeyWord.f.UNWIND);
			};
			var csv = function() {
				return keyword(KeyWord.f.CSV);
			};
			var json = function() {
				return keyword(KeyWord.f.JSON);
			};
			var text = function() {
				return keyword(KeyWord.f.TEXT);
			};
			var headers = function() {
				return keyword(KeyWord.f.HEADERS);
			};
			var from = function() {
				return keyword(KeyWord.f.FROM);
			};
			var post = function() {
				return keyword(KeyWord.f.POST);
			};
			var as = function() {
				return keyword(KeyWord.f.AS);
			};
			var fieldterminator = function() {
				return keyword(KeyWord.f.FIELDTERMINATOR);
			};
			var set = function() {
				return keyword(KeyWord.f.SET);
			};
			var distinct = function() {
				return keyword(KeyWord.f.DISTINCT);
			};
			var _true = function() {
				return keyword(KeyWord.f.TRUE);
			};
			var _false = function() {
				return keyword(KeyWord.f.FALSE);
			};
			var _null = function() {
				return keyword(KeyWord.f.NULL);
			};
			var _case = function() {
				return keyword(KeyWord.f.CASE);
			};
			var when = function() {
				return keyword(KeyWord.f.WHEN);
			};
			var _then = function() {
				return keyword(KeyWord.f.THEN);
			};
			var _else = function() {
				return keyword(KeyWord.f.ELSE);
			};
			var end = function() {
				return keyword(KeyWord.f.END);
			};
			var _in = function() {
				return keyword(KeyWord.f.IN);
			};
			var operator = function() {
				var charsToAccumulate = 0;
				if((charsToAccumulate = Operator.isOperator(statementText, position)) > 0) {
					position += charsToAccumulate;
					return true;
				}
				return false;
			};
			var keyword = function(which, noAction) {
				var charsToAccumulate = 0;
				if((charsToAccumulate = KeyWord.isKeyWord(statementText, position)) > 0) {
					if(KeyWord.latestParsed === which) {
						if(!noAction) {
							KeyWord.latestParsed.action(engine);
						}
						position += charsToAccumulate;
						return true;
					}
				}
				return false;
			};
			var parseNumber = function() {
				ignoreWhiteSpaceAndComments();
				var negated = false;
				if(negation()) {
					accumulatePreviousChar();
					negated = true;
				}
				if(numeric()) {
					accumulatePreviousChar();
					while(numeric()) {
						accumulatePreviousChar();
					}
					if(dot()) {
						accumulatePreviousChar();
						if(numeric()) {
							accumulatePreviousChar();
							while(numeric()) {
								accumulatePreviousChar();
							}
						} else {
							throw exception('Expected one or more integers after decimal point.');
						}
					}
					ignoreWhiteSpaceAndComments();
				} else {
					if(negated) {
						throw exception('Expected number.');
					}
					return false;
				}
				return true;
			};
			var parsePositiveInteger = function() {
				ignoreWhiteSpaceAndComments();
				if(numeric()) {
					accumulatePreviousChar();
					while(numeric()) {
						accumulatePreviousChar();
					}
					ignoreWhiteSpaceAndComments();
				} else {
					return false;
				}
				return true;
			}
			var accumulatePreviousChar = function() {
				token += previousChar();
			};
			var setRollbackPosition = function() {
				rollbackPosition = position;
			}
			var rollback = function() {
				if(rollbackPosition == undefined || rollbackPosition > position) {
					return;
				}
				position -= (position - rollbackPosition);
				token = "";
				rollbackPosition = undefined;
			};
			var validVariableName = function() {
				if((_Function.isFunction(token, 0) && openingParentheses(true)) ||
					(AggregateFunction.isAggregateFunction(token, 0) && openingParentheses(true)) ||
						KeyWord.isKeyWord(token, 0)) {
					position -= token.length;
					return false;
				}
				return true;
			};
			var getAndResetToken = function() {
				var r = token;
				token = "";
				return r;
			};
			var more = function() {
				return position < statementText.length;
			};
			var check = function(c, dontIgnoreWhiteSpace, dontIncrementPosition) {
				var incrementPosition = !dontIncrementPosition;
				if(!dontIgnoreWhiteSpace) {
					ignoreWhiteSpaceAndComments();
				}
				if(currentChar() == c) {
					if(incrementPosition) position++;
					return true;
				}
				return false;
			};
			var relationshipLeftDirection = function() {
				return check('<');
			};
			var relationshipRightDirection = function() {
				return check('>');
			};
			var relationshipLine = function() {
				return check('-');
			};
			var negation = function() {
				return check('-');
			};
			var isNumeric = function(c) {
				return !isNaN(parseInt(c));
			};
			var numeric = function() {
				var r = isNumeric(currentChar());
				if(r) position++;
				return r;
			};
			var star = function() {
				return check('*');
			};
			var dot = function() {
				return check('.');
			};
			var singleQuote = function() {
				if(previousChar() == '\\' && currentChar() == '\'' && inQuotes) return false;
				return check('\'', true);
			};
			var doubleQuote = function() {
				if(previousChar() == '\\' && currentChar() == '\"' && inQuotes) return false;
				return check('"', true);
			};
			var backTickQuote = function() {
				if(previousChar() == '\\' && currentChar() == '`' && inQuotes) return false;
				return check('`', true);
			}
			var colon = function() {
				return check(':');
			};
			var equals = function() {
				return check('=');
			};
			var plus_equals = function() {
				return check('+') && check('=');
			};
			var comma = function() {
				return check(',');
			}
			var escape = function() {
				return check('\\', true);
			}
			var openingParentheses = function(dontIncrementPosition, dontIgnoreWhiteSpace) {
				return check('(', dontIgnoreWhiteSpace, dontIncrementPosition);
			};
			var closingParentheses = function() {
				return check(')');
			};
			var openingCurlyBrackets = function(dontIgnoreWhiteSpace, dontIncrementPosition) {
				return check('{', dontIgnoreWhiteSpace, dontIncrementPosition);
			};
			var closingCurlyBrackets = function(dontIgnoreWhiteSpace, dontIncrementPosition) {
				return check('}', dontIgnoreWhiteSpace, dontIncrementPosition);
			};
			var openingDoubleCurlyBrackets = function() {
				var present = currentChar() == '{' && nextChar() == '{';
				if(present) {
					position += 2;
				}
				return present;
			};
			var closingDoubleCurlyBrackets = function() {
				var present = currentChar() == '}' && nextChar() == '}';
				if(present) {
					position += 2;
				}
				return present;
			};
			var openingSquareBracket = function() {
				return check('[');
			};
			var closingSquareBracket = function() {
				return check(']');
			};
			var ignoreWhiteSpaceAndComments = function() {
				if(!more()) return;
				while(currentChar() == ' ' || currentChar() == '\n' || currentChar() == '\t' || currentChar() == '\r') {
					position++;
				}
				if(currentChar() == '/' && nextChar() == '/') { // Comment
					while(currentChar() != '\n' && more()) {
						position++;
					}
					ignoreWhiteSpaceAndComments();
				}
			};
			var previousChar = function() {
				return statementText.charAt(position-1);
			}
			var currentChar = function() {
				return statementText.charAt(position);
			};
			var nextChar = function() {
				return statementText.charAt(position+1);
			};
			var got = function() {
				return " Parsed \"" + statementText.substring(0,position) + "\". Got \"" + currentChar() + "\"";
			};
			var exception = function(message) {
				reset();
				return message + got();
			};
		};
	};

	DataStructures: {

		function LinkedList() {

			var head = null;
			var current = null;
			var size = 0;

			function Node(_data) {
				var data = _data;
				var previous = null;
				var next = null;
				this.get = function() {
					return data;
				};
				this.setPrevious = function(node) {
					previous = node;
				};
				this.setNext = function(node) {
					next = node;
					if(node) {
						node.setPrevious(this);
					}
				};
				this.previous = function() {
					return previous;
				};
				this.next = function() {
					return next;
				};
			};

			this.add = function(data) {
				if(current) {
					current.setNext(new Node(data));
					current = current.next();
				} else if(!current) {
					head = new Node(data);
					current = head;
				}
				size++;
			};

			this.removeLast = function() {
				if(!current) return;
				if(current.previous()) {
					current = current.previous();
					current.setNext(null);
				} else if(!current.previous()) {
					head = null;
					current = null;
				}
				size--;
			};

			this.head = function() {
				return head;
			};

			this.size = function() {
				return size;
			};

			this.toArray = function() {
				var currentNode = head;
				var array = new Array(size);
				var arrayIdx = 0;
				while(currentNode) {
					array[arrayIdx++] = currentNode.get();
					currentNode.next();
				}
				return array;
			}
		};

	};
	
	Utils: {
		
		// Call like: printStackTrace(arguments.callee);
		function printStackTrace(f) {
			var c = f;
			var o = '';
			try {
				while(c) {
					console.log(c);
					c = c.caller;
				}
			} catch(e) {
				;
			}
		};

		function getUNIXTimestamp() {
			return (new Date()).valueOf();
		};
		
		function addArrayFunctions(array) {
			array.contains = function(value) {
				for(var i=0; i<array.length; i++) {
					if(value == array[i]) return true;
				}
				return false;
			};
			array.toLowerCase = function() {
				var a = [];
				for(var i=0; i<array.length; i++) {
					a.push(array[i].toLowerCase && array[i].toLowerCase() || array[i]);
				}
				return a;
			};
			array.toUpperCase = function() {
				var a = [];
				for(var i=0; i<array.length; i++) {
					a.push(array[i].toUpperCase && array[i].toUpperCase() || array[i]);
				}
				return a;
			};
			array.get = function() {
				return array;
			};
			array.last = function() {
				return array[array.length-1];
			};
			array.beforeLast = function() {
				return array[array.length-2];
			};
			array.value = function() {
				return array;
			};
			array.join = function(joinBy) {
				var joined = '';
				for(var i=0; i<array.length; i++) {
					joined += (i>0 ? joinBy : '') + array[i];
				}
				return joined;
			};
			array.trim = function() {
				var trimmedElements = new Array(array.length);
				for(var i=0; i<array.length; i++) {
					trimmedElements[i] = array[i].trim();
				}
				return trimmedElements;
			};
			return array;
		};

		function addAssociativeArrayFunctions(associativeArray) {
			if(!associativeArray.getProperty) {
				associativeArray.getProperty = function(key) {
					return associativeArray[key];
				};
			}
			if(!associativeArray.getProperties) {
				associativeArray.getProperties = function() {
					return associativeArray;
				};
			}
			if(!associativeArray.getKeys) {
				associativeArray.getKeys = function() {
					var props = [];
					for(key in associativeArray) {
						if(associativeArray[key].constructor !== Function) {
							props.push(key);
						}
					}
					return props;
				}
			}
			return associativeArray;
		};
		
		function clean(o) {
			if(o && o.constructor == String) {
				// Remove null characters from Unicode strings
				return o.replace(/\0/g, '');
			}
			if(o && (o.constructor == NodeReference || o.constructor == RelationshipReference)) {
				return clean(o.value());
			}
			if(o) {
				for(var p in o) {
					if(typeof o[p] === "function") {
						delete o[p];
						continue;
					}
					if(o[p]) {
						o[p] = clean(o[p]);
					}
				}
				o.fromNode && (o.fromNode = clean(o.fromNode));
				o.toNode && (o.toNode = clean(o.toNode));
			}
			return o;
		};

		function NodeReference(_db, _nodeId) {
			var db = _db;
			var nodeId = _nodeId;
			this.nodeId = function() {
				return nodeId;
			};
			this.id = this.nodeId;
			this.getNode = function() {
				return db.getNodeById(nodeId);
			};
			this.getObject = function() {
				return db.getNodeById(nodeId);
			};
			this.value = function() {
				return db.getNodeById(nodeId).toObject();
			};
			this.getData = this.value;
			this.getProperty = function(propertyKey) {
				return db.getNodeById(nodeId).getLocalProperty(propertyKey);
			};
			this.getProperties = function() {
				return this.value().getProperties();
			};
			this.getLabels = function() {
				return this.value().getLabels();
			};
			this.getKeys = function() {
				return this.value().getProperties().getKeys();
			};
			this.groupByKey = this.nodeId;
		};

		function RelationshipReference(_db, _relationshipId) {
			var db = _db;
			var relationshipId = _relationshipId;
			this.relationshipId = function() {
				return relationshipId;
			};
			this.id = this.relationshipId;
			this.getRelationship = function() {
				return db.getRelationshipById(relationshipId);
			};
			this.getObject = function() {
				return db.getRelationshipById(relationshipId);
			};
			this.value = function() {
				return db.getRelationshipById(relationshipId).toObject();
			};
			this.startNode = function() {
				return this.getRelationship().getFromNode().get();
			};
			this.endNode = function() {
				return this.getRelationship().getToNode().get();
			};
			this.getData = this.value;
			this.getProperty = function(propertyKey) {
				return db.getRelationshipById(relationshipId).getLocalProperty(propertyKey);
			};
			this.getProperties = function() {
				return this.value().getProperties();
			};
			this.getKeys = function() {
				return this.value().getProperties().getKeys();
			};
			this.getType = function() {
				return this.value().getType();
			};
			this.groupByKey = this.relationshipId;
		};
		
	};
	
	var db = new DB(this);
	
	var statement = new Statement(this);
	
	var parser = new Parser(this);

	var dataDownloadProxy;
	
	this.execute = function(statementText, successCallback, errorCallback) {
		statement.clear();
		var callee = arguments.callee;
		
		try {
			self.onerror = function (message, filename, lineno, colno, error) {
				console.log(message);
				errorCallback(message);
				printStackTrace(callee);
			}
		} catch(e) {
			;
		}
		
		try {
			parser.parse(statementText);
			statement.setSuccessCallback(successCallback);
			this.run();
		} catch(e) {
			errorCallback(e);
			printStackTrace(callee);
			try {
				console.log(e);
			} catch(e) {
				;
			}
		}
	};
	
	this.addGraph = function(nodes, edges) {
		for(var i=0; i<nodes.length; i++) {
			db.addNode(nodes[i]);
		}
		for(var i=0; i<edges.length; i++) {
			db.addRelationship(edges[i]);
		}
	};
	
	this.resetDataBase = function() {
		db = new DB(this);
	};

	this.setDataDownloadProxy = function(_dataDownloadProxy) {
		dataDownloadProxy = _dataDownloadProxy;
	};

	this.getDataDownloadProxy = function() {
		return dataDownloadProxy;
	};

	this.db = function() {
		return db;
	};

	this.optional = function() {
		return this;
	}
	this.create = function() {
		statement.addOperation(new Create(statement));
		return this;
	};
	this.match = function() {
		statement.addOperation(new Match(statement));
		return this;
	};
	this.pattern = function() {
		statement.context().addPattern();
		return this;
	};
	this.node = function() {
		statement.context().addNode(new Node(db));
		return this;
	};
	this.relationship = function() {
		statement.context().addRelationship(new Relationship(db));
		return this;
	};
	this.expression = function() {
		statement.context().expression(
			parser.getExpression()
		);
		return this;
	};
	this.variable = function(key) {
		statement.context().variable(key);
		return this;
	};
	this.variableExists = function(key) {
		return statement.hasVariable(key);
	};
	this.getVariable = function(key) {
		return statement.getVariable(key);
	};
	this.lastObject = function() {
		return statement.context().getLast();
	};
	this.label = function(labelName) {
		statement.context().getLast().setLabel(labelName);
		return this;
	};
	this.type = function(typeName) {
		statement.context().getLast().setType(typeName);
		return this;
	};
	this.readProperty = function(key) {
		statement.context().getLast().readProperty(key);
		return this;
	};
	this.propertyValue = function(expression) {
		statement.context().getLast().setProperty(
			statement.getPropertyKey(),
			expression
		);
		return this;
	};
	this.propertyKey = function(key) {
		statement.setPropertyKey(key);
		return this;
	};
	this.as = function(alias) {
		statement.context().getLast().setAlias(alias);
		return this;
	};
	this.leftDirection = function() {
		statement.context().getLast().setLeftDirection(true);
		return this;
	};
	this.setter = function() {
		statement.addOperation(new Setter());
		return this;
	};
	this.relStart = function() {
		return this;
	};
	this.relMiddle = function() {
		return this;
	};
	this.relEnd = function() {
		return this;
	};
	this.rightDirection = function() {
		statement.context().getLast().setRightDirection(true);
		return this;
	};
	this.variableProperty = function(key) {
		return this;
	};
	this.equals = function() {
		return this;
	};
	this.constant = function(value) {
		statement.context().constant(value);
		return this;
	};
	this.load = function() {
		statement.addOperation(new Load(statement));
		return this;
	};
	this.csv = function() {
		statement.context().csv();
		return this;
	};
	this.json = function() {
		statement.context().json();
		return this;
	};
	this.text = function() {
		statement.context().text();
		return this;
	};
	this.post = function() {
		statement.context().post();
		return this;
	};
	this._with = function() {
		statement.addOperation(new With(statement));
		return this;
	};
	this._return = function() {
		statement.addOperation(new Return(statement));
		return this;
	};
	this.into = function() {
		return this;
	};
	this.insertInto = function(tableName) {
		statement.addOperation(
			new Inserter(
				statement.engine().db(),
				tableName
			)
		);
	};
	this.merge = function() {
		statement.addOperation(new Merge(statement));
		return this;
	};
	this.unwind = function() {
		statement.addOperation(new Unwind(statement));
		return this;
	};
	this.limit = function(expression) {
		statement.context().limit(expression);
		return this;
	};
	this.where = function(expression) {
		statement.context().where(expression);
		return this;
	};
	
	this.statement = function() {
		return statement;
	};
	this.operation = function() {
		return statement.context().type();
	};
	this.context = function() {
		return statement.context().getLast();
	};
	this.operationContext = function() {
		return statement.context();
	};
	
	this.run = function() {
		
		switch(statement.context().type()) {
			case 'Match':
			case 'With':
				throw "A " + statement.context().type() + "-statement cannot conclude the query.";
		}
		
		statement.operations()[0].run();
		
	};
	
}

var Cypher_context_is_worker = (this.document == undefined);
var isStandaloneJSEngine = false; // Node.js, Nashorn, etc
var Cypher_script_path = (function() {
	if(Cypher_context_is_worker) return "";
	var scripts = this.document.getElementsByTagName('script');
	return scripts[scripts.length-1].src;
})();

try {
	if(module) {
		isStandaloneJSEngine = true;
	}
} catch(e) {
	isStandaloneJSEngine = false;
}

/*
* Create new Cypher instance
*	options: {
*		runInWebWorker: true/false, // default false
*		dataDownloadProxy: "http://proxy_url?u=" // proxy for xmlhttprequest to avoid CORS
*	}
*/
function Cypher(options) {
	var singleThreaded = !options || !options.runInWebWorker;
	
	if(Cypher_context_is_worker && !isStandaloneJSEngine) {
		try {

			var db = new CypherJS();

			if(options && options.dataDownloadProxy) {
				db.setDataDownloadProxy(
					options.dataDownloadProxy
				);
			}

			self.onmessage = function(e) {
				var request = e.data;
				var action = request.action;
				switch(action) {
					case "query":
						db.execute(
							request.statementText,
							function(results) {
								self.postMessage({
									action: action,
									success: true,
									results: results
								});
							},
							function(error) {
								self.postMessage({
									action: action,
									error: true,
									message: error
								});
							}
						);
						return;
					case "addGraph":
						try {
							db.addGraph(
								request.nodes,
								request.edges
							);
						} catch(e) {
							self.postMessage({
								action: action,
								error: true,
								message: e
							});
							return;
						}
						
						self.postMessage({
							action: action,
							success: true
						});
						
						return;
					case "resetDataBase":
						db.resetDataBase();
						
						self.postMessage({
							action: action
						});
						
						return;
				}
			};

		} catch(e) {
			;
		}
		
	} else if(!Cypher_context_is_worker && !singleThreaded && !isStandaloneJSEngine) {
		
		var successCallback, errorCallback;
		
		var worker = new Worker(Cypher_script_path);
		
		worker.onmessage = function(e) {
			var response = e.data;
			var action = response.action;

			switch(action) {
				case "query":
					if(response.success) {
						successCallback(response.results);
					} else if(response.error) {
						errorCallback(response.message);
					}
					return;
				case "addGraph":
					if(response.success) {
						successCallback(response.results);
					} else if(response.error) {
						errorCallback(response.message);
					}
					return;
				case "resetDataBase":
					if(successCallback) {
						successCallback();
					}
					return;
			}
		};
	
		this.execute = function(statementText, _successCallback, _errorCallback) {
			successCallback = _successCallback;
			errorCallback = _errorCallback;
			worker.postMessage({
				action: "query",
				statementText: statementText
			});
		};
		
		this.addGraph = function(nodes, edges, _successCallback, _errorCallback) {
			successCallback = _successCallback;
			errorCallback = _errorCallback;
			worker.postMessage({
				action: "addGraph",
				nodes: nodes,
				edges: edges
			});
		};
		
		this.resetDataBase = function(_successCallBack) {
			if(_successCallBack) {
				successCallback = _successCallback;
			} else if(!_successCallBack) {
				successCallback = (function () { ; });
			}
			worker.postMessage({
				action: "resetDataBase"
			});
		};
		
	} else if(isStandaloneJSEngine || (!isStandaloneJSEngine && !Cypher_context_is_worker && singleThreaded)) {
		var db = new CypherJS();

		if(options && options.dataDownloadProxy) {
			db.setDataDownloadProxy(
				options.dataDownloadProxy
			);
		}

		this.execute = function(statementText, _successCallback, _errorCallback) {
			db.execute(statementText, _successCallback, _errorCallback);
		};

	}
};

IE_FIX: {
	if(!Object.values) {
		Object.values = function(object) {
			var values = [];
			for(var key in object) {
				values.push(object[key]); 
			}
			return values;
		};
	}
	if(!Object.keys) {
		Object.keys = function(object) {
			var keys = [];
			for(var key in object) {
				keys.push(key); 
			}
			return keys;
		};
	}
	if(!Array.prototype.fill) {
		Array.prototype.fill = function(value) {
			var o = Object(this);
			for(var i=0; i<o.length; i++) {
				o[i] = value;
			}
			return o;
		};
	}
	if(!Array.prototype.concat) {
		Array.prototype.concat = function(other_array) {
			var this_array = Object(this);
			var new_array = new Array(this_array.length + other_array.length);
			var i = 0;
			for(; i<this_array.length; i++) {
				new_array[i] = this_array[i];
			}
			for(; i<new_array.length; i++) {
				new_array[i] = other_array[i-this_array.length];
			}
			return new_array;
		};
	}
	if(!Number.MAX_SAFE_INTEGER) {
		Number.MAX_SAFE_INTEGER = 9007199254740991;
	}
}

if(Cypher_context_is_worker) {
	(new Cypher());
}

try {
	module.exports = Cypher;
} catch (e) {
	;
}