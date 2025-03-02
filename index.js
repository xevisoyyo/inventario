console.log = function(...args) {};

const items = [];
let selectedItem = {};

const bag = {
	cols: 4,
	rows: 4,
	cells: [{empty: true}, {empty: true}, {empty: true}, {empty: true},
		{empty: true}, {empty: true}, {empty: true}, {empty: true},
		{empty: true}, {empty: true}, {empty: true}, {empty: true},
		{empty: true}, {empty: true}, {empty: true}, {empty: true},
	],
};

const res = {
	cols: 2,
	rows: 4,
	cells: [{empty: true}, {empty: true},
		{empty: true}, {empty: true},
		{empty: true}, {empty: true},
		{empty: true}, {empty: true},
	],
}
const con = {
	cols: 4,
	rows: 1,
	cells: [{empty: true}, {empty: true}, {empty: true}, {empty: true}],
}
const points = [];

const canvas = document.getElementById('lines-container');
const ctx = canvas.getContext('2d');
const body = document.body;
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  window.addEventListener('resize', ()=>{
	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight;
});


let mouseOffset = {x: 0, y: 0};
const squareSize = 50;
const squareHalf = 25;

const zoomLevel = window.devicePixelRatio; // !important: prueba

createGridsAndItems();

function createGridsAndItems(){
	createGrid("grid-bag", 16);
	createGrid("grid-resources", 8);
	createGrid("grid-consumables", 4);

	createItem({name: "A",			width: 1, height: 1, x: 20, y: 10, 	type: "bag"});
	createItem({name: "B", 			width: 1, height: 1, x: 40, y: 10, 	type: "bag"});
	createItem({name: "C", 			width: 1, height: 1, x: 60, y: 10, 	type: "bag"});
	createItem({name: "Palo", 		width: 2, height: 1, x: 40, y: 70, 	type: "bag"});
	createItem({name: "Casco", 		width: 2, height: 2, x: 60, y: 150, type: "bag"});
	createItem({name: "D", 			width: 1, height: 1, x: 10, y: 90, 	type: "resources"});
	createItem({name: "E", 			width: 1, height: 1, x: 10, y: 120, type: "resources"});
	createItem({name: "G",			width: 1, height: 1, x: 10, y: 140, type: "resources"});
	createItem({name: "Recurso", 	width: 2, height: 1, x: 70, y: 70, 	type: "resources"});
	createItem({name: "H", 			width: 1, height: 1, x: 40, y: 180, type: "consumables"});
	createItem({name: "Manzanas", 	width: 2, height: 1, x: 70, y: 150, type: "consumables"});
}

function createGrid(containerId, cellCount) {
  const gridElement = document.getElementById(containerId);
  for (let i = 0; i < cellCount; i++) {
    const cellElement = document.createElement("div");
    cellElement.classList.add("cell");
	cellElement.setAttribute("data-id", i + 1);
    gridElement.appendChild(cellElement);
  }
}

function createItem({name, width, height, type, x, y}) {
	// crea el item (objeto)
	const item = {
		id: items.length,
		name,
		width,
		height,
		type,
		element: document.createElement("div"),
		rect: null,
		x,
		y,
	};
	// crea el item (elemento) ^
	item.element.classList.add("item", `item-${item.width}x${item.height}`);
	item.element.textContent = item.name;
	item.element.style.left = `${x}px`;
	item.element.style.top = `${y}px`;
	item.element.setAttribute("data-type", item.type);
	item.element.setAttribute("data-itemid", item.id);
	item.element.addEventListener("mousedown", onItemGrab);

	// agrega el item al array de items y el item.element al body
	items.push(item);
	document.body.appendChild(item.element);
}

function onItemGrab(event) {
	selectedItem.element = event.target;
	setFreePoints(selectedItem.element);
	selectedItem.rect = selectedItem.element.getBoundingClientRect();

	mouseOffset.x = event.pageX - selectedItem.rect.left;
 	mouseOffset.y = event.pageY - selectedItem.rect.top;

	selectedItem.element.classList.add("grabbing");
	document.addEventListener("mousemove", onItemMove);
	selectedItem.element.addEventListener("mouseup", onItemDrop);
}

function onItemMove(event) {
	selectedItem.x = event.clientX - mouseOffset.x;
	selectedItem.y = event.clientY - mouseOffset.y;
	selectedItem.element.style.left = selectedItem.x + "px";
	selectedItem.element.style.top = selectedItem.y + "px";
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	for(let i = 0; i < points.length; i++){
		ctx.beginPath();
		ctx.moveTo(selectedItem.x + selectedItem.rect.width / 2, selectedItem.y + selectedItem.rect.height / 2);
		ctx.lineTo(points[i].x, points[i].y);
		ctx.strokeStyle = "#ff0000";
		ctx.lineWidth = 0.4;
		ctx.stroke();
	}
}

