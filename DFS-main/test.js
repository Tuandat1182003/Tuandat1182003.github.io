let stopFlag = false;
let listQ = [];
let listL = [];

//graph for dfs
class GraphDfs {
  constructor() {
    this.adjacencyList = {};
    this.tableResult = [];
  }

  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
  }

  addEdge(vertex1, vertex2) {
    this.adjacencyList[vertex1].push(vertex2);
  }

  findPath(startVertex, endVertex) {
    const visited = {};
    const path = [];

    const dfsHelper = (vertex) => {
      if (!vertex) return null;
      visited[vertex] = true;
      path.push(vertex);

      if (vertex === endVertex) {
        return path;
      }

      for (const neighbor of this.adjacencyList[vertex]) {
        if (!visited[neighbor]) {
          const newPath = dfsHelper(neighbor);
          if (newPath) return newPath;
        }
      }

      path.pop();
    };

    // path
    const pathArr = dfsHelper(startVertex);
    return pathArr.join("->");
  }

  createTable = (node, end, visited = {}) => {
    if (!visited[node] && !stopFlag) {
      visited[node] = true;
      const adjacencyList = graphDfs.adjacencyList[node];

      if (Array.isArray(adjacencyList)) {
        const uniqueListQ = [...new Set([node, ...adjacencyList, ...listQ])];
        const uniqueListL = [...new Set([...adjacencyList, ...listL])];

        listQ = uniqueListQ;
        listL = uniqueListL;

        for (let i = 0; i < listL.length; i++) {
          if (listL[i] === node) {
            listL.splice(i, 1);
          }
        }

        this.tableResult.push({
          expandedNode: node,
          adjacencyList: adjacencyList.join(", "),
          listQ: listQ.join(", "),
          listL: listL.join(", "),
        });

        if (node === end) {
          stopFlag = true;
          return;
        }

        adjacencyList.forEach((neighbor) => {
          listL.push(neighbor);
          this.createTable(neighbor, end, visited);
        });
      }
    }
  };

  drawTable = () => {
    const table = document.getElementById("resultTable");
    const tableBody = document.getElementById("tableBody");
    const container = document.querySelector(".container");

    table.style.display = "block";
    container.style.justifyContent = "space-around";
    this.tableResult.forEach((row) => {
      const newRow = document.createElement("tr");

      const expandedNodeCell = document.createElement("td");
      expandedNodeCell.textContent = row.expandedNode;
      newRow.appendChild(expandedNodeCell);

      const adjacencyListCell = document.createElement("td");
      adjacencyListCell.textContent = row.adjacencyList;
      newRow.appendChild(adjacencyListCell);

      const listQCell = document.createElement("td");
      listQCell.textContent = row.listQ;
      newRow.appendChild(listQCell);

      const listLCell = document.createElement("td");
      listLCell.textContent = row.listL;
      newRow.appendChild(listLCell);
      tableBody.appendChild(newRow);
    });

    let lastRow = tableBody.children[tableBody.children.length - 1];
    for (let i = 0; i < lastRow.children.length; i++) {
      let col = lastRow.children[i];
      if (i > 0) {
        col.innerHTML = "(Stop)";
      }
    }
  };

  drawGraph = (list) => {
    // Parse edges to extract unique nodes
    const edges = list.map((edge) => {
      edge = edge.replace(/\r$/, "");
      const [source, target] = edge.split("-");
      return { source, target };
    });

    const nodes = Array.from(
      new Set(edges.flatMap((edge) => [edge.source, edge.target]))
    ).map((node) => ({ id: node }));

    // Order nodes alphabetically
    nodes.sort((a, b) => a.id.localeCompare(b.id));

    // Create an SVG container
    const svg = d3.select("svg");

    // Create links
    const links = svg
      .selectAll(".link")
      .data(edges)
      .enter()
      .append("line")
      .attr("class", "link");

    // Create nodes
    const nodeElements = svg
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 15);

    // Create labels for nodes (sorted)
    const labels = svg
      .selectAll(".label")
      .data(nodes)
      .enter()
      .append("text")
      .attr("class", "label")
      .text((d) => d.id);

    // Initialize the D3 force-directed graph simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(edges)
          .id((d) => d.id)
          .distance(100)
      ) // Set link distance
      .force("charge", d3.forceManyBody().strength(-300)) // Increase repulsive force
      .force("center", d3.forceCenter(window.innerWidth / 2, 200));

    // Update node and link positions during simulation
    simulation.on("tick", () => {
      links
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      nodeElements.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });

    let getGraph = document.querySelector(".graph");
    getGraph.style.display = "block";
  };
}

//graph for hill climb
class GraphHillClimbing {
    constructor() {
      this.edges = [];
      this.nodes = new Set();
    }
  
