export default function Nodes({ $app, initialState, onClick, onBackClick }) {
  this.state = initialState;
  this.$target = document.createElement("div");
  this.$target.className = "Nodes";
  $app.appendChild(this.$target);

  this.setState = (nextState) => {
    this.state = nextState;
    // render 함수 내에서 this.state기준으로 렌더링을 하기 때문에,
    // 단순히 이렇게만 해주어도 상태가 변경되면 화면이 알아서 바뀐다.
    this.render();
  };

  this.onClick = onClick;
  this.onBackClick = onBackClick;

  // render는 현재 상태 기준으로 랜더링이 일어나도록한다.
  this.render = () => {
    if (this.state.nodes) {
      const nodesTemplate = this.state.nodes
        .map((node) => {
          const iconPath =
            node.type === "FILE"
              ? "./assets/file.png"
              : "./assets/directory.png";
          return `
          <div class="Node" data-node-id="${node.id}">
            <img src="${iconPath}" />
            <div>${node.name}</div>
          </div>
        `;
        })
        .join("");

      this.$target.innerHTML = !this.state.isRoot
        ? `<div class="Node"><img src="./assets/prev.png"></div>${nodesTemplate}`
        : nodesTemplate;
    }
  };

  // 인스턴스화 이후 바로 render함수를 실행하며 new로 생성하자마자 렌더링이 일어나도록만든다.
  this.render();

  //   event delegation(https://ko.javascript.info/event-delegation)
  //   $target 하위에 있는 HTML요소 클릭시 이벤트가 상위로 계속 전파되면서 $target 까지 오게된다. 이 특성을 이용한 기법
  //    메뉴 전체에 핸들러를 하나 추가해주고, 각 버튼의 data-action 속성에 호출할 메서드를 할당해 주는 방법.
  this.$target.addEventListener("click", (e) => {
    const $node = e.target.closest(".Node");
    if ($node) {
      const { nodeId } = $node.dataset;
      if (!nodeId) {
        this.onBackClick();
        return;
      }
      const selectedNode = this.state.nodes.find((node) => node.id === nodeId);

      if (selectedNode) {
        this.onClick(selectedNode);
      }
    }
  });
}
