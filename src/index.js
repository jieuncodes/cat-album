const nodes = document.querySelector(".Nodes");
const breadCrumb = document.querySelector(".Breadcrumb");
const dataCache = {};
let currDir = [];
let isLoadingContent = false;


async function directFolder(item, goBack) {
  if (goBack) {
    currDir = currDir.slice(0, goBack);
  } else {
    currDir.push({ id: item.id ? item.id : "-1", name: item.name ? item.name : "root" });
  }

  await paintBreadCrumb();
  await paintNodes(item ? item.id : null);
  return;
}

function addPrevIcon(parent) {
  const prevDiv = document.createElement("div");
  const prevIcon = document.createElement("img");
  prevIcon.className = "Node";
  prevIcon.src = "../assets/prev.png";
  prevDiv.appendChild(prevIcon);
  parent.appendChild(prevDiv);
  prevDiv.addEventListener("click", () => {
    directFolder(fetchDirectory(currDir[currDir.length - 2].id), -1);
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

  if (dataCache[nodeId || "root"]){
    return dataCache[nodeId || "root"];
  };

  try {
    const response = await fetch(
      `https://l9817xtkq3.execute-api.ap-northeast-2.amazonaws.com/dev/${
        nodeId ? nodeId : ""
      }`
    );

    if (!response.ok) {
      throw new Error("Server has error.");
    }
    const data = await response.json();
    dataCache[nodeId || "root"] = data;
    return data;

  } catch (error) {
    isLoading(false);
    throw new Error(`Something went wrong! ${error.message}`);
  }
}

function closeModal(event) {
  if (event.target.parentNode.className !== "content") {
    event.target.remove();
    window.removeEventListener("click", closeModal);
  }
}

async function openImgModal(id, filePath) {
  const modal = document.createElement("div");
  const modalContainer = document.createElement("div");
  modalContainer.className = "content";
  modal.className = "Modal ImageViewer";
  const imgBox = document.createElement("img");
  imgBox.src = `https://fe-dev-matching-2021-03-serverlessdeploymentbuck-1ooef0cg8h3vq.s3.ap-northeast-2.amazonaws.com/public${filePath}
    `;
  modalContainer.appendChild(imgBox);
  modal.appendChild(modalContainer);
  nodes.appendChild(modal);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      modal.remove();
    }
  });
  setTimeout(() => {
    window.addEventListener("click", closeModal);
  }, 0);
}

function createNodeElement(item) {
  const nodeDiv = document.createElement("div");
  nodeDiv.className = "Node";
  const nodeIcon = document.createElement("img");
  nodeIcon.src = `../assets/${item.type.toLowerCase()}.png`;
  const nodeText = document.createElement("div");
  nodeText.innerHTML = item.name;
  nodeDiv.appendChild(nodeIcon);
  nodeDiv.append(nodeText);
  nodes.appendChild(nodeDiv);

  if (item.type === "DIRECTORY"){
    nodeDiv.addEventListener("click", () => {if(!isLoadingContent) directFolder(item)});
  } else if (item.type === "FILE") { 
    nodeDiv.addEventListener("click", () =>{
      if(!isLoadingContent) openImgModal(item.id, item.filePath)
    }
      );
  }
  return nodeDiv;
}

async function isLoading(state){
  isLoadingContent = state;
  if (state == true){
    const app = document.querySelector(".App");
    const loadingModal = document.createElement("div");
    const content = document.createElement("div");
    const loadingImg = document.createElement("img");
    loadingModal.className = "Modal Loading";
    content.className = "content";
    loadingImg.src = "../assets/nyan-cat.gif";
    content.appendChild(loadingImg);
    loadingModal.appendChild(content);
    app.appendChild(loadingModal);
  } else {
    const loadingModal = document.querySelector(".Loading");
    if (loadingModal !== null){
      loadingModal.remove();
    }
  }
}

async function paintNodes(nodeId) {
  await isLoading(true);
  const getContents = await fetchDirectory(nodeId ? nodeId : null);
  getContents.map((item) => {
    createNodeElement(item);
  });
  await isLoading(false);
}

async function resetBreadCrumb() {
  while (breadCrumb.firstChild) {
    breadCrumb.removeChild(breadCrumb.firstChild);
  }
  return;
}
async function handleBreadCrumbClick(event) {
  if(isLoadingContent) return;
  const clickedCrumbId = event.target.className;
  if (clickedCrumbId == currDir[currDir.length -1].id){
    return;
  }
  const item = currDir.find((item) => item.id === clickedCrumbId);
  const indexInCrumb = currDir.findIndex((item) => item.id === clickedCrumbId);

  await directFolder(item, -(currDir.length - indexInCrumb)+1);
}

function createBreadCrumbElement(id, name) {
  
  const dirDiv = document.createElement("div");
  dirDiv.className = id;
  dirDiv.innerHTML = name;
  breadCrumb.appendChild(dirDiv);
  dirDiv.addEventListener("click", handleBreadCrumbClick);
  return dirDiv;
}

async function paintBreadCrumb() {
  await resetBreadCrumb();
  for (let i = 0; i < currDir.length; i++) {
    createBreadCrumbElement(currDir[i].id, currDir[i].name);
  }
};

window.onload = async () => {
  directFolder(await fetchDirectory(), false);
};
