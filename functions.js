// =====================
// CONFIG & CONSTANTS
// =====================
const RES_COLORS = {
    coal: "#555", iron: "#aaa", water: "#6cf", sand: "#ed9", copper: "#ea9", uranium: "#2f2",
    steel: "#ccc", steam: "#eef", glass: "#aff", acid: "#b0bf1a", concrete: "#999", plastic: "#e1e",
    heat: "#f22", gear: "#bcc", energy: "#6ef", circuit: "#0f9", processor: "#09f",
    servo: "#f90", cable: "#fa0", kevlar: "#880", fuel: "#0ff",
    research: "#f0f", satellite: "#ddd", robot: "#555", data: "#fff"
};
const GAME = {
    startTime: Date.now(),
    totalNodesPlaced: 0,
    isGameOver: false,
  resources: [
        "coal", "iron", "water", "sand", "copper", "uranium", 
        "steel", "steam", "glass", "acid", "concrete", "plastic", 
        "heat", "gear", "energy", "circuit", "processor", 
        "servo", "cable", "kevlar", "fuel", 
        "research", "satellite", "robot", "data" 
    ],
    categories: {
        mines: ["coal", "iron", "water", "sand", "copper", "uranium"],
        processing: ["steel", "glass", "acid", "concrete", "plastic"],
        components: ["gear", "circuit", "reinforced_cables", "servo_motor", "kevlar"],
        power: ["steam", "energy", "battery", "solar_panel", "geothermal", "fusion_preparator", "nuclear_reactor"],
        advanced: ["processor", "supercomputer", "industrial_robot", "radiator", "cooler"],
        logistics: ["water_pump", "blackbox"],
        "deep space": ["satellite_core", "telemetry_station"],
        test: ["a", "b", "c", "d"]
    },
    maxPerType: { 
        coal: 3, iron: 3, water: 3, sand: 3, copper: 3, uranium: 2,
        steel: 4, glass: 4, acid: 2, concrete: 2, plastic: 2,
        gear: 6, circuit: 4, reinforced_cables: 4, servo_motor: 4, kevlar: 2,
        steam: 4, energy: 5, battery: 5, solar_panel: 5, geothermal: 2, fusion_preparator: 1, nuclear_reactor: 1,
        processor: 2, supercomputer: 1, industrial_robot: 2, radiator: 5, cooler: 5,
        water_pump: 10, blackbox: 20,
        satellite_core: 1, telemetry_station: 1,
        a: 10, b: 10, c: 10, d: 10
    },
    unlocked: { 
        coal: true, iron: true, water: true, sand: false, copper: true, uranium: false,
        steel: false, glass: false, acid: false, concrete: false, plastic: false,
        gear: true, circuit: false, reinforced_cables: false, servo_motor: false, kevlar: false,
        steam: false, energy: false, battery: false, solar_panel: true, geothermal: false, fusion_preparator: false, nuclear_reactor: false,
        processor: false, supercomputer: false, industrial_robot: false, radiator: true, cooler: true,
        water_pump: false, blackbox: true,
        satellite_core: false, telemetry_station: false,
        a: true, b: true, c: true, d:true
    },
    unlockReq: {
        steel: { coal: 3, iron: 3 },
        steam: { coal: 10, water: 10 },
        energy: { steam: 5 },
        sand: { steel: 10 },
        concrete: { sand: 10, steel: 5 },
        acid: { water: 20 },
        plastic: { acid: 5, coal: 10 },
        circuit: { glass: 5, copper: 10 },
        reinforced_cables: { copper: 15, plastic: 5 },
        processor: { circuit: 10, energy: 20 },
        nuclear_reactor: { uranium: 5, concrete: 20 },
        telemetry_station: { satellite: 1, research: 5 } // Sblocco finale
    }
};
let isSelectingBlackbox = false; // Diventa true quando clicchi "Blackbox" in sidebar
let selectionStart = null;       // Coordinate di inizio click {x, y}
let selectionEnd = null;         // Coordinate correnti {x, y}
// =====================
// STATE & INIT
// =====================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const header = document.getElementById("header");
const unlockedContent = document.getElementById("unlocked");
const tabsContainer = document.getElementById("tabs");
const sidebarContent = document.getElementById("content");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let nodes = [];
let links = [];
let draggingNode = null;
let activeLink = null;
let offsetX = 0, offsetY = 0;
let mouse = { x: 0, y: 0 };
let gridSize = 40;
window.activeTab = "mines";

