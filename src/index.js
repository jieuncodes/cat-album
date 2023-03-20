const breadCrumb = document.querySelector(".Breadcrumb");
const nodes = document.querySelector(".Nodes");
let currDir = [];

async function directFolder(item) {
    await paintNodes(item.id);
    await paintBreadCrumb(item.name);
}

function resetFolder(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  const prevDiv = document.createElement("div");
  const prevIcon = document.createElement("img");
  prevIcon.className = "Node";
  prevIcon.src = "../assets/prev.png";
  prevDiv.appendChild(prevIcon);
  parent.appendChild(prevDiv);
  prevDiv.addEventListener("click", () => {
    currDir.slice(-1);
  });
}

async function fetchDirectory(nodeId) {
  const nodes = document.querySelector(".nodes");
  resetFolder(nodes);
  const response = await fetch(
    `https://l9817xtkq3.execute-api.ap-northeast-2.amazonaws.com/dev/${nodeId}`
  );

  if (response.status >= 200 && response.status <= 299) {
    return response.json();
  } else {
    console.log(response.status, response.statusText);
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
        console.log(event.currentTarget)
        console.log("PRENT", event.currentTarget.className);
        console.log("moidal", modal);
      if (event.currentTarget.className !== "Modal ImageViewer") {
        modal.remove();
      }
    });
  }, 0);
}

async function paintNodes(nodeId) {
  const getContents = await fetchDirectory(nodeId);
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

async function resetBreadCrumb() {
  while (breadCrumb.firstChild) {
    breadCrumb.removeChild(breadCrumb.firstChild);
  }
}

async function paintBreadCrumb(dir) {
  await resetBreadCrumb();
  currDir.push(dir);
  for (let i = 0; i < currDir.length; i++) {
    const dirDiv = document.createElement("div");
    dirDiv.innerHTML = currDir[i];
    breadCrumb.appendChild(dirDiv);
  }
}

window.onload = () => {
  paintBreadCrumb("root");
  paintNodes("");
};
