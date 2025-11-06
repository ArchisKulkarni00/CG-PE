export default function generateSceneHierarchy(scene) {
  const hierarchyContainer = document.getElementById("sceneHierarchy");
  if (!hierarchyContainer) {
    console.warn("⚠️ No hierarchy container found in DOM");
    return;
  }

  hierarchyContainer.innerHTML = ""; // clear previous content

  const sceneJSON = scene.toJSON().object;
  const children = sceneJSON.children || [];

  // Recursive helper function to build DOM tree
  function buildTree(objects, depth = 0) {
    const container = document.createElement("div");

    objects.forEach(obj => {
      const item = document.createElement("div");
      item.classList.add("hierarchy-item");
      item.style.marginLeft = `${depth * 15}px`;

      const icon = document.createElement("span"); 
      icon.innerHTML = "&#166;&#8213;"; 
      icon.style.marginRight = "6px";

      const label = document.createElement("span");
      const name = obj.name || obj.type || "Unnamed Object";

      // Determine icon based on object type/name
      let symbol = "🔳"; // default
      const lower = name.toLowerCase();
      if (lower.includes("light")) symbol = "💡";
      else if (lower.includes("group")) symbol = "📁";
      else if (lower.includes("mesh")) symbol = "📦";
      else if (lower.includes("camera")) symbol = "📷";

      label.textContent = `${symbol} ${name}`;
      label.classList.add("hierarchy-label");

      item.appendChild(icon);
      item.appendChild(label);
      container.appendChild(item);

      // Recursively build children
      if (obj.children && obj.children.length > 0) {
        container.appendChild(buildTree(obj.children, depth + 1));
      }
    });

    return container;
  }

  hierarchyContainer.appendChild(buildTree(children));
}