// =====================
// CLASSES: nodo semplice e blackbox
// =====================
class Node {
    constructor(type, x, y) {
        this.type = type;
        this.x = x; this.y = y;
        this.inputs = {}; this.outputs = {};
        this.optional = {}; 
        this.ranges = {};   
        this.incoming = {}; this.produced = {}; this.consumed = {};
        this.status = "normal"; 

        if (type === "coal") this.outputs = { coal: 5 };
        if (type === "iron") this.outputs = { iron: 2 };
        if (type === "water") this.outputs = { water: 4 };
        if (type === "sand") this.outputs = { sand: 6 };
        if (type === "copper") this.outputs = { copper: 4 };
        if (type === "uranium") this.outputs = { uranium: 1, heat: 2 };

        if (type === "steel") { 
            this.inputs = { coal: 3, iron: 1 }; 
            this.outputs = { steel: 2, heat: 1 }; 
        }
        if (type === "steam") { 
            this.inputs = { water: 3, coal: 1 }; 
            this.outputs = { steam: 3, water: 1 }; 
        }
        if (type === "glass") { 
            this.inputs = { sand: 4, coal: 2 }; 
            this.optional = { energy: 2 }; 
            this.outputs = { glass: 3 }; 
        }
        if (type === "acid") { 
            this.inputs = { coal: 1 }; 
            this.ranges = { water: 2 }; 
            this.outputs = { acid: 2 }; 
        }
        if (type === "concrete") { 
            this.inputs = { sand: 6, steel: 1, water: 4 }; 
            this.outputs = { concrete: 5 }; 
        }
      if (type === "plastic") { 
        this.inputs = { coal: 4, acid: 2 }; 
        this.outputs = { plastic: 3 }; 
      }
      
        if (type === "gear") { 
            this.inputs = { steel: 1 }; 
            this.ranges = { energy: 5 }; 
            this.outputs = { gear: 2 }; 
        }
        if (type === "circuit") { 
            this.inputs ={copper:2, glass:2} 
            this.ranges = { energy: 1 }; 
           this.outputs = {circuit: 3} 
        }
        if (type === "processor") { 
        this.inputs = { circuit: 2, glass: 1 }; 
        this.ranges = { energy: 3.5 }; // Range strettissimo: richiede split precisi.
        this.outputs = { processor: 1 }; 
      }
      if (type === "supercomputer") { 
        this.inputs = { processor: 5, energy: 10, cable:4, heat: -3 }; 
        this.outputs = { research: 1, heat: 8 }; 
        // Produce tantissimo calore, richiede un sistema di raffreddamento dedicato e un cooler in input.
    }
      
      if (type === "servo_motor") { 
    // Un componente intermedio fondamentale per la robotica
    this.inputs = { gear: 2, copper: 3, steel: 1 }; 
    this.optional = { energy: 2 }; // Il boost raddoppia la velocità di assemblaggio
    this.outputs = { servo: 2 }; 
}

if (type === "industrial_robot") { 
    this.inputs = { servo: 2, processor: 1, steel: 3, plastic: 2 }; 
    this.ranges = { energy: 8 }; // Richiede stabilità energetica elevata
    this.outputs = { robot: 1, heat: 2 }; 
}
      
if (type === "reinforced_cables") { 
    // Cavi per l'alta tensione necessari per il reattore nucleare o supercomputer
    this.inputs = { copper: 4, plastic: 2, acid: 1 }; 
    this.outputs = { cable: 4 }; 
}
if (type === "kevlar") { 
    // Materiale resistente ottenuto da chimica e calore
    this.inputs = { plastic: 3, acid: 2, heat:1 }; 
    this.ranges = { steam: 4 }; // La pressione del vapore deve essere precisa per la fibra
    this.outputs = { kevlar: 2 }; 
}
      
if (type === "satellite_core") { 
    // Componente di altissimo livello
    this.inputs = { processor: 3, circuit: 5, cable: 2 }; 
    this.optional = { energy: 5 }; 
    this.outputs = { satellite: 1, heat: 1 }; 
}

if (type === "telemetry_station") { 
    // Win condition. Richiede il satellite e il supercomputer per generare "Data"
    this.inputs = { satellite: 1, research: 1, cable: 5 }; 
    this.ranges = { energy: 15 }; // Richiede quasi un intero reattore nucleare dedicato
    this.outputs = { data: 10 }; 
}
      
      if (type === "radiator") { 
        this.inputs = { heat: 3, water: 1 }; 
        this.outputs = { steam: 1 }; 
      }
      if (type === "cooler") { 
          this.inputs = { energy: 4 }; 
          this.optional = { water: 2 }; 
          this.outputs = { heat: -5 }; 
      }
      
        if (type === "energy") { 
            this.inputs = { steam: 3 }; 
            this.outputs = { energy: 2 }; 
        }
      if (type === "solar_panel") { 
    this.outputs = { energy: 1 }; 
    // Output basso ma costante, non richiede input. Perfetto per "avviare" macchinari.
    }

if (type === "geothermal") { 
    this.ranges = { heat: 6 }; // Deve essere posizionato vicino a chi scotta.
    this.outputs = { energy: 4 }; 
}

if (type === "fusion_preparator") { 
    // Prepara il combustibile partendo dall'uranio filtrato
    this.inputs = { uranium: 2, acid: 3, water: 5 }; 
    this.outputs = { fuel: 1, heat: 4 }; 
}

if (type === "nuclear_reactor") { 
    this.inputs = { fuel: 1, processor: 2, kevlar: 1 }; 
    this.ranges = { water: 8 };
    this.outputs = { energy: 20, heat: 15 }; 
}
        if (type === "battery") { 
            this.inputs = { energy: 5 }; 
            this.outputs = { energy: 5, heat:1 }; 
        }
      
      if (type === "water_pump") { 
          this.inputs ={water:2 , energy: 1}
          this.outputs = {water: 3}
       } 
      
       if (type === "a") { 
            this.outputs = { energy: 15 }; 
        }
        if (type === "b") { 
            this.outputs = { satellite: 2 }; 
        }
        if (type === "c") { 
            this.outputs = { research: 15 }; 
        }
        if (type === "d") { 
            this.outputs = { cable:2 }; 
        }
    }
}
class BlackBox {
    constructor(x, y, w, h, internalNodes, netOutputs) {
        this.type = "blackbox";
        this.x = x; this.y = y;
        this.w = w; this.h = h;
        this.internalNodes = internalNodes; // Array di oggetti Node originali
        this.outputs = netOutputs;
        this.produced = {};
        this.inputs = {};                    // Sempre vuoto per specifica
        this.status = "locked";
        
        // Inizializza i valori prodotti (statici)
        for (let r in this.outputs) {
            this.produced[r] = this.outputs[r] / 60;
        }
    }
}
// =====================
// SIMULATION ENGINE
// =====================
function update() {
    nodes.forEach(n => { n.incoming = {}; n.status = "normal"; });

    // 1. Distribuzione Flusso
    links.forEach(l => {
        let amountPerSec = (Object.keys(l.from.inputs).length === 0) 
            ? (l.from.outputs[l.resource] || 0) 
            : (l.from.produced[l.resource] || 0) * 60;
        l.flow = amountPerSec * (l.split / 12);
        l.to.incoming[l.resource] = (l.to.incoming[l.resource] || 0) + (l.flow / 60);
    });

    nodes.forEach(n => {
        if (Object.keys(n.inputs).length === 0) {
            for (let r in n.outputs) n.produced[r] = n.outputs[r] / 60;
            return;
        }

        let ratios = Object.keys(n.inputs).map(r => (n.incoming[r] || 0) / (n.inputs[r] / 60));
        let factor = ratios.length > 0 ? Math.min(...ratios) : 0;

        let boost = 1.0;
        let penalty = 1.0;
        let isDead = false;

        // A. Calcolo Accumulo Calore (Prodotto + Entrata - Uscita)
        let heatOutFlow = links.filter(l => l.from === n && l.resource === "heat").reduce((sum, l) => sum + l.flow, 0);
        let heatProduced = (n.outputs["heat"] || 0) * factor;
        
        if ((heatProduced - heatOutFlow) >= 3.0) {
            penalty = 0.5;
            n.status = "overheat";
        }

        // B. Check RANGE (Gears)
        for (let r in n.ranges) {
            let val = (n.incoming[r] || 0) * 60;
            if (Math.abs(val - n.ranges[r]) > 0.51) { isDead = true; }
        }

        // C. Check OPTIONAL (Glass)
        for (let r in n.optional) {
            if ((n.incoming[r] || 0) * 60 >= n.optional[r] - 0.1) {
                boost = 1.5;
                if (n.status === "normal") n.status = "boosted";
            }
        }

        if (isDead) { factor = 0; n.status = "dead"; }

        // D. Produzione Finale
        for (let r in n.inputs) n.consumed[r] = (n.inputs[r] / 60) * factor;
        for (let r in n.outputs) {
            let m = (r === "heat") ? (factor * boost) : (factor * boost * penalty);
            n.produced[r] = (n.outputs[r] / 60) * m;
        }
    });

    links.forEach(l => {
        let n = l.to;
        let inc = n.incoming[l.resource] || 0;
        l.efficiency = inc > 0 ? (n.consumed[l.resource] || 0) / inc : 0;
    });
}
// =====================
// INPUT & SPLITS
// =====================
//inizio area balckbox o drag nodi, crea link, split risorse
canvas.addEventListener("mousedown", e => {
    let x = e.clientX, y = e.clientY;
      if (isSelectingBlackbox) {
        selectionStart = { x, y };
        selectionEnd = { x, y };
        return; // Blocca le altre azioni (drag nodi, crea o split link)
    }
  
    for (let n of nodes) {
        if (hitNode(n, x, y)) {
            if (y > n.y + 55) { handleSplitClick(n, x, y); return; }
            let res = detectResourceClick(n, x, y);
            if (res) { activeLink = { from: n, resource: res }; } 
            else { draggingNode = n; offsetX = x - n.x; offsetY = y - n.y; }
            return;
        }
        if (n.type === "blackbox" && x > n.x + n.w - 20 && y < n.y + 20) {
          //Distruggi eventuali link creati dall'utente da blackbox ad altri nodi
          links = links.filter(l => l.from !== n);
          // Distruggi: i nodi tornano disponibili in sidebar
          nodes = nodes.filter(box => box !== n);
          return;
      }
    }
  
});
// Chiamata dal click sul bottone in sidebar
function activateBlackboxTool() {
    isSelectingBlackbox = true;
    selectionStart = null;
    selectionEnd = null;
    canvas.style.cursor = "crosshair"; // Cambia il cursore per far capire che siamo in selezione
}
//area blackbox o drag nodo
canvas.addEventListener("mousemove", e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
  
    if (isSelectingBlackbox && selectionStart) {
        let x=mouse.x;
        let y=mouse.y;
        selectionEnd = { x, y };
    }
    else if (draggingNode) {
        draggingNode.x = Math.round((mouse.x - offsetX) / gridSize) * gridSize;
        draggingNode.y = Math.round((mouse.y - offsetY) / gridSize) * gridSize;
    }
});
//fine area blackbox o creazione link
canvas.addEventListener("mouseup", () => {
  if (isSelectingBlackbox && selectionStart && selectionEnd) {
        // Calcola i punti d'angolo corretti (gestisce trascinamenti in ogni direzione)
        let x1 = Math.min(selectionStart.x, selectionEnd.x);
        let y1 = Math.min(selectionStart.y, selectionEnd.y);
        let x2 = Math.max(selectionStart.x, selectionEnd.x);
        let y2 = Math.max(selectionStart.y, selectionEnd.y);

        // Avvia la creazione
        createBlackboxFromArea(x1, y1, x2, y2);

        // Reset dello stato
        isSelectingBlackbox = false;
        selectionStart = null;
        selectionEnd = null;
        canvas.style.cursor = "default";
        return;
    }
    if (activeLink) {
        let target = nodes.find(n => hitNode(n, mouse.x, mouse.y));
        const canAccept = (node, res) => 
            (node.inputs && node.inputs[res] !== undefined) ||
            (node.optional && node.optional[res] !== undefined) ||
            (node.ranges && node.ranges[res] !== undefined);

    if (target && target !== activeLink.from && canAccept(target, activeLink.resource)) {
            let isDuplicate = links.some(l => l.from === activeLink.from && l.to === target && l.resource === activeLink.resource);
            if (!isDuplicate) {
                let existingCount = links.filter(l => l.from === activeLink.from && l.resource === activeLink.resource).length;
                if (existingCount < 4) {
                    links.push({ from: activeLink.from, to: target, resource: activeLink.resource, split: 0, flow: 0, efficiency: 0 });
                    balanceSplits(activeLink.from, activeLink.resource);
                }
            }
        }
    }
    draggingNode = null; activeLink = null;
});
//rimozione link
canvas.addEventListener("dblclick", e => {
    let linkToRemove = links.find(l => isNearLink(l, e.clientX, e.clientY));
    if (linkToRemove) {
        let { from, resource } = linkToRemove;
        links = links.filter(l => l !== linkToRemove);
        balanceSplits(from, resource);
    }
});

