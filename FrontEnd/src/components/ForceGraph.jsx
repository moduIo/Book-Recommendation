import * as d3 from "d3";
import * as React from "react";
// import ForceGraph2D from "react-force-graph";
import ForceGraph2D from "react-force-graph-2d";
import Modal from "@mui/material/Modal";
// import { ForceGraph2D, ForceGraph3D, ForceGraphVR, ForceGraphAR } from 'react-force-graph';

import axios from "axios";

const modeToBaseName = (mode) =>
  mode === "cbf" ? "Your Query" : "Selected User";

const graphify = (data, node) => {
  const nodes = data.map((e) => ({
    id: e.pandas_index,
    name: e.title,
    group: node.group + 1,
  }));
  const links = data.map((e) => ({ source: node.id, target: e.pandas_index }));
  return { nodes, links };
};

const merge = (graph1, graph2, nodeRC) => {
  const nodes =
    [...graph1.nodes, ...graph2.nodes.filter((e) => e.id !== nodeRC.id)] || [];
  const links = [
    ...new Set([
      ...graph1.links,
      ...graph2.links.filter((e) => e.source !== e.target),
    ]),
  ];
  const filtered_nodes = nodes.reduce((a, c) => {
    return a.map((e) => e.id).includes(c.id) ? a : [...a, c];
  }, []);
  return {
    // nodes: [...graph1.nodes, ...graph2.nodes.filter(e => e.id !== nodeRC.id)],
    nodes: filtered_nodes,
    links: links,
  };
};

const meltJson = (e) => {
  console.log(e)
  return Object.entries(e)
    .map((r) => r[1])
    .sort((r1, r2) => r1.score - r2.score);
};

export default function ForceGraph({ querySubmitted, data, mode }) {
  const baseName = modeToBaseName(mode);

  // graph with only base node on initial render
  const [nodeRC, setNodeRC] = React.useState({
    id: baseName,
    name: querySubmitted,
    group: 4,
  });
  const [graph, setGraph] = React.useState({ nodes: [nodeRC], links: [] });

  // on initial render, push data to graph
  React.useEffect(
    () =>
      setGraph(() => merge(graph, graphify(meltJson(data), nodeRC), nodeRC)),
    [],
  );

  // on change of nodeRC
  React.useEffect(() => {
    if (nodeRC.id !== baseName) {
      const data = fetchData(nodeRC.id);
    }
    console.log(data)
    setGraph(() => merge(graph, graphify(meltJson(data), nodeRC), nodeRC));
  }, [nodeRC]);

  const fetchData = async (q) => {
    return await axios.get(`http://127.0.0.1:5000/api/cbf_lib/${q}`);
  };

  const handleNodeRightClick = (e) => {
    if (e.id !== baseName) {
      setNodeRC(() => e);
    }
  };

  return (
    <>
      {Object.entries(graph).length === 0 ? (
        <></>
      ) : (
        <ForceGraph2D
          // populate graph and define canvas
          graphData={graph}
          nodeAutoColorBy="group"
          width={window.innerWidth / 2}
          height={(window.innerHeight * 3) / 5}
          backgroundColor="beige"
          linkDirectionalArrowLength={2}
          linkDirectionalArrowRelPos={1}
          // make particle animations
          linkDirectionalParticles={1}
          linkDirectionalParticleSpeed={0.01}
          // modify node appearance
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.id;
            const fontSize = 15 / globalScale;
            // ctx.font = `${fontSize}px Sans-Serif`;
            ctx.font = `${fontSize}px monospace`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(
              (n) => n + fontSize * 0.2,
            ); // some padding

            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y - bckgDimensions[1] / 2,
              ...bckgDimensions,
            );

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = node.color;
            ctx.fillText(label, node.x, node.y);

            node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
          }}
          // I seriously don't know what this does lol
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            const bckgDimensions = node.__bckgDimensions;
            bckgDimensions &&
              ctx.fillRect(
                node.x - bckgDimensions[0] / 2,
                node.y - bckgDimensions[1] / 2,
                ...bckgDimensions,
              );
          }}
          //
          onNodeRightClick={handleNodeRightClick}
        />
      )}
    </>
  );
}

