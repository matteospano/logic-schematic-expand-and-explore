# Logic Schematic Expand & Explore

A lightweight, interactive blueprint-style schematic sandbox built with HTML, CSS, and Canvas. It presents a connected system as a navigable map of functional blocks, traces, and subassemblies—so you can move between a high-level overview and closer inspection of individual areas.

This project is intended as a **prototype and starting template** for exploring how large schematics might be presented in an approachable, interactive interface. It is not a production CAD tool and does not replace validated engineering design software.

## Why use it as a template?

Large schematics can be difficult to understand when every component and connection is shown at once. This project demonstrates a visual approach that can help people:

- **See the big picture:** arrange functional areas as a connected system and follow the relationships between them.
- **Explore a subsystem in detail:** pan and zoom around a large canvas without losing the wider context.
- **Communicate functional structure:** group related components into boards or other named regions, and distinguish connection types with color and line styles.
- **Tell a system story:** reveal components and connections progressively, with descriptions and prerequisites to guide exploration.
- **Prototype interactive documentation:** use animated traces and visual feedback to make the schematic feel like a living system rather than a static diagram.

These ideas can be adapted to electronics, industrial equipment, control systems, machine layouts, infrastructure, or other blueprint-like representations.

## What the demo includes

The example is a logic-and-robotics-inspired schematic. Its data describes power, switching, logic processing, wireless telemetry, and actuator areas. The canvas renders components as nodes and their relationships as traces. It also demonstrates:

- Mouse-based canvas navigation, including panning and zooming.
- Zoom-in, zoom-out, and reset-view controls.
- Clickable nodes with component descriptions and staged evolution.
- Prerequisites that gate some component stages and connections.
- Color-coded traces and a legend for power, logic, clock/PWM, high-voltage, and wireless links.
- Example animation for signal flow, wireless activity, thermal effects, and actuator response.
- Subsystem outlines that visually group parts of the schematic.

The component names and behavior are illustrative demo content, not verified circuit designs.

## Try it

The project is a single-page application in `index.html`; there is no build step or package installation required.

1. Clone or download this repository.
2. Open `index.html` in a modern browser.
3. Drag the canvas to pan, use the mouse wheel to zoom, or use the on-screen controls to adjust/reset the view.
4. Hover over and click nodes to inspect the descriptions and explore available stages.

The page loads Tailwind CSS and the Fira Code font from external CDNs, so those presentation resources require an internet connection. If you want an entirely offline version, replace those dependencies with locally hosted assets.

## Using this as a starting point

A practical way to adapt the prototype is to replace the example schematic data while keeping the canvas interaction and rendering as a starting point.

### 1. Define your components

In `index.html`, `nodesData` contains the demo's component definitions. Each node has an identifier, canvas position, stages, descriptive metadata, prerequisites, and child relationships. Replace these with the functional parts of your own system. Keep node IDs unique and make sure referenced prerequisites and children exist.

### 2. Define relationships

`schematicTraces` describes connections between node IDs, including a visual type/color and optional conditions for when a trace should appear. Use consistent conventions for connection types and explain them in the legend. For real engineering use, define the meaning of each relationship precisely rather than relying on appearance alone.

### 3. Arrange and group functional areas

Place related components near one another and use the existing subsystem outlines as a pattern for visual grouping. For a larger project, consider creating clear functional regions—such as power, sensing, control, communications, and actuation—so users can scan the overview and then navigate to a particular area.

### 4. Customize presentation and interactions

The drawing and interaction logic in the script can be extended with features such as search, selection, labels, layer visibility, component metadata panels, minimaps, saved views, or import/export. For a larger application, consider separating data, rendering, and UI code into modules and moving schematic data to a validated external format.

## Current scope and limitations

This is a browser-based visualization prototype, not an engineering CAD or simulation environment. It does not currently provide authoritative electrical rules checking, dimensional constraints, manufacturing outputs, schematic interchange, version control, or safety validation. Animations are illustrative and should not be interpreted as measured electrical behavior or simulation results.

Before using a similar tool in an industrial workflow, add domain-appropriate validation, data integrity checks, accessibility and performance testing, and review by qualified engineers. Treat the displayed schematic as documentation or an exploration aid unless it has been independently verified for its intended purpose.

## Technology

- HTML and CSS for the page and controls
- JavaScript and the HTML Canvas 2D API for rendering and interaction
- Tailwind CSS and Google Fonts loaded from CDNs for presentation

## License

No license is currently specified. Add a `LICENSE` file before redistributing or reusing this project if you want to make the applicable permissions clear.