function handleSplitClick(n, mouseX, mouseY) {
    let yy = n.y + 60; // Punto di inizio degli output nel draw()
    for (let r in n.outputs) {
        let lks = links.filter(l => l.from === n && l.resource === r);
        if (lks.length > 1 && mouseY > yy - 10 && mouseY < yy + 5) {
            let sw = 120 / lks.length;
            let idx = Math.floor((mouseX - n.x) / sw);
            let relX = (mouseX - n.x) % sw;
            
            let change = relX < 30 ? -1 : relX > sw - 30 ? 1 : 0;
            if (change !== 0) {
                let neighbor = lks[idx + 1] || lks[idx - 1];
                if (neighbor && lks[idx].split + change >= 1 && neighbor.split - change >= 1) {
                    lks[idx].split += change;
                    neighbor.split -= change;
                }
            }
            return;
        }
        yy += 12;
    }
}

function balanceSplits(node, res) {
    let lks = links.filter(l => l.from === node && l.resource === res);
    if (lks.length === 0) return;
    let base = Math.floor(12 / lks.length);
    lks.forEach((l, i) => l.split = (i === lks.length - 1) ? (12 - (base * i)) : base);
}

function hitNode(n, x, y) { return x > n.x && x < n.x + 120 && y > n.y && y < n.y + 80; }
function detectResourceClick(n, x, y) {
    if (x < n.x + 80) return null;
    let outs = Object.keys(n.outputs);
    return outs[Math.floor(((y - n.y) / 80) * outs.length)];
}
function isNearLink(l, mx, my) {
    let x1 = l.from.x + 120, y1 = l.from.y + 40, x2 = l.to.x, y2 = l.to.y + 40;
    let t = ((mx - x1) * (x2 - x1) + (my - y1) * (y2 - y1)) / (Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(mx - (x1 + t * (x2 - x1)), my - (y1 + t * (y2 - y1))) < 10;
}

function createBlackboxFromArea(x1, y1, x2, y2) {
    // 1. Identifica i nodi nell'area
    let selectedNodes = nodes.filter(n => 
        n.x >= x1 && n.x + 120 <= x2 && n.y >= y1 && n.y + 80 <= y2
    );

    if (selectedNodes.length === 0) return;

    // 2. Validazione Link (Nessun link deve "attraversare" il confine)
    let hasExternalLinks = links.some(l => {
        let fromIn = selectedNodes.includes(l.from);
        let toIn = selectedNodes.includes(l.to);
        return (fromIn && !toIn) || (!fromIn && toIn);
    });

    if (hasExternalLinks) {
        console.error("ERRORE BLACKBOX: Rilevati link verso l'esterno. Eliminali prima di compattare.");
        return;
    }

    // 3. Calcolo Net Output (Peak Freeze)
    let net = {};
    GAME.resources.forEach(r => {
        let prod = selectedNodes.reduce((sum, n) => sum + (n.produced[r] || 0), 0) * 60;
        let cons = selectedNodes.reduce((sum, n) => sum + (n.consumed[r] || 0), 0) * 60;
        let excess = prod - cons;
        if (excess > 0.01) net[r] = excess;
    });

    // 4. Creazione della Box
    let box = new BlackBox(x1, y1, x2 - x1, y2 - y1, [...selectedNodes], net);
    
    // 5. Rimozione nodi e pulizia link interni
    nodes = nodes.filter(n => !selectedNodes.includes(n));
    links = links.filter(l => !selectedNodes.includes(l.from) && !selectedNodes.includes(l.to));
    
    nodes.push(box);
    console.log("Blackbox creata con successo!", net);
}

// =====================
// UI RENDERERS
// =====================
window.addNode = (type) => {
  if(type === "blackbox"){
    activateBlackboxTool(); return;
  }
    if (!GAME.unlocked[type] || nodes.filter(n => n.type === type).length >= GAME.maxPerType[type]) return;
    nodes.push(new Node(type, 200, 200));
  GAME.totalNodesPlaced++;
};

function drawUI() {
const unlockedValues = Object.values(GAME.unlocked);
const unlock = unlockedValues.filter(v => v === true).length;
const tot = unlockedValues.length;
    //Unlocked
  unlockedContent.innerHTML= `<div>${'unlocked: ' +unlock+'/'+ tot}</div>`
    // Tabs
    tabsContainer.innerHTML = Object.keys(GAME.categories).map(tab => 
        `<button class="${window.activeTab === tab ? 'active' : ''}" onclick="window.activeTab='${tab}'">${tab}</button>`
    ).join("");

    // Sidebar
    let list = GAME.categories[window.activeTab] || [];
    sidebarContent.innerHTML = list.map(type => {
        let onMap = nodes.filter(n => n.type === type).length;
        let inBoxes = nodes.filter(n => n.type === "blackbox").reduce((sum, box) => {
        // Verifica che internalNodes esista ed è un array
        let internalCount = (box.internalNodes && Array.isArray(box.internalNodes)) 
            ? box.internalNodes.filter(inN => inN.type === type).length : 0;
        return sum + internalCount;
        }, 0);
        let count= onMap + inBoxes;
        let max = GAME.maxPerType[type];
        let unlocked = GAME.unlocked[type];
        let disabled = !unlocked || (max && count >= max);
        let reqs = "";
        if (!unlocked && GAME.unlockReq[type]) {
            reqs = `<div class="overlay">
                        ${Object.entries(GAME.unlockReq[type])
                          .map(([r, v]) => `${v}${r}`)
                          .join(" ")}
                    </div>`;
        }
        return `<div class="item ${disabled ? 'disabled' : ''}"><button onclick="addNode('${type}')">
        <span>${type}</span>
        <span>${count}/${max || '∞'}</span>
        </button>${reqs}</div>`;
    }).join("");
}

function drawSelectionBox() {
    if (isSelectingBlackbox && selectionStart && selectionEnd) {
        ctx.strokeStyle = "#0cf";
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]); // Linea tratteggiata stile selezione
        ctx.fillStyle = "rgba(0, 204, 255, 0.15)"; // Sfondo azzurro trasparente
        
        let w = selectionEnd.x - selectionStart.x;
        let h = selectionEnd.y - selectionStart.y;
        
        ctx.fillRect(selectionStart.x, selectionStart.y, w, h);
        ctx.strokeRect(selectionStart.x, selectionStart.y, w, h);
        ctx.setLineDash([]); // Reset del tratteggio per non rovinare gli altri disegni!
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Links
    links.forEach(l => {
        ctx.strokeStyle = l.efficiency > 0.8 ? "#9f9" : l.efficiency > 0.1 ? "#fff" : "#444";
        ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(l.from.x + 120, l.from.y + 40); ctx.lineTo(l.to.x, l.to.y + 40); ctx.stroke();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillText(l.flow.toFixed(1), (l.from.x + l.to.x + 120) / 2, (l.from.y + l.to.y + 80) / 2 - 5);
    });

    nodes.forEach(n => {
        // === CASO BLACKBOX ===
        if (n.type === "blackbox") {
            ctx.fillStyle = "#000";
            ctx.strokeStyle = "#0cf";
            ctx.lineWidth = 2;
            ctx.fillRect(n.x, n.y, n.w, n.h);
            ctx.strokeRect(n.x, n.y, n.w, n.h);
            
            ctx.fillStyle = "#0cf";
            ctx.font = "bold 14px monospace";
            ctx.fillText("BLACKBOX", n.x + 10, n.y + 25);

            // Rendering output congelati
            let yy = n.y + 45;
            ctx.font = "10px monospace";
            for (let r in n.outputs) {
                ctx.fillStyle = RES_COLORS[r];
                ctx.fillText(`+ ${n.outputs[r].toFixed(1)} ${r}`, n.x + 10, yy);
                yy += 12;
            }

            // Tasto X in alto a destra
            ctx.fillStyle = "#f22";
            ctx.fillRect(n.x + n.w - 20, n.y, 20, 20);
            ctx.fillStyle = "#fff";
            ctx.fillText("X", n.x + n.w - 14, n.y + 14);

            return; // Salta il disegno del nodo standard
        }
      
        // === CASO NODO STANDARD ===
        // Label Esterna
        ctx.fillStyle = "#fff"; ctx.font = "bold 11px monospace";
        let tag = n.status === "dead" ? " - DEAD" : n.status === "overheat" ? " - HOT" : n.status === "boosted" ? " - BOOST" : "";
        ctx.fillText(n.type.toUpperCase() + tag, n.x, n.y - 10);

        // Box
        ctx.lineWidth = (n.status !== "normal") ? 4 : 1;
        ctx.strokeStyle = n.status === "overheat" ? "#f22" : n.status === "boosted" ? "#6ef" : n.status === "dead" ? "#666" : "#444";
        ctx.fillStyle = "#1b1b1b";
        ctx.fillRect(n.x, n.y, 120, 80);
        ctx.strokeRect(n.x, n.y, 120, 80);
        
        let yy = n.y + 18; ctx.font = "10px monospace";

        // Render Inputs
        for (let r in n.inputs) { ctx.fillStyle = RES_COLORS[r]; ctx.fillText(`${n.inputs[r]} ${r}`, n.x + 8, yy); yy += 12; }
        
        // Render Ranges
        for (let r in n.ranges) { 
            let cur = (n.incoming[r] || 0) * 60;
            ctx.fillStyle = (Math.abs(cur - n.ranges[r]) <= 0.5) ? RES_COLORS[r] : "#f22";
            ctx.fillText(`[ ${n.ranges[r]} ] ${r}`, n.x + 8, yy); yy += 12; 
        }

        for (let r in n.optional) { 
            ctx.fillStyle = (n.status === "boosted") ? RES_COLORS[r] : "#555";
            ctx.fillText(`opt: ${n.optional[r]} ${r}`, n.x + 8, yy); yy += 12; 
        }

        // Output Values con Split
        yy = n.y + 60;
        for (let r in n.outputs) {
            let lks = links.filter(l => l.from === n && l.resource === r);
            ctx.fillStyle = RES_COLORS[r];
            
            if (lks.length > 1) {
                let sw = 120 / lks.length;
                lks.forEach((l, i) => {
                    let tx = n.x + (i * sw);
                    ctx.globalAlpha = 0.3; 
                    ctx.fillText("<", tx + 4, yy); 
                    ctx.fillText(">", tx + sw - 10, yy); 
                    ctx.globalAlpha = 1;
                    ctx.textAlign = "center";
                    ctx.fillText(l.flow.toFixed(1), tx + sw / 2, yy);
                    ctx.textAlign = "left";
                });
            } else {
                let val = (n.produced[r] || 0) * 60;
                ctx.fillText(`${val.toFixed(1)} ${r}`, n.x + 8, yy);
            }
            yy += 12;
        }
    });

    // Disegno Rettangolo di Selezione (se attivo)
    drawSelectionBox();

    if (activeLink) {
        ctx.strokeStyle = "#aaa"; ctx.beginPath();
        ctx.moveTo(activeLink.from.x + 120, activeLink.from.y + 40); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
    }
}

