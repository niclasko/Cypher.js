const { stat } = require("fs");
var Cypher = require("./Cypher.js");

var cypherTest = new Cypher();

var statements = [
    'load csv with headers from "https://raw.githubusercontent.com/melaniewalsh/sample-social-network-datasets/master/sample-datasets/game-of-thrones/got-nodes.csv" as l \
    merge (c:Character{name:l.Id}) \
    return count(1)',

    'load csv with headers from "https://raw.githubusercontent.com/melaniewalsh/sample-social-network-datasets/master/sample-datasets/game-of-thrones/got-edges.csv" as l \
    match (source:Character{name:l.Source}), (target:Character{name:l.Target}) \
    merge (source)-[r:KNOWS{weight:l.Weight}]->(target) \
    return count(1)',

    'match (a:Character)-[:KNOWS]->(b:Character) \
    return count(1) as cnt',

    'match (a:Character)-[:KNOWS*]->(b:Character) \
    return count(1) as cnt',
    
    'merge (:Node{ID:1})-[:TO{ID:12}]->(:Node{ID:2}) \
    merge (:Node{ID:2})-[:TO{ID:23}]->(:Node{ID:3}) \
    merge (:Node{ID:2})-[:TO{ID:24}]->(:Node{ID:4}) \
    merge (:Node{ID:3})-[:TO{ID:35}]->(:Node{ID:5}) \
    merge (:Node{ID:3})-[:TO{ID:36}]->(:Node{ID:6}) \
    merge (:Node{ID:2})-[:TO{ID:24}]->(:Node{ID:4}) \
    merge (:Node{ID:4})-[:TO{ID:47}]->(:Node{ID:7}) \
    with 1 as dummy \
    match (a)-[r:TO]->(b) \
    return count(1)',

    'match (a:Node{ID:1})-[r*]->(b) \
    return size(r)',
    
    'merge (:Node{ID:1})-[:TO]->(:Node{ID:2}) merge (:Node{ID:1})-[:TO]->(:Node{ID:3}) return count(1)',

    'merge (:Node{ID:1})-[:TO]->(:Node{ID:2}) merge (:Node{ID:1})-[:TO]->(:Node{ID:3}) return count(1)',

    'load csv with headers from "https://raw.githubusercontent.com/melaniewalsh/sample-social-network-datasets/master/sample-datasets/game-of-thrones/got-nodes.csv" as l \
    merge (c:Character{name:l.Id}) \
    return count(1)',

    'load csv with headers from "https://raw.githubusercontent.com/melaniewalsh/sample-social-network-datasets/master/sample-datasets/game-of-thrones/got-edges.csv" as l \
    match (source:Character{name:l.Source}), (target:Character{name:l.Target}) \
    merge (source)-[r:KNOWS{weight:l.Weight}]->(target) \
    return count(1)',
    
    'match (a:Character{name:"Edmure"})-[:KNOWS*]->(:Character) \
    return a.name, count(1)',

    'LOAD CSV WITH HEADERS FROM "https://niclasko.github.io/data/premier_league_2017_2018.csv" AS csvLine \
    merge (ht:SoccerTeam{name:csvLine.HomeTeam}) merge (at:SoccerTeam{name:csvLine.AwayTeam}) \
    with csvLine, ht, at \
    merge (ht)-[r:PLAYED{result:csvLine.FTR, home_goals: toInt(csvLine.FTHG), away_goals: toInt(csvLine.FTAG)}]->(at)',
    'match (:SoccerTeam)-[:PLAYED*..3]->(:SoccerTeam) \
    return count(1)',

    'load csv with headers from "https://raw.githubusercontent.com/melaniewalsh/sample-social-network-datasets/master/sample-datasets/game-of-thrones/got-edges.csv" as l \
    merge (:Character{name:l.Source}) merge (:Character{name:l.Target}) \
    with l \
    match (source:Character{name:l.Source}), (target:Character{name:l.Target}) \
    merge (source)-[r:KNOWS{weight:l.Weight}]->(target) \
    return count(1)',
    
    'unwind [{k:"a", v: 1}, {k:"b", v: 2}] as e return collect(distinct e)',
    
    'unwind ["a","a","b","b","c","d","a"] as e with barchart(e) as bc, {kiwi: 2} as k return bc.a, k.kiwi',

    'unwind range(1,10001) as e return barchart(round(rand()*10))',
    
    'unwind range(1,100001) as e \
    return histogram(round(rand()*1000), 6)',

    'merge (computer:Item{id:"Computer"}) \
    merge (hdd:Item{id:"HDD"}) \
    merge (keyboard:Item{id:"Keyboard"}) \
    merge (motherboard:Item{id:"Motherboard"}) \
    merge (cpu:Item{id:"CPU"}) \
    merge (ram:Item{id:"RAM"}) \
    merge (bus:Item{id:"Bus"}) \
    merge (hdd)-[:PARENT]->(computer) \
    merge (keyboard)-[:PARENT]->(computer) \
    merge (motherboard)-[:PARENT]->(computer) \
    merge (cpu)-[:PARENT]->(motherboard) \
    merge (ram)-[:PARENT]->(motherboard) \
    merge (bus)-[:PARENT]->(motherboard) \
    with 1 as dummy \
    match p=(:Item)-[:PARENT*]->(pid:Item) \
    where not((pid)-[:PARENT]->(:Item)) \
    unwind nodes(p) as item \
    return nodes(p)[0].id, collect(item.id) as item_path',
    
    'create (:A)-[:CONNECT]->(:B), \
            (:A)-[:CONNECT]->(:B) \
    match ()-[r]->() \
    with collect(r) as rels \
    unwind rels as rel \
    return startnode(rel), rel, endnode(rel)',
    
    'return case when 1=1 then 1 else 0 end', 

    'with range(1,7) as faces \
    unwind faces as d1 \
    unwind faces as d2 \
    unwind faces as d3 \
    unwind faces as d4 \
    unwind faces as d5 \
    return d1, d2, d3, d4, d5 where d1 = d2 or d2 = d3',

    'load csv with headers from "https://raw.githubusercontent.com/melaniewalsh/sample-social-network-datasets/master/sample-datasets/game-of-thrones/got-edges.csv" as l \
    merge (:Character{name:l.Source}) merge (:Character{name:l.Target}) \
    with l \
    match (source:Character{name:l.Source}), (target:Character{name:l.Target}) \
    merge (source)-[r:KNOWS{weight:l.Weight}]->(target) \
    with 1 as dummy \
    match (:Character)-[:KNOWS*]->(:Character) \
    return count(1)',

    'load csv with headers from "https://raw.githubusercontent.com/melaniewalsh/sample-social-network-datasets/master/sample-datasets/game-of-thrones/got-edges.csv" as l \
    merge (source:Character{name:l.Source}) merge (target:Character{name:l.Target}) \
    merge (source)-[r:KNOWS{weight:l.Weight}]->(target) with 1 as dummy \
    match p=(:Character{name:"Salladhor"})-[*..5]-(:Character{name:"Petyr"}) \
    return count(1)',

    'create (n1:Node{name:"n1"})-[:CONNECTED]->(n2:Node{name:"n2"})-[:CONNECTED]->(n3:Node{name:"n3"}), \
    (n3)-[:CONNECTED]->(n4:Node{name:"n4"}) \
    create (n2)-[:CONNECTED]->(n5:Node{name:"n5"})-[:CONNECTED]->(n3) \
    match p=(:Node)-[:CONNECTED*]->(:Node) \
    return count(1)',

    'merge (a:Node{id:0}) merge (b:Node{id:1}) merge (a)-[r:TO]->(b) return r',

    'return tojson(\'{"a":1}\').a',

    'create (a:Node{id:0}) \
    create (b:Node{id:1}) \
    create (c:Node{id:2}) \
    create (d:Node{id:3}) \
    create (e:Node{id:4}) \
    create (a)-[:PARENT]->(b) \
    create (b)-[:PARENT]->(c) \
    create (d)-[:PARENT]->(e) \
    with 1 as dummy \
    match p=(:Node)-[:PARENT*]->(parent:Node) \
    where not((parent)-[:PARENT]->(:Node)) \
    unwind nodes(p) as node \
    return id(nodes(p)[0]) as leaf, collect(id(node)) as path',

    "CREATE (yoda:Contact {name: 'Yoda', email: 'yoda@lucasfilm.com'}) \
    CREATE (lukeskywalker:Contact {name: 'Luke Skywalker', email: 'luke.skywalker@lucasfilm.com'}) \
    CREATE (chewbacca:Contact {name: 'Chewbacca', email: 'chewbacca@lucasfilm.com'}) \
    CREATE (r2d2:Contact {name: 'R2D2', email: 'r2d2@lucasfilm.com'}) \
    CREATE (c3po:Contact {name: 'C3PO', email: 'c3po@lucasfilm.com'}) \
    CREATE (darthvader:Contact {name: 'Darth Vader', email: 'darth.vader@lucasfilm.com'}) \
    CREATE (princessleia:Contact {name: 'Princess Leia', email: 'princess.leia@lucasfilm.com'}) \
    CREATE (hansolo:Contact {name: 'Han Solo', email: 'han.solo@lucasfilm.com'}) \
    CREATE (obiwankenobi:Contact {name: 'Obi-Wan Kenobi', email: 'obi-wan.kenobi@lucasfilm.com'}) \
    CREATE (bobafett:Contact {name: 'Boba Fett', email: 'boba.fett@lucasfilm.com'}) \
    CREATE (jabbathehutt:Contact {name: 'Jabba the Hutt', email: 'jaba.the.hutt@lucasfilm.com'}) \
    CREATE (landocalrissian:Contact {name: 'Lando Calrissian', email: 'lando.calrissian@lucasfilm.com'}) \
    CREATE (darthmaul:Contact {name: 'Darth Maul', email: 'darth.maul@lucasfilm.com'}) \
    CREATE (emperorpalpatine:Contact {name: 'Emperor Palpatine', email: 'emperor.palpatine@lucasfilm.com'}) \
    CREATE (quigonjinn:Contact {name: 'Qui-Gon Jinn', email: 'qui-gon.jinn@lucasfilm.com'}) \
    CREATE (jarjarbinks:Contact {name: 'Jar Jar Binks', email: 'jarjar.binks@lucasfilm.com'}) \
    CREATE (macewindu:Contact {name: 'Mace Windu', email: 'mace.windu@lucasfilm.com'}) \
    CREATE (padmeamidala:Contact {name: 'Padme Amidala', email: 'padme.amidala@lucasfilm.com'}) \
    CREATE (countdooku:Contact {name: 'Count Dooku', email: 'count.dooku@lucasfilm.com'}) \
    CREATE (generalgrievous:Contact {name: 'General Grievous', email: 'general.grievous@lucasfilm.com'}) \
    CREATE (jangofett:Contact {name: 'Jango Fett', email: 'jango.fett@lucasfilm.com'}) \
    CREATE (anakinskywalker:Contact {name: 'Anakin Skywalker', email: 'anakin.skywalker@lucasfilm.com'}) \
    CREATE (darthsidious:Contact {name: 'Darth Sidious', email: 'darth.sidious@lucasfilm.com'}) \
    CREATE (darthtyranus:Contact {name: 'Darth Tyranus', email: 'darth.tyranus@lucasfilm.com'}) \
    CREATE (darthplagueis:Contact {name: 'Darth Plagueis', email: 'darth.plagueis@lucasfilm.com'}) \
    CREATE (darthbane:Contact {name: 'Darth Bane', email: 'darth.bane@lucasfilm.com'}) \
    CREATE (darthrevan:Contact {name: 'Darth Revan', email: 'darth.revan@lucasfilm.com'}) \
    CREATE (darthmalak:Contact {name: 'Darth Malak', email: 'darth.malak@lucasfilm.com'}) \
    CREATE (georgelucas:Contact {name: 'George Lucas', email: 'george.lucas@lucasfilm.com'}) \
    CREATE (lucasfilm:Company {name: 'Lucasfilm', email: 'lucasfilm@lucasfilm.com'}) \
    CREATE (jedis:Contact:Group {name: 'Jedis', email: 'jedis@lucasfilm.com', description: 'Jedis of Lucasfilm.'}) \
    CREATE (siths:Contact:Group {name: 'Siths', email: 'siths@lucasfilm.com', description: 'Siths of Lucasfilm.'}) \
    CREATE (directors:Contact:Group {name: 'Directors', email: 'directors@lucasfilm.com', description: 'Directors of Lucasfilm.'}) \
    CREATE (yoda)-[:PARENT_GROUP]->(jedis) \
    CREATE (lukeskywalker)-[:PARENT_GROUP]->(jedis) \
    CREATE (chewbacca)-[:PARENT_GROUP]->(jedis) \
    CREATE (r2d2)-[:PARENT_GROUP]->(jedis) \
    CREATE (c3po)-[:PARENT_GROUP]->(jedis) \
    CREATE (darthvader)-[:PARENT_GROUP]->(siths) \
    CREATE (princessleia)-[:PARENT_GROUP]->(jedis) \
    CREATE (hansolo)-[:PARENT_GROUP]->(jedis) \
    CREATE (obiwankenobi)-[:PARENT_GROUP]->(jedis) \
    CREATE (bobafett)-[:PARENT_GROUP]->(siths) \
    CREATE (jabbathehutt)-[:PARENT_GROUP]->(siths) \
    CREATE (landocalrissian)-[:PARENT_GROUP]->(jedis) \
    CREATE (darthmaul)-[:PARENT_GROUP]->(siths) \
    CREATE (emperorpalpatine)-[:PARENT_GROUP]->(siths) \
    CREATE (quigonjinn)-[:PARENT_GROUP]->(jedis) \
    CREATE (jarjarbinks)-[:PARENT_GROUP]->(jedis) \
    CREATE (macewindu)-[:PARENT_GROUP]->(jedis) \
    CREATE (padmeamidala)-[:PARENT_GROUP]->(jedis) \
    CREATE (countdooku)-[:PARENT_GROUP]->(siths) \
    CREATE (generalgrievous)-[:PARENT_GROUP]->(siths) \
    CREATE (jangofett)-[:PARENT_GROUP]->(siths) \
    CREATE (anakinskywalker)-[:PARENT_GROUP]->(jedis) \
    CREATE (darthsidious)-[:PARENT_GROUP]->(siths) \
    CREATE (darthtyranus)-[:PARENT_GROUP]->(siths) \
    CREATE (darthplagueis)-[:PARENT_GROUP]->(siths) \
    CREATE (darthbane)-[:PARENT_GROUP]->(siths) \
    CREATE (darthrevan)-[:PARENT_GROUP]->(siths) \
    CREATE (darthmalak)-[:PARENT_GROUP]->(siths) \
    CREATE (georgelucas)-[:PARENT_GROUP]->(directors) \
    CREATE (directors)-[:PARENT_GROUP]->(jedis) \
    match p=(:Contact)-[:PARENT_GROUP*]->(group:Contact) \
    where not((group)-[:PARENT_GROUP]->(:Contact)) \
    unwind nodes(p) as member \
    return nodes(p)[0].name as leaf, collect(member.name) as path",

    "unwind range(1,100) as i \
    create (n:Node{id:i}) \
    with collect(n) as nodes \
    where size(nodes) > 1 \
    unwind nodes as n1 \
    unwind nodes as n2 \
    with n1, n2 \
    where id(n1) < id(n2) \
    merge (n1)-[:TO]->(n2) \
    with count(1) as dummy \
    match (_n1)-[:TO]->(_n2) \
    return count(1)",

    "match (n1)-[r:TO]->(n2) \
    return count(1)",

    "with [[3,2,5,1,6]] as sets1, [[1,2,3,4,5]] as sets2 \
    unwind sets1 as set1 \
    with set1, size(set1) as size1 \
    return set1",

    "with range(0,9) as set1 \
    unwind set1 as item \
    with size(set1) as x \
    return *",

    "unwind range(0,5) as i \
    merge (n:Node{_id:i}) \
    with collect(n) as _nodes \
    unwind _nodes as n1 \
    unwind _nodes as n2 \
    merge (n1)-[:rel]->(n2) \
    return count(1)",

    "unwind [2,3] as len \
    unwind range(0, len) as i \
    with len, collect(i) as is \
    where size(is) < 3 \
    return is, size(is)"
];

async function run() {
    for(i=0; i<statements.length; i++) {
        await new Promise(async (resolve, reject) => {
            var statement = statements[i];
            
            await cypherTest.execute(
                statement,
                function(results) {
                    console.log();
                    console.log(statement);
                    console.log(JSON.stringify(results.graph));
                    console.log(JSON.stringify(results));
                    resolve();
                },
                function(error) {
                    console.log(error);
                    resolve();
                }
            );
        });
    }
    console.log();
}

run();