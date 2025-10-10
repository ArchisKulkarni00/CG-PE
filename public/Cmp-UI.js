// UIPanel.js
export default class UIPanel {
  constructor(options = {}) {
    this.title = options.title || "Info Panel";
    this.width = options.width || "150px";

    this.createPanel();
    this.createToggleButton();
    this.attachEvents();
  }

  createPanel() {
    this.panel = document.createElement("div");
    this.panel.classList.add("ui-panel");
    this.panel.style.width = this.width;

    const header = document.createElement("h2");
    header.innerText = this.title;
    this.panel.appendChild(header);

    this.content = document.createElement("div");
    this.panel.appendChild(this.content);

    document.body.appendChild(this.panel);
  }

  createToggleButton() {
    this.button = document.createElement("button");
    this.button.innerHTML = "☰";
    // this.button.innerHTML = ">";
    this.button.classList.add("ui-toggle-btn");

    document.body.appendChild(this.button);
  }

  attachEvents() {
    this.isOpen = false;
    this.button.addEventListener("click", () => {
      if(this.isOpen){
        // this.button.innerHTML = ">";
        // this.button.offsetLeft = 0;
      }
      else{
        // this.button.innerHTML = "<";
        // this.button.offsetLeft = 0;
      }
      this.isOpen = !this.isOpen;
      this.panel.classList.toggle("open", this.isOpen);
      this.button.classList.toggle("open", this.isOpen);
    });
  }

  addText(info) {
    const p = document.createElement("p");
    p.innerText = info;
    this.content.appendChild(p);
  }

  addElement(element) {
    this.content.appendChild(element);
  }

  clear() {
    this.content.innerHTML = "";
  }
}
