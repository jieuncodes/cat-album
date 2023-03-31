import BreadCrumb from "./BreadCrumb.js";
import ImageView from "./Imageview.js";
import Loading from "./Loading.js";
import Nodes from "./Nodes.js";
import { request } from "../api/api.js";

const cache = {};

export default function App($app) {
  console.log("App this", this);
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
    onClick: (index) => {
        console.log('cache', cache);
      if (index === null) {
        this.setState({
          ...this.state,
          depth: [],
          isRoot: true,
          nodes: cache.rootNodes
        })
        return
      }
  
      if (index === this.state.depth.length - 1) {
        return
      }
  
      const nextState = { ...this.state }
      const nextDepth = this.state.depth.slice(0, index + 1)
  
      this.setState({
        ...nextState,
        depth: nextDepth,
        nodes: cache[nextDepth[nextDepth.length - 1].id]
      })
    }
  });

//   const nodes = new Nodes({});
  //   const imageView = new ImageView({});
  //   const loading = new Loading({});

  this.setState = (nextState) => {
    this.state = nextState;
    breadCrumb.setState(this.state.depth);
  };

  const init = async () => {
    console.log("INIT this", this);
    try {
      this.setState({
        ...this.state,
        isRoot: true,
        isLoading: true,
      });
      const rootNodes = await request();
    //   console.log("rootNodes", rootNodes);
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
      console.log("FINALLY", this);
    }
  };

  init();
}