// function generate_force_graph(recommendations) {
//   let links = [];
//   let nodes = {};
//   let width = window.innerWidth,
//     height = 800;
//
//   // compute the distinct nodes from the links.
//   for (let key in recommendations) {
//     links.push({
//       source:
//         nodes["query"] ||
//         (nodes["query"] = {
//           name: recommendations["query"].title,
//           pandas_index: -1,
//         }),
//       target:
//         nodes[key] ||
//         (nodes[key] = {
//           name: recommendations[key].title,
//           pandas_index: recommendations[key].pandas_index,
//         }),
//       distance: recommendations[key].score,
//     });
//   }
//
//   let force = d3
//     .forceSimulation()
//     .nodes(d3.values(nodes))
//     .force(
//       "link",
//       d3.forceLink(links).distance(function (link) {
//         return 2.325 ** link.distance;
//       }),
//     )
//     .force("center", d3.forceCenter(width / 2, height / 2))
//     .force("x", d3.forceX())
//     .force("y", d3.forceY())
//     .force(
//       "charge",
//       d3
//         .forceManyBody()
//         .strength(-300)
//         .distanceMax(2 ** 8),
//     )
//     .alphaTarget(0.01)
//     .on("tick", tick);
//
//   let svg = d3
//     .select("body")
//     .append("svg")
//     .attr("id", "force_graph")
//     .attr("width", width)
//     .attr("height", height);
//
//   // add the links
//   let path = svg
//     .append("g")
//     .selectAll("path")
//     .data(links)
//     .enter()
//     .append("path")
//     .attr("id", function (d) {
//       return "similar";
//     })
//     .attr("class", function (d) {
//       return "link " + d.type;
//     });
//
//   // define the nodes
//   let node = svg
//     .selectAll(".node")
//     .data(force.nodes())
//     .enter()
//     .append("g")
//     .attr("class", function (d) {
//       if (d.index == Object.keys(recommendations).length - 1) {
//         return "query node";
//       }
//       return `node-${d.pandas_index}`;
//     })
//     .call(
//       d3
//         .drag()
//         .on("start", dragstarted)
//         .on("drag", dragged)
//         .on("end", dragended),
//     );
//
//   // add the nodes
//   node
//     .append("circle")
//     .attr("id", function (d) {
//       return d.name.replace(/\s+/g, "").toLowerCase();
//     })
//     .attr("r", function (d) {
//       return 10;
//     })
//     .attr("fill", function (d) {
//       if (d.weight > 5) {
//         return "#2b8cbe";
//       } else if (d.weight > 3) {
//         return "#a6bddb";
//       } else {
//         return "#ece7f2";
//       }
//     });
//
//   node
//     .append("text")
//     .attr("id", "title")
//     .text(function (d) {
//       return `___ ${d.name}`;
//     });
//
//   node.on("dblclick", function (d) {
//     d.fx = null;
//     d.fy = null;
//
//     if (d.weight > 5) {
//       d3.select(this).select("circle").attr("fill", "#2b8cbe");
//     } else if (d.weight > 3) {
//       d3.select(this).select("circle").attr("fill", "#a6bddb");
//     } else {
//       d3.select(this).select("circle").attr("fill", "#ece7f2");
//     }
//
//     const url = `http://localhost:5000/recommend_from_library/${d.pandas_index}`;
//     fetch(url)
//       .then((response) => response.json())
//       .then((json) => {
//         json["query"] = {
//           score: 0,
//           title: d.name,
//           pandas_index: d.pandas_index,
//         };
//         expand_force_graph(json, recommendations);
//       });
//   });
//
//   // add the curvy lines
//   function tick() {
//     path.attr("d", function (d) {
//       var dx = d.target.x - d.source.x,
//         dy = d.target.y - d.source.y,
//         dr = Math.sqrt(dx * dx + dy * dy);
//       return (
//         "M" +
//         d.source.x +
//         "," +
//         d.source.y +
//         "A" +
//         dr +
//         "," +
//         dr +
//         " 0 0,1 " +
//         d.target.x +
//         "," +
//         d.target.y
//       );
//     });
//
//     node.attr("transform", function (d) {
//       return "translate(" + d.x + "," + d.y + ")";
//     });
//   }
//
//   function dragstarted(d) {
//     if (!d3.event.active) force.alphaTarget(0.3).restart();
//     d.fx = d.x;
//     d.fy = d.y;
//   }
//
//   function dragged(d) {
//     d.fx = d3.event.x;
//     d.fy = d3.event.y;
//   }
//
//   function dragended(d) {
//     if (!d3.event.active) force.alphaTarget(0);
//     d.fixed = true;
//     if (d.fixed == true) {
//       d.fx = d.x;
//       d.fy = d.y;
//       d3.select(this).select("circle").attr("fill", "#e127f2");
//     } else {
//       d.fx = null;
//       d.fy = null;
//     }
//   }
// }
//
// function expand_force_graph(new_recommendations, old_recommendations) {
//   let links = [];
//   let nodes = {};
//   let width = window.innerWidth,
//     height = 800;
//
//   // Remove old graph
//   let element = document.getElementById("force_graph");
//
//   if (element != null) {
//     element.remove();
//   }
//
//   // compute the distinct nodes from the links.
//   for (let key in old_recommendations) {
//     links.push({
//       source:
//         nodes["query"] ||
//         (nodes["query"] = {
//           name: old_recommendations["query"].title,
//           pandas_index: -1,
//         }),
//       target:
//         nodes[key] ||
//         (nodes[key] = {
//           name: old_recommendations[key].title,
//           pandas_index: old_recommendations[key].pandas_index,
//         }),
//       distance: old_recommendations[key].score,
//     });
//   }
//
//   // Find the new query node in the old query results
//   let query_key = -1;
//   for (let key in nodes) {
//     if (nodes[key].name == new_recommendations["query"].title) {
//       query_key = key;
//     }
//   }
//
//   let offset = Object.keys(old_recommendations).length;
//   for (let key in new_recommendations) {
//     if (key != "query") {
//       links.push({
//         source: nodes[query_key],
//         target:
//           nodes[key + offset] ||
//           (nodes[key + offset] = {
//             name: new_recommendations[key].title,
//             pandas_index: new_recommendations[key].pandas_index,
//           }),
//         distance:
//           new_recommendations[key].score + new_recommendations["query"].score,
//       });
//     }
//   }
//
//   // merge the recommendations into 1
//   delete new_recommendations["query"]; // Remove the current query
//   let recommendations = {};
//   let i = 0;
//
//   for (let key in old_recommendations) {
//     if (key == "query") {
//       recommendations["query"] = old_recommendations[key];
//     } else {
//       recommendations[i] = old_recommendations[key];
//       i += 1;
//     }
//   }
//
//   for (let key in new_recommendations) {
//     recommendations[i] = new_recommendations[key];
//     i += 1;
//   }
//
//   let force = d3
//     .forceSimulation()
//     .nodes(d3.values(nodes))
//     .force(
//       "link",
//       d3.forceLink(links).distance(function (link) {
//         return 2.5 ** link.distance;
//       }),
//     )
//     .force("center", d3.forceCenter(width / 2, height / 2))
//     .force("x", d3.forceX())
//     .force("y", d3.forceY())
//     .force(
//       "charge",
//       d3
//         .forceManyBody()
//         .strength(-300)
//         .distanceMax(2 ** 8),
//     )
//     .alphaTarget(0.01)
//     .on("tick", tick);
//
//   let svg = d3
//     .select("body")
//     .append("svg")
//     .attr("id", "force_graph")
//     .attr("width", width)
//     .attr("height", height);
//
//   // add the links
//   let path = svg
//     .append("g")
//     .selectAll("path")
//     .data(links)
//     .enter()
//     .append("path")
//     .attr("id", function (d) {
//       return "similar";
//     })
//     .attr("class", function (d) {
//       return "link " + d.type;
//     });
//
//   // define the nodes
//   let node = svg
//     .selectAll(".node")
//     .data(force.nodes())
//     .enter()
//     .append("g")
//     .attr("class", function (d) {
//       if (d.index == Object.keys(recommendations).length - 1) {
//         return "query node";
//       }
//       return `node-${d.pandas_index}`;
//     })
//     .call(
//       d3
//         .drag()
//         .on("start", dragstarted)
//         .on("drag", dragged)
//         .on("end", dragended),
//     );
//
//   // add the nodes
//   node
//     .append("circle")
//     .attr("id", function (d) {
//       return d.name.replace(/\s+/g, "").toLowerCase();
//     })
//     .attr("r", function (d) {
//       return 10;
//     })
//     .attr("fill", function (d) {
//       if (d.weight > 5) {
//         return "#2b8cbe";
//       } else if (d.weight > 3) {
//         return "#a6bddb";
//       } else {
//         return "#ece7f2";
//       }
//     });
//
//   node
//     .append("text")
//     .attr("id", "title")
//     .text(function (d) {
//       return `___ ${d.name}`;
//     });
//
//   node.on("dblclick", function (d) {
//     d.fx = null;
//     d.fy = null;
//
//     if (d.weight > 5) {
//       d3.select(this).select("circle").attr("fill", "#2b8cbe");
//     } else if (d.weight > 3) {
//       d3.select(this).select("circle").attr("fill", "#a6bddb");
//     } else {
//       d3.select(this).select("circle").attr("fill", "#ece7f2");
//     }
//
//     const url = `http://localhost:5000/recommend_from_library/${d.pandas_index}`;
//     fetch(url)
//       .then((response) => response.json())
//       .then((json) => {
//         json["query"] = {
//           score: 0,
//           title: d.name,
//           pandas_index: d.pandas_index,
//         };
//         expand_force_graph(json, recommendations);
//       });
//   });
//
//   // add the curvy lines
//   function tick() {
//     path.attr("d", function (d) {
//       var dx = d.target.x - d.source.x,
//         dy = d.target.y - d.source.y,
//         dr = Math.sqrt(dx * dx + dy * dy);
//       return (
//         "M" +
//         d.source.x +
//         "," +
//         d.source.y +
//         "A" +
//         dr +
//         "," +
//         dr +
//         " 0 0,1 " +
//         d.target.x +
//         "," +
//         d.target.y
//       );
//     });
//
//     node.attr("transform", function (d) {
//       return "translate(" + d.x + "," + d.y + ")";
//     });
//   }
//
//   function dragstarted(d) {
//     if (!d3.event.active) force.alphaTarget(0.3).restart();
//     d.fx = d.x;
//     d.fy = d.y;
//   }
//
//   function dragged(d) {
//     d.fx = d3.event.x;
//     d.fy = d3.event.y;
//   }
//
//   function dragended(d) {
//     if (!d3.event.active) force.alphaTarget(0);
//     d.fixed = true;
//     if (d.fixed == true) {
//       d.fx = d.x;
//       d.fy = d.y;
//       d3.select(this).select("circle").attr("fill", "#e127f2");
//     } else {
//       d.fx = null;
//       d.fy = null;
//     }
//   }
// }