// =====================
// LOOP
// =====================
let uiTimer = 0;
function loop() {
    update();
    
    // Calcolo throughput per header e sblocchi
    let net = {}; GAME.resources.forEach(r => net[r] = 0);
    nodes.forEach(n => {
        for (let r in n.produced) net[r] += n.produced[r] * 60;
        for (let r in n.consumed) net[r] -= n.consumed[r] * 60;
    });
    checkVictory(); //produzione data

    // Nuovi sblocchi
    for (let t in GAME.unlockReq) {
        if (!GAME.unlocked[t] && Object.entries(GAME.unlockReq[t]).every(([r, v]) => net[r] >= v)) GAME.unlocked[t] = true;
    }

    if (uiTimer++ % 30 === 0) {
        drawUI();
        header.innerHTML = GAME.resources.filter(r => net[r] > 0)
            .map(r => `<span style="color:${RES_COLORS[r]}">${r}: ${net[r].toFixed(1)}</span>`).join(" | ");
    }

    draw();
    requestAnimationFrame(loop);
}
loop();

function closeTutorial() {
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function checkVictory() {
    if (GAME.isGameOver) return;

    nodes.forEach(n => {
        // Se una stazione telemetrica sta producendo dati (flusso > 0)
    if (n.type === "telemetry_station") {
            let dataProduction = (n.produced && n.produced.data) ? n.produced.data * 60 : 0;
            if (dataProduction > 0.1) {
                triggerWin();
            }
        }
    });
}

function triggerWin() {
    GAME.isGameOver = true;    
    const timeElapsed = Math.floor((Date.now() - GAME.startTime) / 1000);
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
  console.log("vittoria",timeElapsed,minutes,seconds,GAME.totalNodesPlaced)
    
    // Creazione dinamica del popup di vittoria
    const winOverlay = document.createElement('div');
    winOverlay.className = 'tutorial-overlay-class'; // Usiamo la stessa classe del tutorial
    winOverlay.innerHTML = `
        <div class="tutorial-content" style="border-color: #fff; text-align: center;">
            <h2 style="color: #fff; text-shadow: 0 0 10px #0cf;">MISSIONE COMPIUTA</h2>
            <p style="font-size: 18px; color: #0cf;">Segnale ricevuto: Collegamento con la Terra stabilito.</p>
            <hr>
            <div style="text-align: left; margin: 20px 0;">
                <p><b>Tempo impiegato:</b> ${minutes}m ${seconds}s</p>
                <p><b>Nodi totali piazzati:</b> ${GAME.totalNodesPlaced}</p>
                <p><b>Blackbox create:</b> ${nodes.filter(n => n.type === "blackbox").length}</p>
            </div>
            <button class="start-btn" onclick="location.reload()">GIOCA ANCORA</button>
        </div>
    `;
    document.body.appendChild(winOverlay);
}
