var Cypher = require("./Cypher.js").Cypher;

var cypherTest = new Cypher();

var statements0 = [
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
    return count(1) as cnt'
];

var statements1 = [
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
    return size(r)'
];

var statements2 = [
    'merge (:Node{ID:1})-[:TO]->(:Node{ID:2}) merge (:Node{ID:1})-[:TO]->(:Node{ID:3}) return count(1)',
    'merge (:Node{ID:1})-[:TO]->(:Node{ID:2}) merge (:Node{ID:1})-[:TO]->(:Node{ID:3}) return count(1)'
];

var statements3 = [
    'load csv with headers from "https://raw.githubusercontent.com/melaniewalsh/sample-social-network-datasets/master/sample-datasets/game-of-thrones/got-nodes.csv" as l \
    merge (c:Character{name:l.Id}) \
    return count(1)',
    'load csv with headers from "https://raw.githubusercontent.com/melaniewalsh/sample-social-network-datasets/master/sample-datasets/game-of-thrones/got-edges.csv" as l \
    match (source:Character{name:l.Source}), (target:Character{name:l.Target}) \
    merge (source)-[r:KNOWS{weight:l.Weight}]->(target) \
    return count(1)',
    'match (a:Character{name:"Edmure"})-[:KNOWS*]->(:Character) \
    return a.name, count(1)'
];

var statements4 = [
    'LOAD CSV WITH HEADERS FROM "https://niclasko.github.io/data/premier_league_2017_2018.csv" AS csvLine \
    merge (ht:SoccerTeam{name:csvLine.HomeTeam}) merge (at:SoccerTeam{name:csvLine.AwayTeam}) \
    with csvLine, ht, at \
    merge (ht)-[r:PLAYED{result:csvLine.FTR, home_goals: toInt(csvLine.FTHG), away_goals: toInt(csvLine.FTAG)}]->(at)',
    'match (:SoccerTeam)-[:PLAYED*]->(:SoccerTeam) \
    return count(1)'
];

var statements5 = [
    'load csv with headers from "https://raw.githubusercontent.com/melaniewalsh/sample-social-network-datasets/master/sample-datasets/game-of-thrones/got-edges.csv" as l \
    merge (:Character{name:l.Source}) merge (:Character{name:l.Target}) \
    with l \
    match (source:Character{name:l.Source}), (target:Character{name:l.Target}) \
    merge (source)-[r:KNOWS{weight:l.Weight}]->(target) \
    return count(1)',
    'return ()-[]->() as pattern'
];

var statements6 = [
    'create (:Node{text:"A"}) create (:Node{text:"B"}) create (:Node{text:"C"}) create (:Node{text:"C"})',
    'match (n) return count(distinct n.text), count(1), collect(distinct n.text), collect(n.text)'
];

var statements7 = [
    'unwind [{k:"a", v: 1}, {k:"b", v: 2}] as e return collect(distinct e)'
];

var statements7 = [
    'unwind ["a","a","b","b","c","d","a"] as e with barchart(e) as bc, {kiwi: 2} as k return bc.a, k.kiwi'
];

var statements8 = [
    'unwind range(1,10001) as e return barchart(round(rand()*10))'
];

var statements9 = [
    'unwind range(1,100001) as e \
    return histogram(round(rand()*1000), 6)'
];

var statements10 = [
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
    return p, collect(item.id) as item_path'
];

var statements11 = [
    'create (:A)-[:CONNECT]->(:B), \
            (:A)-[:CONNECT]->(:B) \
    match ()-[r]->() \
    with collect(r) as rels \
    unwind rels as rel \
    return startnode(rel), rel, endnode(rel)'
];

var statements12 = [
    'return case when 1=1 then 1 else 0 end'
];

var statements13 = [
    'with range(1,7) as faces \
    unwind faces as d1 \
    unwind faces as d2 \
    unwind faces as d3 \
    unwind faces as d4 \
    unwind faces as d5 \
    return d1, d2, d3, d4, d5 where d1 = d2 or d2 = d3'
];

var statements14 = [
    'with 1 as id, "niclas" as name insert into test \
    return id, name'
];

var statements15 = [
    'load json from \
        "http://localhost:5000/places" as l1 \
    with l1 limit 20 \
    load json from \
        "http://localhost:5000/places?" + l1.area as l2 \
    return count(1)'
];

var statements16 = [
    'load csv with headers from "https://raw.githubusercontent.com/melaniewalsh/sample-social-network-datasets/master/sample-datasets/game-of-thrones/got-edges.csv" as l \
    merge (:Character{name:l.Source}) merge (:Character{name:l.Target}) \
    with l \
    match (source:Character{name:l.Source}), (target:Character{name:l.Target}) \
    merge (source)-[r:KNOWS{weight:l.Weight}]->(target) \
    with 1 as dummy \
    match (:Character)-[:KNOWS*]->(:Character) \
    return count(1)'
];

var statements17 = [
    'load csv with headers from "https://raw.githubusercontent.com/melaniewalsh/sample-social-network-datasets/master/sample-datasets/game-of-thrones/got-edges.csv" as l \
    merge (source:Character{name:l.Source}) merge (target:Character{name:l.Target}) \
    merge (source)-[r:KNOWS{weight:l.Weight}]->(target) with 1 as dummy \
    match p=(:Character{name:"Salladhor"})-[*]-(:Character{name:"Petyr"}) \
    return count(1)'
];

var statements18 = [
    'create (n1:Node{name:"n1"})-[:CONNECTED]->(n2:Node{name:"n2"})-[:CONNECTED]->(n3:Node{name:"n3"}), \
    (n3)-[:CONNECTED]->(n4:Node{name:"n4"}) \
    create (n2)-[:CONNECTED]->(n5:Node{name:"n5"})-[:CONNECTED]->(n3) \
    match p=(:Node)-[:CONNECTED*]->(:Node) \
    return count(1)'
];

var statements19 = [
    'merge (a:Node{id:0}) merge (b:Node{id:1}) merge (a)-[r:TO]->(b) return r'
];

var statements = statements16;

console.log(statements16[0]);

function run(i) {
    if(i == statements.length) {
        return;
    }
    cypherTest.execute(
        statements[i],
        function(results) {
            console.log(JSON.stringify(results.graph));
            console.log(JSON.stringify(results));
            run(i+1);
        },
        function(error) {
            console.log(error);
        }
    );
}

run(0);