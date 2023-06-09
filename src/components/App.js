import BreadCrumb from "./BreadCrumb.js";
import ImageView from "./Imageview.js";
import Loading from "./Loading.js";
import Nodes from "./Nodes.js";
import { request } from "../api/api.js";

const cache = {};

function handleBreadCrumbClick(index) {
  if (index === null) {
    this.setState({
      ...this.state,
      depth: [],
      isRoot: true,
      nodes: cache.rootNodes,
    });
    return;
  }

  if (index === this.state.depth.length - 1) {
    return;
  }

  const nextState = { ...this.state };
  const nextDepth = this.state.depth.slice(0, index + 1);

  this.setState({
    ...nextState,
    depth: nextDepth,
    nodes: cache[nextDepth[nextDepth.length - 1].id],
  });
}

async function handleNodesClick(node) {
  try {
    this.setState({
      ...this.state,
      isLoading: true,
    });
    if (node.type === "DIRECTORY") {
      if (cache[node.id]) {
        this.setState({
          ...this.state,
          // BreadCrumb 관련 처리를 이곳에서 함으로써 Nodes 컴포넌트는 BreadCrumb 컴포넌트를 몰라도된다
          depth: [...this.state.depth, node],
          nodes: cache[node.id],
          isLoading: false,
        });
      } else {
        const nextNodes = await request(node.id);
        this.setState({
          ...this.state,
          isRoot: false,
          depth: [...this.state.depth, node],
          nodes: nextNodes,
          isLoading: false,
        });
        cache[node.id] = nextNodes;
      }
    } else if (node.type === "FILE") {
      this.setState({
        ...this.state,
        isRoot: false,
        selectedFilePath: node.filePath,
        isLoading: false,
      });
    }
  } catch {
    console.log("ERROR!");
  }
}

async function handleBackClick() {
  try {
    const nextState = { ...this.state };
    nextState.depth.pop();

    const prevNodeId =
      nextState.depth.length === 0
        ? null
        : nextState.depth[nextState.depth.length - 1].id;

    this.setState({
      ...nextState,
    });

    if (prevNodeId === null) {
      this.setState({
        ...nextState,
        isRoot: true,
        nodes: cache.rootNodes,
      });
    } else {
      this.setState({
        ...nextState,
        isRoot: false,
        nodes: cache[prevNodeId],
      });
    }
  } catch {
    console.log("ERROR!");
  }
}

export default function App($app) {
  this.state = {
    isRoot: false,
    nodes: [],
    depth: [],
    selectedFilePath: null,
    isLoading: false,
  };

  const breadCrumb = new BreadCrumb({
    $app,
    initialState: [],
    onClick: handleBreadCrumbClick.bind(this),
  });

  const nodes = new Nodes({
    $app,
    initialState: [],
    // onClick을 이곳에 정의함으로써 Node내에서는 click후 어떤 로직이 일어날지 알아야 할 필요가 없다.
    onClick: handleNodesClick.bind(this),
    onBackClick: handleBackClick.bind(this),
  });
  const imageView = new ImageView({
    $app,
    initialState: this.state.selectedFilePath,
    modalClose: () => {
      this.setState({
        ...this.state,
        selectedFilePath: null,
      });
    },
  });

  const loading = new Loading({
    $app,
    initialState: this.state.isLoading,
  });

  this.setState = (nextState) => {
    this.state = nextState;
    breadCrumb.setState(this.state.depth);
    nodes.setState({
      isRoot: this.state.isRoot,
      nodes: this.state.nodes,
    });
    imageView.setState(this.state.selectedFilePath);
    loading.setState(this.state.isLoading);
  };

  const init = async () => {
    try {
      this.setState({
        ...this.state,
        isRoot: true,
        isLoading: true,
      });
      const rootNodes = await request();

      this.setState({
        ...this.state,
        isRoot: true,
        nodes: rootNodes,
      });

      cache.rootNodes = rootNodes;
    } catch {
      console.log("ERROR!!");
    } finally {
      this.setState({
        ...this.state,
        isLoading: false,
      });
    }
  };

  init();
}