    // Method to add an edge to the graph with weight
    addEdge(source, target, weight) {
      this.edges.push({ source, target, weight });
      this.nodes.add(source);
      this.nodes.add(target);
    }

    findPath(start, end) {
        let currentNode = start;
        let path = [currentNode];
        let totalCost = 0;
    
        while (currentNode !== end) {
          let neighbors = this.edges.filter((edge) => edge.source === currentNode);
          if (neighbors.length === 0) return "No path found";
    
          let nextNode = null;
          let minCost = Infinity;
    
          for (let neighbor of neighbors) {
            if (neighbor.weight < minCost) {
              minCost = neighbor.weight;
              nextNode = neighbor.target;
            }
          }
    
          if (nextNode === null) return "No path found";
    
          currentNode = nextNode;
          path.push(currentNode);
          totalCost += minCost;
        }
    
        return { path: path.join("->"), totalCost };
      }
    
    // Method to draw the graph
    drawGraph = () => {
        const svg = d3.select("svg");
    
        // Draw edges with weights
        this.edges.forEach((edge) => {
          const sourceNode = edge.source;
          const targetNode = edge.target;
          const weight = edge.weight;
    
          // Find coordinates of source and target nodes
          const sourceIndex = Array.from(this.nodes).indexOf(sourceNode);
          const targetIndex = Array.from(this.nodes).indexOf(targetNode);
          const sourceX = 50 + sourceIndex * 150; // Adjust x position based on node index
          const targetX = 50 + targetIndex * 150; // Adjust x position based on node index
          const sourceY = 100;
          const targetY = 300;
    
          // Draw the edge
          svg.append("line")
            .attr("x1", sourceX)
            .attr("y1", sourceY)
            .attr("x2", targetX)
            .attr("y2", targetY)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    
          // Draw the weight label
          const labelX = (sourceX + targetX) / 2;
          const labelY = (sourceY + targetY) / 2;
          svg.append("text")
            .attr("x", labelX)
            .attr("y", labelY)
            .text(weight)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "black");
        });
    
        // Draw nodes
        this.nodes.forEach((node, index) => {
          const x = 50 + index * 150; // Adjust x position based on node index
          const y = 100;
          svg.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 15)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    
          // Draw node label
          svg.append("text")
            .attr("x", x)
            .attr("y", y)
            .text(node)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "black");
        });
    
        let getGraph = document.querySelector(".graph");
        getGraph.style.display = "block";
      };
    
}
//graph for branch and bound

const graphDfs = new GraphDfs(); 
const graphHillClimbing = new GraphHillClimbing();

//handle event
const refreshBtn = document.getElementById("btn-refresh");
const resultBtn = document.getElementById("btn-result");
const exportBtn = document.getElementById("btn-export");

let currentAlgorithm = "dfs";

const handleChangeFile = (e) => {
  const fileInput = document.getElementById("fileInput");
  if (fileInput.files[0]) {
    const fileIcon = document.querySelector(".fa-upload");
    const fileLabel = document.querySelector(".file-text");
    fileIcon.className = "fa-solid fa-check";
    fileLabel.textContent = fileInput.files[0].name;
  } else {
    if (document.querySelector(".fa-check")) {
      const fileIcon = document.querySelector(".fa-check");
      const fileLabel = document.querySelector(".file-text");
      fileIcon.className = "fa-solid fa-upload";
      fileLabel.innerHTML = `<span class="highlight-text">Drag</span> & <span
      class="highlight-text">drop</span> any file here`;
    }
  }
};

const handleRemoveFile = () => {
  const fileInput = document.getElementById("fileInput");
  fileInput.value = "";
  handleChangeFile();
};

const buttonClicked = (btn) => {
  const btns = document.querySelectorAll(".algos-item");
  const title = document.querySelector(".title");

  for (let i = 0; i < btns.length; i++) {
    if (currentAlgorithm !== btn.dataset.math) {
      handleRemoveFile();
    }
    if (btn === btns[i]) {
      currentAlgorithm = btns[i].dataset.math;
      let currentAlgorithmTitle = btns[i].dataset.title;

      title.textContent = currentAlgorithmTitle;

      if (!btns[i].classList.contains("active")) {
        btns[i].classList.add("active");
      } else {
        break;
      }
    } else {
      btns[i].classList.remove("active");
      const getGraph = document.querySelector(".graph");
      getGraph.style.display = "none";
    }
  }
};

refreshBtn.addEventListener("click", () => {
  location.reload();
});

