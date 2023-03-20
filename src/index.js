const breadCrumb = document.querySelector(".Breadcrumb");
const nodes = document.querySelector(".Nodes");
let currDir = [];

// todo: delete root goback btn
// todo: loading screen, state

function directFolder(item, goBack) {
  if (goBack) {
    currDir = currDir.slice(0, -1);
  } else {
    currDir.push({ id: item.id, name: item.name ? item.name : "root" });
    console.log(currDir);
  }
  console.log("DIRECTINGFOLDER WITH ", item, "goBack=", goBack);
  paintBreadCrumb();
  paintNodes(item ? item.id : null);
}

function addPrevIcon(parent) {
  const prevDiv = document.createElement("div");
  const prevIcon = document.createElement("img");
  prevIcon.className = "Node";
  prevIcon.src = "../assets/prev.png";
  prevDiv.appendChild(prevIcon);
  parent.appendChild(prevDiv);
  console.log(currDir);
  prevDiv.addEventListener("click", () => {
    directFolder(fetchDirectory(currDir[currDir.length - 2].id), true);
  });
}

function resetFolder(parentNode) {
  while (parentNode.firstChild) {
    parentNode.removeChild(parentNode.firstChild);
  }
  if (currDir.length !== 1) {
    addPrevIcon(parentNode);
  }
}

async function fetchDirectory(nodeId) {
  const nodes = document.querySelector(".nodes");
  resetFolder(nodes);
  try {
    const response = await fetch(
      `https://l9817xtkq3.execute-api.ap-northeast-2.amazonaws.com/dev/${
        nodeId ? nodeId : ""
      }`
    );

    if (!response.ok) {
      throw new Error("Server has error.");
    }
    return response.json();
  } catch (e) {
    throw new Error(`Something went wrong! ${e.message}`);
  }
}

async function openImgModal(id, filePath) {
  const modal = document.createElement("div");
  modal.className = "Modal ImageViewer";
  const imgBox = document.createElement("img");
  imgBox.src = `https://fe-dev-matching-2021-03-serverlessdeploymentbuck-1ooef0cg8h3vq.s3.ap-northeast-2.amazonaws.com/public${filePath}
    `;
  modal.appendChild(imgBox);
  nodes.appendChild(modal);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      modal.remove();
    }
  });

  setTimeout(() => {
    window.addEventListener("click", (event) => {
      if (event.target.className !== "Modal ImageViewer") {
        modal.remove();
      }
    });
  }, 0);
}

async function paintNodes(nodeId) {
  const getContents = await fetchDirectory(nodeId ? nodeId : null);
  getContents.map((item) => {
    if (item.type == "DIRECTORY") {
      const dirDiv = document.createElement("div");
      dirDiv.className = "Node";
      const dirIcon = document.createElement("img");
      dirIcon.src = "../assets/directory.png";
      const dirText = document.createElement("div");
      dirText.innerHTML = item.name;
      dirDiv.appendChild(dirIcon);
      dirDiv.append(dirText);
      dirDiv.addEventListener("click", () => directFolder(item));
      nodes.appendChild(dirDiv);
    } else if (item.type == "FILE") {
      const fileDiv = document.createElement("div");
      fileDiv.className = "Node";
      const fileIcon = document.createElement("img");
      fileIcon.src = "../assets/file.png";
      const fileText = document.createElement("div");
      fileText.innerHTML = item.name;
      fileDiv.appendChild(fileIcon);
      fileDiv.append(fileText);
      fileDiv.addEventListener("click", () =>
        openImgModal(item.id, item.filePath)
      );
      nodes.appendChild(fileDiv);
    }
  });
}

function resetBreadCrumb() {
  while (breadCrumb.firstChild) {
    breadCrumb.removeChild(breadCrumb.firstChild);
  }
}

async function paintBreadCrumb() {
  resetBreadCrumb();
  for (let i = 0; i < currDir.length; i++) {
    const dirDiv = document.createElement("div");
    dirDiv.innerHTML = currDir[i].name;
    breadCrumb.appendChild(dirDiv);
  }
}

window.onload = async () => {
  directFolder(await fetchDirectory(), false);
};
