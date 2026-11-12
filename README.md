# Graph Factory

Graph Factory is a browser-based resource-flow simulation for designing and balancing an interconnected industrial production system. Place production and processing units on a canvas, connect their resource streams, and tune the flow between consumers to build a supply chain that can sustain increasingly advanced technologies.

The simulation models production and consumption rates, dependency bottlenecks, operating ranges, optional input boosts, and heat-related efficiency losses. Progress comes from meeting production thresholds to unlock new facilities and extending the network toward a telemetry system capable of generating data.

## Live demo

[Open Graph Factory on CodePen](https://codepen.io/matteospano/details/emBJPEg)

## How the simulation works

- **Build a production network:** Place resource sources and processing units from the categorized sidebar.
- **Connect resources:** Drag from a node's output to a compatible input on another node. Resource links carry a portion of the source's production rate.
- **Balance flow:** When an output feeds multiple destinations, adjust its split to control how production is distributed.
- **Manage operating conditions:** Some units require inputs within a precise range; optional inputs can increase production, while excess heat reduces efficiency.
- **Unlock advanced technologies:** Reach the displayed net production requirements to reveal additional production units.
- **Compact established systems:** Use the Blackbox tool to group a self-contained area of nodes and replace it with a representation of its current net outputs.
- **Complete the objective:** Develop the supply chain until a telemetry station produces data.

## Controls

- **Add a node:** Select a category tab, then choose an available unit from the sidebar.
- **Move a node:** Drag its title area on the canvas.
- **Create a connection:** Drag from an output on one node to a compatible input on another.
- **Adjust a split:** When an output has multiple links, click the split controls shown on that output to shift flow between destinations.
- **Remove a connection:** Double-click near the link.
- **Create a Blackbox:** Choose Blackbox in the Logistics category, then drag a selection around a self-contained group of nodes. Connections crossing the selection boundary must be removed first.

## Project files

- `main.HTML` – simulation interface, canvas, sidebar, and tutorial overlay
- `functions.js` – production model, resource-flow calculations, interaction handling, progression, and rendering
- `style.css` – layout and visual styling

## Run locally

Serve the project directory with a local web server, for example:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000/main.HTML](http://localhost:8000/main.HTML).

**Asset wiring note:** The current HTML references `styles.css`, but the stylesheet in the repository is named `style.css`; it also needs to load `functions.js` for the simulation logic to run. Update the stylesheet reference to `style.css` and include `functions.js` in the HTML before expecting the checked-in files to work together locally.