exportBtn.addEventListener("click", () => {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files[0]) {
    alert("Please choose 1 file. No file chosen now!");
  } else {
    //handle logic algorithm
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      const lines = content.split("\n");

      switch (currentAlgorithm) {
        case "dfs":
          const verticesArr = lines[0].split(", ");
          const edgesArr = lines[1].split(", ");
          const startEnd = lines[2].split(" ");
          const start = startEnd[0];
          const end = startEnd[1];

          for (let i = 0; i < verticesArr.length; i++) {
            verticesArr[i] = verticesArr[i].replace(/\r$/, "");
            graphDfs.addVertex(verticesArr[i]);
          }

          for (let i = 0; i < edgesArr.length; i++) {
            edgesArr[i] = edgesArr[i].replace(/\r$/, "");
            let singleVerticeInEdges = edgesArr[i].split("-");
            graphDfs.addEdge(singleVerticeInEdges[0], singleVerticeInEdges[1]);
          }

          graphDfs.createTable(start, end);
          graphDfs.drawTable();

          const table = document.getElementById("resultTable");
          const rows = Array.from(table.rows).map((row) =>
            Array.from(row.cells)
              .map((cell) => padRight(cell.textContent, 20))
              .join("")
          );
          const blob = new Blob(
            [rows.join("\n"), `\n\n\nPath: ${graphDfs.findPath(start, end)}`],
            { type: "text/plain" }
          );
          const downloadLink = document.createElement("a");
          if (window.URL && window.URL.createObjectURL) {
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = fileInput.files[0].name;
          } else {
            console.error(
              "URL.createObjectURL is not supported in this environment."
            );
            return;
          }

          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          break;
        case "hillClimb":
          const verticesEdges = lines[0].split(", ");
          const edges = lines[1].split(", ");
          const weights = lines[2].split(", ").map(item => {
            const [vertex, weight] = item.split(": ");
            return { vertex, weight: parseInt(weight) };
          });
          const startEnd2 = lines[3].split("-");
          const start2 = startEnd2[0];
          const end2 = startEnd2[1];

          // Thêm đỉnh vào đồ thị
          verticesEdges.forEach(vertex => {
            graphHillClimbing.addVertex(vertex);
          });

          // Thêm cạnh với trọng số vào đồ thị
          edges.forEach(edge => {
            const [source, target] = edge.split("-");
            const weightStart = edge.indexOf(":") + 2; // Tìm vị trí bắt đầu của trọng số trong dòng
            const weightEnd = edge.indexOf(",") > -1 ? edge.indexOf(",") : edge.length; // Tìm vị trí kết thúc của trọng số trong dòng
            const weight = parseInt(edge.substring(weightStart, weightEnd)); // Trích xuất và chuyển đổi trọng số thành số nguyên
            graphHillClimbing.addEdge(source, target, weight);
        });

          graphHillClimbing.createTable(start2, end2);
          graphHillClimbing.drawTable();

          const table2 = document.getElementById("resultTable");
          const rows2 = Array.from(table2.rows2).map(row =>
            Array.from(row.cells)
              .map(cell => padRight(cell.textContent, 20))
              .join("")
          );

          const path = graphHillClimbing.findPath(start2, end2);
          const blob2 = new Blob(
            [rows2.join("\n"), `\n\n\nPath: ${path}`],
            { type: "text/plain" }
          );
          const downloadLink2 = document.createElement("a");
          if (window.URL && window.URL.createObjectURL) {
            downloadLink2.href = window.URL.createObjectURL(blob2);
            downloadLink2.download = fileInput.files[0].name;
          } else {
            console.error(
              "URL.createObjectURL is not supported in this environment."
            );
            return;
          }

          document.body.appendChild(downloadLink2);
          downloadLink2.click();
          document.body.removeChild(downloadLink2);
        break;
        case "branchBound":
          break;
      }
    };
    reader.readAsText(fileInput.files[0]);
  }
});

resultBtn.addEventListener("click", () => {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files[0]) {
    alert("Please choose 1 file. No file chosen now!");
  } else {
    if (!fileInput.files[0]) {
      alert("Please choose 1 file. No file chosen now!");
    } else {
      //handle logic algorithm
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        const lines = content.split("\n");

        switch (currentAlgorithm) {
          case "dfs":
            const edgesArr = lines[1].split(", ");
            graphDfs.drawGraph(edgesArr);
            break;
          case "hillClimb":
            const weights = lines[2].split(", ").map(item => {
                const [vertex, weight] = item.split(": ");
                return { vertex, weight: parseInt(weight) };
            });
            break;
          case "branchBound":
            break;
        }
      };
      reader.readAsText(fileInput.files[0]);
      scrollToGraph();
    }
  }
});

// Helpers function
function padRight(str, length) {
  return (str + " ".repeat(length)).slice(0, length);
}

function scrollToGraph() {
  $(document).ready(function () {
    $("html, body").animate(
      {
        scrollTop: $("#end").offset().top,
      },
      500
    );
  });
}