function getGrid(type){
	switch(type){
		case "bag":
			return bag;
		case "resources":
			return res;
		case "consumables":
			return con;
	}
}

function onItemDrop(event) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const itemElement = event.target;
	itemElement.classList.remove("grabbing");
	document.removeEventListener("mousemove", onItemMove);
	itemElement.removeEventListener("mouseup", onItemDrop);

	const itemId = itemElement.getAttribute("data-itemid");
	const item = items[itemId];
	
	const gridElement = document.querySelector(`#grid-${item.type}`);
	const gridRect = gridElement.getBoundingClientRect();
	const itemRect = itemElement.getBoundingClientRect();
	const grid = getGrid(item.type);

	if (
		gridRect.right < itemRect.left ||
		gridRect.left > itemRect.right ||
		gridRect.bottom < itemRect.top ||
		gridRect.top > itemRect.bottom
  	){
		const inventoryRect = document.getElementById("inventory").getBoundingClientRect();
		if(inventoryRect.right > itemRect.left &&
			inventoryRect.left + 210 < itemRect.right) itemElement.style.left = `${inventoryRect.right + 10}px`;
		else if(inventoryRect.left < itemRect.right &&
			inventoryRect.right - 210 > itemRect.left) itemElement.style.left = `${inventoryRect.left - 10 - item.width * squareSize}px`;
	
	}
	else{
		let shorterPoint= {x: 0, y: 0};
		let shorterDistance = 5000;
		let distance;
		for(let i = 0; i < points.length; i++){
			distance = Math.sqrt(Math.pow(points[i].x - itemRect.width/2 - itemRect.x, 2) + Math.pow(points[i].y - itemRect.height/2 - itemRect.y, 2));
			if(distance < shorterDistance) {
				shorterDistance = distance;
				shorterPoint.x = points[i].x - item.width * squareHalf + 1;
				shorterPoint.y = points[i].y - item.height * squareHalf + 1;
			}
		}

		itemElement.style.left = `${shorterPoint.x}px`;
		itemElement.style.top = `${shorterPoint.y}px`;

		if(item.width === 1){
			let indexX = (shorterPoint.x - gridRect.x - 1) / 50 + 1;
			let indexY = (shorterPoint.y - gridRect.y - 1) / 50 + 1;
			let index = (indexY - 1) * grid.cols + (indexX - 1);
			console.log(indexX + ", " + indexY + " = " + index);
			grid.cells[index].empty = false;
			for(let i = 0; i < grid.cells.length; i++){
				console.log(grid.cells[i]);
			}
		}
		else if(item.width === 2 && item.height === 1){

		}
		else if(item.width === 2 && item.height === 2){

		}
	}
}

function setFreePoints(itemElement){
	points.length = 0;

	const itemId = itemElement.dataset.itemid;
	const itemType = itemElement.dataset.type;
	let item = items[parseInt(itemId,10)];
	const gridRect = document.getElementById(`grid-${item.type}`).getBoundingClientRect();

	let grid = getGrid(itemType);

	let cols = grid.cols;

	if(item.width === 1){
		for(let i = 0; i < grid.cells.length; i++){
			if(grid.cells[i].empty){
				console.log("Cell " + (i + 1) + " is valid to place an item of 1x1");
				const point = {x: gridRect.x + (cols - (i%cols) - 1 ) * squareSize + squareHalf, y: gridRect.y + Math.floor(i/cols) * squareSize + squareHalf};
				points.push(point);
			}
			else console.log("Cell " + (i + 1) + " is NOT valid to place an item of 1x1");
		}
	}
	else if(item.width === 2 && item.height === 1){
		for(let i = 0; i < grid.cells.length; i++){
			if((i+1) % cols !== 0 && grid.cells[i].empty && grid.cells[i+1].empty){
				console.log("Cell " + (i + 1) + " is valid to place an item of 2x1");
				const point = {x: gridRect.x + (cols - (i%cols) - 1 ) * squareSize, y: gridRect.y + Math.floor(i/cols) * squareSize + squareHalf};
				points.push(point);
			}
		}
	}
	else if(item.width === 2 && item.height === 2){
		let cellsArrayLength = grid.cells.length - 4;
		for(let i = 0; i < cellsArrayLength; i++){
			if((i+1) % 4 !== 0 && grid.cells[i].empty && grid.cells[i+1].empty && grid.cells[i+4].empty && grid.cells[i+5].empty){
				console.log("Cell " + (i + 1) + " is valid to place an item of 2x2");
				const point = {x: gridRect.x + (cols - (i%cols) - 1 ) * squareSize, y: gridRect.y + Math.floor(i/cols) * squareSize + squareSize};
				points.push(point);
			}
		}
	}
}